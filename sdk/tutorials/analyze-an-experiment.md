# Tutorial 6 — Analyze an Experiment

Build **panel-summary**, an `ANALYSIS` plugin that reads the design of a visible MINT experiment, computes a summary, and saves it as a named analysis artifact on that experiment. The artifact then appears on the experiment page, grouped under this plugin.

This connects Tutorial 1 (a typed calculation) to real platform data. It reads designs published by the **panel-designer** plugin from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables), whose design payload is `{"panel": {"name": ..., "drugs": [...]}}`.

**Prereqs:** Python 3.14+, `uv`, the `mint` CLI from `mint-sdk[cli]==@MINT_VERSION@`, Docker for `mint verify`, and a test MINT platform with panel-designer installed.

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

Generated mode needs no frontend. It still requires `@generated_ui` and at least one `@job`, so the scaffold's `analyze` job stays in place. The experiment analysis below is an ordinary `@endpoint`, because it is triggered for one experiment, not from the generated job form.

## 2. Write the calculation as a plain function

Keep the science free of platform objects, so it can be tested directly. Create `src/mint_plugin_panel_summary/summary.py`:

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
    AnalysisPlugin,
    CurrentExperiment,
    CurrentPluginActor,
    PluginCapabilities,
    PluginType,
    endpoint,
    generated_ui,
    job,
    mint_plugin,
)
from mint_plugin_panel_summary.summary import summarize_panel


@mint_plugin(
    analysis_type="drug-response",
    routes_prefix="/panel-summary",
    plugin_type=PluginType.ANALYSIS,
    capabilities=PluginCapabilities(requires_auth=True, requires_experiments=True),
    icon="M4 19h16M7 16V8m5 8V4m5 12v-6",
)
@generated_ui()
class PanelSummaryPlugin(AnalysisPlugin):
    @job(cpu=1)
    def analyze(self, value: float = 1.0) -> dict[str, float]:
        return {"input": value, "doubled": value * 2}

    @endpoint.post("/experiments/{experiment_id}/summary")
    async def summarize_experiment(
        self,
        experiment: CurrentExperiment,
        actor: CurrentPluginActor,
    ) -> dict[str, object]:
        if not actor.has_permission("experiments.edit"):
            raise HTTPException(status_code=403, detail="Missing permission: experiments.edit")
        design = await self.load_design(experiment.id)
        if design is None:
            raise HTTPException(status_code=404, detail="Experiment has no design data")
        try:
            summary = summarize_panel(design.data)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        artifact = await self.save_analysis_artifact(
            experiment.id,
            summary,
            artifact_key="panel-summary",
            display_name="Panel summary",
        )
        if artifact is None:
            raise HTTPException(status_code=503, detail="Analysis repository is unavailable")
        return {"experiment_id": experiment.id, "artifact_id": artifact.id, "summary": summary}
```

What each piece does:

| Piece | Behavior |
|---|---|
| `CurrentExperiment` | Resolves `experiment_id` from the path, requires `experiments.view`, and returns only an experiment the actor can see and this plugin is allowed to use. Missing or invisible experiments return 404; without a platform context it returns 503 |
| `self.load_design()` | Reads the experiment's design data (`DesignData`); `design.data` is the owner's JSON payload. It returns `None` when there is no design |
| `self.save_analysis_artifact()` | Saves a named artifact under this plugin's ID. Saving again with the same `artifact_key` replaces it |
| `PluginType.ANALYSIS` | Grants the default `analysis_result_write` policy; it cannot change the design or create experiments |

The `experiments.edit` check is a route decision: it limits who may attach results. Reading another plugin's **design** needs no reader declaration. Reading another plugin's **analysis artifacts** does; see `analysis_result_readers` in [PlatformContext](/sdk/concepts/platform-context#cross-plugin-readers).

To list experiments instead of addressing one, use `self.context.get_experiment_repository().list_all(limit=50)`, which returns `(experiments, total)` for the visible, type-compatible experiments.

## 4. Test the calculation and the standalone boundary

Replace `tests/test_plugin.py`:

```python
import pytest
from fastapi.testclient import TestClient
from mint_sdk.app import create_standalone_app
from mint_sdk.testing import PluginTestHarness

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
    with PluginTestHarness(PanelSummaryPlugin) as harness:
        assert harness.run("analyze", value=2.5).value == {"input": 2.5, "doubled": 5.0}


def test_summary_route_requires_the_platform() -> None:
    with TestClient(create_standalone_app(PanelSummaryPlugin, environ={})) as client:
        response = client.post("/api/panel-summary/experiments/1/summary")
    assert response.status_code == 503
```

Standalone mode has no platform context, so `CurrentExperiment` returns 503 instead of pretending an experiment exists. Test the platform path after deployment.

```bash
uv run pytest -q
mint doctor --strict
```

## 5. Verify and deploy

```bash
mint verify .
mint auth login --url https://mint-test.example.org
mint deploy . --to https://mint-test.example.org
```

`mint verify` builds the bundle, boots the MINT platform image in Docker, installs the bundle through the normal upload path, restarts, and waits until the plugin loads. `mint deploy` uploads the same bundle to a test platform you administer, restarts it (requires `platform.configure`), and confirms the restart by the new server `boot_id`; `--timeout` (default 180 s) covers restart and load together.

On the test platform:

1. Allow this plugin to use the experiment type that panel-designer creates.
2. Publish a panel to an experiment with panel-designer ([Tutorial 3](/sdk/tutorials/design-plugin-with-tables)).
3. Call the route as a user with `experiments.edit`:

```bash
curl -X POST https://mint-test.example.org/api/panel-summary/experiments/<experiment_id>/summary \
  -H "Authorization: Bearer <token>"
```

4. Open the experiment page and check that a **Panel summary** artifact appears under Panel Summary.
5. Repeat as a user without `experiments.edit` (403) and with an experiment the user cannot see (404).

> [Screenshot: experiment page showing the Panel summary artifact grouped under the Panel Summary plugin]

## Next

- [Writing results](/sdk/recipes/writing-results) — file-backed artifacts, batches, archive and restore
- [Reading experiments](/sdk/recipes/reading-experiments) — listing and filtering visible experiments
- [Data model](/sdk/concepts/data-model) — design data, artifacts, and ownership
