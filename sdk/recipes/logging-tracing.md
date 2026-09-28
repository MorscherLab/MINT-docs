# Logging and tracing

## Goal

Emit logs and OpenTelemetry spans from plugin code that carry, in platform request contexts, request IDs - so log queries and traces correlate cleanly with platform-side records.

## Get a logger

Use the standard library:

```python
import logging

log = logging.getLogger(__name__)
```

Inside an installed plugin, records propagate to the platform's root handlers:
the JSON formatter in production or the readable development formatter. The
platform's log configuration sets the level.

Use `logging.getLogger("mint.plugin.<name>")` and pass `plugin=<name>` in
`extra` when you want it (see below).

## Logging levels

| Level | Use for |
|-------|---------|
| `log.debug(...)` | Verbose, dev-only detail. Off by default. |
| `log.info(...)` | Routine operational events: "starting X", "completed Y in N ms" |
| `log.warning(...)` | Degraded behavior, recoverable failures, retries |
| `log.error(...)` | Unrecoverable failure that the user sees. Pair with the exception. |
| `log.critical(...)` | Plugin-wide failure (down to lifecycle). Rare. |

Don't `log.error` for routine validation or 404 — those are normal user errors and pollute the error stream.

## Structured fields

The platform JSON formatter writes `timestamp`, `level`, `logger`, `message`,
`exception` (when present), `request_id`, OpenTelemetry `trace_id`/`span_id`,
and only three `extra` keys: `user_id`, `plugin` and `experiment_id`. Other
`extra` keys are dropped from the JSON line, so put anything else into the
message:

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

`log.exception` includes the traceback in the log record. Don't `log.exception` and then swallow the error - it conflates "I logged this" with "I handled this".

## Request correlation

The platform's `middleware/request_context.py` injects a `request_id` into a context variable. Every in-process log line emitted during the request gets the same ID, and the response includes it as `X-Request-ID`.

To propagate the request ID into something the platform cannot auto-inject, such as an outbound HTTP call or a queued job, accept it as an explicit route dependency or read it from the request:

```python
from fastapi import Request

async def queue_job(request: Request, payload: dict):
    request_id = request.headers.get("X-Request-ID") or "no-request"
    await queue.enqueue({**payload, "parent_request_id": request_id})
```

When the worker picks up the job, include the parent ID in `extra={"request_id": parent_request_id}` so the platform formatter can include it.

## Tracing

OpenTelemetry tracing is wired by the platform's `observability/tracing.py`. When `observability.enabled` is `true`, FastAPI requests become spans, SQLAlchemy calls can be instrumented, and logging can include trace/span IDs.

For custom spans inside your plugin:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class MyPlugin(AnalysisPlugin):
    async def run_analysis(self, experiment_id: int):
        with tracer.start_as_current_span(
            "my_plugin.run_analysis",
            attributes={
                "experiment_id": experiment_id,
                "plugin": self.metadata.name,
            },
        ) as span:
            result = await self._compute(experiment_id)
            span.set_attribute("result.score", result.score)
            return result
```

When tracing is disabled, the tracer is a no-op. Don't gate the spans yourself with an `if enabled:` check.

## Span attribute conventions

| Attribute | Notes |
|-----------|-------|
| `experiment_id` | Numeric ID — use the SDK's `Experiment.id`, not the user-facing code |
| `plugin` | Plugin name for cross-plugin correlation |
| `user_id` | Numeric user ID |
| `result.*` | Plugin-specific metrics on the operation outcome |
| `error.*` | Set automatically on exceptions; don't shadow these manually |

Match field names with what the platform's middleware emits so dashboards work uniformly.

## What doesn't go in logs

- **Secrets**: API keys, passwords, JWTs, signed URLs. The platform's structured logger doesn't redact — you don't put them in.
- **Large payloads**: Don't log full request/response bodies. Log a summary (size, key fields) instead.
- **PII**: Don't log emails, real names, or anything covered by your lab's data-handling policy. The User dataclass has `username` (safe) and `email` (consider PII).

## Notes

- For hot paths, prefer DEBUG over INFO — keeps the production stream clean while still being readable in dev.
- The `print()` builtin still works but bypasses the structured logger. Its output goes to stdout without JSON wrapping or request fields. Don't use it from production paths.

## Related

- [Recipes → Error handling](/sdk/recipes/error-handling) — how exceptions become structured log records
- [Workflow → Updates](/admin/updates) — auto-issue reporting (uses log fields to dedupe)
