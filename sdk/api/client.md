# REST client reference

`MINTClient` is the synchronous Python client for the MINT REST API. Use it in external scripts, CI jobs and notebooks. In plugin code, use [`PlatformContext`](/sdk/concepts/platform-context) instead: it avoids the REST round trip and keeps the plugin access checks.

Source: [`mint_sdk/client/client.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/client/client.py).

## Construction

```python
from mint_sdk.client import MINTClient

# 1. Explicit URL + personal access token (the main path for scripts)
with MINTClient(base_url="https://mint.example.org", token="mint_pat_...") as client:
    ...

# 2. Env-aware (no arguments) — reads MINT_URL and MINT_TOKEN, falling back
#    to the credentials that `mint platform auth login` stored
with MINTClient() as client:
    ...

# 3. Username + password — only for platforms without a forced second factor
with MINTClient(base_url="https://mint.example.org",
                 username="alice", password="…") as client:
    me = client.whoami()
```

To get a personal access token, run `mint platform auth login` or see [Create a token](/guide/ai-and-api#create-a-token).

`MINTClient` is synchronous: use `with`, not `async with`. Constructor:

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

When `base_url` is `None`, the client uses the first value it finds:

1. The `MINT_URL` environment variable.
2. The [stored CLI credentials](/sdk/api/cli-reference#mint-platform-auth).
3. None: the client raises `APIError`.

When `token` is `None`, the same order applies, with `MINT_TOKEN` first.

When `timeout` is `None`, the client uses `MINT_PLATFORM_TIMEOUT` and `MINT_PLATFORM_CONNECT_TIMEOUT` (defaults 30 s and 10 s). An explicit `timeout` overrides them for this client.

## Convenience auth methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `client.login(username, password)` | `dict` | Sign in with a password and keep the JWT in the client. On a platform that enforces a second factor (`auth.requireSecondFactor`), it raises `APIError` with `code="auth.second_factor_required"` and keeps no token: use a personal access token there |
| `client.logout()` | `None` | Clear stored credentials |
| `client.whoami()` | `dict` | Return current user info |
| `client.health()` | `dict` | Platform health payload from `/health`; no authentication required |
| `client.close()` | `None` | Close the HTTP connection; the context manager calls it |

`login`, `logout` and `whoami` call `client.auth`.

## Resource clients

Each resource has a typed sub-client. The client creates it on first access:

| Property | Type | Purpose |
|----------|------|---------|
| `client.auth` | `AuthAPI` | Login / logout / verify / refresh / whoami / public auth config |
| `client.experiments` | `ExperimentsAPI` | Experiment CRUD, design data, compatibility analysis results, experiment types |
| `client.projects` | `ProjectsAPI` | List, get, create, update, delete, experiments, members |
| `client.plugins` | `PluginsAPI` | List, install, upload, upgrade, and uninstall plugins; runtime registration; plugin config; package indexes; environment snapshots |
| `client.admin` | `AdminAPI` | Admin status, system snapshot, config, logs, audit events, restart; users and roles |
| `client.updates` | `UpdatesAPI` | Platform/plugin update checks, GitHub release installs |
| `client.objects` | `ObjectsAPI` | Typed object upload, download, list, existence and deletion |
| `client.instruments` | `InstrumentsAPI` | Read instruments with their latest live status |
| `client.libraries` | `LibrariesAPI` | Administer the [library store](/admin/libraries) |

Source for resource methods: [`mint_sdk/client/resources/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/client/resources).

### Resource methods

| Namespace | Methods |
|-----------|---------|
| `client.auth` | `login(username, password)`, `login_with_token(token)`, `logout()` (returns whether the platform acknowledged it; a personal access token sent as Bearer is revoked), `verify()`, `refresh()`, `whoami()`, `config()`, `create_token(...)`, `list_tokens()`, `revoke_token(token_id)` |
| `client.instruments` | `list(*, active_only=True)`, `get(instrument_id)` |
| `client.projects` | `list(*, status=None, search=None, my_projects=False, skip=0, limit=100)`, `get(id)`, `create(...)`, `update(id, **fields)`, `delete(id)`, `experiments(id, *, skip=0, limit=100)`, `members(id)` |
| `client.plugins` | `list()`, `install(source, *, force=False)`, `upload(path, *, force=False)`, `upgrade(package_name, *, force=False)`, `uninstall(package_name)`, `register_external(name, target, ...)`, `register_docker(name, image, ...)`, `get_config(plugin_name)`, `set_config(plugin_name, config, *, expected_revision)`, `update_config(plugin_name, config)`, `get_extra_index_urls()`, `set_extra_index_urls(urls)`, `snapshots()`, `snapshot(snapshot_id)` |
| `client.admin` | `status()`, `system()`, `config()`, `restart()`, `logging_config()`, `logs(*, limit=100, offset=0, level=None, search=None, plugin=None)`; users: `list_users()`, `get_user(id)`, `create_user(*, username, password, ...)`, `update_user(id, **fields)`, `delete_user(id)`, `activate_user(id)`, `deactivate_user(id)`; roles: `list_roles()`, `list_permissions()`, `create_role(*, name, slug, permissions, ...)`, `update_role(id, **fields)`, `delete_role(id)`; audit: `audit_events(*, action=None, skip=0, limit=100, since=None, until=None)` (`action` matches a prefix; needs `platform.view_logs`) |
| `client.libraries` | `list()`, `import_(source, *, name, version, publisher="platform", media_type=None, license="", meta=None, promote=False)`, `operation(operation_id)`, `promote(publisher, name, version)`, `retire(...)`, `restore(...)`, `delete(...)` |
| `client.updates` | `check()`, `config()`, `sources()`, `update_plugin(package_name, *, force=False)`, `update_platform()`, `list_releases(github_url, *, asset_pattern="*.mint")`, `install_github(github_url, *, tag=None, asset_pattern="*.mint", force=False)` |

`set_config()` sends the revision as `If-Match`. Read the revision with `get_config()` first. A stale revision raises `ConflictError`.

### Instruments

`client.instruments.list()` returns a `list[dict]`. The `live_status` key of each dict is `None` until a plugin reports a status. `client.instruments.get(instrument_id)` returns one instrument. Both need the `instruments.view` permission. The CLI command is [`mint platform instruments`](/sdk/api/cli-reference#mint-platform-instruments).

The client has no `client.users`, `client.artifacts` or `MINTClient.from_env()`. Use `client.admin` for users, `client.experiments.artifacts` for artifacts, `client.objects` for raw objects, and `MINTClient()` without arguments for the environment.

## Experiments

`client.experiments.list()` returns a plain `list[dict]`:

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

| Method | Purpose |
|--------|---------|
| `list(...)` | Filter visible experiments by status, type, project, owner, date window, or search text |
| `get(experiment_id)` | Fetch one experiment detail record |
| `create(name=..., experiment_type="custom", project_id=None, notes=None, tags=None)` | Create an experiment. For the experiment code, see [Experiment numbers](/guide/experiments#experiment-numbers) |
| `update(experiment_id, **fields)` | Patch metadata such as name, status, type, project, notes, tags, or dates |
| `delete(experiment_id)` | Delete the experiment at once. See [Deleting experiments](/guide/experiments#deleting-experiments) |
| `list_types()` | List enabled experiment types |
| `next_seq(experiment_type)` | Preview the next code sequence for a type |

Back up the database before you run a bulk delete script.

## Experiment data

Design data is one JSON payload per experiment. `client.experiments.analysis` reads and writes one JSON result per plugin (`/experiments/{id}/results`). The experiment page shows [analysis artifacts](#first-class-artifact-downloads), not these results.

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

## First-class artifact downloads

```python
from mint_sdk.client import MINTClient

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

The client cannot write artifacts. The producing plugin writes them; see [Writing results](/sdk/recipes/writing-results).

`client.objects` has `list`, `put_bytes`, `put_file`, `get_bytes`, `get_ref`, `download_file`, `exists` and `delete`. Each call takes an experiment ID and an explicit `plugin_id`. The calls use the permissions of the signed-in user, not of the plugin. An uploaded object does not create an analysis artifact.

Earlier releases had flat methods (`get_data`, `save_data`, `delete_data`, `get_data_tree`, `get_data_summary`, `export_data`, `get_results`, `get_result`, `save_result`, `delete_result`). They are removed; use `client.experiments.data` and `client.experiments.analysis`.

## Errors

The client raises `APIError`, or a subclass, for each non-2xx response. It reads the [error envelope](/reference/error-codes#the-error-envelope):

```python
from mint_sdk.client import APIError, MINTClient

with MINTClient() as client:
    try:
        exp = client.experiments.get(99999)
    except APIError as e:
        print(f"failed: {e}")
```

| Failure | Class |
|---------|-------|
| Connection error or timeout | `NetworkError` |
| 401, 403 | `AuthError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| Other error status | `APIError` |

`AuthError`, `NotFoundError` and `ConflictError` also derive from the matching SDK exception, so one `except` clause catches both. To tell cases apart, compare `code` (for example `auth.second_factor_required`), not the class. Each error has `status_code` (also `status`), `code`, `message`, `request_id` and `details`. Import the classes from `mint_sdk.client`.

## Token refresh

When a request with an expired session token returns 401, the client calls `auth.refresh()` once, then raises. The client never refreshes a personal access token (prefix `mint_pat_`). A refresh can fail for a revoked session. For automation, use a personal access token (`MINT_TOKEN`) and handle authentication errors in your script.

## Pagination

The `list` methods return plain lists. To read page by page, pass `skip` and `limit`:

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

For a large result set, filter the query: a list of every page can use all client memory.

## Threads

A `MINTClient` instance is not thread-safe. Use one instance per thread.
