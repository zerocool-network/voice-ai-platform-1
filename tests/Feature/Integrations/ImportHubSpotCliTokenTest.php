<?php

namespace Tests\Feature\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ImportHubSpotCliTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_imports_cli_access_token_into_tenant(): void
    {
        $tenant = TenantModel::factory()->create();
        $configPath = storage_path('framework/testing/hubspot-cli-config.yml');
        if (! is_dir(dirname($configPath))) {
            mkdir(dirname($configPath), 0755, true);
        }

        file_put_contents($configPath, <<<'YAML'
defaultAccount: 149028162
accounts:
  - name: zero-cool-network
    accountId: 149028162
    authType: personalaccesskey
    personalAccessKey: pak-test-key
    auth:
      tokenInfo:
        accessToken: cli-access-token-test
        expiresAt: "2099-01-01T00:00:00.000Z"
YAML);

        Http::fake([
            'api.hubapi.com/account-info/v3/details' => Http::response([
                'portalId' => 149028162,
            ], 200),
        ]);

        $this->artisan('hubspot:import-cli-token', [
            '--tenant' => $tenant->id,
            '--config' => $configPath,
        ])->assertSuccessful();

        $tenant->refresh();
        $connections = app(IntegrationConnectionService::class);
        $this->assertSame(IntegrationStatus::Connected, $connections->status($tenant, IntegrationProvider::HubSpot));
        $view = $connections->publicView($tenant, IntegrationProvider::HubSpot);
        $this->assertSame('149028162', (string) ($view['portal_id'] ?? ''));
        $this->assertSame('hubspot_cli', $view['auth_source'] ?? null);
    }
}
