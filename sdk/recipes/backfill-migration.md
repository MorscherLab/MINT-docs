# Backfill migrations

Add a new column and populate existing rows without overwriting values users already supplied. This recipe uses the `panels` table from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables) and the released MINT 1.2.0 migration API.

## Add a nullable value first

Add `notes: str | None = None` to the current `Panel` model, then create `src/mint_plugin_panel_designer/migrations/v002_add_notes.py`:

```python
import sqlalchemy as sa
from mint_sdk.migrations import MigrationOps, PluginMigration


class AddNotes(PluginMigration):
    version = 2
    name = "add_notes"

    async def upgrade(self, op: MigrationOps) -> None:
        await op.add_column("panels", sa.Column("notes", sa.Text, nullable=True))
        await op.backfill("panels", "notes", "Imported from an earlier version")
```

`add_column` skips a column that already exists. `backfill` updates only NULL values. Rows with an existing note keep it. If notes should appear in HTTP responses, update the request/response models separately and regenerate the frontend contract.

A Python default on the SQLModel field does not update old rows. A `server_default` affects database inserts; it is also different from explicitly backfilling historical data. Choose the meaning you want for old rows before assigning a value.

A fresh standalone database may be created from current models and migration history stamped. That skips this backfill, so NULL must remain a valid fresh-install value. Put required reference-data initialization in a separately tested idempotent lifecycle step instead of relying exclusively on a stamped migration.

## Derive a value from existing columns

Use a fixed, schema-qualified table name and bound values. PostgreSQL migration SQL runs with `search_path=public`, so unqualified raw SQL can target the wrong schema.

```python
# Inside upgrade(op), after adding normalized_name to the schema:
table = op.qualified_table("panels")
await op.execute(
    sa.text(
        f"UPDATE {table} SET normalized_name = LOWER(name) "
        "WHERE normalized_name IS NULL"
    )
)
```

If a query needs values, use `.bindparams(...)` on the statement. `MigrationOps.execute()` accepts one statement argument, not a second parameters dictionary.

## Large datasets and transaction boundaries

The v1.2.0 runner executes all pending revisions within **one transaction** and, on PostgreSQL, one advisory lock. A loop with `LIMIT 5000` bounds each statement's work, but does not commit between batches or release locks. Splitting the loop across revisions in the same startup run does not change that transaction boundary.

For small, measured migrations, a single update is often sufficient. For a large live table, use staged releases:

1. Add a nullable column; deploy code that tolerates old NULL values and writes the new value.
2. Run a restartable administrative/background backfill with a short transaction per batch. Limit each update to rows still needing work, and persist progress if computing the value is expensive.
3. Verify no required values are missing, then enforce the constraint in a later release using tested backend-specific DDL where necessary.

Do not call `commit()` on the runner's private connection inside `upgrade()`. There is no released `mint db backfill` or migration-only CLI command. A custom maintenance command must use normal plugin sessions and explicit authorization; its lifecycle is separate from startup migrations.

`alter_column()` only changes the column type in 1.2.0. It does not accept `nullable=False`. PostgreSQL `ALTER ... SET NOT NULL` and SQLite table rebuilding need their own integration checks. Schema changes can acquire database locks; do not describe adding a column or constraint as lock-free.

## Test the real upgrade path

Add `tests/test_panel_migrations.py`. This test creates the old schema from its original migration, inserts historical data, runs the new revision, checks the rows, and confirms a second run is a no-op. It deliberately bypasses model-based fresh-install stamping.

```python
import asyncio
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import MigrationRunner, SchemaVersionAheadError

from mint_plugin_panel_designer.migrations.v001_initial import CreatePanels
from mint_plugin_panel_designer.migrations.v002_add_notes import AddNotes


def test_panel_upgrade_preserves_data(tmp_path: Path) -> None:
    async def check() -> None:
        engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'upgrade.db'}")
        try:
            runner = MigrationRunner(engine, "panel-designer", "sqlite")
            assert (await runner.run([CreatePanels()])).applied == [1]
            async with engine.begin() as connection:
                await connection.execute(
                    sa.text(
                        "INSERT INTO panels (id, owner_user_id, name, drugs) "
                        "VALUES (:id, :owner, :name, :drugs)"
                    ),
                    {"id": "old-panel", "owner": "alice", "name": "Pilot", "drugs": "[]"},
                )
            migrations = [CreatePanels(), AddNotes()]
            upgraded = await runner.run(migrations)
            assert upgraded.applied == [2]
            assert upgraded.current_version == 2
            async with engine.connect() as connection:
                row = (await connection.execute(sa.text(
                    "SELECT name, notes FROM panels WHERE id = 'old-panel'"
                ))).one()
                assert tuple(row) == ("Pilot", "Imported from an earlier version")
            assert (await runner.run(migrations)).applied == []
            try:
                await runner.run([CreatePanels()])
            except SchemaVersionAheadError:
                pass
            else:
                raise AssertionError("An older plugin must not accept the newer schema")
        finally:
            await engine.dispose()

    asyncio.run(check())
```

Run with the scaffold's test setup:

```bash
uv run pytest tests/test_panel_migrations.py -q
```

Also test a fresh standalone app against the updated model. For production, run the same old-data upgrade scenario on a disposable PostgreSQL database with the actual plugin schema and the normal installed plugin startup. SQLite passing does not prove PostgreSQL identity columns, JSON queries, constraints, or lock behavior are correct.

See [Migrations](/sdk/concepts/migrations) for checksums and recovery, and [Querying plugin data](/sdk/recipes/querying-plugin-data) for ordinary application sessions.
