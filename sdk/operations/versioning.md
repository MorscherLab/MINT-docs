# Plugin versions and compatibility

Keep four versions separate: your **plugin release**, its **SDK dependencies**,
the **design-data format**, and its **database migration revision**. Changing
one does not automatically change or migrate the others.

## What each version controls

| Version | Where it lives | Example | What it does |
|---|---|---|---|
| Plugin release | Git tag → wheel metadata → `Plugin.metadata.version` and bundle manifest | `v0.2.0` | Identifies installed code and frontend assets |
| Python SDK requirement | `[project].dependencies` | `mint-sdk>=@MINT_VERSION@,<2.0` | Declares supported SDK runtime versions |
| Frontend SDK requirement | `frontend/package.json` | `^@MINT_VERSION@` | Declares the frontend dependency range |
| Resolved SDK release | `uv.lock`, `frontend/bun.lock` | `@MINT_VERSION@` in both | Records the actual build dependencies |
| Platform requirement | `[tool.mint].requires_mint` | `>=@MINT_VERSION@,<2.0` | Constrains `.mint` installation |
| Marketplace floor | Registry `min_platform_version` | `@MINT_VERSION@` | Informs catalog compatibility |
| Design-data schema | `Metadata.design = Design(version=...)` and stored `DesignData` | `"2.0"` | Labels the JSON design format |
| Database revision | Alembic `revision` | `"p002"` | Orders changes to plugin-owned SQL tables |

MINT uses a shared release for the platform, Python SDK and frontend SDK.
Your plugin does **not** need to be version `@MINT_VERSION@`: a plugin `0.2.0` can target
MINT `@MINT_VERSION@`. Build validation requires Python and frontend SDKs to resolve to
the same release; matching broad ranges alone is insufficient.

## Package identity: one source of truth

The `mint init` scaffold already configures `hatch-vcs`. Keep it:

```toml
[project]
name = "mint-plugin-lab-qc"
dynamic = ["version"]
dependencies = ["mint-sdk>=@MINT_VERSION@,<2.0"]

[project.entry-points."mint.plugins"]
lab-qc = "mint_plugin_lab_qc.plugin:LabQcPlugin"

[build-system]
requires = ["hatchling", "hatch-vcs"]
build-backend = "hatchling.build"

[tool.hatch.version]
source = "vcs"

[tool.hatch.build.hooks.vcs]
version-file = "src/mint_plugin_lab_qc/_version.py"

[tool.mint]
requires_mint = ">=@MINT_VERSION@,<2.0"
```

This is a fragment to merge into the scaffold, including its existing build
asset configuration and development dependency group. The entry-point key
`lab-qc` is the runtime plugin name; `mint-plugin-lab-qc` is the distribution
name used by package installation. Keep both stable: changing the runtime name
also changes the identity used for plugin-owned data and settings.

```python
from mint_sdk import Metadata, Plugin, plugin


class LabQcMeta(Metadata):
    domain = "quality-control"


@plugin(LabQcMeta)
class LabQcPlugin(Plugin):
    pass
```

Do not duplicate name/version metadata in the `Metadata` class. After installation,
`mint info --json` reports the resolved metadata. `mint build` puts the wheel
version into the bundle; renaming the `.mint` file cannot change that version.
The scaffold's fallback version is useful before your first Git tag, but a
release should be built from the intended tagged commit with tags available.

## Choose the next plugin version

| Change | Typical bump | Additional work |
|---|---|---|
| Fix a calculation without changing its contract | Patch | Regression test and describe the scientific effect |
| Add an optional parameter, route or result view | Minor | Preserve existing requests/data |
| Add a nullable SQL column | Usually minor | Append a migration and test existing databases |
| Remove/rename a required field or change result semantics | Major | Document data and client migration |
| Raise the minimum SDK/platform version | Assess your compatibility promise | Declare the new floor; document which installations must upgrade |

A database migration does not by itself require a major version. Decide based
on compatibility for users and consumers, not the number of files changed.
If changed calculations alter reproducibility, record algorithm and parameter
versions in result provenance as well as the plugin release.

## Declare compatibility deliberately

From 1.4, the plugin SDK contract has no breaking change within 1.x, and deprecations are removed in 2.0. A plugin declares `mint-sdk>=@MINT_VERSION@,<2.0` and `[tool.mint].requires_mint` with the same range. `mint init`, `mint doctor --fix` and `mint sdk update --version` write a `<2.0` ceiling for a 1.4 or later floor, and keep the next-minor ceiling (`<1.5`) for a floor before 1.4. `mint doctor` accepts a ceiling at the next major or at the next minor, so a release with `<1.5` still passes. The scaffold renders the compatibility baseline `>=1.4.0b1,<2.0`; raise the floor to `@MINT_VERSION@` when your support policy requires the stable release. The npm pin of `@morscherlab/mint-sdk` stays exact.

The bundle installer checks `requires_mint` and the wheel's SDK requirement.
The platform compiles the plugin requirements against its own lock with `mint-sdk` as the installed distribution, so a plugin cannot silently replace the SDK. A plugin built for an older minor is disabled at the first start of a newer platform (for example a `mint-sdk<1.4` plugin on 1.4). Keep the marketplace floor consistent with the
bundle requirement. If `requires_mint` is omitted, the builder derives a floor
from the Python SDK requirement when possible, otherwise from its build SDK;
set it explicitly for releases with a documented support range.

The two platform declarations differ in form and in when they are checked:

| Declaration | Lives in | Form | Checked when |
|---|---|---|---|
| `[tool.mint].requires_mint` | `pyproject.toml`, copied into the bundle manifest | PEP 440 specifier, e.g. `">=@MINT_VERSION@,<2.0"` | Every `.mint` install (upload, GitHub, marketplace) |
| `min_platform_version` | Marketplace registry entry | Version floor, e.g. `"@MINT_VERSION@"` | Catalog compatibility and marketplace install |

Use [the SDK updater](/sdk/operations/upgrading) to keep Python and frontend
resolutions aligned. It preserves a valid existing Python compatibility floor;
selecting a newer lockfile version is not a declaration that older versions
remain supported by newly changed code.

## Design-data versions do not migrate data

```python
class PlateDesignerMeta(Metadata):
    domain = "plate-design"
    prefix = "/plate-designer"
    writes = {"experiments", "design"}
    design = Design(version="2.0")


@plugin(PlateDesignerMeta)
class PlateDesignerPlugin(Plugin):
    pass
```

`Design.version` labels the format the plugin writes. Existing saved designs
retain their recorded version. Merely changing the declaration does not rewrite
old JSON or SQL tables. Decide how the plugin handles old designs: accept both
formats, convert a validated old format on an explicit save, or provide a
separate backfill with backup and validation. Keep export/read behavior clear
when a design is too old for the current editor.

## Database revisions are append-only

| Plugin release | Migrations shipped |
|---|---|
| `0.1.0` | `p001_initial` |
| `0.2.0` | `p001_initial`, `p002_add_notes` |
| `0.2.1` | Same revisions; code fix only |
| `1.0.0` | Previous revisions plus `p003_convert_values` |

Alembic revisions chain by `revision` / `down_revision` ids. Never reset the chain or
rewrite an already applied revision. Update the
SQLModel definition and add the corresponding migration together. Test both
fresh table creation and upgrade from the last deployed schema: they take
different paths. See [migrations](/sdk/concepts/migrations) and the
[table tutorial](/sdk/tutorials/design-plugin-with-tables).

Installing an older `.mint` bundle does not undo schema/data changes. For rollback,
verify the older code is compatible with the new schema or restore the matching
database/storage backup. Prefer a forward corrective release when practical.

## Git, lockfiles and release artifacts

Keep code, migrations, generated contracts, lockfiles and `CHANGELOG.md` in the
same review. Exclude `.venv`, `node_modules`, secrets, local SQLite databases
and development data. Do not edit generated clients by hand.

### Commit lockfiles

The `mint init` scaffold's `.gitignore` excludes `uv.lock`,
`frontend/bun.lock` and `frontend/bun.lockb`. To record the resolved SDK
release and build reproducibly, delete those three lines from `.gitignore`,
then commit both lockfiles:

```bash
uv lock
(cd frontend && bun install)
git add .gitignore uv.lock frontend/bun.lock
```

After that, CI can use `uv sync --locked` and `bun install --frozen-lockfile`,
which fail when a lockfile is out of date.

A release sequence after the review and checks pass:

```bash
uv run mint doctor --strict
uv run mint sdk generate --check
uv run pytest
# Run frontend checks too, when present.
git tag v0.2.0
git push origin v0.2.0
```

Use the scaffold's release workflow or [CI guide](/sdk/operations/ci-patterns)
to build and attach the versioned `.mint` asset. Tags and published artifacts
are immutable; fix a bad release with a new version. Build from a clean tag,
and use `fetch-depth: 0` in CI so `hatch-vcs` can resolve it.

| Git tag | Python wheel version | Meaning |
|---|---|---|
| `v0.2.0-beta.1` | `0.2.0b1` | Prerelease for testing |
| `v0.2.0-rc.1` | `0.2.0rc1` | Release candidate |
| `v0.2.0` | `0.2.0` | Stable release |

Advertise prereleases only through the intended testing channel/registry.
Include upgrade steps, the supported MINT range, schema revisions and any
changed analysis semantics in the changelog. See [publishing](/sdk/operations/publishing)
for registry and artifact distribution.

Source: [package identity](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/package_metadata.py),
[build implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli_build.py),
[scaffold version policy](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_versions.py).
