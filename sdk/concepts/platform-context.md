# PlatformContext

An integrated plugin gets one long-lived `PlatformContext` on `self.context`. Use its namespaces for experiments, design data, artifacts, users, instruments, objects, files and the plugin database. User identity is resolved separately for each request; never store the current user on the plugin instance.

## Choose the right integration boundary

See [Isolation](/sdk/concepts/isolation#runtime-comparison) for the context, platform data and SQL-table access of each runtime.

`self.context` is never `None`. Without the platform it is a `StandaloneContext`: a platform-only call raises `UnavailableException` (HTTP 503), and `objects()` and `db()` use local storage. Use `self.is_standalone` to branch. An isolated plugin is still **integrated**. Do not construct a `RemotePlatformContext` or forge forwarded user headers in application code. The platform host establishes its trusted binding and checks the internal API version at startup.

```python
from mint_sdk import Plugin


class MyPlugin(Plugin):
    async def initialize(self) -> None:
        # The host attached self.context before this call.
        self.service = make_service(self.context, standalone=self.is_standalone)
```

`initialize()` takes no argument and is optional when no extra resources are needed.

## Request-scoped access

Use `CurrentExperiment` to resolve a route's `experiment_id`, and `CurrentActor` for the trusted caller:

```python
from mint_sdk import CurrentActor, CurrentExperiment, Metadata, Plugin, endpoint, plugin


class PeakQcMeta(Metadata):
    domain = "qc"
    prefix = "/peak-qc"


@plugin(PeakQcMeta)
class PeakQcPlugin(Plugin):
    @endpoint.get("/experiments/{experiment_id}/summary")
    async def summary(
        self, experiment: CurrentExperiment, actor: CurrentActor,
    ) -> dict[str, object]:
        design = await self.design.get(experiment.id)
        return {
            "experiment_id": experiment.id,
            "requested_by": actor.user_id,
            "design_owner": experiment.design_owner_plugin_id,
            "design": design.data if design else None,
        }
```

`CurrentExperiment` checks `experiments.view` (403), resolves the actor-visible, type-compatible experiment, and returns 404 when the scoped lookup cannot see it. It returns 503 without the platform. This avoids treating missing platform integration as an empty successful response.

## What the platform enforces

Access is the intersection of these rules:

1. **Plugin write policy**: `Metadata.writes`. See [Plugin types](/sdk/concepts/plugin-types#_2-declare-what-the-plugin-writes).
2. **Experiment compatibility**: the plugin's `experiment_types` plus any tighter platform/admin restriction. `context.experiment_types` is `None` when unrestricted; an empty set blocks all types.
3. **Actor visibility**: deployment visibility settings, project membership, experiment ownership/collaboration, and platform administrator access.
4. **Data ownership**: writes use the calling plugin's ID. A plugin cannot overwrite another plugin's design or artifacts.
5. **Declared readers**: cross-plugin analysis reads require exact IDs in `reads_from`.
6. **Access level**: the `access` of the endpoint, job, tool or page (`use`, `configure`, `admin`). A role with only `plugins.use` reaches `use` routes.

These rules also apply over isolated-plugin internal HTTP. Even `{"experiments", "design", "artifacts"}` receives scoped access. A plugin that creates an experiment makes the calling user its creator, as for one created in the UI; a call without a user creates an experiment without an owner. See [Route permissions](/sdk/recipes/route-permissions).

## Context services

| API | Use |
|-----|-----|
| `context.experiments` | `get`, `list`, `create`, `update`, `delete` of experiment records |
| `context.design` | The design data of this plugin: `get`, `save`, `delete` |
| `context.artifacts` | JSON and file artifacts of this plugin: `get`, `list`, `save`, `save_all`, `download`, `archive`, `restore` |
| `context.users` | Read user records: `get(id)`, `get(username=)`, `list()` |
| `context.instruments` | Shared platform instrument directory; reads need `instruments.view`, writes `instruments.edit`; `report` sends live status; bookings stay in the plugin |
| `context.objects(experiment_id, *, plugin=None)` | Experiment/plugin-scoped object storage |
| `context.files` | Read-only access to configured server mounts |
| `context.db()` | In-process SQL session for declared plugin-owned tables |
| `context.experiment_types` | Effective type restrictions |
| `context.publish(name, payload, *, experiment_id=None)` | Deliver a plugin event, and stream it with the `realtime` feature |

The caller, the job visibility and the service-token identity are handler parameters, not context calls: `CurrentActor`, `CurrentJobVisibility` and `CurrentServiceCaller`. The platform binds the actor of each request, job and tool call. Use `self.settings` and `self.update_settings()` for typed configuration, and `@on("settings")` for runtime effects. Notifications and calendar events use `@notify` and `@calendar_event`. See [Lifecycle](/sdk/concepts/lifecycle).

## Persistence and standalone behavior

`self.design` and `self.artifacts` are shortcuts to `context.design` and `context.artifacts`. They write for this plugin only. Without the platform, a call raises `UnavailableException`; it does **not** persist to standalone SQLite. Use local tables or files for deliberate standalone persistence (`context.db()` and `context.objects()` use local storage), or require platform integration at the route boundary.

```python
await self.artifacts.save(experiment.id, {"peaks": rows}, "peaks")          # replaces by default
await self.artifacts.save(experiment.id, report_path, "report")             # a Path uploads a file
await self.artifacts.save(experiment.id, rows_json, "peaks", replace=False)  # ConflictException if present
```

`context.db()` cannot provide shared tables in isolated (subprocess) mode.

## Cross-plugin readers

Declare exact, case-sensitive producing plugin IDs:

```python
class DashboardMeta(Metadata):
    domain = "qc-dashboard"
    prefix = "/qc-dashboard"
    reads_from = {"peak-qc", "calibration"}


@plugin(DashboardMeta)
class DashboardPlugin(Plugin):
    @endpoint.get("/experiments/{experiment_id}/outputs")
    async def outputs(self, experiment: CurrentExperiment) -> list[dict[str, object]]:
        artifacts = await self.artifacts.list(experiment.id, others=True)
        return [
            {"plugin_id": item.plugin_id, "key": item.artifact_key,
             "name": item.display_name}
            for item in artifacts
        ]
```

`others=True` includes the calling plugin and declared readers only. It does not grant write access. Archived artifacts are restricted to the owning plugin; do not combine `others=True` and `archived=True`. No plugin can replace the artifact of another plugin. `writes_to` only opens the object store of the named plugin with `context.objects(experiment_id, plugin=...)`, create-only.

## Source and next steps

Verified against [v@MINT_VERSION@ context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/context.py), [remote context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/remote/context.py), and [platform scope enforcement](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/scoped_experiment_repository.py).

- [Reading and managing experiments](/sdk/recipes/reading-experiments)
- [Writing results and files](/sdk/recipes/writing-results)
- [Plugin-owned tables](/sdk/recipes/querying-plugin-data)
