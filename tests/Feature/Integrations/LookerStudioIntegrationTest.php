<?php

namespace Tests\Feature\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LookerStudioIntegrationTest extends TestCase
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

    public function test_generate_connector_token(): void
    {
        $this->actingAs($this->user)
            ->post(route('settings.integrations.looker-studio.connect'))
            ->assertRedirect(route('settings.integrations.looker-studio'))
            ->assertSessionHas('success')
            ->assertSessionHas('looker_studio_plain_token');

        $this->tenant->refresh();
        $looker = $this->tenant->settings['integrations']['looker_studio'];
        $this->assertSame(IntegrationStatus::Connected->value, $looker['status']);
        $this->assertNotEmpty($looker['connector_token_hash']);
    }

    public function test_disconnect_looker_studio(): void
    {
        app(IntegrationConnectionService::class)->put($this->tenant, IntegrationProvider::LookerStudio, [
            'status' => IntegrationStatus::Connected->value,
            'connector_token_hash' => 'hash',
        ]);

        $this->actingAs($this->user)
            ->post(route('settings.integrations.looker-studio.disconnect'))
            ->assertRedirect(route('settings.integrations.looker-studio'));

        $this->tenant->refresh();
        $this->assertArrayNotHasKey('looker_studio', $this->tenant->settings['integrations'] ?? []);
    }

    public function test_analytics_studio_page_renders(): void
    {
        $this->actingAs($this->user)
            ->get(route('analytics.studio'))
            ->assertOk();
    }
}
