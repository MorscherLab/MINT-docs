# Live design forms

Let users edit the design data of your plugin directly on the experiment page. With `Design(live=True)`, the platform draws a form from the design schema. Each field saves by itself, and the form shows who else edits a field. The plugin needs no frontend.

Live design forms need MINT 1.6 and `mint-sdk` 1.6 or later.

## When to use it

| Use a live design | Use a plugin page |
|-------------------|-------------------|
| The design is a set of top-level values: text, numbers, choices, switches | The design needs a plate editor, a table of samples or other interaction |
| Two people may fill in different fields at the same time | One person fills in the design and saves it at once |
| The plugin has no frontend | The plugin has a frontend |

A plugin can do both. When it has a page and a live design, the experiment page shows the form in the **Design data** card and the **Open in &lt;plugin&gt;** button to the page.

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

The form edits the top-level properties of the schema:

| Schema type | Control |
|-------------|---------|
| `string` | Text field |
| `string` with `enum` | Selection |
| `integer`, `number` | Number field |
| `boolean` | Switch. A field without a value shows "Not set" |
| `array`, `object` | Read-only JSON. Another plugin or a full save can still write it |

`title` becomes the label and `description` the hint. The header of the card shows the save state (`Saved`, `Unsaved`, `Saving…`, `Offline · retry in N s`, `N changes not saved`, `View only`) and `N required left` for the empty fields of the root `required` list.

- A field saves 1 s after the last edit, or when it loses the focus. There is no Save button.
- A field that another user edits is read-only for all other users until that user's value is stored. The field shows the avatar of that user.
- Edits of different fields by two users both stay. For one field, the last write wins. A list is one field: a later save replaces the whole list.
- A refused value stays in its field with the message and a **Discard** action. The form never sends a refused value again by itself.
- There is no operation that removes a field. To clear a field, the form sends `null` or `''`.

A user who cannot change the design data, or who does not have `plugins.use`, sees the form read-only. On the experiment page, the owner of the experiment with `experiments.edit`, or an administrator, can change it.

## Handle saves in the plugin

Each field save is a patch. A live design can be incomplete: a patch does not enforce the root `required` list of the schema. Every reader of the design data must accept a document without those fields. Read the design data with that in mind, also in [panels](/sdk/recipes/panels) and jobs.

| Event | What the plugin gets for a patch |
|-------|-----------------------------------|
| `experiment.before_save` | Runs for each patch and can veto it with `EventVetoException`. `event.data` is `{"plugin_id", "data", "ops"}`: `data` is the whole design with the patch applied, `ops` is the list of `{"field", "value"}`. The handler gets a copy: a change to it changes nothing. When another write changes the experiment during the check, the handler gets the patch again with the new `data` |
| `experiment.after_save` | Comes once, 30 s after the last patch of a user, and at least every 5 min while the user keeps editing. `data` and `version` are the design stored at delivery |

A full save (`PUT /api/experiments/{id}/data`, `design.save`, MCP `mint_save_design`) validates the full schema and keeps the immediate `experiment.after_save`. Each handler also gets the events of other design plugins: check `event.data["plugin_id"]`.

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

The answer is `{version, missing_required}`. `missing_required` names the root required fields that are still absent. Each patch increments the version. The route uses no `If-Match`: the server sets each field on the current design data. The permission checks are those of `PUT /api/experiments/{id}/data`.

| Status | Code | Cause |
|--------|------|-------|
| 409 | `design.not_live` | The plugin has no live design or no schema |
| 409 | `design.concurrent_edit` | Other writes changed the experiment three times during the check. Send the patch again |
| 422 | `design.unknown_field` | The field is not a property of the schema |
| 422 | `design.value_too_large` | A value is larger than 256 KiB as JSON |
| 422 | `design.value_not_finite` | A value holds NaN or an infinite number |
| 422 | `design.invalid` | The merged document fails the schema (without its root `required` list) |
| 422 | `design.vetoed` | An `experiment.before_save` handler refused the patch |

## Realtime events and presence

Live editing needs the platform `realtime` flag. Without it, the form saves each field but shows no other editors.

Each stored patch publishes `experiment.design_patch` on the topic `experiment:{id}`. The event has `plugin_id`, the new `version`, `client_id`, `actor_id` and `ops`. `ops` is left out when it is larger than 16 KiB as JSON. The event carries design data, so a stream gets it only when its role sees the plugin. A refused patch publishes nothing.

Presence on an experiment topic accepts the label `editing:<field>`, where `<field>` has 1 to 64 letters, digits or underscores. The form sends it for the focused field. A stream whose role cannot see the design plugin gets the label as `editing`.

Presence labels are kept per browser tab. `GET /api/events` takes `client` (the tab id) and `POST /api/presence/activity` takes the same id as `client_id`. The label applies only to the streams of that tab and ends with them. A user with several tabs shows the strongest label: `editing:<field>`, then `editing`, then another label, then `viewing`. Tabs of the same user never lock each other.

## Build the form on a plugin page

A plugin page can show the same form. `useLiveDesign(experimentId, pluginId, options?)` and `LiveDesignForm` are on `@morscherlab/mint-sdk/data`. `useLiveDesign` keeps the field states, sends the patches, follows `experiment.design_patch` and sends the presence label. `LiveDesignForm` draws its result in a `SectionCard`. See [LiveDesignForm](/sdk/components/live-design-form) and [Composables](/sdk/frontend/composables).

## Two design plugins for one type

When two or more design plugins admit the type of an experiment without design data, the experiment page lets the user choose the plugin. The first save makes the chosen plugin the design owner. See [Experiments → Choose a design plugin](/guide/experiments#choose-a-design-plugin).

## Related

- [Plugin panels](/sdk/recipes/panels)
- [Data model → `DesignData`](/sdk/concepts/data-model#designdata)
- [Python SDK reference → Design schema](/sdk/api/python#design-schema)
- [Plugin communication → Experiment events](/sdk/concepts/plugin-communication#experiment-events)
