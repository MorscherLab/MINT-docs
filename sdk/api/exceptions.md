# Exceptions reference

Every SDK runtime exception derives from `PluginException`. Each one has a machine-readable `code`, a human-readable `message` and optional `details`.

The SDK host changes a `PluginException` into an HTTP response with the status below. `mint_sdk.app.create_app()` registers the handlers (`mint_sdk.api_errors.register_api_error_handlers`), and the platform uses the same mapping. A custom FastAPI host must register these handlers or an equivalent mapping.

| Exception | HTTP status |
|-----------|-------------|
| `ValidationException` | 400 |
| `PermissionException`, `UnsupportedExperimentTypeException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException`, `DesignDataOwnershipConflictException` | 409 |
| `VersionConflictException` | 412 |
| `EventVetoException` | 422 |
| `UnavailableException` | 503 |
| `PlatformCompatibilityError` | 426 |
| Other `PluginException` subclasses | 500 |

A FastAPI request-model validation error is 422, not 400. An `HTTPException` keeps its own status.

Source: [`mint_sdk/exceptions.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/exceptions.py).

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
│       ├── DesignDataOwnershipConflictException
│       └── VersionConflictException
├── EventVetoException
├── UnavailableException
├── PlatformCompatibilityError
└── PluginLifecycleException
```

## `PluginException`

The base class of all exceptions on this page, except the migration errors.

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

`to_dict()` returns a JSON-ready dict. See [Serializing errors](#serializing-errors).

## `ValidationException`

Raise it for invalid input that Pydantic does not catch, such as a business rule.

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

Raise it when a runtime ownership or authorization check fails after the access-level check.

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

`code = "PERMISSION_DENIED"`. `PermissionException` also subclasses Python's built-in `PermissionError`, so `except PermissionError` catches it and `UnsupportedExperimentTypeException`.

## `ConfigurationException`

Raise it for a plugin misconfiguration, such as a missing required setting.

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

The base class of storage and database errors. Raise a subclass (`NotFoundException`, `ConflictException`) when one applies. Raise `RepositoryException` itself only for a general database failure.

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

Subclass of `RepositoryException`. Raise it when a lookup finds nothing.

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
        "Panel not found",
        entity="panel",
        entity_id=str(panel_id),
    )
```

`code = "NOT_FOUND"`.

## `ConflictException`

Subclass of `RepositoryException`. Raise it for a duplicate key, a concurrent change or a state conflict.

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

Raise it in `initialize()` or `shutdown()` for an error that the plugin cannot recover from.

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
async def initialize(self) -> None:
    if not self._validate_config():
        raise PluginLifecycleException(
            "Plugin requires 'api_endpoint' in plugin settings",
            phase="initialize",
            plugin_name=self.name,
        )
```

`code = "LIFECYCLE_ERROR"`.

## Ownership, type, version, availability and event errors

| Exception | Constructor / meaning |
|-----------|-----------------------|
| `UnsupportedExperimentTypeException(experiment_type, allowed_experiment_types, message=None, details=None)` | `EXPERIMENT_TYPE_NOT_ALLOWED`; write targets a disallowed type |
| `DesignDataOwnershipConflictException(*, experiment_id, current_owner_plugin_id, requested_owner_plugin_id)` | `DESIGN_DATA_OWNERSHIP_CONFLICT`; another plugin already owns this design |
| `VersionConflictException(*, entity, entity_id, version, expected_version)` | `VERSION_CONFLICT`; a write named an `expected_version` that the entity no longer has. `version` is the current version: read again, merge and retry. Import it from `mint_sdk.exceptions` |
| `UnavailableException(message, details=None)` | `UNAVAILABLE`; the call needs the platform or a host capability that is not present. A standalone plugin raises it for every platform-only call, such as `context.design.get()`. Exported from `mint_sdk` |
| `EventVetoException(message=..., details=None)` | `EVENT_VETO`; reject a blocking before-save event |
| `PluginCallError(message, details=None)` | `plugin.call_failed`; base of the `context.plugins.call` and `start_job` errors. Subclasses: `PluginNotReadable` and `PluginToolRefused` (`plugin.call_forbidden`), `PluginUnreachable` (`plugin.unreachable`). Import them from `mint_sdk.exceptions`. See [Plugin communication](/sdk/concepts/plugin-communication#calls-to-tools-and-jobs) |
| `PlatformCompatibilityError(message, sdk_api_version=None, platform_api_version=None, details=None)` | Internal platform/SDK API mismatch; exception `code` is `PLATFORM_API_VERSION_MISMATCH`, HTTP envelope code is `plugin.api_version_mismatch`. Import it from `mint_sdk.exceptions`; it is not exported from `mint_sdk` |

A veto in an observer event is a failed observer. It does not roll back the committed experiment. A settings revision conflict and an artifact replacement conflict raise `ConflictException`. A stale `expected_version` raises `VersionConflictException`. Load the current state again before you make a new edit.

## Migration-specific errors

Migration exceptions (`mint_sdk.migrations.errors`) do not inherit from `PluginException`; see [Alembic errors and recovery](/sdk/api/migrations#alembic-errors-and-recovery).

## Serializing errors

`to_dict()` of a caught `PluginException` returns:

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

The HTTP response puts these fields in the [error envelope](/reference/error-codes#the-error-envelope), with `status` and `request_id`. The client can see `details`: do not put secrets or personal data in it.

## Rules

- Raise an SDK exception for a structured application failure. Raise `HTTPException` when you need a specific HTTP status.
- Use `raise ... from exc` for a low-level failure, so that the log keeps the original traceback.
- An exception that is not a `PluginException` gives a 500. The platform then decides whether to file a bug report; see [Auto-issued bug reports](/admin/updates#auto-issued-bug-reports).

For patterns, see [Error handling](/sdk/recipes/error-handling).
