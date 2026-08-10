# Writing results

## Goal

Persist analysis output back to the platform so it shows up under the experiment's **Analysis artifacts** card and is discoverable by other plugins.

## The simplest case

Use a named analysis artifact:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        # ... compute the result dict ...
        result = {"method": "v4", "n_peaks": 312, "score": 0.92}
        await self.save_analysis_artifact(
            experiment_id,
            result,
            artifact_key="summary",
            display_name="Peak summary",
        )
```

`save_analysis_artifact()` writes an `AnalysisArtifact` keyed by `(experiment_id, plugin_id, artifact_key)`. Saving the same key again updates that named output; saving different keys lets one plugin publish separate outputs such as `summary`, `qc-report`, and `peak-table`.

`save_analysis()` is still available as the compatibility path for older plugins that store one `PluginAnalysisResult` per experiment/plugin pair, but new user-visible outputs should use analysis artifacts.

## Preserve run history

Artifact saves are **upserts** per `artifact_key`. To keep a visible history, use a stable key per run or per output:

```python
from datetime import datetime, UTC

class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        run_id = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        new_run = {
            "run_id": run_id,
            "method": "v4",
            "n_peaks": 312,
            "user_id": self._current_user_id(),
        }

        await self.save_analysis_artifact(
            experiment_id,
            new_run,
            artifact_key=f"run-{run_id}",
            display_name=f"Run {run_id}",
        )
```

For very long histories or query-heavy run records, use a plugin-owned table and publish only the latest summary or downloadable report as an analysis artifact.

## Save design and analysis together

For `FULL` plugins that legitimately own both design data and analysis results (rare, but useful for self-contained pipelines):

```python
class MyPlugin(AnalysisPlugin):
    async def configure_and_run(self, experiment_id: int, params: dict):
        result = await self._compute(experiment_id, params)
        await self.save(experiment_id, design={"params": params})
        await self.save_analysis_artifact(
            experiment_id,
            {"latest": result},
            artifact_key="latest",
            display_name="Latest result",
        )
```

`save()` returns `(DesignData | None, PluginAnalysisResult | None)` for the compatibility path. `ANALYSIS` plugins should save artifacts, `EXPERIMENT_DESIGN` plugins should save design data, and `STATIC` plugins should not call either write path.

## Bulk write across experiments

The convenience methods are scoped to one experiment. For batch operations, drop down to the repo:

```python
class MyPlugin(AnalysisPlugin):
    async def batch_save(self, results: dict[int, dict]):
        for experiment_id, result in results.items():
            await self.save_analysis_artifact(
                experiment_id,
                result,
                artifact_key="batch-summary",
                display_name="Batch summary",
            )
```

For multiple artifacts on one experiment, pass `AnalysisArtifactInput` objects to `save_analysis_artifacts()`; the SDK commits all of them or rolls the whole batch back. For cross-experiment bulk inserts, keep the per-experiment loop above or write query-heavy data to a plugin-owned table via `get_shared_db_session()`.

## Idempotency under retry

If your analysis is triggered by a queue or scheduler that may retry on failure, use a stable run ID:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int, *, request_id: str):
        existing = await self.load_analysis_artifact(
            experiment_id,
            artifact_key=f"run-{request_id}",
        )
        if existing:
            return  # already done; don't append a duplicate

        # ... compute and save ...
```

`request_id` can be the platform's `X-Request-Id`, a job ID from your queue, or any other deterministic identifier.

## Surfacing results in the experiment UI

The platform experiment page lists every active analysis artifact in the **Analysis artifacts** card. The card shows the producing plugin, artifact key, display name, status, result keys, and open/download/archive actions. Use the source plugin page for rich interactive visualization; the platform can always download the artifact payload as JSON.

Compatibility `PluginAnalysisResult` exports still use `AnalysisPlugin.export_tree()` / `export_summary()` / `export_csv()`:

```python
class MyPlugin(AnalysisPlugin):
    def export_summary(self, data: dict) -> dict:
        return {
            "metadata": {
                "method": data.get("method"),
                "score": data.get("score"),
            },
            "sections": [
                {"title": "Peaks", "kind": "table", "rows": data.get("peaks", [])},
            ],
        }
```

The frontend reads the summary structure and renders cards / tables / metric tiles.

## Saving file-backed artifacts

If your analysis produces a file (CSV report, image, raw output blob), use `save_analysis_file_artifact()` so the SDK uploads the bytes or reuses an existing object-store reference, then saves artifact metadata:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        csv_bytes = self._compute_report(experiment_id)
        await self.save_analysis_file_artifact(
            experiment_id,
            csv_bytes,
            filename="report.csv",
            artifact_key="report",
            kind="csv",
            display_name="CSV report",
            metadata={"rows": 1240},
        )
```

Later, stream the file back out:

```python
await self.load_analysis_file_artifact(
    experiment_id,
    "/tmp/report.csv",
    artifact_key="report",
)
```

Older plugins may still store file references under `result["artifacts"]` and read them with `load_artifacts()`. Prefer file-backed analysis artifacts for new code.

## Notes

- `result` is JSON. Serialize complex Python objects yourself (datetimes, dataclasses, NumPy) — the SDK doesn't auto-convert.
- Artifacts are **per-plugin per-experiment per-key**. Two analysis plugins running on the same experiment have independent artifacts, and one plugin can save multiple artifact keys. `load_analysis_artifacts()` defaults to the calling plugin's own artifacts; pass `include_others=True` only for reader plugins that intentionally aggregate results from declared plugins.
- For large outputs (megabytes of peak data per run), consider writing to plugin-owned tables instead — JSON columns aren't ideal for queries or bulk reads. See [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data).

## Related

- [Concepts → Data model](/sdk/concepts/data-model) — `AnalysisArtifact` and compatibility `PluginAnalysisResult` shapes
- [Recipes → Reading experiments](/sdk/recipes/reading-experiments) — read side
