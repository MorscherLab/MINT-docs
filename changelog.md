---
title: Changelog
---

# Changelog

MINT follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The platform and both SDK packages share one `v*` tag stream. Legacy `sdk-v*` tags remain in repository history but are no longer extended.

## Latest releases

→ [GitHub Releases](https://github.com/MorscherLab/MINT/releases) — every released version, with binaries and full notes.

→ [Full CHANGELOG](https://github.com/MorscherLab/MINT/blob/main/CHANGELOG.md) — every change, every version.

## Notable changes in 1.2

Plugin-author and admin actions per patch release. Guides elsewhere on this site describe current behavior only; the full notes are in the changelogs linked above.

### 1.2.2 – 1.2.6

Update the platform and both SDK packages together. These patches introduce an
opt-in migration backend and several runtime fixes:

| Release | Change | Plugin author action |
|---|---|---|
| 1.2.2 | Shared Alembic runtime, `MigrationSpec`, `get_migration_spec()`, migration status, and development `mint db` commands | Keep legacy migrations or explicitly adopt Alembic; never declare both migration hooks. Test both fresh install and upgrade. |
| 1.2.3 | Legacy platform adoption accepts `cancelled` and preserves deliberate permission revocations and historical/custom Viewer roles | Use the fixed platform for legacy upgrades; inspect any reported data/history/schema error rather than manually stamping the database. |
| 1.2.4 | Shared file-browser directory caching, concurrent-read deduplication, and refresh; `createFilePickerAdapter` | Use the SDK adapter and refresh path rather than duplicating listing caches. Recheck files added while a picker is open. |
| 1.2.5 | Process workers have up to 30 seconds to exit after SIGKILL | Retest large job completion; this is worker cleanup time, not a new analysis execution limit. |
| 1.2.6 | Failed jobs preserve the original exception; worker tracebacks reach host logs | Inspect the job error and platform log together; keep exception messages free of credentials and sensitive payloads. |

The 1.2.2 frontend additions include workbench chart frames, searchable selectors,
resize controls, per-well styles and canonical `ChemicalFormula`/`AdductText`.
Review the [Component Library](/sdk/components/) when updating a
custom workspace.

### 1.2.1

This patch includes frontend API changes as well as generated-job fixes. Update
both SDK packages together and remove retired component props before building.

| Surface | Change and migration |
|---|---|
| AppSidebar | Flat groups; replace removed `variant` with the single built-in look. Prefer `density` over deprecated `dense`. |
| BaseTabs | Remove `variant`; use SegmentedControl for pill-style options. |
| Workspace sidebar | `sidebarVariant` remains declared for compatibility but has no visual effect. |
| NumberInput | Bounded values use an in-field scrubber; check custom CSS/tests targeting the removed range input. |
| FormField / BasePill | Optional row layout and status dots; no change required for existing calls. |
| Toasts | `push()` accepts title/detail/actions/progress; existing simple helpers remain available. |
| Generated UI | Labels, nullable/empty inputs, literal fields, typed arrays and numeric bounds are preserved; selected files survive job switches. |
| Job validation | Custom Pydantic validation failures produce JSON-serializable 422 responses. |

Recheck sidebar spacing, tab selection, numeric keyboard/pointer input and file
selection in your plugin.

## How MINT versions work

| Stream | Tag pattern | Source of truth |
|--------|-------------|-----------------|
| Platform (backend + bundled frontend) | `v1.2.0`, `v1.2.0-beta.1` | `api/_version.py` |
| Python SDK (`mint-sdk`) | Same `v*` tag | `mint_sdk/_version.py` |
| Frontend SDK (`@morscherlab/mint-sdk`) | Same `v*` tag | `packages/sdk-frontend/package.json` |

- **Major** (`1.x.x`) — breaking changes to the API, plugin contract, or database schema
- **Minor** (`1.5.x`) — new features that don't break existing plugins or data
- **Patch** (`1.5.0` → `1.5.1`) — bug fixes only

Plugin migrations are versioned independently per plugin via `mint_sdk.migrations`. Plugins declare a `get_migrations_package()` and the platform runs pending migrations on startup, advisory-locked.

## Release flow

The default patch flow tags a stable release directly from `main`. Minor, major, and other high-risk releases use an optional beta train on a development branch: each fix gets a new immutable `beta.N` tag, and graduation places the stable tag on the same passing commit as the final beta. The unified tag publishes the platform and both SDK artifacts together. See [`scripts/release.sh`](https://github.com/MorscherLab/MINT/blob/main/scripts/release.sh) for the canonical script.

## Need help upgrading?

If a release breaks something you depend on, please [open an issue](https://github.com/MorscherLab/MINT/issues) — we treat regressions as bugs, including for plugin authors who consume `mint-sdk`.
