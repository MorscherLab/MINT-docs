# Install on Linux (Docker)

This page tells you how to run MINT and PostgreSQL 17 with the Docker Compose stack of the MINT repository. To compare this method with the direct install, see [Choose an install method](/admin/install-direct).

## Requirements

| Item | Requirement |
|------|-------------|
| Operating system | Linux server (x86_64 or arm64) with Docker Engine 24 or later |
| Docker Compose | v2 (the `docker compose` subcommand, not the old `docker-compose` script) |
| Disk | About 2 GB for the image, the PostgreSQL data and the plugin files |
| RAM | 4 GB minimum. 8 GB with plugins installed |
| Reverse proxy | Necessary in production. See [Reverse proxy](/admin/reverse-proxy) |

## Build and start

1. Check out the release tag and create the `.env` file:

   ```bash
   git clone https://github.com/MorscherLab/MINT.git /opt/mint
   cd /opt/mint
   git checkout v@MINT_VERSION@
   cp .env.example .env
   ```

2. Generate a database password with `openssl rand -hex 32`.
3. Put the password into `MINT_DB_PASSWORD` in `.env`. Add the other [`.env` settings](#env-settings) that you need.
4. Build and start the stack:

   ```bash
   docker compose -f deploy/docker/docker-compose.yml up -d --build --wait
   ```

5. Follow the log until startup is complete:

   ```bash
   docker compose -f deploy/docker/docker-compose.yml logs -f app
   ```

   The log ends with these lines:

   ```
   app  | INFO:     Started server process [1]
   app  | INFO:     Waiting for application startup.
   app  | INFO:     Application startup complete.
   app  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   ```

What the stack contains:

- The Compose file builds `deploy/docker/Dockerfile`. The first stage builds the frontend with pnpm from the lockfile. The runtime stage is based on `python:3.14-slim`.
- The container runs `uv run --no-sync mint-platform serve --platform-dir /app --port 8000`. This serves the app with Uvicorn as one worker and sets `MINT_LISTEN_PORT` for plugin processes. `--no-sync` keeps a restart from reverting packages that plugins installed.
- PostgreSQL 17 keeps the database in the `mint-postgres-data` volume.
- The repository's `data/` directory is mounted at `/app/data`. It holds the platform config, objects, plugin state and the uv wheel cache (`UV_CACHE_DIR=/app/data/cache/uv`). With the cache on the volume, a rebuilt image restores plugins from their [dependency lock](/admin/plugins#plugin-dependency-lock) without a new download.
- The `app` service has `restart: unless-stopped` and sets `MINT_RESTART_SUPERVISED=1`. Docker starts MINT again after MINT requests a restart, so [scheduled updates](/admin/updates#scheduled-updates) work.

### `.env` settings

| Variable | Default | Purpose |
|----------|---------|---------|
| `MINT_DB_PASSWORD` | none (required) | PostgreSQL password of the bundled database |
| `MINT_PORT` | `8000` | Host side of the app port mapping. Set `127.0.0.1:8001` to keep MINT behind a host reverse proxy |
| `MINT_VERSION` | `0.0.0-dev` | Version string of a local image build |
| `MINT_REALTIME_ENABLED` | `true` | Turns the [realtime event stream](/admin/configuration#realtimeenabled) on or off |
| `MINT_SERVER__RP_ID` | empty | Passkey relying-party ID, for example `mint.example.org`. See [Sign in with a passkey](/admin/authentication#sign-in-with-a-passkey) |
| `MINT_POSTGRES_HOST_PORT` | `5432` | Loopback host port of PostgreSQL. Change it if the host already uses 5432 |
| `MINT_DATA_PATH` | `../../data` (repository `data/`) | Host directory mounted at `/app/data` |
| `RAW_FILES_PATH` | `./Data` | Host directory mounted read-only at `/app/Data` |
| `MINT_UPDATES__GITHUB_TOKEN` | empty | GitHub token for update checks and private release assets |
| `MINT_UPDATES__AUTO_APPLY_ON_STARTUP` | `false` | Applies a newer platform bundle when a container is created. See [Runtime bundles](/admin/updates#runtime-bundles) |
| `MINT_ADMIN_TERMINAL_ENABLED` | `false` | Turns on **Admin -> System -> Terminal**. See [Admin terminal](#optional-admin-terminal) |

Compose passes only the variables in `deploy/docker/docker-compose.yml`. For other settings, edit `data/config.json` after the first start, or add the `MINT_...` variable to the `environment:` block of the `app` service. Set `server.externalUrl` to your public `https://` URL; see [Public URL](/admin/reverse-proxy#public-url).

With `MINT_PORT=127.0.0.1:8001`, the network cannot reach MINT until you put a reverse proxy in front. Without `MINT_PORT`, the app listens on port 8000 on all host interfaces.

## Reverse proxy

For a host nginx or Caddy, see [Reverse proxy](/admin/reverse-proxy). To run Caddy as a Compose service:

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

Point that Caddyfile at `app:8000`, not at `127.0.0.1:8001`, because both containers share the Compose network.

MINT trusts forwarded headers only from loopback by default. For a proxy in another container, add the Compose network or the proxy address to `MINT_SERVER__TRUSTED_PROXY_CIDRS`:

```yaml
environment:
  MINT_SERVER__TRUSTED_PROXY_CIDRS: '["127.0.0.1/32", "::1/128", "172.18.0.0/16"]'
```

For how to find the address and why a narrow range matters, see [Trusted proxies](/admin/reverse-proxy#trusted-proxies).

## First-run setup

Continue with [First-run setup](/admin/first-run).

## Upgrades

1. Back up the database and `data/` (see [Backups](#backups)).
2. Check out the new release tag and rebuild the app:

   ```bash
   cd /opt/mint
   git fetch --tags
   git checkout v<new-version>
   docker compose -f deploy/docker/docker-compose.yml up -d --build --no-deps app
   docker compose -f deploy/docker/docker-compose.yml logs -f app
   ```

You can also apply a release in **Admin -> System -> Updates** without a rebuild. The container then installs the runtime bundle of the release. See [Updates](/admin/updates).

For the Docker steps of each release upgrade (1.3 to 1.4, 1.4 to 1.5, 1.5 to 1.6), see [Updates](/admin/updates#upgrading-from-mint-1-5). In short: after an in-app update to a new minor release, set the Compose image to that release, for example `ghcr.io/morscherlab/mint:1.6`. A Compose file that overrides the command with `mint daemon` must use `uv run --no-sync mint-platform serve --platform-dir /app --port 8000`.

To roll back, check out the previous tag and rebuild `app`. Platform migrations go forward only, so restore the matching database backup if the newer release applied migrations.

### Optional admin terminal

`MINT_ADMIN_TERMINAL_ENABLED=true` turns on **Admin -> System -> Terminal**. Commands run in the container as the MINT process user. The Docker entrypoint runs the saved script `/app/data/admin-terminal/startup.sh` at each later container start. Keep it off unless you need maintenance from the web UI. See [Admin terminal](/reference/permissions#admin-terminal).

## Backups

Back up both stores before each upgrade and on a regular schedule:

| Store | Backup method |
|-------|---------------|
| `mint-postgres-data` volume | `docker compose -f deploy/docker/docker-compose.yml exec postgres pg_dump -U mint mint_db > backup.sql` |
| Repository `data/` directory | The lab's filesystem backup tool |

The plugin lock history in `data/plugins/locks/history/` is not a backup. It restores only Python packages.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| The container stops at once | Read `docker compose -f deploy/docker/docker-compose.yml logs app`. Usual causes: a bad config or an unreachable PostgreSQL |
| `connection refused` to PostgreSQL | Check `docker compose -f deploy/docker/docker-compose.yml ps` and the PostgreSQL health check |
| A platform migration fails at startup | The container exits with a non-zero status. Read the log line. If necessary, restore the matching database backup |
| After an in-app update to 1.6 and a new container, the log shows `Unknown database revision platform_object_cleanup_kind` | The new container runs the 1.5 image on the 1.6 database. Set the Compose image to `ghcr.io/morscherlab/mint:1.6`, or check out the 1.6 tag and rebuild. See [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5) |
| A plugin migration fails | MINT keeps running and disables that plugin. See [Plugin migrations](/admin/plugins#plugin-migrations) |
| 502 from the reverse proxy | The container does not run, or the proxy uses the wrong host or port. Run `curl -I http://127.0.0.1:8001/api/health` on the host. See [Server health](/admin/platform-settings#server-health) |
| The disk fills up | `data/` grew, often from plugin uploads, cached bundles or the uv cache in `data/cache/uv`. Monitor the disk, or move the bind mount to a larger disk |
| You must inspect the database | `docker compose -f deploy/docker/docker-compose.yml exec postgres psql -U mint mint_db` |

Next: [First experiment](/guide/quickstart).
