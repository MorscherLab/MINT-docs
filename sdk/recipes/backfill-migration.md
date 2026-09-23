# Backfill migrations

Add a new column and populate historical rows without overwriting values users already supplied. This recipe extends the Alembic-based `panels` table from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables), using MINT 1.2.6. For an existing integer-migration plugin, keep the [legacy API](/sdk/api/migrations#legacy-integer-migration-api) until you explicitly adopt the new protocol.

## Add a nullable value first

Add this field to the current `Panel` model; its module already imports SQLModel `Field` and SQLAlchemy as `sa`:

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

The database revision prevents the DDL from being applied again after successful completion. The update's NULL predicate preserves already-supplied values when the data step is reused in a maintenance operation. Do not assume Alembic `op.add_column()` itself is idempotent like the legacy `MigrationOps.add_column()` helper.

A Python default does not update existing rows. `server_default` affects database inserts; it is distinct from an explicit historical-data update. Here a newly created panel has no note, while an upgraded historical row records its origin. Both fresh SQLite and PostgreSQL installations execute the packaged baseline and this revision under the Alembic protocol.

If notes should appear in HTTP responses or be editable, update the request/response models and handler assignment separately, then regenerate the frontend contract. This recipe changes storage only.

## Derive values with schema-aware SQL

Use the supplied schema for all DDL and data queries. Do not rely on the PostgreSQL connection's search path or interpolate request data into SQL:

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

This uses Alembic's synchronous connection. Legacy migrations instead receive async `MigrationOps` and must qualify raw table names with `op.qualified_table(...)`; do not mix the two signatures.

## Large tables and transaction boundaries

All pending revisions in one startup run share the host transaction and migration lock. A loop with `LIMIT 5000` bounds each statement's work but does not commit batches or release locks. Splitting the loop into several revisions applied together does not change that boundary. MINT rejects revision code that tries to commit, roll back, or start another host transaction.

For a large live table, stage the work across deployments:

1. Add a nullable column and ship readers that tolerate old NULL values plus writers that populate the new value.
2. Run an authorized, restartable background/maintenance backfill with a short normal plugin session per batch, updating only rows still needing work.
3. Verify the historical data, then enforce the desired constraint in a later release.

The maintenance job is separate from startup migrations; there is no `mint db backfill` or `mint db upgrade` command. `mint db current/check/revision` inspect and author against explicit development databases.

Alembic `alter_column(..., nullable=False)` is available, unlike the legacy helper. Use `op.batch_alter_table(..., schema=schema)` for SQLite table changes that require rebuilding, and test uniqueness, foreign keys, indexes, and data preservation on both backends. Schema changes can acquire locks; adding a column or constraint is not necessarily lock-free.

## Test the real upgrade path

After adding the model field and `p002`, add `tests/test_panel_migrations.py`. The test temporarily packages only the old revision, inserts historical data, then adds the actual new revision. It verifies both a populated upgrade and a fresh installation against the current model.

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

Run with the scaffold's test setup:

```bash
uv run pytest tests/test_panel_migrations.py -q
```

Also run the tutorial's CRUD/ownership test with the updated model. For production, repeat the old-data upgrade on a disposable PostgreSQL database using the actual plugin schema and normal installed startup. SQLite passing does not prove PostgreSQL-specific JSON queries, constraints, identity-column behavior, or locking.

For a migration that adopts existing legacy data, add a separate test proving `LegacyBaseline.validate` accepts the exact old schema and rejects mismatched data/history. Do not replace this with a fresh-database-only check.

See [Migrations](/sdk/concepts/migrations) for history and recovery, and [Querying plugin data](/sdk/recipes/querying-plugin-data) for ordinary application sessions.
