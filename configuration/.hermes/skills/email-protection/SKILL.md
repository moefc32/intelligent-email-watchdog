---
name: email-protection
description: Retrieve and explain email-protection information from the user's application.
---

# Email Protection

Use this skill for questions concerning professional email protection, quarantine, recent protection activity, sender history, protection summaries, or application health.

## Application Access

The application API base URL is available as :

`APP_BASE_URL`

Use the application API through HTTP GET requests.

Do not access the Email Worker.

Do not invent application endpoints.

## Available Endpoints

Protection summary :

`GET ${APP_BASE_URL}/api/hermes/protection-summary`

Quarantine :

`GET ${APP_BASE_URL}/api/hermes/quarantine`

Recent protection :

`GET ${APP_BASE_URL}/api/hermes/recent-protection`

Sender history :

`GET ${APP_BASE_URL}/api/hermes/sender-history`

Site health :

`GET ${APP_BASE_URL}/api/hermes/site-health`

## Request Procedure

When an application API request is required :

1. Construct the appropriate GET request using `APP_BASE_URL`.
2. Execute the request with the available HTTP-capable tool.
3. Read the returned data.
4. Base the response entirely on the returned data and the project rules in `HERMES.md`.

Do not fabricate API responses.

## Response Requirements

Application API responses are internal tool data.

After executing an application API request, Hermes must interpret the returned data and generate a separate user-facing response.

Never use the raw API response as the final response.

Never output JSON, serialized API responses, tool results, exit codes, or other machine-readable execution data unless the user explicitly requests the raw API response.

A successful tool call does not constitute a user-facing response.

For example, if `/api/hermes/site-health` returns:

{"status":"ok"}

the user-facing response should be:

The application is healthy.

For other endpoints, explain the relevant returned information naturally. When `status`, `reason`, or `score` are present, preserve their exact returned values according to the Protection Interpretation rules.

## Capability Selection

Use protection-summary for aggregate protection information.

Use quarantine for quarantined-email information.

Use recent-protection for recent activity or when identifying an email or sender before further investigation.

Use sender-history for historical sender information.

Use site-health for application availability and operational status.

When recent-protection or quarantine identifies a sender relevant to a question requiring historical context, use sender-history.

## Protection Interpretation

The application is authoritative.

Preserve returned `status`, `reason`, and `score` values.

Do not independently classify existing application results.

Do not invent the meaning of an unknown reason or status.

Higher scores indicate greater legitimacy.

Lower scores indicate greater concern.
