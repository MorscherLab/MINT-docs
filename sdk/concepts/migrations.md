# Plugin tables and migrations

MINT 1.2.6 offers two supported migration protocols. New plugins can opt into the shared **Alembic runtime**, introduced in 1.2.2, by returning `MigrationSpec` from `get_migration_spec()`. Existing plugins can keep `get_migrations_package()` and integer `PluginMigration` revisions. These declarations are mutually exclusive; adopting Alembic is an explicit database transition, not a rename of the old hook.

Use plugin-owned tables for structured drafts, run metadata, or records that need relational queries. Use [platform data repositories](/sdk/concepts/data-model) and object storage when data should participate in the experiment workflow. Neither migration protocol supplies row-level user authorization for custom tables.

## Choose the database contract

| Declaration | Behavior |
|---|---|
| `get_migration_spec() -> MigrationSpec` | Packaged Alembic string revisions own table creation and schema evolution |
| `get_migrations_package() -> str` | Retained legacy framework with integer revisions and legacy baseline stamping |
| `get_shared_models()` only | Creates missing model tables; does not evolve existing columns |
| `requires_shared_database=True` | Declares that the installed plugin requires the in-process PostgreSQL schema |
| `get_plugin_db_session()` | Async session for the plugin's integrated schema or prepared standalone SQLite database |

The model hook can coexist with either protocol. With Alembic, `MigrationSpec.models` is the authoritative model set for migration comparison; keep any `get_shared_models()` override consistent with it. `PluginDatabaseSpec` and `get_models()` are not the released API.

```python
from mint_sdk import AnalysisPlugin, PluginCapabilities, mint_plugin
from mint_sdk.migrations import MigrationSpec
from my_plugin.models import Panel


@mint_plugin(
    analysis_type="drug-response",
    routes_prefix="/my-plugin",
    capabilities=PluginCapabilities(requires_shared_database=True),
)
class MyPlugin(AnalysisPlugin):
    def get_shared_models(self) -> list[type]:
        return [Panel]

    def get_migration_spec(self) -> MigrationSpec:
        return MigrationSpec(package="my_plugin.migrations", models=(Panel,))
```

Do not include platform ORM models in this model set. MINT scopes PostgreSQL tables to the plugin identity (`panel-designer` becomes `panel_designer`). Keep models schema-neutral and use SDK repositories for platform data.

## Runtime and storage

| Runtime | Storage and migration path |
|---|---|
| Standalone app / `mint dev` | SQLite under `~/.mint/plugins/<plugin>/data.db` by default; SDK startup prepares the database before serving traffic |
| Installed in-process plugin | PostgreSQL plugin schema; normal entry-point loading applies migrations before `initialize()` |
| Installed isolated subprocess | `RemotePlatformContext` has no shared SQL-session bridge; `requires_shared_database=True` is rejected |
| `mint dev --platform` | A proxy to the standalone runtime, not a PostgreSQL plugin installation |

Explicit module/class loading and a development proxy are not replacements for testing the installed entry-point lifecycle. Test SQLite and a disposable PostgreSQL installation when supporting both.

## Write an Alembic revision

Create an importable package with an empty `__init__.py` and revision modules directly inside it:

```text
src/my_plugin/
├── models.py
├── plugin.py
└── migrations/
    ├── __init__.py
    ├── p001_initial.py
    └── p002_add_notes.py
```

```python
# p002_add_notes.py — the baseline p001 must already create panels.
from alembic import op
import sqlalchemy as sa

revision = "p002"
down_revision = "p001"
branch_labels = None
depends_on = None
destructive = False


def upgrade(*, schema: str | None) -> None:
    op.add_column("panels", sa.Column("notes", sa.Text, nullable=True), schema=schema)
```

These are synchronous Alembic functions. MINT passes `schema` into `upgrade()` and provides the connection through its own Alembic environment. Do not add a separate `alembic.ini`, copy an `env.py`, or call `commit()`/`rollback()` in a revision.

The packaged graph must be one complete linear chain with one head: no branches, merges, or revision dependencies. Revision strings identify graph nodes; they are not increasing integers. Keep every shipped file immutable. Checksums cover the entire revision file, plus explicitly listed relative helper files in its optional `checksum_files` iterable. Changes to an already-applied file are rejected.

Pass `schema=schema` to DDL operations, including indexes and batch operations. Use schema-qualified SQLAlchemy table expressions for data updates:

```python
# Inside upgrade(): values are bound by SQLAlchemy.
panels = sa.table("panels", sa.column("notes", sa.Text), schema=schema)
op.get_bind().execute(
    panels.update().where(panels.c.notes.is_(None)).values(notes="Imported panel")
)
```

For SQLite-compatible column changes use Alembic `op.batch_alter_table(..., schema=schema)` and verify the resulting indexes/constraints and preserved rows. Generic SQLAlchemy types are portable starting points; PostgreSQL JSONB/TSVECTOR behavior is not automatically available on SQLite.

## Fresh installs, checks, and transactions

For Alembic opt-in plugins, **revisions create the tables on both fresh SQLite and fresh PostgreSQL installs**. MINT does not first run model `create_all()` or stamp the baseline because the current model happens to match. Missing tables are not silently repaired by the normal plugin session path for this protocol.

Each database domain has `_mint_database_identity`, `alembic_version`, and `_mint_migration_history`. The owner is `plugin:<entry-point-name>`; history records applied/adopted revision checksums. A mismatched owner, unknown current revision, incomplete history, or edited applied file stops the operation. An older plugin cannot reopen a database containing a revision it does not package. Legacy/model-only startup also refuses a database with an active Alembic revision.

All pending revisions run inside the host's transaction. PostgreSQL uses advisory locks on the physical database/schema domain and the legacy plugin key; DDL lock waits are bounded to 30 seconds after the advisory locks are acquired. SQLite uses `BEGIN IMMEDIATE` with a 30-second busy timeout. During SQLite upgrades the runtime temporarily disables foreign-key enforcement for batch table replacement, checks foreign-key integrity before commit, and restores the connection setting. A migration failure rolls back the migration batch and its history changes.

Runtime startup comparison rejects missing model tables/columns and incompatible column types. It deliberately tolerates other declarative differences at startup; `mint db check` performs the fuller Alembic comparison, including defaults, nullability, and other supported schema differences. Neither is a proof of correct historical data or every backend-specific object. Verify data transformations and constraints in tests.

The platform disables an Alembic plugin when migration startup fails, before `initialize()` or route mounting. Standalone sessions also refuse access before migration readiness. Inspect `migration_error` and fix the migration/database problem; do not erase history to make startup pass.

## Author and inspect with `mint db`

These commands operate on an **explicit development database**:

```bash
mint db current --path . --database-url sqlite:////absolute/path/to/dev.db
mint db check --path . --database-url sqlite:////absolute/path/to/dev.db
mint db revision "add panel notes" --path . --database-url sqlite:////absolute/path/to/dev.db
```

`current` validates and prints revision/history state without creating migration infrastructure. `check` fails on model differences and requires the database to be at the packaged head. `revision` compares models against that database and writes a draft into the source migration package; if the comparison is empty, it creates **no file**. It does not write into an installed package. SQLite paths must already exist; the CLI rejects a missing file or `:memory:` URL.

There is no `mint db upgrade`, `stamp`, or `downgrade` command. Application startup applies migrations. Use the [runtime API](/sdk/api/migrations) for isolated upgrade tests. Hand-author the first baseline as in [Tutorial 3](/sdk/tutorials/design-plugin-with-tables), or deliberately author/generate a reviewed source revision; don't confuse a generated draft with an applied change.

`mint add migration <name>` remains the legacy scaffolder. It does not switch an existing integer migration package to Alembic.

## Adopting existing tables

The Alembic runtime refuses an unversioned domain containing business tables unless `MigrationSpec.legacy` supplies a validated baseline. The presence of matching table names or a legacy integer tracking row is not enough.

Declare `LegacyBaseline(revision="<fixed-baseline>", validate=validator)`. The validator is a synchronous function receiving the active SQLAlchemy connection and schema; it must return true only when the existing deployment satisfies **that exact baseline**. Inspect required columns, types, constraints, data invariants, and the relevant old migration history for your plugin. Do not use `lambda ...: True` or compare only against evolving current model metadata.

When validation succeeds, MINT stamps the fixed packaged baseline and records its ancestors as `adopted`, then executes later revisions. When validation fails and business tables exist, startup stops. Seed/backfill effects skipped by adoption must already be true or supplied by a later revision. Keep the validator available for older supported deployments until all relevant installations have transitioned.

Test adoption from a copy of every supported legacy schema, rejection of a mismatched schema, fresh installation, and rerunning at head. Back up data and test recovery before deploying the transition. Plugin authors must implement their domain-specific adoption; the platform's own legacy migration bridge is not an automatic bridge for every plugin.

## Existing plugins with integer migrations

The previous declaration remains supported:

```python
class MyPlugin(AnalysisPlugin):
    def get_shared_models(self) -> list[type]:
        return [Panel]

    def get_migrations_package(self) -> str:
        return "my_plugin.migrations"
```

Its modules contain `PluginMigration` subclasses with integer `version`, string `name`, and async `upgrade(self, op: MigrationOps)`. The legacy runner stores integers in `public.plugin_schema_migrations` on PostgreSQL or `_plugin_migrations` on SQLite, checks migration-class source checksums, and rejects a recorded version above the highest supplied integer.

Models and the legacy migration hook remain complementary. Standalone creates missing model tables first and may stamp all supplied integers when there is no history and the current tables/columns conform. Installed PostgreSQL normally executes initial revisions; an existing model-conforming schema without history may be stamped. Stamping does not run migration bodies or prove seed/backfill data exists.

Legacy `MigrationOps` is distinct from Alembic `op`: it has async helper methods, `qualified_table()` for raw SQL, and `alter_column(table, column, type_)` with no `nullable=` option. Legacy SQLite rename/type/drop-column operations use a limited table-recreation path. See the [legacy API reference](/sdk/api/migrations#legacy-integer-migration-api) before maintaining these revisions.

Integer `depends_on` is not used to resolve a graph. Keep unique increasing numbers and complete immutable history. Legacy class checksums do not include arbitrary external helpers. The legacy runner uses its existing transaction/locking path; its SQLite helper does not provide the new Alembic runtime's `BEGIN IMMEDIATE` behavior. Do not transfer the modern fail-closed startup guarantee to every legacy/model-only status error: inspect platform status and session conformance failures explicitly.

## Versioning and recovery

Keep these values separate:

| Version | Purpose |
|---|---|
| Built package version | Plugin release, derived from Git by the scaffold's `hatch-vcs` configuration |
| `schema_version` / design schema version | Persisted experiment design payload format |
| `schema_revision` + `target_revision` | Alembic current and packaged string revisions; `schema_version` status is `None` |
| Legacy integer `schema_version` | Old `PluginMigration` revision counter |

Update models and append a revision when changing SQL. Increment the plugin release through its normal Git/version workflow. A package rollback is not a database downgrade; restore a tested backup or ship a forward repair compatible with the stored schema. The runtime does not automatically execute `downgrade()`.

Standard Alembic drop-table/column/index/constraint operations require module-level `destructive = True` under the managed runtime. This is an explicit author opt-in, not a guarantee that other operations or raw SQL cannot lose data. Review generated DDL and data transformations before applying them.

Continue with the [table tutorial](/sdk/tutorials/design-plugin-with-tables), [backfill upgrade test](/sdk/recipes/backfill-migration), and [API reference](/sdk/api/migrations).

Release sources: [migration contract](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/migrations/runtime.py), [Alembic runtime](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/migrations/_alembic_runtime.py), and [plugin database lifecycle](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/plugin_database.py).
