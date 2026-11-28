# PlatformContext

An integrated plugin gets one long-lived `PlatformContext` on `self.context`. Use its namespaces for experiments, design data, artifacts, users, instruments, objects, files and the plugin database. The platform resolves the user identity for each request. Never store the current user on the plugin instance.

## Choose the integration boundary

See [Isolation](/sdk/concepts/isolation#runtime-comparison) for the context, platform data and SQL-table access of each runtime.

`self.context` is never `None`. Without the platform, it is a `StandaloneContext`: a platform-only call raises `UnavailableException` (HTTP 503), and `objects()` and `db()` use local storage. Use `self.is_standalone` to branch. An isolated plugin is also integrated. Do not construct a `RemotePlatformContext` or forge forwarded user headers in application code. The platform host sets up the trusted binding and checks the internal API version at startup.

```python
from mint_sdk import Plugin


class MyPlugin(Plugin):
    async def initialize(self) -> None:
        self.service = make_service(self.context, standalone=self.is_standalone)
```

The host attaches `self.context` before it calls `initialize()`. `initialize()` takes no argument. Override it only when the plugin needs extra resources.

## Request-scoped access

Use `CurrentExperiment` to resolve the `experiment_id` of a route, and `CurrentActor` for the trusted caller:

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

`CurrentExperiment` checks `experiments.view` (403). It resolves an experiment that the actor can see and whose type the plugin supports, and returns 404 when the scoped lookup cannot see it. Without the platform it returns 503, so a missing integration never looks like an empty successful response.

## What the platform enforces

Access is the intersection of these rules:

1. Plugin write policy: `Metadata.writes`. See [Plugin types](/sdk/concepts/plugin-types#_2-declare-what-the-plugin-writes).
2. Experiment compatibility: the `experiment_types` of the plugin, plus a tighter platform or admin restriction. `context.experiment_types` is `None` when there is no restriction; an empty set blocks all types.
3. Actor visibility: the visibility settings of the deployment, project membership, experiment ownership and collaboration, and administrator access.
4. Data ownership: writes use the ID of the calling plugin. A plugin cannot overwrite the design or artifacts of another plugin.
5. Declared readers: cross-plugin reads (artifacts, exports, bus events, tool and job calls) need exact IDs in `reads_from`. See [Plugin communication](/sdk/concepts/plugin-communication).
6. Access level: the `access` of the endpoint, job, tool or page (`use`, `configure`, `admin`). A role with only `plugins.use` reaches `use` routes.

These rules also apply over the internal HTTP of an isolated plugin. A `{"experiments", "design", "artifacts"}` plugin also gets scoped access only. When a plugin creates an experiment, the calling user becomes its creator, as in the UI. A call without a user creates an experiment without an owner. See [Route permissions](/sdk/recipes/route-permissions).

## Context services

| API | Use |
|-----|-----|
| `context.experiments` | `get`, `list`, `create`, `update`, `delete` of experiment records |
| `context.design` | The design data of this plugin: `get`, `save`, `delete` |
| `context.artifacts` | JSON and file artifacts of this plugin: `get`, `list`, `save`, `save_all`, `download`, `archive`, `restore` |
| `context.users` | Read user records: `get(id)`, `get(username=)`, `list()` |
| `context.instruments` | Shared platform instrument directory. Reads need `instruments.view`, writes need `instruments.edit`. `report` sends live status. Bookings stay in the plugin |
| `context.objects(experiment_id, *, plugin=None)` | Object storage scoped to an experiment and a plugin |
| `context.files` | Read-only access to configured server mounts |
| `context.db()` | In-process SQL session for declared plugin-owned tables |
| `context.experiment_types` | Effective type restrictions |
| `context.plugins` | Other plugins: `read` exports, `call` tools, `start_job`, `catalog`, `subscribe`, `unsubscribe`. See [Plugin communication](/sdk/concepts/plugin-communication) |
| `context.publish(name, payload, *, experiment_id=None)` | Deliver a plugin event, send a `Metadata.emits` event to the event bus, and stream it with the `realtime` feature |

The caller, the job visibility and the service-token identity are handler parameters, not context calls: `CurrentActor`, `CurrentJobVisibility` and `CurrentServiceCaller`. The platform binds the actor of each request, job and tool call. Use `self.settings` and `self.update_settings()` for typed configuration, and `@on("settings")` for runtime effects. Notifications and calendar events use `@notify` and `@calendar_event`. See [Lifecycle](/sdk/concepts/lifecycle).

## Persistence and standalone behavior

`self.design` and `self.artifacts` are shortcuts to `context.design` and `context.artifacts`. They write for this plugin only. Without the platform, a call raises `UnavailableException`; it does not write to standalone SQLite. For standalone persistence, use local tables or files (`context.db()` and `context.objects()` use local storage), or require the platform at the route boundary.

To save, replace and upload artifacts, see [Writing results](/sdk/recipes/writing-results).

`context.db()` cannot give shared tables in an isolated subprocess.

## Cross-plugin readers

Declare the exact, case-sensitive IDs of the producing plugins:

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

`others=True` includes the calling plugin and the declared readers only. It does not give write access. Only the owning plugin sees its archived artifacts, so do not combine `others=True` and `archived=True`. No plugin can replace the artifact of another plugin. `writes_to` only opens the object store of the named plugin with `context.objects(experiment_id, plugin=...)`, and only to create objects.

Verified against [v@MINT_VERSION@ context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/context.py), [remote context](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/remote/context.py) and [platform scope enforcement](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/scoped_experiment_repository.py).
