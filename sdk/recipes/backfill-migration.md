# Backfill migrations

Add a column and fill historical rows without overwriting values that users already supplied. This recipe extends the `panels` table from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables). A plugin on the removed legacy protocol must first [adopt its existing tables](/sdk/concepts/migrations#adopting-existing-tables); see [Migrations reference](/sdk/api/migrations#migrationspec-and-legacybaseline).

## Add a nullable value first

Add this field to the `Panel` model. The module already imports SQLModel `Field` and SQLAlchemy as `sa`:

```python
notes: str | None = Field(default=None, sa_column=sa.Column(sa.Text, nullable=True))
```

Create `src/mint_plugin_panel_designer/migrations/p002_add_notes.py`:

```python
from alembic import op
import sqlalchemy as sa

revision = "p002"
down_revision = "p001"
branch_labels = None
depends_on = None
destructive = False


def upgrade(*, schema: str | None) -> None:
    op.add_column("panels", sa.Column("notes", sa.Text, nullable=True), schema=schema)
    panels = sa.table("panels", sa.column("notes", sa.Text), schema=schema)
    op.get_bind().execute(
        panels.update()
        .where(panels.c.notes.is_(None))
        .values(notes="Imported from an earlier version")
    )


def downgrade(*, schema: str | None) -> None:
    raise NotImplementedError("Use a reviewed forward migration or restore a backup")
```

- The stored revision stops the DDL from running again after it completes. `op.add_column()` itself is not idempotent.
- The `IS NULL` predicate keeps values that users supplied, also when a maintenance job runs the data step again.
- A Python default does not update existing rows. `server_default` applies only to new inserts. Here a new panel has no note, and an upgraded historical row records its origin.
- Fresh SQLite and PostgreSQL installations run the packaged baseline and this revision.

This recipe changes storage only. To show or edit notes over HTTP, update the request and response models and the handler, then regenerate the frontend contract.

## Derive values with schema-aware SQL

Use the supplied `schema` for all DDL and data queries. Do not rely on the PostgreSQL search path. Do not put request data into SQL text:

```python
# Inside upgrade(), after adding normalized_name:
panels = sa.table(
    "panels", sa.column("name", sa.String), sa.column("normalized_name", sa.String),
    schema=schema,
)
op.get_bind().execute(
    panels.update().where(panels.c.normalized_name.is_(None))
    .values(normalized_name=sa.func.lower(panels.c.name))
)
```

`upgrade` runs on a synchronous connection; see [Revision module shape](/sdk/api/migrations#revision-module-shape).

## Large tables and transaction boundaries

All pending revisions of one startup share the host transaction and the migration lock ([locking](/sdk/api/migrations#identity-history-and-locking)). A loop with `LIMIT 5000` bounds each statement, but it does not commit batches or release locks. Several revisions applied together do not change this.

For a large live table, stage the work across releases:

1. Add a nullable column. Ship readers that accept old NULL values and writers that fill the new value.
2. Run a restartable maintenance backfill. Use a short plugin session for each batch. Update only rows that still need work.
3. Verify the historical data. Enforce the constraint in a later release.

The maintenance job is separate from startup migrations. There is no `mint db backfill` or `mint db upgrade` command. `mint db current`, `mint doctor --only db` and `mint add migration --autogenerate` work against explicit development databases.

- Use Alembic `alter_column(..., nullable=False)` to enforce the constraint.
- Use `op.batch_alter_table(..., schema=schema)` for SQLite changes that rebuild the table.
- Test uniqueness, foreign keys, indexes and data preservation on both backends.
- Expect locks: adding a column or a constraint can lock the table.

## Test the real upgrade path

After you add the model field and `p002`, add `tests/test_panel_migrations.py`. The test packages only the old revision, inserts historical data, then adds the new revision. It checks a populated upgrade and a fresh installation against the current model.

```python
import asyncio
import importlib
from pathlib import Path
from shutil import copyfile
from uuid import uuid4

import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import (
    MigrationSpec, check_migrations, inspect_migrations, run_migrations,
)

from mint_plugin_panel_designer import migrations
from mint_plugin_panel_designer.models import Panel


def test_panel_upgrade_preserves_data(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    source = Path(migrations.__file__).parent
    package = tmp_path / f"panel_revisions_{uuid4().hex}"
    package.mkdir()
    (package / "__init__.py").write_text("")
    copyfile(source / "p001_initial.py", package / "p001_initial.py")
    monkeypatch.syspath_prepend(str(tmp_path))
    owner = "plugin:panel-designer"

    async def check() -> None:
        engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'upgrade.db'}")
        fresh = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'fresh.db'}")
        try:
            # The old release did not yet declare the new notes model field.
            old = MigrationSpec(package=package.name)
            assert (await run_migrations(engine, old, owner=owner, schema=None)).schema_revision == "p001"
            async with engine.begin() as connection:
                await connection.execute(
                    sa.text(
                        "INSERT INTO panels (id, owner_user_id, name, drugs) "
                        "VALUES (:id, :owner, :name, :drugs)"
                    ),
                    {"id": "old-panel", "owner": "alice", "name": "Pilot", "drugs": "[]"},
                )

            copyfile(source / "p002_add_notes.py", package / "p002_add_notes.py")
            importlib.invalidate_caches()
            current = MigrationSpec(package=package.name, models=(Panel,))
            assert (await inspect_migrations(engine, current, owner=owner, schema=None)).pending_migrations == 1
            state = await run_migrations(engine, current, owner=owner, schema=None)
            assert state.schema_revision == state.target_revision == "p002"
            assert state.pending_migrations == 0
            async with engine.connect() as connection:
                row = (await connection.execute(sa.text(
                    "SELECT name, notes FROM panels WHERE id = 'old-panel'"
                ))).one()
                assert tuple(row) == ("Pilot", "Imported from an earlier version")

            # Reopening at head is a no-op; both database paths match the model.
            assert (await run_migrations(engine, current, owner=owner, schema=None)).pending_migrations == 0
            assert await check_migrations(engine, current, owner=owner, schema=None) == []
            assert (await run_migrations(fresh, current, owner=owner, schema=None)).schema_revision == "p002"
            assert await check_migrations(fresh, current, owner=owner, schema=None) == []
        finally:
            await engine.dispose()
            await fresh.dispose()

    asyncio.run(check())
```

Run the test:

```bash
uv run pytest tests/test_panel_migrations.py -q
```

1. Run the tutorial's CRUD and ownership test with the updated model.
2. Repeat the old-data upgrade on a disposable PostgreSQL database with the real plugin schema and a normal installed startup. A SQLite pass does not prove PostgreSQL JSON queries, constraints, identity columns or locking.
3. For a migration that adopts legacy data, add a test that `LegacyBaseline.validate` accepts the exact old schema and refuses mismatched data or history.

For history and recovery, see [Migrations](/sdk/concepts/migrations).
