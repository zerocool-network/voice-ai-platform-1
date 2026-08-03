<?php

namespace App\Http\Controllers\Web;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\Analytics\AnalyticsExportService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsStudioController extends Controller
{
    public function __construct(
        private readonly AnalyticsExportService $export,
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function __invoke(Request $request): Response
    {
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);

        return Inertia::render('Analytics/Studio', [
            'summary' => $this->export->studioSummary($tenant),
            'schema' => $this->export->schema(),
            'looker' => $this->connections->publicView($tenant, IntegrationProvider::LookerStudio),
            'export_url' => url('/api/v1/analytics/export'),
        ]);
    }
}
