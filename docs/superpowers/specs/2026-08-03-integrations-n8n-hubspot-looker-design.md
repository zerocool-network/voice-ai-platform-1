# Integrations Design: n8n + HubSpot + Looker Studio

> **Date:** 2026-08-03  
> **Status:** Approved for implementation  
> **Branch context:** integrations program on voice-ai-platform  
> **ADRs:** `docs/adr/2026-08-03-no-community-integration-wrappers.md`

## Goal

Ship tenant-aware, wizard-driven integrations that exploit the **official** surface of:

1. **n8n** Public REST API (Cloud + self-hosted)
2. **HubSpot** CRM + Marketing + Service + Conversations + Timeline + Webhooks via `hubspot/api-client`
3. **Google Looker Studio** (ex-Data Studio) via Analytics Export API + Community Connector + optional BigQuery

Secrets live encrypted in tenant `settings`. Live connection test required before `connected`. No community Laravel wrappers.

## Decisions

| Decision | Choice |
| --- | --- |
| n8n hosting | Both Cloud and self-hosted in wizard (`mode` + `base_url`) |
| n8n client | First-party `N8nPublicApiClient` on Laravel `Http` + `X-N8N-API-KEY` |
| HubSpot auth | OAuth2 multi-tenant; platform public app credentials in `config/hubspot.php` |
| HubSpot SDK | Official `hubspot/api-client` only |
| Data Studio | Looker Studio (not Looker Core / LookML) |
| Storage | `tenants.settings['integrations'][{provider}]` with `Crypt::encryptString` for secrets |
| Authorization | Owner/Admin connect/disconnect; members read status |
| Flow nodes | `n8n_trigger`, `hubspot` (plus existing `webhook` for generic callbacks) |

## Storage shape

```php
settings['integrations'] = [
  'n8n' => [
    'mode' => 'cloud'|'self_hosted',
    'base_url' => 'https://….app.n8n.cloud/api/v1',
    'api_key' => encrypted,
    'webhook_secret' => encrypted,
    'status' => 'disconnected'|'connected'|'error',
    'last_test_at' => iso8601|null,
    'last_error' => string|null,
    'outbound_webhook_urls' => [], // platform → n8n
    'mcp' => ['enabled' => bool, 'url' => ?string, 'token' => ?encrypted],
  ],
  'hubspot' => [
    'oauth' => [
      'access_token' => encrypted,
      'refresh_token' => encrypted,
      'expires_at' => unix,
    ],
    'portal_id' => string|null,
    'scopes' => [],
    'status' => 'disconnected'|'connected'|'error',
    'sync' => [
      'create_contact' => true,
      'log_call_engagement' => true,
      'create_ticket_on_transfer' => false,
      'property_map' => [],
    ],
    'last_sync_at' => iso8601|null,
  ],
  'looker_studio' => [
    'connector_token_hash' => string, // hashed; plaintext shown once
    'status' => 'disconnected'|'connected'|'error',
    'bigquery' => [
      'enabled' => false,
      'project_id' => null,
      'dataset' => null,
      'google_oauth' => null, // encrypted tokens when enabled
    ],
    'connected_at' => iso8601|null,
  ],
];
```

Platform-level (env + optional System Settings UI):

- `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET`, `HUBSPOT_REDIRECT_URI`
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (Looker/BQ)

## n8n Public API resource coverage

Auth: header `X-N8N-API-KEY`. Base: `{instance}/api/v1`.

Client methods cover documented resource groups:

| Resource | Docs path |
| --- | --- |
| Workflow | `/connect/n8n-api/workflow` |
| Execution | `/connect/n8n-api/execution` |
| Credential | `/connect/n8n-api/credential` |
| User | `/connect/n8n-api/user` |
| Variables | `/connect/n8n-api/variables` |
| Tags | `/connect/n8n-api/tags` |
| Projects | `/connect/n8n-api/projects` |
| Folders | `/connect/n8n-api/folders` |
| Audit | `/connect/n8n-api/audit` |
| Source Control | `/connect/n8n-api/source-control` |
| Data Table | `/connect/n8n-api/data-table` |
| Evaluation | `/connect/n8n-api/evaluation` |
| Insights | `/connect/n8n-api/insights` |
| Community Package | `/connect/n8n-api/community-package` |
| N8n Package | `/connect/n8n-api/n8n-package` |
| Log Streaming | `/connect/n8n-api/log-streaming` |
| Discover | `/connect/n8n-api/discover` |
| Settings SSO SAML | `/connect/n8n-api/settings-sso-saml` |
| Settings OTEL | `/connect/n8n-api/settings-otel` |
| Security Policy | `/connect/n8n-api/security-policy` |
| Models | `/connect/n8n-api/models` |

Connection test: `GET /workflows?limit=1` must return 200.

Inbound webhook: `POST /webhooks/n8n/{tenant}` with HMAC (`X-Voice-Signature`) using `webhook_secret`.

## HubSpot scope matrix

OAuth scopes requested (portal must support; Marketing scopes fail gracefully with clear UI message):

| Area | Scopes (representative) |
| --- | --- |
| CRM | `crm.objects.contacts.read/write`, companies, deals, tickets, custom, `crm.schemas.*.read`, owners |
| Engagements | `crm.objects.contacts.write` + engagements APIs via CRM |
| Timeline | `timeline` / custom behavioral events as supported by app |
| Conversations | `conversations.read`, `conversations.write` when available |
| Marketing | `content`, `forms`, `marketing-email` when plan allows |
| Webhooks | App webhook subscriptions configured in HubSpot developer portal |

Sync on call completed:

1. Match/create Contact by E.164 phone
2. Create Call engagement / Timeline event
3. Optional Ticket if transfer outcome

## Looker Studio

1. In-app Analytics Studio (extends existing Analytics page)
2. `GET /api/v1/analytics/export` — Bearer connector token (hashed at rest)
3. Community Connector under `integrations/looker-studio-connector/`
4. Optional BigQuery sync job when Google OAuth + project configured

Export schema (stable):

| Field | Type |
| --- | --- |
| call_id | string |
| tenant_id | string |
| flow_id | string\|null |
| from | string |
| to | string |
| status | string |
| language | string\|null |
| duration_seconds | number\|null |
| started_at | datetime |
| ended_at | datetime\|null |
| outcome | string\|null |

## UI routes

- `GET /settings/integrations` — hub
- `GET/POST /settings/integrations/n8n` — wizard + console
- `GET /settings/integrations/hubspot` + OAuth callback
- `GET/POST /settings/integrations/looker-studio` — wizard
- `GET /analytics/studio` — Analytics Studio (or extend `/analytics`)

## Testing

PHPUnit feature + unit tests with `Http::fake` / HubSpot mocks. Happy path, auth failure, disconnect, export auth, webhook signature.

## Out of scope

- Community Composer packages for n8n/HubSpot
- Hosting n8n in this repo
- Looker Core / LookML embedding
- Undocumented API endpoints
