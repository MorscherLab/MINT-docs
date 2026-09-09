# Upgrading to MINT SDK 1.2

This guide targets **MINT v1.2.0**, released on 8 September 2026. Platform,
Python SDK and frontend SDK releases use the same `v1.2.0` release tag. Your
plugin has its own version. Read the [platform upgrade notes](https://github.com/MorscherLab/MINT/blob/v1.2.0/CHANGELOG.md)
and [shared SDK changelog](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/CHANGELOG.md)
before changing dependencies.

For the platform configuration and legacy API mapping, also read the
[MINT 1.2 migration guide](/sdk/operations/migrating-to-1.2).

## 1. Prepare the project and target platform

Create a development branch and preserve the previous bundle, lockfiles and
production database backup. Verify the current plugin tests before upgrading.
The platform requires PostgreSQL in 1.2; local SQLite is still supported for
standalone plugin development. Platform upgrades and plugin SDK upgrades are
separate operations.

Use a 1.2 CLI to perform the upgrade, even if the project's environment still
contains SDK 1.1:

```bash
uv tool install 'mint-sdk[cli]==1.2.0'
mint --version
```

For an existing uv tool installation, use `uv tool install --force
'mint-sdk[cli]==1.2.0'`. Project commands below use `uv run mint` after dependency
synchronization, so they run the SDK selected by that project's environment.

Check compatibility declarations. A project constrained to `<1.2` must have
that ceiling changed deliberately before selecting 1.2. For a plugin that now
requires the released 1.2 APIs, use:

```toml
[project]
dependencies = ["mint-sdk>=1.2.0,<1.3"]

[dependency-groups]
dev = [
  "mint-sdk[cli,server]>=1.2.0,<1.3",
  "pytest>=8.0.0",
  "pytest-asyncio>=0.23.0",
]

[tool.mint]
requires_mint = ">=1.2.0,<1.3"
```

Merge these entries into the scaffold; keep your plugin's scientific and other
application dependencies. Use `mint-sdk[local-db]` in runtime dependencies if
you own SQLModel tables. The SDK supplies its FastAPI/Pydantic/HTTPX stack;
`[cli]` supplies Typer and `[server]` supplies Uvicorn. Do not duplicate their
version policy in the plugin.

## 2. Select one SDK release

```bash
mint sdk update . --version 1.2.0 --dry-run
mint sdk update . --version 1.2.0
```

The updater selects a common release available on PyPI and npm when both SDKs
are declared. It synchronizes Python and frontend lockfiles to that release,
normalizes supported legacy Python pins, removes redundant SDK-owned framework
dependencies, and refreshes scaffolded assistant guidance. Review those changes
before committing.

**The update target and compatibility floor are different.** Updating the
installed SDK does not automatically raise an existing valid Python `>=` floor.
Raise it yourself when your code begins using a new API. The updater rejects a
target excluded by Python upper bounds/exclusions or `[tool.mint].requires_mint`.

| Command option | Use |
|---|---|
| `--scope patch` | Default: select a patch in the current minor |
| `--scope minor` | Select the newest candidate within the current major; fail if excluded by declared bounds |
| `--scope major` | Select across majors; fail if the candidate violates declared bounds |
| `--version 1.2.0` | Select this exact release instead of the newest candidate |
| `--channel stable` | Default release channel |
| `--channel beta` | Allow prereleases for a development branch |
| `--dry-run` | Preview file changes without applying them |
| `--no-sync` | Change declarations without installing or validating lockfiles |
| `--verify` | Also run Docker verification against the selected stable/beta channel |

`--verify` selects a **channel image**, not an exact image matching `--version`.
Use `mint verify --image IMAGE` when your test must use one particular platform
build. If synchronization or chained verification fails, the updater restores
the dependency/guidance files it snapshotted; restoring installed environments
is best effort. Re-sync before continuing after a failure.

The updater selects the newest candidate first, then checks bounds; it does
not search backward for the newest allowed version. A plugin declaring `<1.3`
can therefore fail with `--scope minor` once 1.3 exists. Use patch updates for
a fixed 1.2 support line, or review/widen bounds on an upgrade branch.

## 3. Migrate the plugin code

| Surface | Action for 1.2 | Detailed guide |
|---|---|---|
| Package discovery | Declare one `mint.plugins` entry point; derive identity from package metadata | [Versioning](/sdk/operations/versioning) |
| Type and writes | Consider `WORKFLOW`; explicitly review experiment CRUD, design writes and analysis writes | [Plugin types](/sdk/concepts/plugin-types) |
| Platform data | Use the unified experiment repository and first-class analysis artifacts | [PlatformContext](/sdk/concepts/platform-context), [writing results](/sdk/recipes/writing-results) |
| Routes | Use `@endpoint`, typed actors and resource checks; replace custom role guards with SDK guards where appropriate | [Route permissions](/sdk/recipes/route-permissions) |
| Lifecycle | Use typed `@on_event` handlers; subprocess plugins now receive platform experiment events | [Lifecycle](/sdk/concepts/lifecycle) |
| Settings | Keep runtime effects in `@on_config_change`; preserve secret references and revision checks | [PlatformContext](/sdk/concepts/platform-context) |
| Errors | Handle the typed envelope and request IDs; generated frontend clients use typed errors | [Error handling](/sdk/recipes/error-handling) |
| Tables | Keep released `get_shared_models()` and numbered `Migration` revisions | [Migrations](/sdk/concepts/migrations) |
| Frontend | Regenerate contracts and check renamed/changed public imports | [Adding a frontend](/sdk/tutorials/adding-a-frontend) |

The 1.2 SDK retains some 1.1 APIs as adapters. `mint doctor` helps identify
legacy usage; retaining an adapter does not make it the recommended API for new
code. Do not copy migration commands from unreleased source into a 1.2 plugin:
`mint db` is not a v1.2.0 command.

## 4. Regenerate, test and install

```bash
uv sync
uv run mint sdk generate
uv run mint sdk generate --check
uv run mint doctor --strict
uv run pytest
```

For a standard plugin, also run from `frontend/`:

```bash
bun install --frozen-lockfile
bun run test
bun run type-check
bun run build
```

Then build and exercise the real installation path:

```bash
uv run mint build .
uv run mint verify . --bundle dist/my-plugin-0.2.0.mint
```

Replace the bundle filename with the artifact actually produced. Docker must be
running for `verify`. Test both a fresh database and a copy of the previous
plugin schema when migrations change. Check login, experiment selection,
forbidden operations, saved results, settings and reload after installation;
a successful frontend build alone does not verify platform integration.

Commit source changes, generated contracts and the updated lockfiles together.
Release the plugin under its own next version after these checks. Updating the
SDK does not publish the plugin or upgrade a running platform.

## Local SDK development

`mint sdk link --sdk-path PATH` links local SDK sources; `mint sdk unlink`
restores published dependencies. Inspect the command's workspace discovery
before using it in a multi-plugin workspace. Use linked sources to develop SDK
changes, then unlink, synchronize and repeat build/install verification against
the published release before distributing a plugin.

Source: [update implementation](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/update_command.py),
[dependency policy](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/dependency_policy.py).
