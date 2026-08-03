<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\HubSpot\HubSpotWebhookEventModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotWebhookSignature;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HubSpotWebhookController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotWebhookSignature $signatures,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $clientSecret = (string) config('hubspot.client_secret', '');
        if (! $this->signatures->isValid($request, $clientSecret)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

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

        $config = $this->connections->get($tenant, IntegrationProvider::HubSpot);
        if (($config['status'] ?? null) !== 'connected') {
            return response()->json(['message' => 'Not connected'], 422);
        }

        $eventList = array_is_list($events) ? $events : [$events];
        foreach ($eventList as $event) {
            if (! is_array($event)) {
                continue;
            }

            HubSpotWebhookEventModel::create([
                'tenant_id' => $tenant->id,
                'portal_id' => $portalId,
                'subscription_type' => (string) ($event['subscriptionType'] ?? $event['subscription_type'] ?? ''),
                'object_id' => isset($event['objectId']) ? (string) $event['objectId'] : null,
                'payload' => $event,
                'processed_at' => now(),
            ]);
        }

        Log::info('HubSpot webhook received', [
            'tenant_id' => $tenant->id,
            'portal_id' => $portalId,
            'count' => count($eventList),
        ]);

        activity()
            ->event('hubspot_webhook_received')
            ->performedOn($tenant)
            ->withProperties(['portal_id' => $portalId])
            ->log('HubSpot webhook received');

        return response()->json(['ok' => true]);
    }
}
