# Versioning

Plugin versions follow [Semantic Versioning](https://semver.org/). The marketplace registry advertises the latest plugin release, and SDK update checks rely on accurate SemVer; getting the numbers wrong breaks installs.

## SemVer rules

| Bump | Use when |
|------|----------|
| **Patch** (`1.0.0 → 1.0.1`) | Bug fix, no API changes, no migration |
| **Minor** (`1.0.0 → 1.1.0`) | New feature, backward-compatible. Adding a route, an optional config field, an optional column. |
| **Major** (`1.0.0 → 2.0.0`) | Breaking change. Renaming a route, requiring a new SDK feature, dropping a column. |

For plugins, the API surface that matters is:

- HTTP routes (URLs, request/response schemas)
- The plugin's database schema (columns referenced from analysis results, public views)
- Public Python symbols if your plugin exports a library
- The frontend bundle's exports if other plugins depend on them

## Tags drive versions

Use `hatch-vcs` to derive the wheel's version from git tags. No manual version edits in `pyproject.toml`.

```toml
# pyproject.toml
[build-system]
requires = ["hatchling", "hatch-vcs"]
build-backend = "hatchling.build"

[project]
name = "my-plugin"
dynamic = ["version"]

[tool.hatch.version]
source = "vcs"

[tool.hatch.build.hooks.vcs]
version-file = "src/my_plugin/_version.py"
```

```bash
git tag v1.0.0
git push --tags
# CI builds wheel with __version__ = "1.0.0"
```

Between tags, `hatch-vcs` produces dev versions like `1.0.1.dev3+gabc123` — distinguishable from real releases.

## Pre-release labels

| Pattern | When |
|---------|------|
| `v1.0.0-beta.1`, `v1.0.0-beta.2` | Public testing of an upcoming release |
| `v1.0.0-rc.1` | Final candidate before stable; only bug fixes between rc and stable |
| `v1.0.0-alpha.1` | Internal testing; not for public consumption (rare) |

The platform update checker can include or exclude GitHub prereleases:

- `updates.includePrereleases: false` — only stable releases such as `1.0.0`, `1.0.1`, `1.1.0`
- `updates.includePrereleases: true` — also includes prereleases such as `1.0.0-beta.1` and `1.0.0-rc.1`

## Platform and SDK compatibility

Marketplace compatibility is declared in the registry entry. Set `min_platform_version` to the first MINT platform release that can install and run your plugin:

```json
{
  "name": "my-plugin",
  "latest_version": "1.2.0",
  "min_platform_version": "1.0.0"
}
```

The platform compares `min_platform_version` with the running platform version. If the plugin requires a newer platform, install and update actions are disabled until the platform is upgraded.

Your plugin also declares the `mint-sdk` versions it can build and run against:

```toml
# pyproject.toml
[project]
dependencies = [
  "mint-sdk>=1.0.0,<2.0.0",
  "fastapi>=0.110",
  "pydantic>=2.0",
]
```

| Range | Meaning |
|-------|---------|
| `>=1.0.0,<2.0.0` | Any SDK 1.x. Most plugins use this range. |
| `>=1.2.0,<2.0.0` | Requires SDK ≥ 1.2 (e.g., uses a feature added in 1.2) |
| `==1.0.*` | Requires SDK 1.0.x specifically — too strict for most cases |
| `>=1.0.0` | Open-ended — discouraged; you'll break on 2.0 |

Set the SDK floor at the lowest SDK version where every symbol you use exists. Set the ceiling at the next major. When the SDK ships its next major, bump your plugin's dependency range deliberately, after testing.

## Release flow

```
develop on dev branch
    ▼
beta tag (v1.1.0-beta.1)
    ▼ test in a prerelease-enabled platform or private registry
beta tag bump if bugs (v1.1.0-beta.2)
    ▼
graduate to stable (v1.1.0 — same commit as last beta)
    ▼
PR dev branch into main
```

The same flow applies to plugin releases. Beta tags live on the dev branch; the stable tag is on the same commit as the last passing beta. Tags are immutable — never re-tag.

```bash
# Beta cycle
git tag v1.1.0-beta.1 && git push --tags
# (test for a week)
git tag v1.1.0-beta.2 && git push --tags    # if bugs found
# (test more)
git tag v1.1.0          && git push --tags    # graduate to stable
```

## Versioning in Plugin Metadata

The resolved `plugin.metadata.version` field is *informational* — it gets read by the marketplace UI and shown to users. With `@mint_plugin`, the SDK resolves it from package identity, so keep the wheel version as the single source of truth. With `hatch-vcs`, the wheel version comes from the git tag.

```python
from mint_sdk import AnalysisPlugin, mint_plugin


@mint_plugin(analysis_type="custom", routes_prefix="/my-plugin")
class MyPlugin(AnalysisPlugin):
    pass
```

Don't hardcode the version string in plugin code. Keep it derived from the package version/tag.

## Schema versioning

`schema_version` is separate from the plugin version. It tracks the shape of `DesignData.data`:

```python
@mint_plugin(
    analysis_type="custom",
    routes_prefix="/my-plugin",
    schema_version="1.0",   # bump when DesignData.data shape changes
)
class MyPlugin(AnalysisPlugin):
    pass
```

Examples:

| Plugin version | Schema version | Reason |
|----------------|----------------|--------|
| 1.0.0 → 1.0.1 | 1.0 → 1.0 | Bug fix; no design data shape change |
| 1.0.0 → 1.1.0 | 1.0 → 1.0 | New optional field added — old data still valid |
| 1.0.0 → 2.0.0 | 1.0 → 2.0 | Renamed a required field — old data needs migration |

Old `DesignData` rows keep their original `schema_version`. New rows get the current one. A plugin reading old data should branch on `schema_version` if shapes differ.

## Migration version vs plugin version

Database migration revisions are independent of plugin versions:

```
plugin v1.0.0 — migrations v001
plugin v1.1.0 — migrations v001, v002 (added in 1.1)
plugin v1.1.1 — migrations v001, v002 (no schema change in patch)
plugin v2.0.0 — migrations v001, v002, v003, v004
```

Migration revisions are append-only — don't reset numbering at major bumps.

## Changelog

Every release should update `CHANGELOG.md`:

```markdown
## [1.1.0] - 2026-05-15

### Added
- New `/api/my-plugin/panels/import` route for CSV import
- `tags` column on panels (migration v002)

### Changed
- `useApi` calls now propagate the request ID

### Fixed
- Panel name validation rejected names with diacritics
```

For the format, [Keep a Changelog](https://keepachangelog.com/) is conventional. Pair with `git tag` for the corresponding version.

## Notes

- A marketplace registry advertises one `latest_version` per plugin. Use a private/testing registry if you need to advertise prerelease plugins separately from stable users.
- When in doubt about whether a change is breaking, default to "yes, breaking" — bump major. Users can pin to the older major if needed.
- Yanking a release on PyPI is best-effort — old wheels may be cached locally. Don't rely on yanks for security fixes; ship a new version.

## Related

- [Publishing](/sdk/operations/publishing) — where versions get propagated
- [CI patterns](/sdk/operations/ci-patterns) — automating tag-driven releases
- [Upgrading the SDK](/sdk/operations/upgrading-sdk) — bumping the SDK dependency range
