<?php

namespace App\Http\Controllers\Web\Integrations;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotOAuthService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Inertia\Response;

class HubSpotIntegrationController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotOAuthService $oauth,
    ) {}

    public function show(Request $request): Response
    {
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return Inertia::render('Settings/Integrations/HubSpot', [
            'integration' => $this->connections->publicView($tenant, IntegrationProvider::HubSpot),
            'platform_configured' => filled(config('hubspot.client_id')) && filled(config('hubspot.client_secret')),
            'scopes' => config('hubspot.scopes', []),
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if (! filled(config('hubspot.client_id')) || ! filled(config('hubspot.client_secret'))) {
            return redirect()->route('settings.integrations.hubspot')
                ->with('error', 'HubSpot app credentials are not configured on this platform. Ask an operator to set HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET.');
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return redirect()->away($this->oauth->authorizationUrl($tenant, $request->user()->id));
    }

    public function callback(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'state' => ['required', 'string'],
        ]);

        try {
            $state = json_decode(Crypt::decryptString($request->input('state')), true);
        } catch (\Throwable) {
            return redirect()->route('settings.integrations.hubspot')
                ->with('error', 'Authorization expired. Please try again.');
        }

        if (($state['tenant_id'] ?? null) !== $request->user()->tenant_id
            || ($state['user_id'] ?? null) !== $request->user()->id) {
            return redirect()->route('settings.integrations.hubspot')
                ->with('error', 'Invalid authorization request.');
        }

        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->oauth->handleCallback($tenant, $request->input('code'));

        if (! $result['ok']) {
            return redirect()->route('settings.integrations.hubspot')
                ->with('error', $result['error'] ?? 'HubSpot authorization failed.');
        }

        activity()
            ->event('hubspot_connected')
            ->performedOn($tenant)
            ->log('HubSpot integration connected');

        return redirect()->route('settings.integrations.hubspot')
            ->with('success', 'HubSpot connected successfully.');
    }

    public function disconnect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->oauth->disconnect($tenant);

        activity()
            ->event('hubspot_disconnected')
            ->performedOn($tenant)
            ->log('HubSpot integration disconnected');

        return redirect()->route('settings.integrations.hubspot')
            ->with('success', 'HubSpot disconnected.');
    }

    public function updateSync(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $data = $request->validate([
            'create_contact' => ['required', 'boolean'],
            'log_call_engagement' => ['required', 'boolean'],
            'create_ticket_on_transfer' => ['required', 'boolean'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->connections->put($tenant, IntegrationProvider::HubSpot, [
            'sync' => $data,
        ]);

        return redirect()->route('settings.integrations.hubspot')
            ->with('success', 'Sync settings saved.');
    }
}
