# Reading and managing experiments

Read, create and update experiments through the scoped namespaces `context.experiments`, `context.design` and `context.artifacts`. They work in in-process and isolated plugins.

## Read one visible experiment

For a route with an experiment ID, inject `CurrentExperiment`:

```python
from mint_sdk import CurrentExperiment, Plugin, endpoint

class MyPlugin(Plugin):
    @endpoint.get("/experiments/{experiment_id}/design-summary")
    async def design_summary(self, experiment: CurrentExperiment) -> dict[str, object]:
        design = await self.design.get(experiment.id)
        return {
            "id": experiment.id,
            "name": experiment.name,
            "design_owner_plugin_id": experiment.design_owner_plugin_id,
            "schema_version": design.schema_version if design else None,
            "data": design.data if design else None,
        }
```

For the checks and status codes of `CurrentExperiment`, see [Request-scoped access](/sdk/concepts/platform-context#request-scoped-access). The design payload can be absent when the experiment exists.

## List experiments

```python
from fastapi import HTTPException
from mint_sdk import CurrentActor, Plugin, endpoint

class MyPlugin(Plugin):
    @endpoint.get("/experiments")
    async def experiments(
        self,
        actor: CurrentActor,
        project: str | None = None,
    ) -> list[dict[str, object]]:
        if not actor.has_permission("experiments.view"):
            raise HTTPException(403, "Missing permission: experiments.view")
        items = await self.context.experiments.list(
            status="completed", project=project, limit=50,
        )
        return [{"id": item.id, "name": item.name, "code": item.experiment_code} for item in items]
```

`self.context` is never `None`. In standalone mode, `experiments.list` raises `UnavailableException` (HTTP 503), so the route needs no standalone check.

| `list` argument | Meaning |
|-----------------|---------|
| `status` | Such as `planned`, `ongoing`, `completed`, `cancelled` |
| `type` | Registered experiment type |
| `project` | Project name, not numeric project ID |
| `created_by` | Creator's numeric user ID |
| `parent` | Direct children of an experiment |
| `search` | Search text |
| `limit` | Newest first; default 100. `None` returns all visible experiments |

The result lists the newest matching experiments that the caller can see, within the type restrictions. There is no offset. To read more than one page, call with `limit=None`, or narrow the filters. The external [REST client](/sdk/api/client) has more filters.

## Create an experiment from a workflow plugin

A scheduler can create experiments without owning design or analysis data. Declare `writes = {"experiments"}`:

```python
from fastapi import HTTPException
from pydantic import BaseModel, Field
from mint_sdk import CurrentActor, Metadata, Plugin, endpoint, plugin

class CreateRun(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    project: str | None = None

class RunPlannerMeta(Metadata):
    domain = "run-planner"
    prefix = "/run-planner"
    writes = {"experiments"}
    experiment_types = {"lcms_batch"}

@plugin(RunPlannerMeta)
class RunPlanner(Plugin):
    @endpoint.post("/experiments", status_code=201)
    async def create_run(self, body: CreateRun, actor: CurrentActor) -> dict[str, int]:
        if not actor.has_permission("experiments.create"):
            raise HTTPException(403, "Missing permission: experiments.create")
        experiment = await self.context.experiments.create(
            body.name, "lcms_batch", project=body.project,
        )
        return {"experiment_id": experiment.id}
```

- The `lcms_batch` type must exist and be enabled on the platform.
- The calling user becomes the creator; see [What the platform enforces](/sdk/concepts/platform-context#what-the-platform-enforces).
- The new experiment has no number. For when it gets one, see [Experiment numbers](/guide/experiments#experiment-numbers).
- The workflow plugin does not become the design owner. The design plugin saves its own payload later.
- A plugin with only `writes = {"experiments"}` cannot write design data or results, or manage collaborators.

## Update and delete metadata

In an authorized route with a resolved experiment:

```python
updated = await self.context.experiments.update(experiment.id, status="ongoing", notes="Acquisition started")
deleted = await self.context.experiments.delete(experiment.id)
```

These are two separate examples. Use `update` for a status action, and `delete` only when the user asks for a deletion.

- Check the actor permission (`experiments.edit` or `experiments.delete`) in the route.
- The namespace also checks the plugin write capability (`"experiments"` in `writes`), visibility and type restrictions.
- `update()` returns `Experiment | None`. `delete()` returns `bool`.

Plugin writes follow the same rules as REST writes:

- An unknown status or a transition the platform does not allow (for example `cancelled` to `completed`) raises `ValidationException`.
- A type change on an experiment that has a number raises `ConflictException`, because the new type would break the prefix of the number.
- Another plugin's `experiment.before_save` handler can veto a plugin's design-data save (`EventVetoException`, 422).
- `None` means "not sent". `update(..., notes=None)` does not clear the field. Clear a field through the REST API or the UI.

The update arguments are `name`, `status`, `type`, `parent`, `project`, `notes` and `tags`. For other metadata operations, use the public platform API. Do not import platform SQL models.

## Read another plugin's output

Declare the producer in `reads_from`, then select an artifact:

```python
class ReaderMeta(Metadata):
    domain = "report"
    reads_from = {"peak-qc"}

artifact = await self.artifacts.get(experiment.id, "summary", plugin="peak-qc")
if artifact is not None:
    score = artifact.result["score"]
```

`artifacts.get` returns the whole artifact, or `None`. `artifacts.list` returns metadata only; read the selected result when you need it. See [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers) and [Split results](/sdk/recipes/writing-results#split-results-so-readers-can-skip-large-tables).

## Data shape and source

`Experiment` is a slots dataclass, not a live ORM row. A change to it is not saved.

- `design_owner_plugin_id` names the design owner.
- `experiment_code` is the number, or `None`.
- `version` is the write counter for `design.save(..., expected_version=)`.

Verified against [v@MINT_VERSION@ repository protocol](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py) and [request dependencies](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/runtime_dependencies.py).
