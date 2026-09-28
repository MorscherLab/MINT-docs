# REST client reference

`MINTClient` is the synchronous Python client for the MINT platform REST API. Use it from external scripts, CI jobs, or notebooks; from inside a plugin process, prefer `PlatformContext` accessors which avoid the network round-trip.

Source: [`mint_sdk/client/client.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/client/client.py).

## Construction

```python
from mint_sdk import MINTClient

# 1. Explicit URL + token
with MINTClient(base_url="https://mint.example.org", token="eyJ...") as client:
    ...

# 2. Username + password — auto-logs in during construction
with MINTClient(base_url="https://mint.example.org",
                 username="alice", password="…") as client:
    me = client.whoami()

# 3. Env-aware (no arguments) — reads MINT_URL and MINT_TOKEN, falling back
#    to credentials stored by `mint auth login` at ~/.config/mint/credentials.json
with MINTClient() as client:
    ...
```

`MINTClient` is **synchronous** — uses plain `with`, not `async with`. The constructor signature:

```python
def __init__(
    self,
    base_url: str | None = None,
    token: str | None = None,
    username: str | None = None,
    password: str | None = None,
    timeout: float | None = None,
) -> None: ...
```

When `base_url` is `None`, the resolution order is:

1. `MINT_URL` env var
2. Stored credentials at `~/.config/mint/credentials.json` (written by `mint auth login`; honors `XDG_CONFIG_HOME`)
3. Otherwise raise `MINTAPIError`

When `token` is `None`, the same fallback chain runs for the JWT (env: `MINT_TOKEN`).

When `timeout=None`, the client uses the shared platform transport policy: `MINT_PLATFORM_TIMEOUT` / `MINT_PLATFORM_CONNECT_TIMEOUT`, defaulting to 30 s / 10 s. An explicit timeout overrides that policy for this client.

## Convenience auth methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `client.login(username, password)` | `dict` | Authenticate; store JWT in the client |
| `client.logout()` | `None` | Clear stored credentials |
| `client.whoami()` | `dict` | Return current user info |
| `client.health()` | `dict` | Platform health payload from `/health`; no authentication required |
| `client.close()` | `None` | Close the HTTP connection; the context manager calls it |

`login`, `logout`, and `whoami` are thin wrappers over `client.auth`.

## Resource clients

`MINTClient` exposes typed sub-clients per resource. Each is a `@cached_property` that lazy-imports its module on first access:

| Property | Type | Purpose |
|----------|------|---------|
| `client.auth` | `AuthAPI` | Login / logout / verify / refresh / whoami / public auth config |
| `client.experiments` | `ExperimentsAPI` | Experiment CRUD, design data, compatibility analysis results, experiment types |
| `client.projects` | `ProjectsAPI` | List, get, create, update, delete, experiments, members |
| `client.plugins` | `PluginsAPI` | List, install, upload, upgrade, and uninstall plugins; runtime registration; plugin config; package indexes; environment snapshots |
| `client.admin` | `AdminAPI` | Admin status, system snapshot, config, logs, restart; users, roles, plugin-role assignments |
| `client.updates` | `UpdatesAPI` | Platform/plugin update checks, GitHub release installs |
| `client.objects` | `ObjectsAPI` | Typed object upload, download, list, existence and deletion |

Source for resource methods: [`mint_sdk/client/resources/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/client/resources).

### Resource methods

| Namespace | Methods |
|-----------|---------|
| `client.auth` | `login(username, password)`, `logout()`, `verify()`, `refresh()`, `whoami()`, `config()` |
| `client.projects` | `list(*, status=None, search=None, my_projects=False, skip=0, limit=100)`, `get(id)`, `create(...)`, `update(id, **fields)`, `delete(id)`, `experiments(id, *, skip=0, limit=100)`, `members(id)` |
| `client.plugins` | `list()`, `install(source, *, force=False)`, `upload(path, *, force=False)`, `upgrade(package_name, *, force=False)`, `uninstall(package_name)`, `register_external(name, target, ...)`, `register_docker(name, image, ...)`, `get_config(plugin_name)`, `set_config(plugin_name, config, *, expected_revision)`, `update_config(plugin_name, config)`, `get_extra_index_urls()`, `set_extra_index_urls(urls)`, `snapshots()`, `snapshot(snapshot_id)` |
| `client.admin` | `status()`, `system()`, `config()`, `restart()`, `logging_config()`, `logs(*, limit=100, offset=0, level=None, search=None, plugin=None)`; users: `list_users()`, `get_user(id)`, `create_user(*, username, password, ...)`, `update_user(id, **fields)`, `delete_user(id)`, `activate_user(id)`, `deactivate_user(id)`; roles: `list_roles()`, `list_permissions()`, `create_role(*, name, slug, permissions, ...)`, `update_role(id, **fields)`, `delete_role(id)`; plugin roles: `list_plugin_roles(plugin_id)`, `set_plugin_role(plugin_id, user_id, role)`, `remove_plugin_role(plugin_id, user_id)`, `list_user_plugin_roles(user_id)` |
| `client.updates` | `check()`, `config()`, `sources()`, `update_plugin(package_name, *, force=False)`, `update_platform()`, `list_releases(github_url, *, asset_pattern="*.mint")`, `install_github(github_url, *, tag=None, asset_pattern="*.mint", force=False)` |

`set_config()` sends the revision as `If-Match`; a stale revision fails with `ConflictError`. Read it from `get_config()` first.

::: warning Not exposed
Earlier docs claimed `client.users` and `client.artifacts` — those don't exist. First-class artifact readers live at `client.experiments.artifacts`, and raw object operations at `client.objects`. There is no `MINTClient.from_env()` factory; use the env-aware constructor (option 3 above).
:::

## Experiments

`client.experiments.list()` unwraps the platform response and returns a plain `list[dict]`:

```python
with MINTClient() as client:
    experiments = client.experiments.list(
        status="completed",
        experiment_type="lcms_batch",
        project_id=12,
        search="TCA",
        mine=True,
        created_after="2026-05-01",
        created_before="2026-06-01",
        skip=0,
        limit=100,
        sort_by="created_at",
        sort_order="desc",
    )
```

CRUD methods mirror the REST API:

| Method | Purpose |
|--------|---------|
| `list(...)` | Filter visible experiments by status, type, project, owner, date window, or search text |
| `get(experiment_id)` | Fetch one experiment detail record |
| `create(name=..., experiment_type="custom", project_id=None, notes=None, tags=None)` | Create an experiment; MINT assigns the type-scoped code |
| `update(experiment_id, **fields)` | Patch metadata such as name, status, type, project, notes, tags, or dates |
| `delete(experiment_id)` | Delete the experiment row |
| `list_types()` | List enabled experiment types |
| `next_seq(experiment_type)` | Preview the next code sequence for a type |

Deletion is immediate in the current backend. Take a normal database backup before running bulk delete scripts.

## Experiment data

Design data is one JSON payload per experiment. Compatibility analysis results are still available as per-plugin JSON payloads; user-facing result review in current MINT is centered on first-class analysis artifacts.

```python
with MINTClient() as client:
    design = client.experiments.design_data.get(42)
    client.experiments.design_data.save(
        42,
        plugin_id="panel-designer",
        data={"wells": []},
        schema_version="1.0",
    )

    client.experiments.analysis.save(
        42,
        plugin_id="dose-response",
        result={"ic50": 0.42},
    )
```

| Namespace | Methods |
|-----------|---------|
| `client.experiments.design_data` | `get`, `save`, `delete`, `tree`, `summary`, `export` |
| `client.experiments.analysis` | `list`, `get`, `save`, `delete` |

Backward-compatible flat methods still exist: `get_data`, `save_data`, `delete_data`, `get_data_tree`, `get_data_summary`, `export_data`, `get_results`, `get_result`, `save_result`, and `delete_result`.

## First-class artifact downloads

```python
from mint_sdk import MINTClient

with MINTClient() as client:
    artifacts = client.experiments.artifacts.list(42)
    report = client.experiments.artifacts.resolve(
        42, plugin_id="peak-qc", artifact_key="report",
    )
    client.experiments.artifacts.download_file(
        42, "report.csv", plugin_id="peak-qc", artifact_key="report",
    )
```

| Artifact method | Purpose |
|-----------------|---------|
| `list(experiment_id, include_archived=False)` | Metadata-only records |
| `get(experiment_id, artifact_id)` | Detail by numeric artifact ID |
| `resolve(experiment_id, plugin_id=..., artifact_key=..., ...)` | Resolve by stable producer/key identity |
| `get_file_bytes(..., max_bytes=..., ...)` | Bounded buffered file read |
| `download_file(experiment_id, path, plugin_id=..., artifact_key=..., ...)` | Streaming download with validated size/checksum and atomic destination replacement |

There is no artifact write method in this client namespace; publish artifacts inside the producing plugin with the [persistence helpers](/sdk/recipes/writing-results).

Raw objects use `client.objects.list/put_bytes/put_file/get_bytes/get_ref/download_file/exists/delete`, with an experiment ID and explicit `plugin_id`. These are public REST operations using the authenticated user's platform permissions; they do not impersonate an installed plugin. Uploading an object alone does not create a visible analysis artifact.

## Errors

The client raises `MINTAPIError` (and `mint_sdk.exceptions` subclasses where applicable) on non-2xx responses, parsed from the platform's structured error body:

```python
from mint_sdk import MINTClient
from mint_sdk.client import MINTAPIError

with MINTClient() as client:
    try:
        exp = client.experiments.get(99999)
    except MINTAPIError as e:
        print(f"failed: {e}")
```

Connection/timeout failures are wrapped as `MINTConnectionError`. Non-2xx responses have typed subclasses including `AuthenticationError`, `MINTPermissionError`, `NotFoundError`, `ConflictError`, `MINTValidationError`, `RateLimitError`, and `ServerError`. Errors expose `status_code` (also `status`), `code`, `message`, `request_id`, and `details`. Import them from `mint_sdk.client`.

## Token refresh

`MINTClient` wires a refresh callback at construction. When a request returns 401 with an expired token, the client attempts `auth.refresh()` once before re-raising. Long-running scripts get refresh for free; explicit triggers aren't needed.

For automation, use the deployment’s supported service-account credentials and handle authentication failures explicitly; a refresh attempt is not a guarantee that an expired or revoked session can continue.

## Pagination

The `list` methods return plain Python lists after unwrapping the platform response. For page-by-page pulls, pass `skip` and `limit` yourself:

```python
with MINTClient() as client:
    all_experiments = []
    skip = 0
    while True:
        batch = client.experiments.list(status="completed", skip=skip, limit=200)
        if not batch:
            break
        all_experiments.extend(batch)
        skip += len(batch)
```

For very large result sets, prefer querying only what you need — accumulating every page in a list can exhaust client memory.

## Notes

- `MINTClient` instances are not thread-safe. Use one per thread.
- Inside a plugin, prefer `PlatformContext` accessors over `MINTClient` — they avoid the public REST hop in shared mode and preserve plugin capability, owner, reader, type, and actor visibility checks. An isolated context implements the same protocol over internal HTTP.
- The credentials file (`~/.config/mint/credentials.json`, or `$XDG_CONFIG_HOME/mint/credentials.json`) is the user's responsibility to secure (`chmod 600`); `mint auth login` sets that automatically.

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — the in-process alternative
- [CLI reference → mint auth](/sdk/api/cli-reference#mint-auth) — token management
