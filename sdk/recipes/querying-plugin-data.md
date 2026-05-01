# Querying plugin data

## Goal

Run SQL queries against the plugin's own tables — the ones declared via migrations or `get_shared_models()`.

## Open a session

```python
from sqlalchemy import select
from my_plugin.models import Panel

class MyPlugin(AnalysisPlugin):
    async def list_panels(self, experiment_id: int):
        async with self.get_plugin_db_session() as session:
            result = await session.execute(
                select(Panel).where(Panel.experiment_id == experiment_id)
            )
            return result.scalars().all()
```

`get_plugin_db_session()` is the **mode-portable** way to get a session: it uses the platform's shared schema in integrated mode and `LocalDatabase` (SQLite) in standalone. Use it instead of `self._context.get_shared_db_session()` directly so your plugin keeps working under tests.

## Filtering with `WHERE`

```python
async def find_by_drug(plugin, drug_name: str):
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(
            select(Panel)
            .where(Panel.drugs.contains([{"name": drug_name}]))
            .order_by(Panel.created_at.desc())
            .limit(50)
        )
        return result.scalars().all()
```

For JSON-key matching (Postgres `@>` containment), use SQLAlchemy's JSON column ops. SQLite doesn't have a native equivalent — if you need the same query in standalone mode, either accept slower table scans or extract the field into a relational column.

## Aggregations

```python
from sqlalchemy import func

async def summary_by_experiment(plugin):
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(
            select(
                Panel.experiment_id,
                func.count(Panel.id).label("count"),
                func.max(Panel.created_at).label("last_modified"),
            )
            .group_by(Panel.experiment_id)
        )
        return [
            {"experiment_id": row.experiment_id,
             "count": row.count,
             "last_modified": row.last_modified}
            for row in result
        ]
```

## Inserts and updates

The session is async; commit before the context closes:

```python
async def add_panel(plugin, *, experiment_id: int, name: str, drugs: list):
    async with plugin.get_plugin_db_session() as session:
        panel = Panel(experiment_id=experiment_id, name=name, drugs=drugs)
        session.add(panel)
        await session.commit()
        await session.refresh(panel)
        return panel
```

For batch inserts, use a single transaction:

```python
async def bulk_add(plugin, panels: list[Panel]):
    async with plugin.get_plugin_db_session() as session:
        session.add_all(panels)
        await session.commit()
```

## Soft deletes

If you need restorable deletes, add a `deleted_at` column in a migration and filter explicitly:

```python
async def list_active(plugin, experiment_id: int):
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(
            select(Panel).where(
                Panel.experiment_id == experiment_id,
                Panel.deleted_at.is_(None),
            )
        )
        return result.scalars().all()
```

The platform doesn't impose a soft-delete model on plugin tables — choose what fits your data.

## Indexing for performance

Add indexes via migrations. Common patterns:

| Pattern | Recipe |
|---------|--------|
| Look up by experiment | `create_index("idx_panels_exp", "panels", ["experiment_id"])` |
| Look up by created_at desc | `create_index("idx_panels_created_at", "panels", ["created_at"])` (Postgres handles desc reads on ascending indexes) |
| Composite filter | `create_index("idx_panels_exp_created", "panels", ["experiment_id", "created_at"])` |
| Unique constraint | `create_index("uq_panels_name", "panels", ["experiment_id", "name"], unique=True)` |

Add indexes lazily — only when you have a query plan that needs them. Excess indexes slow writes.

## Cross-plugin queries

A plugin's tables live in its own Postgres schema, isolated from other plugins. Cross-plugin reads are not supported through `get_shared_db_session()`. If two plugins need to share data, the right model is:

1. The producer plugin saves to `PluginAnalysisResult` (visible to all)
2. The consumer plugin reads via `PluginDataRepository.get_analysis_result(experiment_id, producer_plugin_id)`

This keeps data ownership clear and avoids tight coupling between plugin schemas.

## Notes

- The session's `search_path` (Postgres) or working schema (SQLite) is set automatically — unqualified table names resolve to your plugin's schema.
- Don't hold sessions across `await` boundaries longer than necessary — they tie up a connection from the pool.
- Plugin sessions don't auto-roll-back on exception. Use `async with` so the context manager handles cleanup, and call `await session.commit()` explicitly when ready.
- For raw SQL, use `await session.execute(text("..."))`. Parameterize values; never f-string user input into SQL.

## Related

- [Concepts → Migrations](/sdk/concepts/migrations) — adding columns and indexes
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — chunked data updates
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — full example with CRUD
