<?php

namespace App\Http\Controllers\Web\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\Analytics\AnalyticsExportService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class LookerStudioIntegrationController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly AnalyticsExportService $export,
    ) {}

    public function show(Request $request): Response
    {
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return Inertia::render('Settings/Integrations/LookerStudio', [
            'integration' => $this->connections->publicView($tenant, IntegrationProvider::LookerStudio),
            'export_url' => url('/api/v1/analytics/export'),
            'schema' => $this->export->schema(),
            'studio' => $this->export->studioSummary($tenant),
            'platform' => [
                'google_configured' => filled(config('google-oauth.client_id')) && filled(config('google-oauth.client_secret')),
            ],
            'plain_token' => $request->session()->pull('looker_studio_plain_token'),
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $token = $this->connections->generateConnectorToken();

        $this->connections->put($tenant, IntegrationProvider::LookerStudio, [
            'connector_token_hash' => Hash::make($token),
            'status' => IntegrationStatus::Connected->value,
            'connected_at' => now()->toIso8601String(),
            'last_error' => null,
            'bigquery' => [
                'enabled' => false,
                'project_id' => null,
                'dataset' => null,
            ],
        ]);

        activity()
            ->event('looker_studio_connected')
            ->performedOn($tenant)
            ->log('Looker Studio connector enabled');

        $request->session()->flash('looker_studio_plain_token', $token);

        return redirect()->route('settings.integrations.looker-studio')
            ->with('success', 'Looker Studio connector token generated. Copy it now — it will not be shown again.');
    }

    public function rotateToken(Request $request): RedirectResponse
    {
        return $this->connect($request);
    }

    public function disconnect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->connections->clear($tenant, IntegrationProvider::LookerStudio);

        activity()
            ->event('looker_studio_disconnected')
            ->performedOn($tenant)
            ->log('Looker Studio connector disabled');

        return redirect()->route('settings.integrations.looker-studio')
            ->with('success', 'Looker Studio connector disconnected.');
    }

    public function updateBigQuery(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'project_id' => ['nullable', 'string', 'max:128'],
            'dataset' => ['nullable', 'string', 'max:128'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->connections->put($tenant, IntegrationProvider::LookerStudio, [
            'bigquery' => $data,
        ]);

        return redirect()->route('settings.integrations.looker-studio')
            ->with('success', 'BigQuery settings saved.');
    }
}
