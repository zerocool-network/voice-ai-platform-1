<?php

namespace App\Http\Controllers\Web\Integrations;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationsController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function index(Request $request): Response
    {
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return Inertia::render('Settings/Integrations/Index', [
            'integrations' => [
                'n8n' => $this->connections->publicView($tenant, IntegrationProvider::N8n),
                'hubspot' => $this->connections->publicView($tenant, IntegrationProvider::HubSpot),
                'looker_studio' => $this->connections->publicView($tenant, IntegrationProvider::LookerStudio),
            ],
            'platform' => [
                'hubspot_configured' => filled(config('hubspot.client_id')) && filled(config('hubspot.client_secret')),
                'google_configured' => filled(config('google-oauth.client_id')) && filled(config('google-oauth.client_secret')),
            ],
        ]);
    }
}
