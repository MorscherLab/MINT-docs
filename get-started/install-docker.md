# Install on Linux (Docker)

Run MINT as a Docker container, with Postgres alongside. This is the simplest reproducible deployment — pull a pinned image, declare config in env vars, point a reverse proxy at it.

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

## Image

The official image is published to GitHub Container Registry:

```
ghcr.io/morscherlab/mint:1.0.0
ghcr.io/morscherlab/mint:1
ghcr.io/morscherlab/mint:latest
```

::: tip Pin to a specific version
For production, pin to a full version (`1.0.0`) rather than a moving tag like `latest`. That way upgrades are an explicit edit and rollbacks are a one-line revert.
:::

## docker-compose.yml

A minimal compose file with Postgres included:

```yaml
# /opt/mint/docker-compose.yml
services:
  mint:
    image: ghcr.io/morscherlab/mint:1.0.0
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      MINT_DEV_MODE: "false"
      MINT_DATABASE__MODE: "postgresql"
      MINT_DATABASE__URL: "postgresql+asyncpg://mint:${POSTGRES_PASSWORD}@postgres:5432/mint"
      MINT_AUTH__JWT_SECRET: "${MINT_JWT_SECRET}"
      MINT_AUTH__PASSKEYS_ENABLED: "true"
      MINT_PLUGINS__DATA_DIR: "/var/lib/mint/plugin-data"
      MINT_MARKETPLACE__REGISTRY_URL: "https://marketplace.morscherlab.org"
      MINT_MARKETPLACE__REQUIRE_APPROVAL: "true"
    volumes:
      - mint-plugin-data:/var/lib/mint/plugin-data
    ports:
      - "127.0.0.1:8001:8001"

  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: mint
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: mint
    volumes:
      - mint-postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mint -d mint"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  mint-plugin-data:
  mint-postgres:
```

And a sibling `.env`:

```bash
# /opt/mint/.env  (chmod 600, never commit)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
MINT_JWT_SECRET=$(openssl rand -base64 32)
```

(Run those `openssl` commands once and paste the resulting values.)

## Launch

```bash
cd /opt/mint
docker compose up -d
docker compose logs -f mint
```

Expected output once startup completes (uvicorn is the platform's process):

```
mint  | INFO:     Started server process [1]
mint  | INFO:     Waiting for application startup.
mint  | INFO:     Application startup complete.
mint  | INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

The compose file binds the container's port 8001 to `127.0.0.1:8001` on the host — MINT is **not** directly reachable from the network until you put a reverse proxy in front.

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
    - mint

# And expose mint on the internal network only — drop the `ports:` block from the mint service.
volumes:
  caddy-data:
  caddy-config:
```

:::

## First-run setup

Open the public URL in your browser. On a fresh install you'll see the **Setup** page (only shown when no admin exists). Create the first admin account; everything else is configured from the in-app **Admin** view.

> [Screenshot: setup page showing the first-admin form]

After setup:

1. Configure SMTP and the marketplace registry from **Admin → Settings**
2. Create your first **Project** (see [Projects](/workflow/projects))
3. Invite team members and assign system roles (see [Members & roles](/workflow/members-roles))

## Upgrades

```bash
cd /opt/mint
# Edit docker-compose.yml, bump the image tag (e.g., 1.0.0 → 1.1.0)
docker compose pull mint
docker compose up -d mint
docker compose logs -f mint   # confirm migrations applied cleanly
```

To roll back, revert the tag and `docker compose up -d mint` again. The Postgres volume retains data; the platform's own migrations are forward-only, so a rollback only works if you haven't crossed a major version boundary. Take a `pg_dump` before major upgrades.

## Backups

The two persistent volumes hold everything:

| Volume | Backup method |
|--------|---------------|
| `mint-postgres` | `docker compose exec postgres pg_dump -U mint mint > backup.sql` |
| `mint-plugin-data` | `tar -C /var/lib/docker/volumes/mint-plugin-data -czf plugin-data.tar.gz _data` (path may vary by storage driver) |

Run both before any major upgrade and on a regular schedule. Snapshots taken by `snapshot.py` for plugin upgrades are short-lived rollback aids — not a backup substitute.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Container exits immediately | `docker compose logs mint` for the trace. Most often: bad config (missing `MINT_AUTH__JWT_SECRET`) or unreachable Postgres. |
| `connection refused` to Postgres | The `depends_on.condition: service_healthy` should prevent this — check `docker compose ps` and the Postgres healthcheck output. |
| Migration fails on startup | Container exits non-zero. Check the log line; if it's a plugin migration, fix the plugin's release and redeploy. |
| 502 from the reverse proxy | Container not running, or the proxy is targeting the wrong host/port. `curl -I http://127.0.0.1:8001/api/health` from the host. |
| Disk fills up unexpectedly | Plugin uploads into `mint-plugin-data` grew. Add monitoring; consider moving the volume to a larger disk. |
| Need to inspect the database | `docker compose exec postgres psql -U mint mint` |

## Next step

→ [First experiment (5 minutes)](/get-started/quickstart)

Or, if you'd rather manage the Python install and Postgres directly on the host:

→ [Install directly](/get-started/install-direct)
