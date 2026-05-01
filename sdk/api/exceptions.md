# Exceptions reference

Every SDK exception inherits from `PluginException`. The platform's middleware catches them and emits structured error responses with the exception's `code`, `message`, and `details`.

Source: [`mint_sdk/exceptions.py`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-python/src/mint_sdk/exceptions.py).

## Hierarchy

```
PluginException
├── ValidationException     — 400 Bad Request
├── PermissionException     — 403 Forbidden
├── ConfigurationException  — 500 Internal Server Error
├── RepositoryException     — 500 Internal Server Error
│   ├── NotFoundException   — 404 Not Found
│   └── ConflictException   — 409 Conflict
└── PluginLifecycleException — 500 Internal Server Error
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

`to_dict()` produces the JSON the platform serves to clients.

## `ValidationException` (400)

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

## `PermissionException` (403)

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

## `ConfigurationException` (500)

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

## `RepositoryException` (500)

Base class for storage / database errors. Use the subclasses (`NotFoundException`, `ConflictException`) when applicable; raise `RepositoryException` directly only for generic DB failures.

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

## `NotFoundException` (404)

Subclass of `RepositoryException`. Maps to 404, not 500.

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

## `ConflictException` (409)

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

## `PluginLifecycleException` (500)

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

## Response shape

The platform middleware catches `PluginException` and emits:

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

The HTTP status code is determined by the exception class (table at the top of this page).

## Notes

- Always raise from your code; don't return error dicts. The middleware can't enrich responses you build manually.
- Use `from exc` (PEP 3134) when wrapping an underlying exception to preserve the chain in logs.
- Don't put secrets or PII in `details` — it ends up in client-visible JSON.
- For non-`PluginException` errors that escape, the middleware returns 500 and the platform's auto-issue feature decides whether to file a GitHub bug.

## Related

- [Recipes → Error handling](/sdk/recipes/error-handling) — patterns and anti-patterns
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (User Manual track)
