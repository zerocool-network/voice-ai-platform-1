<?php

namespace App\Jobs\Integrations;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncCallToHubSpotJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $tenantId,
        public string $callId,
    ) {}

    public function handle(HubSpotSyncService $sync): void
    {
        $tenant = TenantModel::find($this->tenantId);
        $call = CallModel::find($this->callId);

        if ($tenant === null || $call === null) {
            return;
        }

        $sync->syncCall($tenant, $call);
    }
}
