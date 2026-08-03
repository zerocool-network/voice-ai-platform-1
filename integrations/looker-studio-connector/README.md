# Looker Studio Community Connector

Official pattern: Google Apps Script community connector calling Voice AI Platform Analytics Export API.

## Setup

1. In the app UI: **Settings → Integrations → Looker Studio** → Generate connector token. Copy it once.
2. Create a new [Apps Script](https://script.google.com/) project and paste [`Code.gs`](Code.gs).
3. Deploy as **Looker Studio Community Connector**.
4. In Looker Studio, add the connector:
   - Auth key = connector token
   - Export URL = `https://YOUR_HOST/api/v1/analytics/export`
   - Tenant ID = your tenant UUID

## Contract

`GET /api/v1/analytics/export?tenant_id=...&cursor=...&limit=100`

Authorization: `Bearer <connector_token>`

Response:

```json
{
  "schema": [{"name":"call_id","type":"STRING"}, ...],
  "rows": [{"call_id":"...","tenant_id":"..."}],
  "next_cursor": null
}
```

## Optional BigQuery

Enable BigQuery sync in the Looker Studio wizard after configuring Google OAuth platform credentials (`GOOGLE_OAUTH_CLIENT_ID` / `SECRET`).
