# Plugin types

Every MINT plugin declares a `PluginType`. The choice determines which platform repositories it can access and which experiment payloads it is allowed to write.

```python
from mint_sdk import PluginType

class MyPlugin(AnalysisPlugin):
    @property
    def metadata(self):
        return PluginMetadata(
            name="My plugin",
            version="1.0.0",
            description="...",
            analysis_type="metabolomics",
            routes_prefix="/my-plugin",
            plugin_type=PluginType.ANALYSIS,
        )
```

## The four types

| Type | Use it for | Experiment repository | Design data | Analysis results |
|------|------------|-----------------------|-------------|------------------|
| `PluginType.STATIC` | UI/reporting/help plugins that should not mutate experiment data | Read-only | Read-only | Read-only |
| `PluginType.ANALYSIS` | Processing existing experiments and saving computed results | Read-only experiment CRUD wrapper | Read-only | Can write this plugin's result |
| `PluginType.EXPERIMENT_DESIGN` | Defining and editing an experiment's design payload | Design-scoped create/update/delete | Can write owned design data | Read-only |
| `PluginType.FULL` | Rare plugins that must own both design data and analysis results | Full repository access | Can write | Can write |

The class you subclass is `AnalysisPlugin` regardless of type — the name reflects the abstract base, not the runtime category. The `plugin_type` field on `PluginMetadata` is what the platform reads.

## Capability flags

`PluginCapabilities` declares what the plugin needs from the platform. Repository accessors return `None` when a capability isn't declared.

| Field | Meaning |
|-------|---------|
| `requires_auth` | Plugin's routes are guarded by the platform's authenticated-user dependency |
| `requires_experiments` | `context.get_experiment_repository()` returns a real repo (vs `None`) |
| `requires_database` | Plugin needs the platform's database — `context.get_plugin_data_repository()` returns a real repo |
| `requires_shared_database` | Plugin needs its own scoped Postgres schema (for tables it owns); `context.get_shared_db_session()` works |
| `supports_experiment_linking` | UI hint: this plugin can attach to an experiment |

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

Pick **`STATIC`** when your plugin only presents UI, dashboards, documentation, or read-only summaries. Static plugins can still expose routes and frontend pages, but the platform blocks design-data and analysis-result writes.

Pick **`ANALYSIS`** when your plugin processes existing experiments and produces results. Examples: a peak-picking analysis that reads RAW files from an experiment and writes back peak tables; a drug-response prediction analysis that consumes panel design data and writes back IC50 estimates; a quality-control analysis that flags problematic samples.

Pick **`EXPERIMENT_DESIGN`** when your plugin defines what an experiment *is* — its design schema, the form users fill in, the metadata that travels with it. Examples: an LC-MS sequence designer that owns `LcmsSequenceTable`; a drug-response panel designer; a plate-map editor for cell culture experiments.

Pick **`FULL`** only when one plugin truly needs to do both jobs: create/update design data and write analysis results for the same workflow. A single domain capability often splits more cleanly into two plugins — one design plugin to set up the experiment plus one or more analysis plugins that act on it.

## Example: minimal pair

::: code-group

```python [Design plugin]
from mint_sdk import AnalysisPlugin, PluginMetadata, PluginType, PluginCapabilities

class LcmsSequenceDesignPlugin(AnalysisPlugin):
    @property
    def metadata(self):
        return PluginMetadata(
            name="LC-MS sequence designer",
            version="1.0.0",
            description="Design LC-MS acquisition sequences",
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

    def get_routers(self):
        return []  # routers omitted for brevity

    async def initialize(self, context=None): self._context = context
    async def shutdown(self): pass
```

```python [Analysis plugin]
from mint_sdk import AnalysisPlugin, PluginMetadata, PluginType, PluginCapabilities

class PeakPickingPlugin(AnalysisPlugin):
    @property
    def metadata(self):
        return PluginMetadata(
            name="Peak picking",
            version="1.0.0",
            description="Detect peaks in LC-MS chromatograms",
            analysis_type="metabolomics",
            routes_prefix="/peak-picking",
            plugin_type=PluginType.ANALYSIS,
            capabilities=PluginCapabilities(
                requires_auth=True,
                requires_experiments=True,
                requires_database=True,
            ),
        )

    def get_routers(self):
        return []

    async def initialize(self, context=None): self._context = context
    async def shutdown(self): pass
```

:::

## Next

→ [Plugin lifecycle](/sdk/concepts/lifecycle) — what happens between `register` and `uninstall`
→ [PlatformContext](/sdk/concepts/platform-context) — what each capability gets you
→ [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — build one end-to-end
