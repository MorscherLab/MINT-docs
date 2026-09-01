# Install on Linux (direct)

Install MINT directly on a Linux server using `uv` (recommended) or `pip`. The Python wheel bundles the FastAPI backend and the Vue 3 frontend; the `mint` CLI ships in a separate package (`mint-sdk`) that's pulled in as a dependency.

::: tip Picking an install method
MINT is supported on **Linux servers only**, via either this direct install or the [Docker install](/get-started/install-docker). Pick:

- **Direct** when you want process-level control — systemd unit, OS-level monitoring, host-managed Postgres.
- **Docker** when you want a self-contained, reproducible deployment — pinned image, declarative env, clean upgrades.

Both result in identical platform behavior; choose based on your operations preference.
:::

> [Screenshot: MINT home dashboard after a fresh direct install]

## Requirements

| | |
|---|---|
| **Operating system** | Linux server (x86_64 or arm64) — any modern distribution with glibc 2.28+ (Debian 11+, Ubuntu 20.04+, RHEL 9+, …) |
| **Python** | 3.12 or newer — install via the distro package manager or [`uv python install`](https://docs.astral.sh/uv/concepts/python-versions/) |
| **uv** | Required at runtime for plugin installs and isolated plugin environments; install it somewhere the `mint` service user can run |
| **Database** | PostgreSQL 14+ (required) |
| **Disk** | ~2 GB for MINT + room for plugin venvs and uploaded artifacts |
| **RAM** | 4 GB minimum, 8 GB recommended once plugins are installed |
| **Reverse proxy** | Required for production: nginx, Caddy, or Traefik to terminate TLS |

::: tip PostgreSQL is required
MINT 1.2 uses PostgreSQL for every platform deployment. The SDK still supports SQLite for a plugin running standalone, but that local database is not a MINT platform backend.
:::

## Install the wheel

Install `uv` first. Even if you install the platform wheel with `pip`, MINT uses `uv` later to install marketplace plugins and manage isolated plugin environments.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
sudo install -m 755 "$(command -v uv)" /usr/local/bin/uv
```

Then pick your preferred installer:

::: code-group

```bash [uv (recommended)]
# Create a dedicated user and venv for the platform process
sudo useradd --system --create-home --shell /usr/sbin/nologin mint
sudo install -o mint -g mint -m 750 -d /opt/mint /var/lib/mint /var/log/mint
sudo -u mint bash -c '
  uv venv /opt/mint/venv --python 3.12
  /opt/mint/venv/bin/pip install mint
'
```

```bash [pip]
sudo useradd --system --create-home --shell /usr/sbin/nologin mint
sudo install -o mint -g mint -m 750 -d /opt/mint /var/lib/mint /var/log/mint
sudo -u mint bash -c '
  python3.12 -m venv /opt/mint/venv
  /opt/mint/venv/bin/pip install mint
'
```

:::

This installs the platform package (`mint`) plus its dependencies (including `mint-sdk`, which provides the `mint` CLI binary at `/opt/mint/venv/bin/mint`). The platform itself runs as a long-lived single-worker ASGI process — see "Run as a systemd service" below.

::: tip Get the `mint` CLI on your shell PATH
The `mint` CLI is convenient for admins running platform-data commands (`mint auth login`, `mint experiment list`). To make it globally available, install `mint-sdk` separately as a uv tool:

```bash
uv tool install mint-sdk
```

This is independent of the platform's own venv and only affects the admin's shell PATH.
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
    "enablePasskey": true
  },
  "plugins": {
    "loadFromEntryPoints": true
  },
  "marketplace": {
    "registryUrl": "https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json"
  }
}
```

Generate a JWT secret with `openssl rand -base64 32` and never commit it. MINT reads `config.json` from `MINT_CONFIG_PATH` when that variable is set, otherwise from the working directory, or from `<server.dataPath>/config.json` when `MINT_SERVER__DATA_PATH` is set and that data-path file should win. The systemd unit below sets `MINT_SERVER__DATA_PATH=/var/lib/mint`, so `/var/lib/mint/config.json` is the file that will be loaded. Configuration priority is: environment variables (`MINT_` prefix) > `.env` > `config.json` > defaults. See [CLI configuration](/cli/configuration) for the full schema.

## Initialize the database

Schema migrations run automatically on platform startup. The first time the platform process launches, it:

1. Connects to the configured database
2. Applies any pending platform migrations
3. For each plugin discovered via entry points, runs the plugin's pending migrations under a Postgres advisory lock so concurrent replicas don't race

A migration failure logs the error and exits the process non-zero. Watch the systemd journal (`journalctl -u mint -f`) on first start to confirm a clean migration run.

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
WorkingDirectory=/var/lib/mint
Environment=PATH=/opt/mint/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=MINT_SERVER__DATA_PATH=/var/lib/mint
ExecStart=/opt/mint/venv/bin/uvicorn api.main:create_app --factory --host 127.0.0.1 --port 8001
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/mint /var/log/mint

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mint
sudo systemctl status mint
```

::: warning Bind to 127.0.0.1, not 0.0.0.0
The platform's uvicorn process does not terminate TLS or do aggressive header validation. Always bind to `127.0.0.1` on the host and put a reverse proxy in front.
:::

## Reverse proxy

::: code-group

```nginx [nginx]
# /etc/nginx/sites-available/mint
server {
    listen 443 ssl http2;
    server_name mint.example.org;

    ssl_certificate     /etc/letsencrypt/live/mint.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mint.example.org/privkey.pem;

    client_max_body_size 1G;

    location / {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
```

```text [Caddy]
mint.example.org {
    reverse_proxy 127.0.0.1:8001
    request_body {
        max_size 1GB
    }
}
```

:::

Caddy auto-issues TLS certificates; nginx pairs naturally with `certbot`. Either way, make sure `X-Forwarded-For` is forwarded so MINT's rate limiter sees real client IPs. MINT trusts forwarded headers only from `127.0.0.1/32` and `::1/128` by default; if your proxy is not local loopback, add only its address or CIDR to `server.trustedProxyCidrs`.

## First-run setup

Open the public URL in your browser. On a fresh install you'll see the **Setup** page (only shown when no admin exists). Create the first admin account; everything else is configured from the in-app **Admin** view.

> [Screenshot: setup page showing the first-admin form]

After setup:

1. Configure notification delivery and the marketplace registry from **Admin -> Platform -> Configuration** and **Admin -> Plugins -> Registry**
2. Create your first **Project** (see [Projects](/workflow/projects))
3. Invite team members and assign system roles (see [Members & roles](/workflow/members-roles))

## Upgrades

```bash
sudo -u mint /opt/mint/venv/bin/pip install --upgrade mint
sudo systemctl restart mint
```

For zero-downtime upgrades, run two MINT replicas behind the load balancer and rolling-restart them. The advisory-lock-aware migration runner handles concurrent startups safely on Postgres.

See [Updates](/workflow/updates) for the in-app upgrade flow and rollback support.

::: tip Runtime daemon
Source-checkout and runtime-bundle installs can also run the current foreground
server through `mint daemon`. It wraps the same ASGI app with one host worker
for sessions, plugin jobs, global CPU slots, and per-user job limits. Use
`--forwarded-allow-ips` only for known proxy addresses or CIDRs.
:::

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: mint` (admin shell) | Install the CLI as a uv tool: `uv tool install mint-sdk`, then `uv tool update-shell`. |
| Service can't find `uvicorn` | The systemd unit must point at the venv's binary, e.g. `/opt/mint/venv/bin/uvicorn`, not a global one. |
| Port 8001 already in use | Change `--port` in the systemd unit, or `lsof -i :8001` to find the conflicting process. |
| Migration fails with advisory-lock error | Two MINT processes started simultaneously and both tried to migrate. Stop one, let the other finish, then restart. |
| 502 from the reverse proxy | MINT failed to start or crashed. Check `journalctl -u mint -n 200` for the trace. |
| Rate limit fires for every request | The proxy isn't forwarding `X-Forwarded-For`, or its address is missing from `server.trustedProxyCidrs`. |
| Plugin install fails with `uv` not found | The plugin manager uses `uv` to install plugins into isolated venvs. Install it system-wide so the `mint` user can invoke it. |

## Next step

→ [First experiment (5 minutes)](/get-started/quickstart)

Or, for a self-contained Docker deployment instead of direct:

→ [Install with Docker](/get-started/install-docker)
