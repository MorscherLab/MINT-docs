# Install on Linux (direct)

Install MINT directly on a Linux server from the platform runtime bundle attached to each [GitHub release](https://github.com/MorscherLab/MINT/releases). The bundle contains the FastAPI backend, the built Vue frontend, the Python SDK source, and a locked dependency list; `uv` installs it into a local environment and `mint daemon` runs it.

::: tip Picking an install method
MINT is supported on **Linux servers only**, via either this direct install or the [Docker install](/admin/install-docker). Pick:

- **Direct** when you want process-level control — systemd unit, OS-level monitoring, host-managed Postgres.
- **Docker** when you want a self-contained, reproducible deployment — pinned image, declarative env, clean upgrades.

Both result in identical platform behavior; choose based on your operations preference.
:::

> [Screenshot: MINT home dashboard after a fresh direct install]

## Requirements

| | |
|---|---|
| **Operating system** | Linux server (x86_64 or arm64) — any modern distribution with glibc 2.28+ (Debian 11+, Ubuntu 20.04+, RHEL 9+, …) |
| **Python** | 3.14 or newer — install via the distro package manager or [`uv python install`](https://docs.astral.sh/uv/concepts/python-versions/). Plugin installs accept only wheels that install on this interpreter, so each compiled dependency of a plugin needs a `cp314` or `abi3` wheel |
| **uv** | Required at runtime for plugin installs and isolated plugin environments; install it somewhere the `mint` service user can run |
| **Database** | PostgreSQL 14+ (required) |
| **Disk** | ~2 GB for MINT + room for plugin venvs and uploaded artifacts |
| **RAM** | 4 GB minimum, 8 GB recommended once plugins are installed |
| **Reverse proxy** | Required for production: nginx, Caddy, or Traefik to terminate TLS |

::: tip PostgreSQL is required
MINT 1.2 uses PostgreSQL for every platform deployment. The SDK still supports SQLite for a plugin running standalone, but that local database is not a MINT platform backend.
:::

## Install the runtime bundle

Install `uv` first. MINT also uses `uv` at runtime to install marketplace plugins and manage isolated plugin environments.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
sudo install -m 755 "$(command -v uv)" /usr/local/bin/uv
```

Create a service user and directories, then download and unpack the release bundle:

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin mint
sudo install -o mint -g mint -m 750 -d /opt/mint /var/lib/mint /var/log/mint

VERSION=@MINT_VERSION@
curl -LO "https://github.com/MorscherLab/MINT/releases/download/v${VERSION}/mint-platform-${VERSION}.tar.gz"
sudo -u mint tar -xzf "mint-platform-${VERSION}.tar.gz" -C /opt/mint --strip-components=1
```

Install the locked dependencies. The bundle has no Git history, so pass the version explicitly:

```bash
sudo -u mint env UV_CACHE_DIR=/var/lib/mint/uv-cache \
  SETUPTOOLS_SCM_PRETEND_VERSION=@MINT_VERSION@ \
  uv sync --project /opt/mint --frozen --no-dev --python 3.14
```

This creates `/opt/mint/.venv` with the platform and `mint-sdk[cli,server,local-db]`, which supplies the `mint` binary at `/opt/mint/.venv/bin/mint`. The platform runs as one long-lived process; see "Run as a systemd service" below.

::: tip Get the `mint` CLI on your shell PATH
The `mint` CLI is convenient for admins running platform-data commands (`mint auth login`, `mint experiment list`). To make it globally available, install `mint-sdk[cli]` separately as a uv tool:

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
```

The `[cli]` extra supplies Typer for commands such as `mint init` and `mint auth`. This tool environment is separate from the platform environment. See [CLI installation](/admin/cli#install) for the runtime/CLI/server distinction.
:::

## Configure

Create `/var/lib/mint/config.json`:

```json
{
  "devMode": false,
  "server": {
    "dataPath": "/var/lib/mint",
    "externalUrl": "https://mint.example.org",
    "rpId": "mint.example.org"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "databaseName": "mint_db"
  },
  "DB_USERNAME": "mint",
  "DB_PASSWORD": "CHANGEME",
  "auth": {
    "jwtSecretKey": "<generate a 32-byte random string>",
    "enablePasskey": true,
    "allowRegistration": false
  },
  "plugins": {
    "loadFromEntryPoints": true
  },
  "marketplace": {
    "registryUrl": "https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json"
  }
}
```

Generate a JWT secret with `openssl rand -base64 32` and never commit it. MINT reads `config.json` from `MINT_CONFIG_PATH` when that variable is set, otherwise from the working directory, or from `<server.dataPath>/config.json` when `MINT_SERVER__DATA_PATH` is set and that data-path file should win. The systemd unit below sets `MINT_SERVER__DATA_PATH=/var/lib/mint`, so `/var/lib/mint/config.json` is the file that will be loaded. Settings to decide before users arrive:

| Setting | Default | Why it matters |
|---------|---------|----------------|
| `server.externalUrl` | empty | Public URL. With `https://`, login cookies carry `Secure` even though the proxy talks plain HTTP to MINT. |
| `server.rpId` | empty | Passkey relying-party ID. Empty derives it from the request host. |
| `auth.allowRegistration` | `true` | When `true`, anyone who can reach the login page can create an account with the default role (Member). Set `false` to create accounts only with `mint admin user create`. |
| `auth.failedLoginLimit` / `auth.loginLockoutMinutes` | `5` / `15` | Failed password logins before a temporary lockout, and its length. |

Configuration priority is: environment variables (`MINT_` prefix) > `.env` > `config.json` > defaults. See [CLI configuration](/admin/configuration) for the full schema.

## Initialize the database

Schema migrations run automatically on platform startup. The first time the platform process launches, it:

1. Connects to the configured database
2. Applies any pending platform migrations
3. For each plugin discovered via entry points, runs the plugin's pending migrations under a PostgreSQL advisory lock

A platform migration failure logs the error and exits the process non-zero. A plugin migration failure does not stop MINT: that plugin stays disabled and the error shows in **Admin -> Plugins -> Installed**. Watch the systemd journal (`journalctl -u mint -f`) on first start to confirm a clean migration run.

## Run as a systemd service

```ini
# /etc/systemd/system/mint.service
[Unit]
Description=MINT platform
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=mint
Group=mint
WorkingDirectory=/opt/mint
Environment=PATH=/opt/mint/.venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=MINT_SERVER__DATA_PATH=/var/lib/mint
Environment=UV_CACHE_DIR=/var/lib/mint/uv-cache
ExecStart=/opt/mint/.venv/bin/mint daemon --platform-dir /opt/mint --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/mint /var/lib/mint /var/log/mint

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mint
sudo systemctl status mint
```

`Restart=always` makes systemd start MINT again after a restart that MINT requests itself, which exits the process with status 0. To allow [scheduled updates](/admin/updates#scheduled-updates), also add `Environment=MINT_RESTART_SUPERVISED=1` to the unit. Alternatively, `mint platform daemon install-service` writes a user-level unit with `Restart=always` and `Environment=MINT_DAEMON=1`, which also allows scheduled updates.

::: warning Bind to 127.0.0.1, not 0.0.0.0
`mint daemon` serves plain HTTP and does not terminate TLS. Always bind to `127.0.0.1` on the host and put a reverse proxy in front. It trusts forwarded headers only from `127.0.0.1` and `::1`; change that with `--forwarded-allow-ips` only for known proxy addresses.
:::

::: warning Run one process
MINT keeps rate limits, the post-setup restart handoff, and several caches in process memory. Run a single process per deployment; startup fails if it detects multiple workers.
:::

## Reverse proxy and first-run setup

See [Reverse proxy and first-run setup](/admin/proxy-and-setup).

## Upgrades

Take a database backup, then apply the new release from **Admin -> Plugins -> Installed** (see [Updates](/admin/updates)). On this install path MINT downloads the release's runtime bundle into `/opt/mint` and asks for a restart:

```bash
sudo systemctl restart mint
```

To upgrade by hand instead, repeat [Install the runtime bundle](#install-the-runtime-bundle) with the new version and restart the service. Platform migrations are forward-only; plan a maintenance window, and restore the database backup if you must roll back.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: mint` (admin shell) | Install the CLI as a uv tool: `uv tool install 'mint-sdk[cli]==@MINT_VERSION@'`, then `uv tool update-shell`. |
| Service can't find `mint` | The systemd unit must point at the environment's binary, `/opt/mint/.venv/bin/mint`, not a global one. |
| Port 8001 already in use | Change `--port` in the systemd unit, or `lsof -i :8001` to find the conflicting process. |
| A plugin shows **Migration failed** | The plugin's migration raised; MINT keeps running without it. Read the error in **Admin -> Plugins -> Installed** and install a fixed plugin release. |
| 502 from the reverse proxy | MINT failed to start or crashed. Check `journalctl -u mint -n 200` for the trace. |
| Rate limit fires for every request | The proxy isn't forwarding `X-Forwarded-For`, or its address is missing from `server.trustedProxyCidrs`. |
| Plugin install fails with `uv` not found | The plugin manager uses `uv` to lock and install plugins, including isolated venvs. Install it system-wide so the `mint` user can invoke it. |

## Next step

→ [First experiment (5 minutes)](/guide/quickstart)

Or, for a self-contained Docker deployment instead of direct:

→ [Install with Docker](/admin/install-docker)
