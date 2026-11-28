# Plugin panels

Show the data of your plugin on the experiment page, without a frontend. A panel is a tab in the **Design data** card or in the **Analysis artifacts** card. The plugin returns sections of fixed kinds. The platform checks the data and draws it. No plugin code runs in the platform page.

Use a panel for a short summary, a status, a table or a plate layout. Keep interactive work on the plugin page, and add a `link` section to that page.

Panels need MINT 1.6 and `mint-sdk` 1.6 or later.

## Declare a panel

Decorate an async method with `@panel` from `mint_sdk.panels`. The method takes `(self, experiment_id: int)` and returns a list of sections.

This plugin is `examples/plugin-panels` in the MINT repository (shortened). It has no frontend:

```python
from mint_sdk import Design, Job, Metadata, Plugin, job, plugin
from mint_sdk.instruments import BarSeries
from mint_sdk.jobs import ExperimentRef
from mint_sdk.panels import (
    Action, BarPanel, KeyValuePanel, PanelSection, PlateGroup, PlatePanel, PlateWell,
    StatePanel, TablePanel, TextPanel, panel,
)
from pydantic import BaseModel, Field

GROUPS = [
    PlateGroup(id="sample", label="Samples"),
    PlateGroup(id="blank", label="Blanks", role="blank"),
    PlateGroup(id="qc", label="Pooled QC", role="qc"),
]


class ScoreInputs(BaseModel):
    experiment_id: ExperimentRef
    threshold: float = Field(0.7, ge=0, le=1)


class ScorePlate(Job):
    id = "score-plate"
    title = "Score plate"
    timeout = 60


class PlateQc(Metadata):
    domain = "example"
    title = "Plate QC"
    prefix = "/plate-qc"
    writes = {"design", "artifacts"}
    design = Design(version="1.0", schema=PlateDesign, live=True)
    analysis_offer = False


@plugin(PlateQc)
class PlateQcPlugin(Plugin):
    @panel("layout", slot="experiment.design", title="Plate layout")
    async def layout(self, experiment_id: int) -> list[PanelSection]:
        design = await self.plate_design(experiment_id)
        if design is None:
            return [StatePanel(state="info", label="Enter the number of samples")]
        wells = plate_layout(design)
        return [
            KeyValuePanel(title="Plate", items=[("Samples", design.sample_count)]),
            StatePanel(state="success", label=f"{len(wells)} of 96 wells used"),
            PlatePanel(
                title="Layout",
                groups=GROUPS,
                wells=[PlateWell(well=well, group=group, label=label) for well, group, label in wells],
            ),
        ]

    @panel(
        "qc",
        slot="experiment.analysis",
        title="QC scores",
        actions=[Action("Score plate", job="score-plate", inputs={"threshold": 0.7})],
    )
    async def qc(self, experiment_id: int) -> list[PanelSection]:
        artifact = await self.artifacts.get(experiment_id, "scores")
        if artifact is None:
            return [StatePanel(state="neutral", label="Not scored yet")]
        wells = artifact.result["wells"]
        return [
            TablePanel(
                title="Scores",
                columns=["Well", "Sample", "Score"],
                rows=[{"Well": w["well"], "Sample": w["label"], "Score": w["score"]} for w in wells],
                column_types={"Well": "mono"},
            ),
            BarPanel(
                title="Mean score by group",
                categories=[group.label for group in GROUPS],
                series=[BarSeries(name="Mean score", values=group_means(wells))],
                width="two-thirds",
            ),
            TextPanel(title="Method", text="A sample passes with a score of at least 0.7.", width="third"),
        ]

    @job(ScorePlate)
    async def score_plate(self, inputs: ScoreInputs) -> dict[str, int]:
        ...
```

The full example also shows `json`, `link` and `status` sections. Source: [`examples/plugin-panels`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/examples/plugin-panels/src/plate_qc/plugin.py).

## `@panel` arguments

`@panel(panel_id, *, slot, title, access="use", experiment_types=None, actions=())`

| Argument | Meaning |
|----------|---------|
| `panel_id` | Matches `^[a-z][a-z0-9_-]{0,39}$` and is unique in the plugin. The id is part of the page URL and of the MCP address. Keep it stable |
| `slot` | `"experiment.design"` (the **Design data** card) or `"experiment.analysis"` (the **Analysis artifacts** card) |
| `title` | The tab label, at most 40 characters |
| `access` | The level a viewer needs on this plugin: `"use"`, `"configure"` or `"admin"`. See [Access levels](/sdk/api/python#access-levels) |
| `experiment_types` | Limits the panel to these experiment types. `None` shows it for every type that the plugin admits |
| `actions` | Buttons on the tab. See [Actions](#actions) |

A wrong argument raises `TypeError` when Python defines the class.

Rules for the slot:

- A design-slot panel shows only for the design plugin of the experiment: the plugin that owns the stored design data. The plugin must have `"design"` in `Metadata.writes`.
- A design-slot panel shows only when the experiment has design data.
- An analysis-slot panel shows for every plugin that admits the experiment type.

## Section kinds

Each section has a `kind`. Import the models from `mint_sdk.panels`.

| Model | `kind` | Content |
|-------|--------|---------|
| `KeyValuePanel` | `kv` | Label and value pairs (`items`) |
| `TablePanel` | `table` | `columns` and one JSON object per row (`rows`). `column_types` sets a column to `"text"`, `"number"` or `"mono"` |
| `TextPanel` | `text` | Plain text |
| `JsonPanel` | `json` | A JSON value, shown as a collapsed tree |
| `BarPanel` | `bar` | A bar chart: `categories` and one or more `BarSeries` (`mint_sdk.instruments`) |
| `LinkPanel` | `link` | `label` and `href`: an `http://` or `https://` URL, or a page of the plugin under `/plugin/<prefix>` |
| `StatePanel` | `status` | `state` (`success`, `warning`, `error`, `info`, `neutral`), `label`, optional `detail` and `at` (an aware `datetime`) |
| `PlatePanel` | `plate` | A read-only plate: `format` (`54`, `96` default, or `384`), `groups`, `wells`, `color_by` (`"group"` or `"value"`), `highlight`, `value_label` |

`format=54` is a 54-vial autosampler rack: rows `A` to `F`, positions 1 to 9 (wells `A1` to `F9`). A well outside the plate raises `ValidationError`.

A plate has at most 9 `PlateGroup`s. The platform gives the groups their colours in declaration order. A group with `role="blank"` has a dashed outline. A group with `role="qc"` has a "Q" marker. Each `PlateWell` names a declared group. With `color_by="value"`, at least one well needs a `value`.

### Width

Every section takes `width`: `"full"` (default), `"two-thirds"`, `"half"` or `"third"`. The sections fill rows of six columns in declaration order: `full` takes 6, `two-thirds` 4, `half` 3 and `third` 2. A section that does not fit starts the next row. In a panel narrower than 53rem, every section takes the full width.

### Limits

| Limit | Value |
|-------|-------|
| Sections per answer | 20 |
| Answer size | 128 KiB |
| Table | 200 rows, 20 columns. The page shows 20 rows, then **Show all N rows** |
| Text | 20,000 characters |
| Handler time | 10 s in-process, 15 s for a plugin process |

- A `link` under `/plugin/` must stay under the plugin's own prefix.
- A section of a kind that the platform does not know shows "This section needs a newer MINT version".
- A plugin page can draw the same sections with the frontend component [PanelSections](/sdk/components/panel-sections).

## Read data as the viewer

The platform calls the handler as the user who opens the tab. `self.design`, `self.artifacts` and `self.context.experiments` read only what that user may read. Plugin tables have no platform scope: filter them yourself, see [Querying plugin data](/sdk/recipes/querying-plugin-data#read-within-a-scoped-session).

Return a `StatePanel` when data is missing, as in the `layout` panel above. A live design can be incomplete; see [Live design forms](/sdk/recipes/live-design#handle-saves-in-the-plugin).

## Actions

An `Action(title, job, inputs={})` is a button on the tab. It starts a `@job` of the same plugin for the experiment.

- The job takes one input of type `ExperimentRef` (`mint_sdk.jobs`). The page sets it to the experiment id.
- `inputs` gives fixed JSON values for other inputs. Each input that `inputs` leaves out needs a default.
- A staged job cannot be an action.
- `@plugin` raises `TypeError` for an action whose job is missing, is staged, or breaks these rules. The plugin then does not load, and `mint doctor` reports the error under "Panels".

A viewer below the job's `access` level does not see the button. Set `Job.effect` to what the job changes: `"read"`, `"write"` (default) or `"destructive"`. For a destructive job, the page and MCP `mint_start_job` ask the user to confirm first.

```python
class Rescore(Job):
    title = "Rescore plate"
    effect = "destructive"
```

While the job runs, the button shows a running state, and a second click starts no second job. Progress and errors show in the jobs tray. More than 3 actions go into one **Actions** menu. For what users see, see [Plugin tabs](/guide/experiments#plugin-tabs).

## Turn off the analysis offer

The **Analysis artifacts** card offers to start each analysis plugin. A plugin that only shows panels has nothing to start there. Set `analysis_offer = False` on the `Metadata` class:

```python
class PlateQc(Metadata):
    analysis_offer = False
```

`mint doctor` shows a hint for an analysis plugin that keeps the offer on and has no page, frontend, generated UI or `@job`.

## Read a panel without the page

The platform serves each panel at:

```text
GET /api/experiments/{experiment_id}/panels/{plugin}/{panel_id}
```

The answer is `{plugin, panel, experiment_id, sections, built_at}` with `Cache-Control: no-store`. The caller needs `experiments.view` and a visible experiment. For the refusal codes (`plugin.panel_*`, `plugin.not_visible`, `plugin.permission_denied`), see [Error codes → Plugins](/reference/error-codes#plugins). `plugin.panel_not_found` also covers a panel that does not apply to the experiment type, and a design-slot panel of a plugin that is not the design plugin. For an invalid section, the `details` of `plugin.panel_invalid` names its index.

MCP serves each panel as a resource with the same checks; see [Panels and jobs over MCP](/sdk/recipes/mcp-tools#panels-and-jobs-over-mcp).

A plugin in its own process serves its panels at `POST /__mint/panels/{id}`. The SDK app adds this route.

## Refresh

The page loads a tab when the user selects it. It loads the tab again on the refresh button, on a selection more than 30 s after the last load, and when an action's job ends. It also loads again 2 s after the last design change (design slot) or artifact change (analysis slot).

## Test a panel

Call the panel with `Harness.panel`; see [Testing plugins → Panels](/sdk/recipes/testing-plugins#panels). The MINT repository tests the full example in `packages/sdk-python/tests/test_plugin_panels_example.py`.

## `mint doctor` checks

The "Panels" check warns about:

- a panel id of the latest git tag that is gone (deep links and MCP addresses to it break);
- `experiment_types` of a panel outside `Metadata.experiment_types`;
- a design-slot panel of a plugin without `"design"` in `writes` (the panel never shows).

For all symbols, see [Python SDK reference → Panels](/sdk/api/python#panels). For the design decision, see the [RFC: plugin panels](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/decisions/2026-11-18-plugin-panels.md).
