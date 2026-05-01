# Install on Linux (direct)

Install MINT directly on a Linux server using `uv` (recommended) or `pip`. The Python wheel bundles the FastAPI backend, the Vue 3 frontend, and the `mint` CLI in one artifact.

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
| **Database** | PostgreSQL 14+ (recommended) or SQLite for single-server installs |
| **Disk** | ~2 GB for MINT + room for plugin venvs and uploaded artifacts |
| **RAM** | 4 GB minimum, 8 GB recommended once plugins are installed |
| **Reverse proxy** | Required for production: nginx, Caddy, or Traefik to terminate TLS |

::: tip Why Postgres for shared deployments
The plugin loader uses advisory locks so plugin schema migrations only run once across replicas. Advisory locks are a Postgres-only feature — SQLite installations work for single-server use but cannot be horizontally scaled.
:::

## Install the wheel

Pick your preferred installer:

::: code-group

```bash [uv (recommended)]
# Install uv if not already present: https://docs.astral.sh/uv/
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install MINT as a tool — uv manages an isolated venv
uv tool install mint
```

```bash [pip]
# Use a dedicated user and venv to isolate MINT from the system Python
sudo useradd --system --create-home --shell /usr/sbin/nologin mint
sudo -u mint bash -c '
  python3.12 -m venv ~/venv
  ~/venv/bin/pip install mint
'
```

:::

The wheel bundles everything MINT needs: the FastAPI backend, the Vue 3 frontend, and the `mint` CLI.

## Configure

Create `/etc/mint/config.json` (or anywhere `mint serve --config <path>` can find it):

```json
{
  "devMode": false,
  "database": {
    "mode": "postgresql",
    "url": "postgresql+asyncpg://mint:CHANGEME@localhost:5432/mint"
  },
  "auth": {
    "jwtSecret": "<generate a 32-byte random string>",
    "passkeysEnabled": true
  },
  "plugins": {
    "loadFromEntryPoints": true,
    "dataDir": "/var/lib/mint/plugin-data"
  },
  "marketplace": {
    "registryUrl": "https://marketplace.morscherlab.org",
    "requireApproval": true
  }
}
```

Generate a JWT secret with `python3 -c "import secrets; print(secrets.token_urlsafe(32))"` and never commit it. Configuration priority is: environment variables (`MINT_` prefix) > `.env` > `config.json` > defaults. See [CLI configuration](/cli/configuration) for the full schema.

## Initialize the database

Schema migrations run automatically on first launch. To validate them ahead of starting the service:

```bash
mint serve --migrate-only --config /etc/mint/config.json
```

This applies platform migrations (`api/migrations/versions/v001`–`v011`) and any plugin migrations from plugins already installed via entry points. Exits non-zero if any migration fails.

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
Environment=MINT_CONFIG_PATH=/etc/mint/config.json
ExecStart=/usr/local/bin/mint serve --host 127.0.0.1 --port 8001
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
`mint serve` does not terminate TLS or do aggressive header validation. Always bind to `127.0.0.1` on the host and put a reverse proxy in front.
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

Caddy auto-issues TLS certificates; nginx pairs naturally with `certbot`. Either way, make sure `X-Forwarded-For` is forwarded so MINT's rate limiter sees real client IPs.

## First-run setup

Open the public URL in your browser. On a fresh install you'll see the **Setup** page (only shown when no admin exists). Create the first admin account; everything else is configured from the in-app **Admin** view.

> [Screenshot: setup page showing the first-admin form]

After setup:

1. Configure SMTP and the marketplace registry from **Admin → Settings**
2. Create your first **Project** (see [Projects](/workflow/projects))
3. Invite team members and assign system roles (see [Members & roles](/workflow/members-roles))

## Upgrades

```bash
# uv
uv tool upgrade mint
sudo systemctl restart mint

# pip
sudo -u mint ~mint/venv/bin/pip install --upgrade mint
sudo systemctl restart mint
```

For zero-downtime upgrades, run two MINT replicas behind the load balancer and rolling-restart them. The advisory-lock-aware migration runner handles concurrent startups safely on Postgres.

See [Updates](/workflow/updates) for the in-app upgrade flow and rollback support.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: mint` | The install location isn't on `PATH`. With `uv tool install`, run `uv tool update-shell`. With `pip install`, ensure the venv's `bin/` is on the service's `PATH` (the systemd unit above uses an absolute path). |
| Port 8001 already in use | Change `--port` in the systemd unit, or `lsof -i :8001` to find the conflicting process. |
| Migration fails with advisory-lock error | Two MINT processes started simultaneously and both tried to migrate. Stop one, let the other finish, then restart. |
| 502 from the reverse proxy | MINT failed to start or crashed. Check `journalctl -u mint -n 200` for the trace. |
| Rate limit fires for every request | The proxy isn't forwarding `X-Forwarded-For`. Add the header in the proxy config. |
| Plugin install fails with `uv` not found | The plugin manager uses `uv` to install plugins into isolated venvs. Install it system-wide so the `mint` user can invoke it. |

## Next step

→ [First experiment (5 minutes)](/get-started/quickstart)

Or, for a self-contained Docker deployment instead of direct:

→ [Install with Docker](/get-started/install-docker)
