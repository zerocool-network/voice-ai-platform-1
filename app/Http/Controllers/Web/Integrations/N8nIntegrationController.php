<?php

namespace App\Http\Controllers\Web\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use App\Services\Integrations\N8n\N8nPublicApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class N8nIntegrationController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function show(Request $request): Response
    {
        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $view = $this->connections->publicView($tenant, IntegrationProvider::N8n);
        $workflows = [];
        $executions = [];
        $variables = [];
        $tags = [];
        $projects = [];

        if ($this->connections->status($tenant, IntegrationProvider::N8n) === IntegrationStatus::Connected) {
            $client = $this->clientFor($tenant);
            if ($client !== null) {
                $workflows = $client->listWorkflows(['limit' => 50])->json('data') ?? [];
                $executions = $client->listExecutions(['limit' => 25])->json('data') ?? [];
                $variables = $client->listVariables(['limit' => 50])->json('data') ?? [];
                $tags = $client->listTags(['limit' => 50])->json('data') ?? [];
                $projects = $client->listProjects(['limit' => 50])->json('data') ?? [];
            }
        }

        return Inertia::render('Settings/Integrations/N8n', [
            'integration' => $view,
            'templates' => config('integrations.templates', []),
            'console' => [
                'workflows' => $workflows,
                'executions' => $executions,
                'variables' => $variables,
                'tags' => $tags,
                'projects' => $projects,
            ],
            'inbound_webhook_url' => url('/webhooks/n8n/'.$tenant->id),
            'plain_webhook_secret' => $request->session()->pull('n8n_webhook_secret'),
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $data = $request->validate([
            'mode' => ['required', 'in:cloud,self_hosted'],
            'base_url' => ['required', 'url'],
            'api_key' => ['required', 'string', 'min:10'],
            'mcp_enabled' => ['sometimes', 'boolean'],
            'mcp_url' => ['nullable', 'url'],
            'mcp_token' => ['nullable', 'string'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $baseUrl = rtrim($data['base_url'], '/');
        if (! str_ends_with($baseUrl, '/api/v1')) {
            $baseUrl .= '/api/v1';
        }

        $client = N8nPublicApiClient::fromConfig($baseUrl, $data['api_key']);
        $test = $client->testConnection();

        if (! $test['ok']) {
            return redirect()->route('settings.integrations.n8n')
                ->with('error', 'n8n connection test failed. Check base URL and API key.');
        }

        $webhookSecret = $this->connections->generateWebhookSecret();

        $this->connections->put($tenant, IntegrationProvider::N8n, [
            'mode' => $data['mode'],
            'base_url' => $baseUrl,
            'api_key' => $data['api_key'],
            'webhook_secret' => $webhookSecret,
            'status' => IntegrationStatus::Connected->value,
            'last_test_at' => now()->toIso8601String(),
            'last_error' => null,
            'capabilities' => ['workflows', 'executions', 'credentials', 'users', 'variables', 'tags', 'projects'],
            'mcp' => [
                'enabled' => (bool) ($data['mcp_enabled'] ?? false),
                'url' => $data['mcp_url'] ?? null,
                'token' => $data['mcp_token'] ?? null,
            ],
        ]);

        activity()
            ->event('n8n_connected')
            ->performedOn($tenant)
            ->log('n8n integration connected');

        $request->session()->flash('n8n_webhook_secret', $webhookSecret);

        return redirect()->route('settings.integrations.n8n')
            ->with('success', 'n8n connected successfully. Copy the inbound webhook secret now — it will not be shown again.');
    }

    public function disconnect(Request $request): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $this->connections->clear($tenant, IntegrationProvider::N8n);

        activity()
            ->event('n8n_disconnected')
            ->performedOn($tenant)
            ->log('n8n integration disconnected');

        return redirect()->route('settings.integrations.n8n')
            ->with('success', 'n8n disconnected.');
    }

    public function test(Request $request): JsonResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $client = $this->clientFor($tenant);

        if ($client === null) {
            return response()->json(['ok' => false, 'error' => 'Not connected'], 422);
        }

        $result = $client->testConnection();
        $this->connections->put($tenant, IntegrationProvider::N8n, [
            'status' => $result['ok'] ? IntegrationStatus::Connected->value : IntegrationStatus::Error->value,
            'last_test_at' => now()->toIso8601String(),
            'last_error' => $result['ok'] ? null : 'Connection test failed',
        ]);

        return response()->json($result);
    }

    public function activateWorkflow(Request $request, string $workflowId): RedirectResponse
    {
        return $this->workflowAction($request, $workflowId, 'activate');
    }

    public function deactivateWorkflow(Request $request, string $workflowId): RedirectResponse
    {
        return $this->workflowAction($request, $workflowId, 'deactivate');
    }

    private function workflowAction(Request $request, string $workflowId, string $action): RedirectResponse
    {
        if (! $request->user()->isOwner() && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $client = $this->clientFor($tenant);
        if ($client === null) {
            return redirect()->route('settings.integrations.n8n')->with('error', 'n8n not connected.');
        }

        $response = $action === 'activate'
            ? $client->activateWorkflow($workflowId)
            : $client->deactivateWorkflow($workflowId);

        if (! $response->successful()) {
            return redirect()->route('settings.integrations.n8n')->with('error', 'Workflow action failed.');
        }

        return redirect()->route('settings.integrations.n8n')->with('success', 'Workflow updated.');
    }

    private function clientFor(TenantModel $tenant): ?N8nPublicApiClient
    {
        $config = $this->connections->get($tenant, IntegrationProvider::N8n);
        $apiKey = $this->connections->decryptSecret($config['api_key'] ?? null);
        $baseUrl = $config['base_url'] ?? null;

        if (! is_string($apiKey) || $apiKey === '' || ! is_string($baseUrl) || $baseUrl === '') {
            return null;
        }

        return N8nPublicApiClient::fromConfig($baseUrl, $apiKey);
    }
}
