<?php

namespace Tests\Feature\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HubSpotIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private TenantModel $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config([
            'hubspot.client_id' => 'hs-client',
            'hubspot.client_secret' => 'hs-secret',
            'hubspot.redirect_uri' => 'https://app.test/settings/integrations/hubspot/callback',
        ]);
        $this->tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'owner',
        ]);
    }

    public function test_callback_stores_oauth_tokens(): void
    {
        Http::fake([
            'api.hubapi.com/oauth/v1/token' => Http::response([
                'access_token' => 'hs-access',
                'refresh_token' => 'hs-refresh',
                'expires_in' => 21600,
                'scope' => 'crm.objects.contacts.read crm.objects.contacts.write',
            ]),
            'api.hubapi.com/oauth/v1/access-tokens/*' => Http::response([
                'hub_id' => 12345,
            ]),
        ]);

        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'created_at' => now()->timestamp,
        ]));

        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.callback', [
                'code' => 'auth-code',
                'state' => $state,
            ]))
            ->assertRedirect(route('settings.integrations.hubspot'))
            ->assertSessionHas('success');

        $this->tenant->refresh();
        $hubspot = $this->tenant->settings['integrations']['hubspot'];
        $this->assertSame(IntegrationStatus::Connected->value, $hubspot['status']);
        $this->assertSame('12345', $hubspot['portal_id']);
    }

    public function test_disconnect_clears_hubspot_settings(): void
    {
        app(IntegrationConnectionService::class)->put($this->tenant, IntegrationProvider::HubSpot, [
            'status' => IntegrationStatus::Connected->value,
            'portal_id' => '99',
            'oauth' => [
                'access_token' => 'a',
                'refresh_token' => 'r',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        $this->actingAs($this->user)
            ->post(route('settings.integrations.hubspot.disconnect'))
            ->assertRedirect(route('settings.integrations.hubspot'));

        $this->tenant->refresh();
        $this->assertArrayNotHasKey('hubspot', $this->tenant->settings['integrations'] ?? []);
    }

    public function test_hubspot_page_renders(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot'))
            ->assertOk();
    }
}
