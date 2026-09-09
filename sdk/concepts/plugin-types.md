# Plugin Types and Capabilities

MINT v1.2 separates **how you build the UI**, **the plugin's category**, and **which platform data it can write**. Choose each explicitly when starting a plugin.

## 1. Choose a development mode

| Mode | Scaffold | Use it for |
|---|---|---|
| `generated` | Python `@job` methods, SDK-managed forms and result views, runtime tests | Typed analysis inputs and outputs without maintaining Vue |
| `standard` | Python `@endpoint` methods, Vue 3 workspace, generated TypeScript client, backend/frontend tests | Custom layouts, interactive design tools, dashboards, orchestration |

In the v1.2 CLI, **generated mode only scaffolds `analysis`**. Standard mode supports all five types. Mode does not grant database access, authentication, or write permissions. Both modes subclass `AnalysisPlugin`; that base-class name does not force an analysis-only role.

## 2. Choose a category

This table shows the **default** write policy when the three explicit write capabilities are `None`:

| `PluginType` | CLI `--type` | Experiment create/update/delete | Own design payload | Own analysis results/artifacts | Typical purpose |
|---|---|---|---|---|---|
| `STATIC` | `static` | No | No | No | Help, dashboards, read-only reports |
| `ANALYSIS` | `analysis` | No | No | Yes | Process existing experiments and save computed outputs |
| `EXPERIMENT_DESIGN` | `experiment-design` | Yes | Yes | No | Define experiment inputs, plate maps, acquisition plans |
| `WORKFLOW` | `workflow` | No | No | No | Coordinate experiments without owning their scientific payloads |
| `FULL` | `full` | Yes | Yes | Yes | One plugin owns both design and analysis |

`WORKFLOW` starts with no writes. The **workflow scaffold** explicitly adds `experiment_crud=True`, `design_data_write=False`, and `analysis_result_write=False`. An otherwise empty `PluginCapabilities()` on a workflow plugin grants none of these writes.

Read access still depends on the current user's visibility and the platform's configured experiment-type allowlist. `FULL` does not bypass these checks or allow modifying another plugin's design data or results.

## 3. Declare explicit write capabilities

New in v1.2, three fields independently override the category defaults:

| Field | `True` enables | `False` does | `None` does |
|---|---|---|---|
| `experiment_crud` | Create, update, delete experiment records | Denies experiment CRUD | Uses category default |
| `design_data_write` | Save/delete this plugin's design data | Denies design writes | Uses category default |
| `analysis_result_write` | Save/manage this plugin's analysis results and artifacts | Denies result writes | Uses category default |

For example, an orchestrator needs experiment CRUD, but should leave a plate designer's payload and a quantification plugin's results to their owners:

```python
from mint_sdk import AnalysisPlugin, PluginCapabilities, PluginType, mint_plugin


@mint_plugin(
    analysis_type="workflow",
    routes_prefix="/batch-coordinator",
    plugin_type=PluginType.WORKFLOW,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_experiments=True,
        experiment_crud=True,
        design_data_write=False,
        analysis_result_write=False,
    ),
)
class BatchCoordinatorPlugin(AnalysisPlugin):
    pass
```

An `ANALYSIS` plugin can opt out of persistence with `analysis_result_write=False`. Existing plugins that omit the new fields retain their previous category defaults. A `WORKFLOW` category does not create a scheduler, background job, or cross-plugin execution graph; you implement those interactions explicitly.

## 4. Declare platform needs

| Capability | Purpose |
|---|---|
| `requires_auth` | Requires an authenticated actor for ordinary plugin routes |
| `requires_experiments` | Declares that the plugin integrates with platform experiments |
| `requires_database` | Declares platform database usage |
| `requires_shared_database` | Declares plugin-owned tables in a platform-managed schema; pair with table/migration declarations |
| `supports_experiment_linking` | Declares that the plugin can be linked to an experiment |
| `supports_email_notifications`, `supports_teams_notifications`, `supports_slack_notifications`, `supports_calendar_events` | Declares optional integrations; delivery still needs platform configuration |

These feature declarations are separate from the three write permissions. Setting `requires_database=True` does not permit design writes; setting `experiment_crud=True` does not create plugin tables. Do not use repository presence as an authorization check: the integrated v1.2 context supplies scoped repositories, and their operations enforce the effective write policy and data scope. Standalone plugins have `context=None`.

For a design plugin with its own tables:

```python
capabilities=PluginCapabilities(
    requires_auth=True,
    requires_experiments=True,
    requires_database=True,
    requires_shared_database=True,
    experiment_crud=True,
    design_data_write=True,
    analysis_result_write=False,
)
```

See [plugin-owned tables](/sdk/tutorials/design-plugin-with-tables) for `get_shared_models()`, migrations, local SQLite, and installed PostgreSQL behavior.

## 5. Apply user and data permissions too

Plugin capabilities describe what the **plugin** may do. They do not mean every user may invoke every mutation.

- Resolve the request actor with `CurrentPluginActor`; check the relevant platform permission or a plugin role for sensitive actions.
- Use `context.get_experiment_repository()` for platform records so experiment visibility and configured type restrictions apply.
- Keep design writes and result writes under your own entry-point plugin ID. Reading another plugin's analysis payload requires its exact ID in `analysis_result_readers`.
- Authorize access to rows in plugin-owned tables yourself. A private schema isolates plugins; it does not automatically isolate users or experiments within your tables.
- Treat standalone execution as a separate mode. Return a clear 503 for features that require the platform; do not silently substitute privileged platform access.

See [PlatformContext](/sdk/concepts/platform-context), [route permissions](/sdk/recipes/route-permissions), and [plugin roles](/sdk/tutorials/plugin-roles).

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

The standard scaffold starts with the same example calculation endpoint and Vue workspace for each type. `--type` changes metadata and policy; replace the example with your actual workflow. In v1.2, the `--type` help text still lists only four categories, but `workflow` is accepted by the command implementation.

Continue with [first analysis plugin](/sdk/tutorials/first-analysis-plugin), [custom frontend](/sdk/tutorials/adding-a-frontend), [design plugin with tables](/sdk/tutorials/design-plugin-with-tables), or [workflow plugin](/sdk/tutorials/plugin-types-workflow).

Source: [v1.2 capability model](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/models.py), [scaffold implementation](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/init_command.py), and [scoped experiment repository](https://github.com/MorscherLab/MINT/blob/v1.2.0/api/repositories/scoped_experiment_repository.py).
