# REST client reference

`MINTClient` is the synchronous Python client for the MINT platform REST API. Use it from external scripts, CI jobs, or notebooks; from inside a plugin process, prefer `PlatformContext` accessors which avoid the network round-trip.

Source: [`mint_sdk/client/client.py`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-python/src/mint_sdk/client/client.py).

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
#    to credentials stored by `mint auth login` at ~/.config/mld/credentials.json
with MINTClient() as client:
    ...
```

`MINTClient` is **synchronous** — uses plain `with`, not `async with`. The constructor signature:

```python
MINTClient(
    base_url: str | None = None,
    token: str | None = None,
    username: str | None = None,
    password: str | None = None,
    timeout: float = 30.0,
)
```

When `base_url` is `None`, the resolution order is:

1. `MINT_URL` env var
2. Stored credentials at `~/.config/mld/credentials.json` (written by `mint auth login`)
3. Otherwise raise `MINTAPIError`

When `token` is `None`, the same fallback chain runs for the JWT (env: `MINT_TOKEN`).

## Convenience auth methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `client.login(username, password)` | `dict` | Authenticate; store JWT in the client |
| `client.logout()` | `None` | Clear stored credentials |
| `client.whoami()` | `dict` | Return current user info |

These are thin wrappers over `client.auth`.

## Resource clients

`MINTClient` exposes typed sub-clients per resource. Each is a `@cached_property` that lazy-imports its module on first access:

| Property | Type | Purpose |
|----------|------|---------|
| `client.auth` | `AuthAPI` | Login / logout / refresh / whoami |
| `client.experiments` | `ExperimentsAPI` | List, get, create, update, get_data |
| `client.projects` | `ProjectsAPI` | List, get, create, update, archive |
| `client.plugins` | `PluginsAPI` | List installed plugins; install / uninstall (admin) |

Source for resource methods: [`mint_sdk/client/resources/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/client/resources).

::: warning Not exposed
Earlier docs claimed `client.users` and `client.artifacts` — those don't exist. There is no `MINTClient.from_env()` factory; use the env-aware constructor (option 3 above).
:::

## Errors

The client raises `MINTAPIError` (and `mint_sdk.exceptions` subclasses where applicable) on non-2xx responses, parsed from the platform's structured error body:

```python
from mint_sdk import MINTClient
from mint_sdk.client._exceptions import MINTAPIError

with MINTClient() as client:
    try:
        exp = client.experiments.get(99999)
    except MINTAPIError as e:
        print(f"failed: {e}")
```

Network / timeout errors raise `httpx` exceptions — wrap in your own retry logic if needed.

## Token refresh

`MINTClient` wires a refresh callback at construction. When a request returns 401 with an expired token, the client attempts `auth.refresh()` once before re-raising. Long-running scripts get refresh for free; explicit triggers aren't needed.

For genuinely long jobs (CI runs that span days), prefer service-account tokens with longer TTL — generate from **Admin → Users → Service accounts** in the platform UI.

## Pagination

The `list` methods return iterables (consult each `*API.py` file for exact shape). The most common pattern:

```python
with MINTClient() as client:
    all_experiments = []
    for batch in client.experiments.list(status="completed", limit=200):
        all_experiments.extend(batch)
```

For very large result sets, prefer querying only what you need — full pulls hit memory limits and lock the platform's connection pool.

## Notes

- `MINTClient` instances are not thread-safe. Use one per thread.
- Inside a plugin, prefer `PlatformContext` accessors over `MINTClient` — they share the platform's connection pool, avoid the network hop in shared mode, and short-circuit auth checks for the plugin's user.
- The credentials file (`~/.config/mld/credentials.json`) is the user's responsibility to secure (`chmod 600`); `mint auth login` sets that automatically.

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — the in-process alternative
- [CLI reference → mint auth](/sdk/api/cli-reference#mint-auth) — token management
