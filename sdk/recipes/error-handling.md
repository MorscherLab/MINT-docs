# Error handling

Raise a typed SDK exception for a known application failure. Use `HTTPException` for an explicit transport status. An unexpected exception stays a 500 error. Standalone and integrated routes send the same error envelope.

## Validate and report business failures

```python
from pydantic import BaseModel, Field
from mint_sdk import CurrentExperiment, Plugin, ValidationException, endpoint

class CompareRequest(BaseModel):
    reference_sample: str = Field(min_length=1)

class MyPlugin(Plugin):
    @endpoint.post("/experiments/{experiment_id}/compare")
    async def compare(
        self, body: CompareRequest, experiment: CurrentExperiment,
    ) -> dict[str, str]:
        design = await self.design.get(experiment.id)
        names = {sample["name"] for sample in design.data.get("samples", [])} if design else set()
        if body.reference_sample not in names:
            raise ValidationException(
                "Choose a reference sample from this experiment",
                field="reference_sample",
            )
        return {"reference_sample": body.reference_sample}
```

Pydantic refuses an empty field with 422 before the handler runs. The business-rule failure above becomes 400 with `code="VALIDATION_ERROR"`. `CurrentExperiment` does the permission and visibility checks.

## Choose the exception

| Situation | Raise |
|-----------|-------|
| Invalid business input | `ValidationException` |
| Forbidden action | `PermissionException` |
| Missing resource | `NotFoundException` |
| Duplicate or stale edit | `ConflictException` |
| Design write over a newer experiment version (`expected_version`) | `VersionConflictException` (`mint_sdk.exceptions`) |
| Blocking lifecycle veto | `EventVetoException` |
| Plugin misconfiguration or storage failure | `ConfigurationException` / `RepositoryException` |
| Platform integration unavailable (standalone) | `UnavailableException` |

For the HTTP status of each exception and the constructors, see [Exceptions](/sdk/api/exceptions). The SDK already raises its own subclasses for ownership conflicts and unsupported experiment types. A platform-only namespace raises `UnavailableException` in standalone mode by itself.

## Handle concurrent edits without losing data

- Settings: keep `settings_revision` from the snapshot that you changed. For a shallow patch, use `update_settings({...})`; the SDK retries it against the latest state.
- File artifacts and design data: pass `expect=` or `expected_version=`; see [Replace an existing file safely](/sdk/recipes/writing-results#replace-an-existing-file-safely).
- A 409 or 412 means that the candidate is stale. Fetch the new state and let the UI reconcile the change. Do not send the same full replacement again without its revision.
- A JSON artifact batch is atomic. Do not turn its failure into a partial-success response.
- Plugin-owned SQL tables: enforce uniqueness with a database constraint. A preflight `SELECT` cannot stop concurrent inserts. Catch the integrity error, roll back, and turn only the known duplicate constraint into `ConflictException`.

## Preserve the traceback and keep secrets out of responses

```python
from mint_sdk.exceptions import RepositoryException
from sqlalchemy.exc import DatabaseError

try:
    await session.commit()
except DatabaseError as exc:
    await session.rollback()
    raise RepositoryException(
        "Could not save the panel", operation="save", entity="panel",
    ) from exc
```

`raise ... from exc` keeps the server traceback. `message`, `details` and `to_dict()` can reach the client. Log internal diagnostics separately. Keep connection strings, raw SQL errors, credentials and full request bodies out of public errors.

## Expected upstream failures

Turn a known timeout into a status that the user can act on:

```python
import httpx
from fastapi import HTTPException

try:
    response = await upstream.get("/status")
    response.raise_for_status()
except httpx.TimeoutException as exc:
    raise HTTPException(503, "Instrument service timed out; retry shortly") from exc
```

- Retry only an operation that is safe to repeat. A write that timed out can already be committed.
- Before you repeat an artifact or external write, reload it by its stable identity.
- Do not turn other failures into 404. Do not catch cancellation with a broad `except`.

## Failed jobs and host logs

A failed `@job` fails in its job state. Its submit request can still have succeeded.

- Read the final `error` and the job ID from the job client or the jobs tray. A handler failure reads `<ExceptionType>: <message>`.
- Service jobs keep the original chained cause, when there is one, and log the exception.
- Process workers send the formatted traceback to the host, which logs it through the platform handlers. Search **Admin -> System -> Logs** or the service logs for the job ID.
- Authorized readers of the job see its error. Keep credentials and sensitive raw inputs out of raised messages.

After SIGKILL, the host waits up to 30 seconds for a process worker to exit. This keeps the result of a large finished job during slow kernel cleanup. It does not extend the run time of the job or hide a handler exception. If `Job worker could not be stopped` stays, examine host resource pressure and the logs before you run a job that writes again.

Source: [v@MINT_VERSION@ job manager](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/job_manager.py).

## Reading errors on the client

The fields of the error envelope are in [Error codes](/reference/error-codes#the-error-envelope). Show `message` to the user. Branch on `code`, never on the English message text. Put `request_id` in support reports.

```python
from mint_sdk.client import APIError, MINTClient, NotFoundError

with MINTClient() as client:
    try:
        experiment = client.experiments.get(42)
    except NotFoundError:
        print("Experiment is unavailable")
    except APIError as exc:
        print(exc.message, exc.code, exc.request_id)
```

SDK-created apps install the error handlers. For a custom host, call `mint_sdk.api_errors.register_api_error_handlers(app)`, or implement the same contract.

Verified against [v@MINT_VERSION@ error handlers](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/api_errors.py), [exception mapping](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/exceptions.py), and [client exceptions](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/client/_exceptions.py).
