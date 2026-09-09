# Reading and managing experiments

MINT 1.2 exposes metadata, design data, and analysis through one scoped `ExperimentRepository`. The SDK protocol works in both in-process and isolated integrated plugins.

## Read one visible experiment

For a route with an experiment ID, inject `CurrentExperiment`:

```python
from mint_sdk import AnalysisPlugin, CurrentExperiment, endpoint

class MyPlugin(AnalysisPlugin):
    @endpoint.get("/experiments/{experiment_id}/design-summary")
    async def design_summary(self, experiment: CurrentExperiment) -> dict[str, object]:
        design = await self.load_design(experiment.id)
        return {
            "id": experiment.id,
            "name": experiment.name,
            "design_owner_plugin_id": experiment.design_owner_plugin_id,
            "schema_version": design.schema_version if design else None,
            "data": design.data if design else None,
        }
```

The dependency checks `experiments.view` and scoped visibility/type compatibility. A missing or hidden experiment produces 404; standalone mode produces 503. The design payload can be absent even when the experiment exists.

## List and paginate

```python
from fastapi import HTTPException, Query
from mint_sdk import AnalysisPlugin, CurrentPluginActor, endpoint

class MyPlugin(AnalysisPlugin):
    @endpoint.get("/experiments")
    async def experiments(
        self,
        actor: CurrentPluginActor,
        project: str | None = None,
        skip: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=200),
    ) -> dict[str, object]:
        if not actor.has_permission("experiments.view"):
            raise HTTPException(403, "Missing permission: experiments.view")
        repo = self.context.get_experiment_repository() if self.context else None
        if repo is None:
            raise HTTPException(503, "Experiment repository is not available")
        items, total = await repo.list_all(
            status="completed", project=project, skip=skip, limit=limit,
        )
        return {"items": items, "total": total}
```

| SDK filter | Meaning |
|------------|---------|
| `skip=0`, `limit=100` | Offset and page size |
| `status` | Such as `planned`, `ongoing`, `completed`, `cancelled` |
| `experiment_type` | Registered experiment type |
| `project` | Project name, not numeric project ID |
| `created_by` | Creator's numeric user ID |
| `parent_experiment_id` | Direct children of an experiment |
| `search` | Search text |

The returned count and records respect visibility and type restrictions. Do not depend on SQL implementation-only arguments such as `project_id` in a portable plugin. The external [REST client](/sdk/api/client) has its own richer filter surface.

For batch processing, fetch one page at a time and advance `skip` by the received count; stop when the page is empty or `skip >= total`. Pagination is not a snapshot transaction: concurrent edits may change membership between pages.

## Create an experiment from a workflow plugin

A scheduler can create experiment metadata without owning design or analysis data. Declare `WORKFLOW` with explicit CRUD permission:

```python
from fastapi import HTTPException
from pydantic import BaseModel, Field
from mint_sdk import (
    AnalysisPlugin, CurrentPluginActor, PluginCapabilities,
    PluginType, endpoint, mint_plugin,
)

class CreateRun(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    project: str | None = None

@mint_plugin(
    analysis_type="run-planner",
    routes_prefix="/run-planner",
    plugin_type=PluginType.WORKFLOW,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_experiments=True,
        experiment_crud=True,
        design_data_write=False,
        analysis_result_write=False,
    ),
    allowed_experiment_types=["lcms_batch"],
)
class RunPlanner(AnalysisPlugin):
    @endpoint.post("/experiments", status_code=201)
    async def create_run(self, body: CreateRun, actor: CurrentPluginActor) -> dict[str, int]:
        if not actor.has_permission("experiments.create"):
            raise HTTPException(403, "Missing permission: experiments.create")
        repo = self.context.get_experiment_repository() if self.context else None
        if repo is None:
            raise HTTPException(503, "Experiment repository is not available")
        experiment = await repo.create(
            name=body.name,
            experiment_type="lcms_batch",
            project=body.project,
            created_by=int(actor.user_id),
        )
        return {"experiment_id": experiment.id}
```

The `lcms_batch` type must already exist and be enabled on the platform. The new row does not become the workflow plugin's design. The design plugin supplies its own payload later; `WORKFLOW` cannot write design/results or manage collaborators.

## Update and delete metadata

Within an authorized route with a resolved experiment and repository:

```python
updated = await repo.update(experiment.id, status="ongoing", notes="Acquisition started")
deleted = await repo.delete(experiment.id)
```

These are separate examples: use update for a status action and delete only for a user-requested deletion. Check the corresponding actor permission (`experiments.edit` or `experiments.delete`) at the route boundary. The repository additionally enforces the plugin's effective `experiment_crud` capability, visibility, and type restrictions. `update()` returns `Experiment | None`; `delete()` returns `bool`.

The public SDK update fields are `name`, `status`, `experiment_type`, `parent_experiment_id`, `project`, `notes`, and `tags`. For advanced platform-only metadata operations, use the public platform API instead of importing SQL models.

## Read another plugin's output

Declare the producer in `analysis_result_readers`, then select an artifact:

```python
artifact = await self.load_analysis_artifact(
    experiment.id,
    plugin_id="peak-qc",
    artifact_key="summary",
    fields=["score", "method"],
)
```

`fields` projects top-level result keys. Lists of artifacts contain metadata, not every result payload. Read the selected result on demand. See [PlatformContext](/sdk/concepts/platform-context#cross-plugin-readers).

## Data shape and source

`Experiment` is a slots dataclass, not a live ORM row. Its `design_owner_plugin_id` identifies the existing design owner; `experiment_code` remains a REST detail field rather than an SDK dataclass field. Mutating a returned dataclass does not persist changes.

Verified against [v1.2.1 repository protocol](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/repositories.py) and [request dependencies](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/runtime_dependencies.py).
