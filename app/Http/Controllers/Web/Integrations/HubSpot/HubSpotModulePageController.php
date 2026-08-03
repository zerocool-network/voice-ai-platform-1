<?php

namespace App\Http\Controllers\Web\Integrations\HubSpot;

use App\Enums\HubSpotConsoleModule;
use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\HubSpot\HubSpotWebhookEventModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotModuleService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HubSpotModulePageController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotModuleService $modules,
        private readonly HubSpotConsoleController $console,
    ) {}

    public function show(Request $request, string $module): Response
    {
        Gate::authorize('viewHubSpot');

        $mod = HubSpotConsoleModule::tryFrom($module);
        abort_if($mod === null || in_array($mod, [HubSpotConsoleModule::Overview, HubSpotConsoleModule::Search, HubSpotConsoleModule::VoiceSync], true), 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $integration = $this->connections->publicView($tenant, IntegrationProvider::HubSpot);

        $payload = ['results' => []];
        $apiMeta = ['ok' => true, 'error' => null, 'missing_scope' => false, 'rate_limited' => false];
        $extra = [];

        if ($integration['is_connected'] ?? false) {
            $query = $request->except(['_token']);
            $result = $this->modules->fetch($tenant, $mod, $query);
            $apiMeta = [
                'ok' => $result['ok'],
                'error' => $result['error'],
                'missing_scope' => $result['missing_scope'],
                'rate_limited' => $result['rate_limited'],
            ];
            if ($result['ok'] && $result['data'] !== null) {
                $payload = is_array($result['data']) ? $result['data'] : ['value' => $result['data']];
            }
        }

        if ($mod === HubSpotConsoleModule::Webhooks) {
            $extra['webhook_events'] = HubSpotWebhookEventModel::query()
                ->where('tenant_id', $tenant->id)
                ->latest('id')
                ->limit(50)
                ->get();
            $extra['webhook_url'] = url('/webhooks/hubspot');
        }

        if ($mod === HubSpotConsoleModule::Conversations && $request->filled('threadId')) {
            $thread = $this->modules->conversationThread($tenant, (string) $request->string('threadId'));
            $extra['thread'] = $thread['ok'] ? $thread['data'] : null;
            $extra['thread_meta'] = [
                'ok' => $thread['ok'],
                'error' => $thread['error'],
                'missing_scope' => $thread['missing_scope'],
                'rate_limited' => $thread['rate_limited'],
            ];
        }

        if ($mod === HubSpotConsoleModule::Properties && $request->filled('objectType')) {
            $props = $this->modules->propertiesForObject($tenant, (string) $request->string('objectType'));
            if ($props['ok']) {
                $payload = $props['data'];
            }
            $apiMeta = [
                'ok' => $props['ok'],
                'error' => $props['error'],
                'missing_scope' => $props['missing_scope'],
                'rate_limited' => $props['rate_limited'],
            ];
        }

        if ($mod === HubSpotConsoleModule::Pipelines && $request->filled('objectType')) {
            $pipes = $this->modules->pipelinesForObject($tenant, (string) $request->string('objectType'));
            if ($pipes['ok']) {
                $payload = $pipes['data'];
            }
        }

        return Inertia::render('Settings/Integrations/HubSpot/ModulePage', [
            'integration' => $integration,
            'module' => [
                'key' => $mod->value,
                'label_key' => $mod->labelKey(),
                'group' => $mod->group(),
            ],
            'payload' => $payload,
            'extra' => $extra,
            'filters' => $request->query(),
            'api_meta' => $apiMeta,
            'nav' => $this->console->navigation(),
        ]);
    }

    public function mutate(Request $request, string $module): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $mod = HubSpotConsoleModule::tryFrom($module);
        abort_if($mod === null, 404);

        $data = $request->validate([
            'action' => ['required', 'string', 'max:64'],
            'payload' => ['sometimes', 'array'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->modules->mutate($tenant, $mod, $data['action'], $data['payload'] ?? []);

        return $result['ok']
            ? back()->with('success', 'Action completed.')
            : back()->with('error', $result['error'] ?? 'Action failed.');
    }
}
