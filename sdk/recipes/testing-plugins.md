# Testing plugins

## Goal

Write fast unit and integration tests for plugin code without spinning up a full platform. Use in-memory repositories for unit tests; use TestClient for end-to-end route tests.

## Project layout

```
my_plugin/
├── src/my_plugin/
│   ├── plugin.py
│   └── routes.py
├── tests/
│   ├── conftest.py             # ← fixtures
│   ├── test_routes.py
│   └── test_repository.py
└── pyproject.toml
```

## A unit-test fixture

`mint_sdk.testing` ships in-memory implementations of every repository protocol plus a `StandalonePlatformContext` that wires them.

```python
# tests/conftest.py
import pytest
from mint_sdk.testing import (
    InMemoryExperimentRepository,
    InMemoryPluginDataRepository,
    InMemoryPluginRoleRepository,
    InMemoryUserRepository,
    StandalonePlatformContext,
    make_experiment,
    make_user,
)

from my_plugin.plugin import MyPlugin


@pytest.fixture
def seed_experiments():
    return [
        make_experiment(id=1, name="TCA pilot", status="ongoing",
                        experiment_type="lcms_sequence"),
        make_experiment(id=2, name="Drug screen", status="planned",
                        experiment_type="drug_panel"),
    ]


@pytest.fixture
def seed_users():
    return [
        make_user(id=10, username="alice", role="Member"),
        make_user(id=99, username="admin",  role="Admin"),
    ]


@pytest.fixture
async def context(seed_experiments, seed_users):
    return StandalonePlatformContext(
        experiments=InMemoryExperimentRepository(seed=seed_experiments),
        users=InMemoryUserRepository(seed=seed_users),
        plugin_data=InMemoryPluginDataRepository(),
        plugin_roles=InMemoryPluginRoleRepository(),
    )


@pytest.fixture
async def plugin(context):
    p = MyPlugin()
    await p.initialize(context)
    yield p
    await p.shutdown()
```

## Plugin-level tests

Test the plugin's behaviors directly through the convenience methods:

```python
# tests/test_repository.py
import pytest


@pytest.mark.asyncio
async def test_save_then_load_design(plugin):
    await plugin.save_design(experiment_id=1, data={"params": {"k": 5}})
    design = await plugin.load_design(experiment_id=1)

    assert design is not None
    assert design.data == {"params": {"k": 5}}
    assert design.plugin_id == plugin.metadata.name


@pytest.mark.asyncio
async def test_load_nonexistent_returns_none(plugin):
    design = await plugin.load_design(experiment_id=999)
    assert design is None
```

The in-memory repos honor the same protocol as production — they enforce permission rules (e.g., ANALYSIS plugins can't `create` experiments), so a unit test catches RBAC mistakes before integration.

## Route-level tests

Wrap the plugin in a FastAPI app via `mint_sdk.create_standalone_app` and test with `httpx.AsyncClient`:

```python
# tests/test_routes.py
import pytest
from httpx import AsyncClient, ASGITransport
from mint_sdk import create_standalone_app

from my_plugin.plugin import MyPlugin


@pytest.fixture
async def app():
    plugin = MyPlugin()
    return create_standalone_app(plugin)


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/my-plugin/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_404_on_missing_resource(client):
    response = await client.get("/api/my-plugin/items/9999")
    assert response.status_code == 404
    body = response.json()
    assert body["error"] == "NOT_FOUND"
    assert "not found" in body["message"].lower()
```

## Testing the role guard

To exercise `require_plugin_role`, override the FastAPI auth dependency to return the user you want to simulate:

```python
import pytest
from my_plugin.plugin import MyPlugin


@pytest.fixture
async def authed_app(seed_users):
    plugin = MyPlugin()
    app = create_standalone_app(plugin)

    # Override the auth dependency to "log in as Alice"
    async def _alice():
        return seed_users[0]   # alice, Member

    app.dependency_overrides[plugin._context.get_current_user_dependency()] = _alice
    yield plugin, app


@pytest.mark.asyncio
async def test_member_blocked_from_admin_route(authed_app):
    plugin, app = authed_app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.delete("/api/my-plugin/items/1")
    assert response.status_code == 403
```

Switch the override to `seed_users[1]` (admin) and the same test asserts a 204 — admins bypass plugin role checks.

## Testing migrations

Apply migrations against a fresh in-memory SQLite to verify they run cleanly:

```python
# tests/test_migrations.py
import pytest
from mint_sdk.testing import in_memory_runner


@pytest.mark.asyncio
async def test_migrations_apply_clean(plugin):
    runner = in_memory_runner(plugin)
    result = await runner.upgrade_to_latest()
    assert result.applied == ["001", "002"]
    assert result.error is None


@pytest.mark.asyncio
async def test_re_run_is_no_op(plugin):
    runner = in_memory_runner(plugin)
    await runner.upgrade_to_latest()
    second = await runner.upgrade_to_latest()
    assert second.applied == []   # nothing to do
```

::: info Testing-harness shape
The exact symbol names of the testing harness (`InMemoryExperimentRepository`, `make_experiment`, `in_memory_runner`, …) depend on your installed `mint-sdk` version. Browse `packages/sdk-python/src/mint_sdk/testing/` to confirm what's exported in your version. Older versions may name them differently or expose a thinner surface — check the testing module's `__init__.py`.
:::

## Coverage targets

Aim to cover:

- Every route's happy path
- Every route's error paths (validation, not found, permission)
- The plugin's `initialize` / `shutdown` cycle
- Each migration applies cleanly to an empty database
- Each migration applies cleanly when run on top of the previous

The platform doesn't require any specific coverage threshold; pick what your team finds useful.

## Notes

- `pytest-asyncio` is the conventional async test runner. Add it via `uv add --dev pytest-asyncio` and set `asyncio_mode = "auto"` in `pyproject.toml`.
- Async fixtures need `@pytest.fixture` (not `@pytest.fixture(scope="function")` plus async — the default scope is fine).
- The in-memory repos persist within one test session by default; use `autouse=True` cleanup fixtures or fresh instances per test if state leaks across tests.

## Related

- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — smaller test example
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — testing complex migrations
- [Operations → CI patterns](/sdk/operations/ci-patterns) — running tests in CI
