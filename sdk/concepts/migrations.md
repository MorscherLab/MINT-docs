# Plugin tables and migrations

MINT 1.2.1 supports plugin-owned SQLModel/SQLAlchemy tables with a versioned Python migration package. Use tables for structured drafts, run metadata, or application records that need queries and constraints. Use platform design/results repositories and object storage for data that belongs in the experiment workflow; see [Data model](/sdk/concepts/data-model).

This page describes the **v1.2.1 release**: `get_shared_models()`, `get_migrations_package()`, `PluginMigration`, and `MigrationRunner`. It does not describe an Alembic-based `mint db` workflow.

## The database contract

```python
from mint_sdk import AnalysisPlugin, PluginCapabilities, mint_plugin
from my_plugin.models import Panel


@mint_plugin(
    analysis_type="drug-response",
    routes_prefix="/my-plugin",
    capabilities=PluginCapabilities(requires_shared_database=True),
)
class MyPlugin(AnalysisPlugin):
    def get_shared_models(self) -> list[type]:
        return [Panel]

    def get_migrations_package(self) -> str:
        return "my_plugin.migrations"
```

These two methods are **complementary**:

| Declaration | Responsibility |
|---|---|
| `requires_shared_database=True` | Requests the platform-owned PostgreSQL schema and declares the runtime requirement |
| `get_shared_models()` | Current table definitions; local creation and model/schema checks |
| `get_migrations_package()` | Import path to append-only revisions that evolve existing tables |
| `get_plugin_db_session()` | Async session for this plugin's schema or standalone SQLite database |

Without a migration package, MINT creates missing model tables. It cannot turn a changed model into `ALTER TABLE` automatically. Once persistent users exist, add migrations before shipping schema changes.

Do not import platform ORM tables into `get_shared_models()` or hard-code a PostgreSQL schema on models. MINT derives the schema from the plugin identity (`panel-designer` becomes `panel_designer`). Use SDK repositories for platform data.

## Runtime support

| Runtime | Storage | Migration behavior |
|---|---|---|
| `mint dev` / standalone app | SQLite under `~/.mint/plugins/<plugin>/` by default | SDK creates missing model tables, runs or stamps revisions, then checks conformance |
| Installed in-process plugin | PostgreSQL plugin schema | Platform prepares schema and runs migration package before calling `initialize()` in the entry-point loading path |
| Installed isolated subprocess | `RemotePlatformContext` | Shared database capability is rejected; there is no remote SQL-session bridge |
| `mint dev --platform` | Local standalone storage behind a proxy | Does not install the plugin or migrate platform PostgreSQL |

Explicit module/class loading and development proxying are not substitutes for testing the normal installed entry-point lifecycle. SQLite tests also do not validate PostgreSQL-specific DDL.

## Write migrations

```text
src/my_plugin/
├── models.py
├── plugin.py
└── migrations/
    ├── __init__.py
    ├── v001_initial.py
    └── v002_add_notes.py
```

```python
# src/my_plugin/migrations/v002_add_notes.py
import sqlalchemy as sa
from mint_sdk.migrations import MigrationOps, PluginMigration


class AddNotes(PluginMigration):
    version = 2
    name = "add_notes"

    async def upgrade(self, op: MigrationOps) -> None:
        await op.add_column("panels", sa.Column("notes", sa.Text, nullable=True))
```

Add the corresponding `notes: str | None = None` field to the current model. Keep each revision number unique and increasing. Discovery imports modules in the named package and finds `PluginMigration` subclasses; `version` controls order, not the filename. The `depends_on` attribute exists but v1.2.1 does not use it to resolve dependencies or sort revisions.

For a populated table, add nullable columns or suitable server defaults first. An ORM `default_factory` runs in Python; it does not backfill database rows. Follow the [backfill recipe](/sdk/recipes/backfill-migration) when adding derived or required values.

## Fresh installs and stamping

`MigrationRunner.run(..., tables_already_exist=True)` stamps every supplied revision **only if no history exists**. A stamp records a checksum and success without executing `upgrade()`.

On standalone startup, the SDK first creates missing model tables. If the schema conforms, a history-free database can be stamped. If history exists, pending revisions execute even when `tables_already_exist=True`.

For installed PostgreSQL plugins that declare migrations, initial schema setup skips model table creation. The migration runner normally builds a fresh schema by executing the revisions. An existing schema with no history can instead be stamped if every declared model table and column is already present. The platform then repairs missing model tables and runs conformance checks. This baseline detection is not evidence that arbitrary data backfills, indexes, or seed inserts have run.

Consequences:

- Keep models aligned with the final migration state.
- Test both a fresh database and upgrades from each supported deployed version.
- Do not put indispensable fresh-install seed data only in `upgrade()`; a stamped installation skips it.
- Do not delete migration history to resolve a failure. That can convert an incomplete upgrade into a misleading baseline.

## Execution, locks, and failure behavior

The runner opens **one transaction for the entire run**, including migration history writes. It validates versions/checksums, then applies pending revisions in integer order. PostgreSQL uses a transaction-scoped advisory lock keyed by plugin name and a 30-second lock timeout.

The released SQLite implementation uses `engine.begin()`; despite the locking module's descriptive comments, it does not issue `BEGIN EXCLUSIVE`. Do not rely on it for production multi-process migration coordination.

A migration exception raises `MigrationError`. Earlier pending work in the same run is subject to the transaction rollback; verify SQLite DDL behavior with the actual driver. The v1.2.1 runner does **not** insert a new failed-history row, even though the tracking schema contains `success` and `error_message` columns. The platform records `migration_error` in plugin status; do not infer successful migration from process startup alone. Database-session conformance checks can also reject access to a mismatched schema.

All revisions in a run share the connection and transaction. A loop of 5,000-row updates does not create separate transactions or release the migration lock between batches.

## History and version checks

PostgreSQL stores history in `public.plugin_schema_migrations`; SQLite uses `_plugin_migrations`. Records contain plugin name, integer version, label, timestamp, source checksum, success, and optional error text.

| Guard | Meaning and response |
|---|---|
| `MigrationChecksumError` | A successfully applied class's source differs. Restore the released source and append a new revision. |
| `SchemaVersionAheadError` | Recorded database version exceeds the highest supplied revision. Restore a compatible plugin; do not install an older wheel over a newer schema. |
| `DestructiveMigrationError` | A drop helper was used without `destructive = True`; inside the runner it is wrapped in `MigrationError`. |
| Model/schema mismatch | A declared table or column is missing. Compare current models, actual schema, and migration history. |

Keep revisions immutable after release. Checksums cover the **migration class source**, not the entire module or external helpers: preserve helper behavior and constants too. Unique revision numbering and keeping the full shipped history are author responsibilities; the runner is not a migration graph validator.

The v1.2.1 conformance checks only detect missing tables and columns. They do not validate types, nullability, keys, indexes, defaults, constraints, or transformed data. Verify those explicitly in upgrade tests.

## Package, design, and SQL versions

The built package version identifies the plugin release; the scaffold derives it from Git through `hatch-vcs` and records it in wheel metadata. `schema_version` on `@mint_plugin` labels persisted design data. `PluginMigration.version` is the SQL revision. None automatically advances another.

When releasing a schema change: update the current model, append a migration, update the plugin package version, and test both fresh install and upgrade. Preserve design-data compatibility separately if its payload changes. A `downgrade()` override is available on a migration class, but the v1.2.1 runner only executes upgrades and the CLI has no automatic downgrade command. Treat rollback as a tested backup/restore or forward-fix procedure.

## Raw SQL and backend differences

Migration operations qualify plugin tables themselves. Raw SQL must do so explicitly because the PostgreSQL runner resets `search_path` to `public`:

```python
import sqlalchemy as sa

# Inside upgrade(op): table name is a fixed developer-owned identifier.
table = op.qualified_table("panels")
await op.execute(
    sa.text(f"UPDATE {table} SET notes = :value WHERE notes IS NULL")
    .bindparams(value="Imported panel")
)
```

Parameterize values; never interpolate request data into SQL. Prefer generic SQLAlchemy types for portable migrations. PostgreSQL `JSONB`, `UUID`, and `TSVECTOR` do **not** automatically map to SQLite types in this migration API. `alter_column(table, column, type_)` changes a type only; it has no `nullable=` option.

`drop_table`, `drop_column`, and `drop_index` require `destructive = True`. SQLite rename/type/drop-column operations use table recreation and reject tables with composite primary keys or incoming/outgoing foreign keys. Use carefully tested explicit DDL or an additive change when those limitations apply.

Continue with the [table tutorial](/sdk/tutorials/design-plugin-with-tables), [backfill tests](/sdk/recipes/backfill-migration), and [exact API signatures](/sdk/api/migrations).

Release sources: [SDK database lifecycle](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/plugin_database.py), [migration runner](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/migrations/runner.py), and [platform schema setup](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/plugins/plugin_schema_setup.py).
