<?php

namespace App\Http\Controllers\Web\Integrations\HubSpot;

use App\Enums\HubSpotObjectType;
use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Http\Requests\Integrations\HubSpot\BatchHubSpotObjectRequest;
use App\Http\Requests\Integrations\HubSpot\StoreHubSpotObjectRequest;
use App\Http\Requests\Integrations\HubSpot\UpdateHubSpotObjectRequest;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotCrmService;
use App\Services\Integrations\HubSpot\HubSpotModuleService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HubSpotCrmObjectController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotCrmService $crm,
        private readonly HubSpotModuleService $modules,
        private readonly HubSpotConsoleController $console,
    ) {}

    public function index(Request $request, string $objectType): Response
    {
        Gate::authorize('viewHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $integration = $this->connections->publicView($tenant, IntegrationProvider::HubSpot);

        $records = ['results' => [], 'paging' => null];
        $properties = ['results' => []];
        $apiMeta = ['ok' => true, 'error' => null, 'missing_scope' => false, 'rate_limited' => false];

        if ($integration['is_connected'] ?? false) {
            $list = $this->crm->list(
                $tenant,
                $type,
                after: $request->string('after')->toString() ?: null,
                limit: (int) $request->integer('limit', 25),
            );
            $apiMeta = [
                'ok' => $list['ok'],
                'error' => $list['error'],
                'missing_scope' => $list['missing_scope'],
                'rate_limited' => $list['rate_limited'],
            ];
            if ($list['ok'] && is_array($list['data'])) {
                $records = $list['data'];
            }

            $props = $this->modules->propertiesForObject($tenant, $type->apiPath());
            if ($props['ok'] && is_array($props['data'])) {
                $properties = $props['data'];
            }
        }

        return Inertia::render('Settings/Integrations/HubSpot/Crm/ObjectIndex', [
            'integration' => $integration,
            'object_type' => [
                'slug' => $type->value,
                'object_type_id' => $type->objectTypeId(),
                'group' => $type->group(),
                'label_key' => $type->labelKey(),
                'default_properties' => $type->defaultProperties(),
            ],
            'records' => $records,
            'properties' => $properties,
            'filters' => $request->only(['after', 'limit', 'q']),
            'api_meta' => $apiMeta,
            'nav' => $this->console->navigation(),
        ]);
    }

    public function show(Request $request, string $objectType, string $id): Response
    {
        Gate::authorize('viewHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $integration = $this->connections->publicView($tenant, IntegrationProvider::HubSpot);

        $record = null;
        $associations = [];
        $apiMeta = ['ok' => true, 'error' => null, 'missing_scope' => false, 'rate_limited' => false];

        if ($integration['is_connected'] ?? false) {
            $result = $this->crm->get($tenant, $type, $id, associations: ['contacts', 'companies', 'deals', 'tickets']);
            $apiMeta = [
                'ok' => $result['ok'],
                'error' => $result['error'],
                'missing_scope' => $result['missing_scope'],
                'rate_limited' => $result['rate_limited'],
            ];
            if ($result['ok']) {
                $record = $result['data'];
                $associations = is_array($record['associations'] ?? null) ? $record['associations'] : [];
            }
        }

        return Inertia::render('Settings/Integrations/HubSpot/Crm/ObjectShow', [
            'integration' => $integration,
            'object_type' => [
                'slug' => $type->value,
                'object_type_id' => $type->objectTypeId(),
                'label_key' => $type->labelKey(),
                'default_properties' => $type->defaultProperties(),
            ],
            'record' => $record,
            'associations' => $associations,
            'api_meta' => $apiMeta,
            'nav' => $this->console->navigation(),
        ]);
    }

    public function store(StoreHubSpotObjectRequest $request, string $objectType): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->crm->create($tenant, $type, $request->validated('properties'));

        if (! $result['ok']) {
            return back()->with('error', $result['error'] ?? 'Create failed.');
        }

        $id = is_array($result['data']) ? ($result['data']['id'] ?? null) : null;

        return $id
            ? redirect()->route('settings.integrations.hubspot.objects.show', [$type->value, $id])
                ->with('success', 'Record created.')
            : back()->with('success', 'Record created.');
    }

    public function update(UpdateHubSpotObjectRequest $request, string $objectType, string $id): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->crm->update($tenant, $type, $id, $request->validated('properties'));

        return $result['ok']
            ? back()->with('success', 'Record updated.')
            : back()->with('error', $result['error'] ?? 'Update failed.');
    }

    public function destroy(Request $request, string $objectType, string $id): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->crm->archive($tenant, $type, $id);

        return $result['ok']
            ? redirect()->route('settings.integrations.hubspot.objects.index', $type->value)
                ->with('success', 'Record archived.')
            : back()->with('error', $result['error'] ?? 'Archive failed.');
    }

    public function batch(BatchHubSpotObjectRequest $request, string $objectType): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $data = $request->validated();

        $result = $data['action'] === 'archive'
            ? $this->crm->batchArchive($tenant, $type, $data['ids'])
            : $this->crm->batchUpdate($tenant, $type, array_map(
                fn (string $id) => ['id' => $id, 'properties' => $data['properties'] ?? []],
                $data['ids']
            ));

        return $result['ok']
            ? back()->with('success', 'Batch action completed.')
            : back()->with('error', $result['error'] ?? 'Batch action failed.');
    }

    public function associate(Request $request, string $objectType, string $id): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $data = $request->validate([
            'to_object_type' => ['required', 'string'],
            'to_id' => ['required', 'string'],
            'association_type_id' => ['sometimes', 'integer'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->crm->createAssociation(
            $tenant,
            $type,
            $id,
            $data['to_object_type'],
            $data['to_id'],
            (int) ($data['association_type_id'] ?? 1),
        );

        return $result['ok']
            ? back()->with('success', 'Association created.')
            : back()->with('error', $result['error'] ?? 'Association failed.');
    }

    public function dissociate(Request $request, string $objectType, string $id): RedirectResponse
    {
        Gate::authorize('manageHubSpot');

        $type = HubSpotObjectType::tryFromSlug($objectType);
        abort_if($type === null, 404);

        $data = $request->validate([
            'to_object_type' => ['required', 'string'],
            'to_id' => ['required', 'string'],
        ]);

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $result = $this->crm->deleteAssociation(
            $tenant,
            $type,
            $id,
            $data['to_object_type'],
            $data['to_id'],
        );

        return $result['ok']
            ? back()->with('success', 'Association removed.')
            : back()->with('error', $result['error'] ?? 'Dissociate failed.');
    }
}
