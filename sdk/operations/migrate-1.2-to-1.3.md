# Migrate from MINT 1.2 to 1.3

This guide moves a plugin from MINT 1.2 to 1.3. MINT 1.3 removes the Python and frontend APIs that 1.2 deprecated, so a plugin that still uses them fails to import or build until it is updated. Administrators upgrading the platform should follow [Updates](/admin/updates) first.

## Before upgrading

1. Upgrade the platform through 1.2 first. The supported path is 1.1 → 1.2.x (1.2.2 or later) → 1.3; MINT 1.3 refuses to start on a database that 1.2.2 or later has not adopted. See [Updates](/admin/updates).
2. Stop writes and take a verified PostgreSQL backup plus a copy of `server.dataPath`.
3. While the project still uses SDK 1.2, run `uv run mint doctor --explain`. The 1.2 doctor names every deprecated Python export listed below; the 1.3 doctor no longer does, because those names are gone.
4. Install Python 3.14 locally and in CI. `mint-sdk` 1.3 and the platform require it.
5. Update the Python and frontend SDK packages together to the same 1.3 release.

## What changes for plugin code

| Surface | Action for 1.3 | Section |
|---|---|---|
| SDK requirement | Move `mint-sdk` and `requires_mint` to `>=@MINT_VERSION@,<1.4` | [Update both SDK packages](#update-both-sdk-packages) |
| Python and dependencies | Require Python 3.14; drop caps below the SDK's dependency floors | [Python 3.14 and dependency floors](#python-3-14-and-dependency-floors) |
| Plugin routes | Send a Bearer credential on every request; replace custom device keys with service tokens | [Plugin routes need a credential](#plugin-routes-need-a-credential) |
| Python imports | Replace the 29 package-root exports removed in 1.3 | [Removed Python exports](#removed-python-exports) |
| Platform data | Replace `PluginDataRepository` with `ExperimentRepository` | [`PluginDataRepository` is removed](#plugindatarepository-is-removed) |
| Settings schema | Write access rules as `access: {...}`; echo secret references | [Settings access and secrets](#settings-access-and-secrets) |
| Plugin tables | Move legacy integer migrations to `MigrationSpec` before 1.4 | [Legacy migrations are deprecated](#legacy-migrations-are-deprecated) |
| Frontend | Replace removed components and composables; upgrade to the new peer ranges and Plotly 4 | [Frontend changes](#frontend-changes) |
| Deprecated APIs | Plan replacements for APIs removed in 1.4 | [Deprecated in 1.3](#deprecated-in-1-3) |
| AI clients | Optional: publish MCP tools | [MCP tools](/sdk/recipes/mcp-tools) |

## Update both SDK packages

```bash
uv tool install --force 'mint-sdk[cli]==@MINT_VERSION@'
mint sdk update . --version @MINT_VERSION@ --dry-run
mint sdk update . --version @MINT_VERSION@
```

With `--version` on a newer minor, `mint sdk update` rewrites every `mint-sdk` requirement in `[project].dependencies`, `[project.optional-dependencies]` and `[dependency-groups]` to `>=@MINT_VERSION@,<1.4`, and widens a `[tool.mint].requires_mint` that excludes the target to the same range. It updates `@morscherlab/mint-sdk` in `frontend/package.json` to the same release. `--scope minor` without `--version` still stops at a `<1.3` cap. Details: [Upgrading the SDK](/sdk/operations/upgrading).

The platform enforces the range. It refuses a plugin wheel whose `mint-sdk` requirement excludes the platform's SDK, both at install and when it restores plugins at startup:

```text
Plugin requires mint-sdk<1.3, platform has 1.3.0.
```

A plugin that still declares `<1.3` therefore stops loading after the platform upgrade. Build and test the 1.3 release of each plugin before the platform upgrade and install it right after.

## Python 3.14 and dependency floors

`mint-sdk` 1.3 requires Python 3.14. A plugin whose `requires-python` admits 3.12 or 3.13 keeps resolving to `mint-sdk` 1.2.x. `mint sdk update --version @MINT_VERSION@` raises `[project].requires-python` to `>=3.14` and refuses when the result would exclude 3.14 (for example `<3.14` or `==3.12.*`). `mint doctor` reports an error for a `mint-sdk>=1.3` plugin whose `requires-python` admits older Python.

Also change:

- Set ruff `target-version = "py314"` and ignore `UP037`. Unquoting a `TYPE_CHECKING`-only annotation breaks the SDK's handler introspection on 3.14.
- Install Python 3.14 in CI.
- Platform plugin installs are wheel-only against the running interpreter. Every compiled dependency needs a `cp314` wheel.
- Drop caps below the SDK's floors (FastAPI 0.141.1, Starlette 1.7, pydantic 2.13.5, httpx 0.28.1, uvicorn 0.54, sqlmodel 0.0.47, SQLAlchemy 2.0.54). Better, drop the requirement and let `mint-sdk` own it.
- Do not declare `uvicorn`. The platform installs `mint-sdk[server]` into each subprocess plugin venv, and `mint doctor` reports a declared `uvicorn`.
- Code that uses Starlette directly: `on_startup`/`on_shutdown`, `on_event()`, `add_event_handler()`, `@app.route()`, `@app.websocket_route()`, `@app.exception_handler()` and `@app.middleware()` on a `Starlette` app are removed in Starlette 1.0. Use `lifespan`, `routes`, `exception_handlers` and `middleware`.
- Plugin tables with `datetime` fields: sqlmodel 0.0.45 and later maps `datetime` to timezone-aware UTC columns and rejects naive values. Write aware datetimes, or keep the current columns with `NaiveDatetime` or `Field(sa_type=DateTime(timezone=False))`.
- The `cli` and `dev` extras require `httpx2`, which Starlette's `TestClient` uses. `mint-sdk[cli,server]` in the dev group installs it.

## Removed Python exports

These names, deprecated in 1.2, no longer import from `mint_sdk`:

| Removed export | Replacement |
|---|---|
| `JOB_EVENT_STREAM_OPENAPI_EXTRA`, `JOB_EVENT_STREAM_RESPONSES` | None |
| `JobClearPayload`, `JobDeletePayload` | None |
| `JobEventPayload` | `JobStatePayload` / `JobSnapshotPayload` |
| `JobId` | The `str \| int` union |
| `JobProgressPayload` | `JobStatePayload.progress` |
| `LcmsSequenceParams` | None |
| `PluginDatabaseState` | None |
| `PluginRuntimeContext` | `CurrentPluginRuntime` |
| `ResolvedSettings` | `SettingsResolver` |
| `SettingsCommitState` | `SettingsTransactionStage` |
| `SettingsFieldState` | None |
| `SettingsProvider` | `InMemorySettingsProvider` |
| `SettingsStore` | `JsonSettingsStore` / `MemorySettingsStore` |
| `combine_lcms_sequence_csvs` | `parse_lcms_sequence_csv()` per file, then `lcms_sequence_items_to_csv()` |
| `current_job_visibility` | `CurrentJobVisibility` |
| `current_manageable_job` | `CurrentManageableJob` |
| `current_plugin_runtime` | `CurrentPluginRuntime` |
| `current_readable_job` | `CurrentReadableJob` |
| `get_plugin_logger` | Standard library `logging.getLogger()` |
| `get_user_permissions` | `has_any_permission()` / `has_all_permissions()` |
| `infer_lcms_plate_type_from_positions`, `insert_lcms_item_at_intervals`, `lcms_well_id_from_position` | None |
| `is_admin_role` | `is_admin_user()` |
| `plugin_requires_shared_database` | `plugin_has_shared_database_contract()` |
| `register_plugin_exception_handlers` | `create_standalone_app()` (registers the handlers) |
| `reorder_lcms_sequence_numbers` | `number_lcms_sequence_items()` |

Every replacement imports from `mint_sdk`. `PluginRuntimeContext` and the `current_*` dependencies remain importable from `mint_sdk.runtime_dependencies`; prefer the replacements above.

These names are removed from their modules too: the `mint_sdk.logging` module (`get_plugin_logger`), `register_plugin_exception_handlers` and its handler wrappers in `mint_sdk.app` (or call `mint_sdk.api_errors.register_api_error_handlers()`), `JobClearPayload` / `JobDeletePayload` in `mint_sdk.jobs`, and `LcmsSequenceParams`, `insert_lcms_item_at_intervals` and `combine_lcms_sequence_csvs` in `mint_sdk.lcms`. The rest of `mint_sdk.lcms` is [deprecated](#deprecated-in-1-3).

## Plugin routes need a credential

With authentication enabled, the platform requires a Bearer credential on every plugin request, through the proxy and on in-process routes alike: a session JWT, a personal access token or a service token. It answers before the plugin sees the request:

| Request | Response |
|---|---|
| No credential, or one that does not resolve | 401 `auth.required` |
| Write with a read-only personal access token | 403 `auth.read_only_token` |
| Platform cannot reach the database to check the credential | 503 `auth.unavailable` |

The session cookie is not read, and a plugin cannot declare public paths. Dev mode is unchanged. Details: [Platform authentication gate](/sdk/recipes/route-permissions#platform-authentication-gate).

- Call plugin routes from the frontend through the SDK client, which sends the Bearer. A raw `fetch` or a plain link to a plugin route gets 401.
- Give scripts a personal access token (`MINT_TOKEN`).
- A plugin that authenticated daemons or devices with its own API key must switch to platform service tokens. See [Instrument status](/sdk/recipes/instrument-status).

## `PluginDataRepository` is removed

`PluginDataRepository` and `PlatformContext.get_plugin_data_repository()` are gone. `mint doctor` points at the replacement.

| MINT 1.2 compatibility name | MINT 1.3 |
|---|---|
| `PluginDataRepository` | `ExperimentRepository` |
| `context.get_plugin_data_repository()` | `context.get_experiment_repository()` |
| `repo.save_experiment_data(...)` | `repo.save_design_data(...)` |
| `repo.get_experiment_data(...)` | `repo.get_design_data(...)` |
| `repo.delete_experiment_data(...)` | `repo.delete_design_data(...)` |

```python
repo = context.get_experiment_repository()
await repo.save_design_data(experiment_id, plugin_id, design)
```

See [PlatformContext](/sdk/concepts/platform-context).

## Settings access and secrets

Settings form schemas write access rules as one nested `access` policy. `validate_settings_form_schema()` rejects the flat `visibleFor`, `requiresAdmin`, `permissions` and `anyPermissions` keys on settings groups and fields, so a custom `get_settings_form_schema()` must change:

```python
# MINT 1.2
{"id": "advanced", "label": "Advanced", "requiresAdmin": True, "fields": [...]}

# MINT 1.3
{"id": "advanced", "label": "Advanced", "access": {"requiresAdmin": True}, "fields": [...]}
```

`config_model_to_form_fields()`, `config_model_to_settings_schema()` and `apply_settings_form_admin_policy()` already emit `access`. The `visible_for=` / `requires_admin=` keyword arguments and `json_schema_extra` keys are still accepted as input; an explicit `access` value wins per key.

In the frontend SDK, the flat fields on `AccessControlled`, `SettingsGroup`, `SettingsTab`, `FormFieldSchema`, `ControlSectionConfig` and `ControlDefinition` no longer gate anything. `normalizeAccessPolicy()` is removed, and `canAccessByPolicy(user, policy)` takes an `AccessPolicy` such as `{ requiresAdmin: true }` instead of an access-controlled item.

The legacy null-placeholder settings payload is removed. A `null` at a secret position in a full settings save now clears the stored secret. To keep a secret, send back its `{"$secret": "<id>"}` reference.

## Legacy migrations are deprecated

The legacy protocol (`get_migrations_package()`, `PluginMigration`, `MigrationOps`, `MigrationRunner`) still runs in 1.3 and will be removed in MINT 1.4:

- Building a `MigrationRunner` emits a `DeprecationWarning` and logs a warning naming the plugin.
- `mint doctor` reports a warning, so `mint doctor --strict`, as the scaffolded CI runs it, fails until the plugin moves to `MigrationSpec`.
- A plugin whose legacy migration fails is disabled and never reaches `initialize()`, as a failed Alembic upgrade already was.
- The admin plugin list's `schema_version` is deprecated and `null` for Alembic plugins. Read `schema_revision`.

Move to Alembic with a baseline that adopts the existing legacy history:

```python
from mint_sdk import AnalysisPlugin, LegacyBaseline, MigrationSpec
from .models import Panel


class MyPlugin(AnalysisPlugin):
    def get_migration_spec(self) -> MigrationSpec:
        return MigrationSpec(
            package="my_plugin.db_revisions",
            models=(Panel,),
            legacy=LegacyBaseline.from_plugin_history(
                "p001", plugin_name="my-plugin", last_version=3
            ),
        )
```

Remove `get_migrations_package()` in the same change. `plugin_name` is the plugin's `metadata.name`, under which the legacy runner recorded its history. `from_plugin_history()` accepts a legacy history of exactly v1..`last_version`, runs the baseline on a fresh install and refuses an incomplete or failed history. The baseline revision must describe the schema that v`last_version` produced. Mechanics, validation and tests: [Plugin tables and migrations](/sdk/concepts/migrations#adopting-existing-tables) and the [Migrations reference](/sdk/api/migrations#migrationspec-and-legacybaseline).

## Frontend changes

### Removed components and composables

| Removed | Use instead |
|---|---|
| `PlateMapEditor`, `RackEditor` | [`PlateEditor`](/sdk/components/plate-editor) |
| `FileBrowserModal` | [`FilePicker`](/sdk/components/file-picker) with `usePlatformFilePickerAdapter()` |
| `AppPluginSwitcher`, `PluginSwitcherPlugin`, `PluginSwitcherInfo` | [`AppTopBar`](/sdk/components/app-top-bar) static plugin identity (`PluginInfo`) |
| `ColorSlider` | [`BaseSlider`](/sdk/components/base-slider) with `colorStops`, `thresholds`, `showLabels`, `minLabel`, `maxLabel` |
| `DropdownButton` | [`BaseSelect`](/sdk/components/base-select) / [`SearchableSelect`](/sdk/components/searchable-select) for values, [`ActionMenu`](/sdk/components/action-menu) for actions |
| `InstrumentAlertLog`, `InstrumentStatusCard`, `LcmsSequenceTable` | None |
| `ProgressBar` `variant="segmented"`, `steps`, `currentStep`, `ProgressVariant` | [`StepWizard`](/sdk/components/step-wizard) for steps; [`ProgressBar`](/sdk/components/progress-bar) `value` / `indeterminate` for percentages |
| `useAsync`, `useOptimisticMutation` | `useRequestSyncState()` |
| `useResourceCrud` | `useGeneratedPluginClient()` |
| `useWellPainting`, `useWellPlateEditor` | `useRackEditor()` with `PlateEditor` |
| `useWellPlateAdapter`, `useWellPlateValidation` | None; keep the adapter or the rules in the plugin |
| `useAuth`, `usePasskey` | `useAuthStore()` for identity and permissions; sign-in, token refresh and passkeys are handled by the platform |
| `useCommandHistory` | None; keep the command stack in the plugin |
| `InstrumentAlertBody` type | None |
| `usePluginConfig` | `usePluginSettings()` |
| SmartGroup `--grp-1` … `--grp-5`, `--grp-qc` | `var(--mint-sample-N)` |

`mint doctor` reports each removed component, composable and prop with its replacement. See [Composables](/sdk/frontend/composables) for the current composable list.

### Migration for plugin authors

| If your plugin… | Do this |
|---|---|
| uses `PlateMapEditor` or `RackEditor` | switch to [`PlateEditor`](/sdk/components/plate-editor); handle its intent events or bind `useRackEditor().plateEditorListeners`. `PlateEditor` takes `Rack[]`: convert plate-map data with `racksFromPlateState(toPlateMapEditorState(t))` |
| handles `PlateEditor` `@assign` itself | set `well.group = groupId` and keep `well.sampleType` (`'sample'` for an empty well); the group is no longer read from `sampleType` |
| uses `FileBrowserModal` | switch to [`FilePicker`](/sdk/components/file-picker) with `usePlatformFilePickerAdapter()`; decode paths with `decodePlatformPickerPath()` |
| passes `pluginSwitcher` to [`AppTopBar`](/sdk/components/app-top-bar) / [`PluginWorkspaceView`](/sdk/components/plugin-workspace-view) or uses `AppPluginSwitcher` | drop the prop, handlers and component; integrated plugins show a static identity |
| uses [`ProgressBar`](/sdk/components/progress-bar) `variant="segmented"`, `steps` or `current-step` | use [`StepWizard`](/sdk/components/step-wizard) for steps; keep `ProgressBar` for `value` / `indeterminate` |
| styles `.mint-action-menu__panel` / `.mint-searchable-select__panel` directly | target the `.mint-popover` hooks; the old classes remain as aliases for one minor |
| relies on anonymous requests reaching its routes (`auth=False` routes, raw `fetch` without a Bearer) | call from the frontend through the SDK client, and give scripts a personal access token; see [Plugin routes need a credential](#plugin-routes-need-a-credential) |
| authenticates daemons or devices with its own API key | switch to platform service tokens: declare `instrument_status_write`, read the caller with `current_service_caller`, write with `report_status`, and drop the key storage and routes; see [Instrument status](/sdk/recipes/instrument-status) |
| depends on pinia 2/3, vue-router 4 or vue below 3.5.43 | upgrade to pinia `^4.0.3`, vue-router `^5.3.1` and vue `^3.5.43` |
| calls `Plotly.newPlot` itself with `mintPlotlyTemplate()` | pass `showSendToCloud: false` in the config |
| imports types from `plotly.js` via `@types/plotly.js`, or declares `declare module 'plotly.js-dist-min'` | import them from `plotly.js-dist-min`, drop `@types/plotly.js` and delete the module shim; it shadows Plotly 4's bundled types |

### Peer dependencies

`@morscherlab/mint-sdk` @MINT_VERSION@ declares these peer ranges:

| Peer | Range |
|---|---|
| `vue` | `^3.5.43` |
| `pinia` | `^4.0.3` |
| `vue-router` (optional) | `^5.3.1` |
| `tailwindcss` | `^4.3.3` |

pinia 2 and 3 and vue-router 4 are no longer accepted. Upgrade them in the plugin frontend before you take the 1.3 SDK. The optional `@simplewebauthn/browser` peer is gone with `usePasskey`; remove it unless the plugin uses it directly.

### Plotly 4

Charts run on Plotly 4 (`plotly.js-dist-min` `^4.1.1`). The SDK no longer bundles Plotly; it loads from the plugin's `node_modules` when a `PlotlyChart` first renders.

- `PlotlyChart` sets `showSendToCloud: false`, because Plotly 4 shows the "Share chart" button again. Pass it yourself when you call `Plotly.newPlot` directly.
- Import Plotly types from `plotly.js-dist-min`, not from `@types/plotly.js`.
- `scattermapbox`, `choroplethmapbox`, `densitymapbox` and the mapbox subplot are removed, so plotly.py `px.*_mapbox` figures no longer render. MathJax v2, `showLink`, `sendData` and every `*src` attribute are removed.
- Colors are parsed with culori. `rgb()` with 0–1 fractions and `hsv()` can render differently. SDK tokens are hex and are not affected.
- Defaults change: overlaying axes use `tickmode: 'sync'`, `splom.axis.matches` is `true`, `geo.fitbounds` is `'locations'`, double-click takes 500 ms, and image downloads use the chart title as the file name.

## Deprecated in 1.3

These APIs still ship in 1.3 and are removed in MINT 1.4. `mint doctor` reports each use as a warning, so `mint doctor --strict` fails on them.

| Deprecated | Replacement |
|---|---|
| `mint_sdk.lcms` (importing it warns once per process) | None |
| `mint_sdk.templates`, the `save_template` / `load_template` / `save_template_collection` / `load_template_collection` / `save_template_preset` plugin methods, `mint add data-template*` | None |
| `BioTemplate*` workspace views, `BioTemplateRenderer`, `useBioTemplate*`, `useTemplateCollection`, `useExperimentSave`, `ReagentList`, `ReagentEditor`, `ExperimentTimeline`, `SampleLegend`, `FitPanel` | None |
| `SmartGroupModal`, `SmartGroupFieldRecipe`, `SmartGroupManual`, `GroupAssigner`, `useGroupAssignment`, `AutoGroupModal`, `useAutoGroup` | [`SampleSelector`](/sdk/components/sample-selector) for sample grouping |
| `DoseDesignWorkspaceView` | `ControlWorkspaceView` with `defineDoseDesignControlModel()` |
| `instrument` helpers and types | Move to the mld-ms plugins |
| `usePluginClient` | `useGeneratedPluginClient()` |
| Legacy migration protocol | `MigrationSpec`; see [Legacy migrations are deprecated](#legacy-migrations-are-deprecated) |

`SampleSelector`, `SequenceProgressBar` and `InstrumentStateBadge` are not deprecated.

## Platform behavior plugins see

- Routes of in-process plugins, including job, generated-manifest and WebSocket routes, enforce `plugins.use` (403 `plugin.permission_denied`) and the role's plugin access (403 `plugin.not_visible`), as the proxy already did for subprocess plugins.
- Every plugin request needs a Bearer credential; see [Plugin routes need a credential](#plugin-routes-need-a-credential).
- The plugin proxy never forwards a personal access token to a plugin; identity headers stand in. Writes with a read-only token are refused with 403 `auth.read_only_token`.
- Where the platform enforces a second factor (`auth.requireSecondFactor`, see [Authentication](/admin/authentication#second-factor)), a password-only session is refused with 401 `auth.second_factor_required` on every route, plugin routes and frontends included. Scripts and CI use a personal access token.
- `mint auth login` signs in with a device code; `mint auth login --username` is removed. Use `--token` to store an existing personal access token.

## Update and verify the plugin

Follow [Regenerate, test and install](/sdk/operations/upgrading#regenerate-test-and-install), then run the plugin against a disposable MINT 1.3 platform and exercise settings, experiment reads and writes, jobs, migrations and every screen that used a removed component.

## Related

- [Upgrading the SDK](/sdk/operations/upgrading)
- [Migrate from 1.1 to 1.2](/sdk/operations/migrate-1.1-to-1.2)
- [Updates](/admin/updates)
- [Python SDK reference](/sdk/api/python)
- [Frontend SDK reference](/sdk/api/frontend)

Release sources: [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md), [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md), [package-root exports](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/__init__.py).
