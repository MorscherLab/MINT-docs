# Backfill migrations

## Goal

Apply a schema change AND populate the new columns from existing data — safely, idempotently, and in chunks for large tables.

## The simple case

When the table is small (< 100k rows), a one-shot `UPDATE` is fine:

```python
# my_plugin/migrations/005_normalize_panel_names.py
from mint_sdk.migrations import MigrationOps, PluginMigration


class Migration(PluginMigration):
    revision = "005"
    description = "add normalized_name and backfill from name"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.add_column(
            "panels",
            ops.column("normalized_name", "text", nullable=True),
        )
        await ops.execute(
            "UPDATE panels SET normalized_name = LOWER(name) "
            "WHERE normalized_name IS NULL"
        )
        await ops.create_index("idx_panels_normalized", "panels", ["normalized_name"])
```

The `WHERE normalized_name IS NULL` makes it idempotent — re-running on a partial application picks up only the rows that didn't update last time.

## Chunked backfill for large tables

`UPDATE` on millions of rows holds a long transaction and can lock the table. Chunk it:

```python
# my_plugin/migrations/006_backfill_panel_dose_units.py
from mint_sdk.migrations import MigrationOps, PluginMigration


CHUNK_SIZE = 5_000


class Migration(PluginMigration):
    revision = "006"
    description = "backfill dose_units = 'uM' on legacy panels"

    async def upgrade(self, ops: MigrationOps) -> None:
        # Schema change first
        await ops.add_column(
            "panels",
            ops.column("dose_units", "text", nullable=True),
        )

        # Chunked backfill
        while True:
            result = await ops.execute(
                """
                WITH batch AS (
                    SELECT id FROM panels
                    WHERE dose_units IS NULL
                    LIMIT :limit
                    FOR UPDATE SKIP LOCKED
                )
                UPDATE panels
                SET dose_units = 'uM'
                WHERE id IN (SELECT id FROM batch)
                RETURNING id
                """,
                params={"limit": CHUNK_SIZE},
            )
            rows = result.fetchall() if hasattr(result, "fetchall") else result
            if not rows:
                break

        # Now that every row has dose_units, enforce NOT NULL + index
        await ops.execute("ALTER TABLE panels ALTER COLUMN dose_units SET NOT NULL")
        await ops.create_index("idx_panels_dose_units", "panels", ["dose_units"])
```

Key techniques:

- **`FOR UPDATE SKIP LOCKED`** — never blocks on rows another transaction is touching. Postgres-only; SQLite skips the lock keyword harmlessly.
- **`LIMIT :limit`** — bounds each transaction's row count.
- **`RETURNING id`** — lets the loop know whether it did any work this iteration.
- **Tighten constraints last** — `NOT NULL` and indexes after the data is correct, otherwise you risk failing on the first inconsistent row.

## Splitting schema and data into separate revisions

For very large datasets, separate the schema from the backfill so the schema change is fast and the backfill can take its time:

```
006_add_dose_units_column.py        # add nullable column + ship a release
007_backfill_dose_units.py          # backfill in chunks; idempotent
008_make_dose_units_required.py     # NOT NULL + index, only after 007 has run everywhere
```

Each migration becomes a small, easy-to-review change. The plugin author can also run `007` manually outside startup if needed (e.g., during a maintenance window).

## Online backfill

If the plugin is actively writing while the backfill runs, your migration must coexist with the application:

| Phase | Application code | Migration |
|-------|------------------|-----------|
| 1: Add nullable column | Reads tolerate NULL; writes leave column NULL | `add_column` (fast, no lock) |
| 2: App starts double-writing | Writes fill the new column with the computed value | (no migration) |
| 3: Backfill old rows | (no change) | Chunked `UPDATE` |
| 4: Make column required | App ensures every code path writes the column | `ALTER ... SET NOT NULL` |
| 5: Drop the old column | Reads use the new column only | `drop_column` (use carefully) |

This is a 5-step migration; ship as 5 separate plugin releases or 5 separate revisions in one release. Each step is reversible.

## Testing chunked backfills

Use a temporary SQLite engine and drive `MigrationRunner` directly:

```python
# tests/test_migrations.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import MigrationRunner

from my_plugin.migrations.001_initial import CreatePanelsTable
from my_plugin.migrations.005_normalize_panel_names import NormalizePanelNames
from my_plugin.migrations.006_backfill_dose_units import BackfillDoseUnits


@pytest.mark.asyncio
async def test_006_handles_partial_application(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}")
    runner = MigrationRunner(engine, plugin_name="my_plugin", dialect="sqlite")

    # Apply up to 005
    result = await runner.run([CreatePanelsTable(), NormalizePanelNames()])
    assert result.applied == [1, 5]

    # Insert ~12,500 rows directly via SQL
    # (helper omitted for brevity)

    # Apply 006 — backfill kicks in
    result = await runner.run([
        CreatePanelsTable(),
        NormalizePanelNames(),
        BackfillDoseUnits(),
    ])
    assert result.applied == [6]
    assert not result.errors
```

For SQLite-backed tests, `FOR UPDATE SKIP LOCKED` is silently ignored — the test still verifies correctness, just without proving the locking semantics under contention.

## Notes

- Backfills inside a single `PluginMigration.upgrade` run inside one transaction by default. Long-running ones can blow the lock timeout — consider opening a fresh session per chunk via `await ops.execute("COMMIT; BEGIN;")` if your pattern allows it.
- `ops.execute` returns whatever SQLAlchemy returns — `Result` for queries, `CursorResult` for DML. Check the docs of the Result API for the version of SQLAlchemy `mint-sdk` ships against.
- For backfills that depend on application-level logic (e.g., complex computed values), consider a separate background task instead of an in-migration loop. Migrations should focus on schema; complex data work belongs in the application.

## Related

- [Concepts → Migrations](/sdk/concepts/migrations) — append-only discipline, the runner
- [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — the read side
- [API Reference → Migrations](/sdk/api/migrations) — `MigrationOps` method signatures
