<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class N8nWebhookController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function __invoke(Request $request, string $tenant): JsonResponse
    {
        $tenantModel = TenantModel::find($tenant);
        if ($tenantModel === null) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $config = $this->connections->get($tenantModel, IntegrationProvider::N8n);
        $secret = $this->connections->decryptSecret($config['webhook_secret'] ?? null);
        if ($secret === null) {
            return response()->json(['message' => 'Not configured'], 422);
        }

        $signature = $request->header('X-Voice-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        if (! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        Log::info('n8n inbound webhook', [
            'tenant_id' => $tenantModel->id,
            'event' => $request->input('event'),
        ]);

        activity()
            ->event('n8n_webhook_received')
            ->performedOn($tenantModel)
            ->withProperties(['event' => $request->input('event')])
            ->log('n8n webhook received');

        return response()->json(['ok' => true]);
    }
}
