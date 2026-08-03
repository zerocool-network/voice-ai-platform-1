<?php

namespace Tests\Unit\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrationConnectionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_put_encrypts_secrets_and_public_view_strips_them(): void
    {
        /** @var TenantModel $tenant */
        $tenant = TenantFactory::new()->create();
        $service = app(IntegrationConnectionService::class);

        $service->put($tenant, IntegrationProvider::N8n, [
            'api_key' => 'super-secret-key',
            'base_url' => 'https://example.app.n8n.cloud/api/v1',
            'status' => IntegrationStatus::Connected->value,
        ]);

        $tenant->refresh();
        $stored = $tenant->settings['integrations']['n8n'];
        $this->assertNotSame('super-secret-key', $stored['api_key']);
        $this->assertSame('super-secret-key', $service->decryptSecret($stored['api_key']));

        $view = $service->publicView($tenant, IntegrationProvider::N8n);
        $this->assertArrayNotHasKey('api_key', $view);
        $this->assertTrue($view['api_key_set']);
        $this->assertTrue($view['is_connected']);
    }
}
