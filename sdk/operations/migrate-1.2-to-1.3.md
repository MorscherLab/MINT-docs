# Migrate from MINT 1.2 to 1.3

This guide moves a plugin from MINT 1.2 to 1.3. MINT 1.3 removes the Python and frontend APIs that 1.2 deprecated, so a plugin that still uses them fails to import or build until it is updated. Administrators upgrading the platform should follow [Updates](/admin/updates) first.

## Before upgrading

1. Upgrade the platform through 1.2 first. The supported path is 1.1 → 1.2.x (1.2.2 or later) → 1.3; MINT 1.3 refuses to start on a database that 1.2.2 or later has not adopted. See [Updates](/admin/updates).
2. Stop writes and take a verified PostgreSQL backup plus a copy of `server.dataPath`.
3. While the project still uses SDK 1.2, run `uv run mint doctor --explain`. The 1.2 doctor names every deprecated Python export listed below; the 1.3 doctor no longer does, because those names are gone.
4. Update the Python and frontend SDK packages together to the same 1.3 release.

## What changes for plugin code

| Surface | Action for 1.3 | Section |
|---|---|---|
| SDK requirement | Move `mint-sdk` and `requires_mint` to `>=@MINT_VERSION@,<1.4` | [Update both SDK packages](#update-both-sdk-packages) |
| Python imports | Replace the 29 package-root exports removed in 1.3 | [Removed Python exports](#removed-python-exports) |
| Platform data | Replace `PluginDataRepository` with `ExperimentRepository` | [`PluginDataRepository` is removed](#plugindatarepository-is-removed) |
| Settings schema | Write access rules as `access: {...}`; echo secret references | [Settings access and secrets](#settings-access-and-secrets) |
| Plugin tables | Move legacy integer migrations to `MigrationSpec` before 1.4 | [Legacy migrations are deprecated](#legacy-migrations-are-deprecated) |
| Frontend | Replace removed components and composables; accept the new peer ranges | [Frontend changes](#frontend-changes) |
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

Every replacement imports from `mint_sdk`. `PluginRuntimeContext`, the `current_*` dependencies and the LC-MS helpers remain importable from `mint_sdk.runtime_dependencies` and `mint_sdk.lcms`; prefer the replacements above.

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
| `useWellPainting`, `useWellPlateAdapter`, `useWellPlateValidation`, `useWellPlateEditor` | `useRackEditor()` |
| `useAuth`, `usePasskey` | `useAuthStore()` for identity and permissions; sign-in, token refresh and passkeys are handled by the platform |
| `useCommandHistory` | None |
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

### Peer dependencies

`@morscherlab/mint-sdk` @MINT_VERSION@ declares these peer ranges:

| Peer | Range |
|---|---|
| `vue` | `^3.5.0` |
| `pinia` | `^2.1.0 \|\| ^3.0.0 \|\| ^4.0.0` |
| `vue-router` (optional) | `^4.2.0 \|\| ^5.0.0` |
| `tailwindcss` | `^4.1.0` |

New `mint init` projects pin pinia `^4`, vue-router `^5`, vitest `^5`, vue-tsc `^3` and jsdom `^30`. Existing projects can stay on pinia 2/3 and vue-router 4. The optional `@simplewebauthn/browser` peer is gone with `usePasskey`; remove it unless the plugin uses it directly.

## Platform behavior plugins see

- Routes of in-process plugins, including job, generated-manifest and WebSocket routes, enforce `plugins.use` (403 `plugin.permission_denied`) and the role's plugin access (403 `plugin.not_visible`), as the proxy already did for subprocess plugins.
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
