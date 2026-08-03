<?php

namespace App\Console\Commands\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Yaml\Yaml;

class ImportHubSpotCliTokenCommand extends Command
{
    protected $signature = 'hubspot:import-cli-token
                            {--tenant=00000000-0000-0000-0000-000000000001 : Tenant UUID to connect}
                            {--config= : Path to HubSpot CLI config.yml (default ~/.hscli/config.yml)}';

    protected $description = 'Import HubSpot CLI access token into a tenant (local/dev when OAuth app Client ID is unavailable)';

    public function handle(IntegrationConnectionService $connections): int
    {
        $configPath = $this->option('config') ?: (($_SERVER['HOME'] ?? getenv('HOME') ?: '').'/.hscli/config.yml');
        if ($configPath === '' || ! File::isReadable($configPath)) {
            $this->error('HubSpot CLI config not found: '.$configPath);

            return self::FAILURE;
        }

        /** @var array<string, mixed> $cfg */
        $cfg = Yaml::parseFile($configPath) ?: [];
        $accounts = $cfg['accounts'] ?? [];
        if (! is_array($accounts) || $accounts === []) {
            $this->error('No HubSpot accounts in CLI config.');

            return self::FAILURE;
        }

        $defaultName = $cfg['defaultAccount'] ?? null;
        $account = null;
        foreach ($accounts as $candidate) {
            if (! is_array($candidate)) {
                continue;
            }
            if ($defaultName !== null && (string) ($candidate['accountId'] ?? '') === (string) $defaultName) {
                $account = $candidate;
                break;
            }
            if ($defaultName !== null && (string) ($candidate['name'] ?? '') === (string) $defaultName) {
                $account = $candidate;
                break;
            }
        }
        $account ??= is_array($accounts[0] ?? null) ? $accounts[0] : null;
        if ($account === null) {
            $this->error('Unable to resolve HubSpot CLI account.');

            return self::FAILURE;
        }

        $accessToken = data_get($account, 'auth.tokenInfo.accessToken');
        if (! is_string($accessToken) || $accessToken === '') {
            $accessToken = $account['personalAccessKey'] ?? null;
        }
        if (! is_string($accessToken) || $accessToken === '') {
            $this->error('CLI config has no access token / personal access key.');

            return self::FAILURE;
        }

        $portalId = (string) ($account['accountId'] ?? '');
        $probe = Http::withToken($accessToken)->acceptJson()->get('https://api.hubapi.com/account-info/v3/details');
        if (! $probe->successful()) {
            $this->error('HubSpot token rejected by account-info API (HTTP '.$probe->status().'). Re-run: hs account auth');

            return self::FAILURE;
        }

        $portalId = (string) ($probe->json('portalId') ?? $portalId);

        $tenant = TenantModel::find($this->option('tenant'));
        if ($tenant === null) {
            $this->error('Tenant not found: '.$this->option('tenant'));

            return self::FAILURE;
        }

        $connections->put($tenant, IntegrationProvider::HubSpot, [
            'oauth' => [
                'access_token' => $accessToken,
                'refresh_token' => null,
                // CLI tokens are not refreshed via OAuth client; keep long-lived until re-import.
                'expires_at' => now()->addYear()->timestamp,
            ],
            'portal_id' => $portalId,
            'scopes' => [],
            'status' => IntegrationStatus::Connected->value,
            'connected_at' => now()->toIso8601String(),
            'last_error' => null,
            'auth_source' => 'hubspot_cli',
            'sync' => [
                'create_contact' => true,
                'log_call_engagement' => true,
                'create_ticket_on_transfer' => false,
                'property_map' => [],
            ],
        ]);

        $this->info('HubSpot connected for tenant '.$tenant->id.' (portal '.$portalId.', source=hubspot_cli).');
        $this->comment('Platform OAuth Client ID/Secret still needed for multi-tenant Connect button.');

        return self::SUCCESS;
    }
}
