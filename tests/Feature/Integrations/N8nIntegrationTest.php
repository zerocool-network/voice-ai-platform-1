<?php

namespace Tests\Feature\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class N8nIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'owner',
        ]);
    }

    public function test_owner_can_connect_n8n_after_successful_test(): void
    {
        Http::fake([
            'https://demo.app.n8n.cloud/api/v1/workflows*' => Http::response(['data' => []], 200),
        ]);

        $this->actingAs($this->user)
            ->post(route('settings.integrations.n8n.connect'), [
                'mode' => 'cloud',
                'base_url' => 'https://demo.app.n8n.cloud/api/v1',
                'api_key' => 'n8n-api-key-123456',
            ])
            ->assertRedirect(route('settings.integrations.n8n'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $this->assertSame(
            IntegrationStatus::Connected->value,
            $this->tenant->settings['integrations']['n8n']['status']
        );
    }

    public function test_connect_fails_when_api_rejects_key(): void
    {
        Http::fake([
            'https://demo.app.n8n.cloud/api/v1/workflows*' => Http::response(['message' => 'unauthorized'], 401),
        ]);

        $this->actingAs($this->user)
            ->post(route('settings.integrations.n8n.connect'), [
                'mode' => 'cloud',
                'base_url' => 'https://demo.app.n8n.cloud/api/v1',
                'api_key' => 'bad-key-123456',
            ])
            ->assertRedirect(route('settings.integrations.n8n'))
            ->assertSessionHas('error');
    }

    public function test_inbound_webhook_requires_valid_signature(): void
    {
        $connections = app(IntegrationConnectionService::class);
        $secret = 'webhook-secret-value';
        $connections->put($this->tenant, IntegrationProvider::N8n, [
            'webhook_secret' => $secret,
            'status' => IntegrationStatus::Connected->value,
        ]);

        $body = json_encode(['event' => 'workflow.finished']);
        $signature = hash_hmac('sha256', $body, $secret);

        $this->call(
            'POST',
            route('webhooks.n8n', ['tenant' => $this->tenant->id]),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_VOICE_SIGNATURE' => $signature,
            ],
            $body
        )->assertOk();

        $this->call(
            'POST',
            route('webhooks.n8n', ['tenant' => $this->tenant->id]),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_VOICE_SIGNATURE' => 'invalid',
            ],
            $body
        )->assertUnauthorized();
    }

    public function test_integrations_index_renders(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.index'))
            ->assertOk();
    }
}
