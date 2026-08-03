<?php

namespace App\Services;

use App\Domain\Flow\ValueObjects\FlowConfig;

class FlowSimulator
{
    /** @return array<int, array<string, mixed>> */
    public function simulate(FlowConfig $config): array
    {
        $steps = $config->steps();
        $startStep = $config->startStep();

        if (! isset($steps[$startStep])) {
            return [['step_id' => $startStep, 'type' => 'error', 'error' => 'Start step not found']];
        }

        $visited = [];
        $maxSteps = 20;
        $currentStepId = $startStep;
        $results = [];
        $context = [];

        while ($currentStepId !== null && $maxSteps > 0) {
            $maxSteps--;

            if (in_array($currentStepId, $visited)) {
                $results[] = [
                    'step_id' => $currentStepId,
                    'type' => 'error',
                    'output' => 'Loop detected',
                    'error' => 'Infinite loop — step already visited',
                ];

                break;
            }

            $visited[] = $currentStepId;

            if (! isset($steps[$currentStepId])) {
                $results[] = [
                    'step_id' => $currentStepId,
                    'type' => 'error',
                    'output' => "Step {$currentStepId} not found",
                    'error' => 'Step not found in config',
                ];

                break;
            }

            $step = $steps[$currentStepId];
            $stepType = $step['type'] ?? 'unknown';
            $stepConfig = $step['config'] ?? [];

            $result = $this->simulateStep($stepType, $stepConfig, $context);

            $results[] = array_merge([
                'step_id' => $currentStepId,
                'type' => $stepType,
            ], $result);

            if ($stepType === 'hangup') {
                break;
            }

            $currentStepId = $step['next'] ?? null;

            if ($stepType === 'condition') {
                $branches = $stepConfig['branches'] ?? [];
                $firstBranch = $branches[0] ?? null;
                $currentStepId = $firstBranch['next'] ?? ($stepConfig['elseNext'] ?? $step['next'] ?? null);
            }
        }

        if ($maxSteps === 0) {
            $results[] = ['step_id' => null, 'type' => 'warning', 'output' => 'Max steps reached — possible infinite flow'];
        }

        return $results;
    }

    /**
     * @param  array<string, mixed>  $config
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function simulateStep(string $type, array $config, array &$context): array
    {
        return match ($type) {
            'say' => [
                'output' => $config['text'] ?? '(no text)',
                'status' => 'ok',
            ],
            'ask' => [
                'output' => $config['prompt'] ?? '(no prompt)',
                'mock_input' => 'Simulated caller input',
                'status' => 'ok',
            ],
            'llm' => [
                'output' => '(AI response: simulated by '.($config['model'] ?? 'model').')',
                'status' => 'ok',
            ],
            'transfer' => [
                'output' => "Transfer to {$config['destination']}: ".($config['value'] ?? ''),
                'status' => 'ok',
            ],
            'webhook' => [
                'output' => '{'.($config['method'] ?? 'POST')."} {$config['url']} — body: ".($config['body'] ?? '{}'),
                'status' => 'ok',
            ],
            'knowledge' => [
                'output' => "(Knowledge lookup: {$config['query']}) — simulated result",
                'status' => 'ok',
            ],
            'goto' => [
                'output' => "Jump to {$config['target']}",
                'status' => 'ok',
            ],
            'hangup' => [
                'output' => 'Call ended',
                'status' => 'ok',
            ],
            'condition' => [
                'output' => 'Evaluating branches (first branch taken)',
                'status' => 'ok',
            ],
            'mcp_tool' => [
                'output' => '(MCP tool: '.($config['server'] ?? '?').'/'.($config['tool'] ?? '?').') — simulated',
                'status' => 'ok',
            ],
            'n8n_trigger' => [
                'output' => '(n8n trigger: '.($config['workflow_id'] ?? '?').') — simulated',
                'status' => 'ok',
            ],
            'hubspot' => [
                'output' => '(HubSpot: '.($config['action'] ?? 'sync_call').') — simulated',
                'status' => 'ok',
            ],
            'voice_agent' => [
                'output' => '(Voice agent: '.($config['welcome_greeting'] ?? $config['welcomeGreeting'] ?? 'Hello').') — simulated',
                'status' => 'ok',
            ],
            'analyze' => [
                'output' => '(Analyze step) — simulated',
                'status' => 'ok',
            ],
            'memory' => [
                'output' => '(Memory recall) — simulated',
                'status' => 'ok',
            ],
            default => [
                'output' => "Unknown step type: {$type}",
                'status' => 'error',
                'error' => 'Unknown step type',
            ],
        };
    }
}
