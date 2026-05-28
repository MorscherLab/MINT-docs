# Logging and tracing

## Goal

Emit structured logs and OpenTelemetry spans from plugin code that carry plugin name and, in platform request contexts, request IDs - so log queries and traces correlate cleanly with platform-side records.

## Get a logger

```python
from mint_sdk import get_plugin_logger

log = get_plugin_logger(__name__)
```

`get_plugin_logger` returns a standard Python `logging.Logger` configured to:

- Use the platform's JSON formatter in production or readable dev formatter in development
- Auto-attach `plugin=<name>` to each log record
- Include `request_id` when the platform request middleware has set one
- Honor the platform's root log-level configuration

Use it everywhere — module top-level, inside route handlers, inside `initialize`.

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

Add custom fields via `extra={...}`. They become top-level JSON keys.

```python
log.info(
    "panel created",
    extra={
        "panel_id": str(panel.id),
        "experiment_id": panel.experiment_id,
        "drug_count": len(panel.drugs),
    },
)
```

The SDK logger adapter adds the `plugin` field. The platform formatter also includes `request_id` from request context, plus selected fields such as `user_id` and `experiment_id` when you provide them via `extra`.

## Logging exceptions

```python
try:
    await _do_thing()
except SomeError:
    log.exception(   # or log.error(msg, exc_info=True)
        "thing failed",
        extra={"thing_id": thing_id},
    )
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

- The SDK's logger is process-local; in isolated mode each plugin subprocess has its own logger writing to stdout. The platform's log aggregator (or your container runtime) captures and forwards.
- For hot paths, prefer DEBUG over INFO — keeps the production stream clean while still being readable in dev.
- The `print()` builtin still works but bypasses the structured logger. Its output goes to stdout without JSON wrapping or auto-fields. Don't use it from production paths.

## Related

- [Recipes → Error handling](/sdk/recipes/error-handling) — how exceptions become structured log records
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (uses log fields to dedupe)
- [API Reference → Python SDK](/sdk/api/python) — `get_plugin_logger` signature
