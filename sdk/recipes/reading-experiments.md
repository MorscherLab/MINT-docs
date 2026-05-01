# Reading experiments

## Goal

Read experiments from inside a plugin: fetch one by ID, list with filters, paginate.

## Get one by ID

```python
from mint_sdk import NotFoundException

class MyPlugin(AnalysisPlugin):
    async def get_experiment(self, experiment_id: int):
        repo = self._context.get_experiment_repository()
        experiment = await repo.get_by_id(experiment_id)
        if experiment is None:
            raise NotFoundException(
                f"Experiment {experiment_id} not found",
                entity="experiment",
                entity_id=str(experiment_id),
            )
        return experiment
```

`get_by_id` returns an `Experiment` dataclass or `None`. Map the `None` to `NotFoundException` so the platform's middleware turns it into a 404 with a structured body.

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
| `status` | `"planned"` / `"ongoing"` / `"completed"` |
| `experiment_type` | Match the design plugin's type string |
| `project` | Project name (string match) |
| `created_by` | User ID |
| `parent_experiment_id` | For nested experiments |
| `search` | Free-text against name and notes |

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

## Notes

- `ExperimentRepository.create / update / delete` raise `PermissionException` for `ANALYSIS` plugins. They're available only to `EXPERIMENT_DESIGN` plugins.
- `Experiment.experiment_code` (the user-facing `EXP-001` string) is **not** on the SDK dataclass. The repo exposes it only via the REST API. If you need to display it, query the platform's `/api/experiments/{id}` from the plugin's frontend instead.
- `tags` and `custom_metadata` are JSON columns. They're read-only here; for write access, use a recipe that modifies the experiment via the `EXPERIMENT_DESIGN` plugin that owns the type.

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — accessor lifecycle
- [Concepts → Data model](/sdk/concepts/data-model) — Experiment fields
- [Recipes → Writing results](/sdk/recipes/writing-results) — the corresponding write side
- [API Reference → Python SDK](/sdk/api/python) — `ExperimentRepository` full signature
