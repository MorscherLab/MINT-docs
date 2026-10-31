# Migrations reference — @MINT_VERSION@

`mint_sdk.migrations` exports the shared Alembic runtime. The legacy integer framework (`PluginMigration`, `MigrationOps`, `MigrationRunner`) is removed in MINT 1.4. `MigrationSpec` and `LegacyBaseline` are also exported from the `mint_sdk` package root. Source: [v@MINT_VERSION@ migrations package](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations).

The sqlmodel release that the `local-db` extra requires (0.0.47 or later) maps a plain `datetime` model field to a timezone-aware column and rejects naive values on write. A plugin table with `datetime` fields needs aware datetimes. To keep an existing naive column, type the field as `NaiveDatetime` or use `Field(sa_type=DateTime(timezone=False))`. Run `mint doctor --only db --database-url URL` to compare the models with the database.

## `MigrationSpec` and `LegacyBaseline`

```python
@dataclass(frozen=True)
class LegacyBaseline:
    revision: str
    validate: Callable[[Connection, str | None], bool]

    @classmethod
    def from_plugin_history(
        cls,
        revision: str,
        *,
        last_version: int,
        plugin_name: str | None = None,
        validate: Callable[[Connection, str | None], None] | None = None,
    ) -> LegacyBaseline: ...


@dataclass(frozen=True)
class MigrationSpec:
    package: str
    models: tuple[type, ...] = ()
    legacy: LegacyBaseline | None = None
    managed_tables: tuple[str, ...] = ()
```

| Field | Meaning |
|---|---|
| `package` | Importable, single-filesystem-location package containing standard Alembic revision modules |
| `models` | Unique owned ORM model classes with `__table__`; used for scoped comparison, not automatic table creation |
| `legacy` | Optional fixed baseline and synchronous validator for explicit adoption of an existing unversioned schema |
| `managed_tables` | Additional owned table names used in scope filtering, particularly a shared `public` domain; not an ignore list or permission to skip DDL |

`LegacyBaseline.from_plugin_history()` builds the baseline for a plugin moving off the legacy integer protocol. It adopts `revision` when the legacy history of `plugin_name` in `public.plugin_schema_migrations` on PostgreSQL or `_plugin_migrations` on SQLite holds exactly versions 1..`last_version`, all successful. No legacy history means a fresh install, which runs the baseline revision. An incomplete, failed or newer history raises `MigrationError`. The optional `validate` callable may raise for plugin-specific data checks; the runtime then compares the adopted schema with `MigrationSpec.models` before committing. `plugin_name` defaults to the name of the plugin that declares the spec, so a plugin passes only `revision` and `last_version`.

Declare the spec in the plugin `Metadata`:

```python
from mint_sdk import LegacyBaseline, Metadata, MigrationSpec


class Planner(Metadata):
    domain = "ms-planning"
    database = MigrationSpec(
        package="mint_plugin_ms_planner.db_revisions",
        models=(Instrument, ScheduledRun),
        legacy=LegacyBaseline.from_plugin_history("baseline", last_version=6),
    )
```

`mint add migration NAME` scaffolds the declaration and the `db_revisions` package. A plugin that still defines `get_migrations_package()` does not load on a 1.4 platform: the loader keeps it disabled with a `migration_error`, `mint doctor` fails it, and standalone database setup raises `ConfigurationException`. `get_migration_spec()` and `get_shared_models()` are removed too: `Metadata.database` replaces them.

The revision graph must be a single complete linear chain; the database head and recorded ancestor history must match it. Models cannot claim MINT's internal migration tables. Foreign references outside the domain can be represented as reference-only metadata stubs; this does not grant permission to mutate another domain. A reference to an undeclared table in the same owned domain is rejected.

## Revision module shape

```python
from alembic import op
import sqlalchemy as sa

revision = "p002"
down_revision = "p001"
branch_labels = None
depends_on = None
destructive = False
# Optional frozen helpers, relative to this revision's directory:
# checksum_files = ("frozen_helpers/backfill.py",)


def upgrade(*, schema: str | None) -> None:
    op.add_column("panels", sa.Column("notes", sa.Text, nullable=True), schema=schema)


def downgrade(*, schema: str | None) -> None:
    raise NotImplementedError("Use a reviewed forward migration or restore a backup")
```

`upgrade` is **synchronous**. MINT provides the connection and keyword `schema` through its managed Alembic environment. Bind every table/index operation to that schema. `checksum_files` files must exist inside the revision directory tree; their names and bytes participate in the checksum alongside the entire revision file.

Managed drop-table, drop-column, drop-index, and drop-constraint operations require `destructive = True`. Raw SQL is not a substitute for reviewing data-loss risk. Revision code may not commit, roll back, or start a separate host transaction. No runtime API below calls `downgrade()`.

## Runtime functions

```python
async def run_migrations(
    engine: AsyncEngine, spec: MigrationSpec, *, owner: str, schema: str | None
) -> MigrationStatus: ...

async def inspect_migrations(
    engine: AsyncEngine, spec: MigrationSpec, *, owner: str, schema: str | None
) -> MigrationStatus: ...

async def check_migrations(
    engine: AsyncEngine, spec: MigrationSpec, *, owner: str, schema: str | None
) -> list[Any]: ...

async def generate_revision(
    engine: AsyncEngine | None, spec: MigrationSpec, *,
    owner: str, schema: str | None, message: str, autogenerate: bool = True,
) -> str | None: ...

async def ensure_database_identity(
    engine: AsyncEngine, *, owner: str, schema: str | None
) -> None: ...

# Async context manager yielding an AsyncConnection:
def migration_connection(
    engine: AsyncEngine, *, owner: str, schema: str | None, create: bool = True
): ...
```

Use `owner="plugin:<canonical-plugin-id>"` and `schema=None` for standalone SQLite. PostgreSQL requires a valid, nonreserved plugin schema; `owner="platform"` is reserved for the platform and must use `schema="public"`.

| Function | Behavior |
|---|---|
| `run_migrations` | Creates/validates identity, applies pending revisions and records history in one managed transaction; a fresh domain must have a packaged baseline |
| `inspect_migrations` | Reads and validates current revision, owner, history, and checksums; does not create migration infrastructure or apply repairs |
| `check_migrations` | Requires packaged head, then returns the scoped Alembic model/schema differences; empty list means no detected differences |
| `generate_revision` | Writes a reviewable revision path; returns `None` for an empty autogenerated diff; autogenerate needs an explicit development engine |
| `ensure_database_identity` | Claims/checks the database domain without inventing a migration revision; not a baseline adoption helper |
| `migration_connection` | Locks and validates the physical domain; low-level host support, not a replacement for normal application sessions |

`generate_revision(..., engine=None, autogenerate=False)` can author an empty source revision programmatically. The CLI exposes the database-backed autogenerated path as `mint add migration NAME --autogenerate --database-url URL`. CLI source checks additionally reject installed/site-packages revision locations. Do not invoke authoring functions during production startup.

Startup comparison in `run_migrations` rejects missing tables/columns and type incompatibility; `check_migrations` performs the fuller declarative comparison. A successful status inspection is not a full schema or data check.

## `MigrationStatus`

```python
@dataclass(frozen=True)
class MigrationStatus:
    schema_revision: str | None
    target_revision: str | None
    pending_migrations: int
    migration_backend: str = "alembic"
    schema_version: int | None = None
    migration_error: str | None = None
```

String revisions belong in `schema_revision` and `target_revision`. The integer `schema_version` field is removed with the legacy protocol; read `schema_revision` (the admin plugin list shows `migration_backend`, `schema_revision`, `target_revision`, `pending_migrations` and `migration_error`). Errors in runtime operations raise rather than returning a normal failure result. The platform catches startup errors and publishes failure status including `migration_error`.

## Plugin database access

A plugin declares its tables once, with `Metadata.database`. It opens a session with `context.db()`:

```python
async with self.context.db() as session:
    session.add(Panel(name="A"))
    await session.commit()
```

`context.db()` is an async context manager that yields an `AsyncSession`. Integrated, it uses the plugin PostgreSQL schema. Standalone, it uses the plugin SQLite database. The standalone app (`mint_sdk.app.create_app`) and `Harness` prepare storage and apply the revisions. In subprocess isolation mode, `context.db()` raises `UnavailableException`: a plugin that needs the shared schema runs in-process. A successful session exit commits, and an exception rolls back.

`mint_sdk.plugin_database.ensure_standalone_plugin_database(plugin, ...)` returns `PluginDatabaseState`: `mode`, `migration_backend`, `schema_revision`, `target_revision`, `pending_migrations`, `migration_error`, `conformance` and the derived `ok`. With a spec, `run_migrations=False` inspects the existing database and rejects a missing head, pending revisions or model drift. It does not initialize a fresh schema.

## Schema conformance helpers

`mint_sdk.migrations` also exports the helpers behind the `conformance` field of `PluginDatabaseState`. Import `SchemaConformanceIssue`, `SchemaConformanceReport` and `check_model_schema_conformance` from `mint_sdk.migrations`.

```python
@dataclass(frozen=True, slots=True)
class SchemaConformanceIssue:
    code: str            # "missing_table" or "missing_column"
    message: str
    table: str
    column: str | None = None

@dataclass(frozen=True, slots=True)
class SchemaConformanceReport:
    issues: list[SchemaConformanceIssue] = field(default_factory=list)
    # properties: ok, missing_tables, missing_columns

async def check_model_schema_conformance(
    engine, *, dialect: str, models: list[type] | tuple[type, ...] | None, schema: str | None = None
) -> SchemaConformanceReport: ...
async def inspect_database_columns(
    engine, *, dialect: str, table_names: list[str], schema: str | None = None
) -> dict[str, set[str]]: ...
def model_tables(models) -> dict[str, Any]: ...
def model_table_columns(models) -> dict[str, set[str]]: ...
def format_conformance_issues(report: SchemaConformanceReport, *, limit: int = 5) -> str: ...
```

The check reports only missing model tables and columns; it does not compare types, defaults, or constraints. Use `check_migrations` or `mint doctor --only db` for a full comparison.

## Identity, history and locking

Each database domain has `_mint_database_identity`, `alembic_version`, and `_mint_migration_history`. The owner is `plugin:<entry-point-name>`; history records applied/adopted revision checksums. A mismatched owner, unknown current revision, incomplete history, or edited applied file stops the operation. An older plugin cannot reopen a database containing a revision it does not package. Legacy/model-only startup also refuses a database with an active Alembic revision.

All pending revisions run inside the host's transaction. PostgreSQL uses advisory locks on the physical database/schema domain and the legacy plugin key; DDL lock waits are bounded to 30 seconds after the advisory locks are acquired. SQLite uses `BEGIN IMMEDIATE` with a 30-second busy timeout. During SQLite upgrades the runtime temporarily disables foreign-key enforcement for batch table replacement, checks foreign-key integrity before commit, and restores the connection setting. A migration failure rolls back the migration batch and its history changes.

## Alembic errors and recovery

The runtime uses `MigrationError` for invalid owner/scope, invalid revision graph, unknown stored revision, history/checksum mismatch, rejected baseline adoption, and incompatible model drift. Managed drops can raise `DestructiveMigrationError`; SQL/database errors and errors raised inside revision code can propagate directly.

Recover with compatible immutable revision files, a reviewed forward repair, or tested backup restoration. Removing identity/history tables or manually stamping an unknown database bypasses the evidence that the runtime requires.

## The platform's own revisions

The platform applies its schema with the same runtime (`owner="platform"`, `schema="public"`). Its revisions live in `api/db_revisions/` of the MINT repository. Use `mint-platform db current|check|revision` in the platform checkout, not `mint db ... --target platform`. A database that has no `alembic_version` and still has the `schema_migrations` table of the removed integer runner is refused: upgrade through MINT 1.2.x (1.2.2 or later) first.

See [Migrations](/sdk/concepts/migrations) for installation behavior, [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) for a complete plugin, and [Backfill migrations](/sdk/recipes/backfill-migration) for executable upgrade checks.
