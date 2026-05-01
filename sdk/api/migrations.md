# Migrations reference

Source: [`mint_sdk/migrations/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/migrations).

## `PluginMigration`

```python
class PluginMigration(ABC):
    version: int                 # required, integer
    name: str                    # required, short snake_case label
    depends_on: int | None = None
    destructive: bool = False

    async def upgrade(self, op: MigrationOps) -> None: ...
    async def downgrade(self, op: MigrationOps) -> None: ...   # optional override
```

Subclass to define one migration. The class **must** set `version` (int) and `name` (str) as class attributes. The metaclass enforces this at instantiation time.

```python
# my_plugin/migrations/001_initial.py
import sqlalchemy as sa
from mint_sdk.migrations import PluginMigration, MigrationOps


class CreatePanelsTable(PluginMigration):
    version = 1
    name = "create_panels_table"

    async def upgrade(self, op: MigrationOps) -> None:
        await op.create_table(
            "panels",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("experiment_id", sa.Integer, nullable=False),
            sa.Column("name", sa.String(200), nullable=False),
            sa.Column("drugs", sa.JSON, nullable=False),
        )
        await op.create_index("idx_panels_experiment", "panels", ["experiment_id"])
```

The class name is arbitrary — the runner discovers any subclass of `PluginMigration` whose `version` is an int. Migration files conventionally use the pattern `NNN_<short_name>.py` so module filename order matches `version` order, but only `version` is authoritative.

`destructive=True` opts in to `drop_table` / `drop_column` operations. Without it, calling those raises `DestructiveMigrationError`.

## `MigrationOps`

Portable DDL surface. Constructed by the runner; not by plugin authors directly.

| Method | Purpose |
|--------|---------|
| `add_column(table, column)` | Add a column. `column` is a `sa.Column` instance. Idempotent. |
| `drop_column(table, column)` | Drop a column. Requires `destructive=True` on the migration. |
| `rename_column(table, old, new)` | Rename a column. |
| `alter_column(table, column_name, ...)` | Alter type / constraints (signature evolves; read source). |
| `create_table(name, *columns)` | Create a table. `columns` are positional `sa.Column` args. Idempotent. |
| `drop_table(name)` | Drop a table. Requires `destructive=True`. |
| `create_index(name, table, columns, *, unique=False)` | Create an index. Idempotent. |
| `drop_index(name)` | Drop an index. |
| `backfill(table, column, default)` | Set `column` to `default` where currently NULL — for adding NOT-NULL columns to existing tables. |
| `execute(stmt)` | Run a raw SQLAlchemy statement (`text(...)` or compiled). |

Columns are constructed as `sa.Column(...)` from SQLAlchemy directly — there is no `MigrationOps.column()` factory. Use SQLAlchemy types (`sa.Integer`, `sa.String(N)`, `sa.JSON`, `sa.DateTime`, `sa.Boolean`, etc.).

Postgres-specific types are available via `sqlalchemy.dialects.postgresql` (e.g., `JSONB`, `UUID`, `TSVECTOR`); they map to TEXT / JSON on SQLite. For non-portable work, check `op._dialect` and use `op.execute(text("..."))` directly.

## `MigrationRunner`

Orchestrates migration application. Used by the platform on startup; rarely instantiated directly by plugins.

```python
class MigrationRunner:
    def __init__(
        self,
        engine: AsyncEngine,
        plugin_name: str,
        dialect: str,    # "postgresql" or "sqlite"
    ) -> None: ...

    async def run(
        self,
        migrations: list[PluginMigration],
        *,
        tables_already_exist: bool = False,
    ) -> MigrationResult: ...

    @staticmethod
    def discover(package_path: str) -> list[PluginMigration]:
        """Import a migrations package and return all PluginMigration instances."""
```

The runner:

- Acquires a Postgres advisory lock keyed by `plugin_name` (or a SQLite-specific equivalent)
- Ensures the tracking table exists (`plugin_schema_migrations` on Postgres, `_plugin_migrations` on SQLite)
- Sorts migrations by `version`
- Skips migrations already applied successfully
- Validates checksums for already-applied migrations against current source
- Runs each pending `upgrade(ops)` inside the same transaction as a tracking-table insert

`tables_already_exist=True` is the fresh-install-stamp mode: applies no migrations, marks all as applied (used when the platform initializes a brand-new schema via `create_all` and wants to record the current state as the baseline).

## `MigrationResult`

Returned by `run()`:

```python
@dataclass
class MigrationResult:
    current_version: int = 0
    applied: list[int] = []     # versions newly applied this call
    stamped: list[int] = []     # versions stamped (fresh-install mode)
    errors: list[str] = []      # human-readable error strings (also raised)
```

## Errors

| Error | Raised when |
|-------|-------------|
| `MigrationError` | Generic — base class for all migration failures |
| `MigrationChecksumError` | An applied revision's source code was edited (checksum mismatch with the tracking-table record) |
| `SchemaVersionAheadError` | DB tracking table records a version higher than any plugin migration ships — usually a downgrade attempt |
| `DestructiveMigrationError` | A migration tried `drop_table` / `drop_column` without setting `destructive=True` |

See [Exceptions](/sdk/api/exceptions) for the wider plugin exception taxonomy.

## Discovery

Plugins enable migrations by overriding `AnalysisPlugin.get_migrations_package()`:

```python
class MyPlugin(AnalysisPlugin):
    def get_migrations_package(self) -> str | None:
        return "my_plugin.migrations"
```

The package must contain modules with `PluginMigration` subclasses. Each module typically defines exactly one subclass, but the runner accepts multiple per module.

Returning `None` (the default) opts out — the runner does nothing for that plugin. Such plugins use `get_shared_models()` + the platform's `create_all()` instead.

## Notes

- Migrations are **append-only**. Once a revision has been applied to a production deployment, do not edit its file. Edits trigger `MigrationChecksumError` on the next startup.
- `upgrade()` and `downgrade()` are async — use `await` for any operation inside.
- The runner runs all migrations for a plugin inside one advisory-locked region; concurrent replicas serialize cleanly.

## Related

- [Concepts → Migrations](/sdk/concepts/migrations) — the model
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — end-to-end usage
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — chunked patterns
