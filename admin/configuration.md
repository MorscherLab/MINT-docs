# Configuration

MINT reads configuration from four sources, in increasing order of precedence:

1. **Built-in defaults** — used when no other source overrides them.
2. **`config.json`** — `MINT_CONFIG_PATH` wins when set; otherwise, when `MINT_SERVER__DATA_PATH` is set, MINT uses `<MINT_SERVER__DATA_PATH>/config.json` if that file exists or if `./config.json` does not; otherwise it uses `./config.json`. The legacy `MLD_CONFIG_PATH` is also honored and logs a one-time warning naming `MINT_CONFIG_PATH`.
3. **`.env`** — `dotenv`-style key/value pairs in the working directory.
4. **Environment variables** — keys prefixed `MINT_`, with nested fields joined by `__` (e.g., `MINT_DATABASE__HOST=postgres`).

For most installations, editing `config.json` is the only configuration step. Use `MINT_CONFIG_PATH` when the config file lives outside the working directory or data path. Environment variables are useful for containerized deployments where a config file is awkward.

## Top-level schema

```json
{
  "platformName": "MINT",
  "platformDescription": "Experiment database and analysis platform",
  "loginDescription": "...",
  "loginPoints": [],
  "loginFooter": "Developed by Morscher Lab",
  "loginFooterDetail": "University Children’s Hospital Zürich",
  "devMode": false,
  "setupCompleted": false,
  "adminTerminalEnabled": false,
  "server": { "...": "..." },
  "database": { "...": "..." },
  "storage": { "...": "..." },
  "auth": { "...": "..." },
  "sso": { "...": "..." },
  "plugins": { "...": "..." },
  "marketplace": { "...": "..." },
  "updates": { "...": "..." },
  "notifications": { "...": "..." },
  "logging": { "...": "..." },
  "errorReporting": { "...": "..." },
  "audit": { "...": "..." },
  "observability": { "...": "..." },
  "access": { "...": "..." },
  "filesystem": { "...": "..." },
  "corsOrigins": [],
  "ADMIN_USERNAME": "",
  "ADMIN_PASSWORD": "",
  "DB_USERNAME": "",
  "DB_PASSWORD": ""
}
```

The full schema is defined in [`api/config/models.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/config/models.py) using Pydantic — that file is the authoritative reference. The summary below covers the keys most installations touch.

## `devMode`

```json
{ "devMode": false }
```

When `true`:

- Authentication is bypassed on every route; anyone hitting the URL is treated as admin
- Passkey login is disabled
- The configured PostgreSQL connection is kept; if `DB_USERNAME` / `DB_PASSWORD` are unset, dev mode falls back to `mint` / `mint`

Only users with the `admin` role can turn dev mode on through **Admin -> Platform -> Configuration**; `platform.configure` alone is refused.

::: warning Never expose dev mode
Dev mode is for local development and evaluation only. Never enable it on a host reachable from the network.
:::

## `server`

| Key | Default | Description |
|-----|---------|-------------|
| `dataPath` | `./data` | Runtime state directory |
| `instanceId` | generated if empty | Durable deployment namespace for public identifiers |
| `rpId` | `""` | WebAuthn relying-party ID |
| `rpName` | `MINT` | WebAuthn relying-party display name |
| `externalUrl` | `""` | Public platform URL, used for frontend/plugin context, to decide whether auth cookies are `Secure`, and as the only non-local host `/mcp` accepts |
| `trustedProxyCidrs` | `["127.0.0.1/32", "::1/128"]` | Proxy source networks trusted for `X-Forwarded-For` / `X-Forwarded-Host` / `X-Forwarded-Proto`. An explicit `[]` trusts no proxy |
| `healthReadyToken` | `""` | Bearer token that lets a monitor read `GET /api/health/ready` without a user login; empty means only users with `platform.view_logs` can read it |

The `apiMountPath` key was removed; the API is always mounted at `/api`. An old `config.json` that still has it starts with a one-time warning.

## `database`

| Key | Default | Description |
|-----|---------|-------------|
| `host` | `localhost` | PostgreSQL host |
| `port` | `5432` | PostgreSQL port |
| `databaseName` | `mint_db` | PostgreSQL database name |

PostgreSQL is the only MINT platform database. SQLite remains available only to plugins running standalone through the SDK's local-db support.

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "databaseName": "mint_db"
  },
  "DB_USERNAME": "mint",
  "DB_PASSWORD": "secret"
}
```

PostgreSQL credentials are top-level settings named `DB_USERNAME` and `DB_PASSWORD` in `config.json` (or `MINT_DB_USERNAME` / `MINT_DB_PASSWORD` in the environment), not nested under `database`.

## `storage`

MINT can keep experiment objects on local disk, S3-compatible storage, or
OpenStack Swift. Local storage is the default and uses `server.dataPath` unless
`storage.objects.localPath` is set.

```json
{
  "storage": {
    "objects": {
      "backend": "local",
      "localPath": ""
    },
    "s3": {
      "enabled": false,
      "endpointUrl": "",
      "regionName": "",
      "objectBucket": "",
      "objectPrefix": ""
    },
    "swift": {
      "enabled": false,
      "authUrl": "",
      "objectContainer": "",
      "objectPrefix": ""
    }
  }
}
```

Set `storage.objects.backend` to `s3` or `swift` only after the matching
backend section is configured. Secrets may be supplied through environment
aliases such as `MINT_S3_ACCESS_KEY_ID`, `MINT_S3_SECRET_ACCESS_KEY`,
`MINT_SWIFT_PASSWORD`, or the nested `MINT_STORAGE__...` names.

## `auth`

| Key | Default | Description |
|-----|---------|-------------|
| `enableAuth` | `true` | Require authentication |
| `enablePasskey` | `true` | Enable WebAuthn registration and login |
| `allowRegistration` | `true` | Allow self-registration on `/register` |
| `jwtSecretKey` | auto-generated if empty | Secret used to sign JWTs |
| `tokenExpireMinutes` | `10080` (7 days) | Token lifetime; the admin UI accepts 15–43200 |
| `failedLoginLimit` | `5` | Failed password logins before the account is locked |
| `loginLockoutMinutes` | `15` | Lockout duration |
| `requireSecondFactor` | `true` | Require a passkey after a password or edu-ID sign-in. Enforced only with auth and passkeys on, dev mode off and an `https://` `server.externalUrl`; see [Second factor](/admin/authentication#second-factor) |
| `patMaxLifetimeDays` | `365` | Longest lifetime a [personal access token](/admin/authentication#personal-access-tokens) may be issued for: `30`, `90` or `365` |

See [Security settings](#security-settings) for how these behave.

## Security settings

- **Self-registration.** With `auth.allowRegistration: false`, `POST /api/users/register` returns 403 and the `/register` page sends visitors to `/login`. Switch it under **Admin -> Platform -> Configuration -> Authentication -> Registration**, in `config.json`, or with `MINT_AUTH__ALLOW_REGISTRATION=false`.
- **Passwords.** Every password (registration, self-service change, admin create, update and reset) must be at least 8 characters. Shorter ones are rejected with 422.
- **Account lockout.** After `auth.failedLoginLimit` failed password logins, the account is locked for `auth.loginLockoutMinutes`.
- **Rate limit.** `/api/auth`, `/api/passkey`, `/api/setup` and `/api/users/register` allow 20 requests per 60 seconds per client IP, then return 429.
- **Secure cookies.** The `mint_access_token` and `passkey_session` cookies carry `Secure` when `server.externalUrl` starts with `https://`, or, if it is unset, when the request arrived over HTTPS. If `externalUrl` is `https://` but users open MINT over plain HTTP, the browser drops the cookie and login fails.
- **Trusted proxies.** The client IP (rate limit, audit log), the passkey relying-party host, and the `platformOrigin` injected into plugin frontends come from `X-Forwarded-For` / `X-Forwarded-Host` / `X-Forwarded-Proto` only when the direct peer is in `server.trustedProxyCidrs`. An explicit empty list trusts no proxy. Add your reverse proxy's address when it is not on the same host.
- **MCP host check.** `/mcp` accepts only requests whose `Host` is `localhost`, `127.0.0.1`, `[::1]` or the host (with port, if any) of `server.externalUrl`; any other host gets 421. Set `externalUrl` to the address AI clients use, make the reverse proxy pass the original `Host` header, and restart MINT after changing `externalUrl`.
- **Disabling auth.** Only users with the `admin` role can set `auth.enableAuth: false` or `devMode: true` through the admin config API.
- **Setup password.** When initial setup completes, MINT clears the administrator password stored in `ADMIN_PASSWORD` in `config.json`.

## `filesystem`

Read-only server directories that the file browser may list:

```json
{
  "filesystem": {
    "mounts": [
      { "id": "raw", "path": "/mnt/instruments/raw", "label": "Raw data" }
    ],
    "allowUnauthenticated": false
  }
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `mounts` | `[]` | Each mount needs a unique `id` and an absolute `path`; `label` defaults to the id. The path is never sent to browsers |
| `allowUnauthenticated` | `false` | When auth is disabled, browsing stays closed unless this is `true` |

Users also need the `filesystem.browse` permission.

## `sso`

Built-in SSO currently covers SWITCH edu-ID through OpenID Connect:

```json
{
  "sso": {
    "eduid": {
      "enabled": false,
      "issuer": "https://login.eduid.ch/",
      "clientId": "",
      "clientSecret": "",
      "scopes": ["openid", "profile", "email", "https://eduid.ch/scope/userinfo.read"],
      "autoProvision": true,
      "activeByDefault": true,
      "usernameClaim": "email",
      "identityClaim": "swissEduIDUniqueID"
    }
  }
}
```

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `false` | Show **Sign in with SWITCH edu-ID** on the login page |
| `issuer` | `https://login.eduid.ch/` | OIDC issuer; MINT normalizes the trailing slash |
| `clientId` / `clientSecret` | `""` | edu-ID OIDC client credentials |
| `scopes` | `openid`, `profile`, `email`, edu-ID userinfo | OIDC scopes; env values may be JSON or comma-separated |
| `autoProvision` | `true` | Create a MINT user on first successful edu-ID login |
| `activeByDefault` | `true` | Newly provisioned users are active immediately |
| `usernameClaim` | `email` | Claim used as the MINT username |
| `identityClaim` | `swissEduIDUniqueID` | Stable edu-ID identity key stored for future logins |

edu-ID SSO stores linked users in the platform's required PostgreSQL database and needs a public `server.externalUrl`, because the callback URL is `<externalUrl>/api/auth/sso/eduid/callback`.

## `plugins`

| Key | Default | Description |
|-----|---------|-------------|
| `loadFromEntryPoints` | `true` | Discover plugins via the `mint.plugins` entry-point group |
| `extraIndexUrls` | `[]` | Additional Python package indexes for plugin installs |
| `settings` | `{}` | Centralized per-plugin settings resolved for decorator-declared config and exposed through the plugin settings store |

## `marketplace`

| Key | Default | Description |
|-----|---------|-------------|
| `registryUrl` | `https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json` | Where to fetch the plugin catalog |
| `cacheTtlMinutes` | `60` | Registry cache lifetime |
| `autoUpdatePlugins` | `{}` | Per-plugin marketplace auto-update toggles |

## `updates`

| Key | Default | Description |
|-----|---------|-------------|
| `autoCheckEnabled` | `false` | Enable background update checks |
| `checkIntervalHours` | `24` | Polling interval in hours; at least `1` |
| `autoApplyEnabled` | `false` | Install updates daily at `autoApplyTime`; needs a restart supervisor |
| `autoApplyTime` | `03:00` | Daily run time, server-local `HH:MM` |
| `autoApplyPlatform` | `true` | Scheduled updates include the platform |
| `autoApplyPlugins` | `true` | Scheduled updates include plugins |
| `platformRepo` | `MorscherLab/MINT` | Source of platform releases |
| `githubToken` | `""` | Optional GitHub API token; also read from `MINT_GITHUB_TOKEN` or `GITHUB_TOKEN` |
| `includePrereleases` | `false` | Include prereleases when checking GitHub releases |
| `pluginSources` | `{}` | Per-plugin GitHub release sources |

See [Updates](/admin/updates) for the wider picture.

Docker startup auto-update is controlled by the container entrypoint environment variable `MINT_UPDATES__AUTO_APPLY_ON_STARTUP`, not by `config.json`, and is separate from `autoApplyEnabled`.

## `notifications`

Platform-owned notification integrations deliver plugin `@notify` events and
admin messages. Plugins publish typed events; MINT owns SMTP/webhook delivery,
retry state, and recipient policy.

| Section | Main keys |
|---------|-----------|
| `notifications.email` | `enabled`, `host`, `port`, `tlsMode`, `fromAddress`, `fromName`, `username`, `password` |
| `notifications.teams` | `enabled`, `webhookUrl` |
| `notifications.slack` | `enabled`, `webhookUrl` |

Only enable an integration when its required host/webhook fields are set.

## `audit`

| Key | Default | Description |
|-----|---------|-------------|
| `retentionDays` | `0` | Days to keep audit events (`0`–`36500`). `0` keeps every event |

With `retentionDays` above 0, a daily job deletes older audit events and records each purge as an `audit.purge` event. Edit it under **Admin -> Platform -> Configuration -> Audit log**, or set `MINT_AUDIT__RETENTION_DAYS`.

## `observability`

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `false` | Enable OpenTelemetry tracing |
| `serviceName` | `mint-platform` | Service name used in traces |
| `otlpEndpoint` | `http://localhost:4317` | OTLP endpoint URL |
| `otlpProtocol` | `grpc` | OTLP protocol |
| `traceSampleRate` | `1.0` | Trace sampling rate |

When `observability.enabled` is `false`, instrumentation is a no-op.

## `access`

| Key | Default | Description |
|-----|---------|-------------|
| `experimentVisibilityMode` | `open` | `open` keeps normal project-level experiment visibility; `restricted` limits experiment lists to creators, collaborators, and experiments in projects the user can access |

## `adminTerminalEnabled`

```json
{ "adminTerminalEnabled": false }
```

When enabled, users with `platform.configure` can use **Admin -> Platform -> Terminal** to open a short-lived shell inside the running MINT container/process and maintain a persisted startup script under `server.dataPath/admin-terminal/startup.sh`. Keep this off by default; it is intended for tightly controlled server administration, not routine plugin use.

## `corsOrigins`

```json
{ "corsOrigins": ["https://mint.example.org"] }
```

When empty, production CORS allows no cross-origin browser calls. In dev mode, MINT automatically allows the local frontend/backend origins used by the dev server.

## `logging` and `errorReporting`

| Section | Keys |
|---------|------|
| `logging` | `level`, `fileEnabled`, `filePath`, `maxBytes`, `backupCount` |
| `errorReporting` | `enabled`, `githubRepo`, `githubToken`, `minLevel`, `cooldownSeconds`, `labels` |

## Environment variable mapping

Nested keys use `__` (double underscore) as the separator, and `MINT_` as the prefix. Names are case-insensitive. How a multi-word key is written depends on the section:

- In `server`, `auth`, `filesystem`, `notifications.*`, `audit` and at top level, use snake_case: `MINT_SERVER__DATA_PATH`, `MINT_AUTH__ALLOW_REGISTRATION`, `MINT_AUDIT__RETENTION_DAYS`. These variables override the matching camelCase key in `config.json`.
- In every other section (`database`, `sso.eduid`, `marketplace`, `updates`, `access`, `observability`, `logging`, `errorReporting`, `plugins`), write the camelCase key without separators: `MINT_DATABASE__DATABASENAME`, `MINT_UPDATES__AUTOCHECKENABLED`.
- The `errorReporting` section's prefix is `MINT_ERROR_REPORTING__`, for example `MINT_ERROR_REPORTING__MINLEVEL`.
- Single-word keys work the same everywhere: `MINT_DATABASE__HOST`, `MINT_SSO__EDUID__ENABLED`.

| Config key | Env var |
|------------|---------|
| `devMode` | `MINT_DEV_MODE` |
| `server.dataPath` | `MINT_SERVER__DATA_PATH` |
| `server.trustedProxyCidrs` | `MINT_SERVER__TRUSTED_PROXY_CIDRS` |
| `auth.jwtSecretKey` | `MINT_AUTH__JWT_SECRET_KEY` |
| `auth.allowRegistration` | `MINT_AUTH__ALLOW_REGISTRATION` |
| `auth.requireSecondFactor` | `MINT_AUTH__REQUIRE_SECOND_FACTOR` |
| `auth.patMaxLifetimeDays` | `MINT_AUTH__PAT_MAX_LIFETIME_DAYS` |
| `audit.retentionDays` | `MINT_AUDIT__RETENTION_DAYS` |
| `database.databaseName` | `MINT_DATABASE__DATABASENAME` |
| `sso.eduid.enabled` | `MINT_SSO__EDUID__ENABLED` |
| `sso.eduid.clientId` | `MINT_SSO__EDUID__CLIENTID` |
| `marketplace.registryUrl` | `MINT_MARKETPLACE__REGISTRYURL` |
| `updates.platformRepo` | `MINT_UPDATES__PLATFORMREPO` |
| `updates.autoApplyEnabled` | `MINT_UPDATES__AUTOAPPLYENABLED` |
| `notifications.email.host` | `MINT_NOTIFICATIONS__EMAIL__HOST` |
| `notifications.teams.webhookUrl` | `MINT_NOTIFICATIONS__TEAMS__WEBHOOK_URL` |
| `adminTerminalEnabled` | `MINT_ADMIN_TERMINAL_ENABLED` |
| `DB_USERNAME` / `DB_PASSWORD` | `MINT_DB_USERNAME` / `MINT_DB_PASSWORD` |

::: warning Snake_case names that are ignored
In the sections of the second bullet, snake_case forms such as `MINT_DATABASE__DATABASE_NAME`, `MINT_SSO__EDUID__CLIENT_ID`, `MINT_MARKETPLACE__REGISTRY_URL` or `MINT_UPDATES__PLATFORM_REPO` are silently ignored in MINT @MINT_VERSION@. The setting keeps its `config.json` or default value, and no error is logged. Storage keys are the exception: `MINT_STORAGE__S3__...` and `MINT_STORAGE__SWIFT__...` accept both forms.
:::

Booleans accept `true`/`false`/`1`/`0`. JSON values can be embedded literally.

The remaining legacy `MLD_` aliases (`MLD_CONFIG_PATH` and the `MLD_` GitHub-token names) log a one-time warning naming their `MINT_` replacement. The `MLD_` JWT-secret aliases stay supported without a warning, because dropping one would sign every user out.

## Storage path layout

The configured `server.dataPath` (default `./data`) holds platform runtime state:

| Subdirectory | Contents |
|--------------|----------|
| `objects/` | Local experiment object storage when no external object backend is configured |
| `plugin_registry.json` | Persistent plugin registry metadata |
| `marketplace/` | Marketplace registry cache |
| `plugins/uploads/` | Uploaded `.mint` bundles and extracted install payloads |
| `plugins/manifest.json` | Restore manifest for dynamically installed plugin bundles |
| `plugins/locks/` | In-process [plugin dependency lock](/admin/plugins#plugin-dependency-lock): `requirements.in`, `plugins.lock`, `state.json` and `history/` |
| `plugins/<plugin>/venv/` | Isolated plugin virtual environments when subprocess isolation is used |
| `plugins/<plugin>/config.json` | Legacy per-plugin settings fallback |
| `logs/mint.log` | Log file when `logging.fileEnabled` is true (default `logging.filePath`) |
| `admin-terminal/startup.sh` | Optional startup script managed by **Admin -> Platform -> Terminal** |
| `cache/uv/` | Docker only: uv wheel cache (`UV_CACHE_DIR=/app/data/cache/uv`), used to restore plugins from their locks after an image rebuild |

Removing `marketplace/` is safe; it regenerates on demand. Removing `plugins/locks/history/` discards plugin rollback points; do not remove the rest of `plugins/locks/`.

## Next

→ [Install on Linux (direct)](/admin/install-direct) — start the platform with a given config
→ [Platform commands](/admin/cli) — `mint experiment`, `mint project`, …
