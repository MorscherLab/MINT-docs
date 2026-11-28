# Data model

The `mint-sdk` data classes mirror the core entities of the platform. Context namespaces return these dataclasses; the platform owns the SQLAlchemy models behind them. The field definitions are in [Python SDK → Data models](/sdk/api/python#data-models).

## Entities

### `Experiment`

| Field | Notes |
|-------|-------|
| `id` | Numeric primary key |
| `experiment_code` | The user-facing number, such as `LCM-EXP-001`. It is `None` until the experiment gets a number; see [Experiment numbers](/guide/experiments#experiment-numbers) |
| `version` | Counter that increases on every write. Pass it as `design.save(..., expected_version=)` to refuse a stale write; see [Writing results](/sdk/recipes/writing-results#design-data-belongs-to-its-design-plugin) |
| `experiment_type` | The type string that a design plugin registers |
| `status` | `planned`, `ongoing`, `completed` or `cancelled`. The platform refuses an unknown status and a transition that it does not allow |
| `tags`, `custom_metadata` | Free-form JSON. Plugins can read them. Change them only when your plugin type owns the experiment update path |
| `parent_experiment_id` | For nested experiments and sub-runs |
| `design_owner_plugin_id` | The design owner, or `None` before the first design save. The REST answers also give `None` when the role of the caller cannot see the design plugin |

### `DesignData`

The design payload of one experiment.

`data` is the JSON that your design plugin defines. MINT keeps one design owner per experiment. The first save sets the owner. When another plugin replaces or deletes the design, the platform raises `DesignDataOwnershipConflictException` (409), also when that plugin can write designs. Workflow CRUD does not set design ownership.

`design.save()` uses `Design.version` of the plugin `Metadata` by default; an explicit non-default `version` wins. A version label describes the stored payload. It does not convert older data.

To make the platform validate the design, declare a schema:

```python
from pydantic import BaseModel, Field
from mint_sdk import Design, Metadata, Plugin, plugin

class Sample(BaseModel):
    name: str = Field(min_length=1)

class BatchDesign(BaseModel):
    samples: list[Sample] = Field(min_length=1)

class BatchDesignerMeta(Metadata):
    domain = "lcms_batch"
    prefix = "/batch-designer"
    writes = {"experiments", "design"}
    design = Design(version="2.0", schema=BatchDesign)

@plugin(BatchDesignerMeta)
class BatchDesigner(Plugin):
    pass
```

`schema` is a JSON Schema (draft 2020-12) `dict` or a pydantic model class, which the SDK converts. The platform validates every `design.save` write against it: from an in-process plugin, from a plugin process, and from the user paths (`PUT /api/experiments/{id}/data` and the MCP tool `mint_save_design`). A mismatch raises `ValidationException` with the field paths. The schema is optional; a plugin without `Metadata.design` keeps free-form JSON. Schema validation does not depend on SQL migrations or on typed settings. `GET /api/plugins/{name}/design-schema` returns the schema, with `live` for a live design.

`Design(live=True)` makes the platform draw a form from the schema on the experiment page, and each field saves as a separate patch. The stored `data` of a live design can lack required fields, so every reader of the design must accept such a document. See [Live design forms](/sdk/recipes/live-design).

Before the first save, an experiment has no design owner. To learn how the platform and the user choose the design plugin, see [Choose a design plugin](/guide/experiments#choose-a-design-plugin).

### `Artifact`

An artifact is a named result of a plugin on an experiment page. It has a `key` (default `"default"`), a display name, a `result` payload and a status (active or archived). `ArtifactInfo` has the same metadata without `result`. To save, replace and archive artifacts, see [Writing results](/sdk/recipes/writing-results).

### `User`

`role` is the slug of the platform role: `admin`, `member`, `viewer` or a custom-role slug. Only the exact slug `admin` is the administrator. Plugins have no roles of their own; they use the access levels `use`, `configure` and `admin` (see [Route permissions](/sdk/recipes/route-permissions#access-levels)).

## Relationships

```
Project ────< Experiment ──────── DesignData          (one design payload per experiment)
                  │
                  └────────────────< Artifact             (named outputs per plugin)
                  │
                  └────────────────< (plugin-owned tables, via context.db())
```

The platform owns `Project`, `Experiment`, `User`, `DesignData` and `Artifact`. Plugin-owned tables live in the PostgreSQL schema of the plugin (integrated) or in its own SQLite database (standalone).

## File objects

An artifact is a result record. An `ObjectRef` identifies bytes in object storage. A file-backed artifact links the two with the `mint.analysis_file.v1` payload (`mint_sdk.analysis_file.ANALYSIS_FILE_ARTIFACT_SCHEMA`). Store large CSVs, images and binary results as objects, not inside JSON.

`self.context.objects(experiment_id)` gives raw object operations: `put(key, source)`, `get`, `stream`, `download`, `exists`, `list` and `delete`. An integrated store is scoped to one experiment and one plugin. To read the store of another plugin, declare it in `reads_from`; that read scope does not allow changes. Standalone object storage is local and creates no artifact records.

To upload a file as an artifact and replace it safely, see [Writing results](/sdk/recipes/writing-results#create-a-file-backed-artifact). When a user deletes an experiment, the platform also removes its stored objects; see [Deleting experiments](/guide/experiments#deleting-experiments).

## JSON payloads

The platform stores `DesignData.data` and `Artifact.result` as PostgreSQL `jsonb`. Code that reads and writes whole dicts needs nothing more. For a query such as "find experiments where `result.method == 'v4'`", use a real column in a plugin-owned table, not a JSON-key index.

## Context namespaces

`context.experiments`, `context.design`, `context.artifacts` and `context.users` hold the data methods. See [Python SDK → Context namespaces](/sdk/api/python#context-namespaces) for the methods and return types.

## Extend the model

A plugin can add data in two ways:

1. JSON inside `DesignData.data` or `Artifact.result`. Use it for data that belongs to one experiment and that nobody queries across experiments.
2. Plugin-owned tables, declared with `Metadata.database` (a `MigrationSpec`). Use them when you need indexes, queries across experiments or relational integrity. See [Migrations](/sdk/concepts/migrations).

Verified against [v@MINT_VERSION@ data models and protocols](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py) and [design ownership enforcement](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/repositories/sql_experiment_repository.py).
