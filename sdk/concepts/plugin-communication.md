# Plugin communication

::: warning MINT 1.5 (beta)
This page describes features of MINT 1.5, which is in beta. SDK 1.4 plugins do not use them and do not change. The pages in this track that show `AnalysisPlugin` describe the older API. This page uses the 1.4 declaration style: a `Metadata` subclass and `@plugin`.
:::

One plugin can tell another plugin that something happened. It can also let another plugin read some of its data. MINT 1.5 gives two mechanisms for this:

| Mechanism | Direction | Use it to |
|---|---|---|
| [Events](#events) | Push | Tell other plugins that data changed |
| [Exports](#exports) | Pull | Let other plugins read a page of your data |

Both mechanisms need the subscribing plugin to name the other plugin in `Metadata.reads_from`. The platform checks this on every event and every read.

A runnable pair of plugins is in `examples/plugin-events/` in the [MINT repository](https://github.com/MorscherLab/MINT).

## Events

### Publish an event

Declare each event and the model of its payload in `Metadata.emits`. Then call `context.publish`.

```python
from mint_sdk import Metadata, Plugin, endpoint, plugin
from pydantic import BaseModel


class MethodSaved(BaseModel):
    method_id: str


class MethodBook(Metadata):
    domain = "lab"
    emits = {"method-book.method.saved": MethodSaved}


@plugin(MethodBook)
class MethodBookPlugin(Plugin):
    @endpoint.post("/methods", status_code=204)
    async def save_method(self, body: SaveMethod) -> None:
        ...  # write the method
        await self.context.publish("method-book.method.saved", MethodSaved(method_id=body.id))
```

- The event name has the form `<plugin>.<event>`. The plugin name is the first part.
- The names that start with `experiment.` belong to the platform.
- The platform checks the payload against the declared model. A payload that does not match is refused.
- Pass `experiment_id` to limit the event to plugins that can read that experiment.
- Standalone, the event stays inside the plugin.

### Handle an event of another plugin

List the publisher in `reads_from`. Then add an `@on` handler. Annotate the handler parameter as `PluginEvent[Model]`. `Model` is your own pydantic model. The SDK validates the payload into it.

```python
from mint_sdk import Metadata, Plugin, PluginEvent, on, plugin
from pydantic import BaseModel


class MethodSaved(BaseModel):
    method_id: str


class RunLog(Metadata):
    domain = "lab"
    reads_from = {"method-book"}


@plugin(RunLog)
class RunLogPlugin(Plugin):
    @on("method-book.method.saved")
    async def method_saved(self, event: PluginEvent[MethodSaved]) -> None:
        if event.id <= self.last_event_id:
            return  # a repeated or older delivery
        ...
```

| `PluginEvent` field | Meaning |
|---|---|
| `id` | Number of the event. It increases with each published event. |
| `name`, `source` | Event name and publishing plugin |
| `experiment_id` | Experiment of the event, or `None` |
| `actor` | User who published the event, or `None` |
| `attempt` | Number of deliveries of this event to your plugin, from 1 |
| `payload` | Payload, validated into your model |

### Delivery rules

- The platform writes the event in the transaction of the write. It delivers the event after the commit.
- Delivery is at least once. Your handler can receive the same event more than once.
- Delivery has no fixed order.
- Dedupe on `event.id`. Store the last event number in the plugin database.
- The platform retries a failed delivery with a delay. After five attempts the delivery is dead.
- An administrator sees recent and dead deliveries in **Admin > Plugins > Event deliveries**. The administrator can retry a dead delivery.
- The platform delivers the events after a platform restart or a subscriber outage.

### Identity

The handler runs as the user who published the event. This holds while that account is active and may use your plugin. Otherwise the handler runs in the scope of your plugin, and `event.actor` is `None`. Do not assume that a user exists.

## Exports

An export is a read-only view of part of your data. Other plugins read it page by page.

### Publish an export

Add `@export` to an async method. The method takes an `ExportQuery` and returns a `Page`. Import these names from `mint_sdk.exports`.

```python
from mint_sdk.exports import ExportQuery, Page, export, page_of
from pydantic import BaseModel
from sqlalchemy import select


class LcMethodView(BaseModel):
    id: str
    name: str


class PlannerPlugin(Plugin):
    @export("lc-methods", model=LcMethodView, version=1, key="id", access="use")
    async def lc_methods(self, query: ExportQuery) -> Page[LcMethodView]:
        async with self.context.db() as db:
            return await page_of(db, select(LcMethod), query, view=LcMethodView)
```

- `model` is the public contract of a row. Do not use your storage model.
- `key` is the field that identifies a row.
- `access` is the level that a reading user needs on your plugin: `use`, `configure` or `admin`.
- `page_of` orders the rows by key, pages them with an opaque cursor and reads each row into `view`.
- A read without a user needs only `reads_from`. This happens when an event handler reads in its own scope.

`ExportQuery` has these fields:

| Field | Meaning |
|---|---|
| `ids` | Keys of the rows to return |
| `experiment_id` | Only rows of this experiment |
| `updated_since` | Only rows updated at or after this time |
| `cursor` | `next_cursor` of the previous page |
| `limit` | Page size, 1 to 200 (default 50) |
| `filters` | Filters that the export declares with `@export(filters=Model)` |

A `Page` has `items`, `next_cursor` (`None` on the last page) and `export_version`.

The platform refuses a page that is larger than 1 MiB. It also refuses an item that does not match `model`. The reader then gets the error `plugin.export_invalid` (HTTP 502).

### Versions

Do not change a published model in an incompatible way. Add a new `version` and keep the old method. Readers of the old version continue to work.

Run `mint doctor` before a release. It compares each export with the export of the same name and version at the latest git tag. It fails when you break the contract inside one version. Without a tag, the check is skipped.

### Read an export

List the exporting plugin in `reads_from`. Name the version in every read.

```python
page = await self.context.plugins.read(
    "ms-planner", "lc-methods", version=1, ids=["m1"], model=LcMethodView
)
for item in page.items:
    ...  # dicts, or LcMethodView when you pass model
next_page = await self.context.plugins.read(
    "ms-planner", "lc-methods", version=1, cursor=page.next_cursor
)
```

| Error | Cause |
|---|---|
| 403 `plugin.export_forbidden` | The target is not in your `reads_from`, or the user lacks the access level |
| 404 `plugin.export_not_found` | The target is disabled, or it has no such export version |

### MCP resources

Each export version is also an MCP resource template on `/mcp`:

```text
mint://plugins/{plugin}/exports/{name}/v{version}{?ids,experiment_id,updated_since,cursor,limit}
```

A read returns one JSON page. Pass `next_cursor` as `cursor` to get the next page. The caller needs `plugins.use`, a role that sees the plugin, and the access level of the export. A read-only token can read.

## Test

`Harness` tests both sides without a platform.

```python
from mint_sdk.testing import Harness, RecordingContext

context = RecordingContext(reads_from=["method-book"])
with Harness(RunLogPlugin, context=context) as harness:
    harness.stub_export("method-book", "methods", version=1, rows=[{"id": "m1", "name": "HILIC"}])
    harness.deliver("method-book.method.saved", {"method_id": "m1"})
```

- `deliver` gives each handler a `PluginEvent` with a new increasing `id`, `attempt` 1 and no actor. A name with no handler raises `ValueError`.
- `stub_export` answers `context.plugins.read` and pages the rows. `context.reads` records each read.
- `context.emitted` records each event that a publisher sends to the platform.

See also: [Plugin lifecycle](/sdk/concepts/lifecycle), [PlatformContext](/sdk/concepts/platform-context) and [Isolation](/sdk/concepts/isolation).
