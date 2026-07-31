<?php

namespace Tests\Feature\Twilio;

use App\Application\Flow\Services\FlowExecutor;
use App\Domain\Call\Entities\Call;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\ValueObjects\FlowConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class VoiceAgentTwimlTest extends TestCase
{
    use RefreshDatabase;

    public function test_twilio_step_route_is_named(): void
    {
        $this->assertTrue(Route::has('twilio.step'));
    }

    public function test_voice_agent_emits_conversation_relay_twiml(): void
    {
        config([
            'app.url' => 'https://voice-ai-platform.test',
            'twilio.webhook_base_url' => 'https://voice-ai-platform.hifenix.com',
            'twilio.relay_url' => 'wss://voice-ai-platform.hifenix.com/twilio/relay',
        ]);

        $flow = new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'Agent Flow',
            description: null,
            phoneNumber: '+15551234567',
            config: FlowConfig::fromArray([
                'start_step' => 'agent',
                'steps' => [
                    'agent' => [
                        'id' => 'agent',
                        'type' => 'voice_agent',
                        'config' => [
                            'welcome_greeting' => 'Hi there',
                            'system_prompt' => 'You are Nora.',
                            'voice' => '21m00Tcm4TlvDq8ikWAM',
                            'tts_provider' => 'elevenlabs',
                        ],
                        'next' => null,
                    ],
                ],
            ]),
            language: 'es-ES',
        );

        $call = new Call(
            id: 'call-1',
            tenantId: 'tenant-1',
            flowId: 'flow-1',
            callSid: new CallSid('CA'.str_repeat('b', 32)),
            fromNumber: new PhoneNumber('+15550001111'),
            toNumber: new PhoneNumber('+15551234567'),
        );

        $executor = $this->app->make(FlowExecutor::class);
        $xml = (string) $executor->executeStep('agent', $flow, $call);

        $this->assertStringContainsString('<Connect', $xml);
        $this->assertStringContainsString('<ConversationRelay', $xml);
        $this->assertStringContainsString('url="wss://voice-ai-platform.hifenix.com/twilio/relay"', $xml);
        $this->assertStringContainsString('ttsProvider="ElevenLabs"', $xml);
        $this->assertStringContainsString('language="es-ES"', $xml);
        $this->assertStringContainsString('welcomeGreeting="Hi there"', $xml);
        $this->assertStringContainsString('voice="21m00Tcm4TlvDq8ikWAM"', $xml);
        $this->assertStringContainsString('name="systemPrompt"', $xml);
        $this->assertStringContainsString('value="You are Nora."', $xml);
        $this->assertStringContainsString('name="callSid"', $xml);
        $this->assertStringContainsString('action="https://voice-ai-platform.hifenix.com/twilio/step"', $xml);
    }
}
