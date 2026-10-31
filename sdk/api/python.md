# Python SDK reference

This reference targets the released **MINT SDK @MINT_VERSION@**. The SDK requires Python 3.14 or later. The `cli` and `dev` extras include `httpx2`. Uvicorn comes from the `server` extra (`mint-sdk[server]`); a plugin does not declare `uvicorn` itself.

The `mint_sdk` package root exports only the names that a plugin author uses most. Import every other name from its module, for example `from mint_sdk.jobs import JobState`. A name that is not in the root raises `ImportError`. `mint docs python` shows the signatures of the installed SDK.

## Plugin declaration

A plugin has one `Metadata` subclass, one `Plugin` subclass and the `@plugin` decorator that joins them.

```python
from mint_sdk import Metadata, Page, Plugin, plugin


class QcMeta(Metadata):
    domain = "metabolomics"
    title = "Peak QC"
    pages = [Page("Overview", "/")]


@plugin(QcMeta)
class QcPlugin(Plugin):
    ...
```

The identity of the plugin (name, version, description, authors, license) comes from `[project]` in `pyproject.toml`. The plugin name is the key of its `mint.plugins` entry point. An unknown attribute, a wrong type or an unknown value raises `TypeError` when the `Metadata` subclass is defined.

| Symbol | Description |
|--------|-------------|
| `Metadata` | Base class of the declaration. Set class attributes only |
| `plugin(Meta)` | Class decorator. Joins the `Plugin` subclass to its `Metadata` |
| `Plugin` | Base class of every plugin. `Plugin[SettingsModel]` types `self.settings` |
| `Page` | One page of the plugin: `Page(title, path="/", *, icon="", description="", id="", auth=None, access="use", flag=None)` |
| `Design` | `Design(version="1.0", schema=None)`: the design-data schema version and an optional schema |
| `Access` | The literal type `"use" \| "configure" \| "admin"` |

Source: [`mint_sdk/plugin_decorators.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_decorators.py), [`mint_sdk/plugin_base.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_base.py).

### `Metadata` fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `domain` | `str` | required | Plugin category |
| `title` | `str` | `""` | Name that the platform shows (at most 64 characters). An empty value shows the plugin name |
| `subtitle` | `str` | `""` | Short line under the title (at most 64 characters) |
| `pages` | `Sequence[Page]` | `()` | Pages for the home cards, `AppTopBar` and the generated contract. `ui = "generated"` adds one page when the list is empty |
| `writes` | set of `"experiments"`, `"design"`, `"artifacts"` | `{"artifacts"}` | Data that the plugin writes. Decides the plugin type and the write capabilities. See [Plugin types](/sdk/concepts/plugin-types) |
| `settings` | `type[BaseModel] \| None` | `None` | Typed settings model |
| `settings_access` | `"configure" \| "admin"` | `"admin"` | Level that a user needs to change the settings |
| `icon` | `str` | `""` | SVG path data (24x24 viewBox) |
| `color` | `str` | `""` | Optional hex brand color |
| `auth` | `bool` | `True` | Require platform authentication for routes and pages |
| `prefix` | `str \| None` | `"/" + <entry-point key>` | API route prefix. Set it when the key is not one URL path segment |
| `design` | `Design \| None` | `None` | Design-data schema version and optional schema. See [Design schema](#design-schema) |
| `database` | `MigrationSpec \| None` | `None` | Alembic revisions and models of the tables that the plugin owns. See [Migrations](/sdk/api/migrations) |
| `features` | set of `"instrument_status"`, `"instrument_alerts"`, `"realtime"` | `set()` | Optional platform features |
| `ui` | `"generated" \| None` | `None` | Serve the SDK-generated workspace |
| `reads_from` | `frozenset[str]` | `frozenset()` | Plugin IDs whose artifacts this plugin may read |
| `writes_to` | `frozenset[str]` | `frozenset()` | Plugin IDs whose object store this plugin may write to, create-only, with `context.objects(experiment_id, plugin=...)`. It does not replace their artifacts |
| `experiment_types` | `frozenset[str] \| None` | `None` | Experiment types that the plugin supports. Platform policy can narrow the set |
| `depends_on` | `tuple[str, ...]` | `()` | Plugin names that must load first |

`Page.access` hides the page from users below that level. `Page.flag` names a platform feature flag. A page with an `access` above `"use"` needs `auth = True`.

### Design schema

`Metadata.design = Design(version="1.0", schema=...)` makes the platform validate every `design.save` write. The schema is a JSON Schema (draft 2020-12) `dict` or a pydantic model class. The platform checks the in-process, plugin-process and user (REST and MCP) write paths. A failed check raises `ValidationException` with the field paths. A plugin that declares no schema keeps unvalidated writes. `mint_sdk.design_validation` has `validate_design_data`, `ensure_valid_design_data`, `design_schema_from_model` and `FieldError`. The platform shows the schema at `GET /api/plugins/{name}/design-schema`.

### `Plugin` members

| Member | Purpose |
|--------|---------|
| `initialize()` | Optional. Takes no argument. The host attaches `self.context` first |
| `shutdown()` | Optional. Releases resources |
| `context` | The `PlatformContext`. It is never `None`: without the platform it is a `StandaloneContext` |
| `is_standalone` | `True` when no platform runs the plugin |
| `name` | The plugin name (the entry-point key) |
| `metadata` | The resolved wire manifest (`PluginManifest`) |
| `settings`, `settings_revision` | Typed settings and their opaque revision |
| `update_settings(changes, *, replace=False, revision=None)` | Change the settings. See [Settings](#settings) |
| `design`, `artifacts` | Shortcuts to `context.design` and `context.artifacts` |
| `routers()` | Native routers for WebSockets, dynamic nesting or custom route classes. Returns a list of `(router, sub_prefix)` tuples or `RouterMount` objects |

Declare behavior with decorators on plugin methods: `@endpoint` (HTTP), `@job` and `@finalize` (jobs), `@health`, `@on` (events and settings changes), `@notify` and `@calendar_event` (integrations), and `@tool`, `@prompt` and `@resource` (MCP).

## Endpoints and request dependencies

```python
from mint_sdk import CurrentActor, endpoint


class QcPlugin(Plugin):
    @endpoint.post("/run", access="configure")
    async def run(self, body: RunRequest, actor: CurrentActor) -> RunResponse:
        ...
```

`@endpoint.get`, `.post`, `.put`, `.patch` and `.delete` take `path`, `auth=None` (inherit `Metadata.auth`), `access="use"` and FastAPI route options. `operation_id` defaults to the method name in lowerCamel case (`get_layout` becomes `getLayout`). `response_model` defaults to the return annotation. `@endpoint.group(prefix, *, scope=None, auth=None, tags=())` gives an endpoint mixin one prefix; `scope="experiment"` mounts it under `/experiments/{experiment_id}`.

| Annotation | Value |
|------------|-------|
| `CurrentActor` | The `Actor` of the request (the standalone actor without the platform) |
| `CurrentServiceCaller` | The `ServiceCaller` of a platform service token. Answers 401 for another caller |
| `CurrentExperiment` | The visible, compatible experiment of an experiment-scope route |
| `CurrentJobVisibility`, `CurrentReadableJob`, `CurrentManageableJob` | Job dependencies from `mint_sdk.jobs` |

`RouterMount(router, prefix="", auth=None)` from `mint_sdk.endpoint` mounts a native router and can switch authentication off for it. `require_access(access)` from `mint_sdk.runtime_dependencies` builds a dependency for a native route: it refuses an actor below `access` with 403.

### Access levels

Plugin roles do not exist. An endpoint, job, MCP tool or page declares an `access` level:

| Level | Who passes |
|-------|-----------|
| `"use"` | A role with `plugins.use` that can see the plugin. The platform checks this before the request reaches the plugin |
| `"configure"` | A role that also has `plugins.configure` |
| `"admin"` | A platform administrator (the role with the slug `admin`) |

`Actor.can(access)` returns `True` when the actor meets a level. A platform administrator meets every level. `Actor.is_platform_admin` is `True` only for the exact role slug `admin`. An endpoint with `auth=False` accepts only `access="use"`.

`Actor` is a frozen dataclass: `user_id`, `username`, `role`, `role_id`, `permissions`. It has `has_permission(permission)`, `can(access)` and `is_platform_admin`. `Actor.standalone()` returns the single-user actor of standalone mode.

## Context namespaces

`self.context` holds the platform data, one namespace per kind. Without the platform, a platform-only call raises `UnavailableException` (HTTP 503). `objects()` and `db()` use local storage then.

| Namespace | Contents |
|-----------|----------|
| `context.experiments` | `get`, `list`, `create`, `update`, `delete` |
| `context.design` | The design data of this plugin: `get`, `save`, `delete` |
| `context.artifacts` | The artifacts of this plugin: `get`, `list`, `save`, `save_all`, `download`, `archive`, `restore` |
| `context.users` | `get(id)`, `get(username=)`, `list(active=, limit=)` |
| `context.instruments` | `get`, `list(active=)`, `create`, `update`, `report` |
| `context.objects(experiment_id, *, plugin=None)` | The `ObjectStore` of an experiment |
| `context.files` | The read-only `FileBrowser` of the server mounts |
| `context.db()` | An async session on the plugin tables |
| `context.experiment_types` | The experiment types that the plugin may use, or `None` |
| `context.publish(name, payload, *, experiment_id=None)` | Deliver an event. See [Events](#events-health-and-realtime) |

Which writes work depends on `Metadata.writes`, the experiment types, platform policy and the current actor. Reads follow the visibility of the calling user.

```python
experiments = await self.context.experiments.list(status="completed", type="drp", limit=50)
experiment = await self.context.experiments.get(experiment_id)   # None when absent or not visible
created = await self.context.experiments.create("Run 1", "drp", project="Screen A")
await self.context.experiments.update(created.id, status="ongoing")
```

`experiments.list` takes `status`, `type`, `project`, `created_by`, `parent`, `search` and `limit` (default 100; `None` returns all). `create(name, type, *, project, notes, tags, parent)` makes the calling user the creator. The new experiment has no experiment code; it gets the next code at its first status change from `planned`. `update` follows the platform status rules. An unknown status or a transition that is not allowed raises `ValidationException`. A type change on an experiment with a number raises `ConflictException`. A `None` argument means "not sent": it never clears a field. Another plugin's `experiment.before_save` handler can veto a design-data save with `EventVetoException`.

```python
saved = await self.context.design.save(experiment_id, {"samples": []})
saved = await self.context.design.save(experiment_id, data, expected_version=experiment.version)
```

`design.save(experiment_id, data, *, version=None, expected_version=None)` stores one design record for the calling plugin. `version` defaults to `Design.version`. With `expected_version`, the save succeeds only while the experiment is still at that `Experiment.version`; otherwise it raises `VersionConflictException` (HTTP 412). Without it the last write wins.

```python
await self.artifacts.save(experiment_id, {"peaks": rows}, "peaks")                  # replace=True
await self.artifacts.save(experiment_id, report_path, "report", kind="report")      # a Path uploads a file
other = await self.artifacts.get(experiment_id, "summary", plugin="other-plugin")   # needs reads_from
items = await self.artifacts.list(experiment_id, prefix="peak", others=True)
await self.artifacts.download(experiment_id, "report", Path("report.pdf"))
```

`artifacts.save(experiment_id, data, key=None, *, replace=True, expect=None, name=None, kind=None, note=None, filename=None, metadata=None, content_type=None, on_progress=None)` saves a mapping or pydantic model as a JSON artifact (key `"default"` when omitted) or a `Path` as a file artifact. A file artifact needs an explicit key. `replace=False` raises `ConflictException` when the key exists. `expect` is the object key that the caller read; a concurrent replacement of a file artifact raises `ConflictException`. `get(..., model=Model)` validates the payload. `save_all(experiment_id, [ArtifactInput(key, data, name, note)])` saves in input order, all or none. `download(experiment_id, key, dest, *, plugin=None)` returns `dest` and raises `NotFoundException`. `archive` and `restore` return `bool`. `list` returns `ArtifactInfo` records for this plugin; `others=True` adds `reads_from` plugins and `archived=True` adds archived artifacts.

### Data models

| Symbol | Fields |
|--------|--------|
| `Experiment` | `id`, `name`, `experiment_type`, `status`, `created_at`, `updated_at`, `created_by`, `parent_experiment_id`, `project`, `notes`, `tags`, `custom_metadata`, `start_date`, `end_date`, `design_owner_plugin_id`, `version`, `experiment_code` |
| `DesignData` | `id`, `experiment_id`, `plugin_id`, `data`, `schema_version`, `created_at`, `updated_at`, `version` |
| `Artifact` | `id`, `experiment_id`, `plugin_id`, `artifact_key`, `display_name`, `status`, `result`, `created_at`, `updated_at`, `result_keys`, `note`, `archived_at`, `archived_by` |
| `ArtifactInfo` | The same fields as `Artifact`, without `result` |
| `ArtifactInput` | `key`, `data`, `name`, `note` |
| `User` | `id`, `username`, `role`, `is_active`, `created_at`, `updated_at`, `email`, `shortname`, `first_name`, `last_name` |

Source: [`mint_sdk/repositories.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py). All repository methods are async. `Experiment.experiment_code` is `None` until the experiment leaves `planned` or someone assigns a code.

### Object store

`context.objects(experiment_id)` returns an `ObjectStore` (`mint_sdk.data_store`). The key comes first.

| Method | Purpose |
|--------|---------|
| `put(key, source, *, media_type=None, metadata=None, filename=None, on_progress=None)` | Store `bytes`, a `Path` or a file object. A `str` source raises `TypeError`. Returns an `ObjectRef` |
| `get(ref_or_key)` | Read all bytes |
| `stream(ref_or_key)` | Read as an async byte iterator |
| `download(ref_or_key, dest)` | Write to a file and return the path |
| `exists`, `delete`, `list(prefix="")` | Inspect and remove objects |

`mint_sdk.data_store` also has `LocalObjectStore`, `DataTransferProgress`, `TransferProgressCallback` and `validate_object_key`. The platform caps uploads at `MINT_MAX_OBJECT_UPLOAD_MB`.

## Settings

Declare one pydantic model with `Metadata.settings`. Read the typed value from `self.settings` in both modes. The platform derives the settings list and the form from the model, so a plugin does not build a form. A field type that automatic forms do not support (for example `Path`) gives no form. Secret fields travel as `{"$secret": "<id>"}` references.

```python
from pydantic import BaseModel, Field
from mint_sdk import Metadata, Plugin, SettingsChange, on, plugin


class Settings(BaseModel):
    threshold: float = Field(0.05, ge=0, le=1, description="Minimum detection threshold")


class QcMeta(Metadata):
    domain = "metabolomics"
    settings = Settings
    settings_access = "configure"   # default "admin"


@plugin(QcMeta)
class QcPlugin(Plugin[Settings]):
    @on("settings")
    def changed(self, change: SettingsChange[Settings]) -> None:
        self._threshold = change.current.threshold
```

`@on("settings", fields=...)` runs once for startup, a platform update, a reset and a programmatic save. `change.source` tells which. Startup settings and their handler run before `initialize()`. `update_settings(changes, *, replace=False, revision=None)` changes settings from plugin code. A merge (`replace=False`) loads the latest settings and retries a lost compare-and-swap. `replace=True` stores the complete value; in integrated mode it needs `revision=self.settings_revision`, and a newer stored revision raises `SettingsConflictError`. An unknown field raises `ValidationException`. `mint_sdk.settings` has `settings_form_fields` and `settings_schema`.

For a plugin in its own process, `PUT` and `PATCH /api/plugins/{name}/config` send the typed settings to the plugin process. The plugin validates, stores and applies them without a restart. A `PUT` needs `If-Match`.

Resolution order, last wins: model defaults, saved store, explicit `.env`, process environment, startup override. Environment keys are `MINT_PLUGIN_<NORMALIZED_PLUGIN_NAME>__<FIELD>`. Higher-priority values are locked and not saved.

## Events, health and realtime

```python
from mint_sdk import (
    AfterExperimentSave, BeforeExperimentSave, EventVetoException, Health, health, on,
)


class QcPlugin(Plugin):
    @on("experiment.before_save")
    async def validate(self, event: BeforeExperimentSave) -> None:
        if not event.data:
            raise EventVetoException("Design data is required")

    @health(timeout=2.0)
    async def probe(self) -> Health:
        return Health(status="healthy", message="ready")
```

| Event | Payload class | Notes |
|-------|--------------|-------|
| `experiment.before_save` | `BeforeExperimentSave` | Runs in sequence and fails closed. Return `None` to allow; raise `EventVetoException` to refuse (422). Any other exception or return value also stops the save |
| `experiment.after_save` | `AfterExperimentSave` | Observer. A failure is logged and isolated |
| `experiment.status_changed` | `ExperimentStatusChanged` | Observer |
| `experiment.created` | `ExperimentCreated` | After the write commits |
| `experiment.updated` | `ExperimentUpdated` | `changed_fields` lists the changed fields |
| `experiment.deleted` | `ExperimentDeleted` | `experiment_code` and `experiment_type` of the deleted row |
| `<plugin>.<event>` | any JSON value | Custom event from `context.publish` |

A plugin gets only the events that it declares with `@on`. The writing plugin does not receive the events of its own write. The platform sends events to a plugin process, Docker-managed runtime and external HTTP runtime at `/__mint/events`.

`@health` returns `Health(status="healthy" \| "degraded" \| "unhealthy", message=None, details={})`. The SDK serves the result at `GET /__mint/health`: 200 for healthy or degraded, 503 for unhealthy. The platform polls this route. A handler that raises or runs longer than `timeout` (at most 4 seconds) reports unhealthy. A plugin without `@health` reports healthy.

`context.publish(name, payload, *, experiment_id=None)` delivers `"<plugin>.<event>"` to the `@on(name)` handlers of the same plugin. With `"realtime"` in `Metadata.features` and the platform flag `realtimeEnabled` on, the platform also streams the event on `plugin:<plugin>`, or `plugin:<plugin>:experiment:<id>` with `experiment_id`. The payload is JSON of at most 16 KiB (`mint_sdk.protocol.MAX_EVENT_PAYLOAD_BYTES`); a larger payload raises `ValidationException`. `experiment_id` must name an experiment that `experiments.get` returns, or `publish` raises `NotFoundException`. The platform sends a plugin topic to every user who may use the plugin; put experiment data only on the experiment topic. See `examples/realtime-events` in the MINT repository and `useRealtime` in the frontend SDK.

## Jobs

A job spec is a `Job` subclass; the handler is a plugin method with `@job(Spec)`.

```python
from pathlib import Path

from pydantic import BaseModel
from mint_sdk import Job, JobContext, Plugin, TableResult, job


class Inputs(BaseModel):
    source: Path
    threshold: float = 0.05


class Analyze(Job):
    title = "Analyze"
    cpu = 2
    name = lambda inputs: inputs.source.name


class QcPlugin(Plugin):
    @job(Analyze)
    def analyze(self, inputs: Inputs, *, context: JobContext) -> TableResult:
        context.check()
        context.report(20, "Reading input", stage="read")
        return TableResult(columns=["peak", "score"], rows=read_rows(inputs.source))
```

| `Job` option | Default | Meaning |
|--------------|---------|---------|
| `id` | method name in kebab-case | Job definition id |
| `title`, `description` | | Text for the UI |
| `access` | `"use"` | Level needed to submit the job |
| `name`, `folders` | `None` | Callables that take the inputs and return the display name and folder list |
| `cpu` | `1` | CPU slots (sync handler) |
| `parts`, `min_parts`, `max_parts`, `max_bytes` | `None`, 1, 256, 8 GiB | Staged job: multipart inputs |
| `timeout`, `concurrency` | 300.0, 1 | Service job (`async def`) |

The handler decides the mode. An `async def` handler runs as a service job. A `def` handler runs in a worker process, and as a staged job when `parts` is set. An option of the other mode raises `TypeError`. `@job()` takes all defaults and cannot have a finalizer. `@finalize(Spec, *, attempts=3, timeout=30.0)` marks the async method that persists the `ManagedFile` of a `FileResult` in the host process; its context is `FinalizeContext[InputsT, SettingsT]`.

`JobContext` has `job_id`, `actor`, `settings` (the settings snapshot of the submission), `workspace`, `cpu`, `check()` (raises `asyncio.CancelledError` after a cancel), `cancelled`, `report(percent=None, message=None, *, stage=, current_file=, total_files=, current_filename=)`, `warn(message)` and `run_blocking(fn, ...)`. Results: `str`, a pydantic model, `TableResult`, `ImageResult`, `ArtifactResult`, `FileResult` and the other types in `mint_sdk.analysis`. Call a decorated job directly in a test; only an HTTP or generated-client submission enters the scheduler.

The `jobs` limits (`config.json` `jobs`, `MINT_JOBS__*`, `MINT_JOB_*`) apply to in-process, subprocess and Docker plugins. Other job names (`JobState`, `JobManager`, `JobEventStream`, `JobVisibility` and similar) live in `mint_sdk.jobs`.

## MCP declarations

A plugin publishes tools, prompts and resources on the platform `/mcp` endpoint. Import the decorators from `mint_sdk.mcp`; never import the `mcp` package. Usage and naming: [MCP tools](/sdk/recipes/mcp-tools).

```python
from pydantic import BaseModel
from mint_sdk import Plugin
from mint_sdk.mcp import Tool, ToolContext, prompt, resource, tool


class FitCurve(Tool):
    title = "Fit dose-response curve"
    effect = "read"


class QcPlugin(Plugin):
    @tool(FitCurve)
    async def fit_curve(self, ctx: ToolContext, args: FitArgs) -> FitResult:
        """Fit a 4-parameter logistic curve to one experiment."""
        design = await ctx.design.get(args.experiment_id)
        return FitResult(ic50_um=fit(design))
```

| Symbol | Description |
|--------|-------------|
| `Tool` | Spec base class. `effect` (`"read"`, `"write"` or `"destructive"`) is required. Optional: `title`, `idempotent` (defaults to `effect == "read"`), `timeout` (default 60 s), `access` (default `"use"`). The class is checked when Python defines it |
| `@tool(Spec)` | Publishes `async def name(self, ctx, args: ArgsModel) -> ResultModel` as the tool `<plugin>_<name>`. The docstring is the description |
| `@prompt(*, title=None)` | Publishes `async def name(self, args=None) -> str \| list[PromptMessage]` |
| `@resource(path, *, title=None, mime_type="text/plain")` | Publishes `async def name(self, ctx, **path_params) -> str \| bytes` as `mint://plugins/<plugin>/<path>` |
| `ToolContext` | `actor`, `deadline`, `design`, `artifacts` (both act as the caller; they raise `PluginException` in standalone mode) and `report(progress, total=None, message=None)` |
| `PromptMessage` | `role` (`"user"` or `"assistant"`) and `text` |

`call_tool(plugin, name, arguments, *, actor, platform, progress=None, read_only=False)`, `render_prompt(plugin, name, arguments, *, actor, platform)`, `read_resource(plugin, name, params, *, actor, platform)`, `mcp_manifest(plugin)` and `mcp_problems(plugin)` run and describe declarations for tests and tooling. A tool with `effect = "destructive"` makes the platform ask the user to confirm before the call runs.

## Instrument status

A plugin reports the live status of an instrument with `context.instruments.report(status, *, alerts="none")`. It needs `features = {"instrument_status"}` and an administrator grant that names the instrument. `alerts` is `"none"`, `"open"` or `"critical"`. The call returns an `InstrumentLiveStatus`. Errors:

| Error | Cause |
|-------|-------|
| `PermissionException` | The plugin has no grant for the instrument |
| `NotFoundException` | The instrument does not exist |
| `ConflictException` | The instrument is deactivated |

`InstrumentStatus` (`mint_sdk.instruments`) has `instrument_id`, `state` (`InstrumentState`), `active_method`, `current_sample` (`SampleInfo`), `sequence_progress` (`SequenceProgress`, built with `build_sequence_progress`), `timestamp`, `sequence_file`, `sequence_row_index`, `current_raw_file`, `method_elapsed_pct`, `panels`, `completed_sample` and `sequence_completed`. `panels` holds up to 8 typed panels (`KeyValuePanel`, `TablePanel`, `TextPanel`, `JsonPanel`, `BarPanel`). The panels of one report, `completed_sample.panels` included, may not exceed 16 KiB. `CompletedSample` adds `position`, `experiment_id`, `metrics` (up to 4 `InjectionMetric`), `panels` and `completed_at`. A sample sent again with the same `file_name`, `position` and `started_at` replaces its metrics and adds no history row.

`InstrumentLiveStatus` fields: `instrument_id`, `state`, `active_method`, `current_sample`, `sequence_progress`, `has_unacknowledged_alerts`, `has_unacknowledged_critical`, `last_seen`, `state_since`, `reported_by`, `reporter` and `panels`. The platform keeps the latest snapshot in memory. A read shows `disconnected` when the last report is older than 60 seconds. A platform restart empties the snapshots. A report can also add rows to the instrument history that the platform stores in its database: a state change, a finished sample, a finished sequence or a disconnect.

A daemon authenticates with a platform **service token** (`mint_svc_...`). A service token names no user: mount the route with `auth=False` and read the caller with `CurrentServiceCaller`. `ServiceCaller` is a frozen dataclass with `token_id` and `instrument_ids` (the token binding intersected with the plugin grant; never empty). The plugin must check `instrument_ids`; the platform does not re-check the binding. `mint_sdk.instrument_alerts` has `InstrumentAlert`, `InstrumentAlertList` and `instrument_alerts_router(list_fn, ack_fn)`; declare `"instrument_alerts"` in `features` and mount the router with sub-prefix `""`. How-to: [Report instrument status](/sdk/recipes/instrument-status).

`InstrumentRepository.get(id)`, `list(*, active=True)`, `create(InstrumentCreate)` and `update(id, InstrumentUpdate)` read and write the shared instrument directory under the current actor permissions (`instruments.view`, `instruments.edit`). There is no delete: set `is_active=False`.

## Integrations

`@notify` and `@calendar_event` from `mint_sdk.integrations` mark async plugin methods that return `NotificationEvent`, `InstrumentAlert`, `CalendarEvent`, `CalendarEventCancellation`, a list of these or `None` (at most 100 values per call). The platform resolves the recipients and owns SMTP, Teams, Slack, retry state and the ICS feeds. External delivery is Critical-only. A plugin named `platform` (any case) does not load: the name is reserved.

## Runtime and app factory

| Symbol | Description |
|--------|-------------|
| `mint_sdk.app.create_app(plugin=None, *, settings=None)` | Build the FastAPI app of one plugin. Without `plugin` it loads the single `mint.plugins` entry point of the project. The app owns the lifecycle, CORS, gzip, the routes at `/api{prefix}` and the frontend |
| `mint_sdk.app.SPAStaticFiles` | `StaticFiles` that falls back to `index.html` |
| `mint_sdk.client.MINTClient` | Typed REST client. See [REST client](/sdk/api/client) |

Run a plugin with `mint dev`, or with `uv run uvicorn mint_sdk.app:create_app --factory`. A plugin does not write an ASGI factory. The app also serves routes only for the platform, at the root and with the internal token: `GET /__mint/health`, `POST /__mint/events`, `GET /__mint/jobs/manifest`, `GET /__mint/mcp/manifest` and `POST /__mint/mcp/{tools,prompts,resources}/{name}`. A plugin process that starts before the platform accepts connections waits for the platform. `MINT_PLATFORM_STARTUP_WAIT` sets the wait in seconds (default 120; `0` turns the wait off).

### Runtime version negotiation

`mint_sdk.compat` defines `PLATFORM_API_VERSION` (`"2"` in 1.4) and `is_sdk_compatible()`. A plugin process checks `MINT_PLATFORM_API_VERSION` from its spawn environment first and sends `X-MINT-SDK-Version` and `X-MINT-Platform-API-Version` on every internal call. A hard API mismatch raises `PlatformCompatibilityError` (HTTP 426, `plugin.api_version_mismatch`) and the plugin process fails fast. A soft SDK mismatch only logs a warning. The platform sends the minimum SDK version in the handshake; a plugin wheel whose `mint-sdk` requirement excludes the platform SDK is refused at install.

## Testing

`mint_sdk.testing` exports `Harness`, `RecordingContext`, `Run`, `JobFailedException`, `RecordingJobContext` and `job_context`.

| Symbol | Purpose |
|--------|---------|
| `Harness(plugin, *, settings=None, context=None, timeout=10.0)` | Run a plugin on its real app. `harness.client` is a `TestClient`. `harness.run(job, **inputs)` submits a job, waits and returns a `Run` (`value`, `job`) or raises `JobFailedException` |
| `RecordingContext(actor=, plugin_id=, reads_from=, writes_to=, experiment_types=, experiments=, users=, instruments=, design=, instrument_status_grant=)` | In-memory `PlatformContext` with working namespaces. It applies the access rules and design validation. It keeps `published`, `streamed` and `instruments.reports` |
| `job_context(*, settings=None, cancelled=False, actor=None)` | A `JobContext` for a direct handler call. It keeps `reports` and `warnings` |

See [Testing plugins](/sdk/recipes/testing-plugins).

## Local database

`LocalDatabase` and `LocalDatabaseConfig` (`mint_sdk.local_database`) give standalone plugins a SQLite database. Install `mint-sdk[local-db]`. Use `context.db()` in both modes. See [Migrations](/sdk/api/migrations) for the tables that a plugin owns.

## Exceptions

See [Exceptions](/sdk/api/exceptions) for the full list. These are exported from the package root: `PluginException`, `ValidationException`, `PermissionException`, `NotFoundException`, `ConflictException`, `UnavailableException` and `EventVetoException`. Import `ConfigurationException`, `RepositoryException`, `PluginLifecycleException`, `VersionConflictException` and `PlatformCompatibilityError` from `mint_sdk.exceptions`.

## Where the other names live

| Module | Names |
|--------|-------|
| `mint_sdk.analysis` | `ArtifactResult`, `ImageResult`, `TableResult`, `FileResult`, `ManagedFile`, `StagedInputs`, `StagedPart`, `FinalizeContext`, `JobContext` |
| `mint_sdk.client` | `MINTClient` |
| `mint_sdk.data_store` | `ObjectRef`, `ObjectStore`, `LocalObjectStore`, `DataTransferProgress`, `TransferProgressCallback`, `validate_object_key` |
| `mint_sdk.design_validation` | `FieldError`, `design_schema_from_model`, `validate_design_data`, `ensure_valid_design_data` |
| `mint_sdk.filesystem` | `FileBrowser`, `ServerMount`, `file_browser_router` and the directory models |
| `mint_sdk.instruments` | `InstrumentState`, `InstrumentStatus`, `SampleInfo`, `SequenceProgress`, `build_sequence_progress`, `InstrumentLiveStatus`, `InstrumentRecord`, `InstrumentCreate`, `InstrumentUpdate` and the panel models |
| `mint_sdk.integrations` | `notify`, `calendar_event`, `NotificationEvent`, `CalendarEvent` and related types |
| `mint_sdk.jobs` | `JobState`, `JobManager`, `JobEventStream`, `JobVisibility`, `CurrentJobVisibility` and related types |
| `mint_sdk.migrations` | `MigrationSpec`, `LegacyBaseline`, `run_migrations` |
| `mint_sdk.protocol` | `JobStatus`, `MAX_EVENT_PAYLOAD_BYTES` and wire constants |
| `mint_sdk.r` | `RAnalysisBridge`, `RScriptSpec`, `RBridgeError`, `RRunProvenance` |
| `mint_sdk.settings` | `settings_form_fields`, `settings_schema`, `SettingsConflictError` |
| `mint_sdk.token_auth` | `create_bearer_token_dependency`, `create_header_token_dependency` |

Modules that start with `_` are internal and can change without notice. `mint_sdk.host` holds the members that only the platform and the SDK runtime call; plugin code does not import it.

## Removed APIs

SDK 1.4 removes the 1.3 author API with no aliases: `AnalysisPlugin`, `@mint_plugin`, `PluginMetadata`, `PluginNavItem`, `PluginCapabilities`, `get_experiment_repository()` and the other `get_*` context accessors, plugin roles, `get_migrations_package()` and the legacy migration protocol, `@job_finalizer`, `@mcp_tool`, `check_health()` and others. The [migration guide](/sdk/operations/migrate-1.3-to-1.4) lists each removal with its replacement. `mint doctor --fix` rewrites most of them.

## Related

- [Concepts](/sdk/concepts/) — the model these symbols implement
- [Recipes](/sdk/recipes/) — patterns using these symbols
