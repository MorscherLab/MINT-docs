# Plugin types

Every MINT plugin declares a `PluginType`. The type supplies the default experiment-write policy; explicit `PluginCapabilities` fields can override each write boundary independently.

```python
from mint_sdk import AnalysisPlugin, PluginType, mint_plugin


@mint_plugin(
    analysis_type="metabolomics",
    routes_prefix="/my-plugin",
    plugin_type=PluginType.ANALYSIS,
)
class MyPlugin(AnalysisPlugin):
    pass
```

## The five types

| Type | Use it for | Experiment CRUD | Design-data writes | Analysis-result writes |
|------|------------|-----------------|--------------------|------------------------|
| `PluginType.STATIC` | UI/reporting/help plugins | No | No | No |
| `PluginType.ANALYSIS` | Processing experiments and saving computed outputs | No | No | Yes |
| `PluginType.EXPERIMENT_DESIGN` | Defining and editing experiment designs | Yes | Yes | No |
| `PluginType.FULL` | Workflows that own design and analysis | Yes | Yes | Yes |
| `PluginType.WORKFLOW` | Schedulers and orchestrators | No; opt in explicitly | No | No |

These are defaults, not separate repository implementations. In integrated mode, `context.get_experiment_repository()` returns the scoped repository regardless of `requires_experiments`; the resolved access policy controls which writes it accepts. The class you subclass is `AnalysisPlugin` regardless of type — the name reflects the abstract base, not the runtime category.

## Capability flags

`PluginCapabilities` declares platform integration needs and can override the three experiment-write defaults. Each write field is tri-state: `None` preserves the `PluginType` default, while `True` or `False` explicitly grants or removes that write capability.

| Field | Meaning |
|-------|---------|
| `requires_auth` | Plugin's routes are guarded by the platform's authenticated-user dependency |
| `requires_experiments` | Declares that the plugin integrates with experiment context; it does not gate the repository getter |
| `requires_database` | Declares that the plugin needs the platform database |
| `requires_shared_database` | Plugin needs its own scoped Postgres schema (for tables it owns); `context.get_shared_db_session()` works |
| `supports_experiment_linking` | UI hint: this plugin can attach to an experiment |
| `experiment_crud` | Allow or deny experiment create/update/delete; `None` keeps the type default |
| `design_data_write` | Allow or deny writes to this plugin's owned design data; `None` keeps the type default |
| `analysis_result_write` | Allow or deny writes to this plugin's results/artifacts; `None` keeps the type default |

```python
from mint_sdk import PluginCapabilities

PluginCapabilities(
    requires_auth=True,
    requires_experiments=True,
    requires_database=True,
    requires_shared_database=False,    # set True if you declare tables
)
```

## Choosing a type

Pick **`STATIC`** when your plugin only presents UI, dashboards, documentation, or read-only summaries. Static plugins can still expose routes and frontend pages, but the platform blocks design-data and analysis-output writes.

Pick **`ANALYSIS`** when your plugin processes existing experiments and produces results. Examples: a peak-picking analysis that reads RAW files from an experiment and writes back peak tables; a drug-response prediction analysis that consumes panel design data and writes back IC50 estimates; a quality-control analysis that flags problematic samples.

Pick **`EXPERIMENT_DESIGN`** when your plugin defines what an experiment *is* — its design schema, the form users fill in, the metadata that travels with it. Examples: an LC-MS sequence designer that owns `LcmsSequenceTable`; a drug-response panel designer; a plate-map editor for cell culture experiments.

Pick **`FULL`** only when one plugin truly needs to do both jobs: create/update design data and write analysis artifacts or compatibility results for the same workflow. A single domain capability often splits more cleanly into two plugins — one design plugin to set up the experiment plus one or more analysis plugins that act on it.

Pick **`WORKFLOW`** for schedulers and orchestrators that need to manage experiment lifecycle without owning design or analysis payloads. It is fail-closed, so request only the required write explicitly:

```python
@mint_plugin(
    analysis_type="workflow",
    routes_prefix="/scheduler",
    plugin_type=PluginType.WORKFLOW,
    capabilities=PluginCapabilities(experiment_crud=True),
)
class SchedulerPlugin(AnalysisPlugin):
    pass
```

## Example: minimal pair

::: code-group

```python [Design plugin]
from mint_sdk import AnalysisPlugin, PluginCapabilities, PluginType, mint_plugin


@mint_plugin(
    analysis_type="metabolomics",
    routes_prefix="/lcms-sequence",
    plugin_type=PluginType.EXPERIMENT_DESIGN,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_experiments=True,
        requires_database=True,
        requires_shared_database=True,
    ),
)
class LcmsSequenceDesignPlugin(AnalysisPlugin):
    pass
```

```python [Analysis plugin]
from mint_sdk import AnalysisPlugin, PluginCapabilities, PluginType, mint_plugin


@mint_plugin(
    analysis_type="metabolomics",
    routes_prefix="/peak-picking",
    plugin_type=PluginType.ANALYSIS,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_experiments=True,
        requires_database=True,
    ),
)
class PeakPickingPlugin(AnalysisPlugin):
    pass
```

:::

## Next

→ [Plugin lifecycle](/sdk/concepts/lifecycle) — what happens between `register` and `uninstall`
→ [PlatformContext](/sdk/concepts/platform-context) — what each capability gets you
→ [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — build one end-to-end
