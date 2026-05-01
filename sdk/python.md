# Python SDK (`mint-sdk`)

`mint-sdk` is the Python package plugin backends consume. It provides the `AnalysisPlugin` base class, the `PlatformContext` runtime, repository helpers, and the per-plugin migration framework.

::: warning Authoritative reference
The full API — every class, every method signature, every parameter — is documented at [`packages/sdk-python`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python) and the SDK docs site at [`sdk/site/`](https://github.com/MorscherLab/mld/tree/main/sdk/site). This page is a tour, not a reference.
:::

## Install

```bash
# In a plugin project
uv add mint-sdk
# or
pip install mint-sdk
```

If you're developing the SDK and a plugin together, link them with `mint link` instead — see [Plugin development](/cli/plugin-dev#local-sdk-linking).

To verify:

```python
import mint_sdk
print(mint_sdk.__version__)
```

## Plugin base class

```python
from mint_sdk import AnalysisPlugin, PluginMetadata, PluginType

class MyPlugin(AnalysisPlugin):
    @property
    def metadata(self) -> PluginMetadata: ...
    def get_routers(self): ...
    async def initialize(self, context=None): ...
    async def shutdown(self): ...
    def get_migrations_package(self): ...
```

| Method | When the platform calls it |
|--------|----------------------------|
| `metadata` | At discovery, install, and every load |
| `get_routers` | At mount time — returns `(APIRouter, sub_prefix)` tuples |
| `initialize` | Once after migrations apply, before routes are mounted |
| `shutdown` | Once on platform stop |
| `get_migrations_package` | If the plugin owns tables; returns the dotted path to the package |

## `PlatformContext`

`PlatformContext` is the single object the platform hands a plugin. Through it, plugins access:

| Method | Returns |
|--------|---------|
| `get_experiment_repository()` | Read/write experiments (subject to plugin capabilities) |
| `get_project_repository()` | Read projects and members |
| `get_user_repository()` | Read users (no writes) |
| `get_artifact_repository()` | Read/write uploaded artifacts |
| `get_plugin_data_repository()` | The plugin's own scoped storage |
| `current_user()` | The authenticated user invoking the request |
| `tracer()` | OpenTelemetry tracer scoped to the plugin |

Capabilities declared in `PluginMetadata` gate which repositories the context will hand out — an analysis plugin that didn't declare experiment write capability calling `experiments.update(...)` raises a permission error at runtime, not just at the API layer.

## Migrations

Plugins that own database tables use `mint_sdk.migrations`:

```python
# my_plugin/migrations/001_initial.py
from mint_sdk.migrations import PluginMigration, MigrationOps

class Migration(PluginMigration):
    revision = "001"
    description = "create plates table"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.create_table("plates", [
            ops.column("id", "uuid", primary_key=True),
            ops.column("experiment_id", "uuid", nullable=False),
            ops.column("design_json", "jsonb", nullable=False),
        ])
        await ops.create_index("idx_plates_experiment", "plates", ["experiment_id"])
```

`MigrationOps` is portable across SQLite and Postgres — it abstracts the JSON / JSONB difference and emits the right DDL for the active backend.

`MigrationRunner` (called by the platform) records applied revisions in `plugin_schema_migrations`, advisory-locks the run so two replicas can't race, and surfaces the result in **Admin → Plugins**.

## Typed REST client

For scripted access from outside the platform process — CI scripts, batch jobs, notebooks — the SDK ships a typed client:

```python
from mint_sdk.client import MintClient

async with MintClient.from_env() as client:
    experiments = await client.experiments.list(status="ongoing")
    for exp in experiments:
        await client.experiments.update(exp.code, status="completed")
```

`MintClient.from_env()` reads the same `~/.config/mint/cli.json` that the `mint` CLI populates; `MintClient(url=..., token=...)` constructs one explicitly.

## Logging and observability

The SDK exposes a `mint_sdk.logging.get_logger()` helper that routes structured log records into the platform's logger configuration — request IDs, user IDs, and plugin names are automatically attached. Don't use `print()` from a plugin; the platform discards stdout from isolated subprocesses.

## Reference

→ [`packages/sdk-python`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python) — source, README, examples
→ [`sdk/site/`](https://github.com/MorscherLab/mld/tree/main/sdk/site) — VitePress reference site (run locally with `bun run dev`)
→ `mint docs` — open the SDK reference in your default browser

## Next

→ [Frontend SDK](/sdk/frontend) — Vue 3 components and composables
→ [Plugin development](/cli/plugin-dev) — `mint init`, `mint dev`, `mint build`
