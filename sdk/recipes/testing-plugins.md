# Testing plugins

Test plugin code without a running platform. Use the helpers of `mint_sdk.testing`.

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

These six names are the complete public testing API ([`testing/__init__.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/testing/__init__.py)). `mint_sdk.testing.plugins` is for the SDK's own tests. For the removed 1.3 helpers, see [Migrate from MINT 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4#run-the-codemod).

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

`Harness(plugin, *, settings=None, context=None, timeout=10.0)` starts the plugin on its real app (`mint_sdk.app.create_app`) in a `TestClient`, `harness.client`.

- `settings=` overrides the plugin settings, in memory.
- `context=` is the platform context that the plugin sees. Without it, the plugin runs standalone.

`RecordingContext` is an in-memory `PlatformContext`. Its `experiments`, `design`, `artifacts`, `users`, `instruments` and `objects` namespaces really write and read. It applies the platform access rules and design-data validation. `Harness` applies the plugin's `Metadata.writes` to it.

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

To set up the case, pass these arguments to `RecordingContext`: `plugin_id`, `reads_from`, `reads_from_any_plugin` (default `True`: a `"*"` counts as confirmed), `writes_to`, `experiment_types`, `experiments`, `users`, `instruments`, `design=Design(...)` and `instrument_status_grant`. A wrong `plugin_id` raises `ValueError` when the harness binds it.

| Member | Use |
|--------|-----|
| `context.set_actor(...)` | Changes the actor between calls |
| `context.published` | Each `(name, payload)` that `context.publish` delivered |
| `context.streamed` | Each `(topic, name, payload)` that the platform would stream for a `"realtime"` plugin |
| `context.instruments.reports` | Each accepted status report |

The harness does not simulate real authentication. `RecordingContext.is_authenticated` is `False` without an actor, and no JWT is verified. To test an auth dependency, override the FastAPI dependency, or give the context an `Actor` with the role and permissions to test. Test `access="configure"` with an `Actor` that has `plugins.configure`, and `access="admin"` with the role `admin`.

## Job tests with `Harness.run`

`Harness.run(job, payload=None, /, **inputs)` opens a job session, submits the job, polls until it ends and returns a `Run`. `job` is the job id or the decorated method. `Path` inputs go through the plugin staging endpoint first.

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

- The job ID is the `Job.id` of the spec, else the method name in kebab-case (`read_file` becomes `"read-file"`).
- `run.value` is the JSON value: the text for text results, the typed wire payload for other results. `run.job` is the final job state.
- A failed or cancelled job raises `JobFailedException` with the job error. A timeout raises `TimeoutError`.
- Give the inputs as a mapping, a pydantic model or keyword arguments, not both.

To call a handler directly, build its context with `job_context`:

```python
from mint_sdk.testing import job_context

def test_handler_reports_progress():
    context = job_context(settings={"threshold": 0.1})
    plugin = QcPlugin()
    plugin.double(21, context=context)
    assert context.reports
```

`job_context(*, settings=None, cancelled=False, actor=None)` keeps `reports` and `warnings`. With `cancelled=True`, `context.check()` raises `asyncio.CancelledError`. A settings mapping becomes attributes of `context.settings`.

## Events, exports and calls

`RecordingContext` fakes the [plugin communication](/sdk/concepts/plugin-communication) paths and applies the `reads_from` rule:

| Path | Set up | Recorded in |
|------|--------|-------------|
| `context.publish` of a `Metadata.emits` event | Nothing. The payload is checked against the declared model | `emitted`, as `(name, JSON payload, experiment_id)` |
| `context.plugins.read` | `stub_export(plugin, name, *, version, rows, key="id")` | `reads`, as `(plugin, name, version, ExportQuery)` |
| `context.plugins.call` | `stub_call(plugin, tool, *, result)` | `calls`, as `(plugin, tool, args, on_behalf_of)` |
| `context.plugins.start_job` | `stub_job(plugin, job, *, handle)` | `started_jobs`, as `(plugin, job, args, on_behalf_of)` |
| `context.plugins.subscribe` | Nothing | `subscriptions` (a set of names) |

- `Harness` has the same `stub_export`, `stub_call` and `stub_job` methods. They need `context=RecordingContext(...)`.
- A stubbed export pages the rows in order. It applies `ids` (on `key`), `experiment_id` and `updated_since` (on `updated_at`).
- A target outside `reads_from` raises `PermissionException` for a read and `PluginNotReadable` for a call. A target without a stub raises `NotFoundException`.

`harness.deliver(name, payload, /, *, experiment_id=None)` delivers a bus event of another plugin to the `@on(name)` handlers, as the event bus does. Each handler gets a `PluginEvent` with a new increasing `id`, `attempt` 1 and no actor. A handler failure raises. An event that no handler takes raises `ValueError`.

```python
from mint_sdk.testing import Harness, RecordingContext

from my_plugin.plugin import MonitorPlugin


def test_queue_change_reads_the_lc_method():
    context = RecordingContext()
    with Harness(MonitorPlugin, context=context) as harness:
        harness.stub_export("ms-planner", "lc-methods", version=1, rows=[
            {"id": "m1", "name": "HILIC", "updated_at": "2026-11-01T00:00:00Z"},
        ])
        harness.deliver("ms-planner.queue_changed", {"entry_id": 7, "state": "running"})
    assert context.reads[0][:3] == ("ms-planner", "lc-methods", 1)
```

## MCP declarations

Run a tool, prompt or resource through the same code as the platform with `call_tool`, `render_prompt` and `read_resource` from `mint_sdk.mcp`. Pass `platform=RecordingContext(...)` so that `ctx.design` and `ctx.artifacts` act as the actor. See [MCP tools](/sdk/recipes/mcp-tools#test-a-tool).

## Panels

`Harness.panel(panel_id, experiment_id, /, *, as_user=None)` calls a `@panel` method through the runtime and returns its sections as dictionaries, as the platform gets them. A refused `access`, a timeout and an invalid answer raise the same exception as on the platform. To give the panel data, pass `context=RecordingContext(...)` and save design data or artifacts first.

The `mint init` standard template adds an analysis-slot panel "Summary" and this test:

```python
def test_summary_panel_shows_the_experiment_and_links_to_the_workspace() -> None:
    with Harness(LabQcPlugin) as harness:
        sections = harness.panel("summary", 7)

    assert [(section["kind"], section.get("href")) for section in sections] == [
        ("kv", None),
        ("link", "/plugin/lab-qc"),
    ]
```

## Frontend tests

Run frontend tests with `vp run test` (Vitest through Vite+) in `frontend/`. Name each test `it('should <behavior> when <condition>')`. The oxlint preset of `mint lint` checks that titles start with "should".

Some form field types load on first use. A test that finds such a field right after mount must call `preloadFormFieldTypes()` in `beforeAll`; see [Field types that load on first use](/sdk/frontend/form-builder#field-types-that-load-on-first-use).

## Testing migrations

For Alembic migrations (`Metadata.database`), run `run_migrations`, `inspect_migrations` and `check_migrations` against temporary SQLite databases. [Backfill migrations](/sdk/recipes/backfill-migration#test-the-real-upgrade-path) has a complete upgrade test. The `mint-sdk[local-db]` extra supplies `aiosqlite` and `greenlet` for `sqlite+aiosqlite://` tests.

## What to cover

- The happy path of every route.
- The error paths of every route: validation, not found, permission, access level.
- The `initialize` and `shutdown` cycle of the plugin.
- Each migration on an empty database, and on top of the previous migration.

The platform sets no coverage threshold.

## Setup tips

- For async tests, add `pytest-asyncio` with `uv add --dev pytest-asyncio` and set `asyncio_mode = "auto"` in `pyproject.toml`.
- `RecordingContext` keeps state in memory. Share one instance across the route calls of one test.
- Run `mint doctor --strict` and `mint lint` in CI. They find removed and deprecated APIs and design-rule problems. See [CI patterns](/sdk/operations/ci-patterns).
