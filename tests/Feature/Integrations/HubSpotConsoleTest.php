<?php

namespace Tests\Feature\Integrations;

use App\Enums\HubSpotObjectType;
use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HubSpotConsoleTest extends TestCase
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
            'hubspot.api_base' => 'https://api.hubapi.com',
        ]);
        $this->tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'owner',
        ]);
    }

    public function test_overview_renders_console_shell(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Integrations/HubSpot/Overview')
                ->has('nav')
                ->has('object_types')
                ->has('scopes.required')
            );
    }

    public function test_contacts_index_soft_fails_when_disconnected(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.objects.index', 'contacts'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Integrations/HubSpot/Crm/ObjectIndex')
                ->where('object_type.slug', 'contacts')
            );
    }

    public function test_contacts_index_loads_records_when_connected(): void
    {
        $this->connectHubSpot();

        Http::fake([
            'api.hubapi.com/crm/v3/objects/contacts*' => Http::response([
                'results' => [
                    ['id' => '1', 'properties' => ['firstname' => 'Ada', 'lastname' => 'Lovelace', 'email' => 'ada@example.com']],
                ],
                'paging' => null,
            ]),
            'api.hubapi.com/crm/v3/properties/contacts*' => Http::response([
                'results' => [
                    ['name' => 'email', 'label' => 'Email', 'type' => 'string'],
                ],
            ]),
        ]);

        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.objects.index', 'contacts'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Integrations/HubSpot/Crm/ObjectIndex')
                ->where('api_meta.ok', true)
                ->has('records.results', 1)
            );
    }

    public function test_create_contact_requires_manage_and_validates(): void
    {
        $this->connectHubSpot();

        $this->actingAs($this->user)
            ->post(route('settings.integrations.hubspot.objects.store', 'contacts'), [])
            ->assertSessionHasErrors('properties');
    }

    public function test_create_contact_posts_to_hubspot(): void
    {
        $this->connectHubSpot();

        Http::fake([
            'api.hubapi.com/crm/v3/objects/contacts' => Http::response([
                'id' => '99',
                'properties' => ['email' => 'new@example.com'],
            ], 201),
        ]);

        $this->actingAs($this->user)
            ->post(route('settings.integrations.hubspot.objects.store', 'contacts'), [
                'properties' => ['email' => 'new@example.com', 'firstname' => 'New'],
            ])
            ->assertRedirect(route('settings.integrations.hubspot.objects.show', ['contacts', '99']));
    }

    public function test_module_page_conversations_renders(): void
    {
        $this->connectHubSpot();

        Http::fake([
            'api.hubapi.com/conversations/v3/conversations/threads*' => Http::response([
                'results' => [['id' => 'thread-1', 'status' => 'OPEN']],
            ]),
        ]);

        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.modules.show', 'conversations'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Integrations/HubSpot/ModulePage')
                ->where('module.key', 'conversations')
            );
    }

    public function test_voice_sync_page_renders(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.voice-sync'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Integrations/HubSpot/Voice/SyncWizard')
            );
    }

    public function test_agent_cannot_mutate_hubspot(): void
    {
        $agent = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'agent',
        ]);
        $this->connectHubSpot();

        $this->actingAs($agent)
            ->post(route('settings.integrations.hubspot.objects.store', 'contacts'), [
                'properties' => ['email' => 'x@example.com'],
            ])
            ->assertForbidden();
    }

    public function test_unknown_object_type_returns_404(): void
    {
        $this->actingAs($this->user)
            ->get(route('settings.integrations.hubspot.objects.index', 'not-a-real-type'))
            ->assertNotFound();
    }

    public function test_all_object_types_are_registered(): void
    {
        $this->assertGreaterThanOrEqual(30, count(HubSpotObjectType::cases()));
    }

    public function test_webhook_persists_event_rows(): void
    {
        config(['hubspot.client_secret' => 'test-secret']);
        $this->connectHubSpot('12345');

        $body = json_encode([[
            'portalId' => 12345,
            'subscriptionType' => 'contact.creation',
            'objectId' => 77,
        ]], JSON_THROW_ON_ERROR);

        $signature = hash('sha256', 'test-secret'.$body);

        $this->call(
            'POST',
            route('webhooks.hubspot'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUBSPOT_SIGNATURE' => $signature,
                'HTTP_X_HUBSPOT_SIGNATURE_VERSION' => 'v1',
            ],
            $body
        )->assertOk();

        $this->assertDatabaseHas('hubspot_webhook_events', [
            'tenant_id' => $this->tenant->id,
            'portal_id' => '12345',
            'object_id' => '77',
        ]);
    }

    private function connectHubSpot(string $portalId = '12345'): void
    {
        app(IntegrationConnectionService::class)->put($this->tenant, IntegrationProvider::HubSpot, [
            'status' => IntegrationStatus::Connected->value,
            'portal_id' => $portalId,
            'scopes' => config('hubspot.scopes'),
            'auth_source' => 'oauth',
            'oauth' => [
                'access_token' => 'hs-access',
                'refresh_token' => 'hs-refresh',
                'expires_at' => now()->addHour()->timestamp,
            ],
            'sync' => [
                'create_contact' => true,
                'log_call_engagement' => true,
                'create_ticket_on_transfer' => false,
            ],
        ]);
    }
}
