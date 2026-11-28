# Tutorial 6 — Analyze an Experiment

Build `panel-summary`, an analysis plugin that reads the design of a visible MINT experiment, computes a summary and saves it as a named artifact on that experiment. The artifact shows on the experiment page under this plugin.

The plugin reads the designs that `panel-designer` from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables) publishes. Their payload is `{"panel": {"name": ..., "drugs": [...]}}`.

Prerequisites: the toolchain from [Install the toolchain](/sdk/install), Docker for `mint verify`, and a test MINT platform with `panel-designer` installed.

## 1. Scaffold a generated plugin

```bash
mint init panel-summary \
  --name "Panel Summary" \
  --description "Summarize published drug panels" \
  --mode generated \
  --type analysis \
  --yes
cd panel-summary
```

Generated mode needs no frontend. It sets `ui = "generated"` and needs at least one `@job`, so keep the `analyze` job of the scaffold. The experiment analysis below is an ordinary `@endpoint`, because it runs for one experiment and not from the generated job form.

## 2. Write the calculation as a plain function

Keep the calculation free of platform objects, so that you can test it directly. Create `src/mint_plugin_panel_summary/summary.py`:

```python
from typing import Any


def summarize_panel(design: dict[str, Any]) -> dict[str, Any]:
    """Summarize a panel-designer design payload."""
    panel = design.get("panel")
    if not isinstance(panel, dict):
        raise ValueError("Design has no 'panel' section")
    drugs = panel.get("drugs") or []
    doses = [float(dose) for drug in drugs for dose in drug.get("doses_uM", [])]
    return {
        "panel_name": panel.get("name"),
        "drug_count": len(drugs),
        "dose_count": len(doses),
        "min_dose_uM": min(doses) if doses else None,
        "max_dose_uM": max(doses) if doses else None,
    }
```

## 3. Read the experiment and save an artifact

Replace `src/mint_plugin_panel_summary/plugin.py`:

```python
from fastapi import HTTPException
from mint_sdk import (
    CurrentActor,
    CurrentExperiment,
    Metadata,
    Plugin,
    endpoint,
    job,
    plugin,
)

from mint_plugin_panel_summary.summary import summarize_panel


class PanelSummaryMeta(Metadata):
    domain = "drug-response"
    title = "Panel Summary"
    icon = "M4 19h16M7 16V8m5 8V4m5 12v-6"
    ui = "generated"


@plugin(PanelSummaryMeta)
class PanelSummaryPlugin(Plugin):
    @job()
    def analyze(self, value: float = 1.0) -> dict[str, float]:
        return {"input": value, "doubled": value * 2}

    @endpoint.post("/experiments/{experiment_id}/summary")
    async def summarize_experiment(
        self,
        experiment: CurrentExperiment,
        actor: CurrentActor,
    ) -> dict[str, object]:
        if not actor.has_permission("experiments.edit"):
            raise HTTPException(status_code=403, detail="Missing permission: experiments.edit")
        design = await self.design.get(experiment.id)
        if design is None:
            raise HTTPException(status_code=404, detail="Experiment has no design data")
        try:
            summary = summarize_panel(design.data)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        artifact = await self.artifacts.save(
            experiment.id, summary, "panel-summary", name="Panel summary",
        )
        return {"experiment_id": experiment.id, "artifact_id": artifact.id, "summary": summary}
```

- `CurrentExperiment` resolves the experiment of the path; see [Request-scoped access](/sdk/concepts/platform-context#request-scoped-access).
- `self.design.get()` returns the design data (`DesignData`), or `None` when there is no design. `design.data` is the JSON payload of the design owner.
- `self.artifacts.save()` saves a named artifact under the ID of this plugin; see [Writing results](/sdk/recipes/writing-results).
- The default write set `{"artifacts"}` lets the plugin write analysis results. It cannot change the design or create experiments.

The `experiments.edit` check is a decision of this route: it limits who can attach results. A plugin can read the design of another plugin without a declaration. To read the analysis artifacts of another plugin, declare it in `reads_from`; see [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers).

To list experiments, use `self.context.experiments.list(limit=50)`. It returns the visible experiments whose type the plugin supports.

## 4. Test the calculation and the standalone boundary

Replace `tests/test_plugin.py`:

```python
import pytest
from mint_sdk.testing import Harness

from mint_plugin_panel_summary.plugin import PanelSummaryPlugin
from mint_plugin_panel_summary.summary import summarize_panel


def test_summarize_panel_counts_drugs_and_doses() -> None:
    design = {"panel": {"name": "Pilot", "drugs": [
        {"name": "Cisplatin", "doses_uM": [0.1, 1, 10]},
        {"name": "Etoposide", "doses_uM": [5]},
    ]}}
    assert summarize_panel(design) == {
        "panel_name": "Pilot", "drug_count": 2, "dose_count": 4,
        "min_dose_uM": 0.1, "max_dose_uM": 10.0,
    }


def test_summarize_panel_rejects_designs_without_a_panel() -> None:
    with pytest.raises(ValueError):
        summarize_panel({"samples": []})


def test_generated_job_still_runs() -> None:
    with Harness(PanelSummaryPlugin) as harness:
        run = harness.run(PanelSummaryPlugin.analyze, value=2.5)
    assert run.value == {"input": 2.5, "doubled": 5.0}


def test_summary_route_requires_the_platform() -> None:
    with Harness(PanelSummaryPlugin) as harness:
        response = harness.client.post("/api/panel-summary/experiments/1/summary")
    assert response.status_code == 503
```

Standalone mode has no platform context, so `CurrentExperiment` returns 503. Test the platform path after deployment.

```bash
uv run pytest -q
mint doctor --strict
uv run mint lint
```

## 5. Verify and deploy

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying).

On the test platform:

1. Make sure that this plugin may use the type of the target experiment. By default a plugin may use every type. If an admin limited the experiment types of this plugin, add the type in its access control.
2. Publish a panel to an experiment with panel-designer ([Tutorial 3](/sdk/tutorials/design-plugin-with-tables)).
3. Call the route as a user with `experiments.edit`:

```bash
curl -X POST https://mint-test.example.org/api/panel-summary/experiments/<experiment_id>/summary \
  -H "Authorization: Bearer <token>"
```

4. Open the experiment page. Check that a **Panel summary** artifact shows on the **Artifacts** tab of the **Analysis artifacts** card, under **Panel Summary**.
5. Call the route as a user without `experiments.edit`. Expect 403.
6. Call the route with an experiment that the user cannot see. Expect 404.

![Experiment page with the Panel summary artifact under the Panel Summary plugin on the Artifacts tab of the Analysis artifacts card](/screenshots/sdk/analyze-an-experiment-artifact.webp)

## Next

- [Writing results](/sdk/recipes/writing-results): file-backed artifacts, batches, archive and restore.
- [Reading experiments](/sdk/recipes/reading-experiments): list and filter visible experiments.
