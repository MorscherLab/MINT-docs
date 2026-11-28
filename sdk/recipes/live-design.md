# Live design forms

Let users edit the design data of your plugin on the experiment page. With `Design(live=True)`, the platform draws a form from the design schema and saves each field by itself. The plugin needs no frontend.

Live design forms need MINT 1.6 and `mint-sdk` 1.6 or later.

## When to use it

| Use a live design | Use a plugin page |
|-------------------|-------------------|
| The design is a set of top-level values: text, numbers, choices, switches | The design needs a plate editor, a table of samples or other interaction |
| Two people may fill in different fields at the same time | One person fills in the design and saves it at once |
| The plugin has no frontend | The plugin has a frontend |

A plugin can do both. The experiment page then shows the form in the **Design data** card and an **Open in &lt;plugin&gt;** button to the page.

## Declare a live design

Set `live=True` on `Design` and give a schema. This plugin is `examples/live-design` in the MINT repository (shortened):

```python
from mint_sdk import (
    AfterExperimentSave, BeforeExperimentSave, Design, EventVetoException, Metadata, Plugin, on, plugin,
)

PLUGIN_ID = "live-design"

CELL_SEEDING_SCHEMA = {
    "type": "object",
    "properties": {
        "cell_line": {"type": "string", "title": "Cell line", "description": "Name of the cell line, for example HeLa."},
        "medium": {"type": "string", "enum": ["DMEM", "RPMI-1640", "MEM"], "title": "Medium"},
        "passage": {"type": "integer", "minimum": 1, "maximum": 60, "title": "Passage"},
        "seeding_density": {"type": "number", "minimum": 0, "title": "Seeding density"},
        "mycoplasma_tested": {"type": "boolean", "title": "Mycoplasma tested"},
        "timepoints_h": {"type": "array", "items": {"type": "integer", "minimum": 0}, "title": "Timepoints (h)"},
    },
    "required": ["cell_line", "medium"],
    "additionalProperties": False,
}


class LiveDesign(Metadata):
    domain = "example"
    title = "Cell seeding"
    prefix = "/live-design"
    writes = {"design"}
    design = Design(version="1.0", schema=CELL_SEEDING_SCHEMA, live=True)


@plugin(LiveDesign)
class LiveDesignPlugin(Plugin):
    @on("experiment.before_save")
    async def require_mycoplasma_test(self, event: BeforeExperimentSave) -> None:
        if event.data["plugin_id"] != PLUGIN_ID:
            return
        design = event.data["data"]
        if design.get("seeding_density") is not None and not design.get("mycoplasma_tested"):
            raise EventVetoException("Test for mycoplasma before you set a seeding density.")

    @on("experiment.after_save")
    async def note_save(self, event: AfterExperimentSave) -> None:
        if event.data["plugin_id"] == PLUGIN_ID:
            ...
```

Source: [`examples/live-design`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/examples/live-design/src/live_design/plugin.py).

Rules for the declaration:

- `live=True` needs a `schema`. Without one, `Design` raises `TypeError` when Python defines the class.
- The schema root must be `"type": "object"` with `properties`. `mint doctor` fails a live design without them.
- The schema can be a JSON Schema `dict` or a pydantic model class, as for every [design schema](/sdk/api/python#design-schema).

## What the form shows

The form edits the top-level properties of the schema. String, number, integer, boolean and enum properties become fields. Array and object properties show as read-only JSON; another plugin or a full save can still write them. `title` becomes the label and `description` the hint.

For the save state, the field locks and the required count, see [Fill in the design](/guide/experiments#fill-in-the-design) (users) and [LiveDesignForm → Behavior](/sdk/components/live-design-form#behavior) (component). These rules change what the stored data looks like:

- Each field saves by itself, 1 s after the last edit or on blur.
- Edits of different fields by two users both stay. For one field, the last write wins.
- A list is one field. A later save replaces the whole list.
- No operation removes a field. To clear a field, the form sends `null` or `''`.
- The form never sends a refused value again by itself.

## Handle saves in the plugin

Each field save is a patch. A patch does not enforce the root `required` list of the schema, so a live design can be incomplete. Every reader of the design data, also [panels](/sdk/recipes/panels) and jobs, must accept a document without those fields.

| Event | What the plugin gets for a patch |
|-------|-----------------------------------|
| `experiment.before_save` | Runs for each patch and can veto it with `EventVetoException`. `event.data` is `{"plugin_id", "data", "ops"}`: `data` is the whole design with the patch applied, `ops` is the list of `{"field", "value"}`. The handler gets a copy, so a change to it changes nothing. When another write changes the experiment during the check, the handler gets the patch again with the new `data` |
| `experiment.after_save` | Comes once, 30 s after the last patch of a user, and at least every 5 min while the user keeps editing. `data` and `version` are the design stored at delivery |

A full save (`PUT /api/experiments/{id}/data`, `design.save`, MCP `mint_save_design`) validates the full schema and sends `experiment.after_save` at once. Each handler also gets the events of other design plugins, so check `event.data["plugin_id"]`. For the fail-closed rule of `before_save`, see [Typed events and their limits](/sdk/concepts/lifecycle#typed-events-and-their-limits).

The audit row `experiment.design_data_save` of patches is also combined: one row with the names of the changed fields and the number of patches.

## The patch route

The form saves with:

```text
PATCH /api/experiments/{id}/data/{plugin_id}
```

```json
{"client_id": "3f1c9a2e-7b4d", "base_version": 12, "ops": [{"field": "passage", "value": 7}]}
```

| Field | Meaning |
|-------|---------|
| `client_id` | A random id of the browser tab, `^[A-Za-z0-9_-]{8,64}$` |
| `base_version` | The design version that the client shows |
| `ops` | 1 to 64 operations `{field, value}` on top-level fields |

The answer is `{version, missing_required}`. `missing_required` names the root required fields that are still absent. Each patch increments the version.

- The route uses no `If-Match`. The server sets each field on the current design data.
- The permission checks are those of `PUT /api/experiments/{id}/data`.
- One value can be at most 256 KiB as JSON. NaN and infinite numbers are refused.
- The merged document must pass the schema without its root `required` list.
- When other writes change the experiment three times during the check, the route answers 409 `design.concurrent_edit`. Send the patch again.

For all error codes of the route, see [Error codes → Experiments, design data and artifacts](/reference/error-codes#experiments-design-data-and-artifacts).

## Realtime events and presence

Live editing needs the platform `realtime` flag. Without it, the form saves each field but shows no other editors. For the stream and presence composables, see [`useRealtime` and `usePresence`](/sdk/frontend/composables#userealtime-and-usepresence).

- Each stored patch publishes `experiment.design_patch` on the topic `experiment:{id}`. The event has `plugin_id`, the new `version`, `client_id`, `actor_id` and `ops`. `ops` is left out when it is larger than 16 KiB as JSON.
- The event carries design data. A stream gets it only when its role sees the plugin. A refused patch publishes nothing.
- The form sends the presence label `editing:<field>` for the focused field. `<field>` has 1 to 64 letters, digits or underscores.
- Presence labels are kept per browser tab. `GET /api/events` takes `client` (the tab id), and `POST /api/presence/activity` takes the same id as `client_id`. The label applies only to the streams of that tab and ends with them.
- Tabs of the same user never lock each other.

## Build the form on a plugin page

A plugin page can show the same form with `useLiveDesign(experimentId, pluginId, options?)` and `LiveDesignForm` from `@morscherlab/mint-sdk/data`. See [`useLiveDesign`](/sdk/frontend/composables#uselivedesign) and [LiveDesignForm](/sdk/components/live-design-form).

## Two design plugins for one type

When two or more design plugins admit the type of an experiment, the user chooses one. See [Choose a design plugin](/guide/experiments#choose-a-design-plugin).
