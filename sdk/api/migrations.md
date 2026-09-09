# Migrations reference — 1.2.1

The released migration API is exported by `mint_sdk.migrations`. Source: [v1.2.1 migrations package](https://github.com/MorscherLab/MINT/tree/v1.2.1/packages/sdk-python/src/mint_sdk/migrations).

## Plugin database hooks

```python
class AnalysisPlugin:
    def get_shared_models(self) -> list[type]: ...
    def get_migrations_package(self) -> str | None: ...
    def validate_database_runtime(self, context: PlatformContext | None = None) -> None: ...
    async def ensure_standalone_database(
        self, storage_dir: Any | None = None, *, run_migrations: bool = True
    ) -> Any: ...
    # Async context manager, yielding an AsyncSession:
    def get_plugin_db_session(self): ...
```

`get_shared_models()` defaults to `[]`; `get_migrations_package()` defaults to `None`. Use both for a plugin with current ORM models and migration history. `ensure_standalone_database()` returns `PluginDatabaseState` from `mint_sdk.plugin_database`: `mode`, integer `schema_version`, `applied_migrations`, `stamped_migrations`, `conformance`, and the derived `ok` property. It raises `ConfigurationException` when schema conformance fails.

Standalone app startup calls the database lifecycle automatically for a declared database contract. Integrated shared sessions use PostgreSQL; `RemotePlatformContext` cannot supply shared SQL sessions. Both supported session context managers commit on success and roll back on failure.

## `PluginMigration`

```python
class PluginMigration(ABC):
    version: int
    name: str
    depends_on: int | None = None
    destructive: bool = False

    async def upgrade(self, op: MigrationOps) -> None: ...  # abstract
    async def downgrade(self, op: MigrationOps) -> None: ...

    @property
    def has_downgrade(self) -> bool: ...
```

A metaclass checks that `version` is an integer and `name` a string at instantiation. Use unique positive increasing versions and stable labels such as `add_panel_notes`. `depends_on` is not interpreted by the v1.2.1 runner. `has_downgrade` reports whether the subclass overrides `downgrade`; the runner does not invoke it automatically.

## `MigrationOps`

Constructed by the runner with an active connection:

```python
class MigrationOps:
    def __init__(
        self,
        conn: AsyncConnection,
        *,
        dialect: str,
        destructive_allowed: bool = False,
        schema: str | None = None,
    ) -> None: ...

    def qualified_table(self, table: str) -> str: ...
    async def add_column(self, table: str, column: sa.Column) -> None: ...
    async def create_table(self, name: str, *columns: sa.Column) -> None: ...
    async def create_index(
        self, name: str, table: str, columns: list[str], *, unique: bool = False
    ) -> None: ...
    async def backfill(self, table: str, column: str, default: Any) -> None: ...
    async def execute(self, stmt: Any) -> Any: ...
    async def drop_column(self, table: str, column: str) -> None: ...
    async def drop_table(self, name: str) -> None: ...
    async def drop_index(self, name: str) -> None: ...
    async def rename_column(self, table: str, old: str, new: str) -> None: ...
    async def alter_column(
        self, table: str, column: str, type_: sa.types.TypeEngine
    ) -> None: ...
```

| Operation | Released behavior |
|---|---|
| `create_table`, `add_column`, `create_index` | Skip an existing name; this does not reconcile a differently defined existing object |
| `create_table` | Column types, nullability, primary keys, column unique/index flags, server defaults, and column foreign keys; not a general `Table`/constraint compiler |
| `qualified_table` | Quotes and qualifies a fixed table name for raw SQL; use this instead of assuming migration `search_path` points at the plugin |
| `backfill` | Updates only NULL entries using a bound default value |
| `execute` | Returns the underlying SQLAlchemy result; supply bound values on the statement with `.bindparams(...)` |
| `drop_column`, `drop_table`, `drop_index` | Require `destructive_allowed=True`, supplied from the migration's `destructive` flag |
| `alter_column` | Changes type only; no `nullable=`, `server_default=`, or Alembic-style keyword API |
| SQLite rename/type/drop-column | Recreates the table; rejects composite primary keys and incoming/outgoing foreign keys |

`sa.Column` comes from SQLAlchemy. There is no `op.column()` factory. Generic types are compiled for the active dialect; PostgreSQL-only types do not automatically become SQLite-compatible. Raw SQL opts out of helper-level portability and destructive-operation checks.

For a PostgreSQL auto-generated integer key, do not assume `sa.Column("id", sa.Integer, primary_key=True)` passed to `create_table()` emits `SERIAL` or `IDENTITY`: this helper renders the column type directly. Use an explicitly tested server-side identity/sequence DDL, or an application-assigned key such as the tutorial's UUID string.

## `MigrationRunner`

```python
class MigrationRunner:
    def __init__(
        self,
        engine: AsyncEngine,
        plugin_name: str,
        dialect: str,
        schema: str | None = None,
    ) -> None: ...

    async def run(
        self,
        migrations: list[PluginMigration],
        *,
        tables_already_exist: bool = False,
    ) -> MigrationResult: ...

    @staticmethod
    def discover(package_path: str) -> list[PluginMigration]: ...
```

Use `dialect="sqlite"` or `"postgresql"`; `schema` is used only for PostgreSQL operations. The runner creates the tracking table, sorts by integer version, checks the database-ahead guard and applied class checksums, and runs pending revisions in one transaction. PostgreSQL uses an advisory transaction lock; the released SQLite implementation uses an ordinary `engine.begin()` block.

`tables_already_exist=True` stamps all supplied revisions only when there is no history. Stamping executes no migration bodies. Existing successful history is skipped after checksum validation; supplied unsuccessful history can be retried. The runner itself does not write failed-history rows when an upgrade raises.

`discover()` imports the package's immediate child modules and instantiates discovered subclasses. Do not re-export/import migration classes across those modules, which can cause duplicate discovery. Keep the full history and verify revision uniqueness in your package checks.

## `MigrationResult`

```python
@dataclass
class MigrationResult:
    current_version: int = 0
    applied: list[int] = field(default_factory=list)
    stamped: list[int] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
```

Successful calls return the current version and applied/stamped revision lists. On an upgrade failure the runner appends an error internally and **raises**, so callers do not receive a normal result to inspect. Catch `MigrationError` at a test or administrative boundary and inspect platform migration status/logs.

## Exceptions

| Exception | Trigger |
|---|---|
| `MigrationError` | Base migration failure; wraps exceptions raised inside `upgrade()` |
| `MigrationChecksumError` | A successfully recorded migration class has a different source checksum |
| `SchemaVersionAheadError` | Highest recorded version exceeds the highest supplied version |
| `DestructiveMigrationError` | Drop helper called without opt-in; becomes the cause of `MigrationError` during a runner call |

Checksums are SHA-256 of the migration **class source**, with a class-string fallback if source inspection fails. Do not edit shipped migrations or the dependencies that affect their behavior.

See [Migrations](/sdk/concepts/migrations) for installation behavior, [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) for a complete plugin, and [Backfill migrations](/sdk/recipes/backfill-migration) for executable upgrade checks.
