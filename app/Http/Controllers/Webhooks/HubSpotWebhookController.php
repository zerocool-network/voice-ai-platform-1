<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HubSpotWebhookController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $events = $request->all();
        if (! is_array($events)) {
            return response()->json(['message' => 'Invalid payload'], 422);
        }

        $portalId = (string) data_get($events, '0.portalId', $request->input('portalId'));
        if ($portalId === '') {
            return response()->json(['message' => 'portalId required'], 422);
        }

        $tenant = TenantModel::query()
            ->where('settings->integrations->hubspot->portal_id', $portalId)
            ->first();

        if ($tenant === null) {
            return response()->json(['message' => 'Unknown portal'], 404);
        }

        $config = app(IntegrationConnectionService::class)->get($tenant, IntegrationProvider::HubSpot);
        if (($config['status'] ?? null) !== 'connected') {
            return response()->json(['message' => 'Not connected'], 422);
        }

        Log::info('HubSpot webhook received', [
            'tenant_id' => $tenant->id,
            'portal_id' => $portalId,
            'count' => count($events),
        ]);

        activity()
            ->event('hubspot_webhook_received')
            ->performedOn($tenant)
            ->withProperties(['portal_id' => $portalId])
            ->log('HubSpot webhook received');

        return response()->json(['ok' => true]);
    }
}
