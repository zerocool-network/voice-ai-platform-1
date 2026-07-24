<?php

namespace App\Application\Flow\UseCases;

use App\Application\Flow\DTOs\StepResult;
use App\Domain\Call\Entities\Call;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Flow\ValueObjects\StepType;
use App\Domain\Knowledge\Services\RetrievalType;
use Psr\Log\LoggerInterface;

class ExecuteFlow
{
    /** @var array<string, mixed> */
    private array $variables = [];

    private string $currentStepId;

    private bool $completed = false;

    public function __construct(
        private readonly AiServiceInterface $aiService,
        private readonly ?LoggerInterface $logger = null,
    ) {}

    /**
     * @param  array<string, mixed>  $initialVariables
     * @return array<string, mixed>
     */
    public function run(Flow $flow, Call $call, array $initialVariables = []): array
    {
        $this->variables = array_merge(
            [
                'tenant_id' => $call->getTenantId(),
                'from_number' => $call->getFromNumber()->value(),
                'to_number' => $call->getToNumber()->value(),
                'call_sid' => $call->getCallSid()->value(),
                'agent_name' => 'AI Assistant',
            ],
            $initialVariables
        );

        $config = $flow->getConfig();
        $this->currentStepId = $config['start_step'] ?? throw new \RuntimeException('No start_step defined');
        $steps = $config['steps'] ?? throw new \RuntimeException('No steps defined');

        $results = [];

        while (! $this->completed) {
            if (! isset($steps[$this->currentStepId])) {
                throw new \RuntimeException("Step '{$this->currentStepId}' not found");
            }

            $step = $steps[$this->currentStepId];
            $result = $this->executeStep($step);
            $results[] = $result;

            $this->currentStepId = $result->nextStepId;
        }

        return [
            'results' => $results,
            'variables' => $this->variables,
            'transcript' => $this->buildTranscript($results),
        ];
    }

    /** @param array<string, mixed> $step */
    private function executeStep(array $step): StepResult
    {
        $stepType = StepType::from($step['type']);
        $config = $step['config'] ?? [];

        $resolvedConfig = $this->resolveVariables($config);

        return match ($stepType) {
            StepType::Say => $this->handleSay($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Ask => $this->handleAsk($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Llm => $this->handleLlm($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Condition => $this->handleCondition($step['id'], $resolvedConfig),
            StepType::Goto => $this->handleGoto($resolvedConfig),
            StepType::McpTool => $this->handleMcpTool($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Transfer => $this->handleTransfer($step['id'], $resolvedConfig),
            StepType::Knowledge => $this->handleKnowledge($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Hangup => $this->handleHangup($step['id']),
            StepType::VoiceAgent => $this->handleVoiceAgent($step['id'], $resolvedConfig, $step['next'] ?? null),
            StepType::Analyze => $this->handleAnalyze($step['id'], $resolvedConfig, $step['next'] ?? null),
        };
    }

    /** @param array<string, mixed> $config */
    private function handleSay(string $stepId, array $config, ?string $next): StepResult
    {
        $text = $config['text'] ?? '';

        $this->logger?->debug("Flow say: {$text}");

        return new StepResult(
            stepId: $stepId,
            type: StepType::Say,
            output: $text,
            nextStepId: $next ?? $stepId,
            metadata: ['text' => $text]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleAsk(string $stepId, array $config, ?string $next): StepResult
    {
        $prompt = $config['prompt'] ?? '';
        $timeout = $config['timeout_seconds'] ?? 10;
        $retries = $config['retry_count'] ?? 0;

        $this->logger?->debug("Flow ask (timeout={$timeout}s, retries={$retries}): {$prompt}");

        return new StepResult(
            stepId: $stepId,
            type: StepType::Ask,
            output: $prompt,
            nextStepId: $next ?? $stepId,
            metadata: [
                'prompt' => $prompt,
                'timeout_seconds' => $timeout,
                'retry_count' => $retries,
                'variable' => $config['variable'] ?? null,
            ]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleLlm(string $stepId, array $config, ?string $next): StepResult
    {
        $systemPrompt = $config['system_prompt'] ?? 'You are a helpful AI voice assistant.';
        $temperature = (float) ($config['temperature'] ?? 0.7);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $this->buildLlmContext()],
        ];

        $this->logger?->debug('Flow LLM call', ['messages' => $messages]);

        $llmText = $this->aiService->chat($messages, $temperature);

        $varName = $config['response_variable'] ?? 'llm_response';
        $this->variables[$varName] = $llmText;

        $this->logger?->debug("Flow LLM response: {$llmText}");

        return new StepResult(
            stepId: $stepId,
            type: StepType::Llm,
            output: $llmText,
            nextStepId: $next ?? $stepId,
            metadata: [
                'model' => 'gpt-4o',
                'temperature' => $temperature,
                'tokens' => str_word_count($llmText),
            ]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleCondition(string $stepId, array $config): StepResult
    {
        $condition = $config['if'] ?? '';
        $goto = $config['goto'] ?? $stepId;
        $else = $config['else'] ?? $stepId;

        $result = $this->evaluateExpression($condition);
        $nextStepId = $result ? $goto : $else;

        $this->logger?->debug("Flow condition '{$condition}' = {$result} -> {$nextStepId}");

        return new StepResult(
            stepId: $stepId,
            type: StepType::Condition,
            output: $result ? 'true' : 'false',
            nextStepId: $nextStepId,
            metadata: [
                'condition' => $condition,
                'result' => $result,
                'goto' => $goto,
                'else' => $else,
            ]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleGoto(array $config): StepResult
    {
        $target = $config['step_id'] ?? throw new \RuntimeException('goto target missing');

        return new StepResult(
            stepId: '',
            type: StepType::Goto,
            output: "Jumping to {$target}",
            nextStepId: $target,
            metadata: ['target' => $target]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleMcpTool(string $stepId, array $config, ?string $next): StepResult
    {
        $tool = $config['tool'] ?? '';
        $params = $config['params'] ?? [];
        $responseVar = $config['response_variable'] ?? 'mcp_result';

        $this->logger?->debug("Flow MCP tool call: {$tool}", ['params' => $params]);

        $result = $this->callMcpTool($tool, $params);
        $this->variables[$responseVar] = $result;

        return new StepResult(
            stepId: $stepId,
            type: StepType::McpTool,
            output: json_encode($result),
            nextStepId: $next ?? $stepId,
            metadata: ['tool' => $tool, 'params' => $params]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleKnowledge(string $stepId, array $config, ?string $next): StepResult
    {
        $query = $config['query'] ?? '';
        $topK = (int) ($config['topK'] ?? 5);
        $type = isset($config['retrievalType']) ? RetrievalType::tryFrom($config['retrievalType']) : RetrievalType::Semantic;
        $resourceType = $config['resourceType'] ?? null;
        $systemPrompt = $config['systemPrompt'] ?? '';

        $this->logger?->debug("Knowledge retrieval: query='{$query}' topK={$topK} type={$type?->value}");

        return new StepResult(
            stepId: $stepId,
            type: StepType::Knowledge,
            output: "Knowledge step: {$query}",
            nextStepId: $next ?? $stepId,
            metadata: ['query' => $query, 'topK' => $topK, 'type' => $type?->value],
        );
    }

    /** @param array<string, mixed> $config */
    private function handleTransfer(string $stepId, array $config): StepResult
    {
        $target = $config['target'] ?? '';
        $timeout = $config['timeout'] ?? 30;

        $this->logger?->info("Flow transfer to: {$target}");

        $this->completed = true;

        return new StepResult(
            stepId: $stepId,
            type: StepType::Transfer,
            output: "Transferring to {$target}",
            nextStepId: '',
            metadata: ['target' => $target, 'timeout' => $timeout]
        );
    }

    private function handleHangup(string $stepId): StepResult
    {
        $this->logger?->debug('Flow hangup');

        $this->completed = true;

        return new StepResult(
            stepId: $stepId,
            type: StepType::Hangup,
            output: 'Call ended',
            nextStepId: '',
            metadata: []
        );
    }

    /** @param array<string, mixed> $config */
    private function handleVoiceAgent(string $stepId, array $config, ?string $next): StepResult
    {
        $this->logger?->debug('Flow voice agent', ['config' => $config]);

        $nextStepId = $next ?? '';
        if ($nextStepId !== '') {
            $this->completed = true;
        }

        return new StepResult(
            stepId: $stepId,
            type: StepType::VoiceAgent,
            output: $config['welcome_greeting'] ?? 'Voice agent connected',
            nextStepId: $nextStepId,
            metadata: [
                'voice' => $config['voice'] ?? null,
                'tts_provider' => $config['tts_provider'] ?? null,
                'intelligence_service' => $config['intelligence_service'] ?? null,
            ]
        );
    }

    /** @param array<string, mixed> $config */
    private function handleAnalyze(string $stepId, array $config, ?string $next): StepResult
    {
        $this->logger?->debug('Flow analyze step', ['config' => $config]);

        return new StepResult(
            stepId: $stepId,
            type: StepType::Analyze,
            output: 'Conversation Intelligence configured',
            nextStepId: $next ?? '',
            metadata: [
                'language_operator' => $config['language_operator'] ?? null,
                'conversation_profile' => $config['conversation_profile'] ?? null,
            ]
        );
    }

    private function resolveVariables(mixed $value): mixed
    {
        if (is_string($value)) {
            return preg_replace_callback(
                '/\{\{(\w+(?:\.\w+)*)\}\}/',
                fn ($m) => $this->getVariable($m[1], $m[0]),
                $value
            );
        }

        if (is_array($value)) {
            $resolved = [];
            foreach ($value as $key => $val) {
                $resolved[$key] = $this->resolveVariables($val);
            }

            return $resolved;
        }

        return $value;
    }

    private function getVariable(string $path, mixed $default = ''): mixed
    {
        $parts = explode('.', $path);
        $current = $this->variables;

        foreach ($parts as $part) {
            if (! is_array($current) || ! array_key_exists($part, $current)) {
                return $default;
            }
            $current = $current[$part];
        }

        return $current;
    }

    private function evaluateExpression(string $expression): bool
    {
        // Basic expression evaluator
        // Supports: {{var == "val"}}, {{count > 5}}, {{var exists}}
        if (preg_match('/\{\{(.+?)\}\}/', $expression, $m)) {
            $expr = trim($m[1]);

            // Existence check
            if (str_ends_with($expr, ' exists')) {
                $var = trim(substr($expr, 0, -7));

                return $this->getVariable($var, null) !== null;
            }

            // Equality check
            if (preg_match('/^(\S+)\s*==\s*(.+)$/', $expr, $parts)) {
                $var = $this->getVariable($parts[1], '__UNDEFINED__');
                $val = trim($parts[2], '"\' ‘');

                return (string) $var === $val;
            }

            // Comparison >=
            if (preg_match('/^(\S+)\s*>=\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) >= (float) $parts[2];
            }

            // Comparison >
            if (preg_match('/^(\S+)\s*>\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) > (float) $parts[2];
            }

            // Comparison <=
            if (preg_match('/^(\S+)\s*<=\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) <= (float) $parts[2];
            }

            // Comparison <
            if (preg_match('/^(\S+)\s*<\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) < (float) $parts[2];
            }

            // Boolean true
            if ($expr === 'true') {
                return true;
            }
            if ($expr === 'false') {
                return false;
            }

            // Fallback: truthy check
            $val = $this->getVariable($expr, null);

            return ! is_null($val) && $val !== '' && $val !== false;
        }

        return false;
    }

    private function buildLlmContext(): string
    {
        $context = "Current call context:\n";
        $context .= "Caller: {$this->variables['from_number']}\n";

        if (! empty($this->variables)) {
            $context .= "Variables:\n";
            foreach ($this->variables as $key => $value) {
                if (! in_array($key, ['tenant_id', 'from_number', 'to_number', 'call_sid'])) {
                    $context .= "- {$key}: {$value}\n";
                }
            }
        }

        return $context;
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function callMcpTool(string $tool, array $params): array
    {
        // MCP tool call - will be implemented with MCP SDK in Sprint 5
        // For now, return a mock response
        $this->logger?->warning("MCP tool '{$tool}' not yet implemented, returning mock");

        return [
            'status' => 'not_implemented',
            'tool' => $tool,
            'params' => $params,
        ];
    }

    /**
     * @param  StepResult[]  $results
     * @return array<int, array<string, mixed>>
     */
    private function buildTranscript(array $results): array
    {
        $transcript = [];

        foreach ($results as $result) {
            $transcript[] = [
                'step' => $result->stepId,
                'type' => $result->type->value,
                'output' => $result->output,
                'timestamp' => (new \DateTimeImmutable)->format(\DateTimeImmutable::ATOM),
            ];
        }

        return $transcript;
    }
}
