<?php

namespace App\Http\Controllers\Web\Integrations\HubSpot;

use App\Enums\HubSpotConsoleModule;
use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Http\Requests\Integrations\HubSpot\UpdateHubSpotSyncRequest;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Jobs\Integrations\SyncCallToHubSpotJob;
use App\Services\Integrations\HubSpot\HubSpotModuleService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HubSpotVoiceSyncController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotModuleService $modules,
        private readonly HubSpotConsoleController $console,
    ) {}

    public function show(Request $request): Response
    {
        Gate::authorize('viewHubSpot');

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $integration = $this->connections->publicView($tenant, IntegrationProvider::HubSpot);
        $voice = $this->modules->fetch($tenant, HubSpotConsoleModule::VoiceSync);

        $recentCalls = CallModel::query()
            ->where('tenant_id', $tenant->id)
            ->latest('id')
            ->limit(20)
            ->get(['id', 'call_sid', 'from_number', 'to_number', 'status', 'started_at', 'duration_seconds']);

        return Inertia::render('Settings/Integrations/HubSpot/Voice/SyncWizard', [
            'integration' => $integration,
            'voice' => $voice['data'] ?? [],
            'recent_calls' => $recentCalls,
            'api_meta' => [
                'ok' => $voice['ok'],
                'error' => $voice['error'],
                'missing_scope' => $voice['missing_scope'],
                'rate_limited' => $voice['rate_limited'],
            ],
            'nav' => $this->console->navigation(),
        ]);
    }

    public function update(UpdateHubSpotSyncRequest $request): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->connections->put($tenant, IntegrationProvider::HubSpot, [
            'sync' => $request->validated(),
        ]);

        return back()->with('success', 'Voice sync settings saved.');
    }

    public function syncCall(Request $request, string $callId): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $call = CallModel::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $callId)
            ->firstOrFail();

        SyncCallToHubSpotJob::dispatch($tenant->id, $call->id);

        return back()->with('success', 'Call queued for HubSpot sync.');
    }
}
