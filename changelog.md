---
title: Changelog
---

# Changelog

MINT follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The platform and both SDK packages share one `v*` tag stream. Legacy `sdk-v*` tags remain in repository history but are no longer extended.

## Latest releases

→ [GitHub Releases](https://github.com/MorscherLab/MINT/releases) — every released version, with binaries and full notes.

→ [Full CHANGELOG](https://github.com/MorscherLab/MINT/blob/main/CHANGELOG.md) — every change, every version.

## Notable changes in 1.4

Admin and plugin-author actions for the 1.4 minor release (1.4.0 to 1.4.3). Update the platform and both SDK packages together.

| Area | Change | Action |
|---|---|---|
| Plugin SDK | SDK 1.4 replaces the 1.3 author API: a `Metadata` subclass with `@plugin(Meta)`, context namespaces (`context.design`, `context.artifacts`, `context.experiments`, ...), spec classes for jobs and MCP tools. The removed names have no aliases | Run `mint doctor --fix` in each plugin project. Follow [Migrate from 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4). |
| Plugin compatibility | The platform requires `mint-sdk>=1.4.0b1`. At the first 1.4 start, it disables each plugin built for SDK 1.3 | Make and install a 1.4 release of each plugin. Admin → Plugins shows the reason for each disabled plugin. See [Updates](/admin/updates). |
| SDK range (1.4.1) | A plugin declares `mint-sdk>=1.4.0,<2.0`. The SDK has no breaking change within 1.x | `mint init`, `mint doctor --fix` and `mint sdk update --version` write `<2.0`. See [Update both SDK packages](/sdk/operations/migrate-1.3-to-1.4#update-both-sdk-packages). |
| Plugin roles | Plugin roles are removed. Endpoints, jobs, MCP tools and pages declare the access level `use`, `configure` or `admin`. The Member role loses `plugins.configure` | Before the upgrade, give each former plugin administrator a role with `plugins.configure`. See [Plugin roles become access levels](/sdk/operations/migrate-1.3-to-1.4#plugin-roles-become-access-levels). |
| Legacy migrations | The platform no longer runs `get_migrations_package()` / `PluginMigration`. It disables a plugin that still defines them | Declare `Metadata.database` and adopt the history with `LegacyBaseline.from_plugin_history()`. See [Legacy migrations are removed](/sdk/operations/migrate-1.3-to-1.4#legacy-migrations-are-removed). |
| Frontend SDK | Deprecated and merged components are removed (`SearchableSelect`, `IconButton`, `ControlWorkspaceView`, SmartGroup grouping and others). Lab, shell, data and runtime parts import from subpaths | `mint doctor` reports each use. See [Frontend changes](/sdk/operations/migrate-1.3-to-1.4#frontend-changes). |
| `mint` CLI | The top-level `mint auth`, `mint plugin`, `mint update`, `mint status` and the other server aliases are removed | Use `mint platform ...`. The platform daemon is `mint-platform daemon`. See [CLI](/admin/cli). |
| Docker | The image starts with `mint-platform serve`. A 1.3 container cannot update itself to 1.4 | Back up the database, pin the image to `ghcr.io/morscherlab/mint:1.4`, then `docker compose pull && docker compose up -d`. See [Docker install](/admin/install-docker). |
| Local daemon | The 1.4 `mint-platform daemon` does not find a supervisor that 1.3 started | Stop the 1.3 daemon before the upgrade. Run `mint-platform daemon install-service` again for a systemd unit. See [Updates](/admin/updates). |
| Marketplace | Install requests and the marketplace auto-updater are removed. Only an administrator installs from the UI | Use the scheduled updates (`updates.autoApply*`). See [Plugin management](/admin/plugins). |
| Environment | The `MLD_` aliases are removed, except the JWT-secret ones | Use the `MINT_` names. See [Configuration](/admin/configuration). |
| Push notifications | The MINT iOS app can receive push notifications through the `apns` channel | Configure Apple Push in Admin → Platform → Configuration. See [Notifications and iOS push](/guide/notifications). |
| Instruments | The platform keeps an instrument status history, with retention and CSV export | Optional: set `instruments.historyRetentionDays`. See [Instruments](/guide/instruments). |
| Concurrent edits | Experiments and projects have a `version`. An edit form with unsaved changes shows a banner when another user saved first | None. `If-Match` stays optional for API clients. |
| MCP | Destructive tool calls ask for a confirmation. Plugin tools declare `effect` | Plugin authors: see [MCP tools](/sdk/recipes/mcp-tools). |
| Realtime events | An event stream with presence and plugin events (`realtimeEnabled`, default off) | Optional. See [Configuration](/admin/configuration). |
| Onboarding | Tours and a "Getting started" checklist. 1.4.3 adds a close button to the checklist chip | None. |
| PWA and push relay (1.4.2) | An installed PWA does not scroll or zoom the page frame. A relay URL without a path gets `/v1/push` | None. |

## Notable changes in 1.3

Admin and plugin-author actions for the 1.3 minor release. Update the platform and both SDK packages together.

| Area | Change | Action |
|---|---|---|
| Python | The platform, the Docker image (`python:3.14-slim`) and `mint-sdk` require Python 3.14; plugin installs are wheel-only | Plugins need `requires-python >=3.14` and `cp314` wheels for compiled dependencies. See [Migrate from 1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3#python-3-14-and-dependency-floors). |
| Upgrade path | 1.3 no longer runs the integer (v001–v031) migrations and refuses to start on a database that 1.2.x (≥ 1.2.2) has not adopted into Alembic | Upgrade 1.1 → 1.2.x (≥ 1.2.2) → 1.3. Do not downgrade to ≤ 1.2.1; restore a backup instead. See [Updates](/admin/updates). |
| Scheduled updates | The platform can stage platform and plugin updates daily and restart once | Run under a restart supervisor (`mint platform daemon` or `MINT_RESTART_SUPERVISED=1`; the Docker Compose file sets it). See [Updates](/admin/updates). |
| Plugin dependencies | In-process plugin dependencies are hash-locked; plugins that no longer resolve after an upgrade are disabled with a reason | Check the admin plugin list after upgrading. See [Plugin management](/admin/plugins). |
| Access tokens and MCP | Personal access tokens and an MCP endpoint at `/mcp` for AI tools | Set `server.externalUrl` correctly; `/mcp` accepts only its host. See [AI Assistants and API Access](/guide/ai-and-api). Plugins can publish MCP tools: [MCP tools](/sdk/recipes/mcp-tools). |
| Instruments | A shared instrument directory with `instruments.view` / `instruments.edit` permissions | Review custom roles. See [Instruments](/guide/instruments). |
| Sessions | Changing a password signs out every other session | None. |
| Second factor | Sign-in asks for a passkey after the password or edu-ID step on HTTPS sites (`auth.requireSecondFactor`, default on) | Move password-based scripts to personal access tokens. See [Authentication](/admin/authentication#second-factor). |
| `mint` CLI sign-in | `mint auth login` uses a device code; `--username` is removed | Scripts and CI use `MINT_TOKEN` or `mint auth login --token`. See [CLI reference](/sdk/api/cli-reference). |
| Plugin requests | With auth enabled, every plugin request needs a Bearer credential (401 `auth.required` otherwise); plugins cannot declare public paths | Plugin frontends call through the SDK client; device integrations move to service tokens. See [Plugin routes need a credential](/sdk/operations/migrate-1.2-to-1.3#plugin-routes-need-a-credential). |
| Instrument live status | Plugins report instrument state with service tokens; `/instruments` shows live status and alerts | Issue service tokens and grant instrument status in the plugin's access settings. See [Instrument status](/sdk/recipes/instrument-status) and [Instruments](/guide/instruments). |
| Plugin display names | The platform shows a plugin's declared `display_name` instead of its ID | Optional: set `@mint_plugin(display_name=...)`. |
| Python SDK | Package-root exports deprecated in 1.2 and `PluginDataRepository` are removed; the legacy migration protocol is deprecated (removal in 1.4) | Follow [Migrate from 1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3). |
| File picker | Server search, one-request folder trees and background prefetch; the picker sorts newest first. `mint_sdk.filesystem.file_browser_router` serves the same routes from a plugin | A plugin with its own file routes can replace them with `file_browser_router` and add `tree`/`search` to its `createFilePickerAdapter` transport; the mounts response is `{ mounts: [...] }`. See [Platform integration](/sdk/frontend/platform-integration#adapter-driven-filepicker). |
| Frontend peers and charts | Peers require vue `^3.5.43`, pinia `^4.0.3`, vue-router `^5.3.1`, tailwindcss `^4.3.3`; charts run on Plotly 4 | See [Frontend changes](/sdk/operations/migrate-1.2-to-1.3#frontend-changes). |
| Deprecations | `mint_sdk.lcms`, the biology data templates, SmartGroup sample grouping and `DoseDesignWorkspaceView` are removed in 1.4 | `mint doctor` warns on each use. See [Deprecated in 1.3](/sdk/operations/migrate-1.2-to-1.3#deprecated-in-1-3). |
| Frontend SDK | `PlateMapEditor`, `RackEditor`, `FileBrowserModal`, `ColorSlider`, `AppPluginSwitcher`, `DropdownButton`, `InstrumentAlertLog`, `InstrumentStatusCard`, `LcmsSequenceTable` and several composables are removed; `PlateEditor` replaces the plate editors | Follow [Migrate from 1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3); run `mint doctor`. |

## Notable changes in 1.2

Plugin-author and admin actions per patch release. Guides elsewhere on this site describe current behavior only; the full notes are in the changelogs linked above.

### 1.2.7 – 1.2.10

| Release | Change | Plugin author action |
|---|---|---|
| 1.2.7 | Frontend SDK bundles `axios` 1.20.0 (fixes four GHSA advisories); toasts start below a mounted `AppTopBar`; `mint doctor` no longer suggests the removed `AppSidebar variant="analysis"` | Update both SDK packages together. Replace any leftover `variant` with `AppSidebar :floating="false" collapsible` (add `width="20rem"` for the former analysis width). Admins: self-registration can be disabled with `auth.allowRegistration`, and passwords now need at least 8 characters. |
| 1.2.8 | `mint deploy` waits until the restarted platform loads the version recorded in the bundle's `manifest.json` | Do not treat a deploy that times out as successful; the timeout message names the loaded and bundle versions. |
| 1.2.9 | `GET /api/health` returns a per-process `boot_id`; `mint deploy` confirms the restart by it, treats `--timeout` as one budget, and reports failures as `Error: ...` or JSON | Accounts without `platform.configure` cannot restart: deploy reports the plugin as installed but not running. Use `--no-restart` and ask an administrator. See [What deploy confirms](/sdk/operations/deploying#what-deploy-confirms). |
| 1.2.10 | A plugin can declare `analysis_result_writers` to replace another plugin's file artifact; a platform update to the next minor pairs plugins pinned to the current minor with a compatible release | Owners list writer plugin IDs; writers call `update_analysis_file_artifact(..., plugin_id=owner)`. Admins confirm the paired plugin list before the update downloads. |

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
