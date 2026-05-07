# Backfill migrations

## Goal

Apply a schema change AND populate the new columns from existing data — safely, idempotently, and in chunks for large tables.

## The simple case

When the table is small (< 100k rows), a one-shot `UPDATE` is fine:

```python
# my_plugin/migrations/005_normalize_panel_names.py
import sqlalchemy as sa

from mint_sdk.migrations import MigrationOps, PluginMigration


class NormalizePanelNames(PluginMigration):
    version = 5
    name = "normalize_panel_names"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.add_column(
            "panels",
            sa.Column("normalized_name", sa.String, nullable=True),
        )
        await ops.execute(
            sa.text(
                "UPDATE panels SET normalized_name = LOWER(name) "
                "WHERE normalized_name IS NULL"
            )
        )
        await ops.create_index("idx_panels_normalized", "panels", ["normalized_name"])
```

The `WHERE normalized_name IS NULL` makes it idempotent — re-running on a partial application picks up only the rows that didn't update last time.

## Chunked backfill for large tables

`UPDATE` on millions of rows holds a long transaction and can lock the table. Chunk it:

```python
# my_plugin/migrations/006_backfill_panel_dose_units.py
import sqlalchemy as sa

from mint_sdk.migrations import MigrationOps, PluginMigration


CHUNK_SIZE = 5_000


class BackfillDoseUnits(PluginMigration):
    version = 6
    name = "backfill_panel_dose_units"

    async def upgrade(self, ops: MigrationOps) -> None:
        # Schema change first
        await ops.add_column(
            "panels",
            sa.Column("dose_units", sa.String, nullable=True),
        )

        # Chunked backfill
        while True:
            result = await ops.execute(
                sa.text(
                    """
                WITH batch AS (
                    SELECT id FROM panels
                    WHERE dose_units IS NULL
                    LIMIT :limit
                )
                UPDATE panels
                SET dose_units = 'uM'
                WHERE id IN (SELECT id FROM batch)
                RETURNING id
                """
                ).bindparams(limit=CHUNK_SIZE),
            )
            rows = result.fetchall() if hasattr(result, "fetchall") else result
            if not rows:
                break

        # Now that every row has dose_units, add the read-side index.
        # Enforce NOT NULL in a follow-up migration once every deployment has backfilled.
        await ops.create_index("idx_panels_dose_units", "panels", ["dose_units"])
```

Key techniques:

- **`LIMIT :limit`** — bounds each transaction's row count.
- **`RETURNING id`** — lets the loop know whether it did any work this iteration.
- **Tighten constraints later** — add `NOT NULL` only after the data is correct everywhere, otherwise you risk failing on the first inconsistent row.

For a high-contention Postgres deployment, you can add `FOR UPDATE SKIP LOCKED` to the batch selector after testing against Postgres. Do not put that clause in migrations you expect to run under SQLite.

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
from importlib import import_module
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import MigrationRunner

CreatePanelsTable = import_module(
    "my_plugin.migrations.001_initial"
).CreatePanelsTable
NormalizePanelNames = import_module(
    "my_plugin.migrations.005_normalize_panel_names"
).NormalizePanelNames
BackfillDoseUnits = import_module(
    "my_plugin.migrations.006_backfill_panel_dose_units"
).BackfillDoseUnits


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

SQLite-backed tests verify correctness and idempotency. If you add Postgres-specific locking clauses, cover that migration with a Postgres integration test too.

## Notes

- Backfills inside a single `PluginMigration.upgrade` hold the migration lock until the method returns. For very large datasets, split the work across separate migrations/releases or move the heavy data rewrite into an application background job.
- `ops.execute` returns whatever SQLAlchemy returns — `Result` for queries, `CursorResult` for DML. Check the docs of the Result API for the version of SQLAlchemy `mint-sdk` ships against.
- For backfills that depend on application-level logic (e.g., complex computed values), consider a separate background task instead of an in-migration loop. Migrations should focus on schema; complex data work belongs in the application.

## Related

- [Concepts → Migrations](/sdk/concepts/migrations) — append-only discipline, the runner
- [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — the read side
- [API Reference → Migrations](/sdk/api/migrations) — `MigrationOps` method signatures
