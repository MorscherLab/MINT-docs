# Error codes

Every error answer of the MINT API has the same envelope. Scripts and clients read the `code` field to find the cause of a refusal. This page lists the codes of the platform routes.

## The error envelope

```json
{
  "code": "user.not_found",
  "message": "User not found",
  "status": 404,
  "request_id": "example-request-id",
  "details": null,
  "detail": "User not found",
  "error": "user.not_found"
}
```

| Field | Content |
|-------|---------|
| `code` | A machine-readable code. Compare this field, not the text |
| `message` | A human-readable text. It can change between releases |
| `status` | The HTTP status |
| `request_id` | The request ID. The `X-Request-ID` header has the same value. Give it when you report a problem |
| `details` | Data about the refusal, or `null` |
| `detail` | The legacy field. Older clients read it |

A plugin uses the same envelope. For the codes of the SDK exceptions, see [Exceptions reference](/sdk/api/exceptions).

## The rule

Each platform refusal has a specific code that names the refusal, in the form `<area>.<reason>`, for example `user.not_found` or `auth.session_required`. To find the cause of an error, compare `code` with the codes on this page, or use the HTTP status.

A route that does not give a specific code answers with the generic code of its HTTP status. A plugin route that raises a FastAPI `HTTPException` also gets the generic code, unless its `detail` is an object with its own `code`.

| Status | Generic code |
|--------|--------------|
| 400 | `request.bad_request` |
| 401 | `auth.unauthorized` |
| 403 | `auth.forbidden` |
| 404 | `resource.not_found` |
| 405 | `request.method_not_allowed` |
| 409 | `resource.conflict` |
| 413 | `request.too_large` |
| 422 | `validation.error` |
| 429 | `rate_limit.exceeded` |
| 500 | `internal.error` |
| 501 | `feature.not_implemented` |
| 503 | `service.unavailable` |
| Other 4xx | `request.error` |
| Other 5xx | `internal.error` |

A request body that fails the request model gets 422 `validation.request`, with the failed fields in `details`.

::: warning Clients from before MINT 1.6
Before MINT 1.6, most of the refusals below had the generic code of their status. The HTTP status did not change. A script that compares `code` with a generic code, such as `resource.not_found`, must use the specific code or the HTTP status. See [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5).
:::

## Codes by area

Each table gives the code, the HTTP status and the routes that return it. A route prefix, such as `/api/experiments`, stands for the routes under it.

### Sign-in, sessions and tokens

| Code | Status | Routes |
|------|--------|--------|
| `api_token.lifetime_exceeded` | 400 | `/api/auth/device` |
| `api_token.no_account` | 403 | `/api/users/me`, `/api/auth/device` |
| `api_token.not_found` | 404 | `/api/admin/tokens`, `/api/users/me` |
| `auth.invalid_credentials` | 401 | `/api/auth/login` |
| `auth.invalid_token` | 401 | `/api/auth/refresh`, every route that reads a bearer token |
| `auth.last_second_factor` | 409 | `/api/auth/passkey` |
| `auth.locked` | 423 | `/api/auth/login`, `/api/auth/totp`, `/api/users/me` |
| `auth.no_account` | 403 | `/api/users/me` |
| `auth.permission_denied` | 403 | every route that needs a permission, `/api/plugins` |
| `auth.read_only_token` | 403 | every route that reads a bearer token |
| `auth.registration_disabled` | 403 | `/api/users/register` |
| `auth.required` | 401 | `/api/auth/passkey`, `/api/auth/totp`, `/api/auth/refresh`, every route that needs a signed-in caller, in-process plugin routes, `/api/events` |
| `auth.second_factor_required` | 401 | every route, when the session comes from a password or edu-ID sign-in without the second step. `details.second_factor` is `verify` or `enrol` |
| `auth.second_factor_verify_required` | 403 | `/api/auth/passkey` |
| `auth.session_required` | 403 | `/api/users/me`, `/api/auth/passkey`, `/api/auth/device`, `/api/auth/totp`, `/api/admin/service-tokens` |
| `auth.session_revoked` | 401 | `/api/auth/refresh`, `/api/auth/passkey`, every route that reads a session token, `/api/auth/totp`, `/api/users/me` |
| `auth.unavailable` | 503 | plugin routes, when MINT cannot reach the database to check the credential |
| `device_request.not_found` | 404 | `/api/auth/device` |
| `passkey.authentication_failed` | 401 | `/api/auth/passkey` |
| `passkey.disabled` | 403 | `/api/auth/passkey` |
| `passkey.no_account` | 403 | `/api/auth/passkey` |
| `passkey.no_authentication_session` | 400 | `/api/auth/passkey` |
| `passkey.no_registration_session` | 400 | `/api/auth/passkey` |
| `passkey.not_found` | 404 | `/api/auth/passkey` |
| `passkey.not_owner` | 403 | `/api/auth/passkey` |
| `passkey.registration_failed` | 400 | `/api/auth/passkey` |
| `service_token.not_found` | 404 | `/api/admin/service-tokens` |
| `totp.already_enrolled` | 409 | `/api/auth/totp` |
| `totp.disabled` | 403 | `/api/auth/totp` |
| `totp.invalid_code` | 400, 401 | `/api/auth/totp` |
| `totp.no_account` | 403 | `/api/users/me`, `/api/auth/totp` |
| `totp.not_found` | 404 | `/api/users/me` |

### Users

| Code | Status | Routes |
|------|--------|--------|
| `user.current_password_incorrect` | 400 | `/api/users/me` |
| `user.current_password_required` | 400 | `/api/users/me` |
| `user.not_found` | 404 | `/api/admin/users`, `/api/internal/users`, `/api/users/me` |
| `user.password_reset_failed` | 500 | `/api/admin/users` |

### Projects

| Code | Status | Routes |
|------|--------|--------|
| `project.lead_required` | 403 | `/api/projects` |
| `project.not_found` | 404 | `/api/projects` |
| `project_member.conflict` | 409 | `/api/projects` |
| `project_member.not_found` | 404 | `/api/projects` |
| `project_role.invalid` | 400 | `/api/projects` |

### Experiments, design data and artifacts

| Code | Status | Routes |
|------|--------|--------|
| `analysis_artifact.conflict` | 409 | `/api/experiments` |
| `analysis_artifact.invalid` | 422 | `/api/experiments` |
| `analysis_artifact.not_found` | 404 | `/api/experiments`, `/api/internal/experiments` |
| `analysis_result.forbidden` | 403 | `/api/experiments` |
| `analysis_result.not_found` | 404 | `/api/experiments` |
| `collaborator.conflict` | 409 | `/api/experiments` |
| `collaborator.last_owner` | 400 | `/api/experiments` |
| `collaborator.not_found` | 404 | `/api/experiments` |
| `design.concurrent_edit` | 409 | `PATCH /api/experiments/{id}/data/{plugin_id}`: other writes changed the experiment during the check. Send the patch again |
| `design.invalid` | 422 | `PATCH /api/experiments/{id}/data/{plugin_id}`: the merged document fails the schema. `details` names the field paths |
| `design.not_live` | 409 | `PATCH /api/experiments/{id}/data/{plugin_id}`: the plugin has no live design |
| `design.unknown_field` | 422 | `PATCH /api/experiments/{id}/data/{plugin_id}`: the field is not a property of the schema |
| `design.value_not_finite` | 422 | `PATCH /api/experiments/{id}/data/{plugin_id}`: the value holds NaN or an infinite number |
| `design.value_too_large` | 422 | `PATCH /api/experiments/{id}/data/{plugin_id}`: the value is larger than 256 KiB as JSON |
| `design.vetoed` | 422 | `/api/experiments` |
| `design_data.forbidden` | 403 | `/api/experiments` |
| `design_data.not_found` | 404 | `/api/experiments`, `/api/internal/experiments` |
| `experiment.code_conflict` | 409 | `/api/experiments` |
| `experiment.conflict` | 409 | `/api/experiments` |
| `experiment.invalid` | 422 | `/api/experiments` |
| `experiment.not_found` | 404 | `/api/experiments`, `/api/internal/experiments`, every plugin-scoped `/api/internal` route |
| `experiment.owner_required` | 403 | `/api/experiments` |
| `experiment.unsupported_export_format` | 400 | `/api/experiments` |
| `EXPERIMENT_TYPE_NOT_ALLOWED` (SDK `UnsupportedExperimentTypeException`) | 403 | `/api/experiments` |
| `object.create_only` | 409 | `/api/internal/experiments` |
| `object.exists` | 409 | `/api/internal/experiments` |
| `object.invalid` | 400 | `/api/experiments`, `/api/internal/experiments` |
| `object.invalid_base64` | 400 | `/api/experiments`, `/api/internal/experiments` |
| `object.not_found` | 404 | `/api/experiments`, `/api/internal/experiments` |
| `object.static_plugin` | 403 | `/api/internal/experiments` |
| `object.too_large` | 413 | `/api/experiments`, `/api/internal/experiments` |

### Instruments and calendar

| Code | Status | Routes |
|------|--------|--------|
| `calendar.base_url_unsafe` | 500 | `/api/calendar/feed`, `/api/calendar/subscriptions` |
| `calendar.no_account` | 403 | `/api/calendar/subscriptions` |
| `calendar.unavailable` | 503 | `/api/calendar/subscriptions`, `/api/calendar/feed`, `/api/internal/calendar` |
| `calendar_events.invalid` | 422 | `/api/internal/calendar` |
| `calendar_subscription.conflict` | 409 | `/api/calendar/subscriptions`, `/api/calendar/feed` |
| `calendar_subscription.not_found` | 404 | `/api/calendar/subscriptions` |
| `instrument.conflict` | 409 | `/api/instruments` |
| `instrument.not_found` | 404 | `/api/instruments`, `/api/internal/instruments` |
| `instrument_history.invalid_cursor` | 400 | `/api/experiments`, `/api/instruments` |

### Notifications and presence

| Code | Status | Routes |
|------|--------|--------|
| `job_notification.owner_mismatch` | 409 | `/api/internal/notifications` |
| `job_notification.owner_unavailable` | 409 | `/api/internal/notifications` |
| `notification.invalid` | 422 | `/api/internal/notifications` |
| `notification_config.invalid` | 400 | `/api/admin/notifications` |
| `notification_delivery.not_found` | 404 | `/api/admin/notifications` |
| `notifications.unavailable` | 503 | `/api/admin/notifications`, `/api/internal/notifications` |
| `presence.unavailable` | 503 | `/api/presence/heartbeat` |

### Plugins

| Code | Status | Routes |
|------|--------|--------|
| `event_delivery.not_found` | 404 | `/api/plugins` |
| `plugin.capability_missing` | 403 | `/api/internal/notifications` |
| `plugin.dependency_conflict` | 409 | plugin install, upgrade and marketplace install routes |
| `plugin.forwarded_user_invalid` | 403 | every `/api/internal` route that reads the forwarded user |
| `plugin.identity_missing` | 403 | every `/api/internal` route |
| `plugin.internal_token_invalid` | 403 | every `/api/internal` route |
| `plugin.internal_token_missing` | 403 | every `/api/internal` route |
| `plugin.invalid_id` | 400 | `/api/experiments`, `/api/internal/experiments` |
| `plugin.not_found` | 404 | `/api/internal/notifications`, `/api/plugins` |
| `plugin.not_visible` | 403 | plugin routes and panels: the role does not see the plugin |
| `plugin.operation_failed` | 400 | plugin install, upload, upgrade and uninstall, marketplace install and uninstall |
| `plugin.panel_forbidden` | 403 | `GET /api/experiments/{id}/panels/{plugin}/{panel_id}`: the panel needs a higher access level |
| `plugin.panel_invalid` | 502 | `GET /api/experiments/{id}/panels/{plugin}/{panel_id}`: the plugin failed, timed out or sent an invalid panel |
| `plugin.panel_not_found` | 404 | `GET /api/experiments/{id}/panels/{plugin}/{panel_id}`: the plugin declares no such panel for this experiment |
| `plugin.permission_denied` | 403 | plugin routes and panels: the role does not have `plugins.use` |
| `plugin.scope_mismatch` | 403 | `/api/internal/plugin-config` |
| `plugin_runtime.invalid` | 400 | `/api/plugins/runtime` |
| `plugin_settings.admin_required` | 403 | `/api/plugins` |
| `plugin_settings.expected_grant_required` | 428 | `/api/plugins` |
| `plugin_settings.invalid_if_match` | 400 | `/api/plugins` |
| `plugin_settings.patch_required` | 422 | `/api/plugins` |
| `plugin_settings_scope.invalid` | 422 | `/api/internal/plugin-config` |
| `plugin_upload.filename_missing` | 400 | `POST /api/plugins/upload` |
| `plugin_upload.not_mint_bundle` | 400 | `POST /api/plugins/upload` |
| `plugin_upload.save_failed` | 500 | `POST /api/plugins/upload` |
| `plugin_upload.too_large` | 413 | `POST /api/plugins/upload` |
| `registry.unavailable` | 503 | `/api/marketplace/catalog` |
| `snapshot.not_found` | 404 | `/api/plugins/snapshots` |

### Updates

| Code | Status | Routes |
|------|--------|--------|
| `update.dependency_conflict` | 409 | the `/api/updates` apply and install routes |
| `update.failed` | 400 | the `/api/updates` apply and install routes |
| `update.pairing_required` | 409 | the `/api/updates` apply and install routes |
| `update_source.invalid_url` | 400 | `/api/updates/releases` |
| `update_source.not_found` | 404 | `/api/updates/sources` |
| `update_source.releases_unavailable` | 400 | `/api/updates/releases` |
| `update_source.repository_inaccessible` | 400 | `/api/updates/releases`: GitHub rejected the token, or the repository does not exist or is private. See [Update settings](/admin/plugins#update-settings) |

### Setup and administration

| Code | Status | Routes |
|------|--------|--------|
| `config.admin_required` | 403 | `/api/admin/config` |
| `config.invalid` | 400 | `/api/admin/config` |
| `feedback.no_account` | 401 | `/api/feedback` |
| `feedback.rate_limited` | 429 | `/api/feedback` |
| `filesystem.browsing_disabled` | 403 | `/api/filesystem` |
| `health.readiness_forbidden` | 403 | `/api/health/ready` |
| `logging_config.invalid` | 400 | `/api/admin/logs` |
| `restart.unavailable` | 503 | `/api/admin/restart` |
| `restart.unsupervised` | 409 | `/api/admin/restart` |
| `restart_schedule.invalid` | 400 | `/api/admin/restart` |
| `route.not_found` | 404 | an unknown `/api` or `/.well-known` path, when MINT serves the frontend |
| `setup.completed` | 403 | `/api/setup/initial`, `/api/setup/test-db` |
| `setup.database_env_incomplete` | 400 | `/api/setup/initial`, `/api/setup/test-db` |
| `setup.driver_missing` | 500 | `/api/setup/test-db` |
| `setup.failed` | 500 | `/api/setup/initial` |
| `setup.in_progress` | 409 | `/api/setup/initial` |
| `setup.restart_unavailable` | 403 | `/api/setup/restart` |
| `setup.save_failed` | 500 | `/api/setup/initial` |
| `terminal.disabled` | 403 | `/api/admin/terminal` |
| `terminal_command.invalid` | 400 | `/api/admin/terminal` |

### SWITCH edu-ID sign-in

The routes under `/api/auth/sso/eduid` answer each error with its own code. The callback redirect keeps the error text in the `?error=` query parameter.

`sso.account_unavailable`, `sso.auth_required`, `sso.database_required`, `sso.disabled`, `sso.email_taken`, `sso.external_url_required`, `sso.id_token_invalid`, `sso.id_token_missing`, `sso.identity_linked_elsewhere`, `sso.identity_missing`, `sso.invalid_handoff`, `sso.invalid_link_session`, `sso.invalid_origin`, `sso.invalid_state`, `sso.last_sign_in_method`, `sso.link_account_mismatch`, `sso.linked_user_missing`, `sso.missing_code`, `sso.missing_handoff`, `sso.missing_link_session`, `sso.missing_state`, `sso.nonce_invalid`, `sso.not_configured`, `sso.openid_scope_required`, `sso.provider_error`, `sso.token_exchange_failed`, `sso.user_inactive`, `sso.user_linked_elsewhere`, `sso.user_not_provisioned`.

See [Authentication -> SWITCH edu-ID](/admin/authentication#switch-edu-id-sso).

### Plugin settings

The plugin settings routes (`/api/plugins/{name}/config`) answer each error with its own code. For these codes, `message` holds the text of `detail.message`.

`plugin_settings.commit_unconfirmed`, `plugin_settings.conflict`, `plugin_settings.grant_changed`, `plugin_settings.if_match_required`, `plugin_settings.invalid`, `plugin_settings.invalid_value`, `plugin_settings.mixed_update`, `plugin_settings.not_saved`, `plugin_settings.patch_required`, `plugin_settings.platform_key_declared`, `plugin_settings.rejected` (an error answer of a plugin process, passed on), `plugin_settings.runtime_failed`, `plugin_settings.schema_changed`, `plugin_settings.transaction_failed`, `plugin_settings.unsupported_fields`.

## Refusals with an object `detail`

Six refusals have a `detail` object without a `code`: `plugin.dependency_conflict`, `update.pairing_required`, `update.dependency_conflict`, `plugin_settings.expected_grant_required`, `plugin_settings.invalid_if_match` and `plugin_settings.patch_required`. For these refusals, `message` holds the text of `detail.message`. Read the other fields of `detail` for the data, for example the pairing plan of `update.pairing_required`.

## Related

- [Exceptions reference](/sdk/api/exceptions) — the SDK exceptions and their codes
- [Troubleshooting](/reference/troubleshooting) — common problems and fixes
- Source: [`api/exceptions.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/exceptions.py)
