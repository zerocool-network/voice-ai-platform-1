<?php

namespace App\Application\Flow\Services;

use App\Domain\Call\Entities\Call;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Domain\Knowledge\Services\RetrievalType;
use Illuminate\Support\Facades\Http;
use Psr\Log\LoggerInterface;
use Twilio\TwiML\VoiceResponse;

/**
 * @phpstan-type FlowStep array{id: string, type: string, config: array<string, mixed>, next: string|null}
 */
class FlowExecutor
{
    public function __construct(
        private readonly AiServiceInterface $aiService,
        private readonly KnowledgeRetrievalService $knowledgeRetrieval,
        private readonly ?LoggerInterface $logger = null,
    ) {}

    public function executeStep(string $stepId, Flow $flow, ?Call $call = null): VoiceResponse
    {
        $step = $flow->config()->getStep($stepId);

        if ($step === null) {
            return $this->errorResponse('Sorry, step not found.');
        }

        $stepType = $step['type'] ?? '';

        return match ($stepType) {
            'say' => $this->sayStep($step, $flow),
            'gather', 'ask' => $this->askStep($step),
            'llm' => $this->llmStep($step, $flow, $call),
            'condition' => $this->conditionStep($step, $flow, $call),
            'goto' => $this->gotoStep($step, $flow),
            'transfer' => $this->transferStep($step),
            'knowledge' => $this->knowledgeStep($step, $flow, $call),
            'webhook', 'mcp_tool' => $this->webhookStep($step, $flow, $call),
            'hangup' => $this->hangupStep(),
            'voice_agent' => $this->voiceAgentStep($step),
            'analyze' => $this->analyzeStep($step, $flow, $call),
            default => throw new \RuntimeException("Unknown step type: {$stepType}"),
        };
    }

    /** @param FlowStep $step */
    public function determineNextStep(array $step, ?string $digits): ?string
    {
        $stepType = $step['type'];
        $config = $step['config'];

        return match ($stepType) {
            'condition' => $this->evaluateCondition($config),
            'goto' => $config['target'] ?? $step['next'] ?? null,
            'transfer' => null,
            default => $this->resolveNextByDigits($step, $digits),
        };
    }

    /** @param FlowStep $step */
    private function sayStep(array $step, Flow $flow): VoiceResponse
    {
        $response = new VoiceResponse;
        $text = $step['config']['text'] ?? '';

        $resolved = $this->resolveVariables($text, $flow);
        $response->say($resolved);

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect('/twilio/step');
        }

        return $response;
    }

    /** @param FlowStep $step */
    private function askStep(array $step): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $prompt = $config['prompt'] ?? $config['text'] ?? '';
        $timeout = (int) ($config['timeoutSec'] ?? $config['timeout_seconds'] ?? 5);
        $inputType = $config['inputType'] ?? 'dtmf';
        $numDigits = (int) ($config['num_digits'] ?? 1);

        if ($inputType === 'speech') {
            $gather = $response->gather([
                'input' => 'speech',
                'timeout' => $timeout,
                'action' => '/twilio/step',
                'method' => 'POST',
                'speechTimeout' => 'auto',
            ]);

            if ($prompt !== '') {
                $gather->say($prompt);
            }

            $response->redirect('/twilio/step');
        } else {
            $gather = $response->gather([
                'numDigits' => $numDigits,
                'timeout' => $timeout,
                'action' => '/twilio/step',
                'method' => 'POST',
            ]);

            if ($prompt !== '') {
                $gather->say($prompt);
            }

            $response->redirect('/twilio/step');
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
            $llmText = 'I am sorry, I am having trouble processing your request right now.';
        }

        $response->say($llmText);

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect('/twilio/step');
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

            $response->redirect('/twilio/step');

            return $response;
        }

        $response->say('Condition not resolved.');
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
            $response->redirect('/twilio/step');
        } else {
            $response->say('No target specified.');
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
            $response->say('No destination configured.');
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
            $response->say('Knowledge step has no query configured.');
            $next = $step['next'] ?? null;
            if ($next !== null) {
                $response->redirect('/twilio/step');
            }

            return $response;
        }

        $query = $this->resolveVariables($queryRaw, $flow);
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
                $response->say('I could not find any relevant information.');
            } else {
                $messages = [
                    ['role' => 'system', 'content' => $systemPrompt."\n\n## Knowledge Context\n{$contextText}"],
                    ['role' => 'user', 'content' => $query],
                ];

                try {
                    $aiResponse = $this->aiService->chat($messages);
                    $response->say($aiResponse);
                } catch (\Throwable $e) {
                    $this->logger?->warning('FlowExecutor knowledge AI failed', ['error' => $e->getMessage()]);
                    $response->say('I found information but encountered an error processing it.');
                }
            }
        } catch (\Throwable $e) {
            $this->logger?->warning('FlowExecutor knowledge retrieval failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
            $response->say('I encountered an error looking up information.');
        }

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect('/twilio/step');
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
            $response->say('Webhook URL not configured.');
            $response->redirect('/twilio/step');

            return $response;
        }

        $resolvedBody = $this->resolveVariables($bodyRaw, $flow);
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
                $response->say('Webhook completed successfully.');
            } else {
                $response->say('Webhook returned status '.$status);
            }
        } catch (\Throwable $e) {
            $this->logger?->warning('FlowExecutor webhook failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $response->say('Webhook request failed.');
        }

        $next = $step['next'] ?? null;
        if ($next !== null) {
            $response->redirect('/twilio/step');
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
    private function voiceAgentStep(array $step): VoiceResponse
    {
        $response = new VoiceResponse;
        $config = $step['config'];
        $wsUrl = config('app.url').'/twilio/relay';

        $connect = $response->connect(['action' => route('twilio.step')]);
        $relay = $connect->conversationRelay([
            'url' => $wsUrl,
            'welcomeGreeting' => $config['welcome_greeting'] ?? 'Hello! How can I help you today?',
        ]);

        if ($voice = $config['voice'] ?? null) {
            $relay->setVoice($voice);
        }

        if ($ttsProvider = $config['tts_provider'] ?? null) {
            $relay->setTtsProvider($ttsProvider);
        }

        if ($intelligenceService = $config['intelligence_service'] ?? null) {
            $relay->setIntelligenceService($intelligenceService);
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
            $response->redirect('/twilio/step');
        }

        return $response;
    }

    /** @param array<string, mixed> $config */
    private function evaluateCondition(array $config): ?string
    {
        $branches = $config['branches'] ?? [];
        $elseNext = $config['elseNext'] ?? null;

        foreach ($branches as $branch) {
            $expression = $branch['expression'] ?? '';
            if ($expression === '' || $this->evaluateExpression($expression)) {
                return $branch['next'] ?? $elseNext;
            }
        }

        return $elseNext;
    }

    private function evaluateExpression(string $expression): bool
    {
        return true;
    }

    /** @param FlowStep $step */
    private function resolveNextByDigits(array $step, ?string $digits): ?string
    {
        if ($digits !== null && isset($step['config']['options'][$digits])) {
            return $step['config']['options'][$digits];
        }

        return $step['next'] ?? null;
    }

    private function resolveVariables(string $text, Flow $flow): string
    {
        return preg_replace_callback(
            '/\{\{(\w+)\}\}/',
            function ($m) use ($flow) {
                return match ($m[1]) {
                    'flow_name' => $flow->name(),
                    default => $m[0],
                };
            },
            $text,
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
        $response->say($message);
        $response->hangup();

        return $response;
    }
}
