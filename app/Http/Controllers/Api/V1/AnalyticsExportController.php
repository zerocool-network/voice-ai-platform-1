<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\Analytics\AnalyticsExportService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AnalyticsExportController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly AnalyticsExportService $export,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token === null || $token === '') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenantId = $request->query('tenant_id') ?? $request->header('X-Tenant-Id');
        if (! is_string($tenantId) || $tenantId === '') {
            return response()->json(['message' => 'tenant_id required'], 422);
        }

        $tenant = TenantModel::find($tenantId);
        if ($tenant === null) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $config = $this->connections->get($tenant, IntegrationProvider::LookerStudio);
        if (($config['status'] ?? null) !== IntegrationStatus::Connected->value) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hash = $config['connector_token_hash'] ?? null;
        if (! is_string($hash) || ! Hash::check($token, $hash)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $cursor = $request->query('cursor');
        $limit = (int) $request->query('limit', 100);

        return response()->json($this->export->export(
            $tenant,
            is_string($cursor) ? $cursor : null,
            $limit,
        ));
    }
}
