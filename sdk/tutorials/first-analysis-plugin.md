# Tutorial 1 — First analysis plugin

You'll build a minimal analysis plugin called **hello-mint**. It exposes one HTTP route that reads an experiment via `PlatformContext` and returns a small JSON summary. By the end you'll have a runnable plugin, a passing unit test, and a `.mint` bundle ready to install.

**Time:** ~30 minutes
**Prereqs:** `mint` CLI installed; `uv` available; basic FastAPI familiarity

## 1. Scaffold the project

```bash
# In any working directory
mint init hello-mint
cd hello-mint
```

`mint init` is interactive — it'll prompt for missing fields. Or pass them as flags up-front:

```bash
mint init hello-mint \
  --type analysis \
  --description "Hello world analysis plugin" \
  --no-frontend \
  --ai-assistant claude \
  --yes
```

For this tutorial, accept the defaults (analysis plugin with frontend scaffolding skipped — we add a frontend in [Tutorial 3](/sdk/tutorials/adding-a-frontend)). The `routes_prefix` is derived from the plugin name (`/hello-mint`), so there's no flag for it.

The result:

```
hello-mint/
├── pyproject.toml
├── README.md
├── src/
│   └── hello_mint/
│       ├── __init__.py
│       ├── plugin.py         # ← AnalysisPlugin subclass
│       └── routes.py         # ← FastAPI router
└── tests/
    └── test_plugin.py
```

**Checkpoint:**

```bash
ls src/hello_mint/
# → __init__.py  plugin.py  routes.py
```

## 2. Inspect the scaffolded plugin

```python
# src/hello_mint/plugin.py
from mint_sdk import (
    AnalysisPlugin,
    PluginCapabilities,
    PluginMetadata,
    PluginType,
)

from hello_mint.routes import router


class HelloMintPlugin(AnalysisPlugin):
    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="hello-mint",
            version="0.1.0",
            description="Hello world analysis plugin",
            analysis_type="metabolomics",
            routes_prefix="/hello-mint",
            plugin_type=PluginType.ANALYSIS,
            capabilities=PluginCapabilities(
                requires_auth=True,
                requires_experiments=True,
                requires_database=True,
            ),
        )

    def get_routers(self):
        return [(router, "")]

    async def initialize(self, context=None):
        self._context = context

    async def shutdown(self):
        pass
```

```python
# src/hello_mint/routes.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}
```

```toml
# pyproject.toml — relevant entry
[project.entry-points."mld.plugins"]
hello-mint = "hello_mint.plugin:HelloMintPlugin"
```

The entry point is what the platform's loader reads. The slug `hello-mint` becomes the install identifier.

## 3. Run in standalone mode

Standalone mode skips the platform — your plugin runs as a plain FastAPI app on its own port. Useful for fast iteration.

```bash
# In hello-mint/
mint dev
```

Expected output:

```
→ uvicorn running on http://127.0.0.1:8005
→ plugin: hello-mint
→ standalone mode (no platform context)
→ watching: src/, pyproject.toml
```

In another terminal:

```bash
curl http://127.0.0.1:8005/api/hello-mint/health
# → {"status":"ok"}
```

The `/api/<routes_prefix>` shape is the same in standalone and integrated modes. Stop the server with **Ctrl+C** before continuing.

## 4. Add a route that reads an experiment

Replace `routes.py` with:

```python
# src/hello_mint/routes.py
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from mint_sdk import NotFoundException

router = APIRouter()


def _get_plugin():
    """Late-import to avoid circularity."""
    from hello_mint.plugin import HelloMintPlugin
    # The platform sets this; use a module global so it's reachable from routes.
    from hello_mint import plugin
    return plugin._INSTANCE  # populated in initialize()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/experiments/{experiment_id}")
async def summarize_experiment(experiment_id: int) -> dict[str, Any]:
    plugin = _get_plugin()
    if plugin._context is None:
        # Standalone — return a stub so dev iterations don't require a platform
        return {
            "experiment_id": experiment_id,
            "name": "(standalone stub)",
            "status": "unknown",
        }

    repo = plugin._context.get_experiment_repository()
    experiment = await repo.get_by_id(experiment_id)
    if experiment is None:
        raise NotFoundException(
            f"Experiment {experiment_id} not found",
            entity="experiment",
            entity_id=str(experiment_id),
        )

    return {
        "experiment_id": experiment.id,
        "name": experiment.name,
        "status": experiment.status,
        "experiment_type": experiment.experiment_type,
    }
```

Wire `_INSTANCE` so the routes can find the plugin object:

```python
# src/hello_mint/__init__.py
_INSTANCE = None  # populated by HelloMintPlugin.initialize
```

```python
# src/hello_mint/plugin.py — update initialize
import hello_mint as _pkg

class HelloMintPlugin(AnalysisPlugin):
    # ... metadata and get_routers as before ...

    async def initialize(self, context=None):
        self._context = context
        _pkg._INSTANCE = self
```

::: tip Module-global lookup vs. dependency injection
Storing the plugin instance on the package and looking it up from routes is the simplest pattern that works across standalone and integrated modes. Cleaner alternatives use FastAPI dependency injection, but they add boilerplate that's unhelpful in a tutorial. See [Recipes → Reading experiments](/sdk/recipes/reading-experiments) for the cleaner pattern.
:::

## 5. Run it against the platform

```bash
# In hello-mint/
mint dev --platform
```

This starts the platform on port 8001 with your plugin proxied via `config.dev.toml`. Expected output:

```
→ platform: http://127.0.0.1:8001
→ plugin:   http://127.0.0.1:8005 (proxied to /api/hello-mint)
→ creating mld/config.dev.toml
→ both processes running; Ctrl+C to stop
```

In another terminal — log in to the platform first (see [Get Started → Quickstart](/get-started/quickstart)) so you have an experiment to query, then:

```bash
curl http://127.0.0.1:8001/api/hello-mint/experiments/1 \
     -H "Cookie: $(cat ~/.config/mint/dev-cookie)"
# → {"experiment_id":1,"name":"…","status":"…","experiment_type":"…"}
```

(Substitute the cookie file path you use for the platform's dev session, or use `mint auth login` and let the CLI handle it for you.)

## 6. Add a unit test

The SDK ships a small testing harness with four exports: `make_test_plugin`, `build_test_app`, `RecordingContext`, and `write_standalone_plugin_module`. For a plugin you've already written, `RecordingContext` is the most useful — it's an in-memory `PlatformContext` that records every call.

```python
# tests/test_plugin.py
import pytest
from mint_sdk.testing import RecordingContext

from hello_mint.plugin import HelloMintPlugin


@pytest.fixture
async def plugin():
    p = HelloMintPlugin()
    ctx = RecordingContext()
    await p.initialize(ctx)
    yield p
    await p.shutdown()


@pytest.mark.asyncio
async def test_save_and_load_design(plugin):
    # save_design works through RecordingContext's in-memory data repo
    await plugin.save_design(experiment_id=1, data={"params": {"k": 5}})
    design = await plugin.load_design(experiment_id=1)
    assert design is not None
    assert design.data == {"params": {"k": 5}}
```

Run:

```bash
uv run pytest -v
# → tests/test_plugin.py::test_save_and_load_design PASSED
```

For HTTP-level tests, use `build_test_app(plugin)` to construct a FastAPI app and drive it with `httpx.AsyncClient` — see [Recipes → Testing plugins](/sdk/recipes/testing-plugins).

## 7. Validate the project structure

```bash
mint doctor
```

Expected: every check passes, ending with:

```
✓ pyproject.toml: project name + version
✓ entry point: mld.plugins → hello_mint.plugin:HelloMintPlugin
✓ AnalysisPlugin: metadata + routers + lifecycle implemented
✓ tests: 1 file, 1 test, 1 passed
→ no issues found
```

## 8. Build a `.mld` bundle

```bash
mint build
# → dist/hello-mint-0.1.0.mld
```

The bundle is a zip containing `manifest.json`, the wheel, and (if you didn't pass `--no-frontend`) frontend assets. Inspect it:

```bash
unzip -l dist/hello-mint-0.1.0.mld | head -10
```

You'll install this exact bundle later in [Operations → Publishing](/sdk/operations/publishing).

## Where you've landed

You have a runnable analysis plugin that:

- Builds and installs cleanly (`mint build` produces a `.mld` bundle)
- Reads experiments via `PlatformContext` when integrated, returns a stub when standalone
- Has a passing unit test using `RecordingContext` from `mint_sdk.testing`
- Validates against `mint doctor`

## Next

→ [Tutorial 2 — Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — own a database schema
→ [Tutorial 3 — Adding a frontend](/sdk/tutorials/adding-a-frontend) — add a Vue UI on top of this backend
→ [Recipes](/sdk/recipes/) — patterns for the next features you'll add
