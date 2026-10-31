# Route permissions

Authenticate the caller, check the action, and resolve the resource on the backend. The typed dependencies work for installed, isolated, and standalone SDK hosts without capturing a context before startup.

## Authentication and resource visibility

```python
from mint_sdk import CurrentActor, CurrentExperiment, Metadata, Plugin, endpoint, plugin

class PeakQcMeta(Metadata):
    domain = "qc"
    prefix = "/peak-qc"
    # auth = True is the default

@plugin(PeakQcMeta)
class PeakQcPlugin(Plugin):
    @endpoint.get("/me")
    async def me(self, actor: CurrentActor) -> dict[str, object]:
        return {"user_id": actor.user_id, "role": actor.role, "can_configure": actor.can("configure")}

    @endpoint.post("/experiments/{experiment_id}/review", access="configure")
    async def review(
        self, experiment: CurrentExperiment, actor: CurrentActor,
    ) -> dict[str, int]:
        await self.artifacts.save(experiment.id, {"reviewed_by": actor.user_id}, "review")
        return {"experiment_id": experiment.id}
```

`Metadata.auth` is inherited by ordinary routes; a route can explicitly use `auth=True` or `auth=False`. See [Platform authentication gate](#platform-authentication-gate) for what `auth=False` still means. `CurrentActor` provides `user_id` (string), `username`, platform `role`, `role_id` and `permissions`. Use `actor.has_permission("experiments.edit")` for a platform permission, and `actor.can("configure")` for an access level.

`CurrentExperiment` checks `experiments.view`, visibility, and the effective experiment-type allowlist. It returns 403 when the actor lacks `experiments.view`, 404 for an inaccessible or missing experiment, and 503 without platform integration. Knowing an experiment ID or holding a high `access` level does not bypass this check.

## Access levels

Plugin roles do not exist. Declare who may call an endpoint, job, MCP tool or page with `access`:

| Level | Who passes |
|-------|-----------|
| `"use"` (default) | A role with `plugins.use` that can see the plugin |
| `"configure"` | A role that also has `plugins.configure` |
| `"admin"` | A platform administrator |

```python
@endpoint.put("/thresholds", access="configure")
async def save_thresholds(self, body: Thresholds) -> Thresholds: ...

class Reindex(Job):
    title = "Rebuild the index"
    access = "admin"
```

The platform checks `use` (including `plugins.use` and role visibility) before the request reaches the plugin. The SDK checks `configure` and `admin` with `Actor.can(access)` on endpoints, at job admission and on plugin MCP calls. A platform administrator meets every level. `Page(access=...)` hides a page from viewers below that level, and `Metadata.settings_access` sets the level that changes the settings (`"admin"` by default, or `"configure"`). Standalone mode passes every level. An endpoint with `auth=False` accepts only `access="use"`.

The Member system role does not have `plugins.configure`. An administrator gives it to a custom role for each person who must configure plugins.

## Platform authentication gate

With platform authentication enabled, the platform requires a Bearer credential on every plugin request. A session JWT, a personal access token or a service token is accepted. The gate applies to proxied runtimes and to in-process plugin routes. It runs before the plugin sees the request. The session cookie is not read. A plugin cannot declare public paths.

| Response | Cause |
|----------|-------|
| 401 `auth.required` | No Bearer credential, or one that does not resolve (invalid, expired or revoked token, inactive account, unresolved role) |
| 403 `auth.read_only_token` | A read-only personal access token sends a write |
| 403 `plugin.permission_denied` | The user does not have `plugins.use` |
| 403 `plugin.not_visible` | The user's role cannot see the plugin |
| 403 `plugin.service_token_scope` | The service token is bound to another plugin, the plugin no longer declares `"instrument_status"` in `features`, or no bound instrument is still in the plugin's grant |
| 503 `auth.unavailable` | The platform cannot check the credential |

Plugin frontends must call the plugin through the SDK client, which sends the Bearer credential. A raw `fetch` without a Bearer gets 401. Scripts use a personal access token. A plugin that keeps its own API key for daemons stops working: use a platform service token.

`auth=False` removes only the plugin's own user check. It does not remove the platform gate. Use it for routes where the plugin does its own authorization, for example routes that a service token calls. See [Report instrument status](/sdk/recipes/instrument-status). With platform authentication disabled, the gate lets every request through, but it still checks the scope of a service token. The dev proxy (`config.dev.toml`) does not apply the 401, 503, `plugins.use` and role checks.

## Experiment-scoped endpoint groups

For several actions under the same resource, put them in a mixin:

```python
from mint_sdk import CurrentExperiment, Plugin, endpoint

@endpoint.group("/runs", scope="experiment", tags=["runs"])
class RunEndpoints:
    @endpoint.get("/latest")
    async def latest(self, experiment: CurrentExperiment) -> dict[str, object]:
        result = await self.artifacts.get(experiment.id, "summary")
        return {"result": result.result if result else None}

class PeakQcPlugin(RunEndpoints, Plugin):
    pass
```

The group mounts below `/experiments/{experiment_id}/runs`, under the plugin API prefix. The SDK also supplies the common experiment GET for experiment-scoped groups.

## Native FastAPI router guards

Use native routers for WebSockets or other FastAPI-specific needs. A native route has no `access=` argument, so use the dependency `require_access` (from `mint_sdk.runtime_dependencies`):

```python
from fastapi import APIRouter, Depends
from mint_sdk import Plugin
from mint_sdk.runtime_dependencies import require_access

router = APIRouter()

@router.get("/owner/status", dependencies=[Depends(require_access("configure"))])
async def owner_status() -> dict[str, str]:
    return {"status": "ready"}

class MyPlugin(Plugin):
    def routers(self) -> list[tuple[APIRouter, str]]:
        return [(router, "")]
```

`require_access(access)` refuses an actor below `access` with 403; standalone mode passes. Native routers inherit plugin authentication; use `RouterMount(router, auth=False)` (from `mint_sdk.endpoint`) only for routes where the plugin authorizes the caller itself, such as a service-token contract. A route with `auth=False` takes `CurrentServiceCaller`, not `CurrentActor`.

## Plugin writes versus actor permissions

These are separate checks. A plugin with `"experiments"` in `writes` may call the CRUD namespace, but a user-facing metadata route should still check the corresponding `experiments.create`, `experiments.edit`, or `experiments.delete` permission. The scoped namespaces add visibility, type restrictions, plugin ownership, and reader declarations. They are not a replacement for every application-specific authorization rule.

For plugin-owned tables, filter queries by the authorized experiment or owner. A schema-scoped SQL session isolates plugin tables; it does not add per-user row authorization automatically.

## Standalone and background work

Standalone requests receive a deliberate `standalone` actor (`Actor.standalone()`), not a platform login. Use `CurrentExperiment`, or check `self.is_standalone`, for actions that must not run locally. Keep local demonstration behavior explicit.

Do not cache an actor or role on `self`; concurrent users share the instance. The SDK binds the actor of each request, job and tool call, so a finalizer and a tool act as the caller. Never construct a privileged actor from request-body fields.

## Verification and source

Test an anonymous caller, an authenticated allowed caller, a caller below the required `access` level, a caller without experiment visibility, an incompatible experiment type, and standalone mode. `RecordingContext` helps exercise persistence but does not replace platform RBAC integration tests.

Verified against [v@MINT_VERSION@ dependencies](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/runtime_dependencies.py), [actors](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/actors.py), and [scoped repository](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/scoped_experiment_repository.py).

- [Access levels tutorial](/sdk/tutorials/access-levels)
- [Platform permissions](/reference/permissions)
- [Error handling](/sdk/recipes/error-handling)
