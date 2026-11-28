# Route permissions

Authenticate the caller, check the action and resolve the resource on the backend. The typed dependencies work in installed, isolated and standalone hosts, and need no context before startup.

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

- Routes inherit `Metadata.auth`. A route can set `auth=True` or `auth=False`. For what `auth=False` still checks, see [Platform authentication gate](#platform-authentication-gate).
- `CurrentActor` gives `user_id` (string), `username`, platform `role`, `role_id` and `permissions`.
- Use `actor.has_permission("experiments.edit")` for a platform permission, and `actor.can("configure")` for an access level.
- [`CurrentExperiment`](/sdk/concepts/platform-context#request-scoped-access) checks `experiments.view`, visibility and the experiment type. A known experiment ID or a high `access` level does not bypass this check.

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

- The platform checks `use` (`plugins.use` and role visibility) before the request reaches the plugin.
- The SDK checks `configure` and `admin` with `Actor.can(access)` on endpoints, at job admission and on plugin MCP calls.
- A platform administrator meets every level. Standalone mode passes every level.
- `Page(access=...)` hides a page from viewers below that level.
- `Metadata.settings_access` sets the level that may change the settings: `"admin"` (default) or `"configure"`.
- An endpoint with `auth=False` accepts only `access="use"`.

The Member system role does not have `plugins.configure`. For how an administrator grants it, see [Plugin access levels](/admin/users-roles#plugin-access-levels).

## Platform authentication gate

With platform authentication on, the platform requires a Bearer credential on every plugin request: a session JWT, a personal access token or a service token.

- The gate applies to proxied runtimes and to in-process plugin routes. It runs before the plugin sees the request.
- The gate does not read the session cookie.
- A plugin cannot declare public paths.

| Response | Cause |
|----------|-------|
| 401 `auth.required` | No Bearer credential, or one that does not resolve (invalid, expired or revoked token, inactive account, unresolved role) |
| 403 `auth.read_only_token` | A read-only personal access token sends a write |
| 403 `plugin.permission_denied` | The user does not have `plugins.use` |
| 403 `plugin.not_visible` | The user's role cannot see the plugin |
| 403 `plugin.service_token_scope` | The service token is bound to another plugin, the plugin no longer declares `"instrument_status"` in `features`, or no bound instrument is still in the plugin's grant |
| 503 `auth.unavailable` | The platform cannot check the credential |

- Plugin frontends must call the plugin through the SDK client, which sends the Bearer credential. A raw `fetch` without a Bearer gets 401.
- Scripts use a personal access token.
- Daemons use a platform service token. A plugin API key of its own does not pass the gate.

`auth=False` removes only the plugin's own user check, not the platform gate. Use it for routes where the plugin authorizes the caller itself, such as routes that a service token calls; see [Report instrument status](/sdk/recipes/instrument-status).

With platform authentication off, the gate lets every request through but still checks the scope of a service token. The dev proxy (`config.dev.toml`) does not apply the 401, 503, `plugins.use` and role checks.

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

The group mounts below `/experiments/{experiment_id}/runs`, under the plugin API prefix. The SDK also adds the common experiment GET for experiment-scoped groups.

## Native FastAPI router guards

Use native routers for WebSockets or other FastAPI-specific needs. A native route has no `access=` argument. Use the dependency `require_access` from `mint_sdk.runtime_dependencies`:

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

- `require_access(access)` refuses an actor below `access` with 403. Standalone mode passes.
- Native routers inherit plugin authentication. Use `RouterMount(router, auth=False)` (from `mint_sdk.endpoint`) only for routes where the plugin authorizes the caller itself, such as a service-token contract.
- A route with `auth=False` takes `CurrentServiceCaller`, not `CurrentActor`.

## Plugin writes versus actor permissions

These are separate checks. A plugin with `"experiments"` in `writes` may call the CRUD namespace. A user-facing metadata route must still check `experiments.create`, `experiments.edit` or `experiments.delete`. The scoped namespaces add visibility, type restrictions, plugin ownership and reader declarations. They do not replace the authorization rules of your application.

Plugin-owned tables have no per-user row checks; see [Querying plugin data](/sdk/recipes/querying-plugin-data#read-within-a-scoped-session).

## Standalone and background work

- Standalone requests get the `standalone` actor (`Actor.standalone()`), not a platform login.
- For actions that must not run locally, use `CurrentExperiment` or check `self.is_standalone`. Make local demonstration behavior explicit.
- Do not keep an actor or role on `self`. Concurrent users share the instance.
- The SDK binds the actor of each request, job and tool call, so a finalizer and a tool act as the caller.
- Never build a privileged actor from request-body fields.

## Verification and source

Test these callers: anonymous, authenticated and allowed, below the required `access` level, without experiment visibility, with an incompatible experiment type, and standalone. `RecordingContext` exercises persistence. It does not replace platform RBAC integration tests.

Verified against [v@MINT_VERSION@ dependencies](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/runtime_dependencies.py), [actors](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/actors.py) and [scoped repository](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/scoped_experiment_repository.py). For a step-by-step build, see the [Access levels tutorial](/sdk/tutorials/access-levels). For all platform permissions, see [Permissions](/reference/permissions).
