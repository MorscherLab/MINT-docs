# Data model

The `mint-sdk` data classes mirror the platform's core entities. Repositories return these dataclasses; the platform owns the underlying SQLAlchemy models. Field definitions are in [Python SDK → Dataclass fields](/sdk/api/python#dataclass-fields).

## Entities

### `Experiment`

| Field | Notes |
|-------|-------|
| `id` | Numeric primary key. The user-facing `experiment_code` (`LCM-EXP-001`, `DR-EXP-001`, …) is **not** on the SDK dataclass — it's a platform-side field exposed via the REST API |
| `experiment_type` | The string registered by an `EXPERIMENT_DESIGN` plugin |
| `status` | Usually `planned`, `ongoing`, `completed`, or `cancelled` |
| `tags`, `custom_metadata` | Free-form JSON columns plugins can read but generally should not mutate unless their plugin type owns the experiment update path |
| `parent_experiment_id` | For nested experiments / sub-runs |
| `design_owner_plugin_id` | Existing design owner; `None` before a design payload establishes ownership |

### `DesignData`

The design-plugin payload for one experiment.

`data` is the JSON your design plugin defines. MINT 1.2 keeps **one design owner per experiment**. The first save establishes the owner; another plugin's replacement or deletion fails with `DesignDataOwnershipConflictException` (409), even if that plugin can write designs. Workflow CRUD does not establish design ownership.

`save_design()` defaults to `metadata.schema_version`. A declared `design_schema_version` replaces the protocol default `"1.0"`; an explicit non-default version wins. Version labels describe stored payloads and do not transform older data automatically.

Declare a schema for platform-enforced validation:

```python
from pydantic import BaseModel, Field
from mint_sdk import AnalysisPlugin, PluginType, design_schema_from_model, mint_plugin

class Sample(BaseModel):
    name: str = Field(min_length=1)

class BatchDesign(BaseModel):
    samples: list[Sample] = Field(min_length=1)

@mint_plugin(
    analysis_type="lcms_batch", routes_prefix="/batch-designer",
    plugin_type=PluginType.EXPERIMENT_DESIGN,
    design_schema=design_schema_from_model(BatchDesign),
    design_schema_version="2.0",
)
class BatchDesigner(AnalysisPlugin):
    pass
```

The JSON Schema contract is opt-in; existing plugins without `design_schema` keep free-form JSON. Schema validation is separate from SQL migrations and typed administrator settings.

`PluginExperimentData` is a backward-compatible alias for `DesignData`.

### `PluginAnalysisResult`

The compatibility result payload for one plugin on one experiment.

`save_analysis()` / `load_analysis()` still use this shape so older plugins keep working. Saving a new compatibility result for the same `(experiment_id, plugin_id)` updates that plugin's current result.

For current MINT plugins, prefer named analysis artifacts when the output should appear in the experiment UI, be archived/restored, or exist as more than one independently managed result:

```python
await plugin.save_analysis_artifact(
    experiment_id,
    {"summary": {"n_peaks": 312}, "table": rows},
    artifact_key="peak-table",
    display_name="Peak table",
)
```

### `AnalysisArtifact`

The first-class result object shown on experiment pages.

`AnalysisArtifactSummary` has the same metadata fields without `result`. `AnalysisArtifactInput` is the batch-save input shape: `artifact_key`, `result`, optional `display_name`, and optional `note`.

### `User`

`role` is the platform role — `Admin`, `Member`, `Viewer`, or a custom-role name. Plugin roles are tracked separately as `UserPluginRole`.

### `UserPluginRole`

`role` is whatever string your plugin defines. Read the current user's role for this plugin from `CurrentPluginActor.plugin_role`; native routers can use `PlatformContext.require_plugin_role(*roles)`.

## Relationships

```
Project ────< Experiment ──────── DesignData          (one design payload per experiment)
                  │
                  └────────────────< AnalysisArtifact     (named outputs per plugin)
                  │
                  └──────────────── PluginAnalysisResult  (compatibility result per plugin id)
                  │
                  └────────────────< (plugin-owned tables, via shared_db_session)

User ──────< UserPluginRole              (one per (user, plugin))
```

The platform owns `Project`, `Experiment`, `User`, `DesignData`, `AnalysisArtifact`, compatibility `PluginAnalysisResult` records, and `UserPluginRole`. Design data and artifact payloads are JSON-backed; plugin-owned tables live in the plugin's own Postgres schema (integrated mode) or its own SQLite database (standalone mode).

## File objects and ownership

An artifact is a discoverable result record; a `DataObjectRef` identifies bytes in object storage. File-backed artifacts link the two using `ANALYSIS_FILE_ARTIFACT_SCHEMA`. Store large CSVs, images, and binary results as objects rather than embedding them in JSON.

Use `self.get_data_store(experiment_id)` for raw object operations (`put_bytes`, `put_file`, `get_bytes`, `download_file`, `list`, `delete`). An integrated store is scoped to experiment and plugin; another plugin's read scope requires a reader declaration and does not allow mutation. Standalone object storage is local; it does not create platform artifact records.

`save_analysis_file_artifact()` creates a new artifact and rejects a reused key. `update_analysis_file_artifact()` replaces an active file using compare-and-swap and reports deferred old-object cleanup. JSON artifact saves remain upserts. See [Writing results](/sdk/recipes/writing-results).

## JSONB portability

`DesignData.data`, `AnalysisArtifact.result`, and compatibility `PluginAnalysisResult.result` are JSON-typed payloads. Postgres uses native `jsonb` (queryable, indexable); SQLite uses serialized JSON in a TEXT column. The repository layer abstracts the difference. Code that just reads / writes whole dicts works in both backends.

For complex queries (e.g., "find experiments where `result.method == 'v4'`"), prefer a real column inside a plugin-owned table over JSON-key indexing — JSON expression indexes work but reduce portability.

## Repositories

MINT 1.2 consolidates repository methods on `ExperimentRepository`; `PluginDataRepository` remains a MINT 1.1 adapter. See [Python SDK → Repository return types](/sdk/api/python#repository-return-types) for the method and return-type map.

## Extending the model

Plugins extend the data model in two complementary ways:

1. **Within `DesignData.data` / `AnalysisArtifact.result`** — JSON. Quick and schema-flexible. Best for plugin-specific configuration and outputs.
2. **Plugin-owned tables** — declare via `get_shared_models()` and/or migrations. Best for queryable, relational data the plugin owns end-to-end.

Pick (1) when the data is tightly coupled to one experiment and never queried across experiments by anyone else. Pick (2) when you need indexes, cross-experiment queries, or relational integrity.

Verified against [v@MINT_VERSION@ data models and protocols](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py) and [design ownership enforcement](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/repositories/sql_experiment_repository.py).

## Next

→ [Migrations](/sdk/concepts/migrations) — evolving plugin-owned tables safely
→ [PlatformContext](/sdk/concepts/platform-context) — accessing repositories
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — patterns for plugin-owned tables
