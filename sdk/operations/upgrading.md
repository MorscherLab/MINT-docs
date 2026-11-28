# Upgrading the SDK

Use these steps to move a plugin to a new SDK release. The platform, the Python SDK and the frontend SDK share one `v*` release tag. The plugin keeps its own version.

Before you change dependencies, read the [notable changes](/changelog), the [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md) and the [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md). For a new minor release, also follow its migration guide, one minor at a time. The list is on the [Operations](/sdk/operations/#move-to-a-new-sdk-release) page.

## Prepare the project and target platform

1. Create a development branch.
2. Keep the previous bundle, the lockfiles and a backup of the production database.
3. Make sure that the plugin tests pass before the upgrade.

A platform upgrade and a plugin SDK upgrade are separate operations.

Use the @MINT_VERSION@ CLI for the upgrade, also when the project environment has an older SDK. Install it and Vite+ 1.5.1 or later as [Install the toolchain](/sdk/install) describes. Use `--version @MINT_VERSION@` for a specific release.

After the dependency sync, the commands on this page use `uv run mint`, so they run the SDK of the project environment. When `uv.lock` locks a newer `mint-sdk` minor than the running `mint`, some commands stop. See [Install and choose the environment](/sdk/api/cli-reference#install-and-choose-the-environment).

The platform refuses a plugin whose `mint-sdk` requirement excludes the platform SDK. Raise a ceiling such as `<1.6` before the plugin can run on 1.6. For a plugin that needs the APIs of this release, use:

```toml
[project]
dependencies = ["mint-sdk>=@MINT_VERSION@,<2.0"]

[dependency-groups]
dev = [
  "mint-sdk[cli,server]>=@MINT_VERSION@,<2.0",
  "ruff>=0.16.9",
  "pytest>=9.1.1",
  "pytest-asyncio>=1.4.0",
]

[tool.mint]
requires_mint = ">=@MINT_VERSION@,<2.0"
```

Merge these entries into the scaffold. Keep the scientific and other application dependencies of the plugin. When the plugin owns SQLModel tables, use `mint-sdk[local-db]` in the runtime dependencies. The SDK supplies FastAPI, Pydantic and HTTPX. `[cli]` supplies Typer, and `[server]` supplies Uvicorn. Do not set versions for these packages in the plugin. [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately) tells you how to choose the floor.

## Python 3.14 and SDK-owned dependencies

`mint-sdk` requires Python 3.14 (since 1.3). A plugin whose `requires-python` admits an older Python resolves to `mint-sdk` 1.2. Set `requires-python = ">=3.14"` in `[project]`. `mint sdk update` to a 1.3 or later release does this for you. Install Python 3.14 in CI too.

In the ruff configuration, set `target-version = "py314"` and add `UP037` to `ignore`. When ruff unquotes an annotation that only `TYPE_CHECKING` imports, the runtime handler introspection of the SDK fails.

The SDK sets the versions of FastAPI, Starlette, Pydantic, HTTPX and the other shared libraries. A plugin that caps one of them below the SDK floor cannot install next to the SDK. Remove such a requirement. `mint doctor` warns about direct declarations, `uvicorn` included.

Check your code for these changes:

- The library changes of 1.6 (SQLAlchemy 2.1, FastAPI 0.163, aware UTC timestamps). See [Changes without a new plugin release](/sdk/operations/migrate-1.5-to-1.6#changes-without-a-new-plugin-release). The `local-db` extra needs SQLAlchemy `>=2.1.9,<2.2`.
- Starlette 1.x removed `on_startup`/`on_shutdown`, `on_event()`, `add_event_handler()`, `@app.route()`, `@app.websocket_route()`, `@app.exception_handler()` and `@app.middleware()` on a `Starlette` app. Use `lifespan`, `routes`, `exception_handlers` and `middleware`. `FileResponse(method=...)` is also removed.
- A plugin table with `datetime` fields needs timezone-aware datetimes. See [Migrations](/sdk/api/migrations).
- The Typer release that the `cli` extra requires includes its own copy of Click. Click-specific customization of a Typer app does not work.
- Starlette's `TestClient` warns when it falls back to `httpx`. The `cli` and `dev` extras supply `httpx2`, which it prefers.

## Select one SDK release

```bash
mint sdk update --version @MINT_VERSION@ --dry-run
mint sdk update --version @MINT_VERSION@
```

When the project declares both SDKs, the updater selects a release that is on PyPI and on npm. It then does these steps:

- Synchronize the Python and frontend lockfiles to that release.
- Normalize supported legacy Python pins.
- Remove framework dependencies that the SDK supplies. A `typer`, `uvicorn` or `httpx2` in a dev group becomes `mint-sdk[cli,server]` in that group, with the range of the project's `mint-sdk`. `mint doctor --fix` does the same.
- For a 1.3 or later target, raise `requires-python` to `>=3.14`. It only raises the floor. Upper bounds, exclusions, `~=` and `==` clauses and a stricter floor stay. It refuses a result that excludes 3.14, for example `<3.14` or `==3.12.*`.

The updater does not change AI instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`). It points to `mint doctor --fix`. Review the changes before you commit them.

The update target and the compatibility floor are different:

- Without `--version`, the updater keeps an existing valid Python floor. When your code starts to use a new API, raise the floor yourself.
- `--version X` raises each `mint-sdk` requirement with a floor below `X` to `>=X`: the dependencies, the optional dependencies and the dependency groups. The derived `requires_mint` of the bundle follows. A release with this floor installs only on a platform of release `X` or later.
- The updater refuses a target that Python upper bounds, exclusions or `[tool.mint].requires_mint` exclude. The exception: `--version` on a newer supported minor moves each `mint-sdk` requirement to `>=VERSION,<ceiling`. It also widens a `requires_mint` that excludes the target to the same range. The ceiling is `<2.0` for a 1.4 or later target, and the next minor before that.

The updater selects the newest candidate first, then checks the bounds. It does not search back for the newest allowed version. Thus a plugin that declares `<1.5` fails with `--scope minor` when 1.5 exists. For a fixed support line, use patch updates. To move to the next minor, use `--version` on an upgrade branch. A plugin that declares `<2.0` follows 1.x releases without a range change.

`--verify` uses the image of a release channel, not the image of the `--version` release. To test one platform build, use `mint verify --image IMAGE`. When the sync or the verification fails, the updater restores the dependency files. It tries to restore the installed environments too, but does not guarantee it. Sync again before you continue. All flags are in [`mint sdk update`](/sdk/api/cli-reference#mint-sdk-update).

## Regenerate, test and install

```bash
uv sync
uv run mint sdk generate
uv run mint sdk generate --check
uv run mint doctor --strict
uv run mint lint
uv run pytest
```

For a standard plugin, also run these commands in `frontend/`. `--frozen-lockfile` needs a [committed lockfile](/sdk/operations/versioning#commit-lockfiles).

```bash
vp install --frozen-lockfile
vp run test
vp run type-check
vp run build
```

A plugin made before 1.6 uses bun or npm until you run [`mint migrate`](/sdk/operations/migrate-1.5-to-1.6#run-mint-migrate). `vp` sends these commands to the package manager of its lockfile.

Then build the bundle and test the installation:

```bash
uv run mint build
uv run mint verify --bundle dist/my-plugin-0.2.0.mint
```

Use the filename of the bundle that you built. Docker must run for `verify`. When migrations change, test a new database and a copy of the previous plugin schema. After the installation, check sign-in, experiment selection, forbidden operations, saved results, settings and page reload. A frontend build alone does not verify the platform integration.

Commit the source changes, the generated contracts and the updated lockfiles together. See [Commit lockfiles](/sdk/operations/versioning#commit-lockfiles). After these checks, release the plugin under its next version. An SDK update does not publish the plugin or upgrade a running platform.

## Local SDK development

`mint sdk link --sdk-path PATH` links local SDK sources. `mint sdk unlink` restores the published dependencies. In a workspace with several plugins, check which projects the command finds before you use it. After the SDK work, unlink, sync and repeat the build and installation checks against the published release. Then distribute the plugin.

Source: [update implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/update_command.py),
[dependency policy](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/dependency_policy.py).
