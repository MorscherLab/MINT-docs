# Runtime isolation and storage

MINT @MINT_VERSION@ can run an installed plugin in the platform process, in a separate Python subprocess, behind an external HTTP URL, or in a platform-managed Docker container. Choose a compatible dependency/runtime arrangement **and** check that it supports the services your plugin needs. Process isolation does not make every `PlatformContext` namespace remotely available.

## Runtime comparison

| Runtime | Platform access | Plugin-owned SQL tables | Typical use |
|---|---|---|---|
| Installed in-process | Platform `PlatformContext`; direct async scoped namespaces | PostgreSQL schema through `context.db()`; required for shared-table sessions | Plugins requiring shared database access; `.mint` bundle with compatible Python dependencies |
| Installed isolated subprocess | SDK `RemotePlatformContext`; same async protocol over authenticated internal HTTP APIs | No shared SQL-session bridge | Conflicting or heavy Python dependency sets using supported platform service adapters |
| External server | Platform must reach its URL | Owned by the service | An already running plugin service; the service owns its process lifecycle |
| Docker runtime | Containerized plugin runtime | Owned by the container | Container image, networking and native libraries must be provided |
| Standalone `mint dev` | `StandaloneContext`; platform-only calls raise `UnavailableException` | Local SQLite when declared | Plugin API/UI development and local database tests |
| `mint dev --platform` | Starts the platform and a development proxy into the standalone server | Local SQLite | Testing platform URL/proxy behavior during development |
| External notebook, script, CI | No plugin context; synchronous `MINTClient` with the caller's credentials | Use platform APIs | Scripts outside a plugin |

The **table-owning plugin tutorial must be deployed in-process** for PostgreSQL. A plugin with `Metadata.database` combined with `RemotePlatformContext` fails validation with `ConfigurationException`. Calling the remote context's `db()` directly raises `UnavailableException`; the SDK does not silently switch an installed remote plugin to SQLite.

External HTTP and Docker-managed runtimes are registered rather than installed: the platform records where to proxy the plugin's routes and wires the proxy at startup. The runtime owns its process, dependencies and storage; plan plugin-owned tables as in-process only. Both runtimes get lifecycle events: the platform sends them to `/__mint/events` at the root of the runtime target and ignores a target path or `base_path`. A runtime that declares `experiment.before_save` can refuse a design-data save, and the rule fails closed. While such a runtime is unreachable, times out, has no token or answers an error status, every design-data save is refused, except the saves of that plugin itself. Keep the runtime reachable at that URL, or remove `experiment.before_save` from its declared events.

A plugin process runs from `mint_sdk.app:create_app --factory`; the platform reads this target from the plugin runtime manifest. A plugin process needs SDK 1.4: the platform polls `GET /__mint/health` (the `@health` result), and reads `effect` from the MCP manifest. A hand-written `/health` route is not read. The platform serves plugin processes at the `Metadata.prefix` of their runtime manifest, and refuses a runtime whose prefix is `/` or shares its first `/api` segment with a platform route or another runtime. The `jobs` limits of `config.json` apply to every plugin process.

## In-process plugins

MINT installs compatible dependencies into the platform environment and mounts the plugin's routers in the platform FastAPI application. Calls to SDK repository adapters reach platform services directly.

The session returned by `context.db()` uses the schema derived from the plugin entry-point identity, such as `panel_designer` for `panel-designer`. On the normal installed entry-point startup path, MINT prepares that schema and runs declared migrations before plugin initialization. A plugin declares `Metadata.database`; its revisions create tables on fresh installs and a migration failure prevents startup. See [Migrations](/sdk/concepts/migrations).

Do not use the shared connection to query platform tables directly. The context namespaces carry experiment visibility and plugin capability checks; an arbitrary SQL query does not acquire those checks automatically. Schema scoping is a data-organization mechanism, not a sandbox for untrusted Python code.

An ordinary route exception can be handled as an HTTP failure. A process crash, blocking code, or excessive resource use can still affect the platform process. Do not treat exception middleware as process containment.

## Isolated subprocess plugins

MINT provisions a plugin environment, starts an SDK-owned server on a local port, and proxies the plugin's public routes. The public URL remains the plugin's platform route; the separate process does not need a new user-facing address.

The subprocess receives platform connection details and a plugin-scoped internal credential. `RemotePlatformContext` adapts supported SDK services to the platform's `/api/internal` HTTP surface. User identity is propagated through the trusted runtime path; never accept arbitrary identity headers from a plugin's own browser UI as proof of authentication.

The experiment, design, artifact, user and instrument namespaces, object storage and the other implemented remote adapters use this path. The adapters do **not** expose an arbitrary SQLAlchemy session or shared Python objects.

Treat the platform namespaces as the interface between processes. If an isolated analysis plugin needs durable experiment results, use the platform's analysis/artifact/object-store APIs instead of assuming the SQL-table API works remotely. If its application genuinely needs plugin-owned PostgreSQL tables, arrange an in-process installation with compatible dependencies.

Admins can inspect running subprocess plugins in server status. Use the platform's reported runtime, process health, logs, and SDK compatibility state to diagnose an installation; a successful wheel build alone does not verify that runtime path. A subprocess runs from a cached wheel and the hashed `plugin.lock` next to it. A plugin process reaches the platform at `127.0.0.1:<MINT_LISTEN_PORT>`; a Docker plugin uses `server.externalUrl`, or `host.docker.internal:<port>`. The SDK transport settings (`MINT_PLATFORM_CONNECT_TIMEOUT`, `MINT_PLATFORM_TIMEOUT`, `MINT_PLATFORM_STARTUP_WAIT`, `MINT_PLATFORM_TRANSFER_TIMEOUT`, `MINT_PLATFORM_RETRIES`, `MINT_PLATFORM_RETRY_BACKOFF`) set on the platform pass to the plugin process.

## Version compatibility comes first

The plugin bundle's `[tool.mint].requires_mint`/manifest requirement is checked against the running platform, and marketplace metadata may declare a minimum platform version. The platform compiles plugin requirements against its own lock, with `mint-sdk` as the installed distribution. A plugin dependency range that excludes the platform's SDK version is refused, and a plugin wheel built for an older SDK is disabled at the first start of a newer platform. Isolation does not supply an unrelated SDK version. At runtime the SDK and the platform also compare the internal API version (`PLATFORM_API_VERSION`, now `"2"`): a plugin process on an older SDK fails at the handshake with HTTP 426 `plugin.api_version_mismatch`. Plugins declare `mint-sdk>=1.4.0,<2.0`; the plugin SDK contract has no breaking change within 1.x.

Keep the plugin package version, declared platform compatibility, and actual tested SDK version accurate. See [Versioning](/sdk/operations/versioning) and [Deploying](/sdk/operations/deploying) for release/install steps.

## Development proxy limitations

`mint dev --platform` is a development workflow. The platform forwards matching plugin paths to your local standalone server, allowing API/frontend hot reload. A proxy entry may look like:

```toml
# Platform config.dev.toml
[proxy]
"/panel-designer" = "http://localhost:8003"
```

This does not install the entry-point plugin into the platform process, run its PostgreSQL migrations, or automatically supply the full `MINT_PLATFORM_URL` / `MINT_PLUGIN_TOKEN` integration contract to the standalone process. A request-dependent platform operation such as `CurrentExperiment` can still be unavailable in standalone mode. The dev proxy forwards a request without identity headers, and the plugin runs standalone.

Use a disposable MINT installation for the final integration check. Verify both a fresh install and an upgrade with saved plugin data; if targeting subprocess deployment, exercise the actual installed subprocess rather than only the development proxy.

## Configuration scope

Plugin loading lives under `plugins` in `config.json`: `loadFromEntryPoints`, explicit `plugins` entries, `extraIndexUrls`, and durable `settings`. The released user configuration does not expose `forceIsolated` or `forceShared` switches. Do not add guessed options to configuration to work around a runtime mismatch.

Release sources: [runtime database validation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_database.py), [remote context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/remote/context.py), and [platform plugin loader](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/plugins/loader.py).
