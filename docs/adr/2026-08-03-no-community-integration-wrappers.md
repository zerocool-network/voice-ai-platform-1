# ADR: No community integration wrappers

- **Status:** Accepted
- **Date:** 2026-08-03
- **Context:** Need n8n, HubSpot, and Looker Studio integrations without fragile third-party Laravel wrappers.

## Decision

1. **n8n:** Use Laravel `Http` against the official Public REST API (`X-N8N-API-KEY`). Do not require community packages such as `kayedspace/*`.
2. **HubSpot:** Use official Packagist package `hubspot/api-client` only. Do not use `rossjcooper/laravel-hubspot` or forks of legacy `hubspot/hubspot-php` wrappers.
3. **Looker Studio:** First-party Analytics Export API + Google Community Connector pattern. Do not pretend Looker Core SDK coverage without a Looker license.

## Consequences

- More first-party client code to maintain when APIs change.
- Clear upgrade path aligned with vendor OpenAPI / SDK releases.
- Dependency approval required only for `hubspot/api-client`.
