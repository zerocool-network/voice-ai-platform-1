<?php

namespace Tests\Unit\Services;

use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Services\FlowSimulator;
use PHPUnit\Framework\TestCase;

class FlowSimulatorStubTest extends TestCase
{
    public function test_simulator_stubs_mcp_voice_agent_analyze_and_memory(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 'mcp',
            'steps' => [
                'mcp' => [
                    'id' => 'mcp',
                    'type' => 'mcp_tool',
                    'config' => ['server' => 'demo', 'tool' => 'ping'],
                    'next' => 'agent',
                ],
                'agent' => [
                    'id' => 'agent',
                    'type' => 'voice_agent',
                    'config' => ['welcome_greeting' => 'Hi'],
                    'next' => 'analyze',
                ],
                'analyze' => [
                    'id' => 'analyze',
                    'type' => 'analyze',
                    'config' => [],
                    'next' => 'memory',
                ],
                'memory' => [
                    'id' => 'memory',
                    'type' => 'memory',
                    'config' => [],
                    'next' => 'hangup',
                ],
                'hangup' => ['id' => 'hangup', 'type' => 'hangup', 'config' => []],
            ],
        ]);

        $results = (new FlowSimulator)->simulate($config);
        $types = array_column($results, 'type');

        $this->assertSame(['mcp_tool', 'voice_agent', 'analyze', 'memory', 'hangup'], $types);
        $this->assertSame('ok', $results[0]['status']);
        $this->assertSame('ok', $results[1]['status']);
        $this->assertSame('ok', $results[2]['status']);
        $this->assertSame('ok', $results[3]['status']);
        $this->assertStringContainsString('simulated', $results[0]['output']);
    }
}
