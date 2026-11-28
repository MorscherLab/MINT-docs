# Querying plugin-owned tables

Use `context.db()` for the SQLModel tables that your plugin owns. Declare the current models in `Metadata.database = MigrationSpec(..., models=...)`; startup applies the revisions before a session opens. This recipe uses the `Panel` model from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables).

## Read within a scoped session

```python
from mint_sdk import CurrentActor, endpoint
from sqlmodel import select
from mint_plugin_panel_designer.models import Panel
from mint_plugin_panel_designer.plugin import PanelOutput

# Method on PanelDesignerPlugin:
@endpoint.get("/recent-panels", response_model=list[PanelOutput])
async def recent_panels(self, actor: CurrentActor) -> list[PanelOutput]:
    async with self.context.db() as session:
        result = await session.execute(
            select(Panel)
            .where(Panel.owner_user_id == actor.user_id)
            .order_by(Panel.name, Panel.id)
            .limit(50)
        )
        return [PanelOutput.model_validate(panel) for panel in result.scalars()]
```

- The session is an SQLAlchemy `AsyncSession`. Use `await session.execute(...)`, then `result.scalars()` for ORM rows. Do not rely on the SQLModel `session.exec()` method.
- An integrated PostgreSQL session sets the search path to the plugin schema. A standalone session uses SQLite.
- `context.db()` needs an in-process plugin. In an isolated subprocess, it raises `UnavailableException`. See [Runtime isolation](/sdk/concepts/isolation).

The schema scopes the tables to the plugin. It does not authorize users, and the platform does not know who owns a row. Filter every read, update and delete by the trusted actor or an authorized experiment. `Metadata.auth = True` authenticates the caller; it adds no SQL filter. Build the response objects while the session is open, so that no object is detached or lazy-loaded later.

## Insert, replace JSON, and commit

```python
# Inside a handler that receives a validated PanelInput body and trusted actor:
async with self.context.db() as session:
    panel = Panel(owner_user_id=actor.user_id, **body.model_dump(mode="json"))
    session.add(panel)
    await session.flush()
    result = PanelOutput.model_validate(panel)
# Successful exit commits the row.
return result
```

- The session context commits on a successful exit and rolls back on an exception, standalone and in-process.
- Use `flush()` to send the writes and get constraint errors before you build the response. Use `refresh()` to read server-generated values.
- An explicit `commit()` commits earlier. A later exception cannot undo it.
- For a batch, use one context and `session.add_all(panels)`. To roll back the batch, let the exception leave the context.
- Catch and translate expected database errors outside the context. Inside it, the context can try to commit a failed transaction.

For JSON columns, assign a replacement value:

```python
panel.drugs = body.model_dump(mode="json")["drugs"]
```

A plain SQLAlchemy JSON column does not track in-place changes such as `panel.drugs.append(...)`. Assign a new value, or configure and test SQLAlchemy mutable tracking.

## Parameterized raw SQL

In a plugin session, an unqualified `panels` resolves through the scoped PostgreSQL search path. Bind the values that users control:

```python
import sqlalchemy as sa

async with self.context.db() as session:
    result = await session.execute(
        sa.text("SELECT id, name FROM panels WHERE owner_user_id = :owner ORDER BY name"),
        {"owner": actor.user_id},
    )
    rows = [dict(row) for row in result.mappings()]
```

Migration code must not rely on the session search path. Alembic revisions get `schema`; use schema-bound SQLAlchemy tables there. Never put user input into table names, column names, sort clauses or SQL values.

## Aggregation and indexes

```python
from sqlalchemy import func

async with self.context.db() as session:
    result = await session.execute(
        select(func.count(Panel.id)).where(Panel.owner_user_id == actor.user_id)
    )
    panel_count = int(result.scalar_one())
```

- Index the columns that you filter on. The tutorial indexes `owner_user_id` in the model and in the initial migration.
- When you add a composite index, add it to the model and to the next migration. Model checks then agree with fresh databases that the migrations create.
- Check the PostgreSQL query plan when you tune production queries.
- `sa.JSON` stores portably, but JSON containment does not behave the same everywhere. Do not expect `.contains(...)` on that column to become PostgreSQL `JSONB @>` or to work the same on SQLite.
- For frequent lookups by drug name, use a child table with an indexed drug-name column. To use JSONB operators, declare the JSONB type and test the SQLite path separately.

## Relating rows to platform experiments

An `experiment_id` field alone proves nothing about access. Use [`CurrentExperiment`](/sdk/concepts/platform-context#request-scoped-access) on an endpoint with an `{experiment_id}` path parameter. Then filter the plugin rows by that experiment ID. A write endpoint also needs the matching user permission or `access` level, and the write capability of the plugin.

MINT does not delete plugin rows when an experiment is deleted. Choose one: keep an audit record, handle `@on("experiment.deleted")`, or delete the rows in an explicit cleanup. Do not write to platform tables across schemas.

## Sharing with other plugins

Do not query the SQL schema of another plugin. Publish design data, artifacts or an authorized API instead. A plugin reads the results of another plugin only when it names that plugin in `reads_from`.

- Read an allowed result with `artifacts.get(experiment_id, "summary", plugin="producer-id")`.
- Read referenced files with `context.objects(experiment_id, plugin="producer-id")`.

The platform checks the producer and the experiment access. See [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers).

For schema changes, see [Migrations](/sdk/concepts/migrations) and [Backfill migrations](/sdk/recipes/backfill-migration).
