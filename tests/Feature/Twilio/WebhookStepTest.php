<?php

namespace Tests\Feature\Twilio;

use App\Application\Flow\Services\FlowExecutor;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\ValueObjects\FlowConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookStepTest extends TestCase
{
    use RefreshDatabase;

    private function makeFlow(array $steps): Flow
    {
        return new Flow(
            id: 'test-flow',
            tenantId: 'test-tenant',
            name: 'Test Flow',
            description: null,
            phoneNumber: null,
            config: FlowConfig::fromArray([
                'start_step' => array_key_first($steps),
                'steps' => $steps,
            ]),
            isActive: true,
        );
    }

    public function test_webhook_step_calls_url_and_continues(): void
    {
        Http::fake([
            'https://example.com/hook' => Http::response(['ok' => true], 200),
        ]);

        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'webhook', 'config' => ['url' => 'https://example.com/hook', 'method' => 'POST', 'body' => '{"test":true}'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);
        $executor = $this->app->make(FlowExecutor::class);
        $response = $executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Webhook completed successfully.', $xml);
        $this->assertStringContainsString('<Redirect>', $xml);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://example.com/hook'
                && $request->method() === 'POST'
                && $request->body() === '{"test":true}';
        });
    }

    public function test_webhook_step_handles_failure_status(): void
    {
        Http::fake([
            'https://example.com/fail' => Http::response(['error' => true], 500),
        ]);

        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'webhook', 'config' => ['url' => 'https://example.com/fail', 'method' => 'GET'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);
        $executor = $this->app->make(FlowExecutor::class);
        $response = $executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Webhook returned status 500', $xml);
        $this->assertStringContainsString('<Redirect>', $xml);
    }
}
