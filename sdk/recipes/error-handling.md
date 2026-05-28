# Error handling

## Goal

Raise errors in plugin code that produce clear HTTP responses, log usefully, and don't crash the platform process.

## The exception taxonomy

`mint_sdk.exceptions` defines six exception classes plus the base. Use them for structured service/repository errors. For user-facing FastAPI route responses, use `fastapi.HTTPException` unless you have registered your own handler that translates `PluginException` to HTTP status codes.

```
PluginException
├── ValidationException
├── PermissionException
├── ConfigurationException
├── RepositoryException
│   ├── NotFoundException
│   └── ConflictException
└── PluginLifecycleException
```

Every subclass carries `message`, `code`, and `details`. `to_dict()` emits:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "experiment_id must be positive",
  "details": {"field": "experiment_id", "value": "-1"}
}
```

## Validation

```python
from fastapi import HTTPException, status

@router.post("/items")
async def create_item(body: ItemIn):
    if body.dose <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dose must be positive",
        )
    ...
```

Pydantic-level validation (e.g., type errors in the request body) is handled by FastAPI before your handler runs — those become 422 with a different shape. Use `ValidationException` inside service code only when you plan to catch and translate it before returning an HTTP response.

## Not found

```python
from fastapi import HTTPException, status

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    item = await repo.get_by_id(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return item
```

Use `NotFoundException` inside a repository/service layer if you want a structured Python error, then catch it in the route and translate it to `HTTPException`.

## Conflict

```python
from fastapi import HTTPException, status

@router.post("/panels")
async def create_panel(body: PanelIn):
    existing = await repo.get_by_name(body.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Panel '{body.name}' already exists",
        )
    ...
```

## Permission

```python
from fastapi import HTTPException, status

if user.role != "Admin" and item.owner_id != user.id:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only the owner or an admin can edit this item",
    )
```

Use the same pattern for runtime ownership checks on top of `require_plugin_role`. The role guard handles the broad "is this user an editor" question; ownership is a per-resource fact.

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

`from exc` preserves the chain. Catch `RepositoryException` at the route boundary if you want to translate it to an HTTP status; otherwise it is treated as an unhandled plugin error.

## User-facing vs. developer-facing messages

- **User-facing**: short, actionable, in the user's language. "Panel name must be unique." Avoid technical detail. For `HTTPException`, this is `detail`; for SDK exceptions, this is `message`.
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

The platform middleware logs unhandled plugin exceptions automatically; suppressing them by catching `Exception` makes debugging harder.

## Auto-issue reports

When `errorReporting.enabled` is enabled, unhandled exceptions become deduplicated GitHub issues with stack trace + request context. To opt a route out (e.g., a known-flaky external integration), catch the exception explicitly:

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

Caught and re-raised as `PluginException`, the original traceback stays chained for logs. If this is a route response, translate the exception to `HTTPException` before returning to the client.

## Notes

- Prefer `HTTPException` in route handlers and SDK exceptions in deeper service/repository code.
- Use `raise ... from exc` when wrapping lower-level errors.
- For errors that escape a plugin route, the platform error-isolation middleware returns 500 and logs the plugin route context.

## Related

- [API Reference → Exceptions](/sdk/api/exceptions) — full signatures
- [Recipes → Logging & tracing](/sdk/recipes/logging-tracing) — what gets logged with which fields
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (User Manual track)
