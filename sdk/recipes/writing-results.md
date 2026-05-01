# Writing results

## Goal

Persist analysis output back to the platform so it shows up under the experiment's **Results** tab and is discoverable by other plugins.

## The simplest case

Use the convenience method:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        # ... compute the result dict ...
        result = {"method": "v4", "n_peaks": 312, "score": 0.92}
        await self.save_analysis(experiment_id, result)
```

`save_analysis` writes to `PluginAnalysisResult` keyed by `(experiment_id, plugin_id)`. The `plugin_id` defaults to `metadata.name`. Override `AnalysisPlugin.plugin_id` if you need a different storage key.

## Preserve run history

`save_analysis` is **upsert** — calling it again with the same `(experiment_id, plugin_id)` overwrites the previous row. To keep history, embed runs as a list:

```python
from datetime import datetime, UTC

class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        previous = await self.load_analysis(experiment_id)
        history = (previous.result.get("runs") if previous else []) or []

        new_run = {
            "run_id": datetime.now(UTC).isoformat(),
            "method": "v4",
            "n_peaks": 312,
            "user_id": self._current_user_id(),
        }
        history.append(new_run)

        await self.save_analysis(experiment_id, {
            "latest": new_run,
            "runs": history[-50:],   # cap to last 50 runs
        })
```

A separate `latest` key is convenient for downstream consumers that don't want to read the whole history.

## Save design and analysis together

For plugins that act on their own design data (rare, but useful for self-contained pipelines):

```python
class MyPlugin(AnalysisPlugin):
    async def configure_and_run(self, experiment_id: int, params: dict):
        result = await self._compute(experiment_id, params)
        await self.save(
            experiment_id,
            design={"params": params},
            analysis={"latest": result},
        )
```

`save()` returns `(DesignData | None, PluginAnalysisResult | None)`.

## Bulk write across experiments

The convenience methods are scoped to one experiment. For batch operations, drop down to the repo:

```python
class MyPlugin(AnalysisPlugin):
    async def batch_save(self, results: dict[int, dict]):
        repo = self._context.get_plugin_data_repository()
        for experiment_id, result in results.items():
            await repo.save_analysis_result(
                experiment_id=experiment_id,
                plugin_id=self.plugin_id,
                result=result,
            )
```

The repo doesn't ship a multi-row `save_many` method by design — most write paths benefit from the per-experiment hooks (`on_after_experiment_save`, etc.) firing one at a time. If your workflow legitimately needs bulk insert, implement it directly via `get_shared_db_session()` on a plugin-owned table.

## Idempotency under retry

If your analysis is triggered by a queue or scheduler that may retry on failure, use a stable run ID:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int, *, request_id: str):
        previous = await self.load_analysis(experiment_id)
        existing_runs = (previous.result.get("runs") if previous else []) or []
        if any(r["run_id"] == request_id for r in existing_runs):
            return  # already done; don't append a duplicate

        # ... compute and save ...
```

`request_id` can be the platform's `X-Request-Id`, a job ID from your queue, or any other deterministic identifier.

## Surfacing results in the experiment UI

The platform's experiment **Results** tab automatically renders every plugin's `PluginAnalysisResult.result`. Default rendering uses `AnalysisPlugin.export_tree()` / `export_summary()` / `export_csv()`, which produce sensible defaults via the SDK's `auto_json_to_*` helpers. Override these to customize the display:

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

## Referencing produced artifacts

If your analysis produces a file (CSV report, image, raw output blob), embed the **artifact ID** in the result JSON so the frontend can render a download link:

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        csv_bytes = self._compute_report(experiment_id)
        artifact_id = await self._upload_via_platform_rest_api(
            csv_bytes, filename="report.csv"
        )
        await self.save_analysis(experiment_id, {
            "report_artifact_id": artifact_id,
        })
```

The artifact upload mechanism is platform-version-specific. The SDK's `MINTClient` does not currently expose a `client.artifacts` resource; uploads go through the platform's REST API directly. Read your installed platform's `/api` schema (browse `/docs` on a running platform) for the current upload endpoint shape.

## Notes

- `result` is JSON. Serialize complex Python objects yourself (datetimes, dataclasses, NumPy) — the SDK doesn't auto-convert.
- Results are **per-plugin per-experiment**. Two analysis plugins running on the same experiment have independent rows; neither sees the other's writes.
- For large outputs (megabytes of peak data per run), consider writing to plugin-owned tables instead — JSON columns aren't ideal for queries or bulk reads. See [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data).

## Related

- [Concepts → Data model](/sdk/concepts/data-model) — `PluginAnalysisResult` shape
- [Recipes → Reading experiments](/sdk/recipes/reading-experiments) — read side
