# Exceptions reference

The runtime exception family below inherits from `PluginException` and carries a machine-readable `code`, a human-readable `message`, and optional `details`.

MINT 1.2 SDK hosts automatically translate `PluginException` subclasses into HTTP responses. `create_standalone_app()` registers the shared handlers, and integrated platform middleware uses the same envelope. A custom FastAPI host must register the SDK handlers or supply an equivalent mapping.

| Exception | HTTP status |
|-----------|-------------|
| `ValidationException` | 400 |
| `PermissionException`, `UnsupportedExperimentTypeException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException`, `DesignDataOwnershipConflictException` | 409 |
| `EventVetoException` | 422 |
| `PlatformCompatibilityError` | 426 |
| Other `PluginException` subclasses | 500 |

FastAPI request-model validation is 422; it is distinct from service-layer `ValidationException` (400). `HTTPException` retains its explicit status.

Source: [`mint_sdk/exceptions.py`](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/exceptions.py).

## Hierarchy

```
PluginException
├── ValidationException
├── PermissionException
│   └── UnsupportedExperimentTypeException
├── ConfigurationException
├── RepositoryException
│   ├── NotFoundException
│   └── ConflictException
│       └── DesignDataOwnershipConflictException
├── EventVetoException
├── PlatformCompatibilityError
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
        "Failed to save panel",
        operation="save",
        entity="panel",
    ) from exc
```

`code = "REPOSITORY_ERROR"`.

## `NotFoundException`

Subclass of `RepositoryException`. Use it when a repository or service lookup misses. SDK hosts translate this to HTTP 404.

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

## MINT 1.2 ownership, type, and event errors

| Exception | Constructor / meaning |
|-----------|-----------------------|
| `UnsupportedExperimentTypeException(experiment_type, allowed_experiment_types, message=None, details=None)` | `EXPERIMENT_TYPE_NOT_ALLOWED`; write targets a disallowed type |
| `DesignDataOwnershipConflictException(*, experiment_id, current_owner_plugin_id, requested_owner_plugin_id)` | `DESIGN_DATA_OWNERSHIP_CONFLICT`; another plugin already owns this design |
| `EventVetoException(message=..., details=None)` | `EVENT_VETO`; reject a blocking before-save event |
| `PlatformCompatibilityError(message, sdk_api_version=None, platform_api_version=None, details=None)` | Internal platform/SDK API mismatch; HTTP code is `plugin.api_version_mismatch` |

A veto in an observer event is a failed observer, not a rollback of an already committed experiment. A settings CAS conflict or artifact replacement conflict is a `ConflictException`; reload the authoritative state before creating a new edit.

## Migration-specific errors

Defined in `mint_sdk.migrations.errors`:

| Symbol | Raised when |
|--------|-------------|
| `MigrationError` | Generic migration failure (base) |
| `MigrationChecksumError` | An applied revision's file was edited |
| `SchemaVersionAheadError` | DB has revisions the plugin doesn't ship |
| `DestructiveMigrationError` | A `drop_table` / `drop_column` ran without explicit allow |

These don't currently inherit from `PluginException` — they're caught by the migration runner specifically. See [Migrations reference](/sdk/api/migrations#exceptions).

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

The HTTP envelope wraps the Python exception's fields and adds transport context:

```json
{
  "code": "CONFLICT",
  "message": "Artifact changed; reload before replacing it",
  "status": 409,
  "request_id": "example-request-id",
  "details": null,
  "detail": {"error": "CONFLICT", "message": "Artifact changed; reload before replacing it"},
  "error": "CONFLICT"
}
```

`X-Request-ID` carries the same request ID. Treat `details` as client-visible data, not a private logging channel. The frontend and Python client can inspect `code`, `status`, and `request_id` without parsing prose.

## Notes

- Use SDK exception classes for structured application failures; use `HTTPException` when an explicit HTTP status is appropriate.
- Use `raise ... from exc` for low-level failures so the logs keep the original traceback.
- Don't put secrets or PII in `details` — it ends up in client-visible JSON.
- For non-`PluginException` errors that escape, the middleware returns 500 and the platform's auto-issue feature decides whether to file a GitHub bug.

## Related

- [Recipes → Error handling](/sdk/recipes/error-handling) — patterns and anti-patterns
- [Workflow → Updates](/workflow/updates) — auto-issue reporting (User Manual track)
