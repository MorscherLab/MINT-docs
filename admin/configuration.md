# Configuration

This page lists the `config.json` keys and the environment variables of the MINT platform.

MINT reads configuration from four sources. A later source overrides an earlier one:

1. Built-in defaults.
2. `config.json`. MINT finds the file in this order:
   - `MINT_CONFIG_PATH`, when it is set.
   - `<MINT_SERVER__DATA_PATH>/config.json`, when `MINT_SERVER__DATA_PATH` is set and that file exists or `./config.json` does not exist.
   - `./config.json`.
3. `.env`: `dotenv` key/value pairs in the working directory.
4. Environment variables: the prefix `MINT_`, with nested fields joined by `__` (for example `MINT_DATABASE__HOST=postgres`).

Most installations edit only `config.json`. Use environment variables for containers.

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
  "realtimeEnabled": true,
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
  "instruments": { "...": "..." },
  "libraries": { "...": "..." },
  "jobs": { "...": "..." },
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

The Pydantic models in [`api/config/models.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/config/models.py) define the full schema. The sections below cover the keys that most installations change.

## `devMode`

```json
{ "devMode": false }
```

When `devMode` is `true`:

- MINT does not check authentication on any route. Every visitor is an administrator.
- Passkey login is off.
- MINT keeps the configured PostgreSQL connection. If `DB_USERNAME` and `DB_PASSWORD` are not set, dev mode uses `mint` / `mint`.

`auth.enableAuth: false` also turns sign-in off and makes every visitor an administrator. Only users with the `admin` role can set either value in **Admin -> System -> Configuration** or the admin config API. `platform.configure` alone is not sufficient.

::: warning Never expose dev mode
Use dev mode only for local development and evaluation. Never enable it on a host that the network can reach.
:::

## `server`

| Key | Default | Description |
|-----|---------|-------------|
| `dataPath` | `./data` | Runtime state directory. See [Storage path layout](#storage-path-layout) |
| `instanceId` | generated if empty | Durable deployment namespace for public identifiers |
| `rpId` | `""` | WebAuthn relying-party ID. See [Sign in with a passkey](/admin/authentication#sign-in-with-a-passkey) |
| `rpName` | `MINT` | WebAuthn relying-party display name |
| `externalUrl` | `""` | Public platform URL. MINT uses only its origin (scheme, host and a non-default port) and ignores a path. See [Public URL](/admin/reverse-proxy#public-url) |
| `trustedProxyCidrs` | `["127.0.0.1/32", "::1/128"]` | Proxy networks whose `X-Forwarded-*` headers MINT trusts. `[]` trusts no proxy. See [Trusted proxies](/admin/reverse-proxy#trusted-proxies) |
| `healthReadyToken` | `""` | Bearer token that lets a monitor read `GET /api/health/ready` without a user. Empty: only users with `platform.view_logs` can read it |

The port that MINT binds is not a `config.json` key. `mint-platform serve`, `dev`, `daemon` and `python -m api.main` set `MINT_LISTEN_PORT` (default `8001`) to the port that they bind. MINT gives it to plugin processes, so that they find the platform. A bare `uvicorn --port` launch must set it. The platform must run as one worker; see [Install directly](/admin/install-direct#run-as-a-systemd-service).

The API is always mounted at `/api`. A `config.json` that still has the removed `apiMountPath` key starts with a one-time warning.

## `database`

| Key | Default | Description |
|-----|---------|-------------|
| `host` | `localhost` | PostgreSQL host |
| `port` | `5432` | PostgreSQL port |
| `databaseName` | `mint_db` | PostgreSQL database name |

The credentials are top-level keys, not keys in `database`: `DB_USERNAME` and `DB_PASSWORD` (env `MINT_DB_USERNAME` and `MINT_DB_PASSWORD`). MINT supports only PostgreSQL; see [Requirements](/admin/install-direct#requirements).

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

## `storage`

MINT keeps experiment objects on local disk (the default), S3-compatible storage, or OpenStack Swift. Local storage uses `server.dataPath`, unless `storage.objects.localPath` is set.

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

Set `storage.objects.backend` to `s3` or `swift` only after you configure that section. Give secrets through environment variables, such as `MINT_S3_ACCESS_KEY_ID`, `MINT_S3_SECRET_ACCESS_KEY`, `MINT_SWIFT_PASSWORD`, or the nested `MINT_STORAGE__...` names.

## `auth`

| Key | Default | Description |
|-----|---------|-------------|
| `enableAuth` | `true` | Require authentication. See [`devMode`](#devmode) |
| `enablePasskey` | `true` | Enable WebAuthn registration and login |
| `allowRegistration` | `true` | Allow self-registration on `/register`. See [Accounts and registration](/admin/authentication#accounts-and-registration) |
| `jwtSecretKey` | generated if empty | Secret that signs JWTs |
| `tokenExpireMinutes` | `10080` (7 days) | Token lifetime. The admin UI accepts 15–43200 |
| `failedLoginLimit` | `5` | Failed password logins before MINT locks the account |
| `loginLockoutMinutes` | `15` | Lockout length |
| `enableTotp` | `false` | Offer an authenticator app (TOTP) as a second factor. Needs a restart. See [Authenticator app](/admin/authentication#authenticator-app-totp) |
| `requireSecondFactor` | `true` | Require a second step after a password or edu-ID sign-in. See [Second factor](/admin/authentication#second-factor) for when MINT enforces it |
| `patMaxLifetimeDays` | `365` | Maximum lifetime of a [personal access token](/admin/authentication#personal-access-tokens): `30`, `90` or `365` |

## Security settings

- **MCP host check.** `/mcp` accepts only a request whose `Host` is `localhost`, `127.0.0.1`, `[::1]` or the host (with port, if any) of `server.externalUrl`. Any other host gets 421. Set `externalUrl` to the address that AI clients use. Make the reverse proxy pass the original `Host` header. Restart MINT after you change `externalUrl`.
- **Setup password.** When the initial setup completes, MINT clears the administrator password in `ADMIN_PASSWORD` in `config.json`.
- **Sign-in rules.** For passwords, lockout and rate limits, see [Authentication](/admin/authentication). For `Secure` cookies and trusted proxies, see [Reverse proxy](/admin/reverse-proxy).

## `filesystem`

Read-only server directories that the file browser can list. For an example and the behavior, see [Server file browser](/admin/platform-settings#server-file-browser).

| Key | Default | Description |
|-----|---------|-------------|
| `mounts` | `[]` | Each mount has a unique `id` and an absolute `path`. `label` defaults to the id |
| `allowUnauthenticated` | `false` | When authentication is off, browsing stays closed unless this is `true` |

## `sso`

The built-in SSO is SWITCH edu-ID through OpenID Connect. See [SWITCH edu-ID SSO](/admin/authentication#switch-edu-id-sso).

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
| `enabled` | `false` | Show the SWITCH edu-ID button on the login page |
| `issuer` | `https://login.eduid.ch/` | OIDC issuer. MINT normalizes the trailing slash |
| `clientId` / `clientSecret` | `""` | edu-ID OIDC client credentials |
| `scopes` | `openid`, `profile`, `email`, edu-ID userinfo | OIDC scopes. An env value can be JSON or comma-separated |
| `autoProvision` | `true` | Create a MINT user at the first edu-ID login |
| `activeByDefault` | `true` | A new edu-ID user is active at once |
| `usernameClaim` | `email` | Claim that becomes the MINT username |
| `identityClaim` | `swissEduIDUniqueID` | Stable identity key for later logins |

edu-ID needs a public `server.externalUrl`, because the callback URL is `<externalUrl>/api/auth/sso/eduid/callback`.

## `plugins`

| Key | Default | Description |
|-----|---------|-------------|
| `loadFromEntryPoints` | `true` | Discover plugins through the `mint.plugins` entry-point group |
| `extraIndexUrls` | `[]` | More Python package indexes for plugin installs. A change needs `plugins.install` |
| `settings` | `{}` | Per-plugin settings, keyed by plugin name. MINT resolves them for decorator-declared config and the plugin settings store |

MINT does not read `plugins.plugins` (config-declared plugins) or `marketplace.autoUpdatePlugins`. It drops them when it loads `config.json` and logs a warning when they are not empty. Install each plugin as a package with a `mint.plugins` entry point. For automatic plugin updates, use [scheduled updates](/admin/updates#scheduled-updates).

## `marketplace`

| Key | Default | Description |
|-----|---------|-------------|
| `registryUrl` | `https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json` | URL of the plugin catalog |
| `cacheTtlMinutes` | `60` | Registry cache lifetime |

## `updates`

For what each setting does, see [Updates](/admin/updates#platform-updates).

| Key | Type | Default |
|-----|------|---------|
| `autoCheckEnabled` | boolean | `false` |
| `checkIntervalHours` | integer, at least `1` | `24` |
| `autoApplyEnabled` | boolean | `false` |
| `autoApplyTime` | `HH:MM`, server-local | `03:00` |
| `autoApplyPlatform` | boolean | `true` |
| `autoApplyPlugins` | boolean | `true` |
| `platformRepo` | `owner/repo` | `MorscherLab/MINT` |
| `githubToken` | string; also read from `MINT_GITHUB_TOKEN` or `GITHUB_TOKEN` | `""` |
| `includePrereleases` | boolean | `false` |
| `pluginSources` | object | `{}` |

The Docker startup update is not a `config.json` key. The container environment variable `MINT_UPDATES__AUTO_APPLY_ON_STARTUP` controls it. See [Runtime bundles](/admin/updates#runtime-bundles).

## `notifications`

MINT delivers the typed events that plugins publish (`@notify`) and the messages of admins. MINT does the delivery, the retries and the recipient policy. Configure the channels in the admin panel; see [Notifications](/admin/platform-settings#notifications).

| Section | Main keys |
|---------|-----------|
| `notifications.email` | `enabled`, `host`, `port`, `tlsMode`, `fromAddress`, `fromName`, `username`, `password` |
| `notifications.teams` | `enabled`, `default`, `channels` |
| `notifications.slack` | `enabled`, `default`, `channels` |
| `notifications.apns` | `enabled`, `transport` (`relay` or `direct`), `topic` (default `org.morscherlab.mint`), `relayUrl`, `relayKey`, `teamId`, `keyId`, `privateKey` |

In `teams` and `slack`, `channels` maps a name (`^[a-z0-9][a-z0-9-]*$`) to `{"webhookUrl": "https://..."}`. `default` names one of the channels. It is empty only when there are no channels.

```json
{
  "notifications": {
    "teams": {
      "enabled": true,
      "default": "lab",
      "channels": {
        "lab": { "webhookUrl": "https://..." },
        "alerts": { "webhookUrl": "https://..." }
      }
    }
  }
}
```

A config with one `webhookUrl` (or `MINT_NOTIFICATIONS__TEAMS__WEBHOOK_URL`) becomes the channel `default`. Manage channels in **Admin -> System -> Notifications**, not in the file, because the panel encrypts each URL. See [Teams and Slack channels](/admin/platform-settings#teams-and-slack-channels).

Enable an integration only after you set its host or webhook fields. Set the Apple Push keys in the admin panel, which encrypts them; see [Push notifications](/admin/platform-settings#push-notifications).

## `audit`

| Key | Default | Description |
|-----|---------|-------------|
| `retentionDays` | `0` | Days to keep audit events (`0`–`36500`). `0` keeps every event |

With `retentionDays` above 0, a daily job deletes older events and records each purge as `audit.purge`. Edit it in **Admin -> System -> Configuration -> Audit log**, or set `MINT_AUDIT__RETENTION_DAYS`.

## `instruments`

| Key | Default | Description |
|-----|---------|-------------|
| `historyRetentionDays` | `0` | Days to keep instrument status history rows (`0`–`36500`). `0` keeps every row |
| `alertWindowHours` | `72` | Hours that an unacknowledged critical alert keeps an instrument critical (`0`–`87600`). `0` turns the window off |

With `historyRetentionDays` above 0, a daily job deletes older rows and records each purge as `instrument_history.purge`. Edit it in **Admin -> System -> Configuration -> Instruments**, or set `MINT_INSTRUMENTS__HISTORY_RETENTION_DAYS`.

The alert window has no field in the panel. Set `instruments.alertWindowHours` in `config.json` or `MINT_INSTRUMENTS__ALERT_WINDOW_HOURS`. The reporting plugin sends the time of the newest critical alert as `latest_critical_at`. A report without it keeps its critical flag. With `0`, an unacknowledged critical alert counts until someone acknowledges it. For what users see, see [Alerts and the alert window](/guide/instruments#alerts-and-the-alert-window).

## `libraries`

| Key | Default | Description |
|-----|---------|-------------|
| `path` | empty | Absolute directory of the [library store](/admin/libraries). Empty means `<server.dataPath>/libraries` |

Set `MINT_LIBRARIES__PATH` to change it. A relative path stops MINT when it loads the config.

## `jobs`

These keys limit the job manager that runs plugin jobs. They apply to in-process, subprocess and Docker plugins. An unset key keeps the SDK default.

| Key | Env var | SDK default |
|-----|---------|-------------|
| `cpuSlots` | `MINT_JOB_CPU_SLOTS` | CPU count minus 1 (at least 1) |
| `maxConcurrentPerUser` | `MINT_JOB_MAX_CONCURRENT_PER_USER` | `2` |
| `maxQueuedJobs` | `MINT_JOB_MAX_QUEUED` | `256` |
| `maxQueuedJobsPerUser` | `MINT_JOB_MAX_QUEUED_PER_USER` | `64` |
| `maxSessions` | `MINT_JOB_MAX_SESSIONS` | `512` |
| `maxSessionsPerUser` | `MINT_JOB_MAX_SESSIONS_PER_USER` | `64` |
| `maxRetainedJobs` | `MINT_JOB_MAX_RETAINED` | `1000` |
| `maxRetainedJobsPerUser` | `MINT_JOB_MAX_RETAINED_PER_USER` | `100` |
| `maxInputBytes` | `MINT_JOB_MAX_INPUT_BYTES` | 8 MiB |
| `maxTempBytesTotal` | `MINT_JOB_MAX_TEMP_BYTES_TOTAL` | 10 GiB |
| `maxTempBytesPerUser` | `MINT_JOB_MAX_TEMP_BYTES_PER_USER` | 2 GiB |
| `maxResultBytes` | `MINT_JOB_MAX_RESULT_BYTES` | 64 MiB |
| `maxManagedResultBytes` | `MINT_JOB_MAX_MANAGED_RESULT_BYTES` | 1 GiB |
| `maxResultBytesTotal` | `MINT_JOB_MAX_RESULT_BYTES_TOTAL` | 10 GiB |
| `maxResultBytesPerUser` | `MINT_JOB_MAX_RESULT_BYTES_PER_USER` | 2 GiB |
| `resultTtlHours` | `MINT_JOB_RESULT_TTL_HOURS` | `24` (at most `168`) |

Rules:

- Every value must be above 0.
- The nested name (for example `MINT_JOBS__CPU_SLOTS`) wins over the `MINT_JOB_*` name.
- MINT gives the resolved values to each subprocess and Docker plugin process as `MINT_JOB_*` variables. A value in the `runtime.env` of a Docker runtime wins for that container.
- `mint-platform serve --cpu-slots N --max-concurrent-per-user N` sets both names. A flag wins over the environment and `.env`.
- The size limit of one object upload is separate: `MINT_MAX_OBJECT_UPLOAD_MB` (default 10240).

## `realtimeEnabled`

```json
{ "realtimeEnabled": true }
```

The realtime event stream is on by default. To turn it off, set this key or `MINT_REALTIME_ENABLED` to `false`. Then `GET /api/events`, `POST /api/presence/activity` and `POST /api/internal/events` do not exist, and the public `features` report `realtime: false`.

When the stream is on, each signed-in browser keeps one `text/event-stream` connection to `GET /api/events`, with a Bearer credential or the session cookie. Experiment and project pages refetch when another user saves, and the experiment page shows who else views it. Plugins with the `realtime` feature can publish their own events.

- One stream subscribes to at most 50 topics (400 `realtime.too_many_topics`). MINT drops a topic that the user cannot read, without an error.
- Every 20 seconds, the stream checks the account and the topics again. A deactivated account, a revoked token or a lost topic ends the stream. The client then connects again with the topics that it can still read.
- Each stream has a queue of 256 events. A full queue becomes one `resync` event, and the client refetches.
- An open stream counts as a viewer for 90 seconds after its last ping.
- Streams and presence live in process memory, so the platform must run as one worker. `mint-platform serve` stops uvicorn with a 5-second graceful shutdown, because an open stream never ends by itself.

For proxy settings, see [Streams and WebSockets](/admin/reverse-proxy#streams-and-websockets).

## `observability`

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `false` | Enable OpenTelemetry tracing for FastAPI, SQLAlchemy and logging. When `false`, instrumentation does nothing |
| `serviceName` | `mint-platform` | Service name in traces |
| `otlpEndpoint` | `http://localhost:4317` | OTLP endpoint URL |
| `otlpProtocol` | `grpc` | OTLP protocol |
| `traceSampleRate` | `1.0` | Trace sampling rate |

With tracing on, each HTTP request gets a span with `url.path` and `url.query`. These URLs carry a secret and get no span, metric or log record: calendar feeds, `/api/users/me/push-devices/…`, `/api/auth/device/…` and `/api/auth/sso/…`.

- To exclude more URLs, set `OTEL_PYTHON_FASTAPI_EXCLUDED_URLS` or `OTEL_PYTHON_EXCLUDED_URLS` to comma-separated regular expressions. MINT matches them against `scheme://host/path`. An invalid pattern stops the start.
- `FASTAPI_OTEL_AUTO_CONFIGURE` has no effect. The `observability` section sets the exporter.

## `access`

| Key | Default | Description |
|-----|---------|-------------|
| `experimentVisibilityMode` | `open` | `open`: normal project-level experiment visibility. `restricted`: a user sees only experiments that they created or collaborate on, and experiments in projects that they can access. See [Collaborators](/guide/experiments#collaborators) |

## `adminTerminalEnabled`

| Key | Env var | Default |
|-----|---------|---------|
| `adminTerminalEnabled` | `MINT_ADMIN_TERMINAL_ENABLED` | `false` |

Turns on **Admin -> System -> Terminal** for users with `platform.configure`. Keep it off unless you need server maintenance from the web UI. See [Admin terminal](/reference/permissions#admin-terminal).

## `corsOrigins`

```json
{ "corsOrigins": ["https://mint.example.org"] }
```

When the list is empty, MINT allows no cross-origin browser calls in production. In dev mode, MINT allows the local origins of the dev server.

## `logging` and `errorReporting`

| Section | Keys |
|---------|------|
| `logging` | `level`, `fileEnabled`, `filePath`, `maxBytes`, `backupCount` |
| `errorReporting` | `enabled`, `githubRepo`, `githubToken`, `minLevel`, `cooldownSeconds`, `labels` |

For `errorReporting`, see [Auto-issued bug reports](/admin/updates#auto-issued-bug-reports).

## Environment variable mapping

Environment variables use the prefix `MINT_` and `__` (double underscore) between nested keys. Names are not case-sensitive. A key binds in snake_case or in camelCase without separators: `MINT_DATABASE__DATABASE_NAME` and `MINT_DATABASE__DATABASENAME` both set `database.databaseName`. The `errorReporting` prefix is `MINT_ERROR_REPORTING__`, for example `MINT_ERROR_REPORTING__MIN_LEVEL`.

An environment variable or a `.env` entry overrides `config.json`, also for the aliased keys (for example `MINT_DB_PASSWORD` over `DB_PASSWORD`, `MINT_DEV_MODE` over `devMode`).

| Config key | Env var |
|------------|---------|
| `devMode` | `MINT_DEV_MODE` |
| `server.dataPath` | `MINT_SERVER__DATA_PATH` |
| `server.trustedProxyCidrs` | `MINT_SERVER__TRUSTED_PROXY_CIDRS` |
| `auth.jwtSecretKey` | `MINT_AUTH__JWT_SECRET_KEY` |
| `auth.allowRegistration` | `MINT_AUTH__ALLOW_REGISTRATION` |
| `auth.requireSecondFactor` | `MINT_AUTH__REQUIRE_SECOND_FACTOR` |
| `auth.patMaxLifetimeDays` | `MINT_AUTH__PAT_MAX_LIFETIME_DAYS` |
| `auth.enableTotp` | `MINT_AUTH__ENABLE_TOTP` |
| `audit.retentionDays` | `MINT_AUDIT__RETENTION_DAYS` |
| `instruments.historyRetentionDays` | `MINT_INSTRUMENTS__HISTORY_RETENTION_DAYS` |
| `instruments.alertWindowHours` | `MINT_INSTRUMENTS__ALERT_WINDOW_HOURS` |
| `libraries.path` | `MINT_LIBRARIES__PATH` |
| `jobs.cpuSlots` | `MINT_JOBS__CPU_SLOTS` (or `MINT_JOB_CPU_SLOTS`) |
| `realtimeEnabled` | `MINT_REALTIME_ENABLED` |
| (not a config key) | `MINT_LISTEN_PORT`: the port that `mint-platform` binds |
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

Booleans accept `true`, `false`, `1` and `0`. You can write JSON values literally.

MINT reads no `MLD_` names, except the `MLD_` JWT-secret aliases. See [Coming from MLD?](/reference/faq#coming-from-mld).

## Storage path layout

`server.dataPath` (default `./data`) holds the platform runtime state:

| Path | Contents |
|------|----------|
| `objects/` | Local experiment objects, when no external object backend is configured |
| `plugin_registry.json` | Plugin registry metadata |
| `marketplace/` | Marketplace registry cache |
| `plugins/uploads/` | Uploaded `.mint` bundles and extracted install payloads |
| `plugins/manifest.json` | Restore manifest for installed plugin bundles |
| `plugins/locks/` | The [plugin dependency lock](/admin/plugins#plugin-dependency-lock): `requirements.in`, `plugins.lock`, `state.json` and `history/`. Startup restores plugins from `state.json` |
| `plugins/<plugin>/venv/` | Virtual environment of a subprocess plugin |
| `plugins/<plugin>/config.json` | Legacy per-plugin settings fallback |
| `logs/mint.log` | Log file when `logging.fileEnabled` is true (default `logging.filePath`) |
| `admin-terminal/startup.sh` | Optional startup script of **Admin -> System -> Terminal** |
| `cache/uv/` | Docker only: uv wheel cache (`UV_CACHE_DIR=/app/data/cache/uv`). MINT restores plugins from it after an image rebuild |

You can remove `marketplace/`; MINT makes it again when necessary. Removing `plugins/locks/history/` deletes the plugin rollback points. Do not remove the rest of `plugins/locks/`.
