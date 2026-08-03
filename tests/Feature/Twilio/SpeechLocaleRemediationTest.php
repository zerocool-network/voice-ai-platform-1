<?php

namespace Tests\Feature\Twilio;

use App\Application\Flow\Services\ConversationRelayHandler;
use App\Application\Flow\Services\FlowExecutor;
use App\Application\Flow\Services\FlowSpeechLocale;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Http\Middleware\ValidateTwilioRequest;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpeechLocaleRemediationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateTwilioRequest::class);

        config([
            'twilio.webhook_base_url' => 'https://example.test',
            'twilio.relay_url' => 'wss://example.test/twilio/relay',
        ]);
    }

    public function test_es_es_consent_uses_spanish_speech_strings(): void
    {
        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15557654321'],
        ]);
        $tenant->data_protection = [
            'consent_required' => true,
            'consent_message' => '',
        ];
        $tenant->save();

        FlowModelFactory::new()
            ->withPhone('+15557654321')
            ->create([
                'tenant_id' => $tenant->id,
                'language' => 'es-ES',
            ]);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('a', 32),
            'From' => '+15551234567',
            'To' => '+15557654321',
        ]);

        $response->assertOk();
        $content = $response->getContent();

        $this->assertStringContainsString('Esta llamada puede ser grabada.', $content);
        $this->assertStringContainsString('Pulse 1 para aceptar', $content);
        $this->assertStringContainsString('language="es-ES"', $content);
        $this->assertStringContainsString('voice="Polly.Lucia"', $content);
        $this->assertStringNotContainsString('This call may be recorded.', $content);
    }

    public function test_voice_agent_without_voice_omits_voice_attribute(): void
    {
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
                            'tts_provider' => 'elevenlabs',
                            'voice' => '',
                        ],
                        'next' => null,
                    ],
                ],
            ]),
            language: 'es-ES',
        );

        $xml = (string) $this->app->make(FlowExecutor::class)->executeStep('agent', $flow);

        $this->assertStringContainsString('language="es-ES"', $xml);
        $this->assertStringContainsString('ttsProvider="ElevenLabs"', $xml);
        $this->assertStringContainsString('¡Hola! ¿En qué puedo ayudarle hoy?', $xml);
        $this->assertStringNotContainsString('voice="', $xml);
        $this->assertSame('6xftrpatV0jGmFHxDjUv', FlowSpeechLocale::elevenLabsVoice('es-ES'));
        $this->assertSame('CaJslL1xziwefCeTNzHv', FlowSpeechLocale::elevenLabsVoice('es-MX'));
    }

    public function test_relay_ai_error_uses_localized_speech_string(): void
    {
        $ai = new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                throw new \RuntimeException('boom');
            }
        };

        $handler = new ConversationRelayHandler($ai);
        $handler->handle([
            'type' => 'setup',
            'customParameters' => [
                'systemPrompt' => 'Test',
                'language' => 'es-ES',
            ],
        ]);

        $out = $handler->handle([
            'type' => 'prompt',
            'voicePrompt' => 'Hola',
            'last' => true,
        ]);

        $this->assertSame('Lo siento, estoy teniendo problemas en este momento.', $out[0]['token'] ?? null);
        $this->assertStringNotContainsString('I am sorry', $out[0]['token'] ?? '');
    }

    public function test_mcp_error_speaks_localized_string_not_hardcoded_english(): void
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
                        'next' => null,
                    ],
                ],
            ]),
            language: 'es-ES',
        );

        $xml = (string) $this->app->make(FlowExecutor::class)->executeStep('s1', $flow);

        $this->assertStringContainsString('La herramienta MCP no está configurada.', $xml);
        $this->assertStringNotContainsString('MCP tool is not configured.', $xml);
    }
}
