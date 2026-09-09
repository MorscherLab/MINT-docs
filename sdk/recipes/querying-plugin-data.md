# Querying plugin-owned tables

Use `get_plugin_db_session()` for the SQLModel tables returned by your plugin's `get_shared_models()`. This recipe uses the owner-scoped `Panel` model from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables).

## Read within a scoped session

```python
from mint_sdk import CurrentPluginActor, endpoint
from sqlmodel import select
from mint_plugin_panel_designer.models import Panel
from mint_plugin_panel_designer.plugin import PanelOutput

# Method on PanelDesignerPlugin:
@endpoint.get("/recent-panels", response_model=list[PanelOutput])
async def recent_panels(self, actor: CurrentPluginActor) -> list[PanelOutput]:
    async with self.get_plugin_db_session() as session:
        result = await session.execute(
            select(Panel)
            .where(Panel.owner_user_id == actor.user_id)
            .order_by(Panel.name, Panel.id)
            .limit(50)
        )
        return [PanelOutput.model_validate(panel) for panel in result.scalars()]
```

The session is an SQLAlchemy `AsyncSession`: use `await session.execute(...)`, then `result.scalars()` for ORM rows. Do not assume the SQLModel synchronous `session.exec()` convenience method is available.

PostgreSQL integrated sessions set the plugin schema search path. Standalone sessions use SQLite. An installed isolated subprocess has no shared database session in 1.2.0, so this capability requires in-process deployment.

Schema scoping is table ownership, not user authorization. The platform cannot infer ownership rules for arbitrary rows. Filter every read/update/delete by the trusted actor or an explicitly authorized experiment. `requires_auth=True` authenticates the caller; it does not add SQL predicates. Build response objects while the session is open to avoid detached objects or lazy-loading surprises.

## Insert, replace JSON, and commit

```python
# Inside a handler that receives a validated PanelInput body and trusted actor:
async with self.get_plugin_db_session() as session:
    panel = Panel(owner_user_id=actor.user_id, **body.model_dump(mode="json"))
    session.add(panel)
    await session.flush()
    result = PanelOutput.model_validate(panel)
# Successful exit commits the row.
return result
```

Both standalone and in-process session context managers commit on successful exit and roll back on exception. Use `flush()` to send writes and surface constraint errors before producing the response; use `refresh()` when you need server-generated values. Explicit `commit()` is possible, but commits earlier: a later exception cannot undo work already committed.

For a batch, use one context and `session.add_all(panels)`. Let exceptions propagate out of the context if the batch must roll back. Catch and translate expected database errors **outside** the context; otherwise the context may attempt to commit a failed transaction.

For JSON columns, assign a replacement value:

```python
panel.drugs = body.model_dump(mode="json")["drugs"]
```

In-place changes such as `panel.drugs.append(...)` are not automatically tracked by a plain SQLAlchemy JSON column. Use replacement assignment, or explicitly configure/test SQLAlchemy mutable tracking when the application needs it.

## Parameterized raw SQL

Inside an ordinary plugin session, unqualified `panels` resolves through the scoped PostgreSQL search path. Bind user-controlled values:

```python
import sqlalchemy as sa

async with self.get_plugin_db_session() as session:
    result = await session.execute(
        sa.text("SELECT id, name FROM panels WHERE owner_user_id = :owner ORDER BY name"),
        {"owner": actor.user_id},
    )
    rows = [dict(row) for row in result.mappings()]
```

Migration raw SQL has a different search-path rule: use `op.qualified_table("panels")` there. Do not interpolate user input into table names, column names, sort clauses, or SQL values.

## Aggregation and indexes

```python
from sqlalchemy import func

async with self.get_plugin_db_session() as session:
    result = await session.execute(
        select(func.count(Panel.id)).where(Panel.owner_user_id == actor.user_id)
    )
    panel_count = int(result.scalar_one())
```

Use indexes that match actual filters. The tutorial declares `owner_user_id` as indexed in both the model and initial migration. If you add a composite index later, add it to current model metadata as well as the next migration so model-created fresh databases have it too. Validate the PostgreSQL query plan when optimizing production queries.

Generic `sa.JSON` is useful for portable storage, but JSON containment semantics are not portable. Do not assume `.contains(...)` on that column becomes PostgreSQL `JSONB @>` or works identically on SQLite. For frequent drug-name lookup, consider a normalized child table with an indexed drug-name column. If using PostgreSQL-specific JSONB operators, declare the type deliberately and test the SQLite alternative separately.

## Relating rows to platform experiments

An `experiment_id` field alone proves nothing about access. Use `CurrentExperiment` on an endpoint with an `{experiment_id}` path parameter, then filter the plugin rows by that resolved experiment ID. It checks view permission and resolves the experiment through the visible/type-scoped repository. Mutating endpoints need the corresponding explicit user permission as well as the plugin's allowed write capability.

MINT does not automatically cascade platform experiment deletion into arbitrary plugin tables. Decide whether to retain an audit record, react to a supported lifecycle event, or delete related rows through an explicit cleanup workflow. Avoid direct cross-schema writes to platform tables.

## Sharing with other plugins

Do not query another plugin's SQL schema. Publish supported design data, analysis results/artifacts, or an authorized API contract. Cross-plugin analysis reads require an explicit `analysis_result_readers` allowlist on the consuming plugin; published results are not unconditionally visible to all plugins or users.

Use `load_analysis(experiment_id, plugin_id="producer-id")` through the SDK for allowed analysis-result reads, and object-store APIs for referenced data. Platform services enforce the permitted producer identity and experiment access. See [PlatformContext](/sdk/concepts/platform-context) and [Data model](/sdk/concepts/data-model).

Use [Migrations](/sdk/concepts/migrations) for schema evolution and [Backfill migrations](/sdk/recipes/backfill-migration) for historical row updates.
