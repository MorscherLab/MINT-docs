# Deploying and verifying a plugin

Build a `.mint` bundle, verify it on a disposable MINT platform, then install
that same artifact on the intended server. These instructions target MINT
**1.2.1**; the platform requires PostgreSQL. A standalone plugin's SQLite file
is development storage, not the platform database.

## 1. Check and build locally

```bash
uv run mint doctor --strict
uv run mint sdk generate --check
uv run pytest
uv run mint build .
```

For a frontend plugin, run its tests and type check as well. `mint build` runs
Python tests and the frontend build, validates SDK release alignment and
packages frontend assets into the wheel. See [packaging](/sdk/operations/packaging).

## 2. Verify the real installation path

```bash
uv run mint verify . --bundle dist/my-plugin-0.2.0.mint
```

Replace the filename with the bundle you built. Docker verification creates a
throwaway platform and PostgreSQL service, completes initial setup, uploads the
bundle, waits for restart/loading and then tears down the environment. Defaults
use the stable platform image; use `--channel beta` for a prerelease or `--image
IMAGE` to choose a particular platform image. `--keep` preserves the environment
for inspection.

To include your plugin's own API smoke checks:

```toml
[tool.mint]
verify_command = "uv run pytest tests/smoke -x"
```

The runner supplies `MINT_VERIFY_URL`, `MINT_VERIFY_USERNAME` and
`MINT_VERIFY_PASSWORD`. Use these only for the temporary verification instance;
do not log credentials. Write the smoke suite before enabling this setting.

A fresh install is not an upgrade test. For a database plugin, also install the
previous release on a staging platform, create representative data, upgrade to
the new bundle and verify that data after restart.

## 3. Deploy to a test platform

```bash
mint auth login --url http://127.0.0.1:18020
mint status
mint deploy . --to http://127.0.0.1:18020 --bundle dist/my-plugin-0.2.0.mint
mint plugin list --json
```

The URL must identify your intended test platform. `deploy` uploads the bundle
and, by default, performs the restart/load workflow. `--no-restart` leaves any
required restart to the administrator. The equivalent upload-only path is:

```bash
mint plugin upload dist/my-plugin-0.2.0.mint
```

Platform permissions govern installation. `--force` skips ordinary dependency
conflict preflight; it does not override `requires_mint` or the platform SDK
version constraint. It is not a normal "replace old version" flag.

`plugin upload` sends the published `.mint` file from your machine. For a
GitHub-hosted release, use `mint plugin github install REPO --tag TAG` to fetch
its `.mint` asset. Settings use
the runtime plugin name, while upgrade/uninstall commands take the installed
package name; `plugin list --json` shows both.

## 4. Check behavior after installation

| Check | What it proves |
|---|---|
| Open the plugin through the platform, then reload its nested route | Packaged assets and frontend routing work |
| Sign in as the expected member and as a restricted user | Backend resource and role checks work |
| Select an experiment; save, reload and export | Data ownership and persistence work |
| Run a job and inspect the saved artifact | Computation and platform result integration work |
| Change a setting and restart | Validated settings survive restart |
| Upgrade existing tables and inspect old rows | The migration path preserves data |

Read diagnostics with `mint debug summary` / `mint debug logs`, or the platform
admin logs. Use [typed errors and request IDs](/sdk/recipes/error-handling) to
connect frontend failures with backend logs.

## Runtime choices and storage

| Runtime | Appropriate use | Important boundary |
|---|---|---|
| In-process plugin | `.mint` bundle with compatible Python dependencies | Required for platform shared-table sessions in 1.2 |
| Isolated subprocess | Conflicting/heavy Python dependency sets | Remote scoped repositories; no direct shared SQL sessions |
| External server | An already running plugin service | Platform must reach its URL; the service owns its process lifecycle |
| Docker runtime | Plugin with a containerized runtime | Container image, networking and native libraries must be provided |

External and Docker runtimes can be registered using `mint plugin runtime
external` / `docker`; see the [CLI reference](/sdk/api/cli-reference) and
[isolation guide](/sdk/concepts/isolation). Runtime isolation is distinct from
`generated`/`standard` UI modes and from the plugin's data-access type.

Keep code/assets in the wheel. Use context-provided data directories, plugin
schema sessions or managed artifact storage for persistent data; do not write
beside installed Python source. In the scaffold, `frontend/dist` is mapped into
`<plugin_module>/frontend` inside the wheel. The loader serves it through the
plugin's frontend mount.

## Native libraries and offline installs

Declare scientific Python dependencies in your package. The SDK supplies the
framework stack, but it does not install `Rscript`, operating-system libraries
or hardware drivers. Document and verify these on the target Linux host/image.

`mint build --vendor-deps` includes dependency wheels; `--include-wheel PATH`
adds a wheel you already built. Native wheels must match the target OS,
architecture and Python ABI. Vendoring on macOS is not proof that a bundle can
install offline on Linux. Use a matching Linux build/verification environment.

## Migrations, long jobs and recovery

Migrations run during plugin loading and can delay startup. Numbered plugin
migrations and PostgreSQL advisory locks coordinate the schema update; they do
not make the entire deployment a distributed transaction. For large backfills,
use [staged schema changes](/sdk/recipes/backfill-migration).

Declare managed computations with `@job` rather than blocking an HTTP handler.
The default standalone job runtime is process-local; do not promise restart
recovery or multi-replica execution solely because an endpoint uses `@job`.
Verify the actual platform execution mode and storage setup for durable work.
In-memory caches and local files are not automatically shared between replicas.

Before production upgrades, preserve the previous bundle plus matching
PostgreSQL and object/file-storage backups. Installing a previous `.mint` bundle does not
reverse database migrations. Either retain backward-compatible schema changes,
ship a forward fix, or restore the corresponding data snapshot. Document any
plugin-specific restore requirements with the release.

Source: [verification runner](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/verify_command.py),
[deployment command](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/deploy_command.py).
