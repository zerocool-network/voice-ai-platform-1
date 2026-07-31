<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Database\Factories\FlowModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Assert;
use Tests\TestCase;
use Twilio\Rest\Client;

class FlowTestCallTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = TenantFactory::new()->create([
            'settings' => [],
        ]);
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->user->givePermissionTo('flows.manage');
    }

    public function test_returns_422_when_flow_and_tenant_have_no_phone_number(): void
    {
        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'phone_number' => null,
        ]);

        $response = $this->actingAs($this->user)->postJson("/flows/{$flow->id}/test", [
            'phone_number' => '+15559876543',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'error' => 'No phone number configured for this flow or tenant. Assign one in Flow settings or Tenant Twilio settings.',
        ]);
    }

    public function test_falls_back_to_tenant_twilio_phone_number(): void
    {
        $this->user->tenant->update([
            'settings' => ['twilio_phone_number' => '+15551110001'],
        ]);

        $flow = FlowModelFactory::new()->create([
            'tenant_id' => $this->user->tenant_id,
            'phone_number' => null,
        ]);

        $this->mockTwilioClientExpectingFrom('+15559876543', '+15551110001');

        $response = $this->actingAs($this->user)->postJson("/flows/{$flow->id}/test", [
            'phone_number' => '+15559876543',
        ]);

        $response->assertOk();
        $response->assertJson(['status' => 'call_initiated']);
    }

    public function test_prefers_flow_phone_number_over_tenant(): void
    {
        $this->user->tenant->update([
            'settings' => ['twilio_phone_number' => '+15551110001'],
        ]);

        $flow = FlowModelFactory::new()->withPhone('+15552220002')->create([
            'tenant_id' => $this->user->tenant_id,
        ]);

        $this->mockTwilioClientExpectingFrom('+15559876543', '+15552220002');

        $response = $this->actingAs($this->user)->postJson("/flows/{$flow->id}/test", [
            'phone_number' => '+15559876543',
        ]);

        $response->assertOk();
        $response->assertJson(['status' => 'call_initiated']);
    }

    private function mockTwilioClientExpectingFrom(string $to, string $from): void
    {
        $calls = new class($to, $from)
        {
            public function __construct(
                private string $expectedTo,
                private string $expectedFrom,
            ) {}

            /** @param  array<string, mixed>  $options */
            public function create(string $toNumber, string $fromNumber, array $options = []): object
            {
                Assert::assertSame($this->expectedTo, $toNumber);
                Assert::assertSame($this->expectedFrom, $fromNumber);
                Assert::assertArrayHasKey('twiml', $options);
                Assert::assertArrayHasKey('statusCallback', $options);

                return (object) ['sid' => 'CAtest123'];
            }
        };

        $client = new class($calls)
        {
            public function __construct(public object $calls) {}
        };

        $this->app->instance(Client::class, $client);
    }
}
