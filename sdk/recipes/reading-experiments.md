# Reading experiments

## Goal

Read experiments from inside a plugin: fetch one by ID, list with filters, paginate.

## Get one by ID

```python
from fastapi import HTTPException, status

class MyPlugin(AnalysisPlugin):
    async def get_experiment(self, experiment_id: int):
        repo = self._context.get_experiment_repository()
        experiment = await repo.get_by_id(experiment_id)
        if experiment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Experiment {experiment_id} not found",
            )
        return experiment
```

`get_by_id` returns an `Experiment` dataclass or `None`. At the route boundary, map `None` to `HTTPException` so the client gets a real 404.

## List with filters

```python
class MyPlugin(AnalysisPlugin):
    async def list_ongoing_in_project(self, project: str):
        repo = self._context.get_experiment_repository()
        experiments, total = await repo.list_all(
            status="ongoing",
            project=project,
            skip=0,
            limit=50,
        )
        return {"items": experiments, "total": total}
```

`list_all` returns `(list[Experiment], total_count)`. The available filters are:

| Param | Effect |
|-------|--------|
| `skip`, `limit` | Pagination — default 0 / 100 |
| `status` | `"planned"` / `"ongoing"` / `"completed"` / `"cancelled"` |
| `experiment_type` | Match the design plugin's type string |
| `project` | Project name (string match) |
| `created_by` | User ID |
| `parent_experiment_id` | For nested experiments |
| `search` | Free-text against name and notes |

The platform repository also accepts `project_id`, `sort_by`, `sort_order`, `created_after`, and `created_before`; those are not part of the public SDK protocol yet, so use them only after checking your installed platform version.

## Paginate cleanly

```python
async def all_completed(repo) -> list[Experiment]:
    out = []
    skip = 0
    while True:
        page, total = await repo.list_all(status="completed", skip=skip, limit=200)
        out.extend(page)
        skip += len(page)
        if skip >= total or not page:
            break
    return out
```

For very large result sets, prefer streaming via the platform's REST client — the in-process repo loads each page into memory.

## Read with the convenience methods

If you only need design data plus analysis result for a single experiment, the `AnalysisPlugin` convenience methods are shorter:

```python
class MyPlugin(AnalysisPlugin):
    async def summarize(self, experiment_id: int):
        design, analysis = await self.load(experiment_id)
        return {
            "design": design.data if design else None,
            "analysis": analysis.result if analysis else None,
        }
```

`load()` returns `(DesignData | None, PluginAnalysisResult | None)` — works in both standalone (returns `(None, None)`) and integrated modes.

To read allowed producer results for a cross-plugin dashboard, declare their exact plugin IDs and opt in at the call site:

```python
from mint_sdk import AnalysisPlugin, mint_plugin


@mint_plugin(
    analysis_type="dashboard",
    routes_prefix="/dashboard",
    analysis_result_readers=["peak-picking", "quality-control"],
)
class ReaderPlugin(AnalysisPlugin):
    async def summarize_allowed_results(self, experiment_id: int):
        results = await self.load_analyses(
            experiment_id,
            include_others=True,
        )
        return [
            {"plugin": result.plugin_id, "keys": sorted(result.result.keys())}
            for result in results
        ]
```

Without `include_others=True`, `load_analyses()` returns only this plugin's own result. With it, the repository adds only the producer IDs declared in `analysis_result_readers`; it never returns every plugin's output. A direct `get_analysis_result(experiment_id, plugin_id)` call enforces the same producer-or-allowlist rule.

## Notes

- `ExperimentRepository.create / update / delete` require the resolved `experiment_crud` capability. The original type defaults deny it for `STATIC` and `ANALYSIS`, allow it for `EXPERIMENT_DESIGN` and `FULL`, and require `WORKFLOW` to opt in explicitly.
- `Experiment.experiment_code` (the user-facing `LCM-EXP-001` / `DR-EXP-001` string) is **not** on the SDK dataclass. The repository exposes it only via the REST API. If you need to display it, query the platform's `/api/experiments/{id}` from the plugin's frontend instead.
- `tags` and `custom_metadata` are JSON columns. They're read-only here; for write access, use a recipe that modifies the experiment via the `EXPERIMENT_DESIGN` plugin that owns the type.

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — accessor lifecycle
- [Concepts → Data model](/sdk/concepts/data-model) — Experiment fields
- [Recipes → Writing results](/sdk/recipes/writing-results) — the corresponding write side
- [API Reference → Python SDK](/sdk/api/python) — `ExperimentRepository` full signature
