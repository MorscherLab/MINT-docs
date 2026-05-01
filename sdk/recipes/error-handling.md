# Error handling

## Goal

Raise errors in plugin code that turn into well-structured HTTP responses, log usefully, and don't crash the platform process.

## The exception taxonomy

`mint_sdk.exceptions` defines six exception classes plus the base. Use them for plugin-side errors.

```
PluginException                       (base)
├── ValidationException                400 — bad input
├── PermissionException                403 — auth / role denied
├── ConfigurationException             500 — plugin misconfigured
├── RepositoryException                500 — DB / storage failure
│   ├── NotFoundException              404 — resource not found
│   └── ConflictException              409 — duplicate / state conflict
└── PluginLifecycleException           500 — startup / shutdown error
```

Every subclass carries `message`, `code`, and `details`. The platform middleware catches `PluginException` and emits:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "experiment_id must be positive",
  "details": {"field": "experiment_id", "value": "-1"}
}
```

## Validation

```python
from mint_sdk import ValidationException

@router.post("/items")
async def create_item(body: ItemIn):
    if body.dose <= 0:
        raise ValidationException(
            "Dose must be positive",
            field="dose",
            value=body.dose,
        )
    ...
```

Pydantic-level validation (e.g., type errors in the request body) is handled by FastAPI before your handler runs — those become 422 with a different shape. Use `ValidationException` for *business* rules Pydantic can't express.

## Not found

```python
from mint_sdk import NotFoundException

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    item = await repo.get_by_id(item_id)
    if item is None:
        raise NotFoundException(
            f"Item not found",
            entity="item",
            entity_id=str(item_id),
        )
    return item
```

`NotFoundException` is a subclass of `RepositoryException` but is mapped to 404, not 500. The middleware does the mapping; your code just raises.

## Conflict

```python
from mint_sdk import ConflictException

@router.post("/panels")
async def create_panel(body: PanelIn):
    existing = await repo.get_by_name(body.name)
    if existing:
        raise ConflictException(
            f"Panel '{body.name}' already exists",
            entity="panel",
            conflict_field="name",
        )
    ...
```

## Permission

```python
from mint_sdk import PermissionException

if user.role != "Admin" and item.owner_id != user.id:
    raise PermissionException(
        "Only the owner or an admin can edit this item",
        required_permission="item.edit",
    )
```

Use `PermissionException` for runtime ownership checks on top of `require_plugin_role`. The role guard handles the broad "is this user an editor" question; ownership is a per-resource fact.

## Repository / DB errors

For low-level DB failures, wrap the underlying exception:

```python
from mint_sdk import RepositoryException
from sqlalchemy.exc import DatabaseError

try:
    await session.commit()
except DatabaseError as exc:
    raise RepositoryException(
        f"Failed to save panel: {exc}",
        operation="save",
        entity="panel",
    ) from exc
```

`from exc` preserves the chain — the original traceback is kept for the structured log entry while the user sees the friendly message.

## User-facing vs. developer-facing messages

- **User-facing**: short, actionable, in the user's language. "Panel name must be unique." Avoid technical detail. This is the exception's `message`.
- **Developer-facing**: full context, stack trace, internal state. This goes into `details` and the log line, not the message.

```python
raise ValidationException(
    "Dose must be between 0.1 and 1000",       # user-facing
    field="dose",
    value=body.dose,
    details={                                  # developer-facing
        "received": body.dose,
        "min_allowed": 0.1,
        "max_allowed": 1000,
        "raw_input": body.model_dump(),
    },
)
```

## Don't catch and re-raise blindly

```python
# DON'T
try:
    item = await repo.get_by_id(id)
except Exception:
    raise NotFoundException("...")     # masks real failures as 404

# DO
item = await repo.get_by_id(id)
if item is None:
    raise NotFoundException("...")     # only convert the actual not-found case
```

The platform middleware logs unhandled exceptions automatically; suppressing them by catching `Exception` makes debugging harder.

## Auto-issue reports

When `observability.autoIssue` is enabled, unhandled exceptions become deduplicated GitHub issues with stack trace + request context. To opt a route out (e.g., a known-flaky external integration), catch the exception explicitly:

```python
import logging
log = get_plugin_logger(__name__)

try:
    return await _call_flaky_external_service()
except ExternalServiceTimeout as exc:
    log.warning("external service timed out", extra={"upstream": "vendor-x"})
    raise PluginException(
        "Upstream service unavailable, please retry",
        code="UPSTREAM_TIMEOUT",
    ) from exc
```

Caught and re-raised as `PluginException`, the auto-issue logic skips it (it's expected) but the structured log still records the timeout.

## Notes

- Always raise from your code; don't return error dicts. The middleware can't enrich responses you build manually.
- Status codes derive from the exception class — you don't pick them. If you need a different status, override `code` and let the platform map.
- For non-`PluginException` errors that escape, the middleware returns 500 and the platform's auto-issue feature decides whether to file a GitHub report.

## Related

- [API Reference → Exceptions](/sdk/api/exceptions) — full signatures
- [Recipes → Logging & tracing](/sdk/recipes/logging-tracing) — what gets logged with which fields
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (User Manual track)
