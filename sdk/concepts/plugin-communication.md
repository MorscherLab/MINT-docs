# Plugin communication

Use this page to let a plugin react to, read from or call other plugins. The platform checks each mechanism. No plugin reads the SQL tables of another plugin.

| Need | Use | Direction |
|------|-----|-----------|
| React when another plugin changes something | [Event bus](#event-bus): `Metadata.emits`, `@on("<plugin>.<event>")` | Push, at least once |
| React to experiment writes | [`experiment.*` events](#experiment-events) | Push, at least once |
| Read rows that another plugin owns | [Exports](#exports): `@export`, `context.plugins.read` | Pull, read-only |
| Run a tool or a job of another plugin | [Calls](#calls-to-tools-and-jobs): `context.plugins.call`, `context.plugins.start_job` | Request |

The event bus is not the realtime stream. A `"realtime"` plugin streams `context.publish` events to the browser (`plugin:<plugin>` topics); see [Python SDK](/sdk/api/python#events-health-and-realtime). The browser stream is not durable and does not reach other plugins. One `context.publish` call can do both, when the event is in `Metadata.emits` and the plugin has the `"realtime"` feature.

## `reads_from` is the gate

Each mechanism, except the `experiment.*` events, needs the other plugin in `Metadata.reads_from` of the reading, subscribing or calling plugin:

```python
from mint_sdk import Metadata


class DashboardMeta(Metadata):
    domain = "qc-dashboard"
    reads_from = {"ms-planner", "peak-qc"}
```

The names are exact plugin names (entry-point keys). The same set also gives artifact reads; see [PlatformContext](/sdk/concepts/platform-context#cross-plugin-readers).

### Read every plugin: `reads_from = {"*"}`

`reads_from = {"*"}` reads every enabled plugin: calls, export reads, bus events and the catalog. It grants nothing until an administrator sets the platform-owned plugin setting `reads_from_any_plugin` for the plugin (`PATCH /api/plugins/{name}/config`). Only an administrator can set it. Until then, `GET /api/plugins` shows `reads_from_consent_needed` for the plugin. See [Plugins that read other plugins](/admin/plugins#plugins-that-read-other-plugins).

Only a plugin with a confirmed `"*"` can call a tool or start a job as a user (`on_behalf_of`). Use `"*"` only for a plugin that must see all plugins, such as an automation or a rule engine.

## Event bus

The platform event bus delivers plugin events durably. It writes each event and one delivery per subscriber in the transaction of the write. A background worker then delivers each event at least once, also after a subscriber outage or a platform restart.

### Publish an event

Declare each event that leaves the plugin in `Metadata.emits`, with its payload model. The name is `"<plugin>.<event>"`, in the namespace of the publishing plugin:

```python
from pydantic import BaseModel
from mint_sdk import Metadata, Plugin, plugin


class QueueChanged(BaseModel):
    entry_id: int
    state: str


class PlannerMeta(Metadata):
    domain = "planning"
    emits = {"ms-planner.queue_changed": QueueChanged}


@plugin(PlannerMeta)
class PlannerPlugin(Plugin):
    async def move(self, entry_id: int, experiment_id: int) -> None:
        ...
        await self.context.publish(
            "ms-planner.queue_changed",
            QueueChanged(entry_id=entry_id, state="running"),
            experiment_id=experiment_id,
        )
```

The platform refuses an event before any handler runs when one of these checks fails:

- The name is in the namespace of the publisher and in `Metadata.emits`.
- The payload matches the declared model (its JSON Schema) and is at most 16 KiB (`mint_sdk.protocol.MAX_EVENT_PAYLOAD_BYTES`).
- `experiment_id`, when given, names an experiment that the publisher can read (else `NotFoundException`).

The event also goes to the `@on` handlers of the publishing plugin. The platform does not send it back to the publisher through the bus. Standalone, the event stays in the plugin.

### Subscribe to an event

Declare `@on` with the event name of a plugin in `reads_from`. Annotate the parameter as `PluginEvent[Model]`, with your own model of the payload. The SDK validates the payload into it:

```python
from pydantic import BaseModel
from mint_sdk import Metadata, Plugin, PluginEvent, on, plugin


class QueueChanged(BaseModel):  # the subscriber's own copy of the contract
    entry_id: int
    state: str


class MonitorMeta(Metadata):
    domain = "monitoring"
    reads_from = {"ms-planner"}


@plugin(MonitorMeta)
class MonitorPlugin(Plugin):
    @on("ms-planner.queue_changed")
    async def queue_changed(self, event: PluginEvent[QueueChanged]) -> None:
        if await self.already_seen(event.id):
            return
        await self.refresh(event.payload.entry_id)
```

An `@on` name outside the plugin's own namespace and outside `reads_from` raises `TypeError` when the plugin loads.

| `PluginEvent` field | Meaning |
|---------------------|---------|
| `id` | Event id. It increases with each published event. Use it to drop a repeated or an older delivery |
| `name` | Event name, `"<plugin>.<event>"` |
| `source` | The publishing plugin |
| `experiment_id` | The experiment of the event, or `None` |
| `actor` | The publishing user, read again at delivery, or `None` (see [Handler actor](#handler-actor)) |
| `attempt` | The delivery count of this event to this plugin, from 1 |
| `payload` | The payload, validated into the model of the annotation |

To subscribe at run time, call `await self.context.plugins.subscribe(name, handler=None)`, for example in `initialize()`. The bus counts the subscription like a declared `@on`. `handler` is a coroutine function that takes the `PluginEvent`; it runs with the `@on(name)` handlers. The platform keeps runtime subscriptions in memory only, so subscribe again at each start. `unsubscribe(name)` stops it. A declared `@on(name)` keeps its events.

### Delivery rules

- Targets: the platform fixes the targets when the event is published. A target is each enabled plugin that declares the event with `@on` (or subscribes at run time), lists the source in `reads_from`, and is not the publisher. For an event with an experiment, the target must also be able to read the experiment (its own experiment-type allowlist). A plugin that subscribes later gets only later events. There is no replay.
- At least once: a plugin can get one event more than once. Make each handler idempotent, for example with `event.id`.
- No ordering: events can arrive in any order. `id` increases, so compare it when the order matters.
- Retries: a failed delivery is retried after `min(3600, 5 · 2^(n-1))` seconds, where `n` is the failed attempt (5 s, 10 s, 20 s, 40 s). The fifth failure makes the delivery dead. A delivery times out after 30 seconds.
- Plugin state: the worker keeps a delivery pending, without an attempt, while the plugin process starts. A delivery to a disabled or uninstalled plugin is skipped. One slow plugin does not hold the deliveries of other plugins.
- Handler failure: from SDK 1.5, the first handler failure fails the delivery, so the platform delivers the event again. A plugin process answers 500 on `/__mint/events`. A plugin on SDK 1.4 logs the failure, and the platform counts the delivery as done.

Administrators see recent and dead deliveries, and retry a dead one, in the [Event deliveries](/admin/plugins#event-deliveries) action of each plugin card in Admin → Plugins → Installed.

### Handler actor

The handler runs as the publishing user while that account is active and may still use the subscribing plugin (`plugins.use` and plugin visibility). Otherwise it runs with no user, in the plugin's own scope, and `event.actor` is `None`. It never runs as the platform's system actor. Check `event.actor` before an action that needs a user.

## Experiment events

The `experiment.created`, `experiment.updated`, `experiment.status_changed`, `experiment.deleted` and `experiment.after_save` observer events go through the same bus. They need no `reads_from`. The handler signatures and payload classes are in [Lifecycle](/sdk/concepts/lifecycle#typed-events-and-their-limits).

- The platform writes the event in the transaction of the experiment write. The handler runs after the commit, not while the request waits. A rolled-back write sends no event.
- The [delivery rules](#delivery-rules) and the [handler actor](#handler-actor) apply. Make these handlers idempotent too.
- The plugin that made the write does not get the events of its own write.
- `experiment.after_save` carries the design that is stored at delivery and its `version`, not the design of the save. A later save can be in the event already.
- For the field patches of a [live design](/sdk/recipes/live-design), `experiment.after_save` comes once, 30 s after the last patch of a user, and at least every 5 min while the user keeps editing. A full save sends it at once.
- `experiment.deleted` carries the last `experiment_code` and `experiment_type`. The row is gone.

`experiment.before_save` does not use the bus. It is synchronous and can veto the save; see [Typed events and their limits](/sdk/concepts/lifecycle#typed-events-and-their-limits). It also runs for each live-design patch. `event.data` is then `{"plugin_id", "data", "ops"}`, where `data` is the whole design with the patch applied. A live design can lack the fields of the root `required` list of the schema.

## Exports

An export publishes part of the plugin's own data as a read-only, versioned contract. Other plugins read it with `context.plugins.read`. Import the names from `mint_sdk.exports`. `mint_sdk.Page` is the navigation page, not the export page.

### Publish an export

```python
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select
from mint_sdk import Plugin
from mint_sdk.exports import ExportQuery, Page, export, page_of


class LcMethodView(BaseModel):  # the public contract, not the ORM model
    id: str
    name: str
    updated_at: datetime


class PlannerPlugin(Plugin):
    @export("lc-methods", model=LcMethodView, version=1, key="id")
    async def lc_methods(self, query: ExportQuery) -> Page[LcMethodView]:
        async with self.context.db() as db:
            return await page_of(db, select(LcMethod), query, view=LcMethodView)
```

`@export(name, *, model, version, key, access="use", filters=None)` takes:

| Argument | Meaning |
|----------|---------|
| `name` | One lowercase segment, such as `"lc-methods"` |
| `model` | Pydantic model of one row. Its JSON Schema is the contract |
| `version` | Positive integer. Several versions of one name can exist side by side |
| `key` | Field of `model` that identifies a row (`ExportQuery.ids` matches it) |
| `access` | Level that a reading user needs on this plugin: `"use"`, `"configure"` or `"admin"` |
| `filters` | Pydantic model of `ExportQuery.filters`, or `None` |

The method is `async def name(self, query: ExportQuery) -> Page[Model]`. A wrong signature raises `TypeError` when the class is defined. The method must finish in 30 seconds.

`ExportQuery` has `ids`, `experiment_id`, `updated_since`, `cursor`, `limit` (1 to 200, default 50) and `filters`. `Page` has `items` and `next_cursor` (`None` on the last page); the SDK sets `export_version`.

`page_of(session, statement, query, *, view, key_column=None, updated_column="updated_at", experiment_column="experiment_id")` runs a `select(Entity)` (no `order_by`, no `limit`) for one page. It orders and pages on the primary key or `key_column` with an opaque cursor, applies `ids`, `updated_since` and `experiment_id`, and reads each row into `view`. A query on a column that the entity does not have is refused.

To change the model in an incompatible way, add a new `version` and keep the old method, so its readers keep working. `mint doctor` compares each export with the same name and version at the latest git tag. It fails when a version was removed, its `key` changed, its `access` was raised, a field was removed or changed type, or a field became required. Without a tag, the check is skipped.

### Read an export

```python
page = await self.context.plugins.read(
    "ms-planner", "lc-methods", version=1, updated_since=since, model=LcMethodView,
)
rows = list(page.items)
while page.next_cursor:
    page = await self.context.plugins.read(
        "ms-planner", "lc-methods", version=1, cursor=page.next_cursor, model=LcMethodView,
    )
    rows += page.items
```

`context.plugins.read(plugin, name, *, version, ids=None, experiment_id=None, updated_since=None, cursor=None, limit=50, filters=None, model=None)` returns one `Page`. Items are dicts, or instances of `model`. Always name the version.

The platform checks each read:

| Check | Refusal | SDK exception |
|-------|---------|---------------|
| The target is in the reader's `reads_from` | 403 `plugin.export_forbidden` | `PermissionException` |
| The target is enabled and has that name and version | 404 `plugin.export_not_found` | `NotFoundException` |
| With a user, the user meets the export's `access` on the target | 403 | `PermissionException` |
| `filters` match the `filters` model | 400 | `ValidationException` |
| `experiment_id` is an experiment that the reader can read | 404 | `NotFoundException` |
| The export did not fail, the page is at most 1 MiB, each item matches the model | 502 `plugin.export_invalid` | `PluginException` |

The target method runs as the reading user. A read without a user, such as from an event handler that runs in the plugin's own scope, needs only `reads_from` and runs in the target's own scope.

### Read an export over MCP

Each export version is also an MCP resource template on `/mcp`:

```
mint://plugins/<plugin>/exports/<name>/v<version>{?ids,experiment_id,updated_since,cursor,limit}
```

`ids` is a comma-separated list. A read returns one JSON page `{items, next_cursor, export_version}`; pass `next_cursor` as `cursor` for the next page. The caller needs `plugins.use`, a role that sees the plugin and the export's `access` level. A read-only token can read. An `experiment_id` that the caller cannot see is 404. MCP reads have no reader plugin, so `reads_from` does not apply. See [AI & API](/guide/ai-and-api) for tokens.

## Calls to tools and jobs

A plugin calls the [MCP tools](/sdk/recipes/mcp-tools) and starts the jobs of a plugin in its `reads_from`:

```python
from mint_sdk.exceptions import PluginNotReadable, PluginToolRefused, PluginUnreachable

result = await self.context.plugins.call(
    "dose-response", "fit_curve", {"experiment_id": 42}, result=FitResult,
)
job_id = await self.context.plugins.start_job("ms-planner", "export-sequence", {"experiment_id": 42})
```

- `call(plugin, tool, args=None, *, result=None, on_behalf_of=None)` returns the tool result as a dict, or as an instance of `result`. `tool` is the method name, not the published `<plugin>_<name>`.
- `start_job(plugin, job, args=None, *, on_behalf_of=None)` returns the job id. A staged job cannot be started this way.
- `catalog()` lists each plugin that this plugin reads, with its `tools`, `events` and `exports`.

The target names the plugins that may call it with `callers` on the `Tool` or `Job` spec: a set of plugin names, or `"readers"` for every plugin that lists the target in `reads_from`. A `"read"` tool defaults to `"readers"`. A write or destructive tool and a job default to no callers.

```python
from mint_sdk import Job
from mint_sdk.mcp import Tool


class ExportSequence(Job):
    callers = {"qc-dashboard"}


class FitCurve(Tool):
    effect = "write"
    callers = "readers"
```

The call runs through the MCP path as the plugin actor `plugin:<caller>`, not as the user of the current request. A job start does not change the actor of the caller's request. The target then checks its `access` level for that actor. Errors:

| Refusal | SDK exception |
|---------|---------------|
| The target is not in `reads_from` (403 `plugin.call_forbidden`, `details.declaration` is `"reads_from"`) | `PluginNotReadable` |
| The tool or job does not name the caller in `callers`, or `on_behalf_of` is not allowed (403 `plugin.call_forbidden`) | `PluginToolRefused` |
| The target's `access` refuses the actor (403 `PERMISSION_DENIED`) | `PermissionException` |
| The target is not enabled or does not answer (503 `plugin.unreachable`) | `PluginUnreachable` |

`on_behalf_of` (a user id) runs the call as that user. It needs a confirmed `reads_from = {"*"}`, and the user must be able to use the target.

### Job results: `<target>.job_finished`

When a job that a plugin started ends, the platform sends `<target>.job_finished` to that plugin only, through the event bus. Declare a handler for it:

```python
from typing import Any

from pydantic import BaseModel
from mint_sdk import PluginEvent, on


class JobFinished(BaseModel):
    job_id: str
    job: str
    status: str  # completed, failed, cancelled or lost
    result: Any = None
    error: str | None = None


@on("ms-planner.job_finished")
async def sequence_exported(self, event: PluginEvent[JobFinished]) -> None:
    ...
```

`mint_sdk.event_names.job_finished_event(target)` returns this event name for a target plugin name.

`lost` means that the target lost the job, or that the `on_behalf_of` user may no longer use the target. The platform checks this at each poll and polls a job for at most 24 hours.

## Read recent events over MCP

The MCP resource `mint://plugins/<plugin>/events{?since}` returns the last 100 events that the plugin published on the bus, oldest first, after the event id `since`. Each event has `id`, `name`, `experiment_id`, `payload` and `created_at`. The caller needs `plugins.use` and a role that sees the plugin. An event of an experiment also needs `experiments.view` and a visible experiment.

## Test

`RecordingContext` and `Harness` fake the bus, the exports and the calls. See [Testing plugins](/sdk/recipes/testing-plugins#events-exports-and-calls).

## Source

Verified against [v@MINT_VERSION@ `exports.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/exports.py), [`plugin_lifecycle.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_lifecycle.py), [the event bus](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/plugin_event_bus.py) and [the export reads](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/plugin_exports.py).
