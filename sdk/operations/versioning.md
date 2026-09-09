# Plugin versions and compatibility

Keep four versions separate: your **plugin release**, its **SDK dependencies**,
the **design-data format**, and its **database migration revision**. Changing
one does not automatically change or migrate the others.

## What each version controls

| Version | Where it lives | Example | What it does |
|---|---|---|---|
| Plugin release | Git tag → wheel metadata → `PluginMetadata.version` and bundle manifest | `v0.2.0` | Identifies installed code and frontend assets |
| Python SDK requirement | `[project].dependencies` | `mint-sdk>=1.2.1,<1.3` | Declares supported SDK runtime versions |
| Frontend SDK requirement | `frontend/package.json` | `^1.2.1` | Declares the frontend dependency range |
| Resolved SDK release | `uv.lock`, `frontend/bun.lock` | `1.2.1` in both | Records the actual build dependencies |
| Platform requirement | `[tool.mint].requires_mint` | `>=1.2.1,<1.3` | Constrains `.mint` installation |
| Marketplace floor | Registry `min_platform_version` | `1.2.1` | Informs catalog compatibility |
| Design-data schema | `@mint_plugin(schema_version=...)` and stored `DesignData` | `"2.0"` | Labels the JSON design format |
| Database revision | `Migration.version` | `1`, `2`, `3` | Orders changes to plugin-owned SQL tables |

MINT 1.2 uses a shared release for the platform, Python SDK and frontend SDK.
Your plugin does **not** need to be version `1.2.1`: a plugin `0.2.0` can target
MINT `1.2.1`. Build validation requires Python and frontend SDKs to resolve to
the same release; matching broad ranges alone is insufficient.

## Package identity: one source of truth

The `mint init` scaffold already configures `hatch-vcs`. Keep it:

```toml
[project]
name = "mint-plugin-lab-qc"
dynamic = ["version"]
dependencies = ["mint-sdk>=1.2.1,<1.3"]

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
requires_mint = ">=1.2.1,<1.3"
```

This is a fragment to merge into the scaffold, including its existing build
asset configuration and development dependency group. The entry-point key
`lab-qc` is the runtime plugin name; `mint-plugin-lab-qc` is the distribution
name used by package installation. Keep both stable: changing the runtime name
also changes the identity used for plugin-owned data, roles and settings.

```python
from mint_sdk import AnalysisPlugin, mint_plugin


@mint_plugin(analysis_type="quality-control", routes_prefix="/lab-qc")
class LabQcPlugin(AnalysisPlugin):
    pass
```

Do not duplicate name/version metadata in this decorator. After installation,
`mint info . --json` reports the resolved metadata. `mint build` puts the wheel
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

For plugins tested on the 1.2 line, `>=1.2.1,<1.3` is a conservative declaration.
Use a wider range only when you support and verify it. The 1.2 scaffold may
render the compatibility baseline `>=1.2.0b1,<1.3`; raise the floor to `1.2.1`
when your support policy requires the stable release.

The bundle installer checks `requires_mint` and the wheel's SDK requirement.
It constrains plugin installation to the platform's SDK instead of letting a
plugin silently replace it. Keep the marketplace floor consistent with the
bundle requirement. If `requires_mint` is omitted, the builder derives a floor
from the Python SDK requirement when possible, otherwise from its build SDK;
set it explicitly for releases with a documented support range.

Use [the SDK updater](/sdk/operations/upgrading-sdk) to keep Python and frontend
resolutions aligned. It preserves a valid existing Python compatibility floor;
selecting a newer lockfile version is not a declaration that older versions
remain supported by newly changed code.

## Design-data versions do not migrate data

```python
@mint_plugin(
    analysis_type="plate-design",
    routes_prefix="/plate-designer",
    schema_version="2.0",
)
class PlateDesignerPlugin(AnalysisPlugin):
    pass
```

`schema_version` labels the format the plugin writes. Existing saved designs
retain their recorded version. Merely changing the decorator does not rewrite
old JSON or SQL tables. Decide how the plugin handles old designs: accept both
formats, convert a validated old format on an explicit save, or provide a
separate backfill with backup and validation. Keep export/read behavior clear
when a design is too old for the current editor.

## Database revisions are append-only

| Plugin release | Migrations shipped |
|---|---|
| `0.1.0` | `v001_initial` |
| `0.2.0` | `v001_initial`, `v002_add_note` |
| `0.2.1` | Same revisions; code fix only |
| `1.0.0` | Previous revisions plus `v003_convert_values` |

Never reset numbering or rewrite an already applied revision. Update the
SQLModel definition and add the corresponding migration together. Test both
fresh table creation and upgrade from the last deployed schema: they take
different paths. See [migrations](/sdk/concepts/migrations) and the
[table tutorial](/sdk/tutorials/design-plugin-with-tables).

Reinstalling an older wheel does not undo schema/data changes. For rollback,
verify the older code is compatible with the new schema or restore the matching
database/storage backup. Prefer a forward corrective release when practical.

## Git, lockfiles and release artifacts

Keep code, migrations, generated contracts, lockfiles and `CHANGELOG.md` in the
same review. Exclude `.venv`, `node_modules`, secrets, local SQLite databases
and development data. Do not edit generated clients by hand.

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

Source: [package identity](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/plugin_decorators.py),
[build implementation](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/cli_build.py),
[scaffold version policy](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/init_versions.py).
