# Migrations reference — @MINT_VERSION@

`mint_sdk.migrations` is the Alembic runtime for the tables that a plugin owns. `MigrationSpec` and `LegacyBaseline` are also exported from the `mint_sdk` package root. The legacy integer framework (`PluginMigration`, `MigrationOps`, `MigrationRunner`) does not exist since MINT 1.4. Source: [v@MINT_VERSION@ migrations package](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations).

The `local-db` extra requires sqlmodel 0.0.47 or later. This release maps a plain `datetime` field to a timezone-aware column and refuses naive values on write. Write aware datetimes to such a field. To keep an existing naive column, type the field as `NaiveDatetime` or use `Field(sa_type=DateTime(timezone=False))`. Run `mint doctor --only db --database-url URL` to compare the models with the database.

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

`LegacyBaseline.from_plugin_history()` builds the baseline for a plugin that moves off the legacy integer protocol. Pass `revision` and `last_version`; `plugin_name` defaults to the declaring plugin. The rules:

- The runtime adopts `revision` when the legacy history holds exactly versions 1..`last_version`, all successful. The history is in `public.plugin_schema_migrations` on PostgreSQL and `_plugin_migrations` on SQLite.
- No legacy history means a fresh install: the runtime runs the baseline revision.
- An incomplete, failed or newer history raises `MigrationError`.
- The optional `validate` callable can raise for plugin-specific data checks. Then the runtime compares the adopted schema with `MigrationSpec.models` before the commit.

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

`mint add migration NAME` scaffolds the declaration and the `db_revisions` package.

A plugin that still defines `get_migrations_package()` does not load. The platform loader keeps it disabled with a `migration_error`, `mint doctor` fails it, and standalone database setup raises `ConfigurationException`. `get_migration_spec()` and `get_shared_models()` are also removed: `Metadata.database` replaces them.

The revision graph must be one complete linear chain. The database head and the recorded history must match it. A model cannot claim the internal migration tables of MINT. A reference to a table outside the domain can be a reference-only metadata stub; it gives no permission to change that domain. A reference to an undeclared table in the same domain is refused.

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

`upgrade` is synchronous. MINT gives it the connection and the keyword `schema`. Bind every table and index operation to that schema. Each file in `checksum_files` must be inside the revision directory tree. Its name and bytes go into the checksum, together with the whole revision file.

A drop of a table, column, index or constraint needs `destructive = True`. Raw SQL does not remove the need to review the data-loss risk. Revision code must not commit, roll back or start a separate transaction. No runtime function on this page calls `downgrade()`.

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

`generate_revision(..., engine=None, autogenerate=False)` writes an empty source revision. The CLI command for an autogenerated revision is `mint add migration NAME --autogenerate --database-url URL`; it refuses a revision package in an installed (site-packages) location. Do not call the authoring functions at production startup.

At startup, `run_migrations` refuses missing tables or columns and incompatible types. `check_migrations` does the full declarative comparison. A successful `inspect_migrations` is not a full schema or data check.

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

`schema_revision` and `target_revision` hold the string revisions. The integer `schema_version` is not used: read `schema_revision`. The admin plugin list shows `migration_backend`, `schema_revision`, `target_revision`, `pending_migrations` and `migration_error`. A runtime function raises on an error; it does not return a failure status. The platform catches startup errors and shows them in `migration_error`.

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

Each database domain has the tables `_mint_database_identity`, `alembic_version` and `_mint_migration_history`. The owner is `plugin:<entry-point-name>`. The history records the checksum of each applied or adopted revision. These conditions stop the operation: a different owner, an unknown current revision, an incomplete history, or a changed applied file. An older plugin cannot open a database that has a revision that the plugin does not package. A startup without Alembic (legacy or model-only) also refuses a database with an Alembic revision.

All pending revisions run in one host transaction. A failure rolls back the batch and its history rows.

- PostgreSQL: advisory locks on the database/schema domain and on the legacy plugin key. After the advisory locks, a DDL lock wait is at most 30 seconds.
- SQLite: `BEGIN IMMEDIATE` with a 30-second busy timeout. During an upgrade the runtime disables foreign-key enforcement for batch table replacement, checks foreign-key integrity before the commit, then restores the setting.

## Alembic errors and recovery

The runtime raises `MigrationError` for an invalid owner or scope, an invalid revision graph, an unknown stored revision, a history or checksum mismatch, a refused baseline adoption and incompatible model drift. A drop without `destructive = True` raises `DestructiveMigrationError`. Database errors and errors in revision code pass through unchanged.

To recover, restore the released revision files unchanged, add a reviewed forward repair revision, or restore a tested backup. Do not delete the identity or history tables, and do not stamp an unknown database by hand: the runtime needs that evidence.

## The platform's own revisions

The platform uses the same runtime for its own schema (`owner="platform"`, `schema="public"`). Its revisions are in `api/db_revisions/` of the MINT repository. Use `mint-platform db current|check|revision` in the platform checkout. The platform refuses a database that has no `alembic_version` and still has the `schema_migrations` table of the removed integer runner: upgrade through MINT 1.2.2 or a later 1.2.x first.

See [Migrations](/sdk/concepts/migrations) for installation behavior, [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) for a complete plugin, and [Backfill migrations](/sdk/recipes/backfill-migration) for executable upgrade checks.
