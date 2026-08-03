# Integrations operator guide

## Platform credentials (one-time)

Set in environment (Hered/production secrets manager). Tenants never paste these into `.env` themselves — operators configure once; tenants use wizards.

```
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
HUBSPOT_REDIRECT_URI=https://YOUR_HOST/settings/integrations/hubspot/callback

GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=https://YOUR_HOST/settings/integrations/looker-studio/google/callback
```

Create a HubSpot public app with scopes listed in `config/hubspot.php`. Set the redirect URI to match `HUBSPOT_REDIRECT_URI`.

## Tenant wizards

- `/settings/integrations` hub
- n8n: API key + base URL → live `GET /workflows?limit=1` test
- HubSpot: OAuth → encrypted tokens in `tenants.settings.integrations.hubspot`
- Looker Studio: connector token (hashed at rest) → Export API

## Health

`php artisan integrations:health-check` runs hourly via scheduler (`CheckIntegrationHealthJob`).

## Webhooks

- `POST /webhooks/n8n/{tenant}` — HMAC `X-Voice-Signature` = `hash_hmac('sha256', body, webhook_secret)`
- `POST /webhooks/hubspot` — matches `portal_id` to tenant settings

## Docs / ADR

- `docs/superpowers/specs/2026-08-03-integrations-n8n-hubspot-looker-design.md`
- `docs/adr/2026-08-03-no-community-integration-wrappers.md`
