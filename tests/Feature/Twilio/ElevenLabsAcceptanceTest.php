<?php

namespace Tests\Feature\Twilio;

use App\Http\Middleware\ValidateTwilioRequest;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** @group external-api */
class ElevenLabsAcceptanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $agentId = config('elevenlabs.agent_id');
        $apiKey = config('elevenlabs.api_key');

        if ($agentId === null || $agentId === '' || $apiKey === null || $apiKey === '') {
            $this->markTestSkipped('ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY not set');
        }

        $this->withoutMiddleware(ValidateTwilioRequest::class);
    }

    public function test_llm_step_returns_real_elevenlabs_response(): void
    {
        $tenant = TenantFactory::new()->create();

        $flow = FlowModelFactory::new()
            ->withPhone('+14155550100')
            ->create([
                'tenant_id' => $tenant->id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => [
                            'id' => 's1',
                            'type' => 'llm',
                            'config' => [
                                'systemPrompt' => 'You are a helpful assistant. Respond with exactly one word.',
                                'temperature' => 0.3,
                            ],
                            'next' => 'hangup',
                        ],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA'.str_repeat('e', 32);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550100',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('<Say', $content);
        $this->assertStringNotContainsString('not configured', $content);
        $this->assertStringNotContainsString('having trouble processing', $content);
    }

    public function test_elevenlabs_responds_to_spanish_greeting(): void
    {
        $tenant = TenantFactory::new()->create();

        $flow = FlowModelFactory::new()
            ->withPhone('+14155550101')
            ->create([
                'tenant_id' => $tenant->id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => [
                            'id' => 's1',
                            'type' => 'llm',
                            'config' => [
                                'systemPrompt' => 'Eres un asistente amigable. Responde en español con una sola frase corta.',
                                'temperature' => 0.3,
                            ],
                            'next' => 'hangup',
                        ],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA'.str_repeat('f', 32);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550101',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('<Say', $content);
        $this->assertStringNotContainsString('not configured', $content);
        $this->assertStringNotContainsString('having trouble processing', $content);
    }
}
