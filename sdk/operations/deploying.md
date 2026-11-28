# Deploying and verifying a plugin

Build a `.mint` bundle, verify it on a disposable MINT platform, then install the same bundle on the target server. A standalone plugin's SQLite file is development storage, not the platform database.

## 1. Check and build locally

```bash
uv run mint doctor --strict
uv run mint sdk generate --check
uv run mint lint
uv run pytest
uv run mint build
```

For a frontend plugin, also run its tests and its type check. `mint build` runs the Python tests and the frontend build, checks that the two SDKs resolve to the same release, and puts the frontend assets into the wheel. See [Packaging](/sdk/operations/packaging).

## 2. Verify the installation path

```bash
uv run mint verify --bundle dist/my-plugin-0.2.0.mint
```

Use the filename of the bundle that you built. Docker must run. The command does these steps:

1. Start a temporary platform and a PostgreSQL service.
2. Complete the initial setup.
3. Upload the bundle.
4. Wait for the restart and the plugin load.
5. Remove the environment.

| Option | Effect |
|---|---|
| (none) | Use the stable platform image |
| `--channel beta` | Use the prerelease image |
| `--image IMAGE` | Use this platform image |
| `--keep` | Keep the environment for inspection |
| `--timeout` | Limit setup, restart and plugin load (default 300 seconds) |

To run your own API smoke tests, write the smoke suite, then set:

```toml
[tool.mint]
verify_command = "uv run pytest tests/smoke -x"
```

The runner sets `MINT_VERIFY_URL`, `MINT_VERIFY_USERNAME` and `MINT_VERIFY_PASSWORD`. These credentials are for the temporary instance only. Do not log them.

A new installation does not test an upgrade. For a plugin with database tables, also do these steps on a staging platform:

1. Install the previous release.
2. Create representative data.
3. Upgrade to the new bundle.
4. After the restart, check the data.

## 3. Deploy to a test platform

```bash
mint platform auth login --url http://127.0.0.1:18020 --name test
mint platform status
mint deploy --url test --bundle dist/my-plugin-0.2.0.mint
mint platform plugin list
```

Make sure that the URL names your test platform. `--url` takes a URL or a part of a host name from `mint platform auth hosts`. `deploy` uses the credential stored for that host before `MINT_TOKEN`. `--to` is the older name of `--url`.

`deploy` uploads the bundle and then restarts the platform and waits for the plugin. With `--no-restart`, the administrator does the restart. To upload only:

```bash
mint platform plugin upload dist/my-plugin-0.2.0.mint
```

`plugin upload` sends a `.mint` file from your computer. To install the `.mint` asset of a GitHub release, use `mint platform plugin github install REPO --tag TAG`.

`--force` skips the dependency-conflict check before the upload. It does not override `requires_mint` or the SDK range of the platform. Do not use it to replace an old version.

Settings commands take the runtime plugin name. Upgrade and uninstall commands take the installed package name. `plugin list --json` shows both.

### What deploy confirms

Without `--bundle`, `mint deploy` builds the bundle as `mint build` does, tests included. A dirty git tree stops the build. To build anyway, add `--allow-dirty`. Without `--url`, the target is `MINT_URL`, then the default host.

The upload needs `plugins.install`. When the platform reports that a restart is necessary, `deploy` restarts it and waits:

1. **Restart.** Before the restart, `deploy` reads `boot_id` from `GET /api/health`. Each server process reports a new `boot_id`. The restart counts only when a different `boot_id` appears. Thus a redeploy of the same version is also confirmed. A platform older than 1.2.9 reports no `boot_id`. Then `deploy` waits for health and for the plugin version in the bundle's `manifest.json`.
2. **Load.** `deploy` waits until the plugin is in the loaded list of the platform. When the loaded version is not the bundle version, it prints a warning with both versions and still succeeds. Make sure that `Plugin.metadata.version` follows the package version.
3. **Enabled.** `deploy` reads the plugin entry. It exits 1 when the platform disabled the plugin: `enabled` is false, a `migration_error` is set, or the dependency lock disabled the plugin. An example `migration_error` is "Migration checksum or owner mismatch" after a released revision changed. The message gives the error and the reason. `mint platform plugin list` shows the same state.

`--timeout` (default 180 seconds) limits the restart and the load together. A failure prints `Error: ...` and exits 1. With `--json`, it prints `{"success": false, "message": ...}`.

The restart needs `platform.configure`. Without it, `deploy` stops with an error that says that the plugin is installed but not running. Ask an administrator to restart the platform, or deploy with `--no-restart`. Then the command prints `Uploaded. Restart the platform to load the plugin.`

## 4. Check behavior after installation

| Check | What it proves |
|---|---|
| Open the plugin in the platform, then reload a nested route | Packaged assets and frontend routing work |
| Sign in as an expected member and as a restricted user | Backend resource and access-level checks work |
| Select an experiment; save, reload and export | Data ownership and persistence work |
| Run a job and open the saved artifact | Computation and result integration work |
| Change a setting and restart | Validated settings stay after a restart |
| Upgrade existing tables and read old rows | The migration keeps the data |

To read diagnostics, use `mint platform debug summary`, `mint platform debug logs` or the admin logs of the platform. To connect a frontend failure to the backend log, use [typed errors and request IDs](/sdk/recipes/error-handling).

## Deploy to a platform on another SDK minor

A plugin runs only on a platform whose `mint-sdk` its requirement admits. At the first start of a new minor, the platform disables each in-process plugin whose wheel excludes the platform SDK and removes its packages from the platform environment. A plugin process whose cached wheel excludes the platform SDK does not start. The plugin data stays. Admin > Plugins shows the reason, and the startup log has one error line for each disabled plugin. Install a release of the plugin that admits the new SDK. See [Plugins that exclude the new platform version](/admin/updates#plugins-that-exclude-the-new-platform-version).

The platform also disables a plugin whose requirements do not resolve against the platform lock. A plugin runs on the libraries of the platform, so a new minor can change its behavior without a new plugin release. For 1.6, see [Changes without a new plugin release](/sdk/operations/migrate-1.5-to-1.6#changes-without-a-new-plugin-release).

Test against the image of the target minor, for example `mint verify --image ghcr.io/morscherlab/mint:1.6.0`. The platform and a plugin process compare the internal API version at the handshake. A plugin process on an older SDK fails with HTTP 426 `plugin.api_version_mismatch`.

A Dockerfile or process unit of a plugin process runs `mint -C DIR daemon` or `uv run uvicorn mint_sdk.app:create_app --factory`. A command that names `mint_sdk.runtime:create_plugin_app` or a factory of your own does not work.

## Runtime choices and storage

The runtime table is in [Isolation](/sdk/concepts/isolation#runtime-comparison). To register an external or Docker runtime, use `mint platform plugin runtime external` or `docker`. See the [CLI reference](/sdk/api/cli-reference#mint-platform-plugin). The runtime is not related to the `generated` or `standard` UI mode or to the data-access type of the plugin.

Keep code and assets in the wheel. For persistent data, use the data directories of the context, plugin schema sessions or managed artifact storage. Do not write next to the installed Python source.

## Native libraries and offline installs

Declare the scientific Python dependencies in your package. The SDK supplies the framework libraries. It does not install `Rscript`, operating-system libraries or hardware drivers. Document and verify these on the target Linux host or image.

For an offline target, vendor the dependency wheels. See [Offline installs](/sdk/operations/packaging#offline-installs). Do the build and the verification on Linux of the target architecture.

## Migrations, long jobs and recovery

Migrations run while the plugin loads and can make the startup slower. Alembic revisions and PostgreSQL advisory locks control the schema update. They do not make the full deployment one transaction. For large backfills, use [staged schema changes](/sdk/recipes/backfill-migration).

Declare long computations with `@job`. Do not block an HTTP handler. The default standalone job runtime is local to the process. `@job` alone does not give recovery after a restart or execution on several replicas. Verify the execution mode and the storage of the platform for durable work. In-memory caches and local files are not shared between replicas.

Before a production upgrade, keep the previous bundle and matching backups of PostgreSQL and the object and file storage. A previous `.mint` bundle does not reverse database migrations. Do one of these:

- Keep schema changes backward compatible.
- Ship a forward fix.
- Restore the matching data backup.

Document restore steps that are specific to the plugin in the release notes.

Source: [verification runner](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/verify_command.py), [deployment command](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/deploy_command.py).
