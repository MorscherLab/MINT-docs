# Data model

The `mint-sdk` data classes mirror the platform's core entities. Context namespaces return these dataclasses; the platform owns the underlying SQLAlchemy models. Field definitions are in [Python SDK → Data models](/sdk/api/python#data-models).

## Entities

### `Experiment`

| Field | Notes |
|-------|-------|
| `id` | Numeric primary key |
| `experiment_code` | The user-facing number (`LCM-EXP-001`, `DR-EXP-001`, …). It is `None` until the experiment leaves `planned` or someone assigns it |
| `version` | Counter that rises on every write. Pass it as `design.save(..., expected_version=)` for optimistic concurrency |
| `experiment_type` | The string registered by an `EXPERIMENT_DESIGN` plugin |
| `status` | `planned`, `ongoing`, `completed`, or `cancelled`. The platform refuses an unknown status or a transition it does not allow |
| `tags`, `custom_metadata` | Free-form JSON columns plugins can read but generally should not mutate unless their plugin type owns the experiment update path |
| `parent_experiment_id` | For nested experiments / sub-runs |
| `design_owner_plugin_id` | Existing design owner; `None` before a design payload establishes ownership |

### `DesignData`

The design-plugin payload for one experiment.

`data` is the JSON your design plugin defines. MINT keeps **one design owner per experiment**. The first save establishes the owner; another plugin's replacement or deletion fails with `DesignDataOwnershipConflictException` (409), even if that plugin can write designs. Workflow CRUD does not establish design ownership.

`design.save()` defaults to `Design.version` of the plugin `Metadata`; an explicit non-default `version` wins. Version labels describe stored payloads and do not transform older data automatically.

Declare a schema for platform-enforced validation:

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

`schema` is a JSON Schema (draft 2020-12) `dict` or a pydantic model class that the SDK converts. The platform validates every `design.save` write against it: in-process, from a plugin process, and from the user paths (`PUT /api/experiments/{id}/data` and the MCP tool `mint_save_design`). A mismatch raises `ValidationException` with the field paths. The contract is opt-in; a plugin without `Metadata.design` keeps free-form JSON. Schema validation is separate from SQL migrations and typed administrator settings. The schema is readable at `GET /api/plugins/{name}/design-schema`.

### `Artifact`

The first-class result object shown on experiment pages. An artifact has a `key` (default `"default"`), a display name, a `result` payload and a status (active or archived). `ArtifactInfo` has the same metadata fields without `result`. `ArtifactInput` is the batch-save input shape for `artifacts.save_all`: `key`, `data`, optional `name`, and optional `note`.

```python
await self.artifacts.save(
    experiment_id,
    {"summary": {"n_peaks": 312}, "table": rows},
    "peak-table",
    name="Peak table",
)
```

The 1.3 compatibility result (`PluginAnalysisResult`, `save_analysis()`) is removed. Save a result as an artifact; the `default` key replaces the single result of a plugin.

### `User`

`role` is the platform role slug — `admin`, `member`, `viewer`, or a custom-role slug. Only the exact slug `admin` is the administrator. Plugin roles do not exist; the access levels `use`, `configure` and `admin` replace them (see [Route permissions](/sdk/recipes/route-permissions)).

## Relationships

```
Project ────< Experiment ──────── DesignData          (one design payload per experiment)
                  │
                  └────────────────< Artifact             (named outputs per plugin)
                  │
                  └────────────────< (plugin-owned tables, via context.db())
```

The platform owns `Project`, `Experiment`, `User`, `DesignData` and `Artifact`. Design data and artifact payloads are JSON-backed; plugin-owned tables live in the plugin's own Postgres schema (integrated mode) or its own SQLite database (standalone mode).

## File objects and ownership

An artifact is a discoverable result record; an `ObjectRef` identifies bytes in object storage. File-backed artifacts link the two with the `mint.analysis_file.v1` payload (`mint_sdk.analysis_file.ANALYSIS_FILE_ARTIFACT_SCHEMA`). Store large CSVs, images, and binary results as objects rather than embedding them in JSON.

Use `self.context.objects(experiment_id)` for raw object operations (`put(key, source)`, `get`, `stream`, `download`, `exists`, `list`, `delete`). An integrated store is scoped to experiment and plugin; another plugin's read scope requires a `reads_from` declaration and does not allow mutation. Standalone object storage is local; it does not create platform artifact records.

`artifacts.save(experiment_id, path, key)` uploads a file and creates or replaces its artifact record. `replace=False` rejects a reused key. Replacing a file artifact is a compare-and-swap on its object key (`expect=`), and the platform removes the old object after the replacement commits. JSON artifact saves replace by default. See [Writing results](/sdk/recipes/writing-results).

## JSONB portability

`DesignData.data` and `Artifact.result` are JSON-typed payloads. Postgres uses native `jsonb` (queryable, indexable); SQLite uses serialized JSON in a TEXT column. The repository layer abstracts the difference. Code that just reads / writes whole dicts works in both backends.

For complex queries (e.g., "find experiments where `result.method == 'v4'`"), prefer a real column inside a plugin-owned table over JSON-key indexing — JSON expression indexes work but reduce portability.

## Context namespaces

`context.experiments`, `context.design`, `context.artifacts` and `context.users` hold the data methods. See [Python SDK → Context namespaces](/sdk/api/python#context-namespaces) for the method and return-type map.

## Extending the model

Plugins extend the data model in two complementary ways:

1. **Within `DesignData.data` / `Artifact.result`** — JSON. Quick and schema-flexible. Best for plugin-specific configuration and outputs.
2. **Plugin-owned tables** — declare with `Metadata.database` (a `MigrationSpec`). Best for queryable, relational data the plugin owns end-to-end.

Pick (1) when the data is tightly coupled to one experiment and never queried across experiments by anyone else. Pick (2) when you need indexes, cross-experiment queries, or relational integrity.

Verified against [v@MINT_VERSION@ data models and protocols](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py) and [design ownership enforcement](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/repositories/sql_experiment_repository.py).

## Next

→ [Migrations](/sdk/concepts/migrations) — evolving plugin-owned tables safely
→ [PlatformContext](/sdk/concepts/platform-context) — accessing repositories
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — patterns for plugin-owned tables
