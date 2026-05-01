# REST client reference

`MINTClient` is the typed Python client for the platform's REST API. Use it from external scripts, CI jobs, or notebooks; from inside a plugin process, prefer `PlatformContext` accessors which avoid the network round-trip.

Source: [`mint_sdk/client/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/client).

## Construction

Three ways:

```python
from mint_sdk import MINTClient

# 1. From the per-user CLI config (~/.config/mint/cli.json)
async with MINTClient.from_env() as client:
    ...

# 2. Explicit URL + token
async with MINTClient(url="https://mint.example.org",
                      token="eyJhbGc...") as client:
    ...

# 3. Profile name (for multiple platforms)
async with MINTClient.from_env(profile="staging") as client:
    ...
```

The async context manager owns the underlying `httpx.AsyncClient`. Always use `async with` so the connection pool is closed cleanly.

## Resource clients

`MINTClient` exposes typed sub-clients per resource:

| Property | Type | Purpose |
|----------|------|---------|
| `client.experiments` | `ExperimentsClient` | List, get, create, update, delete experiments |
| `client.projects` | `ProjectsClient` | List, get, create, archive projects |
| `client.users` | `UsersClient` | List, get users (admin-only) |
| `client.plugins` | `PluginsClient` | List installed plugins; install / uninstall (admin) |
| `client.artifacts` | `ArtifactsClient` | Upload / download experiment artifacts |
| `client.health` | function | Hit `/api/health` |

Source for the resource clients: [`mint_sdk/client/resources/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/client/resources).

## `ExperimentsClient`

| Method | Returns |
|--------|---------|
| `await client.experiments.list(*, status=None, project=None, experiment_type=None, owner=None, skip=0, limit=100)` | `tuple[list[Experiment], int]` |
| `await client.experiments.get(experiment_id_or_code)` | `Experiment \| None` — accepts either numeric ID or `EXP-001` style code |
| `await client.experiments.create(name, experiment_type, *, project=None, notes=None, ...)` | `Experiment` |
| `await client.experiments.update(experiment_id, *, name=None, status=None, ...)` | `Experiment` |
| `await client.experiments.delete(experiment_id)` | `bool` |
| `await client.experiments.get_design(experiment_id)` | `DesignData \| None` |
| `await client.experiments.get_analysis_results(experiment_id)` | `list[PluginAnalysisResult]` |

## `ProjectsClient`

| Method | Returns |
|--------|---------|
| `await client.projects.list(*, archived=False, skip=0, limit=100)` | `tuple[list[Project], int]` |
| `await client.projects.get(project_id)` | `Project \| None` |
| `await client.projects.create(name, description, *, members=None)` | `Project` |
| `await client.projects.update(project_id, *, name=None, description=None)` | `Project` |
| `await client.projects.archive(project_id)` | `bool` |
| `await client.projects.delete(project_id)` | `bool` |
| `await client.projects.add_member(project_id, user_id, role)` | `ProjectMember` |
| `await client.projects.remove_member(project_id, user_id)` | `bool` |

## `UsersClient`

Admin-only.

| Method | Returns |
|--------|---------|
| `await client.users.list(*, skip=0, limit=100)` | `list[User]` |
| `await client.users.get(user_id)` | `User \| None` |
| `await client.users.get_by_username(username)` | `User \| None` |

## `PluginsClient`

Admin-only for write operations.

| Method | Returns |
|--------|---------|
| `await client.plugins.list()` | `list[InstalledPlugin]` |
| `await client.plugins.get(plugin_slug)` | `InstalledPlugin \| None` |
| `await client.plugins.install(source, *, version=None)` | `InstalledPlugin` — `source` is a wheel URL, PyPI name, or local `.mint` path |
| `await client.plugins.uninstall(plugin_slug, *, mode="keep")` | `bool` — `mode` is `"keep"`, `"archive"`, or `"purge"` |
| `await client.plugins.upgrade(plugin_slug, *, version=None)` | `InstalledPlugin` |

## `ArtifactsClient`

| Method | Returns |
|--------|---------|
| `await client.artifacts.list(experiment_id)` | `list[Artifact]` |
| `await client.artifacts.get(artifact_id)` | `Artifact \| None` |
| `await client.artifacts.upload(experiment_id, *, filename, content_type, data)` | `Artifact` |
| `await client.artifacts.download(artifact_id)` | `bytes` |
| `client.artifacts.stream(artifact_id)` | async generator yielding `bytes` chunks |
| `await client.artifacts.delete(artifact_id)` | `bool` |

## Errors

The client raises `mint_sdk.exceptions` subclasses on non-2xx responses, parsed from the platform's structured error body:

```python
from mint_sdk import MINTClient, NotFoundException

async with MINTClient.from_env() as client:
    try:
        exp = await client.experiments.get(99999)
    except NotFoundException as e:
        print(f"not found: {e.message}")
```

Network / timeout errors raise `httpx` exceptions — wrap in your own retry logic if needed.

## Authentication and tokens

`MINTClient.from_env()` reads `~/.config/mint/cli.json`, populated by `mint auth login`. The file is JSON:

```json
{
  "default": {
    "url": "https://mint.morscherlab.org",
    "token": "eyJhbGc...",
    "expires_at": "2026-05-02T10:00:00Z"
  },
  "staging": {
    "url": "https://staging.mint.morscherlab.org",
    "token": "...",
    "expires_at": "..."
  }
}
```

Tokens are short-lived (default 24h). Long-running scripts should refresh:

```python
async with MINTClient.from_env() as client:
    await client.refresh_token_if_expiring(within_seconds=3600)
    ...
```

For CI/CD, prefer service-account tokens with longer TTL — generate from **Admin → Users → Service accounts** in the platform UI.

## Pagination

The `list` methods return `(items, total_count)` tuples. To iterate all:

```python
async with MINTClient.from_env() as client:
    out = []
    skip = 0
    while True:
        page, total = await client.experiments.list(skip=skip, limit=200)
        out.extend(page)
        skip += len(page)
        if skip >= total or not page:
            break
```

For very large result sets, prefer querying only what you need — full pulls hit memory limits and lock the platform's connection pool.

## Notes

- `MINTClient` instances are not thread-safe. Use one per async task.
- Inside a plugin, prefer `PlatformContext` accessors over `MINTClient` — they share the platform's connection pool, avoid the network hop in shared mode, and short-circuit auth checks for the plugin's user.
- The client's pickled-state (`from_env` config files) is the user's responsibility to secure (`chmod 600`); the CLI sets that automatically.

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — the in-process alternative
- [CLI reference → mint auth](/sdk/api/cli-reference#mint-auth) — token management
- [Recipes → Managing artifacts](/sdk/recipes/managing-artifacts) — `ArtifactsClient` patterns
