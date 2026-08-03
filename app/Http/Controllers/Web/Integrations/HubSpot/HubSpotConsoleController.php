<?php

namespace App\Http\Controllers\Web\Integrations\HubSpot;

use App\Enums\HubSpotObjectType;
use App\Enums\IntegrationProvider;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\HubSpot\HubSpotApiClient;
use App\Services\Integrations\HubSpot\HubSpotCrmService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HubSpotConsoleController extends Controller
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
        private readonly HubSpotApiClient $api,
    ) {}

    public function overview(Request $request): Response
    {
        Gate::authorize('viewHubSpot');

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $integration = $this->connections->publicView($tenant, IntegrationProvider::HubSpot);
        $account = null;
        $apiMeta = null;

        if ($integration['is_connected'] ?? false) {
            $result = $this->api->get($tenant, '/account-info/v3/details');
            $apiMeta = [
                'ok' => $result['ok'],
                'error' => $result['error'],
                'missing_scope' => $result['missing_scope'],
                'rate_limited' => $result['rate_limited'],
            ];
            $account = $result['ok'] ? $result['data'] : null;
        }

        return Inertia::render('Settings/Integrations/HubSpot/Overview', [
            'integration' => $integration,
            'platform_configured' => filled(config('hubspot.client_id')) && filled(config('hubspot.client_secret')),
            'scopes' => [
                'required' => config('hubspot.scopes', []),
                'optional' => config('hubspot.optional_scopes', []),
                'granted' => $integration['scopes'] ?? [],
            ],
            'account' => $account,
            'api_meta' => $apiMeta,
            'object_types' => collect(HubSpotObjectType::cases())->map(fn (HubSpotObjectType $type) => [
                'slug' => $type->value,
                'object_type_id' => $type->objectTypeId(),
                'group' => $type->group(),
                'label_key' => $type->labelKey(),
            ])->values(),
            'nav' => $this->navigation(),
        ]);
    }

    public function search(Request $request): Response
    {
        Gate::authorize('viewHubSpot');

        $tenant = TenantModel::findOrFail($request->user()->tenant_id);
        $query = (string) $request->string('q');
        $type = HubSpotObjectType::tryFromSlug((string) $request->string('object', 'contacts'))
            ?? HubSpotObjectType::Contacts;

        $results = ['results' => [], 'total' => 0];
        $apiMeta = ['ok' => true, 'error' => null, 'missing_scope' => false, 'rate_limited' => false];

        if ($query !== '' && ($this->connections->publicView($tenant, IntegrationProvider::HubSpot)['is_connected'] ?? false)) {
            $crm = app(HubSpotCrmService::class);
            $response = $crm->search($tenant, $type, $query);
            $apiMeta = [
                'ok' => $response['ok'],
                'error' => $response['error'],
                'missing_scope' => $response['missing_scope'],
                'rate_limited' => $response['rate_limited'],
            ];
            if ($response['ok'] && is_array($response['data'])) {
                $results = $response['data'];
            }
        }

        return Inertia::render('Settings/Integrations/HubSpot/Search', [
            'integration' => $this->connections->publicView($tenant, IntegrationProvider::HubSpot),
            'query' => $query,
            'object_type' => $type->value,
            'results' => $results,
            'api_meta' => $apiMeta,
            'nav' => $this->navigation(),
        ]);
    }

    /** @return list<array{group: string, items: list<array{key: string, href: string, label_key: string}>}> */
    public function navigation(): array
    {
        $crmObjects = collect(HubSpotObjectType::cases())
            ->groupBy(fn (HubSpotObjectType $t) => $t->group())
            ->map(fn ($items, $group) => [
                'group' => (string) $group,
                'items' => $items->map(fn (HubSpotObjectType $t) => [
                    'key' => 'object:'.$t->value,
                    'href' => '/settings/integrations/hubspot/objects/'.$t->value,
                    'label_key' => $t->labelKey(),
                ])->values()->all(),
            ])->values()->all();

        $modules = [
            [
                'group' => 'overview',
                'items' => [
                    ['key' => 'overview', 'href' => '/settings/integrations/hubspot', 'label_key' => 'hubspot.modules.overview'],
                    ['key' => 'search', 'href' => '/settings/integrations/hubspot/search', 'label_key' => 'hubspot.modules.search'],
                    ['key' => 'reporting', 'href' => '/settings/integrations/hubspot/modules/reporting', 'label_key' => 'hubspot.modules.reporting'],
                ],
            ],
            ...$crmObjects,
            [
                'group' => 'crm_infra',
                'items' => [
                    ['key' => 'properties', 'href' => '/settings/integrations/hubspot/modules/properties', 'label_key' => 'hubspot.modules.properties'],
                    ['key' => 'schemas', 'href' => '/settings/integrations/hubspot/modules/schemas', 'label_key' => 'hubspot.modules.schemas'],
                    ['key' => 'pipelines', 'href' => '/settings/integrations/hubspot/modules/pipelines', 'label_key' => 'hubspot.modules.pipelines'],
                    ['key' => 'lists', 'href' => '/settings/integrations/hubspot/modules/lists', 'label_key' => 'hubspot.modules.lists'],
                    ['key' => 'imports', 'href' => '/settings/integrations/hubspot/modules/imports', 'label_key' => 'hubspot.modules.imports'],
                    ['key' => 'exports', 'href' => '/settings/integrations/hubspot/modules/exports', 'label_key' => 'hubspot.modules.exports'],
                    ['key' => 'owners', 'href' => '/settings/integrations/hubspot/modules/owners', 'label_key' => 'hubspot.modules.owners'],
                    ['key' => 'associations', 'href' => '/settings/integrations/hubspot/modules/associations', 'label_key' => 'hubspot.modules.associations'],
                ],
            ],
            [
                'group' => 'marketing',
                'items' => [
                    ['key' => 'forms', 'href' => '/settings/integrations/hubspot/modules/forms', 'label_key' => 'hubspot.modules.forms'],
                    ['key' => 'marketing-emails', 'href' => '/settings/integrations/hubspot/modules/marketing-emails', 'label_key' => 'hubspot.modules.marketing-emails'],
                    ['key' => 'marketing-events', 'href' => '/settings/integrations/hubspot/modules/marketing-events', 'label_key' => 'hubspot.modules.marketing-events'],
                    ['key' => 'transactional', 'href' => '/settings/integrations/hubspot/modules/transactional', 'label_key' => 'hubspot.modules.transactional'],
                    ['key' => 'campaigns', 'href' => '/settings/integrations/hubspot/modules/campaigns', 'label_key' => 'hubspot.modules.campaigns'],
                    ['key' => 'comms-prefs', 'href' => '/settings/integrations/hubspot/modules/comms-prefs', 'label_key' => 'hubspot.modules.comms-prefs'],
                ],
            ],
            [
                'group' => 'conversations',
                'items' => [
                    ['key' => 'conversations', 'href' => '/settings/integrations/hubspot/modules/conversations', 'label_key' => 'hubspot.modules.conversations'],
                    ['key' => 'timeline', 'href' => '/settings/integrations/hubspot/modules/timeline', 'label_key' => 'hubspot.modules.timeline'],
                ],
            ],
            [
                'group' => 'cms',
                'items' => [
                    ['key' => 'cms-pages', 'href' => '/settings/integrations/hubspot/modules/cms-pages', 'label_key' => 'hubspot.modules.cms-pages'],
                    ['key' => 'cms-blogs', 'href' => '/settings/integrations/hubspot/modules/cms-blogs', 'label_key' => 'hubspot.modules.cms-blogs'],
                    ['key' => 'hubdb', 'href' => '/settings/integrations/hubspot/modules/hubdb', 'label_key' => 'hubspot.modules.hubdb'],
                    ['key' => 'domains', 'href' => '/settings/integrations/hubspot/modules/domains', 'label_key' => 'hubspot.modules.domains'],
                    ['key' => 'redirects', 'href' => '/settings/integrations/hubspot/modules/redirects', 'label_key' => 'hubspot.modules.redirects'],
                    ['key' => 'site-search', 'href' => '/settings/integrations/hubspot/modules/site-search', 'label_key' => 'hubspot.modules.site-search'],
                ],
            ],
            [
                'group' => 'files',
                'items' => [
                    ['key' => 'files', 'href' => '/settings/integrations/hubspot/modules/files', 'label_key' => 'hubspot.modules.files'],
                ],
            ],
            [
                'group' => 'automation',
                'items' => [
                    ['key' => 'automation', 'href' => '/settings/integrations/hubspot/modules/automation', 'label_key' => 'hubspot.modules.automation'],
                    ['key' => 'sequences', 'href' => '/settings/integrations/hubspot/modules/sequences', 'label_key' => 'hubspot.modules.sequences'],
                ],
            ],
            [
                'group' => 'settings',
                'items' => [
                    ['key' => 'settings-users', 'href' => '/settings/integrations/hubspot/modules/settings-users', 'label_key' => 'hubspot.modules.settings-users'],
                    ['key' => 'business-units', 'href' => '/settings/integrations/hubspot/modules/business-units', 'label_key' => 'hubspot.modules.business-units'],
                    ['key' => 'account', 'href' => '/settings/integrations/hubspot/modules/account', 'label_key' => 'hubspot.modules.account'],
                ],
            ],
            [
                'group' => 'developer',
                'items' => [
                    ['key' => 'webhooks', 'href' => '/settings/integrations/hubspot/modules/webhooks', 'label_key' => 'hubspot.modules.webhooks'],
                    ['key' => 'extensions', 'href' => '/settings/integrations/hubspot/modules/extensions', 'label_key' => 'hubspot.modules.extensions'],
                    ['key' => 'developer', 'href' => '/settings/integrations/hubspot/modules/developer', 'label_key' => 'hubspot.modules.developer'],
                ],
            ],
            [
                'group' => 'privacy',
                'items' => [
                    ['key' => 'privacy', 'href' => '/settings/integrations/hubspot/modules/privacy', 'label_key' => 'hubspot.modules.privacy'],
                ],
            ],
            [
                'group' => 'voice',
                'items' => [
                    ['key' => 'voice-sync', 'href' => '/settings/integrations/hubspot/voice-sync', 'label_key' => 'hubspot.modules.voice-sync'],
                ],
            ],
        ];

        return $modules;
    }
}
