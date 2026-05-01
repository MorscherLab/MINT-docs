# Plugin types

Every MINT plugin declares one of two `PluginType` values. The choice determines which platform repositories it can access and what it's allowed to write.

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
            plugin_type=PluginType.ANALYSIS,   # or EXPERIMENT_DESIGN
        )
```

## The two types

| | `PluginType.EXPERIMENT_DESIGN` | `PluginType.ANALYSIS` |
|---|---|---|
| **Owns** | An experiment type, plus any tables it declares via `get_shared_models()` or migrations | None — reads existing experiments |
| **Experiment writes** | Full CRUD via `ExperimentRepository` (`create`, `update`, `delete`) | Read-only — `create`/`update`/`delete` raise `PermissionException` |
| **Design data writes** | Yes — owns `DesignData` for its experiment type | No |
| **Analysis-result writes** | Optional | Primary purpose — accumulates `PluginAnalysisResult` per run |
| **Visible at** | Experiment creation form, design tab | Experiment **Analyze** tab |
| **Multiplicity per experiment** | Exactly one (the type's design plugin) | Many — every installed analysis plugin can act on the experiment |

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

Pick **`EXPERIMENT_DESIGN`** when your plugin defines what an experiment *is* — its design schema, the form users fill in, the metadata that travels with it. Examples: an LC-MS sequence designer that owns `LcmsSequenceTable`; a drug-response panel designer; a plate-map editor for cell culture experiments.

Pick **`ANALYSIS`** when your plugin processes existing experiments and produces results. Examples: a peak-picking analysis that reads RAW files from an experiment and writes back peak tables; a drug-response prediction analysis that consumes panel design data and writes back IC50 estimates; a quality-control analysis that flags problematic samples.

A single domain capability often splits into both — a design plugin to set up the experiment plus one or more analysis plugins that act on it.

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
