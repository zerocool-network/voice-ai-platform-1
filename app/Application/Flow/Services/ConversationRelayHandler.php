<?php

namespace App\Application\Flow\Services;

use App\Domain\Flow\Services\AiServiceInterface;
use Psr\Log\LoggerInterface;

/**
 * Processes Twilio ConversationRelay WebSocket JSON messages.
 *
 * @see https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
 */
class ConversationRelayHandler
{
    /** @var array<string, mixed> */
    private array $session = [];

    public function __construct(
        private readonly AiServiceInterface $aiService,
        private readonly ?LoggerInterface $logger = null,
    ) {}

    /**
     * @param  array<string, mixed>  $incoming
     * @return list<array<string, mixed>> Outbound messages to send on the socket
     */
    public function handle(array $incoming): array
    {
        $type = $incoming['type'] ?? '';

        return match ($type) {
            'setup' => $this->handleSetup($incoming),
            'prompt' => $this->handlePrompt($incoming),
            'dtmf' => $this->handleDtmf($incoming),
            'interrupt' => [],
            'error' => $this->handleError($incoming),
            default => [],
        };
    }

    /** @return array<string, mixed> */
    public function session(): array
    {
        return $this->session;
    }

    /**
     * @param  array<string, mixed>  $incoming
     * @return list<array<string, mixed>>
     */
    private function handleSetup(array $incoming): array
    {
        $custom = $incoming['customParameters'] ?? [];
        if (! is_array($custom)) {
            $custom = [];
        }

        $this->session = [
            'callSid' => $incoming['callSid'] ?? ($custom['callSid'] ?? null),
            'systemPrompt' => $custom['systemPrompt'] ?? 'You are a helpful voice assistant. Keep replies concise for speech.',
            'language' => $custom['language'] ?? ($incoming['ttsLanguage'] ?? ($incoming['language'] ?? 'en-US')),
            'history' => [],
        ];

        $this->logger?->debug('ConversationRelay setup', [
            'callSid' => $this->session['callSid'],
        ]);

        return [];
    }

    /**
     * @param  array<string, mixed>  $incoming
     * @return list<array<string, mixed>>
     */
    private function handlePrompt(array $incoming): array
    {
        if (($incoming['last'] ?? false) !== true) {
            return [];
        }

        $voicePrompt = (string) ($incoming['voicePrompt'] ?? '');

        if ($voicePrompt === '') {
            return [];
        }

        /** @var list<array{role: string, content: string}> $history */
        $history = $this->session['history'] ?? [];
        $history[] = ['role' => 'user', 'content' => $voicePrompt];

        $messages = array_merge(
            [['role' => 'system', 'content' => (string) ($this->session['systemPrompt'] ?? 'You are a helpful voice assistant.')]],
            $history,
        );

        try {
            $reply = $this->aiService->chat($messages);
        } catch (\Throwable $e) {
            $this->logger?->warning('ConversationRelay AI failed', ['error' => $e->getMessage()]);
            $locale = is_string($this->session['language'] ?? null) ? $this->session['language'] : 'en-US';
            $reply = FlowSpeechLocale::speak($locale, 'speech.ai_trouble');
        }

        $history[] = ['role' => 'assistant', 'content' => $reply];
        $this->session['history'] = $history;

        return [
            [
                'type' => 'text',
                'token' => $reply,
                'last' => true,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $incoming
     * @return list<array<string, mixed>>
     */
    private function handleDtmf(array $incoming): array
    {
        $digit = (string) ($incoming['digit'] ?? '');

        if ($digit === '') {
            return [];
        }

        return $this->handlePrompt([
            'type' => 'prompt',
            'voicePrompt' => "Caller pressed {$digit}",
            'last' => true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $incoming
     * @return list<array<string, mixed>>
     */
    private function handleError(array $incoming): array
    {
        $this->logger?->warning('ConversationRelay error from Twilio', [
            'description' => $incoming['description'] ?? null,
        ]);

        return [];
    }
}
