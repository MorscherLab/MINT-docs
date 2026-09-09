# Error handling

MINT 1.2 gives standalone and integrated SDK routes the same structured error envelope. Raise a typed SDK exception for a known application failure; use `HTTPException` for an explicit transport status. Unexpected exceptions remain 500 errors.

## Validate and report business failures

```python
from pydantic import BaseModel, Field
from mint_sdk import AnalysisPlugin, CurrentExperiment, ValidationException, endpoint

class CompareRequest(BaseModel):
    reference_sample: str = Field(min_length=1)

class MyPlugin(AnalysisPlugin):
    @endpoint.post("/experiments/{experiment_id}/compare")
    async def compare(
        self, body: CompareRequest, experiment: CurrentExperiment,
    ) -> dict[str, str]:
        design = await self.load_design(experiment.id)
        names = {sample["name"] for sample in design.data.get("samples", [])} if design else set()
        if body.reference_sample not in names:
            raise ValidationException(
                "Choose a reference sample from this experiment",
                field="reference_sample",
            )
        return {"reference_sample": body.reference_sample}
```

Pydantic rejects an empty field with 422 before the handler. The business-rule failure above becomes 400 with `code="VALIDATION_ERROR"`. `CurrentExperiment` supplies the separate permission/visibility checks.

## Use the appropriate exception

| Situation | Raise | SDK HTTP response |
|-----------|-------|-------------------|
| Invalid business input | `ValidationException` | 400 |
| Forbidden action | `PermissionException` | 403 |
| Missing resource | `NotFoundException` | 404 |
| Duplicate or stale edit | `ConflictException` | 409 |
| Blocking lifecycle veto | `EventVetoException` | 422 |
| Plugin misconfiguration/storage failure | `ConfigurationException` / `RepositoryException` | 500 |
| Platform integration unavailable | `HTTPException(503, "Platform integration required")` | 503 |

Ownership conflicts and unsupported experiment types already have SDK subclasses; allow the repository to report them. See [Exceptions](/sdk/api/exceptions) for constructors and the complete status mapping.

## Handle concurrent edits without losing data

For settings replacement, retain `settings_revision` from the snapshot used to build the candidate. For file-artifact replacement, retain the object's key and supply `expected_object_key`. A 409 means the candidate is stale: fetch the new state and ask the UI to reconcile the change. Do not retry the same full replacement without its revision.

Use `patch_settings_transactionally()` for a shallow settings patch that the SDK can safely retry against the latest state. JSON artifact batches are atomic; a failure should not be converted into a partial-success response.

For plugin-owned SQL tables, enforce uniqueness with a database constraint. A preflight `SELECT` can improve feedback but cannot prevent concurrent inserts. Catch the specific integrity error, roll back, and translate only the known duplicate constraint into `ConflictException`.

## Preserve the traceback and keep secrets out of responses

```python
from mint_sdk import RepositoryException
from sqlalchemy.exc import DatabaseError

try:
    await session.commit()
except DatabaseError as exc:
    await session.rollback()
    raise RepositoryException(
        "Could not save the panel", operation="save", entity="panel",
    ) from exc
```

`raise ... from exc` preserves the server traceback. `message`, `details`, and exception `to_dict()` may all reach the client. Log internal diagnostics separately; do not interpolate database connection strings, raw SQL errors, credentials, or entire request bodies into public errors.

## Expected upstream failures

Translate a known timeout into an actionable status:

```python
import httpx
from fastapi import HTTPException

try:
    response = await upstream.get("/status")
    response.raise_for_status()
except httpx.TimeoutException as exc:
    raise HTTPException(503, "Instrument service timed out; retry shortly") from exc
```

Retry only operations whose semantics permit it. A timed-out write may already have committed. Reload by its stable identity before repeating an artifact or external write. Do not turn arbitrary failures into 404 or swallow cancellation with a broad catch.

## Reading errors on the client

The wire envelope includes `code`, `message`, `status`, `request_id`, and `details`, with legacy `detail`/`error` fields retained. Show the actionable message, use `code` for branching, and include `request_id` in support reports. Do not parse English message text to distinguish a conflict from a permission failure.

```python
from mint_sdk import MINTClient
from mint_sdk.client import MINTAPIError, NotFoundError

with MINTClient() as client:
    try:
        experiment = client.experiments.get(42)
    except NotFoundError:
        print("Experiment is unavailable")
    except MINTAPIError as exc:
        print(exc.message, exc.code, exc.request_id)
```

SDK-created apps install the handlers automatically. For a custom host, use the shared `mint_sdk.api_errors.register_api_error_handlers(app)` integration or implement the same contract explicitly.

Verified against [v1.2.0 error handlers](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/api_errors.py), [exception mapping](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/exceptions.py), and [client exceptions](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/client/_exceptions.py).
