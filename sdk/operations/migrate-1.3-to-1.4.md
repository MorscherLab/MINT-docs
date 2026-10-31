# Migrate from MINT 1.3 to 1.4

This guide moves a plugin from MINT 1.3 to 1.4. SDK 1.4 renames and removes the 1.3 author API. It keeps no aliases for the removed Python names. A 1.3 plugin does not load on a 1.4 platform until you change it. Administrators must also read [Updates](/admin/updates) before they upgrade the platform.

## Before upgrading

1. Make a 1.4 release of each plugin before the platform upgrade. The platform requires `mint-sdk>=1.4.0b1`. At the first 1.4 start, it disables each plugin whose `mint-sdk` range excludes 1.4.
2. Tell the administrators about plugin roles. See [Plugin roles become access levels](#plugin-roles-become-access-levels).
3. Move each plugin that uses legacy migrations to `Metadata.database`. See [Legacy migrations are removed](#legacy-migrations-are-removed).
4. Stop writes and take a verified PostgreSQL backup and a copy of `server.dataPath`.
5. Update the Python and frontend SDK packages together to the same 1.4 release.

## What changes for plugin code

| Surface | Action for 1.4 | Section |
|---|---|---|
| SDK requirement | Move `mint-sdk` and `requires_mint` to `>=@MINT_VERSION@,<2.0` | [Update both SDK packages](#update-both-sdk-packages) |
| Plugin declaration | Replace `@mint_plugin` and `AnalysisPlugin` with a `Metadata` subclass and `@plugin(Meta)` | [Run the codemod](#run-the-codemod) |
| Platform data | Replace the `get_*_repository()` accessors with the context namespaces | [Context namespaces](#context-namespaces) |
| Permissions | Replace plugin roles with the access levels `use`, `configure` and `admin` | [Plugin roles become access levels](#plugin-roles-become-access-levels) |
| Plugin tables | Replace `get_migrations_package()` and `get_migration_spec()` with `Metadata.database` | [Legacy migrations are removed](#legacy-migrations-are-removed) |
| Jobs, MCP, events, health | Use spec classes and the new decorators | [Run the codemod](#run-the-codemod) |
| Imports | Import names that left the package root from their modules | [Package-root imports](#package-root-imports) |
| CLI | Use `mint platform ...` and `mint -C <dir>` | [CLI changes](#cli-changes) |
| Frontend | Move to the subpath entries, the merged components and the short client names | [Frontend changes](#frontend-changes) |
| Platform behavior | Check experiment writes, `before_save` handlers and settings writes | [Platform behavior plugins see](#platform-behavior-plugins-see) |

## Update both SDK packages

```bash
uv tool install --force 'mint-sdk[cli]==@MINT_VERSION@'
mint sdk update --version @MINT_VERSION@ --dry-run
mint sdk update --version @MINT_VERSION@
```

From 1.4, `mint sdk update --version`, `mint init` and `mint doctor --fix` write the range `>=@MINT_VERSION@,<2.0`. The ceiling is the next major, not the next minor. The SDK has no breaking change within 1.x, so a plugin with this range installs on each later 1.x platform without a new release. `mint doctor` also accepts a ceiling at the next minor (`<1.5`). It refuses a range with no ceiling, a ceiling above the next major, or a ceiling between the two (for example `<1.6`).

`mint sdk update` updates `@morscherlab/mint-sdk` in `frontend/package.json` to the same release. The npm pin stays exact. `mint doctor` checks that the two SDK packages refer to the same release:

```text
SDK version alignment: Python and frontend SDK dependencies refer to different releases
```

The Python range must include the frontend release, and `uv.lock` must resolve that exact release. Run `mint sdk update`, or `mint doctor --fix`, to align them.

`mint sdk update` and `mint doctor --fix` also remove the packages that `mint-sdk` supplies. A `typer`, `uvicorn` or `httpx2` in a dev group becomes `mint-sdk[cli,server]` in that group.

The platform enforces the range at install and at startup:

```text
Plugin requires mint-sdk>=1.3.0,<1.4, platform has 1.4.0. Plugins always run the platform's mint-sdk; install a plugin build compatible with mint-sdk 1.4.0 or upgrade the platform.
```

A plugin process on an older SDK also fails the version handshake. The internal API version is `"2"`, and the platform answers 426 `plugin.api_version_mismatch`. Details: [Upgrading the SDK](/sdk/operations/upgrading).

## Run the codemod

```bash
mint doctor          # sections "SDK 1.4 rewrites" and "SDK 1.4 manual changes"
mint doctor --fix    # writes the rewrites, then checks again
git diff             # review every rewrite
uv run pytest
```

`mint doctor --fix` rewrites the Python sources and tests of the project. It makes only mechanical changes. Code that needs a decision gets a `# TODO(mint 1.4)` comment, and doctor reports each one until you remove it. The main rewrites:

| 1.3 | 1.4 |
|---|---|
| `@mint_plugin(...)`, `AnalysisPlugin` | A `Metadata` subclass, `@plugin(Meta)` and `Plugin` |
| `analysis_type`, `display_name`, `routes_prefix`, `nav_items`, `config` | `domain`, `title`, `prefix`, `pages`, `settings` |
| `analysis_result_readers`, `analysis_result_writers`, `allowed_experiment_types`, `dependencies` | `reads_from`, `writes_to`, `experiment_types`, `depends_on` |
| `plugin_type` and the data-write capabilities | `writes` (`{"experiments", "design", "artifacts"}` or a subset). See [Plugin types](/sdk/concepts/plugin-types) |
| `instrument_status_write`, `serves_instrument_alerts` | `features = {"instrument_status", "instrument_alerts"}` |
| No `requires_auth=True` | `auth = False` (the 1.4 default is `True`) |
| No `config_requires_admin=True` | `settings_access = "configure"` (the 1.4 default is `"admin"`) |
| `schema_version`, `design_schema`, `design_schema_version` | `design = Design(version=..., schema=...)` |
| `@generated_ui(...)` | `ui = "generated"` |
| `PluginNavItem(label=, requires_admin=True, ...)` | `Page(title=, access="admin", ...)` |
| `@job(job_id=, profile=ServiceJob(...), requires_admin=True)` | A `Job` spec class and `@job(Spec)` |
| `@job_finalizer`, `JobFinalizationContext` | `@finalize(Spec)`, `FinalizeContext` |
| `TextResult`, `JsonResult` | Return a `str` or a pydantic model |
| `@mcp_tool(read_only=, destructive=, requires=, requires_admin=)` | A `Tool` spec class with `effect` and `access`, and `@tool(Spec)` |
| `@mcp_prompt`, `@mcp_resource`, `mint_sdk.mcp_tools` | `@prompt`, `@resource`, `mint_sdk.mcp` |
| `call_tool(..., experiments=)`, `ctx.report_progress(...)` | `call_tool(..., platform=)`, `ctx.report(...)` |
| `@health_check`, `PluginHealth`, `HealthStatus` | `@health`, `Health` |
| `@on_event(name)`, `@on_config_change(fields=)`, `ConfigChange` | `@on(name)`, `@on("settings", fields=)`, `SettingsChange` |
| `LifecycleHookResult` in `experiment.before_save` | Return `None` to allow; raise `EventVetoException` to refuse |
| `self.load_design`, `self.save_design`, `self.delete_design` | `self.design.get`, `self.design.save`, `self.design.delete` |
| `self.save_analysis*`, `self.load_analysis*` | `self.artifacts.save`, `.get`, `.list`, `.archive`, `.restore` |
| `self.save_analysis_file_artifact`, `self.load_analysis_file_artifact` | `self.artifacts.save(exp, path, key, replace=False)`, `self.artifacts.download` |
| `create_standalone_app(plugin)` | `mint_sdk.app.create_app(plugin)` |
| `PluginTestHarness`, `CompletedPluginJob`, `PluginJobTestError` | `Harness`, `Run`, `JobFailedException` (`mint_sdk.testing`) |
| `PluginActor`, `CurrentPluginActor`, `ManagedFileResult` | `Actor`, `CurrentActor`, `FileResult` |
| `DataObjectRef`, `ExperimentDataStore`, `LocalExperimentDataStore` | `ObjectRef`, `ObjectStore`, `LocalObjectStore` |
| `get_routers()`, `PluginRouterMount` | `routers()`, `RouterMount` |
| `self.metadata.name`, `self.plugin_id` | `self.name` |
| `save_settings_transactionally`, `patch_settings_transactionally` | `self.update_settings(...)` |
| `self.emit_event(name, payload)` | `self.context.publish(name, payload)` |
| `mint_sdk.config`, `mint_sdk.instrument` | `mint_sdk.settings`, `mint_sdk.instruments` |

`artifacts.save` replaces an artifact by default. Pass `replace=False` where 1.3 created one. A file artifact needs an explicit key, and `artifacts.save` uploads only a `pathlib.Path`. `artifacts.download` returns the destination `Path` and raises `NotFoundException` when the artifact does not exist.

An `@endpoint` without `operation_id` gets the method name in lowerCamel case (`get_layout` becomes `getLayout`). Run `mint sdk generate` and update the callers, or set the 1.3 `operation_id`.

Full rules and examples: [Python SDK reference](/sdk/api/python) and [Plugin lifecycle](/sdk/concepts/lifecycle).

## Context namespaces

The `get_*` accessors of the context become namespaces. The method names change too, so the codemod does not rewrite these calls. `mint doctor` reports each one.

| 1.3 | 1.4 |
|---|---|
| `get_experiment_repository()`: `get_by_id`, `list_all` | `context.experiments`: `get`, `list(type=, parent=)` |
| `save_design_data`, `get_design_data`, `delete_design_data` | `context.design.save(exp, data, version=)`, `.get`, `.delete` |
| `save_analysis_result`, `get_analysis_result(s)`, `list_analysis_artifacts` | `context.artifacts.save`, `.get`, `.list` |
| `get_user_repository()` | `context.users`: `get(id)`, `get(username=)`, `list()` |
| `get_instrument_repository()`: `list_all`, `report_status` | `context.instruments`: `list(active=)`, `report(status, alerts=)` |
| `get_data_store(exp, plugin_id=)` | `context.objects(exp, plugin=)` |
| Store `put_bytes`, `put_file`, `put_fileobj` | `put(key, source, media_type=)` |
| Store `get_bytes`, `iter_bytes`, `download_file` | `get`, `stream`, `download` |
| `get_file_browser()`, `get_shared_db_session()`, `get_plugin_db_session()` | `context.files`, `context.db()` |
| `get_allowed_experiment_types()` | `context.experiment_types` |
| `get_plugin_config()`, `set_plugin_config()` | `self.settings`, `self.update_settings(changes)` |
| `resolve_plugin_actor(request)` and the other caller helpers | An `actor: CurrentActor` handler parameter |
| `resolve_service_caller(request)` | A `caller: CurrentServiceCaller` handler parameter |
| `resolve_job_visibility(request)` | A `CurrentJobVisibility` handler parameter |
| `enqueue_notifications()`, `publish_calendar_events()` | `@notify` and `@calendar_event` (`mint_sdk.integrations`) |

`initialize()` takes no arguments. `self.context` is never `None`. Without the platform, it is a `StandaloneContext`, and a platform-only call raises `UnavailableException`. Replace `context is None` with `self.is_standalone`.

The SDK no longer calls the settings overrides (`get_settings_form_schema()`, `validate_settings()`, `on_settings_changed()` and the others). The platform derives the form from `Metadata.settings`. Put validation on the settings model, and react to changes with `@on("settings", fields=...)`.

The `/api/internal` analysis result routes are removed. A result is the `default` artifact. The audit log records `analysis.artifact_save` and `analysis.artifact_archive`, not `analysis.result_save`.

A plugin cannot replace the file artifact of another plugin any more. `writes_to` opens only the object store of the named plugin, and only to create objects. `update_analysis_file_artifact(plugin_id=...)` has no replacement.

Details: [PlatformContext](/sdk/concepts/platform-context) and [Writing results](/sdk/recipes/writing-results).

## Plugin roles become access levels

SDK 1.4 removes plugin roles. Endpoints, jobs, MCP tools and pages declare an `access` level:

| Level | Who meets it |
|---|---|
| `"use"` | A role with `plugins.use` that can see the plugin |
| `"configure"` | `"use"`, plus `plugins.configure` |
| `"admin"` | A platform administrator |

| 1.3 | 1.4 |
|---|---|
| `@requires_permissions("plugins.configure")`, `@requires_plugin_admin` | `access="configure"` on the `@endpoint` |
| `context.require_plugin_role("admin")` | `access="configure"` on the `@endpoint` or `Job` |
| `actor.is_plugin_admin`, `actor.plugin_role` | `actor.can("configure")` |
| `@mcp_tool(requires_admin=True)` | `Tool.access = "admin"` |
| `get_plugin_role_repository()`, `UserPluginRole`, `PluginRoleRepository` | Removed |
| `RecordingContext(plugin_roles=...)` | Removed. Give the `Actor` a role and permissions |
| `mint platform admin plugin-role ...`, `/api/admin/plugin-roles*` | Removed |

An endpoint with `auth=False` takes only `access="use"`.

The upgrade drops the `user_plugin_roles` table. It also removes `plugins.configure` from the Member system role. Before the upgrade, the administrators must give each former plugin administrator a custom role with `plugins.configure`. Otherwise, these users lose the `access="configure"` endpoints, jobs, MCP tools and settings.

A plugin that did not set `config_requires_admin=True` must set `settings_access = "configure"`. Otherwise, only a platform administrator can change its settings.

Tutorial: [Access levels](/sdk/tutorials/access-levels). Permission list: [Permissions](/reference/permissions).

## Legacy migrations are removed

The platform no longer runs the legacy protocol: `get_migrations_package()`, `PluginMigration`, `MigrationOps`, `MigrationRunner` and `MigrationResult` are removed. At startup, the platform disables an in-process plugin that still defines `get_migrations_package()`. The admin plugin list shows the reason as its `migration_error`. `mint doctor` fails the plugin, and standalone database setup raises `ConfigurationException`.

`get_migration_spec()` and `get_shared_models()` are removed too. Declare one `Metadata.database`, and adopt the legacy history with a baseline:

```python
from mint_sdk import LegacyBaseline, Metadata, MigrationSpec

from .models import Panel


class MyPluginMeta(Metadata):
    domain = "my-domain"
    database = MigrationSpec(
        package="my_plugin.db_revisions",
        models=(Panel,),
        legacy=LegacyBaseline.from_plugin_history(
            "p001", plugin_name="my-plugin", last_version=3
        ),
    )
```

`from_plugin_history()` adopts a legacy history of exactly v1..`last_version`. The baseline revision must describe the schema that v`last_version` made. `plugin_name` is optional. Set it when the legacy runner recorded the history under another name.

| 1.3 | 1.4 |
|---|---|
| `mint db check` | `mint doctor --only db` |
| `mint db revision NAME` | `mint add migration NAME --autogenerate` |
| `mint db ... --target platform` | `mint-platform db current\|check\|revision` in the platform checkout |
| `schema_version` in `GET /api/plugins` | `schema_revision` |

Mechanics: [Plugin tables and migrations](/sdk/concepts/migrations) and the [Migrations reference](/sdk/api/migrations#migrationspec-and-legacybaseline).

## Package-root imports

A plugin imports only the main author names from the `mint_sdk` package root. A plugin that imports another name from the root fails at import, so the platform does not load it. `mint doctor --fix` moves these imports. Examples:

| 1.3 import | 1.4 import |
|---|---|
| `from mint_sdk import MINTClient` | `from mint_sdk.client import MINTClient` |
| `from mint_sdk import RAnalysisBridge` | `from mint_sdk.r import RAnalysisBridge` |
| `from mint_sdk import JobStatus` | `from mint_sdk.protocol import JobStatus` |
| `from mint_sdk import create_standalone_app` | `from mint_sdk.app import create_app` |

The client exceptions changed too: `MINTAPIError` is `APIError`, `AuthenticationError` is `AuthError` and `MINTConnectionError` is `NetworkError`. `MINTPermissionError`, `MINTValidationError`, `RateLimitError` and `ServerError` are removed. See [Platform client](/sdk/api/client).

These modules and names are removed with no replacement: `mint_sdk.lcms`, `mint_sdk.templates`, `mint add data-template*`, the `save_template*` / `load_template*` plugin methods and `InstrumentAlertBody`.

## CLI changes

| 1.3 | 1.4 |
|---|---|
| `mint auth`, `mint plugin`, `mint update`, `mint status`, `mint experiment`, `mint project`, `mint admin`, `mint debug`, `mint instruments` | `mint platform auth`, `mint platform plugin` and so on |
| `mint doctor <dir>`, `mint build <dir>` and the other `[PATH]` arguments | `mint -C <dir> doctor`, `mint -C <dir> build` |
| `mint add ... --path <dir>` | `mint -C <dir> add ...` |
| `mint doctor --deps`, `mint doctor --r` | `mint doctor --only deps`, `mint doctor --only r` |
| `mint platform daemon ...` | `mint-platform daemon ...` (platform package) |
| `scripts/dev-link.sh`, `scripts/dev-unlink.sh` | `mint sdk link`, `mint sdk unlink` |

`mint daemon` serves a plugin, not the platform. A plugin process runs from `mint_sdk.app:create_app`. Change a Dockerfile or process unit that names `mint_sdk.runtime:create_plugin_app`:

```dockerfile
CMD ["uv", "run", "mint", "daemon", "--app", "mint_sdk.app:create_app"]
```

Stored CLI credentials stay valid. Full table: [CLI reference](/sdk/api/cli-reference).

## Frontend changes

The codemod does not change the frontend. `mint doctor` reports each removed component, prop, composable and import with its replacement. `mint docs deprecated-apis` lists them all.

### Generated client

Run `mint sdk generate`. The generated client uses short names:

| 1.3 | 1.4 |
|---|---|
| `useGeneratedPluginClient()`, `pluginClient` | `useClient()` |
| `useGeneratedPluginSettings()` | `useSettings()` |
| `usePluginJobs().forDefinition(name)` | `useJobs(name, options)` |
| Job methods `refreshJobs`, `getJob`, `waitForJob`, `loadResult`, `cancelJob`, `deleteJob`, `clearFinishedJobs` | `refresh`, `get`, `wait`, `result`, `cancel`, `delete`, `clear` |
| `initialize()`, `ready()` | Removed |
| `pollInterval` | `poll` |

### Subpath entries

`@morscherlab/mint-sdk/components` and `@morscherlab/mint-sdk/composables` are removed. The lab, shell, data and runtime components import from their subpath. A root import of a subpath component fails.

| Entry | Contents (examples) |
|---|---|
| `@morscherlab/mint-sdk/lab` | `WellPlate`, `PlateEditor`, `SampleSelector`, `PlotlyChart`, `ChartContainer`, the `time`, `dose` and `formula` helpers |
| `@morscherlab/mint-sdk/shell` | `AppTopBar`, `AppSidebar`, `AppLayout` |
| `@morscherlab/mint-sdk/data` | `ExperimentSelectorModal`, `ArtifactSaveDialog`, `FilePicker`, `useArtifacts`, `pluginSecret` |
| `@morscherlab/mint-sdk/runtime` | `GeneratedPluginView`, `useJobsEndpoint` and the runtime helpers |

About 160 composables, helpers and types keep a deprecated root export in 1.4. Import them from their subpath. Entry list: [Frontend SDK](/sdk/frontend/#package-entry-points).

### Removed components

| Removed | Use instead |
|---|---|
| `IconButton` | `BaseButton :icon label` (add `variant="ghost"`) |
| `BaseTextarea` | `BaseInput type="textarea"` |
| `UnitInput` | `NumberInput :units v-model:unit` |
| `SearchableSelect`, `MultiSelect` | `BaseSelect searchable`, `BaseSelect multiple` (`max`) |
| `BaseToggle` | `BaseCheckbox type="switch"` |
| `StatusIndicator` | `BasePill tone dot` |
| `TimePicker`, `DateTimePicker` | `DatePicker type="time"`, `DatePicker type="datetime"` |
| `ControlWorkspaceView` | `PluginWorkspaceView` with `spec.sidebar.controls` |
| `FormActions` | `defineControlModel({ actions })` |
| `SmartGroupModal`, `SmartGroupFieldRecipe`, `SmartGroupManual`, `GroupAssigner`, `AutoGroupModal`, `useGroupAssignment`, `useAutoGroup` | [`SampleSelector`](/sdk/components/sample-selector) |
| `DoseDesignWorkspaceView` | `PluginWorkspaceView` with `spec.sidebar.controls` |
| `BioTemplateRenderer`, the `BioTemplate*` workspace views, `useBioTemplate*`, `useTemplateCollection` | None |
| `ReagentList`, `ReagentEditor`, `ExperimentTimeline`, `SampleLegend`, `FitPanel` | None |
| `useExperimentSave` | None. Call a plugin endpoint through `useClient()`; the backend calls `context.design.save()` |
| `usePluginClient` | `useClient()` |
| `AppAvatarMenu`, `MobileSupportGate`, `useMobileSupportGate`, `ExperimentDataViewer`, `usePresenceHeartbeat`, `useRuntimeAlignment` | None. These parts moved to the platform. Use the `AppTopBar` `#account` slot |
| The frontend instrument helpers (`sequenceProgressPercent`, `estimateSequenceFinishDate` and the others) and the LC-MS helpers | None |

The pages of the removed components stay in the [1.3.0 documentation](https://mint-docs.morscherlab.org/v1.3.0/sdk/components/).

### Renamed composables

| 1.3 | 1.4 |
|---|---|
| `usePlatformContext()` | `usePlatform()` (`integrated`, `isAdmin`, `can(access)`) |
| `useCurrentExperiment()` | `useExperiment()` (read-only) |
| `useRequestSyncState()` | `useRequest()` (`loading` is `isLoading`) |
| `useAnalysisArtifacts()` | `useArtifacts()` (`/data`) |
| `useGeneratedAnalysis()` | `useJobsEndpoint()` (`/runtime`) |
| `useTimeUtils()`, `useDoseCalculator()`, `useChemicalFormula()` | `time`, `dose`, `formula` (`/lab`) |
| `createPluginClient`, `buildPluginEndpointUrl`, `uploadPluginEndpoint`, `downloadPluginEndpoint` | `createClient`, `buildEndpointUrl`, `uploadEndpoint`, `downloadEndpoint` |
| `usePluginEventStream`, `usePluginSettings`, `usePluginJobs`, `usePluginJobCenter` | `useEventStream`, `useSettingsEndpoint`, `useJobsEndpoint`, `useJobCenter` |
| `canAccessByPolicy()`, `isAdminUser()` in a plugin page | `usePlatform().can(access)`, `usePlatform().isAdmin` |
| `useToast().show()` | `success`, `error`, `warning`, `info` with an options object |
| `useApi({ typedErrors })` | `useApi()`. It always rejects with `MintApiError` |

`useAuthStore` is now only the read-only session bridge (`token`, `userInfo`, `isAuthenticated` and a few more). `ADMIN_PANEL_PERMISSIONS`, `canAccessAdmin()` and `canAccessPlugin()` are removed from `/permissions`.

### Props and `:spec`

| 1.3 | 1.4 |
|---|---|
| `AlertBox type`, `EmptyState color`, `ProgressBar color`, `ConfirmDialog variant`, `LoadingSpinner variant`, `BasePill variant` | `tone` (`muted` is `neutral`, `danger` is `error`) |
| `error` (boolean) on inputs | `invalid` |
| `v-model` on `BaseModal`, `ConfirmDialog`, `SettingsModal` and the selector modals | `v-model:open` |
| `BaseTabs tabs` | `options` |
| `BaseCheckbox variant` | `layout` |
| `emptyMessage` | `emptyText` |
| `AlertType`, `PillColor`, `SpinnerVariant`, `ConfirmVariant` | `Tone` |
| `RadioOption`, `SegmentedOption`, `MultiSelectOption`, `TabItem` | `SelectOption` |
| `JobsStatusTray` `source`, `loadOnMount` | `:center` from `useJobCenter()` |

The complex components take one `:spec`. Build it in `<script setup>` with `definePluginWorkspaceView`, `defineControlModel` (for `FormBuilder` and `SettingsModal`), `defineDataFrame`, `defineWellPlate` or `definePlateEditor`. A structural option that you set as a bare prop has no effect. On `PluginWorkspaceView`, `currentPillId` and `@pill-select` become `v-model:pill`, and `pageSelector` is removed.

### Experiment selection and styles

- Remove hand-written experiment route sync, for example a `watch` on `experimentIdFromRoute(route.query)`. The platform integration script keeps the experiment and the URL in step. The URL parameter is `experiment_id`.
- The legacy global classes (`.btn-primary`, `.card`, `.input-modern`, `.alert-*` and the others) and the `tailwind.preset` export are removed. `tailwindcss` is not a peer dependency any more.
- The palettes are `default`, `colorblind`, `purple`, `ocean` and `forest`. `viridis` becomes `purple` and `pastel` becomes `default`.

### Peer dependencies

`@morscherlab/mint-sdk` @MINT_VERSION@ declares these peer ranges:

| Peer | Range |
|---|---|
| `vue` | `^3.5.43` |
| `pinia` | `^4.0.3` |
| `vue-router` (optional) | `^5.3.1` |

## Platform behavior plugins see

- Plugin experiment writes follow the REST rules. The platform refuses an unknown status or a transition that it does not allow with `ValidationException`. A type change on a numbered experiment raises `ConflictException`. `None` on a field means "not sent" and does not clear the field.
- An experiment that a plugin creates belongs to the calling user. The plugin does not pass `created_by`.
- An `experiment.before_save` handler that raises blocks the design-data save with 422, also in-process. Another plugin's handler can refuse your save with `EventVetoException`.
- Docker-managed and external HTTP runtimes get lifecycle events at `/__mint/events`. A runtime that declares `experiment.before_save` fails closed: while it does not answer, every design-data save is refused.
- The platform polls a plugin process at `GET /__mint/health`, the result of `@health`. It does not read a hand-written `/health` route. The MCP and job manifests are at `/__mint/mcp/manifest` and `/__mint/jobs/manifest`.
- For a plugin in its own process, `PUT` and `PATCH /api/plugins/{name}/config` send typed settings to the plugin process. A `PUT` needs `If-Match`. When the process does not answer, the write is a 503.
- The `jobs` limits (`MINT_JOBS__*`) now apply to subprocess and Docker plugins too.
- The plugin name `platform` is reserved. A runtime prefix `/`, or a prefix that shares its first `/api` segment with a platform route, is refused.

## Update and verify the plugin

```bash
mint doctor --strict
uv run pytest
bun run test && bun run build       # standard plugins only
mint verify --image ghcr.io/morscherlab/mint:@MINT_VERSION@
```

`mint doctor --strict` passes when no 1.3 form is left. `mint verify` installs the bundle into a disposable 1.4 platform and loads it. Then follow [Regenerate, test and install](/sdk/operations/upgrading#regenerate-test-and-install).

## Related

- [Upgrading the SDK](/sdk/operations/upgrading)
- [Migrate from 1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3)
- [Updates](/admin/updates)
- [Python SDK reference](/sdk/api/python)
- [Frontend SDK reference](/sdk/api/frontend)

Release sources: [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md), [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md), [SDK 1.4 author API decision](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/decisions/2026-10-04-sdk-14-author-api.md).
