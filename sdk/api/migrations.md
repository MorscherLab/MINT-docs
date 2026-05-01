# Migrations reference

Source: [`mint_sdk/migrations/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/migrations).

## `PluginMigration`

```python
class PluginMigration:
    revision: str           # required, e.g. "001"
    description: str        # required, short human-readable

    async def upgrade(self, ops: MigrationOps) -> None: ...
```

Subclass to define one migration revision. The class **must be named `Migration`** in its module — the runner discovers by class name.

```python
# my_plugin/migrations/001_initial.py
from mint_sdk.migrations import PluginMigration, MigrationOps


class Migration(PluginMigration):
    revision = "001"
    description = "create panels table"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.create_table(...)
```

## `MigrationOps`

Portable DDL surface. Methods emit the right SQL for the active backend (Postgres in production, SQLite for standalone tests).

| Method | Signature |
|--------|-----------|
| `column(name, type, *, primary_key=False, nullable=True, default=None, unique=False)` | Build a column definition for `create_table` |
| `create_table(name, columns)` | Create a new table |
| `drop_table(name)` | Drop a table (requires `--allow-destructive` flag in some contexts) |
| `add_column(table, column_def)` | Add a column |
| `drop_column(table, column_name)` | Drop a column |
| `rename_column(table, old_name, new_name)` | Rename a column |
| `create_index(name, table, columns, *, unique=False)` | Create an index |
| `drop_index(name)` | Drop an index |
| `execute(sql, params=None)` | Run raw SQL |

### Portable types

`column(name, type, ...)` accepts the following type strings (mapped to the right native type per backend):

| Type string | Postgres | SQLite |
|-------------|----------|--------|
| `integer` | `INTEGER` | `INTEGER` |
| `bigint` | `BIGINT` | `INTEGER` |
| `text` | `TEXT` | `TEXT` |
| `varchar(N)` | `VARCHAR(N)` | `TEXT` |
| `boolean` | `BOOLEAN` | `INTEGER` (0/1) |
| `float` | `DOUBLE PRECISION` | `REAL` |
| `numeric(P,S)` | `NUMERIC(P,S)` | `REAL` |
| `timestamp` | `TIMESTAMP WITH TIME ZONE` | `TEXT` (ISO 8601) |
| `date` | `DATE` | `TEXT` |
| `jsonb` | `JSONB` | `TEXT` (JSON) |
| `uuid` | `UUID` | `TEXT` |

For non-portable backend-specific work, use `ops.execute()` and gate on `ops.backend`:

```python
if ops.backend == "postgresql":
    await ops.execute("...")
```

## `MigrationRunner`

Orchestrates migration application. Used by the platform on startup; rarely instantiated directly.

| Method | Purpose |
|--------|---------|
| `upgrade_to_latest()` | Apply all pending migrations |
| `upgrade_to(revision)` | Apply migrations up to and including `revision` |
| `current_revision()` | Return the latest applied revision |
| `pending_revisions()` | List revisions not yet applied |

The runner:

- Acquires a Postgres advisory lock keyed by `plugin_id` so two replicas can't race
- Compares revisions on disk with `plugin_schema_migrations` rows
- Runs each pending revision in order, inside a transaction
- Records success in `plugin_schema_migrations` with the revision's checksum

## `MigrationResult`

Returned by `upgrade_to_latest()` and `upgrade_to()`:

```python
@dataclass
class MigrationResult:
    applied: list[str]          # revisions applied in this run
    skipped: list[str]          # revisions already applied
    error: Optional[Exception]  # set if a revision raised
    duration_ms: int
```

## Errors

| Error | Raised when |
|-------|-------------|
| `MigrationError` | Generic — base class |
| `MigrationChecksumError` | An applied revision's file was edited (checksum mismatch) |
| `SchemaVersionAheadError` | DB has revisions the plugin doesn't ship — usually a downgrade attempt |
| `DestructiveMigrationError` | Migration tried `drop_table` / `drop_column` without explicit allow flag |

See [Exceptions](/sdk/api/exceptions) for the full taxonomy.

## Discovery

The platform discovers a plugin's migrations by reading `AnalysisPlugin.get_migrations_package()`:

```python
class MyPlugin(AnalysisPlugin):
    def get_migrations_package(self) -> str | None:
        return "my_plugin.migrations"
```

The package must contain modules with one `Migration` class each. Module file name is conventional (`001_initial.py`, `002_add_index.py`) but only the class's `revision` attribute is authoritative for ordering.

Returning `None` (the default) opts out — the runner does nothing for that plugin. Such plugins use `get_shared_models()` + `create_all()` instead.

## Notes

- Migrations are **append-only**. Once a revision has been applied to any production deployment, never edit its file. Edit triggers `MigrationChecksumError` on the next startup.
- `upgrade()` is async — use `await` for any database operation inside.
- Inside one migration, all DDL runs in one transaction by default. For long-running data backfills, see [Recipes → Backfill migrations](/sdk/recipes/backfill-migration).
- `MigrationOps.execute` returns a SQLAlchemy `Result` — use `result.fetchall()` for raw selects.

## Related

- [Concepts → Migrations](/sdk/concepts/migrations) — the model
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — end-to-end usage
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — chunked patterns
