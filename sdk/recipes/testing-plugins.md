# Testing plugins

## Goal

Write fast unit and integration tests for plugin code without spinning up a full platform. Use the `mint_sdk.testing` harness — four exports cover most cases.

## The harness

```python
from mint_sdk.testing import (
    make_test_plugin,                # build a minimal AnalysisPlugin subclass inline
    build_test_app,                  # turn a plugin instance into a FastAPI app
    RecordingContext,                # in-memory PlatformContext with a real PluginDataRepository
    write_standalone_plugin_module,  # drop a uvicorn-compatible plugin module into tmp_path
)
```

That's the complete public testing surface. Older docs referenced helpers like `InMemoryExperimentRepository`, `make_experiment`, `StandalonePlatformContext`, or `in_memory_runner` — none of those exist. The source of truth is `packages/sdk-python/src/mint_sdk/testing/__init__.py`.

## Project layout

```
my_plugin/
├── src/my_plugin/
│   ├── plugin.py
│   └── routes.py
├── tests/
│   ├── conftest.py
│   ├── test_repository.py
│   └── test_routes.py
└── pyproject.toml
```

## Plugin-level fixture with `RecordingContext`

`RecordingContext` is an in-memory `PlatformContext` whose `PluginDataRepository` actually writes/reads from a Python dict. It's enough to exercise the plugin's convenience methods (`save_design`, `load_design`, `save_analysis`, `load_analysis`).

```python
# tests/conftest.py
import pytest
from mint_sdk.testing import RecordingContext

from my_plugin.plugin import MyPlugin


@pytest.fixture
async def plugin():
    p = MyPlugin()
    ctx = RecordingContext()
    await p.initialize(ctx)
    yield p
    await p.shutdown()
```

Tests using this fixture:

```python
# tests/test_repository.py
import pytest


@pytest.mark.asyncio
async def test_save_then_load_design(plugin):
    await plugin.save_design(experiment_id=1, data={"params": {"k": 5}})
    design = await plugin.load_design(experiment_id=1)
    assert design is not None
    assert design.data == {"params": {"k": 5}}


@pytest.mark.asyncio
async def test_load_nonexistent_returns_none(plugin):
    design = await plugin.load_design(experiment_id=999)
    assert design is None
```

## Route-level tests with `build_test_app`

For end-to-end HTTP tests, wrap the plugin in a FastAPI app and drive it with `httpx.AsyncClient`:

```python
# tests/test_routes.py
import pytest
from httpx import ASGITransport, AsyncClient
from mint_sdk.testing import RecordingContext, build_test_app

from my_plugin.plugin import MyPlugin


@pytest.fixture
async def app():
    plugin = MyPlugin()
    await plugin.initialize(RecordingContext())
    yield build_test_app(plugin)
    await plugin.shutdown()


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/my-plugin/health")
    assert response.status_code == 200
```

`build_test_app` is the same code path the platform uses to mount plugins — what works under test mirrors production mounting.

## Synthetic plugins with `make_test_plugin`

When you want to test the platform's behavior with an arbitrary plugin (for plugin-loader, marketplace, or migration tests), build a minimal one inline:

```python
from mint_sdk.testing import make_test_plugin
from mint_sdk.models import PluginType


def test_loader_handles_minimal_analysis_plugin():
    PluginCls = make_test_plugin(
        name="loader-test",
        plugin_type=PluginType.ANALYSIS,
        routes_prefix="/loader-test",
    )
    plugin = PluginCls()
    # ... feed plugin into platform's loader and assert ...
```

`make_test_plugin` returns a *class*; instantiate it before passing to anything that takes an `AnalysisPlugin` instance. Optional kwargs include `route_builder`, `before_save`, `after_save`, `status_change`, `health_status`, `health_message`.

## Subprocess-style tests with `write_standalone_plugin_module`

For tests that need a real Python module on disk (e.g., to test the platform's subprocess plugin manager):

```python
from pathlib import Path
from mint_sdk.testing import write_standalone_plugin_module


def test_subprocess_starts(tmp_path: Path):
    module_path = write_standalone_plugin_module(tmp_path, name="my-test-plugin")
    # platform.subprocess_manager.start_plugin(module_path)
    # assert it bound a port and serves /api/my-test-plugin/health
```

## Testing migrations

Use a temporary SQLite database and run migrations through `MigrationRunner.run(...)` directly:

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import MigrationRunner

from my_plugin.migrations.001_initial import CreatePanelsTable
from my_plugin.migrations.002_add_tags import AddPanelTagsColumn


@pytest.mark.asyncio
async def test_migrations_apply_clean(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}")
    runner = MigrationRunner(engine, plugin_name="my_plugin", dialect="sqlite")
    result = await runner.run([CreatePanelsTable(), AddPanelTagsColumn()])
    assert result.applied == [1, 2]
    assert not result.errors
```

`MigrationResult.applied` is a list of integer `version`s.

## Coverage targets

Aim to cover:

- Every route's happy path
- Every route's error paths (validation, not found, permission)
- The plugin's `initialize` / `shutdown` cycle
- Each migration applies cleanly to an empty database
- Each migration applies cleanly when run on top of the previous

The platform doesn't require any specific coverage threshold — pick what your team finds useful.

## Notes

- `pytest-asyncio` is the conventional async test runner. Add it via `uv add --dev pytest-asyncio` and set `asyncio_mode = "auto"` in `pyproject.toml`.
- `RecordingContext` is request-scoped per fixture; if you need state to persist across multiple route calls within one test, share the same context instance (move it out of the fixture or pass it explicitly).
- The harness intentionally doesn't simulate auth — `RecordingContext.is_authenticated` returns `True`; there's no real JWT verification. Tests that need to verify auth dependencies should override the FastAPI dependency directly.

## Related

- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — basic test setup
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — testing complex migrations
- [Operations → CI patterns](/sdk/operations/ci-patterns) — running tests in CI
- [API → Python SDK](/sdk/api/python#testing-harness) — what each helper exports
