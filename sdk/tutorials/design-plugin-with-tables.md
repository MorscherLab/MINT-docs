# Tutorial 2 — Design plugin with tables

You'll build **panel-designer**, an `EXPERIMENT_DESIGN` plugin that owns a database table for drug-response panels. It uses `mint_sdk.migrations` to evolve its schema, exposes CRUD routes for panels, and saves the experiment-level design summary to `DesignData`.

**Time:** ~60 minutes
**Prereqs:** [Tutorial 1](/sdk/tutorials/first-analysis-plugin) recommended; you should be comfortable with `mint init` and `mint dev`

## 1. Scaffold

```bash
mint init panel-designer
cd panel-designer
```

Answer:

| Prompt | Answer |
|--------|--------|
| Plugin name | `panel-designer` |
| Plugin type | `experiment-design` |
| Routes prefix | `/panel-designer` |
| Migrations? | **Yes** |
| Frontend? | No |

The scaffolder produces:

```
panel-designer/
├── pyproject.toml
├── src/
│   └── panel_designer/
│       ├── __init__.py
│       ├── plugin.py
│       ├── models.py          # ← SQLAlchemy models
│       ├── routes.py
│       └── migrations/
│           ├── __init__.py
│           └── 001_initial.py
└── tests/
    └── test_plugin.py
```

## 2. Define the panel model

Replace `models.py`:

```python
# src/panel_designer/models.py
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Panel(Base):
    __tablename__ = "panels"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    experiment_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    drugs: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
```

The `drugs` column stores a list like `[{"name": "Cisplatin", "doses_uM": [0.1, 1, 10]}, ...]`. Schema-flexible, queryable enough for our needs.

## 3. Initial migration

Replace the scaffolded `001_initial.py`:

```python
# src/panel_designer/migrations/001_initial.py
from mint_sdk.migrations import MigrationOps, PluginMigration


class Migration(PluginMigration):
    revision = "001"
    description = "create panels table"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.create_table(
            "panels",
            [
                ops.column("id", "uuid", primary_key=True),
                ops.column("experiment_id", "integer", nullable=False),
                ops.column("name", "text", nullable=False),
                ops.column("drugs", "jsonb", nullable=False),
                ops.column("notes", "text", nullable=True),
                ops.column("created_at", "timestamp", nullable=False),
                ops.column("updated_at", "timestamp", nullable=False),
            ],
        )
        await ops.create_index("idx_panels_experiment", "panels", ["experiment_id"])
```

::: tip JSON column type names
`MigrationOps` accepts `jsonb` and translates to native JSONB on Postgres, TEXT on SQLite. The SDK reads/writes the column as JSON in both cases.
:::

## 4. Wire the plugin

```python
# src/panel_designer/plugin.py
from mint_sdk import (
    AnalysisPlugin,
    PluginCapabilities,
    PluginMetadata,
    PluginType,
)

from panel_designer.routes import router


class PanelDesignerPlugin(AnalysisPlugin):
    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="panel-designer",
            version="0.1.0",
            description="Drug-response panel design",
            analysis_type="oncology",
            routes_prefix="/panel-designer",
            plugin_type=PluginType.EXPERIMENT_DESIGN,
            capabilities=PluginCapabilities(
                requires_auth=True,
                requires_experiments=True,
                requires_database=True,
                requires_shared_database=True,   # we own a table
            ),
            schema_version="1.0",
        )

    def get_routers(self):
        return [(router, "")]

    async def initialize(self, context=None):
        self._context = context
        if context is None:
            self._setup_standalone_db()      # base-class helper; uses LocalDatabase

    async def shutdown(self):
        if self.is_standalone:
            self._teardown_standalone_db()

    def get_migrations_package(self) -> str:
        return "panel_designer.migrations"
```

`requires_shared_database=True` is what unlocks `context.get_shared_db_session()` in integrated mode. Standalone mode falls through to `LocalDatabase`; the base class wires this when you call `_setup_standalone_db()`.

## 5. CRUD routes

```python
# src/panel_designer/routes.py
from typing import Any
from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from panel_designer.models import Panel

router = APIRouter()


class PanelIn(BaseModel):
    experiment_id: int
    name: str
    drugs: list[dict[str, Any]]
    notes: str | None = None


class PanelOut(BaseModel):
    id: UUID
    experiment_id: int
    name: str
    drugs: list[dict[str, Any]]
    notes: str | None


def _get_plugin():
    from panel_designer import plugin as _pkg
    return _pkg._INSTANCE


@router.get("/panels/{experiment_id}", response_model=list[PanelOut])
async def list_panels(experiment_id: int):
    plugin = _get_plugin()
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(
            select(Panel).where(Panel.experiment_id == experiment_id)
        )
        panels = result.scalars().all()
        return [PanelOut(id=p.id, experiment_id=p.experiment_id, name=p.name,
                         drugs=p.drugs, notes=p.notes) for p in panels]


@router.post("/panels", response_model=PanelOut, status_code=201)
async def create_panel(body: PanelIn):
    plugin = _get_plugin()
    async with plugin.get_plugin_db_session() as session:
        panel = Panel(
            experiment_id=body.experiment_id,
            name=body.name,
            drugs=body.drugs,
            notes=body.notes,
        )
        session.add(panel)
        await session.commit()
        await session.refresh(panel)

    # Update the experiment's design data summary so the platform can show panel counts
    await plugin.save_design(body.experiment_id, {
        "panel_count": await _count_panels(plugin, body.experiment_id),
    })

    return PanelOut(id=panel.id, experiment_id=panel.experiment_id,
                     name=panel.name, drugs=panel.drugs, notes=panel.notes)


async def _count_panels(plugin, experiment_id: int) -> int:
    from sqlalchemy import func
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(
            select(func.count(Panel.id)).where(Panel.experiment_id == experiment_id)
        )
        return result.scalar_one()
```

```python
# src/panel_designer/__init__.py
_INSTANCE = None
```

```python
# src/panel_designer/plugin.py — update initialize
import panel_designer as _pkg

class PanelDesignerPlugin(AnalysisPlugin):
    # ... metadata + get_routers + shutdown as above ...

    async def initialize(self, context=None):
        self._context = context
        if context is None:
            self._setup_standalone_db()
        _pkg._INSTANCE = self
```

`save_design` is the convenience wrapper around `PluginDataRepository.save_experiment_data`. It writes to the platform's `DesignData` table when integrated, no-ops when standalone.

## 6. Run, migrate, and test

```bash
# Apply the migration ahead of starting (optional — the platform does it automatically)
mint dev

# In another terminal:
curl -X POST http://127.0.0.1:8005/api/panel-designer/panels \
  -H "Content-Type: application/json" \
  -d '{
    "experiment_id": 1,
    "name": "Cisplatin dose-response",
    "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}]
  }'
# → {"id":"...","experiment_id":1,"name":"Cisplatin dose-response", ...}

curl http://127.0.0.1:8005/api/panel-designer/panels/1
# → [{"id":"...", "experiment_id":1, "name":"Cisplatin dose-response", ...}]
```

## 7. Add a migration that adds a column

Suppose later you want a `tags` column on panels.

```python
# src/panel_designer/migrations/002_add_tags.py
from mint_sdk.migrations import MigrationOps, PluginMigration


class Migration(PluginMigration):
    revision = "002"
    description = "add tags column to panels"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.add_column(
            "panels",
            ops.column("tags", "jsonb", nullable=True),
        )
        await ops.create_index("idx_panels_tags", "panels", ["tags"])
```

Update the model:

```python
# src/panel_designer/models.py — add to Panel
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
```

Restart `mint dev`. The migration runner sees `002` as pending, applies it, and your CRUD routes can now read `panel.tags`.

::: warning Don't edit applied migrations
`001_initial.py` was already applied to your dev database. Editing it now would trigger `MigrationChecksumError` on next startup. To change `001` retroactively, write `003`. See [Concepts → Migrations](/sdk/concepts/migrations) for the discipline.
:::

## 8. Validate

```bash
mint doctor
```

Expected: every check passes, including:

```
✓ migrations: 2 revisions found (001, 002)
✓ entry point: mld.plugins → panel_designer.plugin:PanelDesignerPlugin
```

## 9. Package

```bash
mint build
# → dist/panel-designer-0.1.0.mint
```

The bundle includes the migrations package — installs apply them automatically.

## Where you've landed

You have an `EXPERIMENT_DESIGN` plugin that:

- Owns a real database table (`panels`)
- Evolves schema with two versioned migrations
- Exposes CRUD routes that read/write the table
- Mirrors the experiment-level summary into `DesignData` so the platform UI sees it
- Works in standalone (SQLite) and integrated (Postgres) modes

## Next

→ [Tutorial 3 — Adding a frontend](/sdk/tutorials/adding-a-frontend) — give panel-designer a UI
→ [Tutorial 4 — Plugin roles](/sdk/tutorials/plugin-roles) — gate panel deletion on a plugin role
→ [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — chunked data backfill patterns
→ [Recipes → Querying plugin data](/sdk/recipes/querying-plugin-data) — heavier query patterns on plugin tables
