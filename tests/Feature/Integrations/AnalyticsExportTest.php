<?php

namespace Tests\Feature\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Database\Factories\CallModelFactory;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AnalyticsExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_requires_valid_bearer_token(): void
    {
        /** @var TenantModel $tenant */
        $tenant = TenantFactory::new()->create();
        CallModelFactory::new()->create([
            'tenant_id' => $tenant->id,
            'from_number' => '+15550001111',
            'to_number' => '+15550002222',
            'status' => 'completed',
        ]);

        $plain = 'ls_test_token_value_1234567890';
        app(IntegrationConnectionService::class)->put($tenant, IntegrationProvider::LookerStudio, [
            'status' => IntegrationStatus::Connected->value,
            'connector_token_hash' => Hash::make($plain),
        ]);

        $this->getJson(route('api.v1.analytics.export', ['tenant_id' => $tenant->id]))
            ->assertUnauthorized();

        $this->withToken($plain)
            ->getJson(route('api.v1.analytics.export', ['tenant_id' => $tenant->id]))
            ->assertOk()
            ->assertJsonStructure([
                'schema',
                'rows',
                'next_cursor',
            ])
            ->assertJsonPath('rows.0.from', '+15550001111');
    }
}
