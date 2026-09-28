# Upgrading the SDK

Platform, Python SDK and frontend SDK releases share one `v*` release tag; your plugin keeps its own version. Read the [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md) and [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md), or the [notable changes](/changelog#notable-changes-in-1-2), before changing dependencies. Moving a plugin from 1.1? Also follow [Migrate from 1.1 to 1.2](/sdk/operations/migrate-1.1-to-1.2).

## Prepare the project and target platform

Create a development branch and preserve the previous bundle, lockfiles and
production database backup. Verify the current plugin tests before upgrading.
The platform requires PostgreSQL in 1.2; local SQLite is still supported for
standalone plugin development. Platform upgrades and plugin SDK upgrades are
separate operations.

Use a 1.2 CLI to perform the upgrade, even if the project's environment still
contains SDK 1.1:

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
mint --version
```

For an existing uv tool installation, use `uv tool install --force
'mint-sdk[cli]==@MINT_VERSION@'`. Project commands below use `uv run mint` after dependency
synchronization, so they run the SDK selected by that project's environment.

Check compatibility declarations. A project constrained to `<1.2` must have
that ceiling changed deliberately before selecting 1.2. For a plugin that now
requires the released 1.2 APIs, use:

```toml
[project]
dependencies = ["mint-sdk>=@MINT_VERSION@,<1.3"]

[dependency-groups]
dev = [
  "mint-sdk[cli,server]>=@MINT_VERSION@,<1.3",
  "pytest>=8.0.0",
  "pytest-asyncio>=0.23.0",
]

[tool.mint]
requires_mint = ">=@MINT_VERSION@,<1.3"
```

Merge these entries into the scaffold; keep your plugin's scientific and other
application dependencies. Use `mint-sdk[local-db]` in runtime dependencies if
you own SQLModel tables. The SDK supplies its FastAPI/Pydantic/HTTPX stack;
`[cli]` supplies Typer and `[server]` supplies Uvicorn. Do not duplicate their
version policy in the plugin.

## Select one SDK release

```bash
mint sdk update . --version @MINT_VERSION@ --dry-run
mint sdk update . --version @MINT_VERSION@
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
| `--version @MINT_VERSION@` | Select this exact release instead of the newest candidate |
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

## Regenerate, test and install

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

Source: [update implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/update_command.py),
[dependency policy](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/dependency_policy.py).
