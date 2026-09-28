# Testing plugins

## Goal

Write fast unit and integration tests for plugin code without spinning up a full platform. Use the `mint_sdk.testing` helpers.

## The harness

```python
from mint_sdk.testing import (
    RecordingContext,                # in-memory PlatformContext with working repositories
    build_test_app,                  # plugin (class or instance) -> standalone FastAPI app
    PluginTestHarness,               # run real @job handlers and wait for their results
    CompletedPluginJob,              # result returned by PluginTestHarness.run()
    PluginJobTestError,              # raised when a harness job fails or is cancelled
    make_test_plugin,                # build a minimal AnalysisPlugin subclass inline
    write_standalone_plugin_module,  # write a uvicorn-compatible module into tmp_path
)
```

These seven names are the complete public testing surface. Older docs referenced helpers like `InMemoryExperimentRepository`, `make_experiment`, `StandalonePlatformContext`, or `in_memory_runner` — none of those exist. The source of truth is `packages/sdk-python/src/mint_sdk/testing/__init__.py`.

## Project layout

```
my_plugin/
├── src/my_plugin/
│   ├── plugin.py
│   ├── routers/
│   │   └── analysis.py
│   ├── schemas/
│   └── services/
├── tests/
│   ├── conftest.py
│   ├── test_repository.py
│   └── test_routes.py
└── pyproject.toml
```

## Plugin-level fixture with `RecordingContext`

`RecordingContext` is an in-memory `PlatformContext` whose `ExperimentRepository` actually writes/reads from a Python dict. It's enough to exercise the plugin's convenience methods (`save_design`, `load_design`, `save_analysis`, `load_analysis`).

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

`build_test_app` wraps the SDK's `create_standalone_app()` (with CORS off), so routes, error handlers and runtime dependencies are mounted as in a standalone plugin process. It is not the platform's plugin loader. `ASGITransport` does not run the app lifespan, which is why the fixture initializes the plugin with `RecordingContext` itself.

## Job tests with `PluginTestHarness`

`PluginTestHarness` starts the plugin in a standalone `TestClient`, opens a job
session, submits a job by its ID, polls until it finishes and returns the
result. `Path` inputs are uploaded through the plugin's staging endpoint first.

```python
from mint_sdk import AnalysisPlugin, job, mint_plugin
from mint_sdk.testing import PluginTestHarness


@mint_plugin(analysis_type="qc", routes_prefix="/qc")
class QcPlugin(AnalysisPlugin):
    @job(cpu=1)
    def double(self, value: int) -> int:
        return value * 2


def test_double_job_returns_twice_the_input():
    with PluginTestHarness(QcPlugin(), timeout=10.0) as harness:
        completed = harness.run("double", value=21)
    assert completed.value == 42
```

The job ID defaults to the method name with `_` replaced by `-`
(`read_file` → `"read-file"`), or the explicit `@job(job_id=...)`.

`run(job_id, inputs=None, *, timeout=None, **keyword_inputs)` accepts a mapping,
a Pydantic model or keyword inputs, but not both. `job.value` is the JSON value
(or the text for text results); `job.result` is the full result payload and
`job.state` the final job state. A failed or cancelled job raises
`PluginJobTestError` with the job's error; a timeout raises `TimeoutError`.

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
    pythonpath, factory_target = write_standalone_plugin_module(
        tmp_path, module_name="my_test_plugin", routes_prefix="/my-test-plugin",
    )
    # Put `pythonpath` on PYTHONPATH, start `factory_target` with the
    # subprocess manager, then assert it serves /api/my-test-plugin/health.
```

## Testing migrations

For Alembic migrations (`get_migration_spec()`), use `run_migrations`,
`inspect_migrations` and `check_migrations` against temporary SQLite databases;
[Backfill migrations](/sdk/recipes/backfill-migration#test-the-real-upgrade-path)
has a complete upgrade test.

For legacy integer migrations, run `MigrationRunner.run(...)` directly. The
`mint-sdk[local-db]` extra supplies `aiosqlite` and `greenlet` for
`sqlite+aiosqlite://` tests:

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine
from mint_sdk.migrations import MigrationRunner

from my_plugin.migrations.v001_initial import CreatePanelsTable
from my_plugin.migrations.v002_add_tags import AddPanelTagsColumn


@pytest.mark.asyncio
async def test_migrations_apply_clean(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}")
    runner = MigrationRunner(engine, plugin_name="my_plugin", dialect="sqlite")
    result = await runner.run([CreatePanelsTable(), AddPanelTagsColumn()])
    assert result.applied == [1, 2]
    assert not result.errors
```

`MigrationResult.applied` is a list of integer `version`s; `stamped` and `errors` report the rest.

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
- The harness intentionally doesn't simulate real auth. `RecordingContext.is_authenticated` is `False` by default and becomes `True` when you pass `user={...}` or `actor=PluginActor(...)`, or call `set_actor()`; there is no real JWT verification. Tests that need to verify auth dependencies should override the FastAPI dependency directly.

## Related

- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — basic test setup
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — testing complex migrations
- [Operations → CI patterns](/sdk/operations/ci-patterns) — running tests in CI
- [API → Python SDK](/sdk/api/python#testing-harness) — what each helper exports
