<?php

namespace Tests\Feature\Twilio;

use App\Application\Flow\Services\FlowExecutor;
use App\Domain\Call\Entities\Call;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Services\McpToolService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class McpToolStepTest extends TestCase
{
    use RefreshDatabase;

    public function test_mcp_tool_step_calls_mcp_service_not_http_webhook(): void
    {
        $mcp = Mockery::mock(McpToolService::class);
        $mcp->shouldReceive('callTool')
            ->once()
            ->with('sqlite', 'list_tables', ['schema' => 'main'])
            ->andReturn([
                'content' => [['type' => 'text', 'text' => 'users, orders']],
                'isError' => false,
                'text' => 'users, orders',
            ]);

        $this->app->instance(McpToolService::class, $mcp);

        $flow = new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'MCP Flow',
            description: null,
            phoneNumber: null,
            config: FlowConfig::fromArray([
                'start_step' => 's1',
                'steps' => [
                    's1' => [
                        'id' => 's1',
                        'type' => 'mcp_tool',
                        'config' => [
                            'server' => 'sqlite',
                            'tool' => 'list_tables',
                            'parameters' => '{"schema":"main"}',
                            'variable' => 'tables',
                        ],
                        'next' => 'hangup',
                    ],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ]),
        );

        $call = new Call(
            id: 'call-1',
            tenantId: 'tenant-1',
            flowId: 'flow-1',
            callSid: new CallSid('CA'.str_repeat('c', 32)),
            fromNumber: new PhoneNumber('+15550001111'),
            toNumber: new PhoneNumber('+15551234567'),
        );

        $executor = $this->app->make(FlowExecutor::class);
        $xml = (string) $executor->executeStep('s1', $flow, $call);

        $this->assertStringContainsString('users, orders', $xml);
        $this->assertStringContainsString('<Redirect>/twilio/step</Redirect>', $xml);
        $this->assertSame('users, orders', $call->context()['tables']);
    }

    public function test_mcp_tool_missing_config_speaks_error(): void
    {
        $flow = new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'MCP Flow',
            description: null,
            phoneNumber: null,
            config: FlowConfig::fromArray([
                'start_step' => 's1',
                'steps' => [
                    's1' => [
                        'id' => 's1',
                        'type' => 'mcp_tool',
                        'config' => ['server' => '', 'tool' => ''],
                        'next' => 'hangup',
                    ],
                    'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                ],
            ]),
        );

        $executor = $this->app->make(FlowExecutor::class);
        $xml = (string) $executor->executeStep('s1', $flow);

        $this->assertStringContainsString('MCP tool is not configured.', $xml);
    }
}
