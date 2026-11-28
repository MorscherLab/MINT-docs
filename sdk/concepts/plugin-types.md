# Plugin Types and Capabilities

Use this page to choose the UI mode of a new plugin and to declare which platform data it writes.

## 1. Choose a development mode

| Mode | Scaffold | Use it for |
|---|---|---|
| `generated` | Python `@job` methods, SDK-managed forms and result views, runtime tests | Typed analysis inputs and outputs without maintaining Vue |
| `standard` | Python `@endpoint` methods, Vue 3 workspace, generated TypeScript client, backend/frontend tests | Custom layouts, interactive design tools, dashboards, orchestration |

Generated mode supports the `analysis` type only. Standard mode supports all five types. The mode does not give database access, authentication or write permissions. Every plugin subclasses `Plugin` and is declared with `@plugin(Meta)`. The base class does not limit a plugin to analysis.

## 2. Declare what the plugin writes

`Metadata.writes` is a set of `"experiments"`, `"design"` and `"artifacts"`. It is the one write declaration. The default is `{"artifacts"}`.

| `writes` | Wire `plugin_type` | CLI `--type` | Experiment create/update/delete | Own design payload | Own analysis results/artifacts | Typical purpose |
|---|---|---|---|---|---|---|
| `set()` | `static` | `static` | No | No | No | Help, dashboards, read-only reports |
| `{"artifacts"}` (default) | `analysis` | `analysis` | No | No | Yes | Process existing experiments and save computed outputs |
| `{"experiments", "design"}` | `experiment_design` | `experiment-design` | Yes | Yes | No | Define experiment inputs, plate maps, acquisition plans |
| `{"experiments"}` | `workflow` | `workflow` | Yes | No | No | Coordinate experiments without owning their scientific payloads |
| `{"experiments", "design", "artifacts"}` | `full` | `full` | Yes | Yes | Yes | One plugin owns both design and analysis |

The SDK derives the wire `plugin_type` and the three write capabilities from `writes`. A set with `"design"` and without `"artifacts"` is `experiment_design`. A set with `"artifacts"` and without `"design"` is `analysis`, also when `"experiments"` is present. Do not add `"design"` only to create or update experiments: it also claims design-data ownership.

```python
from mint_sdk import Metadata, Plugin, plugin


class BatchCoordinatorMeta(Metadata):
    domain = "workflow"
    prefix = "/batch-coordinator"
    writes = {"experiments"}   # experiment CRUD only


@plugin(BatchCoordinatorMeta)
class BatchCoordinatorPlugin(Plugin):
    pass
```

Read access still depends on what the current user can see and on the experiment-type allowlist of the platform. `Metadata.experiment_types` is the maximum set of types that the plugin supports; an admin setting can make it smaller. A `{"experiments", "design", "artifacts"}` plugin does not skip these checks and cannot change the design data or results of another plugin. A workflow plugin gets no scheduler, background job or cross-plugin execution graph; you write these interactions yourself.

## 3. Declare platform needs

| `Metadata` field | Purpose |
|---|---|
| `auth` (default `True`) | Requires an authenticated actor for ordinary plugin routes and pages |
| `database` | Declares plugin-owned tables in a platform-managed schema (`MigrationSpec`) |
| `features` | `"instrument_status"`, `"instrument_alerts"`, `"realtime"` |
| `reads_from`, `writes_to` | Exact plugin IDs whose artifacts the plugin reads, or whose object store it writes to. See [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers) |
| `depends_on` | Plugin names that must load first |
| `settings`, `settings_access` | Typed settings and the level that changes them |

The SDK infers the optional integrations from your decorators: `@notify(channels=...)` declares the email, Teams and Slack channels, and `@calendar_event` declares calendar events. Delivery still needs platform configuration. The wire capabilities are derived; a plugin does not build a `PluginCapabilities` object.

These declarations do not depend on the write set. `database` does not permit design writes, and `"experiments"` in `writes` does not create plugin tables. Do not use the presence of a namespace as an authorization check. The operations of the scoped namespaces apply the write policy and the data scope. Without the platform, `self.context` is a `StandaloneContext`; check `self.is_standalone`.

For a design plugin with its own tables:

```python
class PanelDesignerMeta(Metadata):
    domain = "design"
    writes = {"experiments", "design"}
    database = MigrationSpec(package="panel_designer.db_revisions", models=(Panel,))
```

See [plugin-owned tables](/sdk/tutorials/design-plugin-with-tables) for migrations, local SQLite, and installed PostgreSQL behavior.

## 4. Apply user and data permissions too

Plugin declarations set what the plugin may do. They do not let every user call every write.

- Resolve the request actor with `CurrentActor`. Declare `access="configure"` or `access="admin"` on the endpoint, job, MCP tool or page for sensitive actions. See [Route permissions](/sdk/recipes/route-permissions).
- Use `context.experiments` for platform records so experiment visibility and configured type restrictions apply.
- Keep design writes and result writes under your own entry-point plugin ID. Reading another plugin's analysis payload requires its exact ID in `reads_from`.
- Authorize access to rows in plugin-owned tables yourself; see [Querying plugin-owned tables](/sdk/recipes/querying-plugin-data#read-within-a-scoped-session).
- Treat standalone execution as a separate mode. Return a 503 for a feature that needs the platform. Do not substitute privileged platform access.

See [PlatformContext](/sdk/concepts/platform-context) and [route permissions](/sdk/recipes/route-permissions).

## Scaffold each type

Run these from a parent directory; each command creates a separate project:

```bash
mint init hello-mint --name "Hello MINT" --mode generated --type analysis --yes
mint init peak-review --name "Peak Review" --mode standard --type analysis --yes
mint init panel-designer --name "Panel Designer" --mode standard --type experiment-design --yes
mint init lab-help --name "Lab Help" --mode standard --type static --yes
mint init batch-coordinator --name "Batch Coordinator" --mode standard --type workflow --yes
mint init assay-workbench --name "Assay Workbench" --mode standard --type full --yes
```

The standard scaffold starts with the same example endpoint and Vue workspace for each type. `--type` sets `Metadata.writes`. Replace the example with your own workflow. The `--type` help text lists only four types, but the CLI accepts `workflow` too.

Continue with [first analysis plugin](/sdk/tutorials/first-analysis-plugin), [custom frontend](/sdk/tutorials/adding-a-frontend), [design plugin with tables](/sdk/tutorials/design-plugin-with-tables), or [workflow plugin](/sdk/tutorials/plugin-types-workflow).

Source: [`Metadata` and `plugin_type_for_writes`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_decorators.py), [scaffold implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_command.py), and [scoped experiment repository](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/services/scoped_experiment_repository.py).
