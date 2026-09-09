# Runtime isolation and storage

MINT 1.2.1 can run an installed plugin in the platform process or in a separate Python subprocess. Choose a compatible dependency/runtime arrangement **and** check that it supports the services your plugin needs. Process isolation does not make every `PlatformContext` method remotely available.

## Runtime comparison

| Runtime | Platform access | Plugin-owned SQL tables | Typical use |
|---|---|---|---|
| Installed in-process | Direct platform context and repositories | PostgreSQL schema through `get_plugin_db_session()` | Plugins requiring shared database access |
| Installed isolated subprocess | Remote context over authenticated internal HTTP APIs | No shared SQL-session bridge | Plugins with isolated dependencies using supported platform service adapters |
| Standalone `mint dev` | No integrated context | Local SQLite | Plugin API/UI development and local database tests |
| `mint dev --platform` | Development proxy into the standalone server | Local SQLite | Testing platform URL/proxy behavior during development |

The **table-owning plugin tutorial must be deployed in-process** for PostgreSQL. `requires_shared_database=True` combined with `RemotePlatformContext` fails validation with `ConfigurationException`. Calling the remote context's `get_shared_db_session()` directly raises `NotImplementedError`; the SDK does not silently switch an installed remote plugin to SQLite.

## In-process plugins

MINT installs compatible dependencies into the platform environment and mounts the plugin's routers in the platform FastAPI application. Calls to SDK repository adapters reach platform services directly.

The session returned by `get_plugin_db_session()` uses the schema derived from the plugin entry-point identity, such as `panel_designer` for `panel-designer`. On the normal installed entry-point startup path, MINT prepares that schema and runs declared migrations before plugin initialization. See [Migrations](/sdk/concepts/migrations) for baseline stamping, conformance checks, and failure reporting.

Do not use the shared connection to query platform tables directly. The repository APIs carry experiment visibility and plugin capability checks; an arbitrary SQL query does not acquire those checks automatically. Schema scoping is a data-organization mechanism, not a sandbox for untrusted Python code.

An ordinary route exception can be handled as an HTTP failure. A process crash, blocking code, or excessive resource use can still affect the platform process. Do not treat exception middleware as process containment.

## Isolated subprocess plugins

MINT provisions a plugin environment, starts an SDK-owned server on a local port, and proxies the plugin's public routes. The public URL remains the plugin's platform route; the separate process does not need a new user-facing address.

The subprocess receives platform connection details and a plugin-scoped internal credential. `RemotePlatformContext` adapts supported SDK services to the platform's `/api/internal` HTTP surface. User identity is propagated through the trusted runtime path; never accept arbitrary identity headers from a plugin's own browser UI as proof of authentication.

Experiment repositories, supported data/result operations, and other implemented remote adapters can use this path. The adapters do **not** expose an arbitrary SQLAlchemy session or shared Python objects. Check the specific API's remote implementation when introducing another platform service.

Treat platform repositories as the interface between processes. If an isolated analysis plugin needs durable experiment results, use the platform's analysis/artifact/object-store APIs instead of assuming the SQL-table API works remotely. If its application genuinely needs plugin-owned PostgreSQL tables, arrange an in-process installation with compatible dependencies.

Admins can inspect running subprocess plugins in server status. Use the platform's reported runtime, process health, logs, and SDK compatibility state to diagnose an installation; a successful wheel build alone does not verify that runtime path.

## Version compatibility comes first

The plugin bundle's `[tool.mint].requires_mint`/manifest requirement is checked against the running platform, and marketplace metadata may declare a minimum platform version. The platform constrains `mint-sdk` to its installed version during plugin dependency installation. A plugin dependency range that excludes the platform's SDK version cannot be solved by assuming isolation supplies an unrelated SDK version.

Keep the plugin package version, declared platform compatibility, and actual tested SDK version accurate. See [Versioning](/sdk/operations/versioning) and [Deploying](/sdk/operations/deploying) for release/install steps.

## Development proxy limitations

`mint dev --platform` is a development workflow. The platform forwards matching plugin paths to your local standalone server, allowing API/frontend hot reload. A proxy entry may look like:

```toml
# Platform config.dev.toml
[proxy]
"/panel-designer" = "http://localhost:8003"
```

This does not install the entry-point plugin into the platform process, run its PostgreSQL migrations, or automatically supply the full `MINT_PLATFORM_URL` / `MINT_PLUGIN_TOKEN` integration contract to the standalone process. A request-dependent platform operation such as `CurrentExperiment` can still be unavailable in standalone mode.

Use a disposable MINT installation for the final integration check. Verify both a fresh install and an upgrade with saved plugin data; if targeting subprocess deployment, exercise the actual installed subprocess rather than only the development proxy.

## Configuration scope

Plugin loading lives under `plugins` in `config.json`: `loadFromEntryPoints`, explicit `plugins` entries, `extraIndexUrls`, and durable `settings`. The released user configuration does not expose `forceIsolated` or `forceShared` switches. Do not add guessed options to configuration to work around a runtime mismatch.

Release sources: [runtime database validation](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/plugin_database.py), [remote context](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/remote_context.py), and [platform plugin loader](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/plugins/loader.py).
