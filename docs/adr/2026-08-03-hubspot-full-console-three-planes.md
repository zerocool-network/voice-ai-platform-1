# ADR: Full HubSpot = Plano A proxy UI + Plano B app UI + Plano C voice

- **Status:** Accepted
- **Date:** 2026-08-03
- **Context:** ZeroVoice needs complete HubSpot coverage (CRM catalog, marketing, conversations, CMS, files, automation, settings, webhooks, privacy) with operable Inertia UI, plus the ZeroCoolVoice developer platform inside HubSpot, plus voice sync bridge. Partial “sync checkboxes only” UX is rejected.

## Decision

1. **Plano A (ZeroVoice):** First-party console at `/settings/integrations/hubspot/*` using Laravel `Http` + OAuth token against HubSpot REST (`config/hubspot.php` api_base). Generic CRM object CRUD via `HubSpotObjectType` enum + `HubSpotCrmService`. Module pages via `HubSpotConsoleModule` + `HubSpotModuleService`. Soft-fail on missing scope/plan/rate limit with `ScopeGate` UI.
2. **Plano B (`ZeroCoolVoice` HubSpot project):** Expand app cards/home/pages/settings/serverless/workflow actions/agent tools/app events/app objects/calling/MCP/SCIM/telemetry + OAuth scopes in `app-hsmeta.json`.
3. **Plano C (Voice):** Voice sync wizard, Flow node actions, Call detail HubSpot panel, `SyncCallToHubSpotJob`.
4. **No community wrappers** (see prior ADR). Official `hubspot/api-client` remains available via `HubSpotOAuthService::clientFor()`; console primary path is HTTP for uniform objectType coverage.

## Consequences

- Large surface area requires generic UI kit (`resources/js/Components/HubSpot/*`) rather than one-off pages per object.
- Some HubSpot endpoints/tiers return 403 — UI must show ScopeGate, never pretend success.
- Developer platform component types in ZeroCoolVoice must be validated/deployed with `hs project` against HubSpot platform version; invalid hsmeta types may need adjustment at deploy time.
