# Route permissions

Authenticate the caller, check the action, and resolve the resource on the backend. MINT 1.2's typed dependencies work for installed, isolated, and standalone SDK hosts without capturing a context before startup.

## Authentication and resource visibility

```python
from fastapi import HTTPException
from mint_sdk import (
    AnalysisPlugin, CurrentExperiment, CurrentPluginActor,
    PluginCapabilities, endpoint, mint_plugin,
)

@mint_plugin(
    analysis_type="qc", routes_prefix="/peak-qc",
    capabilities=PluginCapabilities(requires_auth=True),
)
class PeakQcPlugin(AnalysisPlugin):
    @endpoint.get("/me")
    async def me(self, actor: CurrentPluginActor) -> dict[str, object]:
        return {"user_id": actor.user_id, "plugin_role": actor.plugin_role}

    @endpoint.post("/experiments/{experiment_id}/review")
    async def review(
        self, experiment: CurrentExperiment, actor: CurrentPluginActor,
    ) -> dict[str, int]:
        if not actor.is_platform_admin and actor.plugin_role not in {"reviewer", "owner"}:
            raise HTTPException(403, "A reviewer or owner role is required")
        await self.save_analysis_artifact(
            experiment.id,
            {"reviewed_by": actor.user_id},
            artifact_key="review",
        )
        return {"experiment_id": experiment.id}
```

`requires_auth` is inherited by ordinary routes; a route can explicitly use `auth=True` or `auth=False`. `CurrentPluginActor` provides `user_id` (string), `username`, platform `role`, `permissions`, and `plugin_role`. Use `actor.has_permission("experiments.edit")` for a platform permission; use the separate plugin role for plugin-specific actions.

`CurrentExperiment` checks `experiments.view`, visibility, and the effective experiment-type allowlist. It returns 404 for an inaccessible or missing experiment and 503 without platform integration. Knowing an experiment ID or holding a plugin role does not bypass this check.

## Experiment-scoped endpoint groups

For several actions under the same resource, put them in a mixin:

```python
from mint_sdk import AnalysisPlugin, CurrentExperiment, endpoint

@endpoint.group("/runs", scope="experiment", tags=["runs"])
class RunEndpoints:
    @endpoint.get("/latest")
    async def latest(self, experiment: CurrentExperiment) -> dict[str, object]:
        result = await self.load_analysis_artifact(experiment.id, artifact_key="summary")
        return {"result": result.result if result else None}

class PeakQcPlugin(RunEndpoints, AnalysisPlugin):
    pass
```

The group mounts below `/experiments/{experiment_id}/runs`, under the plugin API prefix. The SDK also supplies the common experiment GET for experiment-scoped groups.

## Native FastAPI router role guards

Use native routers for WebSockets or other FastAPI-specific needs. Resolve the context when the dependency runs, because standalone and isolated hosts may create routers before lifespan initialization:

```python
from fastapi import APIRouter, Depends, HTTPException
from mint_sdk import (
    AnalysisPlugin, CurrentPluginActor, CurrentPluginRuntime,
)

async def require_owner(
    runtime: CurrentPluginRuntime, actor: CurrentPluginActor,
) -> None:
    if runtime.platform is None:
        raise HTTPException(503, "This action requires platform integration")
    if not actor.is_platform_admin and actor.plugin_role != "owner":
        raise HTTPException(403, "Plugin owner role required")

router = APIRouter()

@router.get("/owner/status", dependencies=[Depends(require_owner)])
async def owner_status() -> dict[str, str]:
    return {"status": "ready"}

class MyPlugin(AnalysisPlugin):
    def get_routers(self) -> list[tuple[APIRouter, str]]:
        return [(router, "")]
```

The SDK host binds `CurrentPluginRuntime` for mounted plugin routers. Native routers inherit plugin authentication; use `PluginRouterMount(router, auth=False)` only for routes with a deliberate public or separate-token contract.

`context.require_plugin_role("owner", "admin")` remains supported and returns a `Depends` guard with a platform-admin bypass. It is suitable when a custom host guarantees the context is already initialized at router construction. The typed request dependency above also works when router construction happens earlier.

## Plugin writes versus actor permissions

These are separate checks. A plugin with `experiment_crud=True` may call the CRUD protocol, but a user-facing metadata route should still check the corresponding `experiments.create`, `experiments.edit`, or `experiments.delete` permission. The scoped repository adds visibility, type restrictions, plugin ownership, and reader declarations. It is not a replacement for every application-specific authorization rule.

For plugin-owned tables, filter queries by the authorized experiment or owner. A schema-scoped SQL session isolates plugin tables; it does not add per-user row authorization automatically.

## Standalone and background work

Standalone requests receive a deliberate `standalone` actor, not a platform login. Require `runtime.platform` or `CurrentExperiment` for actions that must not run locally. Keep local demonstration behavior explicit.

Do not cache an actor or role on `self`; concurrent users share the instance. Managed jobs/finalizers have SDK-owned actor propagation. For custom trusted host-side work, `async with context.actor_scope(actor)` binds an already resolved actor for the operation. Never construct a privileged actor from request-body fields.

## Verification and source

Test an anonymous caller, an authenticated allowed caller, a caller with the right plugin role but no experiment visibility, an incompatible experiment type, and standalone mode. `RecordingContext` helps exercise persistence but does not replace platform RBAC integration tests.

Verified against [v1.2.1 dependencies](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/runtime_dependencies.py), [actors](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/actors.py), and [scoped repository](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/repositories/scoped_experiment_repository.py).

- [Plugin roles tutorial](/sdk/tutorials/plugin-roles)
- [Platform permissions](/reference/permissions)
- [Error handling](/sdk/recipes/error-handling)
