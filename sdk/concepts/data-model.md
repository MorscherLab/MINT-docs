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
| `id` | Numeric primary key. The user-facing `experiment_code` (`EXP-001`, …) is **not** on the SDK dataclass — it's a platform-side convenience exposed via the REST API |
| `experiment_type` | The string registered by an `EXPERIMENT_DESIGN` plugin |
| `status` | One of `planned`, `ongoing`, `completed` |
| `tags`, `custom_metadata` | Free-form JSON columns plugins can read but generally shouldn't mutate (use `update_metadata()` helpers if your repo exposes them) |
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

`PluginExperimentData` is a backward-compatible alias for `DesignData`.

### `PluginAnalysisResult`

The output of one analysis-plugin run on one experiment.

```python
@dataclass(slots=True)
class PluginAnalysisResult:
    id: int
    experiment_id: int
    plugin_id: str
    result: dict[str, Any]
    created_at: datetime
    updated_at: datetime
```

`(experiment_id, plugin_id)` is unique — saving a new result for the same pair updates the row, it doesn't create a second one. To preserve history, embed a per-run sub-key inside `result`:

```python
await plugin.save_analysis(experiment_id, {
    "runs": [
        {"id": "2026-05-01T10:00:00Z", "summary": {...}},
        {"id": "2026-05-01T14:00:00Z", "summary": {...}},
    ],
})
```

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
Project ────< Experiment ────────< DesignData          (one design per experiment)
                  │
                  └────────────────< PluginAnalysisResult  (one per (experiment, plugin))
                  │
                  └────────────────< (plugin-owned tables, via shared_db_session)

User ──────< UserPluginRole              (one per (user, plugin))
```

The platform owns `Project`, `Experiment`, `User`, `DesignData`, `PluginAnalysisResult`, `UserPluginRole`. Plugin-owned tables live in the plugin's own Postgres schema (integrated mode) or its own SQLite database (standalone mode).

## JSONB portability

`DesignData.data` and `PluginAnalysisResult.result` are JSON-typed columns. Postgres uses native `jsonb` (queryable, indexable); SQLite uses serialized JSON in a TEXT column. The repository layer abstracts the difference. Code that just reads / writes whole dicts works in both backends.

For complex queries (e.g., "find experiments where `result.method == 'v4'`"), prefer a real column inside a plugin-owned table over JSON-key indexing — JSON expression indexes work but reduce portability.

## What the repositories return

| Repository | Returns | Writes |
|------------|---------|--------|
| `ExperimentRepository` | `Experiment` | `Experiment` (only EXPERIMENT_DESIGN plugins) |
| `PluginDataRepository.save_experiment_data` | `DesignData` | `DesignData` |
| `PluginDataRepository.save_analysis_result` | `PluginAnalysisResult` | `PluginAnalysisResult` |
| `PluginDataRepository.get_analysis_results` | `list[PluginAnalysisResult]` (every plugin's results for one experiment) | — |
| `UserRepository` | `User` | — |
| `PluginRoleRepository` | `UserPluginRole`, `str | None` (a single role) | `UserPluginRole` |

See the [API Reference → Python SDK](/sdk/api/python) for the full method list.

## Extending the model

Plugins extend the data model in two complementary ways:

1. **Within `DesignData.data` / `PluginAnalysisResult.result`** — JSON. Quick and schema-flexible. Best for plugin-specific configuration and outputs.
2. **Plugin-owned tables** — declare via `get_shared_models()` and/or migrations. Best for queryable, relational data the plugin owns end-to-end.

Pick (1) when the data is tightly coupled to one experiment and never queried across experiments by anyone else. Pick (2) when you need indexes, cross-experiment queries, or relational integrity.

## Next

→ [Migrations](/sdk/concepts/migrations) — evolving plugin-owned tables safely
→ [PlatformContext](/sdk/concepts/platform-context) — accessing repositories
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — patterns for plugin-owned tables
