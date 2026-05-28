# Exceptions reference

Every SDK exception inherits from `PluginException` and carries a machine-readable `code`, a human-readable `message`, and optional `details`.

::: warning Current HTTP behavior
Current plugin route handling does not automatically map uncaught SDK exceptions to HTTP status codes. In user-facing FastAPI routes, raise `fastapi.HTTPException` when you need a specific status such as 400, 403, 404, or 409, or catch `PluginException` and translate it yourself. Use the SDK exception classes for service/repository boundaries where structured Python errors are useful.
:::

Source: [`mint_sdk/exceptions.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/exceptions.py).

## Hierarchy

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

## `PluginException`

Base class. All other exceptions inherit.

```python
class PluginException(Exception):
    def __init__(
        self,
        message: str,
        code: str = "PLUGIN_ERROR",
        details: dict | None = None,
    ): ...

    message: str          # human-readable
    code: str             # machine-readable, e.g. "VALIDATION_ERROR"
    details: dict[str, Any]

    def to_dict(self) -> dict: ...
```

`to_dict()` produces a JSON-friendly shape if you catch and serialize the exception.

## `ValidationException`

Use for invalid input that Pydantic doesn't catch — business rules, custom validators.

```python
class ValidationException(PluginException):
    def __init__(
        self,
        message: str,
        field: str | None = None,
        value: Any = None,
        details: dict | None = None,
    ): ...
```

```python
raise ValidationException(
    "Replicates must be between 1 and 12",
    field="replicates",
    value=body.replicates,
)
```

`code = "VALIDATION_ERROR"`. `value` is truncated to 100 chars in `details["value"]`.

## `PermissionException`

Use for runtime ownership / authorization checks on top of the role guards.

```python
class PermissionException(PluginException):
    def __init__(
        self,
        message: str,
        required_permission: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
if user.id != panel.owner_id:
    raise PermissionException(
        "Only the panel owner can edit this panel",
        required_permission="panel.edit",
    )
```

`code = "PERMISSION_DENIED"`.

## `ConfigurationException`

Use for plugin-side misconfiguration (missing required setting, malformed config).

```python
class ConfigurationException(PluginException):
    def __init__(
        self,
        message: str,
        config_key: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
if not self.settings.api_endpoint:
    raise ConfigurationException(
        "Plugin requires 'api_endpoint' to be set",
        config_key="api_endpoint",
    )
```

`code = "CONFIGURATION_ERROR"`.

## `RepositoryException`

Base class for storage / database errors. Use the subclasses (`NotFoundException`, `ConflictException`) when useful inside your service layer; raise `RepositoryException` directly only for generic DB failures.

```python
class RepositoryException(PluginException):
    def __init__(
        self,
        message: str,
        operation: str | None = None,
        entity: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
try:
    await session.commit()
except DatabaseError as exc:
    raise RepositoryException(
        f"Failed to save panel: {exc}",
        operation="save",
        entity="panel",
    ) from exc
```

`code = "REPOSITORY_ERROR"`.

## `NotFoundException`

Subclass of `RepositoryException`. Use it when a repository or service lookup misses. If this crosses a FastAPI route boundary, translate it to `HTTPException(status_code=404, ...)`.

```python
class NotFoundException(RepositoryException):
    def __init__(
        self,
        message: str,
        entity: str | None = None,
        entity_id: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
panel = await repo.get_by_id(panel_id)
if panel is None:
    raise NotFoundException(
        f"Panel not found",
        entity="panel",
        entity_id=str(panel_id),
    )
```

`code = "NOT_FOUND"`.

## `ConflictException`

Subclass of `RepositoryException`. Use for duplicate-key, optimistic-concurrency, and state conflicts.

```python
class ConflictException(RepositoryException):
    def __init__(
        self,
        message: str,
        entity: str | None = None,
        conflict_field: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
existing = await repo.get_by_name(body.name)
if existing:
    raise ConflictException(
        f"Panel '{body.name}' already exists",
        entity="panel",
        conflict_field="name",
    )
```

`code = "CONFLICT"`.

## `PluginLifecycleException`

Use during `initialize()`, `shutdown()`, or `check_health()` when the plugin hits an unrecoverable startup / lifecycle error.

```python
class PluginLifecycleException(PluginException):
    def __init__(
        self,
        message: str,
        phase: str | None = None,
        plugin_name: str | None = None,
        details: dict | None = None,
    ): ...
```

```python
async def initialize(self, context=None):
    if not self._validate_config():
        raise PluginLifecycleException(
            "Plugin requires 'api_endpoint' in plugin settings",
            phase="initialize",
            plugin_name=self.metadata.name,
        )
```

`code = "LIFECYCLE_ERROR"`.

## Migration-specific errors

Defined in `mint_sdk.migrations.errors`:

| Symbol | Raised when |
|--------|-------------|
| `MigrationError` | Generic migration failure (base) |
| `MigrationChecksumError` | An applied revision's file was edited |
| `SchemaVersionAheadError` | DB has revisions the plugin doesn't ship |
| `DestructiveMigrationError` | A `drop_table` / `drop_column` ran without explicit allow |

These don't currently inherit from `PluginException` — they're caught by the migration runner specifically. See [Migrations reference](/sdk/api/migrations#errors).

## Serializing errors

If you catch a `PluginException`, `to_dict()` gives you:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Replicates must be between 1 and 12",
  "details": {
    "field": "replicates",
    "value": "20"
  }
}
```

## Notes

- In FastAPI route handlers, use `HTTPException` for user-facing HTTP statuses unless you have registered your own `PluginException` handler.
- Use `raise ... from exc` for low-level failures so the logs keep the original traceback.
- Don't put secrets or PII in `details` — it ends up in client-visible JSON.
- For non-`PluginException` errors that escape, the middleware returns 500 and the platform's auto-issue feature decides whether to file a GitHub bug.

## Related

- [Recipes → Error handling](/sdk/recipes/error-handling) — patterns and anti-patterns
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (User Manual track)
