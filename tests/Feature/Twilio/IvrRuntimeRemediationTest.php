<?php

namespace Tests\Feature\Twilio;

use App\Application\Flow\Services\TwilioPublicUrl;
use App\Http\Middleware\ValidateTwilioRequest;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Services\McpToolService;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IvrRuntimeRemediationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateTwilioRequest::class);

        config([
            'twilio.webhook_base_url' => 'https://example.test',
        ]);
    }

    public function test_digits_persist_into_call_context_and_appear_in_next_say(): void
    {
        $tenant = TenantFactory::new()->create();

        FlowModelFactory::new()
            ->withPhone('+14155551001')
            ->create([
                'tenant_id' => $tenant->id,
                'config' => [
                    'start_step' => 'ask',
                    'steps' => [
                        'ask' => [
                            'id' => 'ask',
                            'type' => 'gather',
                            'config' => [
                                'num_digits' => 1,
                                'timeout' => 5,
                                'text' => 'Enter a digit',
                            ],
                            'next' => 'echo',
                        ],
                        'echo' => [
                            'id' => 'echo',
                            'type' => 'say',
                            'config' => ['text' => 'You pressed {{digits}}'],
                            'next' => 'hangup',
                        ],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA'.str_repeat('1', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155551001',
        ])->assertOk();

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
            'Digits' => '7',
        ]);

        $response->assertOk();
        $response->assertSee('You pressed 7', false);

        $call = CallModel::query()->where('call_sid', $callSid)->first();
        $this->assertNotNull($call);
        $this->assertSame('7', $call->context['digits'] ?? null);
        $this->assertSame('7', $call->context['input'] ?? null);
    }

    public function test_mcp_result_persists_in_call_context_across_steps(): void
    {
        $tenant = TenantFactory::new()->create();

        $flow = FlowModelFactory::new()
            ->withPhone('+14155551002')
            ->create([
                'tenant_id' => $tenant->id,
                'config' => [
                    'start_step' => 'mcp',
                    'steps' => [
                        'mcp' => [
                            'id' => 'mcp',
                            'type' => 'mcp_tool',
                            'config' => [
                                'server' => 'demo',
                                'tool' => 'ping',
                                'parameters' => '{}',
                                'variable' => 'mcp_result',
                            ],
                            'next' => 'say',
                        ],
                        'say' => [
                            'id' => 'say',
                            'type' => 'say',
                            'config' => ['text' => 'Result {{mcp_result}}'],
                            'next' => 'hangup',
                        ],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $this->mock(McpToolService::class, function ($mock) {
            $mock->shouldReceive('callTool')
                ->once()
                ->andReturn([
                    'content' => [['type' => 'text', 'text' => 'pong']],
                    'isError' => false,
                    'text' => 'pong',
                ]);
        });

        $callSid = 'CA'.str_repeat('2', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155551002',
        ])->assertOk()->assertSee('pong', false);

        $call = CallModel::query()->where('call_sid', $callSid)->first();
        $this->assertNotNull($call);
        $this->assertSame('pong', $call->context['mcp_result'] ?? null);
        $this->assertSame($flow->id, $call->flow_id);

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
        ]);

        $response->assertOk();
        $response->assertSee('Result pong', false);
    }

    public function test_consent_gather_uses_absolute_url_and_preserves_flow_id(): void
    {
        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15559876543'],
        ]);
        $tenant->data_protection = [
            'consent_required' => true,
            'consent_message' => 'This call may be recorded.',
        ];
        $tenant->save();

        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'phone_number' => null,
        ]);

        $response = $this->post('/twilio/inbound?flow_id='.$flow->id, [
            'CallSid' => 'CA'.str_repeat('3', 32),
            'From' => '+15559876543',
            'To' => '+15551234567',
            'flow_id' => $flow->id,
        ]);

        $response->assertOk();
        $content = $response->getContent();

        $expectedAction = TwilioPublicUrl::to('/twilio/consent-callback').'?flow_id='.urlencode($flow->id);
        $this->assertStringContainsString('action="'.$expectedAction.'"', $content);
        $this->assertStringContainsString('<Gather', $content);
    }

    public function test_consent_resolves_tenant_from_from_number_on_test_call(): void
    {
        $tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551112222'],
        ]);
        $tenant->data_protection = [
            'consent_required' => true,
            'consent_message' => 'Recording disclosure.',
        ];
        $tenant->save();

        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'phone_number' => null,
        ]);

        $response = $this->post('/twilio/inbound?flow_id='.$flow->id, [
            'CallSid' => 'CA'.str_repeat('4', 32),
            'From' => '+15551112222',
            'To' => '+19998887777',
            'flow_id' => $flow->id,
        ]);

        $response->assertOk();
        $this->assertStringContainsString('<Gather', $response->getContent());
        $this->assertStringContainsString('Recording disclosure.', $response->getContent());
    }

    public function test_language_backfill_migration_normalizes_en_to_en_us(): void
    {
        $tenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'language' => 'en-US',
        ]);

        DB::table('flows')->where('id', $flow->id)->update(['language' => 'en']);
        $this->assertSame('en', DB::table('flows')->where('id', $flow->id)->value('language'));

        DB::table('migrations')
            ->where('migration', '2026_08_03_083627_normalize_flows_language_to_bcp47')
            ->delete();

        $this->artisan('migrate', [
            '--path' => 'database/migrations/2026_08_03_083627_normalize_flows_language_to_bcp47.php',
            '--force' => true,
        ])->assertSuccessful();

        $this->assertSame('en-US', FlowModel::query()->find($flow->id)?->language);
    }

    public function test_ask_gather_action_is_absolute(): void
    {
        $tenant = TenantFactory::new()->create();

        FlowModelFactory::new()
            ->withPhone('+14155551003')
            ->create([
                'tenant_id' => $tenant->id,
                'config' => [
                    'start_step' => 'ask',
                    'steps' => [
                        'ask' => [
                            'id' => 'ask',
                            'type' => 'ask',
                            'config' => ['prompt' => 'Press 1', 'num_digits' => 1],
                            'next' => 'hangup',
                        ],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('5', 32),
            'From' => '+15551234567',
            'To' => '+14155551003',
        ]);

        $response->assertOk();
        $this->assertStringContainsString(
            'action="'.TwilioPublicUrl::to('/twilio/step').'"',
            $response->getContent(),
        );
    }
}
