# Plugin tables and migrations

A plugin that owns SQL tables versions them with the shared Alembic runtime. Set `Metadata.database` to a `MigrationSpec`. The exact API is in the [Migrations reference](/sdk/api/migrations).

Use plugin-owned tables for structured drafts, run metadata or records that need relational queries. Use the [platform data](/sdk/concepts/data-model) and object storage for data that is part of the experiment workflow. Migrations do not add row-level user authorization to your tables; see [Querying plugin-owned tables](/sdk/recipes/querying-plugin-data#read-within-a-scoped-session).

## Declare the database

| Declaration | Behavior |
|---|---|
| `Metadata.database = MigrationSpec(...)` | Packaged Alembic revisions create and change the tables. The wire capability `requires_shared_database` follows from it |
| `context.db()` | Async session for the integrated schema of the plugin, or for the prepared standalone SQLite database |

`MigrationSpec.models` is the model set that migration comparison uses.

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

Do not put platform ORM models in this model set. MINT scopes the PostgreSQL tables to the plugin identity (`panel-designer` becomes `panel_designer`). Keep the models schema-neutral, and use the SDK repositories for platform data.

## Runtime and storage

Standalone `mint dev` uses SQLite at `~/.mint/plugins/<plugin>/data.db` by default; the SDK prepares the database before it serves traffic. An installed in-process plugin uses a PostgreSQL schema, and the platform applies the migrations before `initialize()`. An isolated subprocess cannot use plugin-owned tables. See [Isolation](/sdk/concepts/isolation#runtime-comparison).

A development proxy does not replace a test of the installed entry-point lifecycle. When you support both databases, test SQLite and a disposable PostgreSQL installation.

## Write an Alembic revision

Create an importable package with an empty `__init__.py`, and put the revision modules directly in it:

```text
src/my_plugin/
├── models.py
├── plugin.py
└── migrations/
    ├── __init__.py
    ├── p001_initial.py
    └── p002_add_notes.py
```

A revision has a synchronous `upgrade()` that receives `schema`. Do not add an `alembic.ini` or an `env.py`, and do not commit or roll back in a revision. See [Revision module shape](/sdk/api/migrations#revision-module-shape). For a worked add-column revision, see [Backfill migrations](/sdk/recipes/backfill-migration).

The packaged revisions must be one linear chain with one head: no branches, merges or revision dependencies. A revision string names a node in the chain; it is not an increasing integer.

Pass `schema=schema` to every DDL operation, also to indexes and batch operations. For data updates, use schema-qualified SQLAlchemy table expressions:

```python
panels = sa.table("panels", sa.column("notes", sa.Text), schema=schema)
op.get_bind().execute(
    panels.update().where(panels.c.notes.is_(None)).values(notes="Imported panel")
)
```

For SQLite-compatible column changes, use `op.batch_alter_table(..., schema=schema)`. Then check the indexes, constraints and kept rows. Generic SQLAlchemy types work on both databases. PostgreSQL JSONB and TSVECTOR behavior is not available on SQLite.

## Fresh databases

The revisions create the tables on a fresh SQLite and a fresh PostgreSQL database. MINT does not run `create_all()` from the models first, and it does not stamp the baseline when the current model matches. The normal session path does not repair missing tables. For the identity and history tables, checksums, locks and timeouts, see [Identity, history and locking](/sdk/api/migrations#identity-history-and-locking).

At startup, the runtime refuses missing model tables or columns and incompatible column types. It accepts other model differences at startup. `mint doctor --only db` does the full Alembic comparison, which includes defaults and nullability. Neither check proves that historical data or every backend-specific object is correct. Test data transformations and constraints.

When a migration fails at startup, the platform disables the plugin before `initialize()` and before it mounts the routes. A standalone session also refuses access until the migrations are complete. Read `migration_error` and fix the migration or the database. Do not erase the history to make startup pass.

## Author and inspect

These commands work on an explicit development database:

```bash
mint db current --database-url sqlite:////absolute/path/to/dev.db
mint doctor --only db --database-url sqlite:////absolute/path/to/dev.db
mint add migration "add panel notes" --autogenerate --database-url sqlite:////absolute/path/to/dev.db
```

- `mint db current` validates and prints the revision and history state. It creates no migration tables.
- `mint doctor --only db` fails on model differences. The database must be at the packaged head.
- `mint add migration --autogenerate` compares the models with that database and writes a draft into the source migration package. When there is no difference, it creates no file. It never writes into an installed package.
- `mint add migration <name>` without `--autogenerate` writes a blank revision and needs no database. A plugin with no `Metadata.database` first gets `database = MigrationSpec(package="<package>.db_revisions")`, an empty `db_revisions` package and a first revision.

A SQLite path must exist; the CLI refuses a missing file and a `:memory:` URL.

There is no `mint db upgrade`, `stamp` or `downgrade` command. Application startup applies the migrations. For isolated upgrade tests, use the [runtime API](/sdk/api/migrations#runtime-functions). Write the first baseline by hand as in [Tutorial 3](/sdk/tutorials/design-plugin-with-tables), or create it with `mint add migration`. A generated draft is not an applied change.

## Adopting existing tables

The Alembic runtime refuses an unversioned schema that has business tables, unless `MigrationSpec.legacy` supplies a validated baseline. Matching table names or a legacy integer tracking row are not enough.

The legacy integer migration protocol (`get_migrations_package()`) is removed. The platform keeps a plugin that still defines it disabled, with the reason in `migration_error`, and `mint doctor` fails it. To move such a plugin, declare `legacy=LegacyBaseline.from_plugin_history("<baseline>", last_version=N)`. The baseline revision must create the schema that legacy version N produced. For any other unversioned schema, declare `LegacyBaseline(revision=..., validate=...)` with a validator that returns true only for that exact baseline. Do not use `lambda ...: True`, and do not compare only against the current models. See [`MigrationSpec` and `LegacyBaseline`](/sdk/api/migrations#migrationspec-and-legacybaseline) for the exact rules.

When validation succeeds, MINT stamps the baseline and runs the later revisions. When validation fails and business tables exist, startup stops. Effects of seed or backfill steps that adoption skips must already be true, or a later revision must supply them. Keep the validator until every supported deployment has moved.

Before you deploy an adoption:

1. Test adoption from a copy of every supported legacy schema.
2. Test that a mismatched schema is refused.
3. Test a fresh install.
4. Test a second run at head.
5. Back up the data and test the recovery.

## Versioning and recovery

The plugin release, `Design.version` and the Alembic revision are separate versions; see [What each version controls](/sdk/operations/versioning#what-each-version-controls).

To change SQL, update the models and add a new revision. Never edit a revision that a release shipped; the platform disables the plugin on a checksum mismatch. See [Database revisions are append-only](/sdk/operations/versioning#database-revisions-are-append-only).

A package rollback does not downgrade the database, and the runtime never runs `downgrade()`. Restore a tested backup, or ship a forward repair that works with the stored schema.

A drop operation needs `destructive = True` in the revision module; see [Revision module shape](/sdk/api/migrations#revision-module-shape). Review generated DDL and data transformations before you apply them.

Release sources: [migration contract](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations/runtime.py), [Alembic runtime](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/migrations/_alembic_runtime.py) and [plugin database lifecycle](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_database.py).
