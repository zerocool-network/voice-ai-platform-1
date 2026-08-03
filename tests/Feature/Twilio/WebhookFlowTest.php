<?php

namespace Tests\Feature\Twilio;

use App\Application\Call\DTOs\InboundCallData;
use App\Application\Call\UseCases\HandleInboundCall;
use App\Application\Flow\Services\TwilioPublicUrl;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Http\Middleware\ValidateTwilioRequest;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Jobs\DownloadAndEncryptRecording;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class WebhookFlowTest extends TestCase
{
    use RefreshDatabase;

    private FlowModel $flow;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(AiServiceInterface::class, new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                return 'Mock AI response.';
            }
        });

        $this->withoutMiddleware(ValidateTwilioRequest::class);

        $tenant = TenantFactory::new()->create();

        $this->flow = FlowModelFactory::new()
            ->withPhone('+14159309192')
            ->create([
                'tenant_id' => $tenant->id,
            ]);
    }

    public function test_inbound_returns_start_step_say(): void
    {
        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('a', 32),
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response->assertOk();
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));
        // Twilio 12100: body must start with <?xml (no leading blank line)
        $this->assertMatchesRegularExpression('/^<\?xml/', $response->getContent());
        $response->assertSee('<Say', false);
        $response->assertSee('language="en-US"', false);
        $response->assertSee('voice="Polly.Joanna"', false);
        $response->assertSee('Hello from AI Voice Platform', false);
        $response->assertSee('<Redirect>'.TwilioPublicUrl::to('/twilio/step').'</Redirect>', false);
    }

    public function test_inbound_uses_spanish_language_and_polly_lucia_voice(): void
    {
        $this->flow->update(['language' => 'es-ES']);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('e', 32),
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response->assertOk();
        $response->assertSee('language="es-ES"', false);
        $response->assertSee('voice="Polly.Lucia"', false);
    }

    public function test_inbound_returns_not_configured_for_missing_flow(): void
    {
        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('b', 32),
            'From' => '+15551234567',
            'To' => '+19999999999',
        ]);

        $response->assertOk();
        $response->assertSee('not configured', false);
        $response->assertSee('<Hangup/>', false);
    }

    public function test_inbound_returns_not_configured_for_inactive_flow(): void
    {
        FlowModelFactory::new()
            ->inactive()
            ->withPhone('+14155559999')
            ->create(['tenant_id' => $this->flow->tenant_id]);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('c', 32),
            'From' => '+15551234567',
            'To' => '+14155559999',
        ]);

        $response->assertOk();
        $response->assertSee('not configured', false);
    }

    public function test_inbound_executes_use_case(): void
    {
        $callSid = 'CA'.str_repeat('d', 32);

        $useCase = $this->app->make(HandleInboundCall::class);
        $data = new InboundCallData(
            callSid: $callSid,
            fromNumber: '+15551234567',
            toNumber: '+14159309192',
        );

        $call = $useCase->execute($data);

        $this->assertNotNull($call);
        $this->assertSame('in_progress', $call->status());
        $this->assertSame($this->flow->id, $call->getFlowId());
    }

    public function test_inbound_creates_call_record(): void
    {
        $callSid = 'CA'.str_repeat('e', 32);

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $content = $response->getContent();
        $this->assertStringNotContainsString('not configured', $content ?? '');
        $this->assertStringContainsString('<Say', $content ?? '');
        $this->assertStringContainsString('Hello from AI Voice Platform', $content ?? '');

        $this->assertDatabaseHas('calls', [
            'call_sid' => $callSid,
            'flow_id' => $this->flow->id,
            'current_step' => 's1',
            'status' => 'in_progress',
        ]);
    }

    public function test_step_advances_to_hangup(): void
    {
        $callSid = 'CA'.str_repeat('f', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
        ]);

        $response->assertOk();
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));
        $response->assertSee('<Hangup/>', false);

        $this->assertDatabaseHas('calls', [
            'call_sid' => $callSid,
            'current_step' => 'hangup',
        ]);
    }

    public function test_step_returns_not_configured_for_unknown_call(): void
    {
        $response = $this->post('/twilio/step', [
            'CallSid' => 'CA'.str_repeat('a', 32),
        ]);

        $response->assertOk();
        $response->assertSee('not configured', false);
    }

    public function test_gather_routes_by_digits(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550001')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 'confirm',
                    'steps' => [
                        'confirm' => [
                            'id' => 'confirm',
                            'type' => 'gather',
                            'config' => [
                                'num_digits' => 1,
                                'timeout' => 5,
                                'text' => 'Press 1 for sales, 2 for support',
                                'options' => [
                                    '1' => 'sales',
                                    '2' => 'support',
                                ],
                            ],
                            'next' => 'hangup',
                        ],
                        'sales' => ['id' => 'sales', 'type' => 'say', 'config' => ['text' => 'Connecting to sales'], 'next' => 'hangup'],
                        'support' => ['id' => 'support', 'type' => 'say', 'config' => ['text' => 'Connecting to support'], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550001',
        ]);

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
            'Digits' => '1',
        ]);

        $response->assertOk();
        $response->assertSee('Connecting to sales', false);

        $this->assertDatabaseHas('calls', [
            'call_sid' => $callSid,
            'current_step' => 'sales',
        ]);
    }

    public function test_full_ivr_flow_execution(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550002')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 'welcome',
                    'steps' => [
                        'welcome' => ['id' => 'welcome', 'type' => 'say', 'config' => ['text' => 'Welcome'], 'next' => 'ask'],
                        'ask' => ['id' => 'ask', 'type' => 'gather', 'config' => ['num_digits' => 1, 'timeout' => 5, 'text' => 'Press 1 to continue'], 'next' => 'goodbye'],
                        'goodbye' => ['id' => 'goodbye', 'type' => 'say', 'config' => ['text' => 'Goodbye'], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA'.str_repeat('b', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550002',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'welcome']);

        $this->post('/twilio/step', ['CallSid' => $callSid]);
        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'ask']);

        $this->post('/twilio/step', ['CallSid' => $callSid, 'Digits' => '1']);
        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'goodbye']);

        $this->post('/twilio/step', ['CallSid' => $callSid]);
        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'hangup']);
    }

    public function test_legacy_gather_route_works(): void
    {
        $callSid = 'CA'.str_repeat('c', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response = $this->post('/twilio/gather', [
            'CallSid' => $callSid,
        ]);

        $response->assertOk();
        $response->assertSee('<Hangup/>', false);
    }

    public function test_condition_step_routes_to_branch(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550010')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 'cond',
                    'steps' => [
                        'cond' => [
                            'id' => 'cond',
                            'type' => 'condition',
                            'config' => [
                                'branches' => [
                                    ['label' => 'Yes', 'expression' => '', 'next' => 'branch_yes'],
                                ],
                                'elseNext' => 'branch_no',
                            ],
                            'next' => 'branch_no',
                        ],
                        'branch_yes' => ['id' => 'branch_yes', 'type' => 'say', 'config' => ['text' => 'You chose yes'], 'next' => 'hangup'],
                        'branch_no' => ['id' => 'branch_no', 'type' => 'say', 'config' => ['text' => 'You chose no'], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA10000000000000000000000000000001';

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550010',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'cond']);

        $response = $this->post('/twilio/step', ['CallSid' => $callSid]);

        $response->assertOk();
        $this->assertStringContainsString('You chose yes', $response->getContent() ?: '');
        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 'branch_yes']);
    }

    public function test_goto_step_jumps_to_target(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550011')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => ['id' => 's1', 'type' => 'goto', 'config' => ['target' => 's3'], 'next' => 's3'],
                        's2' => ['id' => 's2', 'type' => 'say', 'config' => ['text' => 'Skipped'], 'next' => 'hangup'],
                        's3' => ['id' => 's3', 'type' => 'say', 'config' => ['text' => 'Jumped to s3'], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA20000000000000000000000000000002';

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550011',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 's1']);

        $response = $this->post('/twilio/step', ['CallSid' => $callSid]);

        $response->assertOk();
        $this->assertStringContainsString('Jumped to s3', $response->getContent() ?: '');
        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 's3']);
    }

    public function test_transfer_step_dials_number(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550012')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => ['id' => 's1', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '+15551234567']],
                    ],
                ],
            ]);

        $callSid = 'CA30000000000000000000000000000003';

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550012',
        ]);

        $response->assertOk();
        $this->assertStringContainsString('<Dial>+15551234567</Dial>', $response->getContent() ?: '');
    }

    public function test_ask_speech_step_returns_gather_with_input_speech(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550013')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => ['id' => 's1', 'type' => 'ask', 'config' => ['prompt' => 'Say your name', 'inputType' => 'speech', 'timeoutSec' => 10], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA40000000000000000000000000000004';

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550013',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('input="speech"', $content);
        $this->assertStringContainsString('timeout="10"', $content);
        $this->assertStringContainsString('Say your name', $content);
        $this->assertStringContainsString('<Say', $content);
    }

    public function test_llm_step_with_mocked_ai(): void
    {
        $this->app->instance(AiServiceInterface::class, new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                return 'AI-powered greeting.';
            }
        });

        $flow = FlowModelFactory::new()
            ->withPhone('+14155550014')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 's1',
                    'steps' => [
                        's1' => ['id' => 's1', 'type' => 'llm', 'config' => ['systemPrompt' => 'You are a bot', 'temperature' => 0.5], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA50000000000000000000000000000005';

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550014',
        ]);

        $response->assertOk();
        $this->assertStringContainsString('AI-powered greeting.', $response->getContent() ?: '');
    }

    public function test_status_marks_call_completed(): void
    {
        $callSid = 'CA'.str_repeat('d', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'status' => 'in_progress']);

        $this->post('/twilio/status', [
            'CallSid' => $callSid,
            'CallStatus' => 'completed',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'status' => 'completed']);
    }

    public function test_inbound_without_call_sid_returns_not_configured(): void
    {
        $response = $this->post('/twilio/inbound', [
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response->assertOk();
        $response->assertSee('not configured', false);
    }

    public function test_inbound_without_from_number_still_creates_call(): void
    {
        $response = $this->post('/twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('9', 32),
            'To' => '+14159309192',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('<Say', $content);
        $this->assertStringNotContainsString('not configured', $content);
    }

    public function test_step_returns_not_configured_without_current_step(): void
    {
        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'current_step' => 's1']);

        $callModel = CallModel::where('call_sid', $callSid)->first();
        $callModel->update(['current_step' => null]);

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
        ]);

        $response->assertOk();
        $response->assertSee('not configured', false);
    }

    public function test_step_with_digits_on_non_gather_step_proceeds_normally(): void
    {
        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response = $this->post('/twilio/step', [
            'CallSid' => $callSid,
            'Digits' => '5',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringNotContainsString('not configured', $content);
    }

    public function test_gather_without_prompt_still_returns_valid_twiml(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550020')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 'ask_step',
                    'steps' => [
                        'ask_step' => ['id' => 'ask_step', 'type' => 'gather', 'config' => ['num_digits' => 1], 'next' => 'hangup'],
                        'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
                    ],
                ],
            ]);

        $callSid = 'CA60000000000000000000000000000006';

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550020',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('<Gather', $content);
        $this->assertStringContainsString('numDigits="1"', $content);
    }

    public function test_status_with_failed_marks_call_completed(): void
    {
        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->post('/twilio/status', [
            'CallSid' => $callSid,
            'CallStatus' => 'failed',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'status' => 'completed']);
    }

    public function test_status_with_busy_marks_call_completed(): void
    {
        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->post('/twilio/status', [
            'CallSid' => $callSid,
            'CallStatus' => 'busy',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'status' => 'completed']);
    }

    public function test_status_with_no_answer_marks_call_completed(): void
    {
        $callSid = 'CA'.str_repeat('a', 32);

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->post('/twilio/status', [
            'CallSid' => $callSid,
            'CallStatus' => 'no-answer',
        ]);

        $this->assertDatabaseHas('calls', ['call_sid' => $callSid, 'status' => 'completed']);
    }

    public function test_gather_step_with_next_null_returns_hangup(): void
    {
        $flow = FlowModelFactory::new()
            ->withPhone('+14155550021')
            ->create([
                'tenant_id' => $this->flow->tenant_id,
                'config' => [
                    'start_step' => 'ask_step',
                    'steps' => [
                        'ask_step' => ['id' => 'ask_step', 'type' => 'gather', 'config' => ['num_digits' => 1]],
                    ],
                ],
            ]);

        $callSid = 'CA70000000000000000000000000000007';

        $response = $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14155550021',
        ]);

        $response->assertOk();
        $content = $response->getContent() ?? '';
        $this->assertStringContainsString('<Gather', $content);
        $this->assertStringContainsString('<Redirect>', $content);
    }

    public function test_recording_callback_stores_recording_info(): void
    {
        Bus::fake([DownloadAndEncryptRecording::class]);

        $callSid = 'CA80000000000000000000000000000001';
        $recordingSid = 'RE80000000000000000000000000000001';
        $recordingUrl = 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Recordings/RE80000000000000000000000000000001';

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $call = CallModel::where('call_sid', $callSid)->firstOrFail();

        $this->post('/twilio/recording', [
            'CallSid' => $callSid,
            'RecordingSid' => $recordingSid,
            'RecordingUrl' => $recordingUrl,
            'RecordingStatus' => 'completed',
        ]);

        $this->assertDatabaseHas('calls', [
            'call_sid' => $callSid,
            'recording_sid' => $recordingSid,
            'recording_url' => $recordingUrl,
        ]);

        Bus::assertDispatched(DownloadAndEncryptRecording::class, function (DownloadAndEncryptRecording $job) use ($call, $recordingUrl) {
            return $job->call->is($call) && $job->recordingUrl === $recordingUrl;
        });
    }

    public function test_recording_callback_ignores_non_completed(): void
    {
        $callSid = 'CA80000000000000000000000000000002';

        $this->post('/twilio/inbound', [
            'CallSid' => $callSid,
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $this->post('/twilio/recording', [
            'CallSid' => $callSid,
            'RecordingSid' => 'RE80000000000000000000000000000002',
            'RecordingUrl' => 'https://api.twilio.com/recording',
            'RecordingStatus' => 'in-progress',
        ]);

        $this->assertDatabaseMissing('calls', [
            'call_sid' => $callSid,
            'recording_sid' => 'RE80000000000000000000000000000002',
        ]);
    }

    public function test_recording_callback_ignores_missing_call(): void
    {
        $this->post('/twilio/recording', [
            'CallSid' => 'CA_MISSING_00000000000000000000000001',
            'RecordingSid' => 'RE_MISSING_00000000000000000000000001',
            'RecordingUrl' => 'https://api.twilio.com/recording',
            'RecordingStatus' => 'completed',
        ]);

        $this->assertDatabaseMissing('calls', [
            'call_sid' => 'CA_MISSING_00000000000000000000000001',
        ]);
    }
}
