<?php

namespace Tests\Feature\Twilio;

use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Twilio\Security\RequestValidator;

class ValidateTwilioRequestTest extends TestCase
{
    use RefreshDatabase;

    private const AUTH_TOKEN = 'test_twilio_auth_token';

    private const PUBLIC_BASE = 'https://voice-ai-platform.hifenix.com';

    private string $flowId;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'twilio.auth_token' => self::AUTH_TOKEN,
            'twilio.webhook_base_url' => self::PUBLIC_BASE,
            'app.url' => 'https://voice-ai-platform.test',
        ]);

        $tenant = TenantFactory::new()->create();
        $flow = FlowModelFactory::new()
            ->withPhone('+14159309192')
            ->create(['tenant_id' => $tenant->id]);

        $this->flowId = $flow->id;
    }

    public function test_accepts_signature_for_public_url_when_host_mismatches(): void
    {
        $path = '/twilio/inbound?flow_id='.$this->flowId;
        $params = [
            'CallSid' => 'CA'.str_repeat('a', 32),
            'From' => '+15551234567',
            'To' => '+14159309192',
        ];

        $signature = $this->sign(self::PUBLIC_BASE.$path, $params);

        $response = $this->call(
            'POST',
            $path,
            $params,
            [],
            [],
            [
                'HTTP_HOST' => 'voice-ai-platform.test',
                'HTTP_X_TWILIO_SIGNATURE' => $signature,
            ],
        );

        $response->assertOk();
        $response->assertSee('<Say', false);
    }

    public function test_rejects_signature_computed_for_wrong_url(): void
    {
        $path = '/twilio/inbound?flow_id='.$this->flowId;
        $params = [
            'CallSid' => 'CA'.str_repeat('b', 32),
            'From' => '+15551234567',
            'To' => '+14159309192',
        ];

        $signature = $this->sign('https://voice-ai-platform.test'.$path, $params);

        $response = $this->call(
            'POST',
            $path,
            $params,
            [],
            [],
            [
                'HTTP_HOST' => 'voice-ai-platform.test',
                'HTTP_X_TWILIO_SIGNATURE' => $signature,
            ],
        );

        $response->assertForbidden();
    }

    public function test_rejects_missing_signature(): void
    {
        $response = $this->post('/twilio/inbound?flow_id='.$this->flowId, [
            'CallSid' => 'CA'.str_repeat('c', 32),
            'From' => '+15551234567',
            'To' => '+14159309192',
        ]);

        $response->assertForbidden();
    }

    /** @param  array<string, string>  $params */
    private function sign(string $url, array $params): string
    {
        return (new RequestValidator(self::AUTH_TOKEN))->computeSignature($url, $params);
    }
}
