# `mint serve`

Starts the MINT backend and serves the bundled web frontend. This is the primary entry point for both direct and Docker deployments.

## Synopsis

```bash
mint serve [--host HOST] [--port PORT] [--config PATH] [--migrate-only]
```

## Default behavior

```bash
mint serve
```

On startup, the server:

1. Loads configuration (env vars > `.env` > `config.json` > defaults).
2. Connects to the database mode declared in `database.mode` and runs pending platform + plugin migrations, advisory-locked.
3. Discovers plugins via the `mld.plugins` entry-point group (when `plugins.loadFromEntryPoints` is true) and mounts them.
4. Binds to `127.0.0.1:8001` by default.
5. Prints the resolved URL to standard output and remains in the foreground.

Expected output:

```
MINT v1.0.0 ready at http://127.0.0.1:8001
Press Ctrl+C to stop.
```

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--host` | `127.0.0.1` | Interface to bind. Use `0.0.0.0` only behind a reverse proxy. |
| `--port` | `8001` | TCP port to listen on. |
| `--config` | (auto-discovered) | Path to a `config.json`. Defaults to `./config.json` then `~/.config/mint/config.json`. |
| `--migrate-only` | off | Apply pending migrations and exit. Useful in CI or pre-deploy scripts. |

::: info
Additional flags exposed by `mint serve --help` are not documented here. Treat any flag not listed in this table as unstable until it appears in this manual.
:::

## Lifecycle

| Action | Effect |
|--------|--------|
| Stop the server | Press `Ctrl+C` in the terminal running `mint serve` |
| Close the browser tab | Has no effect on the server; the server continues running |
| Close the terminal | Terminates the process (SIGHUP) |
| `kill -TERM <pid>` | Graceful shutdown — drains in-flight requests, then exits |

## Common scenarios

### Port already in use

If port 8001 is occupied (for example, by a previous MINT process that did not exit cleanly), specify a different port:

```bash
mint serve --port 8002
```

Then open `http://127.0.0.1:8002` in the browser.

### Running migrations without serving

Useful when you want to validate that all migrations apply cleanly before a deployment:

```bash
mint serve --migrate-only
```

The process applies all pending platform and plugin migrations, prints a summary, and exits non-zero if any migration fails.

### Confirming the server is running

In a separate terminal:

```bash
curl -I http://127.0.0.1:8001/api/health
```

A `200 OK` response indicates the platform is reachable and the database is up.

## Network exposure

`mint serve` binds only to `127.0.0.1` by default. The application is **not** exposed to other machines on the local network or the internet unless you explicitly pass `--host 0.0.0.0`.

::: warning Use a reverse proxy for `0.0.0.0`
MINT does not terminate TLS, does not perform header validation beyond auth, and does not handle X-Forwarded-* aggressively. For network-exposed deployments, put nginx, Caddy, or Traefik in front and forward to MINT on `127.0.0.1`.
:::

## Next

→ [Configuration](/cli/configuration) — `config.json` schema, env vars
→ [Platform commands](/cli/platform) — `mint experiment`, `mint project`, …
