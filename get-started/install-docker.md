# Install on Linux (Docker)

Run MINT as a Docker container, with Postgres alongside. Stable releases use published images; the current 1.2 beta must be built from the `1.2-dev` source branch.

::: tip Picking an install method
MINT is supported on **Linux servers only**, via either Docker (this page) or the [direct install](/get-started/install-direct). Pick Docker when you want a self-contained, version-pinned deployment with clean rollback.
:::

> [Screenshot: MINT home dashboard after a fresh Docker install]

## Requirements

| | |
|---|---|
| **Operating system** | Linux server (x86_64 or arm64) running Docker Engine 24+ |
| **Docker Compose** | v2 (the `docker compose` subcommand, not the legacy `docker-compose` script) |
| **Disk** | ~2 GB for the image + Postgres data + plugin artifact volumes |
| **RAM** | 4 GB minimum, 8 GB recommended once plugins are installed |
| **Reverse proxy** | Required for production: nginx, Caddy, or Traefik on the host or in another container |

## Published images and the 1.2 beta

The published Docker install remains stable-only; no 1.2 beta image is available. Check [GitHub Releases](https://github.com/MorscherLab/MINT/releases) for published production images.

To evaluate 1.2 now, build the repository's checked-in Compose stack from `1.2-dev`:

```bash
git clone https://github.com/MorscherLab/MINT.git /opt/mint
cd /opt/mint
git checkout 1.2-dev
cp .env.example .env
openssl rand -hex 32
```

Paste the generated value into `MINT_DB_PASSWORD` in `.env`. To keep the app behind a host reverse proxy, also add `MLD_PORT=127.0.0.1:8001`. Then build and start the exact source checkout:

```bash
docker compose -f deploy/docker/docker-compose.yml up -d --build --wait
docker compose -f deploy/docker/docker-compose.yml logs -f app
```

These commands match the source Compose file: it builds `deploy/docker/Dockerfile`, starts PostgreSQL 17, and persists PostgreSQL in the `mint-postgres-data` volume. Treat `1.2-dev` as evaluation software until a stable 1.2 image is published.

Expected output once startup completes (uvicorn is the platform's process):

```
app  | INFO:     Started server process [1]
app  | INFO:     Waiting for application startup.
app  | INFO:     Application startup complete.
app  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

With `MLD_PORT=127.0.0.1:8001`, Compose binds the container's port 8000 to `127.0.0.1:8001` on the host. MINT is **not** directly reachable from the network until you put a reverse proxy in front.

## Reverse proxy

::: code-group

```nginx [nginx (host)]
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

```text [Caddy (host)]
mint.example.org {
    reverse_proxy 127.0.0.1:8001
    request_body {
        max_size 1GB
    }
}
```

```yaml [Caddy (compose service)]
# Add to docker-compose.yml
caddy:
  image: caddy:2
  restart: unless-stopped
  ports:
    - "443:443"
    - "80:80"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy-data:/data
    - caddy-config:/config
  depends_on:
    - app

# And expose MINT on the internal network only — drop the `ports:` block from the app service.
volumes:
  caddy-data:
  caddy-config:
```

:::

If Caddy runs as a Compose service, point that Caddyfile at `app:8000` instead of `127.0.0.1:8001`, because both containers share the Compose network.

MINT trusts forwarded client headers only from loopback proxies by default. If
your reverse proxy runs in a separate container, set
`MINT_SERVER__TRUSTED_PROXY_CIDRS` to a JSON list containing only that Compose
network or proxy address, for example:

```yaml
environment:
  MINT_SERVER__TRUSTED_PROXY_CIDRS: '["127.0.0.1/32", "::1/128", "172.18.0.0/16"]'
```

Do not use a broad trusted proxy range on hosts that receive traffic directly
from users.

## First-run setup

Open the public URL in your browser. On a fresh install you'll see the **Setup** page (only shown when no admin exists). Create the first admin account; everything else is configured from the in-app **Admin** view.

> [Screenshot: setup page showing the first-admin form]

After setup:

1. Configure notification delivery and the marketplace registry from **Admin -> Platform -> Configuration** and **Admin -> Plugins -> Registry**
2. Create your first **Project** (see [Projects](/workflow/projects))
3. Invite team members and assign system roles (see [Members & roles](/workflow/members-roles))

## Upgrades

```bash
cd /opt/mint
git pull --ff-only origin 1.2-dev
docker compose -f deploy/docker/docker-compose.yml up -d --build --no-deps app
docker compose -f deploy/docker/docker-compose.yml logs -f app
```

For beta evaluation, roll back by checking out the previously tested commit and rebuilding `app`. The Postgres volume retains data; the platform's own migrations are forward-only, so restore the matching database backup when a newer commit applied incompatible migrations.

### Optional startup auto-update

Docker images can also apply the newest platform runtime bundle before Uvicorn starts:

```yaml
environment:
  MINT_UPDATES__AUTO_APPLY_ON_STARTUP: "true"
  MINT_UPDATES__GITHUB_TOKEN: "${GITHUB_TOKEN:-}"
```

Use this only when you intentionally want recreated containers to move to the latest compatible MINT release automatically. The entrypoint checks GitHub releases, applies the bundle when one is available, and starts MINT anyway if the update check fails.

### Optional Admin terminal

`MINT_ADMIN_TERMINAL_ENABLED` controls **Admin -> Platform -> Terminal**. It is off by default because commands run inside the container as the MINT process user. When enabled, admins with `platform.configure` can open a short-lived terminal session and save commands to `/app/data/admin-terminal/startup.sh`; the Docker entrypoint runs that executable script on future container starts. Keep this disabled unless your deployment needs runtime maintenance from the web UI.

## Backups

Two persistent stores hold the database and runtime files:

| Volume | Backup method |
|--------|---------------|
| `mint-postgres-data` | `docker compose -f deploy/docker/docker-compose.yml exec postgres pg_dump -U mint mint_db > backup.sql` |
| Repository `data/` directory | Back up the bind-mounted directory with the lab's normal filesystem backup tool |

Run both before any major upgrade and on a regular schedule. Snapshots taken by `snapshot.py` for plugin upgrades are short-lived rollback aids — not a backup substitute.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Container exits immediately | `docker compose -f deploy/docker/docker-compose.yml logs app` for the trace. Most often: bad config or unreachable Postgres. |
| `connection refused` to Postgres | The `depends_on.condition: service_healthy` should prevent this - check `docker compose -f deploy/docker/docker-compose.yml ps` and the Postgres healthcheck output. |
| Migration fails on startup | Container exits non-zero. Check the log line; if it's a plugin migration, fix the plugin's release and redeploy. |
| 502 from the reverse proxy | Container not running, or the proxy is targeting the wrong host/port. `curl -I http://127.0.0.1:8001/api/health` from the host. |
| Disk fills up unexpectedly | Runtime data under the repository `data/` directory grew, often from plugin uploads or cached bundles. Add monitoring; consider moving the bind mount to a larger disk. |
| Need to inspect the database | `docker compose -f deploy/docker/docker-compose.yml exec postgres psql -U mint mint_db` |

## Next step

→ [First experiment (5 minutes)](/get-started/quickstart)

Or, if you'd rather manage the Python install and Postgres directly on the host:

→ [Install directly](/get-started/install-direct)
