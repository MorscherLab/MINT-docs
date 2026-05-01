# Configuration

MINT reads configuration from four sources, in increasing order of precedence:

1. **Built-in defaults** — used when no other source overrides them.
2. **`config.json`** — a file passed to the platform process (typically `/etc/mint/config.json` for system installs or `./config.json` for dev), or at `~/.config/mint/config.json`.
3. **`.env`** — `dotenv`-style key/value pairs in the working directory.
4. **Environment variables** — keys prefixed `MINT_`, with nested keys joined by `__` (e.g., `MINT_DATABASE__MODE=postgresql`).

For most installations, editing `config.json` is the only configuration step. Environment variables are useful for containerized deployments where a config file is awkward.

## Top-level schema

```json
{
  "devMode": false,
  "database": { "...": "..." },
  "auth": { "...": "..." },
  "plugins": { "...": "..." },
  "marketplace": { "...": "..." },
  "updates": { "...": "..." },
  "observability": { "...": "..." }
}
```

The full schema is defined in [`api/config/models.py`](https://github.com/MorscherLab/mld/blob/main/api/config/models.py) using Pydantic — that file is the authoritative reference. The summary below covers the keys most installations touch.

## `devMode`

```json
{ "devMode": false }
```

When `true`:

- Authentication is bypassed on every route — anyone hitting the URL is treated as admin
- Database mode is forced to PostgreSQL at `localhost:5432`, db `mint_dev`, user/pw `mint`
- Rate limits are disabled
- Logging is verbose

::: warning Never expose dev mode
Dev mode is for local development and evaluation only. Never enable it on a host reachable from the network.
:::

## `database`

| Key | Default | Description |
|-----|---------|-------------|
| `mode` | `none` | One of `none` (file-based, single-user), `sqlite`, `postgresql` |
| `url` | (depends on mode) | Connection string. Required for `postgresql` |
| `path` | (depends on mode) | Filesystem path for SQLite or `none` mode |
| `pool` | `{ "min": 1, "max": 10 }` | Connection pool sizing for `postgresql` |

```json
{
  "database": {
    "mode": "postgresql",
    "url": "postgresql+asyncpg://mint:secret@localhost:5432/mint",
    "pool": { "min": 2, "max": 20 }
  }
}
```

## `auth`

| Key | Default | Description |
|-----|---------|-------------|
| `jwtSecret` | (none — required) | 32+ random bytes used to sign JWTs |
| `jwtTtlHours` | `24` | Token lifetime |
| `passkeysEnabled` | `true` | Enable WebAuthn registration and login |
| `localLoginEnabled` | `true` | Allow password login. Disable when relying on SSO. |
| `sso` | `null` | OIDC provider config — see [Authentication](/workflow/auth-passkeys#single-sign-on-sso) |

## `plugins`

| Key | Default | Description |
|-----|---------|-------------|
| `loadFromEntryPoints` | `true` | Discover plugins via the `mld.plugins` entry-point group |
| `pin` | `{}` | Per-plugin version pins to opt out of auto-update — see [Updates](/workflow/updates#pinning) |
| `dataDir` | `./plugin-data` | Filesystem location where plugins store artifacts |

## `marketplace`

| Key | Default | Description |
|-----|---------|-------------|
| `registryUrl` | `https://marketplace.morscherlab.org` | Where to fetch the plugin catalog |
| `requireApproval` | `true` | Non-admin install requests require admin approval |
| `checkIntervalHours` | `24` | How often to refresh the registry |

## `updates`

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `true` | Master toggle |
| `channel` | `stable` | `stable` or `beta` |
| `checkIntervalHours` | `24` | Polling interval |
| `githubRepo` | `MorscherLab/mld` | Source of platform releases |
| `autoInstall` | `false` | Auto-install discovered platform updates |

See [Updates](/workflow/updates) for the wider picture.

## `observability`

| Key | Default | Description |
|-----|---------|-------------|
| `tracing.enabled` | `false` | Enable OpenTelemetry tracing |
| `tracing.exporter` | `otlp` | `otlp` or `console` |
| `tracing.endpoint` | (none) | OTLP endpoint URL |
| `autoIssue` | `false` | Auto-open GitHub issues on unhandled exceptions |

When `tracing.enabled` is `false`, all instrumentation is a no-op — no overhead.

## Environment variable mapping

Nested keys use `__` (double underscore) as the separator, and `MINT_` as the prefix. Examples:

| Config key | Env var |
|------------|---------|
| `devMode` | `MINT_DEV_MODE` |
| `database.mode` | `MINT_DATABASE__MODE` |
| `database.url` | `MINT_DATABASE__URL` |
| `auth.jwtSecret` | `MINT_AUTH__JWT_SECRET` |
| `marketplace.registryUrl` | `MINT_MARKETPLACE__REGISTRY_URL` |

Booleans accept `true`/`false`/`1`/`0`. JSON values can be embedded literally.

## Storage path layout

The configured `plugins.dataDir` (default `./plugin-data`) holds:

| Subdirectory | Contents |
|--------------|----------|
| `<plugin-slug>/artifacts/` | User-uploaded files for that plugin |
| `<plugin-slug>/cache/` | Cached intermediate state |
| `<plugin-slug>/snapshots/` | Pre-upgrade snapshots used for rollback |
| `_uploads/` | Temporary upload buffer; cleared on restart |

Removing `cache/` is safe; it regenerates on demand. Removing `snapshots/` discards rollback history.

## Next

→ [Install on Linux (direct)](/get-started/install-direct) — start the platform with a given config
→ [Platform commands](/cli/platform) — `mint experiment`, `mint project`, …
