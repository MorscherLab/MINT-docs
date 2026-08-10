# Tutorial 3 - Design Plugin With Tables

You'll build **panel-designer**, an `EXPERIMENT_DESIGN` plugin that owns a `panels` table for drug-response panel designs.

By the end you will have:

- A `standard` mode plugin with custom `@endpoint` handlers
- One SQLModel table owned by the plugin
- CRUD endpoints backed by `get_plugin_db_session()`
- A migration package for installed platform deployments

**Time:** 50-60 minutes
**Prereqs:** [Tutorial 2](/sdk/tutorials/adding-a-frontend); comfort with Pydantic models and async database code

## 1. Scaffold

Create an experiment-design plugin:

```bash
mint init panel-designer \
  --name "Panel Designer" \
  --description "Drug-response panel design" \
  --mode standard \
  --type experiment-design \
  --yes
cd panel-designer
```

Add the database dependencies used by the tutorial:

```bash
uv add sqlmodel aiosqlite greenlet
```

`standard` mode includes a Vue workspace. This tutorial focuses on the backend data contract first; the generated frontend client can consume these endpoints after `mint sdk generate`.

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
```

## 2. Add the Table Model

Create `src/mint_plugin_panel_designer/models.py`:

```python
from datetime import UTC, datetime
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


class Panel(SQLModel, table=True):
    __tablename__ = "panels"

    id: int | None = Field(default=None, primary_key=True)
    experiment_id: int = Field(index=True)
    name: str = Field(max_length=200)
    drugs: list[dict[str, Any]] = Field(sa_column=sa.Column(sa.JSON, nullable=False))
    notes: str | None = None
    tags: list[str] | None = Field(default=None, sa_column=sa.Column(sa.JSON, nullable=True))
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
```

`Panel.drugs` stores values such as:

```json
[
  {"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}
]
```

## 3. Replace the Plugin Code

Replace `src/mint_plugin_panel_designer/plugin.py` with:

```python
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlmodel import select

from mint_sdk import (
    AnalysisPlugin,
    PluginCapabilities,
    PluginNavItem,
    PluginType,
    endpoint,
    mint_plugin,
)

from mint_plugin_panel_designer.models import Panel, utc_now


class PanelIn(BaseModel):
    experiment_id: int
    name: str
    drugs: list[dict[str, Any]]
    notes: str | None = None
    tags: list[str] | None = None


class PanelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    experiment_id: int
    name: str
    drugs: list[dict[str, Any]]
    notes: str | None = None
    tags: list[str] | None = None


@mint_plugin(
    analysis_type="experiment-design",
    routes_prefix="/panel-designer",
    plugin_type=PluginType.EXPERIMENT_DESIGN,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_database=True,
        requires_experiments=True,
        requires_shared_database=True,
    ),
    schema_version="1.0",
    icon="M4 4h16v16H4zM8 8h8v8H8z",
    nav_items=[
        PluginNavItem(
            path="/",
            label="Panel Designer",
            id="workspace",
            icon="M4 4h16v16H4zM8 8h8v8H8z",
            description="Design drug-response panels",
        ),
    ],
)
class PanelDesignerPlugin(AnalysisPlugin):
    def get_shared_models(self) -> list[type]:
        return [Panel]

    @endpoint.get("/health", tags=["panels"])
    async def health(self) -> dict[str, str]:
        return {"status": "healthy", "plugin": self.metadata.name}

    @endpoint.get("/panels/{experiment_id}", response_model=list[PanelOut], tags=["panels"])
    async def list_panels(self, experiment_id: int) -> list[PanelOut]:
        async with self.get_plugin_db_session() as session:
            result = await session.execute(
                select(Panel).where(Panel.experiment_id == experiment_id)
            )
            return [
                PanelOut.model_validate(panel)
                for panel in result.scalars().all()
            ]

    @endpoint.post("/panels", response_model=PanelOut, status_code=201, tags=["panels"])
    async def create_panel(self, body: PanelIn) -> PanelOut:
        now = utc_now()
        panel = Panel(
            experiment_id=body.experiment_id,
            name=body.name,
            drugs=body.drugs,
            notes=body.notes,
            tags=body.tags,
            created_at=now,
            updated_at=now,
        )

        async with self.get_plugin_db_session() as session:
            session.add(panel)
            await session.commit()
            await session.refresh(panel)

        panel_count = await self.count_panels(body.experiment_id)
        await self.save_design(body.experiment_id, {"panel_count": panel_count})
        return PanelOut.model_validate(panel)

    async def count_panels(self, experiment_id: int) -> int:
        async with self.get_plugin_db_session() as session:
            result = await session.execute(
                select(func.count(Panel.id)).where(Panel.experiment_id == experiment_id)
            )
            return int(result.scalar_one())
```

Two details matter:

| Line | Why it matters |
|------|----------------|
| `requires_shared_database=True` | Tells MINT the plugin owns tables in its scoped schema |
| `get_shared_models()` | Gives standalone mode enough SQLModel metadata to create local SQLite tables |

`self.get_plugin_db_session()` is mode-portable. In `mint dev`, it uses local SQLite. When installed in MINT, it uses the platform-managed plugin schema.

## 4. Test the Endpoints

Replace `tests/test_plugin.py` with:

```python
from fastapi.testclient import TestClient
from mint_sdk.runtime import create_plugin_app

from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


def test_plugin_metadata_uses_experiment_design_type() -> None:
    assert PanelDesignerPlugin().metadata.plugin_type.value == "experiment_design"


def test_create_panel_returns_created_panel() -> None:
    with TestClient(create_plugin_app()) as client:
        response = client.post(
            "/api/panel-designer/panels",
            json={
                "experiment_id": 1,
                "name": "Cisplatin dose-response",
                "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}],
            },
        )

    assert response.status_code == 201
    assert response.json()["name"] == "Cisplatin dose-response"
```

Run:

```bash
uv run pytest -q
mint doctor --strict
```

## 5. Try the Local API

Start the plugin:

```bash
mint dev
```

Create a panel:

```bash
curl -X POST http://127.0.0.1:8003/api/panel-designer/panels \
  -H "Content-Type: application/json" \
  -d '{
    "experiment_id": 1,
    "name": "Cisplatin dose-response",
    "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}],
    "tags": ["drug-response", "pilot"]
  }'
```

List panels:

```bash
curl http://127.0.0.1:8003/api/panel-designer/panels/1
```

Expected shape:

```json
[
  {
    "id": 1,
    "experiment_id": 1,
    "name": "Cisplatin dose-response",
    "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}],
    "notes": null,
    "tags": ["drug-response", "pilot"]
  }
]
```

## 6. Add Migration History

For development, `get_shared_models()` is enough. For production, add append-only migrations so schema changes are tracked.

Create the migration package:

```bash
mkdir -p src/mint_plugin_panel_designer/migrations
touch src/mint_plugin_panel_designer/migrations/__init__.py
```

Create `src/mint_plugin_panel_designer/migrations/v001_initial.py`:

```python
import sqlalchemy as sa
from mint_sdk.migrations import MigrationOps, PluginMigration


class CreatePanelsTable(PluginMigration):
    version = 1
    name = "create_panels_table"

    async def upgrade(self, op: MigrationOps) -> None:
        await op.create_table(
            "panels",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("experiment_id", sa.Integer, nullable=False),
            sa.Column("name", sa.String(200), nullable=False),
            sa.Column("drugs", sa.JSON, nullable=False),
            sa.Column("notes", sa.Text, nullable=True),
            sa.Column("tags", sa.JSON, nullable=True),
            sa.Column("created_at", sa.DateTime, nullable=False),
            sa.Column("updated_at", sa.DateTime, nullable=False),
        )
        await op.create_index("idx_panels_experiment", "panels", ["experiment_id"])
```

Then add this method to `PanelDesignerPlugin`:

```python
def get_migrations_package(self) -> str | None:
    return "mint_plugin_panel_designer.migrations"
```

Do not edit a migration after it has shipped to a real deployment. Add `v002_...py`, `v003_...py`, and so on.

## 7. Regenerate the Frontend Client

The new endpoints are part of the plugin contract:

```bash
mint sdk generate
mint docs contract .
```

`mint docs contract .` prints the generated call shapes. After this tutorial, the frontend can call:

```ts
await client.createPanel({
  experiment_id: 1,
  name: 'Cisplatin dose-response',
  drugs: [{ name: 'Cisplatin', doses_uM: [0.1, 1, 10, 100] }],
})

const panels = await client.listPanels({ pathParams: { experimentId: 1 } })
```

Use the printed contract as the source of truth if the call shape differs.

## Where You've Landed

You now have an experiment-design plugin that:

- Owns a `panels` table
- Uses `@endpoint` handlers for CRUD APIs
- Uses `get_plugin_db_session()` in both standalone and installed mode
- Saves a small design summary through `save_design()`
- Declares migration history for production installs

## Next

- [Tutorial 4 - Plugin roles](/sdk/tutorials/plugin-roles) - protect destructive actions
- [Migrations](/sdk/concepts/migrations) - deeper migration rules
- [Frontend → FormBuilder](/sdk/frontend/form-builder) - build the panel editor UI
