# Install on Linux (direct)

This page tells you how to install MINT on a Linux server from the runtime bundle of a [GitHub release](https://github.com/MorscherLab/MINT/releases). The bundle holds the FastAPI backend, the built Vue frontend, the Python SDK source and a locked dependency list. `uv` installs it, and `mint-platform serve` runs it.

::: tip Choose an install method
MINT runs on Linux servers only. There are two install methods, and both give the same platform:

- Direct install (this page): you control the process, for example with a systemd unit, OS monitoring and a PostgreSQL server on the host.
- [Docker install](/admin/install-docker): a pinned image and a declared environment in one Compose stack.
:::

## Requirements

| Item | Requirement |
|------|-------------|
| Operating system | Linux server (x86_64 or arm64) with glibc 2.28 or later (Debian 11+, Ubuntu 20.04+, RHEL 9+) |
| Python | 3.14 or later, from the distribution or [`uv python install`](https://docs.astral.sh/uv/concepts/python-versions/). Each compiled dependency of a plugin needs a `cp314` or `abi3` wheel |
| uv | Necessary at runtime for plugin installs and plugin environments. The `mint` service user must be able to run it |
| Database | PostgreSQL 14 or later. PostgreSQL is the only platform database. SQLite is available only to a plugin that runs standalone through the SDK |
| Disk | About 2 GB for MINT, plus space for plugin environments and uploaded files |
| RAM | 4 GB minimum. 8 GB with plugins installed |
| Reverse proxy | Necessary in production, to terminate TLS. See [Reverse proxy](/admin/reverse-proxy) |
| Browsers | See [Supported browsers](/guide/access#supported-browsers) |

## Install the runtime bundle

1. Install `uv` where the service user can run it:

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   export PATH="$HOME/.local/bin:$PATH"
   sudo install -m 755 "$(command -v uv)" /usr/local/bin/uv
   ```

2. Create a service user and the directories:

   ```bash
   sudo useradd --system --create-home --shell /usr/sbin/nologin mint
   sudo install -o mint -g mint -m 750 -d /opt/mint /var/lib/mint /var/log/mint
   ```

3. Download and unpack the release bundle:

   ```bash
   VERSION=@MINT_VERSION@
   curl -LO "https://github.com/MorscherLab/MINT/releases/download/v${VERSION}/mint-platform-${VERSION}.tar.gz"
   sudo -u mint tar -xzf "mint-platform-${VERSION}.tar.gz" -C /opt/mint --strip-components=1
   ```

4. Install the locked dependencies. The bundle has no Git history, so give the version:

   ```bash
   sudo -u mint env UV_CACHE_DIR=/var/lib/mint/uv-cache \
     SETUPTOOLS_SCM_PRETEND_VERSION=@MINT_VERSION@ \
     uv sync --project /opt/mint --frozen --no-dev --python 3.14
   ```

This creates `/opt/mint/.venv` with the platform and `mint-sdk[cli,server,local-db]`. The environment holds the `mint-platform` binary at `/opt/mint/.venv/bin/mint-platform` and the `mint` binary at `/opt/mint/.venv/bin/mint`. To use the `mint` CLI in your own shell, see [Install the mint CLI](/admin/cli#install).

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

Generate the JWT secret with `openssl rand -base64 32`. Never commit it.

The systemd unit below sets `MINT_SERVER__DATA_PATH=/var/lib/mint`, so MINT loads `/var/lib/mint/config.json`. For the file lookup and all keys, see [Configuration](/admin/configuration).

Decide these settings before users arrive:

| Setting | Default | Reason |
|---------|---------|--------|
| `server.externalUrl` | empty | The public URL. See [Public URL](/admin/reverse-proxy#public-url) |
| `server.rpId` | empty | The passkey relying-party ID. See [Sign in with a passkey](/admin/authentication#sign-in-with-a-passkey) |
| `auth.allowRegistration` | `true` | Self-registration. See [Accounts and registration](/admin/authentication#accounts-and-registration) |

## Initialize the database

Schema migrations run at platform startup. At the first start, MINT:

1. Connects to the configured database.
2. Applies the pending platform migrations.
3. Applies the pending Alembic revisions of each plugin that it discovers (declared with `Metadata.database`), under a PostgreSQL advisory lock.

If a platform migration fails, MINT logs the error and exits with a non-zero status. If a plugin migration fails, MINT keeps running and disables that plugin; see [Plugin migrations](/admin/plugins#plugin-migrations). At the first start, watch the journal with `journalctl -u mint -f`.

## Run as a systemd service

1. Create `/etc/systemd/system/mint.service`:

   ```ini
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
   ExecStart=/opt/mint/.venv/bin/mint-platform serve --platform-dir /opt/mint --host 127.0.0.1 --port 8001
   Restart=always
   RestartSec=5
   NoNewPrivileges=true
   ProtectSystem=strict
   ProtectHome=true
   ReadWritePaths=/opt/mint /var/lib/mint /var/log/mint

   [Install]
   WantedBy=multi-user.target
   ```

2. Start the service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now mint
   sudo systemctl status mint
   ```

When MINT requests its own restart, it exits with status 0. `Restart=always` makes systemd start it again. To allow [scheduled updates](/admin/updates#scheduled-updates), also add `Environment=MINT_RESTART_SUPERVISED=1` to the unit. As an alternative, `mint-platform daemon install-service` writes a user-level unit with `Restart=always` that sets `MINT_DAEMON=1`.

::: warning Bind to 127.0.0.1, not 0.0.0.0
`mint-platform serve` serves plain HTTP and does not terminate TLS. Bind it to `127.0.0.1` and put a reverse proxy in front. It trusts forwarded headers only from `127.0.0.1` and `::1`. See [Trusted proxies](/admin/reverse-proxy#trusted-proxies).
:::

### Run one process

MINT keeps rate limits, the restart handoff after setup, realtime streams and several caches in process memory. Run one process for each deployment. Startup fails when `WEB_CONCURRENCY`, `UVICORN_WORKERS` or `GUNICORN_WORKERS` is above 1, or when a `--workers` option above 1 is set. `MINT_ALLOW_MULTI_WORKER=1` overrides the check.

## Reverse proxy and first-run setup

Continue with [Reverse proxy](/admin/reverse-proxy), then [First-run setup](/admin/first-run).

## Upgrades

1. Take a database backup.
2. Apply the new release in **Admin -> System -> Updates** (see [Updates](/admin/updates)). MINT downloads the runtime bundle into `/opt/mint`.
3. Restart when MINT asks:

   ```bash
   sudo systemctl restart mint
   ```

To upgrade by hand, repeat [Install the runtime bundle](#install-the-runtime-bundle) with the new version and restart the service. Platform migrations go forward only. To roll back, restore the database backup.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: mint` in an admin shell | See [Install the mint CLI](/admin/cli#install) |
| The service cannot find `mint-platform` | Point the unit at `/opt/mint/.venv/bin/mint-platform`, not at a global binary |
| Port 8001 is in use | Change `--port` in the unit, or find the other process with `lsof -i :8001` |
| A plugin shows **Migration failed** | Read the error in **Admin -> Plugins -> Installed** and install a fixed plugin release. See [Plugin migrations](/admin/plugins#plugin-migrations) |
| 502 from the reverse proxy | MINT did not start or stopped. Read the trace with `journalctl -u mint -n 200` |
| The rate limit applies to every request | The proxy does not send `X-Forwarded-For`, or MINT does not trust it. See [Trusted proxies](/admin/reverse-proxy#trusted-proxies) |
| A plugin install fails with `uv` not found | Install `uv` system-wide, so that the `mint` user can run it |

Next: [First experiment](/guide/quickstart).
