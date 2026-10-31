# Testing plugins

## Goal

Write fast unit and integration tests for plugin code without spinning up a full platform. Use the `mint_sdk.testing` helpers.

## The harness

```python
from mint_sdk.testing import (
    Harness,            # run a plugin on its real app: HTTP client + jobs
    RecordingContext,   # in-memory PlatformContext with working namespaces
    job_context,        # a JobContext for calling a job handler directly
    Run,                # result of Harness.run()
    JobFailedException, # raised when a harness job fails or is cancelled
    RecordingJobContext,# type of job_context()
)
```

These six names are the complete public testing surface. The source of truth is `packages/sdk-python/src/mint_sdk/testing/__init__.py`. `PluginTestHarness`, `CompletedPluginJob`, `PluginJobTestError`, `make_test_plugin`, `build_test_app` and `write_standalone_plugin_module` are removed (`mint doctor --fix` renames the first three). `mint_sdk.testing.plugins` holds `make_test_plugin` and `build_test_app` for the SDK's own tests; plugin tests use `Harness`.

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
│   ├── test_routes.py
│   └── test_jobs.py
└── pyproject.toml
```

## Plugin tests with `Harness` and `RecordingContext`

`Harness(plugin, *, settings=None, context=None, timeout=10.0)` starts the plugin on its real app (`mint_sdk.app.create_app`) in a `TestClient`. `harness.client` is that client. `settings=` overrides the plugin settings (kept in memory). `context=` is the platform context that the plugin sees; without it the plugin runs standalone.

`RecordingContext` is an in-memory `PlatformContext` whose `experiments`, `design`, `artifacts`, `users`, `instruments` and `objects` namespaces really write and read. It applies the platform's access rules and design-data validation, and `Harness` applies the write set of the plugin's `Metadata.writes` to it.

```python
# tests/test_routes.py
from mint_sdk import Actor
from mint_sdk.testing import Harness, RecordingContext

from my_plugin.plugin import MyPlugin

ACTOR = Actor(
    user_id="1", username="ada", role="member",
    permissions=frozenset({"experiments.view"}),
)


def test_summary_route_reads_the_design():
    context = RecordingContext(
        actor=ACTOR,
        experiments=[{"id": 1, "name": "Run 1", "experiment_type": "lcms", "status": "planned"}],
    )
    with Harness(MyPlugin, context=context) as harness:
        response = harness.client.get("/api/my-plugin/experiments/1/summary")
    assert response.status_code == 200
```

Pass `plugin_id`, `reads_from`, `writes_to`, `experiment_types`, `experiments`, `users`, `instruments`, `design=Design(...)` and `instrument_status_grant` to `RecordingContext` to set up the case. A wrong `plugin_id` raises `ValueError` when the harness binds it. `context.set_actor(...)` changes the actor between calls. `context.published` keeps each `(name, payload)` that `context.publish` delivered, `context.streamed` keeps each `(topic, name, payload)` that the platform would stream for a `"realtime"` plugin, and `context.instruments.reports` keeps each accepted status report.

The harness does not simulate real auth. `RecordingContext.is_authenticated` is `False` without an actor, and there is no real JWT verification. Tests that verify auth dependencies override the FastAPI dependency directly, or give the context an `Actor` with the role and permissions to test. Test `access="configure"` and `access="admin"` routes with an `Actor` that has `plugins.configure` and with the role `admin`.

## Job tests with `Harness.run`

`Harness.run(job, payload=None, /, **inputs)` opens a job session, submits the job, polls until it finishes and returns a `Run`. `Path` inputs are uploaded through the plugin's staging endpoint first. `job` is the job id or the decorated method.

```python
from mint_sdk import Job, JobContext, Metadata, Plugin, job, plugin
from mint_sdk.testing import Harness, JobFailedException


class QcMeta(Metadata):
    domain = "qc"
    prefix = "/qc"


class Double(Job):
    cpu = 1


@plugin(QcMeta)
class QcPlugin(Plugin):
    @job(Double)
    def double(self, value: int, *, context: JobContext) -> int:
        context.report(50, "Doubling")
        return value * 2


def test_double_job_returns_twice_the_input():
    with Harness(QcPlugin, timeout=10.0) as harness:
        run = harness.run(QcPlugin.double, value=21)
    assert run.value == 42
```

The job ID defaults to the method name in kebab-case (`read_file` becomes `"read-file"`), or the `Job.id` of the spec. `run.value` is the JSON value (the text for text results, the typed wire payload for other results); `run.job` is the final job state. A failed or cancelled job raises `JobFailedException` with the job's error; a timeout raises `TimeoutError`. Give the inputs as a mapping, a pydantic model or keyword arguments, not both.

To call a handler directly, build its context with `job_context`:

```python
from mint_sdk.testing import job_context

def test_handler_reports_progress():
    context = job_context(settings={"threshold": 0.1})
    plugin = QcPlugin()
    plugin.double(21, context=context)
    assert context.reports
```

`job_context(*, settings=None, cancelled=False, actor=None)` keeps `reports` and `warnings`. `job_context(cancelled=True)` makes `context.check()` raise `asyncio.CancelledError`. A settings mapping is exposed as attributes of `context.settings`.

## MCP declarations

Run a tool, prompt or resource through the same code as the platform with `call_tool`, `render_prompt` and `read_resource` from `mint_sdk.mcp`. Pass `platform=RecordingContext(...)` so that `ctx.design` and `ctx.artifacts` act as the actor. See [MCP tools](/sdk/recipes/mcp-tools#test-a-tool).

## Testing migrations

For Alembic migrations (`Metadata.database`), use `run_migrations`, `inspect_migrations` and `check_migrations` against temporary SQLite databases; [Backfill migrations](/sdk/recipes/backfill-migration#test-the-real-upgrade-path) has a complete upgrade test. The `mint-sdk[local-db]` extra supplies `aiosqlite` and `greenlet` for `sqlite+aiosqlite://` tests. The legacy `MigrationRunner` is removed.

## Coverage targets

Aim to cover:

- Every route's happy path
- Every route's error paths (validation, not found, permission, access level)
- The plugin's `initialize` / `shutdown` cycle
- Each migration applies cleanly to an empty database
- Each migration applies cleanly when run on top of the previous

The platform doesn't require any specific coverage threshold — pick what your team finds useful.

## Notes

- `pytest-asyncio` is the conventional async test runner. Add it via `uv add --dev pytest-asyncio` and set `asyncio_mode = "auto"` in `pyproject.toml`.
- `RecordingContext` keeps state in memory; share one instance across several route calls within one test.
- Run `mint doctor --strict` in the test suite or CI to catch removed APIs.

## Related

- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — basic test setup
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — testing complex migrations
- [Operations → CI patterns](/sdk/operations/ci-patterns) — running tests in CI
- [API → Python SDK](/sdk/api/python#testing) — what each helper exports
