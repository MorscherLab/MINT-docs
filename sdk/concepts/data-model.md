# Data model

The `mint-sdk` data classes mirror the platform's core entities — but exposed as immutable dataclasses with the fields plugins typically read or write. Repositories return these dataclasses; the platform owns the underlying SQLAlchemy models.

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
```

| Field | Notes |
|-------|-------|
| `id` | Numeric primary key. The user-facing `experiment_code` (`LCM-EXP-001`, `DR-EXP-001`, …) is **not** on the SDK dataclass — it's a platform-side field exposed via the REST API |
| `experiment_type` | The string registered by an `EXPERIMENT_DESIGN` plugin |
| `status` | Usually `planned`, `ongoing`, `completed`, or `cancelled` |
| `tags`, `custom_metadata` | Free-form JSON columns plugins can read but generally should not mutate unless their plugin type owns the experiment update path |
| `parent_experiment_id` | For nested experiments / sub-runs |

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

`data` is whatever JSON your design plugin defines. `schema_version` defaults to the value in `PluginMetadata.schema_version` — bump it when your design schema changes incompatibly.

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

## JSON payload storage

`DesignData.data`, `AnalysisArtifact.result`, and compatibility `PluginAnalysisResult.result` are platform-owned PostgreSQL `jsonb` payloads. They are not mirrored into the SDK's standalone SQLite database: standalone mode has no platform `ExperimentRepository`, while `RecordingContext` supplies an in-memory repository for tests.

SQLite in `mint-sdk[local-db]` stores only plugin-owned standalone tables declared through `get_shared_models()` or migrations. Keep those models and migrations portable when the same plugin tables must run in standalone SQLite and an installed PostgreSQL schema.

For complex queries (e.g., "find experiments where `result.method == 'v4'`"), prefer a real column inside a plugin-owned table over JSON-key indexing — JSON expression indexes work but reduce portability.

## What the repositories return

| Repository | Returns | Writes |
|------------|---------|--------|
| `ExperimentRepository` | `Experiment` | `Experiment` (`EXPERIMENT_DESIGN` and `FULL` plugins) |
| `ExperimentRepository.save_design_data` | `DesignData` | `DesignData` |
| `ExperimentRepository.save_analysis_result` | `PluginAnalysisResult` | `PluginAnalysisResult` compatibility payload |
| `ExperimentRepository.save_analysis_artifact` | `AnalysisArtifact` | Named analysis artifact |
| `ExperimentRepository.save_analysis_artifacts` | `list[AnalysisArtifact]` | Atomic batch of named artifacts |
| `ExperimentRepository.list_analysis_artifacts` | `list[AnalysisArtifactSummary]` | — |
| `ExperimentRepository.get_analysis_artifact` | `AnalysisArtifact \| None` | — |
| `ExperimentRepository.archive_analysis_artifact` / `restore_analysis_artifact` | `AnalysisArtifactSummary \| None` | Artifact status |
| `ExperimentRepository.get_analysis_results` | `list[PluginAnalysisResult]` (calling plugin by default; `include_others=True` adds only declared `analysis_result_readers`) | — |
| `UserRepository` | `User` | — |
| `PluginRoleRepository` | `UserPluginRole`, `str | None` (a single role) | `UserPluginRole` |

See the [API Reference → Python SDK](/sdk/api/python) for the full method list.

Analysis outputs are not globally readable. A plugin can read its own result, or results from exact producer plugin IDs declared in its `analysis_result_readers`. Passing `include_others=True` expands the query only to that allowlist.

## Extending the model

Plugins extend the data model in two complementary ways:

1. **Within `DesignData.data` / `AnalysisArtifact.result`** — JSON. Quick and schema-flexible. Best for plugin-specific configuration and outputs.
2. **Plugin-owned tables** — declare via `get_shared_models()` and/or migrations. Best for queryable, relational data the plugin owns end-to-end.

Pick (1) when the data is tightly coupled to one experiment and never queried across experiments by anyone else. Pick (2) when you need indexes, cross-experiment queries, or relational integrity.

## Next

→ [Migrations](/sdk/concepts/migrations) — evolving plugin-owned tables safely
→ [PlatformContext](/sdk/concepts/platform-context) — accessing repositories
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — patterns for plugin-owned tables
