# Install on Linux (Docker)

Run MINT as a Docker container, with PostgreSQL 17 alongside, using the Compose stack checked into the MINT repository at the release tag.

::: tip Picking an install method
MINT is supported on **Linux servers only**, via either Docker (this page) or the [direct install](/admin/install-direct). Pick Docker when you want a self-contained, version-pinned deployment with clean rollback.
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

## Build and start

Check out the release tag and create the `.env` file:

```bash
git clone https://github.com/MorscherLab/MINT.git /opt/mint
cd /opt/mint
git checkout v@MINT_VERSION@
cp .env.example .env
openssl rand -hex 32
```

Paste the generated value into `MINT_DB_PASSWORD` in `.env`, and add the settings from the table below. Then build and start:

```bash
docker compose -f deploy/docker/docker-compose.yml up -d --build --wait
docker compose -f deploy/docker/docker-compose.yml logs -f app
```

The Compose file builds `deploy/docker/Dockerfile` (based on `python:3.14-slim`), starts PostgreSQL 17, and keeps the database in the `mint-postgres-data` volume. Platform config, objects, plugin state and the uv wheel cache (`UV_CACHE_DIR=/app/data/cache/uv`) live in the repository's `data/` directory, mounted at `/app/data`. Keeping the cache on the volume lets a rebuilt image restore plugins from their [dependency lock](/admin/plugins#plugin-dependency-lock) without downloading them again.

The Compose file also sets `MINT_RESTART_SUPERVISED=1`: the `app` service has `restart: unless-stopped`, so Docker starts MINT again after a restart that MINT requests itself. This is what allows [scheduled updates](/admin/updates#scheduled-updates).

### `.env` settings

| Variable | Default | Purpose |
|----------|---------|---------|
| `MINT_DB_PASSWORD` | none (required) | PostgreSQL password for the bundled database |
| `MLD_PORT` | `8000` | Host side of the app port mapping. Set `127.0.0.1:8001` to keep MINT behind a host reverse proxy. The legacy `MLD_` name is what the Compose file reads. |
| `MINT_SERVER__RP_ID` | empty | Passkey relying-party ID, e.g. `mint.example.org`. Empty derives it from the request host. |
| `MINT_POSTGRES_HOST_PORT` | `5432` | Loopback host port for PostgreSQL. Change it if the host already runs PostgreSQL on 5432. |
| `MINT_DATA_PATH` | `../../data` (repo `data/`) | Host directory mounted at `/app/data` |
| `RAW_FILES_PATH` | `./Data` | Host directory mounted read-only at `/app/Data` |
| `MINT_UPDATES__GITHUB_TOKEN` | empty | GitHub token for update checks and private release assets |
| `MINT_UPDATES__AUTO_APPLY_ON_STARTUP` | `false` | See [startup auto-update](#optional-startup-auto-update) |
| `MINT_ADMIN_TERMINAL_ENABLED` | `false` | See [Admin terminal](#optional-admin-terminal) |

Compose only passes the variables listed in `deploy/docker/docker-compose.yml`. For any other setting, such as `server.externalUrl` or `auth.allowRegistration`, edit `data/config.json` after first start or add the `MINT_...` variable to the `app` service `environment:` block. Set `server.externalUrl` to your public `https://` URL so login cookies carry `Secure` behind a TLS proxy.

Expected output once startup completes (the container runs `uv run --no-sync mint daemon`, which serves the app with Uvicorn; `--no-sync` keeps a restart from reverting packages that plugins installed):

```
app  | INFO:     Started server process [1]
app  | INFO:     Waiting for application startup.
app  | INFO:     Application startup complete.
app  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

With `MLD_PORT=127.0.0.1:8001`, Compose binds the container's port 8000 to `127.0.0.1:8001` on the host. MINT is **not** directly reachable from the network until you put a reverse proxy in front. Without `MLD_PORT`, the app listens on port 8000 on all host interfaces.

## Reverse proxy

For the host nginx or Caddy configuration, see [Reverse proxy](/admin/proxy-and-setup#reverse-proxy). To run Caddy as a Compose service instead:

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

See [First-run setup](/admin/proxy-and-setup#first-run-setup).

## Upgrades

Back up first (see [Backups](#backups)), then check out the new release tag and rebuild the app:

```bash
cd /opt/mint
git fetch --tags
git checkout v<new-version>
docker compose -f deploy/docker/docker-compose.yml up -d --build --no-deps app
docker compose -f deploy/docker/docker-compose.yml logs -f app
```

You can also apply a release from **Admin -> Plugins -> Installed** without rebuilding; the container installs the release's `mint-platform-<version>.tar.gz` runtime bundle (see [Updates](/admin/updates)).

To roll back, check out the previous tag and rebuild `app`. Platform migrations are forward-only, so restore the matching database backup when the newer release applied migrations.

### Optional startup auto-update

Docker images can also apply the newest platform runtime bundle before Uvicorn starts:

```yaml
environment:
  MINT_UPDATES__AUTO_APPLY_ON_STARTUP: "true"
  MINT_UPDATES__GITHUB_TOKEN: "${GITHUB_TOKEN:-}"
```

Use this only when you intentionally want recreated containers to move to the latest compatible MINT release automatically. The entrypoint checks GitHub releases and applies the bundle when one is available. If the candidate is rejected safely, MINT starts on the current version; if staging or activation fails in a way that could leave a mixed runtime, the container refuses to start and logs the reason.

### Optional Admin terminal

`MINT_ADMIN_TERMINAL_ENABLED` controls **Admin -> Platform -> Terminal**. It is off by default because commands run inside the container as the MINT process user. When enabled, admins with `platform.configure` can open a short-lived terminal session and save commands to `/app/data/admin-terminal/startup.sh`; the Docker entrypoint runs that executable script on future container starts. Keep this disabled unless your deployment needs runtime maintenance from the web UI.

## Backups

Two persistent stores hold the database and runtime files:

| Volume | Backup method |
|--------|---------------|
| `mint-postgres-data` | `docker compose -f deploy/docker/docker-compose.yml exec postgres pg_dump -U mint mint_db > backup.sql` |
| Repository `data/` directory | Back up the bind-mounted directory with the lab's normal filesystem backup tool |

Run both before any major upgrade and on a regular schedule. The plugin lock history under `data/plugins/locks/history/` is a short-lived rollback aid for Python packages, not a backup substitute.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Container exits immediately | `docker compose -f deploy/docker/docker-compose.yml logs app` for the trace. Most often: bad config or unreachable Postgres. |
| `connection refused` to Postgres | The `depends_on.condition: service_healthy` should prevent this - check `docker compose -f deploy/docker/docker-compose.yml ps` and the Postgres healthcheck output. |
| Platform migration fails on startup | Container exits non-zero. Check the log line and restore the matching database backup if needed. |
| Plugin migration fails | MINT keeps running and that plugin stays disabled; the error shows in **Admin -> Plugins -> Installed**. Fix the plugin release and redeploy. |
| 502 from the reverse proxy | Container not running, or the proxy is targeting the wrong host/port. `curl -I http://127.0.0.1:8001/api/health` from the host. For database and plugin readiness, see [Server health](/admin/platform-settings#server-health). |
| Disk fills up unexpectedly | Runtime data under the repository `data/` directory grew, often from plugin uploads, cached bundles, or the uv wheel cache in `data/cache/uv`. Add monitoring; consider moving the bind mount to a larger disk. |
| Need to inspect the database | `docker compose -f deploy/docker/docker-compose.yml exec postgres psql -U mint mint_db` |

## Next step

→ [First experiment (5 minutes)](/guide/quickstart)

Or, if you'd rather manage the Python install and Postgres directly on the host:

→ [Install directly](/admin/install-direct)
