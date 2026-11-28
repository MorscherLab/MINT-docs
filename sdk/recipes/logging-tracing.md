# Logging and tracing

Write logs and OpenTelemetry spans from plugin code that carry the platform request ID. Your log lines and traces then match the platform records.

## Get a logger

Use the standard library:

```python
import logging

log = logging.getLogger(__name__)
```

In an installed plugin, records go to the platform root handlers: the JSON formatter in production, or the readable development formatter. The platform log configuration sets the level.

To group the lines of a plugin, use `logging.getLogger("mint.plugin.<name>")` and pass `plugin=<name>` in `extra`.

## Logging levels

| Level | Use for |
|-------|---------|
| `log.debug(...)` | Development detail. Off by default. Use it on hot paths |
| `log.info(...)` | Routine events: "starting X", "completed Y in N ms" |
| `log.warning(...)` | Degraded behavior, recoverable failures, retries |
| `log.error(...)` | A failure that the user sees. Include the exception |
| `log.critical(...)` | A failure of the whole plugin |

Do not use `log.error` for routine validation errors or 404. These are normal user errors.

## Structured fields

The platform JSON formatter writes `timestamp`, `level`, `logger`, `message`, `exception` (when present), `request_id`, and OpenTelemetry `trace_id` and `span_id`. From `extra`, it writes only `request_id`, `user_id`, `plugin` and `experiment_id`. It drops other `extra` keys, so put other values into the message:

```python
log.info(
    "panel created: panel_id=%s drug_count=%d",
    panel.id,
    len(panel.drugs),
    extra={"plugin": "panel-designer", "experiment_id": panel.experiment_id},
)
```

## Logging exceptions

```python
try:
    await _do_thing()
except SomeError:
    log.exception("thing failed: thing_id=%s", thing_id)  # or log.error(..., exc_info=True)
    raise
```

`log.exception` adds the traceback to the record. Do not log an exception and then swallow it: a logged error is not a handled error.

## Request correlation

The platform middleware (`middleware/request_context.py`) puts a `request_id` into a context variable. Every in-process log line of the request gets this ID, and the response carries it as `X-Request-ID`.

The context variable does not reach an outbound HTTP call or a queued job. Read the ID from the request and pass it on:

```python
from fastapi import Request

async def queue_job(request: Request, payload: dict):
    request_id = request.headers.get("X-Request-ID") or "no-request"
    await queue.enqueue({**payload, "parent_request_id": request_id})
```

In the worker, log with `extra={"request_id": parent_request_id}`. The formatter then writes that ID.

## Tracing

The platform sets up OpenTelemetry in `observability/tracing.py`. When `observability.enabled` is `true`, FastAPI requests become spans, SQLAlchemy calls can be instrumented, and log lines can carry the trace and span IDs.

Add custom spans in your plugin:

```python
from mint_sdk import Plugin
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class MyPlugin(Plugin):
    async def run_analysis(self, experiment_id: int):
        with tracer.start_as_current_span(
            "my_plugin.run_analysis",
            attributes={
                "experiment_id": experiment_id,
                "plugin": self.name,
            },
        ) as span:
            result = await self._compute(experiment_id)
            span.set_attribute("result.score", result.score)
            return result
```

When tracing is off, the tracer does nothing. Do not wrap spans in your own `if enabled:` check.

## Span attributes

Use the field names of the platform middleware, so that dashboards work for every plugin:

| Attribute | Content |
|-----------|---------|
| `experiment_id` | Numeric ID: the SDK `Experiment.id`, not the experiment code |
| `plugin` | Plugin name |
| `user_id` | Numeric user ID |
| `result.*` | Plugin metrics of the result |
| `error.*` | Set automatically on exceptions. Do not set these yourself |

## What stays out of logs

- Secrets: API keys, passwords, JWTs, signed URLs. The platform logger does not redact them.
- Large payloads: log a summary (size, key fields), not full request or response bodies.
- Personal data: emails, real names, and other data under your lab's data policy. The `User` field `username` is safe; `email` is personal data.

`print()` bypasses the structured logger. Its output goes to stdout without JSON or request fields. Do not use it in production code.

With error reporting on, MINT opens a GitHub issue for severe log records. The issue body includes `request_id`, `user_id`, `plugin` and `experiment_id`. See [Auto-issued bug reports](/admin/updates#auto-issued-bug-reports).
