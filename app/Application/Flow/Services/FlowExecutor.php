<?php

namespace App\Application\Flow\Services;

use App\Domain\Call\Entities\Call;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Domain\Knowledge\Services\RetrievalType;
use App\Services\ConversationMemoryService;
use App\Services\McpToolService;
use Illuminate\Support\Facades\Http;
use Psr\Log\LoggerInterface;
use Twilio\TwiML\VoiceResponse;

/**
 * @phpstan-type FlowStep array{id: string, type: string, config: array<string, mixed>, next: string|null}
 */
class FlowExecutor
{
    use SharedFlowLogic {
        evaluateExpression as private evaluateSharedExpression;
        resolveVariables as private resolveSharedVariables;
    }

    /** @var array<string, mixed> */
    private array $runtimeVariables = [];

    /** @var array{language: string, voice: string} */
    private array $sayAttributes = [
        'language' => 'en-US',
        'voice' => 'Polly.Joanna',
    ];

    public function __construct(
        private readonly AiServiceInterface $aiService,
        private readonly KnowledgeRetrievalService $knowledgeRetrieval,
        private readonly ConversationMemoryService $memoryService,
        private readonly ?McpToolService $mcpToolService = null,
        private readonly ?LoggerInterface $logger = null,
    ) {}

    /** @return array<string, mixed> */
    protected function sharedVariables(): array
    {
        return $this->runtimeVariables;
    }

    public function executeStep(string $stepId, Flow $flow, ?Call $call = null): VoiceResponse
    {
        $this->sayAttributes = FlowSpeechLocale::sayAttributes($flow->language());
        $this->bindRuntimeContext($flow, $call);

        $this->logger?->info('FlowExecutor speech locale', [
            'flow_id' => $flow->id(),
            'step_id' => $stepId,
            'language' => $this->sayAttributes['language'],
            'voice' => $this->sayAttributes['voice'],
        ]);

        $step = $flow->config()->getStep($stepId);

        if ($step === null) {
            return $this->errorResponse('Sorry, step not found.');
        }

        $stepType = $step['type'] ?? '';

        return match ($stepType) {
            'say' => $this->sayStep($step, $flow),
            'gather', 'ask' => $this->askStep($step, $flow),
            'llm' => $this->llmStep($step, $flow, $call),
            'condition' => $this->conditionStep($step, $flow, $call),
            'goto' => $this->gotoStep($step, $flow),
            'transfer' => $this->transferStep($step),
            'knowledge' => $this->knowledgeStep($step, $flow, $call),
            'webhook' => $this->webhookStep($step, $flow, $call),
            'mcp_tool' => $this->mcpToolStep($step, $flow, $call),
            'hangup' => $this->hangupStep(),
            'voice_agent' => $this->voiceAgentStep($step, $flow, $call),
            'analyze' => $this->analyzeStep($step, $flow, $call),
            'memory' => $this->memoryStep($step, $flow, $call),
            default => throw new \RuntimeException("Unknown step type: {$stepType}"),
        };
    }

    /**
     * @param  FlowStep  $step
     * @param  array<string, mixed>  $variables
     */
    public function determineNextStep(array $step, ?string $digits, array $variables = []): ?string
    {
        $this->runtimeVariables = $variables;

        $stepType = $step['type'];
        $config = $step['config'];

        return match ($stepType) {
            'condition' => $this->evaluateCondition($config),
            'goto' => $config['target'] ?? $step['next'] ?? null,
            'transfer' => null,
            default => $this->resolveNextByDigits($step, $digits),
        };
    }

    protected function evaluateExpression(string $expression): bool
    {
        $normalized = trim($expression);

        if ($normalized === '') {
            return true;
        }

        if (! str_contains($normalized, '{{')) {
            $normalized = '{{'.$normalized.'}}';
        }

        return $this->evaluateSharedExpression($normalized);
    }

    /** @param FlowStep $step */
    private function sayStep(array $step, Flow $flow): VoiceResponse
    {
        $response = new VoiceResponse;
        $text = $step['config']['text'] ?? '';

        $resolved = $this->resolveFlowVariables($text, $flow);
        $this->speak($response, $resolved);

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function askStep(array $step, Flow $flow): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $prompt = $config['prompt'] ?? $config['text'] ?? '';
        $timeout = (int) ($config['timeoutSec'] ?? $config['timeout_seconds'] ?? 5);
        $inputType = $config['inputType'] ?? 'dtmf';
        $numDigits = (int) ($config['num_digits'] ?? 1);
        $language = FlowSpeechLocale::bcp47($flow->language());

        if ($inputType === 'speech') {
            $gather = $response->gather([
                'input' => 'speech',
                'timeout' => $timeout,
                'action' => TwilioPublicUrl::to('/twilio/step'),
                'method' => 'POST',
                'speechTimeout' => 'auto',
                'language' => $language,
            ]);

            if ($prompt !== '') {
                $this->speak($gather, $prompt);
            }

            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        } else {
            $gather = $response->gather([
                'numDigits' => $numDigits,
                'timeout' => $timeout,
                'action' => TwilioPublicUrl::to('/twilio/step'),
                'method' => 'POST',
            ]);

            if ($prompt !== '') {
                $this->speak($gather, $prompt);
            }

            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function llmStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $systemPrompt = $config['systemPrompt'] ?? $config['system_prompt'] ?? 'You are a helpful AI voice assistant.';
        $temperature = (float) ($config['temperature'] ?? 0.7);

        $context = $this->buildLlmContext($flow, $call);
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $context],
        ];

        $this->logger?->debug('FlowExecutor LLM call', ['messages' => $messages]);

        try {
            $llmText = $this->aiService->chat($messages, $temperature);
        } catch (\Throwable $e) {
            $this->logger?->warning('FlowExecutor LLM failed', ['error' => $e->getMessage()]);
            $llmText = FlowSpeechLocale::speak($flow->language(), 'speech.llm_trouble');
        }

        $this->speak($response, $llmText);

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function conditionStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;

        $branchId = $this->evaluateCondition($step['config']);
        $redirectStep = $branchId ?? $step['next'] ?? null;

        if ($redirectStep !== null) {
            $this->logger?->debug("FlowExecutor condition -> {$redirectStep}");

            $response->redirect(TwilioPublicUrl::to('/twilio/step'));

            return $response;
        }

        $this->speak($response, 'Condition not resolved.');
        $response->hangup();

        return $response;
    }

    /** @param FlowStep $step */
    private function gotoStep(array $step, Flow $flow): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $target = $config['target'] ?? $step['next'] ?? null;

        if ($target !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        } else {
            $this->speak($response, 'No target specified.');
            $response->hangup();
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function transferStep(array $step): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $destination = $config['destination'] ?? 'number';
        $value = $config['value'] ?? $config['target'] ?? '';

        if ($value === '') {
            $this->speak($response, 'No destination configured.');
            $response->hangup();
        } elseif ($destination === 'sip') {
            $dial = $response->dial('');
            $dial->sip($value);
        } else {
            $response->dial($value);
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function knowledgeStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $queryRaw = $config['query'] ?? '';
        $topK = (int) ($config['topK'] ?? 5);
        $retrievalType = $config['retrievalType'] ?? 'semantic';
        $resourceType = $config['resourceType'] ?? null;
        $systemPrompt = $config['systemPrompt'] ?? 'You are a helpful voice assistant. Use the knowledge context below to answer concisely in a spoken-friendly way.';

        if ($queryRaw === '') {
            $this->speak($response, 'Knowledge step has no query configured.');
            $next = $step['next'] ?? null;
            if ($next !== null) {
                $response->redirect(TwilioPublicUrl::to('/twilio/step'));
            }

            return $response;
        }

        $query = $this->resolveFlowVariables($queryRaw, $flow);
        $callContext = $call?->context() ?? [];
        $query = preg_replace_callback(
            '/\{\{(\w+)\}\}/',
            fn ($m) => $callContext[$m[1]] ?? $m[0],
            $query,
        );

        try {
            $result = $this->knowledgeRetrieval->retrieve(
                tenantId: $flow->id(),
                query: $query,
                topK: $topK,
                resourceType: $resourceType ?: null,
                type: RetrievalType::tryFrom($retrievalType) ?? RetrievalType::Semantic,
            );

            $contextText = $result->contextText;

            if (trim($contextText) === '') {
                $this->speak($response, 'I could not find any relevant information.');
            } else {
                $messages = [
                    ['role' => 'system', 'content' => $systemPrompt."\n\n## Knowledge Context\n{$contextText}"],
                    ['role' => 'user', 'content' => $query],
                ];

                try {
                    $aiResponse = $this->aiService->chat($messages);
                    $this->speak($response, $aiResponse);
                } catch (\Throwable $e) {
                    $this->logger?->warning('FlowExecutor knowledge AI failed', ['error' => $e->getMessage()]);
                    $this->speak($response, 'I found information but encountered an error processing it.');
                }
            }
        } catch (\Throwable $e) {
            $this->logger?->warning('FlowExecutor knowledge retrieval failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
            $this->speak($response, 'I encountered an error looking up information.');
        }

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function webhookStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $url = $config['url'] ?? '';
        $method = strtoupper($config['method'] ?? 'POST');
        $bodyRaw = $config['body'] ?? '';

        if ($url === '') {
            $this->speak($response, FlowSpeechLocale::speak($flow->language(), 'speech.webhook_not_configured'));
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));

            return $response;
        }

        $resolvedBody = $this->resolveFlowVariables($bodyRaw, $flow);
        $callContext = $call?->context() ?? [];
        $resolvedBody = preg_replace_callback(
            '/\{\{(\w+)\}\}/',
            fn ($m) => $callContext[$m[1]] ?? $m[0],
            $resolvedBody,
        );

        $this->logger?->debug('FlowExecutor webhook', [
            'url' => $url,
            'method' => $method,
            'body' => $resolvedBody,
        ]);

        try {
            $http = Http::timeout(10);

            $httpResponse = match ($method) {
                'GET' => $http->get($url),
                'PUT' => $http->put($url, json_decode($resolvedBody, true) ?? []),
                'DELETE' => $http->delete($url),
                default => $http->post($url, json_decode($resolvedBody, true) ?? []),
            };

            $status = $httpResponse->status();
            $responseBody = $httpResponse->body();

            $this->logger?->debug('FlowExecutor webhook response', [
                'status' => $status,
                'body' => substr($responseBody, 0, 500),
            ]);

            if ($status >= 200 && $status < 300) {
                $this->speak($response, 'Webhook completed successfully.');
            } else {
                $this->speak($response, FlowSpeechLocale::speak($flow->language(), 'speech.webhook_failed', ['status' => $status]));
            }
        } catch (\Throwable $e) {
            $this->logger?->warning('FlowExecutor webhook failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $this->speak($response, 'Webhook request failed.');
        }

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function mcpToolStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $server = (string) ($config['server'] ?? '');
        $tool = (string) ($config['tool'] ?? '');
        $variable = (string) ($config['variable'] ?? 'tool_result');
        $parametersRaw = $config['parameters'] ?? '{}';

        if ($server === '' || $tool === '') {
            $this->speak($response, FlowSpeechLocale::speak($flow->language(), 'speech.mcp_not_configured'));
            $next = $step['next'] ?? null;
            if ($next !== null) {
                $response->redirect(TwilioPublicUrl::to('/twilio/step'));
            }

            return $response;
        }

        if ($this->mcpToolService === null) {
            $this->speak($response, FlowSpeechLocale::speak($flow->language(), 'speech.mcp_unavailable'));
            $next = $step['next'] ?? null;
            if ($next !== null) {
                $response->redirect(TwilioPublicUrl::to('/twilio/step'));
            }

            return $response;
        }

        $parametersJson = is_string($parametersRaw)
            ? $this->resolveFlowVariables($parametersRaw, $flow)
            : json_encode($parametersRaw);

        $callContext = $call?->context() ?? [];
        $parametersJson = preg_replace_callback(
            '/\{\{(\w+)\}\}/',
            fn ($m) => $callContext[$m[1]] ?? $m[0],
            (string) $parametersJson,
        );

        /** @var array<string, mixed> $arguments */
        $arguments = json_decode((string) $parametersJson, true) ?? [];

        $result = $this->mcpToolService->callTool($server, $tool, $arguments);
        $text = (string) ($result['text'] ?? '');

        if ($call !== null && $variable !== '') {
            $context = $call->context();
            $context[$variable] = $text;
            $call->setContext($context);
            $this->runtimeVariables[$variable] = $text;
        }

        if ($result['isError'] ?? false) {
            $this->speak($response, FlowSpeechLocale::speak($flow->language(), 'speech.mcp_failed'));
        } else {
            $spoken = $text !== '' ? mb_substr($text, 0, 240) : FlowSpeechLocale::speak($flow->language(), 'speech.mcp_success');
            $this->speak($response, $spoken);
        }

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    private function hangupStep(): VoiceResponse
    {
        $response = new VoiceResponse;
        $response->hangup();

        return $response;
    }

    /** @param FlowStep $step */
    private function voiceAgentStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $wsUrl = ConversationRelayUrl::websocket();
        $ttsProvider = $this->normalizeTtsProvider($config['tts_provider'] ?? $config['ttsProvider'] ?? null);
        $language = FlowSpeechLocale::bcp47($flow->language());

        $welcomeGreeting = $config['welcome_greeting'] ?? $config['welcomeGreeting'] ?? null;
        if (! is_string($welcomeGreeting) || trim($welcomeGreeting) === '') {
            $welcomeGreeting = FlowSpeechLocale::speak($flow->language(), 'speech.welcome_greeting');
        }

        $connect = $response->connect(['action' => TwilioPublicUrl::to('/twilio/step')]);
        $relay = $connect->conversationRelay([
            'url' => $wsUrl,
            'welcomeGreeting' => $welcomeGreeting,
            'ttsProvider' => $ttsProvider,
            'language' => $language,
        ]);

        $voice = $config['voice'] ?? null;
        if (is_string($voice) && trim($voice) !== '') {
            $relay->setVoice($voice);
        }

        if ($intelligenceService = $config['intelligence_service'] ?? null) {
            if ($intelligenceService !== '') {
                $relay->setIntelligenceService($intelligenceService);
            }
        }

        if ($interruptible = $config['interruptible'] ?? null) {
            $relay->setInterruptible($interruptible);
        }

        if ($welcomeGreetingInterruptible = $config['welcome_greeting_interruptible'] ?? null) {
            $relay->setWelcomeGreetingInterruptible($welcomeGreetingInterruptible);
        }

        if ($interruptSensitivity = $config['interrupt_sensitivity'] ?? null) {
            $relay->setInterruptSensitivity($interruptSensitivity);
        }

        if ($debug = $config['debug'] ?? null) {
            $relay->setDebug($debug);
        }

        $systemPrompt = $config['system_prompt'] ?? $config['systemPrompt'] ?? 'You are a helpful voice assistant.';
        $relay->parameter(['name' => 'systemPrompt', 'value' => $systemPrompt]);
        $relay->parameter(['name' => 'language', 'value' => $language]);

        if ($call !== null) {
            $relay->parameter(['name' => 'callSid', 'value' => $call->getCallSid()->value()]);
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function analyzeStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];

        $this->logger?->debug('FlowExecutor analyze step', ['config' => $config]);

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect(TwilioPublicUrl::to('/twilio/step'));
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function memoryStep(array $step, Flow $flow, ?Call $call): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];

        $phoneNumber = $config['from_number'] ?? ($call?->fromNumber() ?? null);

        if (! $phoneNumber) {
            $this->logger?->warning('Memory step: no phone number available');

            return $this->sayAndContinue($response, FlowSpeechLocale::speak($flow->language(), 'speech.memory_unavailable'));
        }

        $profile = $this->memoryService->searchProfile(
            (string) $phoneNumber,
            accountSid: config('twilio.account_sid'),
            authToken: config('twilio.auth_token'),
        );

        if ($profile) {
            $recall = $this->memoryService->recallProfile(
                $profile['id'],
                accountSid: config('twilio.account_sid'),
                authToken: config('twilio.auth_token'),
            );

            $traits = $profile['traits'] ?? [];
            $observations = collect($recall['observations'] ?? [])->take(5)->pluck('text')->join('; ');

            if ($call) {
                $context = $call->context();
                $context['customer_name'] = $traits['name'] ?? $traits['display_name'] ?? 'valued customer';
                $context['customer_context'] = $observations;
                $context['customer_traits'] = json_encode($traits);
                $call->setContext($context);
            }
        }

        return $response;
    }

    private function normalizeTtsProvider(mixed $provider): string
    {
        return match (strtolower((string) ($provider ?? ''))) {
            'google' => 'Google',
            'amazon' => 'Amazon',
            'elevenlabs', '' => 'ElevenLabs',
            default => (string) $provider,
        };
    }

    /** @param FlowStep $step */
    private function resolveNextByDigits(array $step, ?string $digits): ?string
    {
        if ($digits !== null && isset($step['config']['options'][$digits])) {
            return $step['config']['options'][$digits];
        }

        return $step['next'] ?? null;
    }

    private function resolveFlowVariables(string $text, Flow $flow): string
    {
        return (string) preg_replace_callback(
            '/\{\{(\w+)\}\}/',
            function ($m) use ($flow) {
                if (array_key_exists($m[1], $this->runtimeVariables)) {
                    return (string) $this->runtimeVariables[$m[1]];
                }

                return match ($m[1]) {
                    'flow_name' => $flow->name(),
                    default => $m[0],
                };
            },
            $text,
        );
    }

    private function bindRuntimeContext(Flow $flow, ?Call $call): void
    {
        $this->runtimeVariables = array_merge(
            [
                'flow_name' => $flow->name(),
                'flow_id' => $flow->id(),
            ],
            $call?->context() ?? [],
        );
    }

    private function buildLlmContext(Flow $flow, ?Call $call): string
    {
        $context = "Current call context:\n";
        $context .= "Flow: {$flow->name()}\n";
        $context .= "Version: {$flow->version()}\n";

        if ($call !== null) {
            $context .= "Caller: {$call->fromNumber()->value()}\n";
            $context .= "Called: {$call->toNumber()->value()}\n";

            $callContext = $call->context();
            if (! empty($callContext)) {
                $context .= "Variables:\n";
                foreach ($callContext as $key => $value) {
                    if (is_scalar($value)) {
                        $context .= "- {$key}: {$value}\n";
                    }
                }
            }
        }

        return $context;
    }

    private function errorResponse(string $message): VoiceResponse
    {
        $response = new VoiceResponse;
        $this->speak($response, $message);
        $response->hangup();

        return $response;
    }

    private function sayAndContinue(VoiceResponse $response, string $message): VoiceResponse
    {
        $this->speak($response, $message);
        $response->redirect(TwilioPublicUrl::to('/twilio/step'));

        return $response;
    }

    private function speak(object $target, string $text): void
    {
        $target->say($text, $this->sayAttributes);
    }
}
