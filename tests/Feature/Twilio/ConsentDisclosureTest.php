<?php

namespace Tests\Feature\Twilio;

use App\Http\Middleware\ValidateTwilioRequest;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsentDisclosureTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateTwilioRequest::class);

        $this->tenant = TenantFactory::new()->create([
            'settings' => ['twilio_phone_number' => '+15551234567'],
        ]);
        $this->tenant->data_protection = [
            'consent_required' => true,
            'retention_days' => 90,
            'consent_message' => 'This call may be recorded.',
            'consent_recordings' => true,
            'consent_transcripts' => true,
        ];
        $this->tenant->save();

        FlowModelFactory::new()
            ->withPhone('+15551234567')
            ->create(['tenant_id' => $this->tenant->id]);
    }

    public function test_inbound_call_with_consent_required_returns_gather_twiml(): void
    {
        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('0', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
        ]);

        $response->assertStatus(200);
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));
        $content = $response->getContent();

        $this->assertStringContainsString('<Gather', $content);
        $this->assertStringContainsString('This call may be recorded.', $content);
        $this->assertStringContainsString('language="en-US"', $content);
        $this->assertStringContainsString('voice="Polly.Joanna"', $content);
        $this->assertStringContainsString('<Hangup', $content);
    }

    public function test_inbound_consent_uses_spanish_voice_when_flow_language_is_es(): void
    {
        FlowModel::query()
            ->where('phone_number', '+15551234567')
            ->update(['language' => 'es-ES']);

        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('a', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
        ]);

        $response->assertStatus(200);
        $content = $response->getContent();

        $this->assertStringContainsString('<Gather', $content);
        $this->assertStringContainsString('language="es-ES"', $content);
        $this->assertStringContainsString('voice="Polly.Lucia"', $content);
    }

    public function test_inbound_call_without_consent_required_skips_gather(): void
    {
        $this->tenant->data_protection = array_merge(
            $this->tenant->data_protection ?? [],
            ['consent_required' => false]
        );
        $this->tenant->save();

        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('1', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
        ]);

        $content = $response->getContent();
        $this->assertStringNotContainsString('<Gather', $content);
    }

    public function test_consent_callback_with_digit_1_proceeds_to_flow(): void
    {
        $response = $this->post('twilio/consent-callback', [
            'CallSid' => 'CA'.str_repeat('2', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
            'Digits' => '1',
        ]);

        $response->assertStatus(200);
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));

        $this->assertDatabaseHas('activity_log', [
            'event' => 'consent_granted',
        ]);
    }

    public function test_consent_callback_with_other_digit_hangs_up(): void
    {
        $response = $this->post('twilio/consent-callback', [
            'CallSid' => 'CA'.str_repeat('3', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
            'Digits' => '2',
        ]);

        $response->assertStatus(200);
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));
        $content = $response->getContent();
        $this->assertStringContainsString('Goodbye', $content);
        $this->assertStringContainsString('language="en-US"', $content);
        $this->assertStringContainsString('voice="Polly.Joanna"', $content);
        $this->assertStringContainsString('<Hangup', $content);

        $this->assertDatabaseHas('activity_log', [
            'event' => 'consent_declined',
        ]);
    }

    public function test_empty_data_protection_uses_defaults(): void
    {
        $this->tenant->data_protection = null;
        $this->tenant->save();

        $response = $this->post('twilio/inbound', [
            'CallSid' => 'CA'.str_repeat('4', 32),
            'From' => '+1234567890',
            'To' => '+15551234567',
        ]);

        $content = $response->getContent();
        $this->assertStringNotContainsString('<Gather', $content);
    }
}
