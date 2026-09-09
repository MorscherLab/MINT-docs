# Data model

The `mint-sdk` data classes mirror the platform's core entities — but exposed as slots dataclasses with the fields plugins typically read or write. Repositories return these dataclasses; the platform owns the underlying SQLAlchemy models.

## Entities

### `Experiment`

```python
@dataclass(slots=True)
class Experiment:
    id: int
    name: str
    experiment_type: str
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: int | None = None
    parent_experiment_id: int | None = None
    project: str | None = None
    notes: str | None = None
    tags: dict = field(default_factory=dict)
    custom_metadata: dict = field(default_factory=dict)
    start_date: date | None = None
    end_date: date | None = None
    design_owner_plugin_id: str | None = None
```

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

```python
@dataclass(slots=True)
class DesignData:
    id: int
    experiment_id: int
    plugin_id: str
    data: dict[str, Any]
    schema_version: str
    created_at: datetime
    updated_at: datetime
```

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

```python
@dataclass(slots=True)
class PluginAnalysisResult:
    id: int
    experiment_id: int
    plugin_id: str
    result: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    artifact_id: int | None = None
    artifact_key: str | None = None
    display_name: str | None = None
    status: str | None = None
    result_keys: list[str] = field(default_factory=list)
```

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

```python
@dataclass(slots=True)
class AnalysisArtifact:
    id: int
    experiment_id: int
    plugin_id: str
    artifact_key: str
    display_name: str
    status: str
    result: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    result_keys: list[str] = field(default_factory=list)
    note: str | None = None
    archived_at: datetime | None = None
    archived_by: int | None = None
```

`AnalysisArtifactSummary` has the same metadata fields without `result`. `AnalysisArtifactInput` is the batch-save input shape: `artifact_key`, `result`, optional `display_name`, and optional `note`.

### `User`

```python
@dataclass(slots=True)
class User:
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    email: str | None = None
    shortname: str | None = None
    first_name: str | None = None
    last_name: str | None = None
```

`role` is the platform role — `Admin`, `Member`, `Viewer`, or a custom-role name. Plugin roles are tracked separately as `UserPluginRole`.

### `UserPluginRole`

```python
@dataclass(slots=True)
class UserPluginRole:
    id: int
    user_id: int
    plugin_id: str
    role: str
    created_at: datetime
    updated_at: datetime
```

`role` is whatever string your plugin defines. Plugin role checks are performed by `PlatformContext.require_plugin_role(*roles)`.

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

## What the repositories return

| Repository | Returns | Writes |
|------------|---------|--------|
| `ExperimentRepository` | Experiment, design, result, and artifact records | Effective `experiment_crud`, `design_data_write`, and `analysis_result_write` capabilities |
| `ExperimentRepository.save_design_data` | `DesignData` | Owner-scoped design upsert |
| `PluginDataRepository.save_experiment_data` | `DesignData` | `DesignData` |
| `PluginDataRepository.save_analysis_result` | `PluginAnalysisResult` | `PluginAnalysisResult` compatibility payload |
| `PluginDataRepository.save_analysis_artifact` | `AnalysisArtifact` | Named analysis artifact |
| `PluginDataRepository.save_analysis_artifacts` | `list[AnalysisArtifact]` | Atomic batch of named artifacts |
| `PluginDataRepository.list_analysis_artifacts` | `list[AnalysisArtifactSummary]` | — |
| `PluginDataRepository.get_analysis_artifact` | `AnalysisArtifact \| None` | — |
| `PluginDataRepository.archive_analysis_artifact` / `restore_analysis_artifact` | `AnalysisArtifactSummary \| None` | Artifact status |
| `PluginDataRepository.get_analysis_results` | `list[PluginAnalysisResult]` (calling plugin by default; pass `include_others=True` for every plugin's result on one experiment) | — |
| `UserRepository` | `User` | — |
| `PluginRoleRepository` | `UserPluginRole`, `str | None` (a single role) | `UserPluginRole` |

MINT 1.2 consolidates these methods on `ExperimentRepository`. `PluginDataRepository` remains a MINT 1.1 adapter, including its old `save_experiment_data` / `get_experiment_data` / `delete_experiment_data` names. New code should use `save_design_data` / `get_design_data` / `delete_design_data` on the experiment repository or the plugin convenience helpers.

See the [API Reference → Python SDK](/sdk/api/python) for the method map.

## Extending the model

Plugins extend the data model in two complementary ways:

1. **Within `DesignData.data` / `AnalysisArtifact.result`** — JSON. Quick and schema-flexible. Best for plugin-specific configuration and outputs.
2. **Plugin-owned tables** — declare via `get_shared_models()` and/or migrations. Best for queryable, relational data the plugin owns end-to-end.

Pick (1) when the data is tightly coupled to one experiment and never queried across experiments by anyone else. Pick (2) when you need indexes, cross-experiment queries, or relational integrity.

Verified against [v1.2.1 data models and protocols](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/repositories.py) and [design ownership enforcement](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/repositories/sql_experiment_repository.py).

## Next

→ [Migrations](/sdk/concepts/migrations) — evolving plugin-owned tables safely
→ [PlatformContext](/sdk/concepts/platform-context) — accessing repositories
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — patterns for plugin-owned tables
