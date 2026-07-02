# Configuration

MINT reads configuration from four sources, in increasing order of precedence:

1. **Built-in defaults** — used when no other source overrides them.
2. **`config.json`** — normally `./config.json`; if `MINT_SERVER__DATA_PATH` is set, MINT uses `<dataPath>/config.json` when that file exists or when `./config.json` is absent.
3. **`.env`** — `dotenv`-style key/value pairs in the working directory.
4. **Environment variables** — keys prefixed `MINT_`, with nested fields joined by `__` (e.g., `MINT_DATABASE__MODE=postgresql`).

For most installations, editing `config.json` is the only configuration step. There is no separate `MINT_CONFIG_PATH` setting in the current platform; choose the config location by running from the directory that contains `config.json`, or by setting `MINT_SERVER__DATA_PATH` and placing the file at `<dataPath>/config.json`. Environment variables are useful for containerized deployments where a config file is awkward.

## Top-level schema

```json
{
  "platformName": "MINT",
  "devMode": false,
  "setupCompleted": false,
  "adminTerminalEnabled": false,
  "server": { "...": "..." },
  "database": { "...": "..." },
  "auth": { "...": "..." },
  "sso": { "...": "..." },
  "plugins": { "...": "..." },
  "marketplace": { "...": "..." },
  "updates": { "...": "..." },
  "logging": { "...": "..." },
  "errorReporting": { "...": "..." },
  "observability": { "...": "..." },
  "access": { "...": "..." },
  "corsOrigins": []
}
```

The full schema is defined in [`api/config/models.py`](https://github.com/MorscherLab/MINT/blob/main/api/config/models.py) using Pydantic — that file is the authoritative reference. The summary below covers the keys most installations touch.

## `devMode`

```json
{ "devMode": false }
```

When `true`:

- Authentication is bypassed on every route; anyone hitting the URL is treated as admin
- Database mode is forced to local SQLite, regardless of the configured database section

::: warning Never expose dev mode
Dev mode is for local development and evaluation only. Never enable it on a host reachable from the network.
:::

## `server`

| Key | Default | Description |
|-----|---------|-------------|
| `apiMountPath` | `/api` | API mount path |
| `dataPath` | `./data` | Runtime state directory |
| `rpId` | `""` | WebAuthn relying-party ID |
| `rpName` | `MINT` | WebAuthn relying-party display name |
| `externalUrl` | `""` | Public platform URL, used for frontend/plugin context |

## `database`

| Key | Default | Description |
|-----|---------|-------------|
| `mode` | `none` | One of `none` (auth/passkeys only; experiments/projects disabled), `sqlite`, `postgresql` |
| `host` | `localhost` | PostgreSQL host |
| `port` | `5432` | PostgreSQL port |
| `databaseName` | `mint_db` | PostgreSQL database name |

```json
{
  "database": {
    "mode": "postgresql",
    "host": "localhost",
    "port": 5432,
    "databaseName": "mint_db"
  },
  "DB_USERNAME": "mint",
  "DB_PASSWORD": "secret"
}
```

PostgreSQL credentials are top-level settings named `DB_USERNAME` and `DB_PASSWORD` in `config.json` (or `MINT_DB_USERNAME` / `MINT_DB_PASSWORD` in the environment), not nested under `database`.

## `auth`

| Key | Default | Description |
|-----|---------|-------------|
| `enableAuth` | `true` | Require authentication |
| `enablePasskey` | `true` | Enable WebAuthn registration and login |
| `jwtSecretKey` | auto-generated if empty | Secret used to sign JWTs |
| `tokenExpireMinutes` | `1440` | Token lifetime |

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

edu-ID SSO requires database-backed users (`database.mode` must be `sqlite` or `postgresql`) and a public `server.externalUrl`, because the callback URL is `<externalUrl>/api/auth/sso/eduid/callback`.

## `plugins`

| Key | Default | Description |
|-----|---------|-------------|
| `loadFromEntryPoints` | `true` | Discover plugins via the `mint.plugins` entry-point group |
| `plugins` | `[]` | Explicit plugin module/class entries from config |
| `extraIndexUrls` | `[]` | Additional Python package indexes for plugin installs |
| `settings` | `{}` | Centralized per-plugin settings passed to `apply_settings()` |

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
| `checkIntervalHours` | `24` | Polling interval |
| `platformRepo` | `MorscherLab/MINT` | Source of platform releases |
| `githubToken` | `""` | Optional GitHub API token; also read from `MINT_GITHUB_TOKEN` or `GITHUB_TOKEN` |
| `includePrereleases` | `false` | Include prereleases when checking GitHub releases |
| `pluginSources` | `{}` | Per-plugin GitHub release sources |

See [Updates](/workflow/updates) for the wider picture.

Docker startup auto-update is controlled by the container entrypoint environment variable `MINT_UPDATES__AUTO_APPLY_ON_STARTUP`, not by `config.json`.

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

When enabled, users with `platform.configure` can use **Admin → Terminal** to open a short-lived shell inside the running MINT container/process and maintain a persisted startup script under `server.dataPath/admin-terminal/startup.sh`. Keep this off by default; it is intended for tightly controlled server administration, not routine plugin use.

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

Nested keys use `__` (double underscore) as the separator, and `MINT_` as the prefix. Examples:

| Config key | Env var |
|------------|---------|
| `devMode` | `MINT_DEV_MODE` |
| `server.dataPath` | `MINT_SERVER__DATA_PATH` |
| `database.mode` | `MINT_DATABASE__MODE` |
| `database.databaseName` | `MINT_DATABASE__DATABASE_NAME` |
| `auth.jwtSecretKey` | `MINT_AUTH__JWT_SECRET_KEY` |
| `sso.eduid.enabled` | `MINT_SSO__EDUID__ENABLED` |
| `sso.eduid.clientId` | `MINT_SSO__EDUID__CLIENT_ID` |
| `marketplace.registryUrl` | `MINT_MARKETPLACE__REGISTRY_URL` |
| `updates.platformRepo` | `MINT_UPDATES__PLATFORM_REPO` |
| `adminTerminalEnabled` | `MINT_ADMIN_TERMINAL_ENABLED` |

Booleans accept `true`/`false`/`1`/`0`. JSON values can be embedded literally.

## Storage path layout

The configured `server.dataPath` (default `./data`) holds platform runtime state:

| Subdirectory | Contents |
|--------------|----------|
| `mint.db` | SQLite database when `database.mode` is `sqlite` |
| `passkeys.json` | Passkey storage in local/file-backed mode |
| `plugin_registry.json` | Persistent plugin registry metadata |
| `marketplace/` | Marketplace registry cache |
| `plugins/uploads/` | Uploaded `.mint` bundles and extracted install payloads |
| `plugins/manifest.json` | Restore manifest for dynamically installed plugin bundles |
| `plugins/snapshots/` | Pre-install / pre-upgrade Python environment snapshots |
| `plugins/<plugin>/venv/` | Isolated plugin virtual environments when subprocess isolation is used |
| `plugins/<plugin>/config.json` | Legacy per-plugin settings fallback |
| `admin-terminal/startup.sh` | Optional startup script managed by **Admin → Terminal** |

Removing `marketplace/` is safe; it regenerates on demand. Removing `plugins/snapshots/` discards rollback history.

## Next

→ [Install on Linux (direct)](/get-started/install-direct) — start the platform with a given config
→ [Platform commands](/cli/platform) — `mint experiment`, `mint project`, …
