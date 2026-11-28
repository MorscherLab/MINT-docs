# Runtime isolation and storage

MINT @MINT_VERSION@ runs an installed plugin in one of four runtimes: in the platform process, in a separate Python subprocess, behind an external HTTP URL, or in a platform-managed Docker container. Choose a runtime that fits the dependencies of the plugin and that supports the services it needs. Process isolation does not make every `PlatformContext` namespace available remotely.

## Runtime comparison

| Runtime | Platform access | Plugin-owned SQL tables | Typical use |
|---|---|---|---|
| Installed in-process | Platform `PlatformContext`; direct async scoped namespaces | PostgreSQL schema through `context.db()`; required for shared-table sessions | Plugins that need shared database access; `.mint` bundle with compatible Python dependencies |
| Installed isolated subprocess | SDK `RemotePlatformContext`; same async protocol over authenticated internal HTTP APIs | No shared SQL-session bridge | Conflicting or heavy Python dependency sets that use the supported platform service adapters |
| External server | The platform must reach its URL | Owned by the service | A plugin service that already runs; the service owns its process lifecycle |
| Docker runtime | Containerized plugin runtime | Owned by the container | You supply the container image, networking and native libraries |
| Standalone `mint dev` | `StandaloneContext`; platform-only calls raise `UnavailableException` | Local SQLite when declared | Plugin API and UI development, local database tests |
| `mint dev --platform` | Starts the platform and a development proxy into the standalone server | Local SQLite | Tests of platform URLs and proxy behavior during development |
| External notebook, script, CI | No plugin context; synchronous `MINTClient` with the credentials of the caller | Use platform APIs | Scripts outside a plugin |

Deploy a plugin that owns tables in-process. A plugin with `Metadata.database` and a `RemotePlatformContext` fails validation with `ConfigurationException`. A direct call to `db()` of the remote context raises `UnavailableException`. The SDK does not switch an installed remote plugin to SQLite.

The platform registers external HTTP and Docker-managed runtimes; it does not install them. It records where to proxy the plugin routes and sets up the proxy at startup. The runtime owns its process, dependencies and storage, so keep plugin-owned tables in-process. Both runtimes get lifecycle events: the platform sends them to `/__mint/events` at the root of the runtime target and ignores a target path or `base_path`. A runtime that declares `experiment.before_save` blocks every design-data save of other plugins while it is unreachable; see [Typed events and their limits](/sdk/concepts/lifecycle#typed-events-and-their-limits).

A plugin process runs from `mint_sdk.app:create_app --factory`; the platform reads this target from the plugin runtime manifest. A plugin process needs SDK 1.4 or later. The platform polls `GET /__mint/health` (the `@health` result) and reads `effect` from the MCP manifest. It does not read a hand-written `/health` route. The platform serves plugin processes at the `Metadata.prefix` of their runtime manifest. It refuses a runtime whose prefix is `/`, or whose first `/api` segment is the same as that of a platform route or another runtime. The `jobs` limits of `config.json` apply to every plugin process.

## In-process plugins

MINT installs compatible dependencies into the platform environment and mounts the plugin routers in the platform FastAPI application. Calls to SDK repository adapters go directly to platform services.

The session from `context.db()` uses the schema that MINT derives from the entry-point name, such as `panel_designer` for `panel-designer`. At startup, MINT prepares that schema and runs the declared migrations before plugin initialization. A migration failure prevents startup. See [Migrations](/sdk/concepts/migrations).

Do not use the shared connection to query platform tables. The context namespaces apply experiment visibility and plugin capability checks; a raw SQL query does not. Schema scoping organizes data. It is not a sandbox for untrusted Python code.

An ordinary route exception becomes an HTTP failure. A process crash, blocking code or excessive resource use can still affect the platform process. Exception middleware does not contain the process.

## Isolated subprocess plugins

MINT creates a plugin environment, starts an SDK-owned server on a local port and proxies the public routes of the plugin. The public URL stays the platform route of the plugin; users get no new address.

The subprocess receives the platform connection details and a plugin-scoped internal credential. `RemotePlatformContext` adapts the supported SDK services to the `/api/internal` HTTP surface of the platform. User identity comes through the trusted runtime path. Never accept identity headers from the browser UI of a plugin as proof of authentication.

The experiment, design, artifact, user and instrument namespaces, object storage and the other remote adapters use this path. The adapters do not expose an SQLAlchemy session or shared Python objects.

Use the platform namespaces as the interface between the processes. For durable experiment results, an isolated analysis plugin uses the artifact and object-store APIs. If it needs plugin-owned PostgreSQL tables, install it in-process with compatible dependencies.

Admins see the running subprocess plugins in server status. To diagnose an installation, use the reported runtime, process health, logs and SDK compatibility state; a successful wheel build does not prove that the runtime works. A subprocess runs from a cached wheel and the hashed `plugin.lock` next to it.

A plugin process reaches the platform at `127.0.0.1:<MINT_LISTEN_PORT>`; see [`server`](/admin/configuration#server) for the port. A Docker plugin uses `server.externalUrl`, or `host.docker.internal:<port>`. The SDK transport settings set on the platform pass to the plugin process: `MINT_PLATFORM_CONNECT_TIMEOUT`, `MINT_PLATFORM_TIMEOUT`, `MINT_PLATFORM_STARTUP_WAIT`, `MINT_PLATFORM_TRANSFER_TIMEOUT`, `MINT_PLATFORM_RETRIES` and `MINT_PLATFORM_RETRY_BACKOFF`.

## Version compatibility comes first

The platform checks the `[tool.mint].requires_mint` requirement of the bundle against the running platform. Marketplace metadata can also declare a minimum platform version. The platform compiles the plugin requirements against its own lock, with `mint-sdk` as the installed distribution. It refuses a plugin whose dependency range excludes the platform SDK version. It disables a plugin wheel built for an older SDK at the first start of a newer platform. Isolation does not supply a different SDK version.

At runtime, the SDK and the platform also compare the internal API version (`PLATFORM_API_VERSION`, now `"2"`). A plugin process on an older SDK fails at the handshake with HTTP 426 `plugin.api_version_mismatch`.

For the SDK range that a plugin declares and for release steps, see [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately) and [Deploying](/sdk/operations/deploying).

## Development proxy limitations

`mint dev --platform` is for development. The platform forwards matching plugin paths to your local standalone server, so API and frontend hot reload work. A proxy entry looks like this:

```toml
# Platform config.dev.toml
[proxy]
"/panel-designer" = "http://localhost:8003"
```

The proxy does not install the plugin into the platform process and does not run its PostgreSQL migrations. It does not supply `MINT_PLATFORM_URL` and `MINT_PLUGIN_TOKEN` to the standalone process. It forwards a request without identity headers, and the plugin runs standalone. A request-dependent platform operation such as `CurrentExperiment` can be unavailable.

Do the final integration check on a disposable MINT installation. Test a fresh install and an upgrade with saved plugin data. For a subprocess deployment, test the installed subprocess, not only the development proxy.

## Configuration scope

Plugin loading is under `plugins` in `config.json`: `loadFromEntryPoints`, `extraIndexUrls` and `settings`. MINT ignores a config-declared `plugins.plugins` list. There is no `forceIsolated` or `forceShared` switch. Do not add other options to `config.json` to work around a runtime mismatch. See [`plugins`](/admin/configuration#plugins).

Release sources: [runtime database validation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_database.py), [remote context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/remote/context.py) and [platform plugin loader](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/plugins/loader.py).
