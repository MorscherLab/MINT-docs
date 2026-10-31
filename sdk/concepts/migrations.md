# Plugin tables and migrations

Plugins version their tables with the shared **Alembic runtime**. A plugin sets `Metadata.database` to a `MigrationSpec`. The legacy `get_migrations_package()` protocol with integer `PluginMigration` revisions is removed in MINT 1.4. A plugin that still defines `get_migrations_package()` does not load: the platform keeps it disabled and shows the reason as its `migration_error`. Moving a deployed plugin to Alembic is an explicit database transition (see [Adopting existing tables](#adopting-existing-tables)).

Use plugin-owned tables for structured drafts, run metadata, or records that need relational queries. Use [platform data repositories](/sdk/concepts/data-model) and object storage when data should participate in the experiment workflow. Neither migration protocol supplies row-level user authorization for custom tables.

## Declare the database

| Declaration | Behavior |
|---|---|
| `Metadata.database = MigrationSpec(...)` | Packaged Alembic string revisions own table creation and schema evolution. The wire capability `requires_shared_database` follows from it |
| `context.db()` | Async session for the plugin's integrated schema or prepared standalone SQLite database |

`MigrationSpec.models` is the authoritative model set for migration comparison. `get_migration_spec()`, `get_shared_models()`, `PluginDatabaseSpec` and `get_models()` are not part of the 1.4 API.

```python
from mint_sdk import Metadata, MigrationSpec, Plugin, plugin
from my_plugin.models import Panel


class MyPluginMeta(Metadata):
    domain = "drug-response"
    prefix = "/my-plugin"
    database = MigrationSpec(package="my_plugin.migrations", models=(Panel,))


@plugin(MyPluginMeta)
class MyPlugin(Plugin):
    async def list_panels(self):
        async with self.context.db() as session:
            ...
```

Do not include platform ORM models in this model set. MINT scopes PostgreSQL tables to the plugin identity (`panel-designer` becomes `panel_designer`). Keep models schema-neutral and use SDK repositories for platform data.

## Runtime and storage

| Runtime | Storage and migration path |
|---|---|
| Standalone app / `mint dev` | SQLite under `~/.mint/plugins/<plugin>/data.db` by default; SDK startup prepares the database before serving traffic |
| Installed in-process plugin | PostgreSQL plugin schema; normal entry-point loading applies migrations before `initialize()` |
| Installed isolated subprocess | `RemotePlatformContext` has no shared SQL-session bridge; `context.db()` raises `UnavailableException` and a plugin with `Metadata.database` is rejected |
| `mint dev --platform` | A proxy to the standalone runtime, not a PostgreSQL plugin installation |

Explicit module/class loading and a development proxy are not replacements for testing the installed entry-point lifecycle. Test SQLite and a disposable PostgreSQL installation when supporting both.

## Write an Alembic revision

Create an importable package with an empty `__init__.py` and revision modules directly inside it. For a worked add-column revision, see [Backfill migrations](/sdk/recipes/backfill-migration); the module shape is in the [API reference](/sdk/api/migrations#revision-module-shape).

```text
src/my_plugin/
├── models.py
├── plugin.py
└── migrations/
    ├── __init__.py
    ├── p001_initial.py
    └── p002_add_notes.py
```

Revision `upgrade()` functions are synchronous Alembic functions. MINT passes `schema` into `upgrade()` and provides the connection through its own Alembic environment. Do not add a separate `alembic.ini`, copy an `env.py`, or call `commit()`/`rollback()` in a revision.

The packaged graph must be one complete linear chain with one head: no branches, merges, or revision dependencies. Revision strings identify graph nodes; they are not increasing integers. Keep every shipped file immutable. Changes to an already-applied file are rejected.

Pass `schema=schema` to DDL operations, including indexes and batch operations. Use schema-qualified SQLAlchemy table expressions for data updates:

```python
# Inside upgrade(): values are bound by SQLAlchemy.
panels = sa.table("panels", sa.column("notes", sa.Text), schema=schema)
op.get_bind().execute(
    panels.update().where(panels.c.notes.is_(None)).values(notes="Imported panel")
)
```

For SQLite-compatible column changes use Alembic `op.batch_alter_table(..., schema=schema)` and verify the resulting indexes/constraints and preserved rows. Generic SQLAlchemy types are portable starting points; PostgreSQL JSONB/TSVECTOR behavior is not automatically available on SQLite.

## Fresh and adopted databases

For Alembic opt-in plugins, **revisions create the tables on both fresh SQLite and fresh PostgreSQL installs**. MINT does not first run model `create_all()` or stamp the baseline because the current model happens to match. Missing tables are not silently repaired by the normal plugin session path for this protocol. Identity/history tables, checksums, locking and timeouts are described in the [API reference](/sdk/api/migrations#identity-history-and-locking).

Runtime startup comparison rejects missing model tables/columns and incompatible column types. It deliberately tolerates other declarative differences at startup; `mint doctor --only db` performs the fuller Alembic comparison, including defaults, nullability, and other supported schema differences. Neither is a proof of correct historical data or every backend-specific object. Verify data transformations and constraints in tests.

The platform disables a plugin when migration startup fails, before `initialize()` or route mounting. Standalone sessions also refuse access before migration readiness. Inspect `migration_error` and fix the migration/database problem; do not erase history to make startup pass.

## Author and inspect

These commands operate on an **explicit development database**:

```bash
mint db current --database-url sqlite:////absolute/path/to/dev.db
mint doctor --only db --database-url sqlite:////absolute/path/to/dev.db
mint add migration "add panel notes" --autogenerate --database-url sqlite:////absolute/path/to/dev.db
```

`mint db current` validates and prints revision and history state without creating migration infrastructure. `mint doctor --only db` fails on model differences and needs the database at the packaged head. `mint add migration --autogenerate` compares the models against that database and writes a draft into the source migration package; if the comparison is empty, it creates **no file**. It does not write into an installed package. SQLite paths must already exist; the CLI rejects a missing file or `:memory:` URL. These commands replace `mint db check` and `mint db revision`.

There is no `mint db upgrade`, `stamp` or `downgrade` command. Application startup applies migrations. Use the [runtime API](/sdk/api/migrations) for isolated upgrade tests. Hand-author the first baseline as in [Tutorial 3](/sdk/tutorials/design-plugin-with-tables), create a blank revision with `mint add migration "<name>"`, or generate a reviewed draft. Do not confuse a generated draft with an applied change.

`mint add migration <name>` writes a blank Alembic revision into the source migration package (no database needed). A plugin with no `Metadata.database` first gets `database = MigrationSpec(package="<package>.db_revisions")`, an empty `db_revisions` package and a first revision.

## Adopting existing tables

The Alembic runtime refuses an unversioned domain containing business tables unless `MigrationSpec.legacy` supplies a validated baseline. The presence of matching table names or a legacy integer tracking row is not enough.

For a plugin that used the legacy integer protocol, declare `LegacyBaseline.from_plugin_history("<fixed-baseline>", last_version=N)` (the plugin name is the name of the plugin that declares the spec): it adopts the baseline only when the legacy history holds exactly v1..N, all successful, runs the baseline on a fresh install, and refuses an incomplete or failed history. The baseline revision must create the schema that vN produced. For any other unversioned schema, declare `LegacyBaseline(revision="<fixed-baseline>", validate=validator)`. The validator is a synchronous function receiving the active SQLAlchemy connection and schema; it must return true only when the existing deployment satisfies **that exact baseline**. Inspect required columns, types, constraints, data invariants, and the relevant old migration history for your plugin. Do not use `lambda ...: True` or compare only against evolving current model metadata.

When validation succeeds, MINT stamps the fixed packaged baseline and records its ancestors as `adopted`, then executes later revisions. When validation fails and business tables exist, startup stops. Seed/backfill effects skipped by adoption must already be true or supplied by a later revision. Keep the validator available for older supported deployments until all relevant installations have transitioned.

Test adoption from a copy of every supported legacy schema, rejection of a mismatched schema, fresh installation, and rerunning at head. Back up data and test recovery before deploying the transition. Plugin authors must implement their domain-specific adoption; the platform's own legacy migration bridge is not an automatic bridge for every plugin.

## Plugins with integer migrations

The legacy integer protocol is removed in 1.4. Before you upgrade a plugin, move it to `Metadata.database` and adopt its history with `LegacyBaseline.from_plugin_history()` as described in [Adopting existing tables](#adopting-existing-tables). `mint doctor` fails a plugin that still defines `get_migrations_package()`. The legacy history tables (`public.plugin_schema_migrations` on PostgreSQL, `_plugin_migrations` on SQLite) stay in place and are read only by the adoption baseline.

## Versioning and recovery

Keep these values separate:

| Version | Purpose |
|---|---|
| Built package version | Plugin release, derived from Git by the scaffold's `hatch-vcs` configuration |
| `Design.version` | Persisted experiment design payload format |
| `schema_revision` + `target_revision` | Alembic current and packaged string revisions. The integer `schema_version` of the legacy counter is removed |

Update models and append a revision when changing SQL. Increment the plugin release through its normal Git/version workflow. A package rollback is not a database downgrade; restore a tested backup or ship a forward repair compatible with the stored schema. The runtime does not automatically execute `downgrade()`.

Standard Alembic drop-table/column/index/constraint operations require module-level `destructive = True` under the managed runtime. This is an explicit author opt-in, not a guarantee that other operations or raw SQL cannot lose data. Review generated DDL and data transformations before applying them.

Continue with the [table tutorial](/sdk/tutorials/design-plugin-with-tables), [backfill upgrade test](/sdk/recipes/backfill-migration), and [API reference](/sdk/api/migrations).

Release sources: [migration contract](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations/runtime.py), [Alembic runtime](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations/_alembic_runtime.py), and [plugin database lifecycle](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_database.py).
