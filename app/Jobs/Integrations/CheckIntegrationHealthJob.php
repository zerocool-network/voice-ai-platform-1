<?php

namespace App\Jobs\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotOAuthService;
use App\Services\Integrations\IntegrationConnectionService;
use App\Services\Integrations\N8n\N8nPublicApiClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckIntegrationHealthJob implements ShouldQueue
{
    use Queueable;

    public function handle(
        IntegrationConnectionService $connections,
        HubSpotOAuthService $hubspotOAuth,
    ): void {
        TenantModel::query()->chunkById(50, function ($tenants) use ($connections, $hubspotOAuth): void {
            foreach ($tenants as $tenant) {
                $this->checkN8n($tenant, $connections);
                $this->checkHubSpot($tenant, $connections, $hubspotOAuth);
            }
        });
    }

    private function checkN8n(TenantModel $tenant, IntegrationConnectionService $connections): void
    {
        if ($connections->status($tenant, IntegrationProvider::N8n) === IntegrationStatus::Disconnected) {
            return;
        }

        $config = $connections->get($tenant, IntegrationProvider::N8n);
        $apiKey = $connections->decryptSecret($config['api_key'] ?? null);
        $baseUrl = $config['base_url'] ?? null;

        if (! is_string($apiKey) || ! is_string($baseUrl)) {
            return;
        }

        $result = N8nPublicApiClient::fromConfig($baseUrl, $apiKey)->testConnection();
        $connections->put($tenant, IntegrationProvider::N8n, [
            'status' => $result['ok'] ? IntegrationStatus::Connected->value : IntegrationStatus::Error->value,
            'last_test_at' => now()->toIso8601String(),
            'last_error' => $result['ok'] ? null : 'Health check failed',
        ]);
    }

    private function checkHubSpot(
        TenantModel $tenant,
        IntegrationConnectionService $connections,
        HubSpotOAuthService $hubspotOAuth,
    ): void {
        if ($connections->status($tenant, IntegrationProvider::HubSpot) === IntegrationStatus::Disconnected) {
            return;
        }

        $token = $hubspotOAuth->ensureAccessToken($tenant);
        $connections->put($tenant, IntegrationProvider::HubSpot, [
            'status' => $token !== null ? IntegrationStatus::Connected->value : IntegrationStatus::Error->value,
            'last_error' => $token !== null ? null : 'Health check failed',
        ]);
    }
}
