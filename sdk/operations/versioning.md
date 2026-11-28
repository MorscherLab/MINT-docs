# Plugin versions and compatibility

A plugin has several version numbers. Each one has its own job. A change to one does not change or migrate the others.

## What each version controls

| Version | Where it lives | Example | What it does |
|---|---|---|---|
| Plugin release | Git tag → wheel metadata → `Plugin.metadata.version` and bundle manifest | `v0.2.0` | Identifies the installed code and frontend assets |
| Python SDK requirement | `[project].dependencies` | `mint-sdk>=@MINT_VERSION@,<2.0` | Declares the supported SDK versions |
| Frontend SDK requirement | `frontend/package.json` | `@MINT_VERSION@` | Pins the frontend SDK release (exact) |
| Resolved SDK release | `uv.lock`, `frontend/pnpm-lock.yaml` | `@MINT_VERSION@` in both | Records the SDK that the build used |
| Platform requirement | `[tool.mint].requires_mint` | `>=@MINT_VERSION@,<2.0` | Limits `.mint` installation |
| Marketplace floor | Registry `min_platform_version` | `@MINT_VERSION@` | Tells the catalog which platforms are compatible |
| Design-data schema | `Metadata.design = Design(version=...)` and stored `DesignData` | `"2.0"` | Labels the JSON design format |
| Database revision | Alembic `revision` | `"p002"` | Orders the changes to plugin-owned SQL tables |

The platform, the Python SDK and the frontend SDK share one release number. The plugin has its own version: a plugin `0.2.0` can target MINT `@MINT_VERSION@`. The build requires that the Python and frontend SDKs resolve to the same release. Matching ranges alone are not sufficient.

## Package identity: one source of truth

The `mint init` scaffold configures `hatch-vcs`. Keep it:

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

Merge this fragment into the scaffold. Keep the build asset configuration and the development dependency group of the scaffold. The entry-point key `lab-qc` is the runtime plugin name. `mint-plugin-lab-qc` is the distribution name for package installation. Do not change either name: the runtime name is also the identity of the plugin's data and settings.

```python
from mint_sdk import Metadata, Plugin, plugin


class LabQcMeta(Metadata):
    domain = "quality-control"


@plugin(LabQcMeta)
class LabQcPlugin(Plugin):
    pass
```

Do not repeat the name or the version in the `Metadata` class. `mint info --json` shows the resolved metadata. `mint build` puts the wheel version into the bundle manifest, and a new filename does not change it. The scaffold has a fallback version for the time before the first git tag. Build a release from the tagged commit, with the tags available.

## Choose the next plugin version

| Change | Version step | Also do |
|---|---|---|
| Fix a calculation without a change to its contract | Patch | Add a regression test. Describe the scientific effect |
| Add an optional parameter, route or result view | Minor | Keep existing requests and data working |
| Add a nullable SQL column | Minor | Add a migration. Test existing databases |
| Remove or rename a required field, or change the meaning of results | Major | Document the migration of data and clients |
| Raise the minimum SDK or platform version | Depends on your compatibility promise | Declare the new floor. Document which installations must upgrade |

A database migration alone does not make a major version. Decide from the compatibility for users and clients, not from the number of changed files. When a changed calculation changes reproducibility, also record the algorithm and parameter versions in the result provenance.

## Declare compatibility deliberately

The plugin SDK contract has no breaking change within 1.x. MINT 2.0 removes the deprecated APIs. Declare the same range in two places:

- `mint-sdk>=@MINT_VERSION@,<2.0` in `[project].dependencies`
- `requires_mint = ">=@MINT_VERSION@,<2.0"` in `[tool.mint]`

`mint init`, `mint doctor --fix` and `mint sdk update --version` write the `<2.0` ceiling for a floor of 1.4 or later. For a floor before 1.4, they keep the next-minor ceiling (`<1.5`). `mint doctor` accepts a ceiling at the next major or at the next minor.

`mint init` sets the floor to the release that it pins: the newer of the latest stable SDK and the SDK of the running CLI. A release with this floor installs only on a platform of the same release or later. When the plugin must also install on an older 1.x platform and uses no newer API, lower the floor. `mint sdk update --version X` raises a floor below `X` to `X`. The npm pin of `@morscherlab/mint-sdk` stays exact.

The bundle installer checks `requires_mint` and the SDK requirement of the wheel. The platform compiles the plugin requirements against its own lock, with `mint-sdk` as the installed distribution. Thus a plugin cannot replace the SDK. A plugin that excludes a newer platform minor is disabled at the first start of that platform (for example, a `mint-sdk<1.4` plugin on 1.4).

Without `requires_mint`, the builder derives a floor from the Python SDK requirement, else from the SDK of the build. Set `requires_mint` explicitly for a release with a documented support range.

The two platform declarations have different forms and are checked at different times. Keep them consistent:

| Declaration | Lives in | Form | Checked when |
|---|---|---|---|
| `[tool.mint].requires_mint` | `pyproject.toml`, copied into the bundle manifest | PEP 440 specifier, e.g. `">=@MINT_VERSION@,<2.0"` | Every `.mint` install (upload, GitHub, marketplace) |
| `min_platform_version` | Marketplace registry entry | Version floor, e.g. `"@MINT_VERSION@"` | Catalog compatibility and marketplace install |

Use [the SDK updater](/sdk/operations/upgrading) to keep the Python and frontend resolutions aligned. Without `--version`, it keeps a valid Python floor. A newer version in the lockfile does not mean that new code still works with older versions. When new code needs a newer API, raise the floor yourself.

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

`Design.version` labels the format that the plugin writes. Saved designs keep their recorded version. A new declaration does not rewrite old JSON or SQL tables. Decide how the plugin handles old designs:

- Accept both formats.
- Convert a validated old design when the user saves it.
- Run a separate backfill, with a backup and a validation.

Make the read and export behavior clear when a design is too old for the current editor.

## Database revisions are append-only

| Plugin release | Migrations shipped |
|---|---|
| `0.1.0` | `p001_initial` |
| `0.2.0` | `p001_initial`, `p002_add_notes` |
| `0.2.1` | Same revisions; code fix only |
| `1.0.0` | Previous revisions plus `p003_convert_values` |

Alembic revisions form a chain through their `revision` and `down_revision` ids. Do not reset the chain. Do not change a revision that is already applied. The platform stores a checksum of each applied revision. It disables a plugin whose released revision file changed ("Migration checksum or owner mismatch"). The "Released revisions" check of `mint doctor` names each file of the migration package that the latest git tag has and the working tree changed or removed. Keep formatters off the revision package.

Change the SQLModel definition and add its migration together. Test a new installation and an upgrade from the last deployed schema, because they use different paths. See [Plugin tables and migrations](/sdk/concepts/migrations) and the [table tutorial](/sdk/tutorials/design-plugin-with-tables).

An older `.mint` bundle does not undo schema or data changes. For a rollback, make sure that the older code works with the new schema, or restore the matching database and storage backup. When possible, release a forward fix instead.

## Git, lockfiles and release artifacts

Review code, migrations, generated contracts, lockfiles and `CHANGELOG.md` together. Do not commit `.venv`, `node_modules`, secrets, local SQLite databases or development data. Do not edit generated clients by hand.

### Commit lockfiles

Commit `uv.lock` and `frontend/pnpm-lock.yaml`. They record the resolved SDK release and make the build reproducible. The `.gitignore` of the `mint init` scaffold does not exclude them.

```bash
uv lock
(cd frontend && vp install)
git add uv.lock frontend/pnpm-lock.yaml
```

The generated CI runs `vp install --frozen-lockfile`. It fails without a committed, current `pnpm-lock.yaml`. With committed lockfiles, you can change `uv sync` to `uv sync --locked`. Also commit `mint-lint-baseline.json`.

The `.gitignore` of a plugin made before 1.6 ignores `uv.lock` and the bun lockfile. Delete those lines. `mint migrate` reports a line that ignores `uv.lock`, and the "Lockfile tracking" check of `mint doctor` warns about it.

To release, run the checks, then push the tag:

```bash
uv run mint doctor --strict
uv run mint sdk generate --check
uv run mint lint
uv run pytest
# Run frontend checks too, when present.
git tag v0.2.0
git push origin v0.2.0
```

The scaffold's release workflow builds the `.mint` asset and attaches it to the release. See [CI patterns](/sdk/operations/ci-patterns). Do not change a tag or a published artifact. Fix a bad release with a new version. In CI, use `fetch-depth: 0`, so that `hatch-vcs` can read the tag.

| Git tag | Python wheel version | Meaning |
|---|---|---|
| `v0.2.0-beta.1` | `0.2.0b1` | Prerelease for testing |
| `v0.2.0-rc.1` | `0.2.0rc1` | Release candidate |
| `v0.2.0` | `0.2.0` | Stable release |

Offer a prerelease only in a channel or registry for testing. In the changelog, give the upgrade steps, the supported MINT range, the schema revisions and the changes to analysis results. See [Publishing](/sdk/operations/publishing).

Source: [package identity](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/package_metadata.py),
[build implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli_build.py),
[scaffold version policy](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_versions.py).
