# SDK Overview

MINT ships two SDKs that let you build first-class plugins:

| Package | Audience | Where it lives |
|---------|----------|----------------|
| **`mint-sdk`** (PyPI) | Plugin backend authors | [PyPI](https://pypi.org/project/mint-sdk/) · [`packages/sdk-python`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python) |
| **`@morscherlab/mint-sdk`** (npm) | Plugin frontend authors | [npm](https://www.npmjs.com/package/@morscherlab/mint-sdk) · [`packages/sdk-frontend`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend) |

::: warning Scope of this site
This site covers the SDK at a *high level* — what's in it, when to reach for it, and where to find the authoritative reference. Function signatures, the full Vue component catalog, type definitions, and version-specific API surfaces live in the [SDK docs](https://github.com/MorscherLab/mld/tree/main/sdk) inside the platform repo. Treat that as the source of truth.
:::

## When to build a plugin

Build a plugin when:

- The capability is lab-specific or domain-specific (LC-MS sequence design, drug-response prediction, plate-map editor, …)
- It needs to read or write platform data (experiments, projects, users, artifacts) through `PlatformContext`
- You want a marketplace-installable, versioned, isolated piece of functionality

Don't build a plugin when:

- You can do the work in a one-off Python script that hits the REST API via `mint experiment` or the SDK's typed client
- You'd be wrapping existing platform features without adding domain logic
- The capability really belongs in the core platform — open an issue and discuss

## Anatomy of a plugin

A plugin is a Python package with:

1. A class subclassing `mint_sdk.AnalysisPlugin`
2. A `PluginMetadata` declaring its identity, type, routes prefix, and capabilities
3. One or more FastAPI routers returned from `get_routers()`
4. Optional `mint_sdk.migrations` if it owns database tables
5. Optional Vue 3 frontend in `frontend/` using `@morscherlab/mint-sdk`
6. An entry point in `pyproject.toml` under `[project.entry-points."mld.plugins"]`

```python
from mint_sdk import AnalysisPlugin, PluginMetadata, PluginType

class MyPlugin(AnalysisPlugin):
    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="My Analysis",
            version="1.0.0",
            description="Computes the answer to everything",
            routes_prefix="/my-analysis",
            analysis_type="custom",
            plugin_type=PluginType.ANALYSIS,
        )

    def get_routers(self):
        return [(my_router, "/run")]

    async def initialize(self, context=None):
        self._context = context
```

This snippet is illustrative; for the canonical setup, run `mint init` (see [Plugin development](/cli/plugin-dev)) and read [`packages/sdk-python/README.md`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python).

## What's in `mint-sdk` (Python)

| Surface | Purpose |
|---------|---------|
| `AnalysisPlugin` | Base class plugins extend |
| `PluginMetadata`, `PluginType`, `PluginCapabilities` | Declare identity and capabilities |
| `PlatformContext` | Access experiments, projects, users, plugin data, artifacts |
| Repositories (`get_*_repository`) | Async data-access helpers backed by the platform's repositories |
| `mint_sdk.migrations` | `PluginMigration`, `MigrationOps`, `MigrationRunner` for per-plugin schema evolution |
| Typed REST client | For scripted access from outside the platform process |

→ [Python SDK detail](/sdk/python)

## What's in `@morscherlab/mint-sdk` (frontend)

| Surface | Purpose |
|---------|---------|
| ~96 Vue 3 components | UI building blocks tuned to the platform's design language |
| ~27 composables | Auth, API access, experiment selectors, form builder, … |
| Tailwind preset | CSS variables (500+ tokens) and utilities; consumed by the platform too |
| Histoire storybook | Interactive catalog (`bun run story:dev` in the SDK frontend, port 6006) |

→ [Frontend SDK detail](/sdk/frontend)

## Versioning and compatibility

The Python SDK ships independently from the platform under tags `sdk-v*`. Plugins declare a compatibility range in their `PluginMetadata` capabilities; the marketplace hides plugins whose required SDK is newer than the running platform's bundled SDK.

The frontend SDK is patched from the same tag stream and published to npm with the same version number.

| Layer | Pin in plugin | Floor enforced by |
|-------|--------------|--------------------|
| Python SDK | `mint-sdk = ">=1.0.0,<2.0.0"` in `pyproject.toml` | Marketplace install check |
| Frontend SDK | `"@morscherlab/mint-sdk": "^1.0.0"` in `package.json` | Frontend bundle build |

## Local development

When you change the SDK and a plugin together, link them locally so plugin code sees your edits without a re-publish:

```bash
mint link        # editable Python install + bun link for frontend SDK
mint unlink      # restore published versions
```

See [Plugin development](/cli/plugin-dev) for the full workflow.

## Next

→ [Python SDK](/sdk/python) — what the Python SDK exposes
→ [Frontend SDK](/sdk/frontend) — Vue 3 components and composables
→ [`mint init` and friends](/cli/plugin-dev) — scaffold and develop
