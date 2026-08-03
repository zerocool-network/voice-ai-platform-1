<?php

namespace App\Services\Integrations\HubSpot;

use App\Enums\HubSpotConsoleModule;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;

class HubSpotModuleService
{
    public function __construct(
        private readonly HubSpotApiClient $api,
    ) {}

    /**
     * @param  array<string, mixed>  $query
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function fetch(TenantModel $tenant, HubSpotConsoleModule $module, array $query = []): array
    {
        return match ($module) {
            HubSpotConsoleModule::Properties => $this->api->get($tenant, '/crm/v3/properties/contacts', $query),
            HubSpotConsoleModule::Schemas => $this->api->get($tenant, '/crm/v3/schemas', $query),
            HubSpotConsoleModule::Pipelines => $this->api->get($tenant, '/crm/v3/pipelines/deals', $query),
            HubSpotConsoleModule::Lists => $this->api->get($tenant, '/crm/v3/lists', $query),
            HubSpotConsoleModule::Imports => $this->api->get($tenant, '/crm/v3/imports', $query),
            HubSpotConsoleModule::Exports => $this->api->get($tenant, '/crm/v3/exports', $query),
            HubSpotConsoleModule::Owners => $this->api->get($tenant, '/crm/v3/owners', $query),
            HubSpotConsoleModule::Associations => $this->api->get($tenant, '/crm/v4/associations/contacts/companies/labels', $query),
            HubSpotConsoleModule::Forms => $this->api->get($tenant, '/marketing/v3/forms', $query),
            HubSpotConsoleModule::MarketingEmails => $this->api->get($tenant, '/marketing/v3/emails', $query),
            HubSpotConsoleModule::MarketingEvents => $this->api->get($tenant, '/marketing/v3/marketing-events', $query),
            HubSpotConsoleModule::Transactional => $this->api->get($tenant, '/marketing/v3/transactional/single-email/send', $query),
            HubSpotConsoleModule::Campaigns => $this->api->get($tenant, '/marketing/v3/campaigns', $query),
            HubSpotConsoleModule::CommsPrefs => $this->api->get($tenant, '/communication-preferences/v3/definitions', $query),
            HubSpotConsoleModule::Conversations => $this->api->get($tenant, '/conversations/v3/conversations/threads', $query),
            HubSpotConsoleModule::Timeline => $this->api->get($tenant, '/crm/v3/timeline/events', $query),
            HubSpotConsoleModule::CmsPages => $this->api->get($tenant, '/cms/v3/pages/site-pages', $query),
            HubSpotConsoleModule::CmsBlogs => $this->api->get($tenant, '/cms/v3/blogs/posts', $query),
            HubSpotConsoleModule::Hubdb => $this->api->get($tenant, '/cms/v3/hubdb/tables', $query),
            HubSpotConsoleModule::Domains => $this->api->get($tenant, '/cms/v3/domains', $query),
            HubSpotConsoleModule::Redirects => $this->api->get($tenant, '/cms/v3/url-redirects', $query),
            HubSpotConsoleModule::SiteSearch => $this->api->get($tenant, '/cms/v3/site-search/search', $query),
            HubSpotConsoleModule::Files => $this->api->get($tenant, '/files/v3/files', $query),
            HubSpotConsoleModule::Automation => $this->api->get($tenant, '/automation/v4/flows', $query),
            HubSpotConsoleModule::Sequences => $this->api->get($tenant, '/automation/v4/sequences', $query),
            HubSpotConsoleModule::SettingsUsers => $this->api->get($tenant, '/settings/v3/users', $query),
            HubSpotConsoleModule::BusinessUnits => $this->api->get($tenant, '/business-units/v3/business-units', $query),
            HubSpotConsoleModule::Account => $this->api->get($tenant, '/account-info/v3/details', $query),
            HubSpotConsoleModule::Webhooks => $this->api->get($tenant, '/webhooks/v3/'.config('hubspot.client_id').'/subscriptions', $query),
            HubSpotConsoleModule::Reporting => $this->api->get($tenant, '/analytics/v2/reports/totals/total', $query),
            HubSpotConsoleModule::Privacy => $this->api->get($tenant, '/crm/v3/objects/contacts', ['limit' => 1]),
            HubSpotConsoleModule::Extensions => $this->extensionsPayload($tenant),
            HubSpotConsoleModule::Developer => $this->developerPayload($tenant),
            HubSpotConsoleModule::VoiceSync => $this->voiceSyncPayload($tenant),
            HubSpotConsoleModule::Overview, HubSpotConsoleModule::Search => $this->api->get($tenant, '/account-info/v3/details', $query),
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function mutate(TenantModel $tenant, HubSpotConsoleModule $module, string $action, array $payload = []): array
    {
        return match ([$module, $action]) {
            [HubSpotConsoleModule::Properties, 'create'] => $this->api->post(
                $tenant,
                '/crm/v3/properties/'.($payload['objectType'] ?? 'contacts'),
                $payload['property'] ?? $payload
            ),
            [HubSpotConsoleModule::Schemas, 'create'] => $this->api->post($tenant, '/crm/v3/schemas', $payload),
            [HubSpotConsoleModule::Lists, 'create'] => $this->api->post($tenant, '/crm/v3/lists', $payload),
            [HubSpotConsoleModule::Pipelines, 'create'] => $this->api->post(
                $tenant,
                '/crm/v3/pipelines/'.($payload['objectType'] ?? 'deals'),
                $payload['pipeline'] ?? $payload
            ),
            [HubSpotConsoleModule::Forms, 'create'] => $this->api->post($tenant, '/marketing/v3/forms', $payload),
            [HubSpotConsoleModule::Conversations, 'reply'] => $this->api->post(
                $tenant,
                '/conversations/v3/conversations/threads/'.($payload['threadId'] ?? '').'/messages',
                $payload['message'] ?? $payload
            ),
            [HubSpotConsoleModule::Conversations, 'assign'] => $this->api->patch(
                $tenant,
                '/conversations/v3/conversations/threads/'.($payload['threadId'] ?? ''),
                ['assignedTo' => $payload['assignedTo'] ?? null]
            ),
            [HubSpotConsoleModule::Files, 'upload'] => $this->api->post($tenant, '/files/v3/files', $payload),
            [HubSpotConsoleModule::CmsPages, 'create'] => $this->api->post($tenant, '/cms/v3/pages/site-pages', $payload),
            [HubSpotConsoleModule::CmsBlogs, 'create'] => $this->api->post($tenant, '/cms/v3/blogs/posts', $payload),
            [HubSpotConsoleModule::Hubdb, 'create'] => $this->api->post($tenant, '/cms/v3/hubdb/tables', $payload),
            [HubSpotConsoleModule::Redirects, 'create'] => $this->api->post($tenant, '/cms/v3/url-redirects', $payload),
            [HubSpotConsoleModule::CommsPrefs, 'update'] => $this->api->post(
                $tenant,
                '/communication-preferences/v3/status/email/subscribe',
                $payload
            ),
            [HubSpotConsoleModule::Timeline, 'create'] => $this->api->post($tenant, '/crm/v3/timeline/events', $payload),
            [HubSpotConsoleModule::MarketingEmails, 'create'] => $this->api->post($tenant, '/marketing/v3/emails', $payload),
            [HubSpotConsoleModule::Privacy, 'gdpr_delete'] => $this->api->post(
                $tenant,
                '/crm/v3/objects/contacts/gdpr-delete',
                $payload
            ),
            [HubSpotConsoleModule::Webhooks, 'create'] => $this->api->post(
                $tenant,
                '/webhooks/v3/'.config('hubspot.client_id').'/subscriptions',
                $payload
            ),
            [HubSpotConsoleModule::Webhooks, 'delete'] => $this->api->delete(
                $tenant,
                '/webhooks/v3/'.config('hubspot.client_id').'/subscriptions/'.($payload['id'] ?? '')
            ),
            default => [
                'ok' => false,
                'status' => 400,
                'data' => null,
                'error' => "Unsupported action [{$action}] for module [{$module->value}].",
                'missing_scope' => false,
                'rate_limited' => false,
            ],
        };
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function propertiesForObject(TenantModel $tenant, string $objectType): array
    {
        return $this->api->get($tenant, '/crm/v3/properties/'.$objectType);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function pipelinesForObject(TenantModel $tenant, string $objectType): array
    {
        return $this->api->get($tenant, '/crm/v3/pipelines/'.$objectType);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function conversationThread(TenantModel $tenant, string $threadId): array
    {
        return $this->api->get($tenant, '/conversations/v3/conversations/threads/'.$threadId);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    private function extensionsPayload(TenantModel $tenant): array
    {
        return [
            'ok' => true,
            'status' => 200,
            'data' => [
                'calling' => ['status' => 'configured', 'provider' => 'zerovoice'],
                'cards' => ['status' => 'deployed', 'contexts' => ['contact', 'company', 'deal', 'ticket', 'call']],
                'videoconferencing' => ['status' => 'available'],
            ],
            'error' => null,
            'missing_scope' => false,
            'rate_limited' => false,
        ];
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    private function developerPayload(TenantModel $tenant): array
    {
        return [
            'ok' => true,
            'status' => 200,
            'data' => [
                'app' => 'ZeroCoolVoice-App',
                'components' => [
                    'cards', 'settings', 'app_home', 'app_pages', 'serverless',
                    'workflow_actions', 'agent_tools', 'app_events', 'app_objects',
                    'mcp', 'scim', 'telemetry', 'calling',
                ],
                'portal_id' => $this->api->grantedScopes($tenant) ? ($tenant->settings['integrations']['hubspot']['portal_id'] ?? null) : null,
            ],
            'error' => null,
            'missing_scope' => false,
            'rate_limited' => false,
        ];
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    private function voiceSyncPayload(TenantModel $tenant): array
    {
        $config = $tenant->settings['integrations']['hubspot'] ?? [];
        $sync = is_array($config['sync'] ?? null) ? $config['sync'] : [];

        return [
            'ok' => true,
            'status' => 200,
            'data' => [
                'sync' => $sync,
                'property_map' => $sync['property_map'] ?? [],
                'targets' => ['contacts', 'companies', 'leads', 'deals', 'tickets', 'calls', 'notes', 'tasks'],
            ],
            'error' => null,
            'missing_scope' => false,
            'rate_limited' => false,
        ];
    }
}
