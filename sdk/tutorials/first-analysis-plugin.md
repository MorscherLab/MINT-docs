# Tutorial 1 - First analysis plugin

You'll build a minimal analysis plugin called **hello-mint**. It starts from the SDK's `analysis-basic` template, exposes a health route, then turns the generated placeholder analysis route into a small experiment-aware endpoint.

By the end you will have:

- A real `mint init` project with the current `routers/`, `schemas/`, and `services/` layout
- A route that reads an experiment through `PlatformContext` when the plugin is installed by the platform
- A route test that runs without a full platform
- A `.mint` bundle ready to install

**Time:** 30-45 minutes
**Prereqs:** Python 3.12+, `uv`, and the `mint` CLI from `mint-sdk`

## 1. Scaffold the project

Create a backend-only analysis plugin first. Frontend scaffolding is on by default, so this tutorial passes `--no-frontend`; the frontend is added in [Tutorial 2](/sdk/tutorials/adding-a-frontend).

```bash
mint init hello-mint \
  --name "Hello MINT" \
  --description "Hello world analysis plugin" \
  --type analysis \
  --template analysis-basic \
  --no-frontend \
  --yes
cd hello-mint
```

`mint init` derives several names from the human name:

| Name | Value |
|------|-------|
| Distribution package | `mint-plugin-hello-mint` |
| Python module | `mint_plugin_hello_mint` |
| Plugin class | `HelloMintPlugin` |
| Route prefix | `/hello-mint` |
| Entry point | `hello-mint = "mint_plugin_hello_mint.plugin:HelloMintPlugin"` |

The generated tree should look like this:

```text
hello-mint/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .gitignore
├── CHANGELOG.md
├── CLAUDE.md
├── pyproject.toml
├── README.md
├── scripts/
│   ├── build.sh
│   ├── dev.sh
│   └── release.sh
├── src/
│   └── mint_plugin_hello_mint/
│       ├── __init__.py
│       ├── plugin.py
│       ├── routers/
│       │   ├── __init__.py
│       │   └── analysis.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── requests.py
│       │   └── responses.py
│       └── services/
│           ├── __init__.py
│           └── analysis_service.py
└── tests/
    ├── __init__.py
    └── test_plugin.py
```

`CLAUDE.md` is generated because `--yes` accepts the default AI-assistant choice. Keep that default while following this tutorial. If `mint doctor` says it is missing current SDK guidance, run `mint doctor --fix` once to refresh it. If you pass `--ai-assistant none`, the current SDK will scaffold no assistant file and `mint doctor` will report the missing AI instructions as a failing check; `mint doctor --fix` creates `AGENTS.md`.

Checkpoint:

```bash
mint doctor --fix
uv run pytest -q
```

Both should pass before you change anything.

## 2. Inspect the generated plugin

The plugin class owns metadata, lifecycle, and router registration. This snippet is trimmed to the parts you need to read first; keep the generated singleton, frontend, and health-check helpers in the file.

```python
# src/mint_plugin_hello_mint/plugin.py
class HelloMintPlugin(AnalysisPlugin):
    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="hello-mint",
            version=PLUGIN_VERSION,
            description="Hello world analysis plugin",
            analysis_type="custom",
            routes_prefix="/hello-mint",
            plugin_type=PluginType.ANALYSIS,
            capabilities=PluginCapabilities(
                requires_auth=False,
                requires_database=False,
                requires_experiments=False,
            ),
            nav_items=[
                PluginNavItem(path="/", label="Dashboard", id="dashboard"),
                PluginNavItem(path="/analysis", label="Analysis", id="analysis"),
            ],
        )

    async def initialize(self, context: PlatformContext | None = None) -> None:
        self._context = context

    def get_routers(self) -> list[tuple[APIRouter, str]]:
        return [(analysis.router, "")]
```

The generated router already has a health endpoint and a placeholder analysis endpoint:

```python
# src/mint_plugin_hello_mint/routers/analysis.py
@router.get("/health")
async def health():
    return {"status": "healthy", "plugin": "hello-mint"}


@router.post("/analyze/{experiment_id}", response_model=AnalyzeResponse)
async def analyze(experiment_id: int, request: AnalyzeRequest) -> AnalyzeResponse:
    service = analysis_service.get_analysis_service()
    return await service.analyze(experiment_id, request)
```

Run it:

```bash
mint dev
```

In another terminal:

```bash
curl http://127.0.0.1:8003/api/hello-mint/health
# {"status":"healthy","plugin":"hello-mint"}
```

Stop the server with **Ctrl+C** before continuing.

## 3. Ask for platform access

An analysis plugin can read experiments, but only if it declares the capabilities. In `plugin.py`, change the capability block:

```python
# src/mint_plugin_hello_mint/plugin.py
capabilities=PluginCapabilities(
    requires_auth=True,
    requires_database=True,
    requires_experiments=True,
),
```

`PluginType.ANALYSIS` keeps experiment access read-only. This plugin can fetch experiments and save its own analysis results, but it cannot create, update, or delete experiments.

## 4. Make the response useful

Replace the generated response schema:

```python
# src/mint_plugin_hello_mint/schemas/responses.py
from pydantic import BaseModel


class AnalyzeResponse(BaseModel):
    experiment_id: int
    status: str
    template: str
    hint: str
    experiment_name: str | None = None
    experiment_status: str | None = None
    parameter_count: int = 0
```

The route will now return enough information to prove it read the experiment and counted the submitted parameters.

## 5. Inject a plugin-aware service

Routes are module-level FastAPI functions, while `PlatformContext` lives on the plugin instance after `initialize()`. Use `PluginDependency` to connect those two pieces without package globals.

Replace the router:

```python
# src/mint_plugin_hello_mint/routers/analysis.py
from fastapi import APIRouter, Depends
from mint_sdk.app import PluginDependency

from mint_plugin_hello_mint.schemas.requests import AnalyzeRequest
from mint_plugin_hello_mint.schemas.responses import AnalyzeResponse
from mint_plugin_hello_mint.services.analysis_service import AnalysisService

router = APIRouter(tags=["analysis"])
analysis_service_dep = PluginDependency[AnalysisService]("AnalysisService")


@router.get("/health")
async def health():
    return {"status": "healthy", "plugin": "hello-mint"}


@router.post("/analyze/{experiment_id}", response_model=AnalyzeResponse)
async def analyze(
    experiment_id: int,
    request: AnalyzeRequest,
    service: AnalysisService = Depends(analysis_service_dep),
) -> AnalyzeResponse:
    return await service.analyze(experiment_id, request)
```

Replace the service:

```python
# src/mint_plugin_hello_mint/services/analysis_service.py
from typing import TYPE_CHECKING

from fastapi import HTTPException, status

from mint_plugin_hello_mint.schemas.requests import AnalyzeRequest
from mint_plugin_hello_mint.schemas.responses import AnalyzeResponse

if TYPE_CHECKING:
    from mint_plugin_hello_mint.plugin import HelloMintPlugin


class AnalysisService:
    def __init__(self, plugin: "HelloMintPlugin") -> None:
        self.plugin = plugin

    async def analyze(self, experiment_id: int, request: AnalyzeRequest) -> AnalyzeResponse:
        parameter_count = len(request.parameters)
        repo = (
            self.plugin.context.get_experiment_repository()
            if self.plugin.context is not None
            else None
        )

        if repo is None:
            return AnalyzeResponse(
                experiment_id=experiment_id,
                status="standalone",
                template="analysis-basic",
                hint="No PlatformContext; install the plugin in MINT to read real experiments.",
                parameter_count=parameter_count,
            )

        experiment = await repo.get_by_id(experiment_id)
        if experiment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Experiment {experiment_id} not found",
            )

        result = {
            "experiment": {
                "id": experiment.id,
                "name": experiment.name,
                "status": experiment.status,
                "experiment_type": experiment.experiment_type,
            },
            "parameters": request.parameters,
        }
        await self.plugin.save_analysis(experiment_id, result)

        return AnalyzeResponse(
            experiment_id=experiment.id,
            status="ok",
            template="analysis-basic",
            hint="Saved a small analysis result through PluginDataRepository.",
            experiment_name=experiment.name,
            experiment_status=experiment.status,
            parameter_count=parameter_count,
        )
```

Wire the dependency during plugin initialization. Add the imports near the top of `plugin.py`, then update only `initialize()` and `shutdown()`; keep the rest of the generated class intact.

```python
# src/mint_plugin_hello_mint/plugin.py
from mint_plugin_hello_mint.routers.analysis import analysis_service_dep
from mint_plugin_hello_mint.services.analysis_service import AnalysisService


class HelloMintPlugin(AnalysisPlugin):
    # ... metadata and get_routers as generated ...

    async def initialize(self, context: PlatformContext | None = None) -> None:
        self._context = context
        analysis_service_dep.set(AnalysisService(self))
        mode = "integrated" if context else "standalone"
        print(f"[{PLUGIN_NAME}] Initialized in {mode} mode")

    async def shutdown(self) -> None:
        analysis_service_dep.reset()
        print(f"[{PLUGIN_NAME}] Shutting down...")
```

Checkpoint:

```bash
uv run ruff check .
uv run pytest -q
```

If the generated test still expects `status == "not_implemented"`, update it in the next step.

## 6. Update the route test

The route should still work without a platform. In standalone mode, it returns a clear fallback instead of trying to read a real experiment.

```python
# tests/test_plugin.py - replace test_analyze_route
def test_analyze_route(self):
    payload = {"parameters": {"threshold": "0.5"}}

    with _create_test_client() as client:
        response = client.post("/api/hello-mint/analyze/42", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["experiment_id"] == 42
    assert body["status"] == "standalone"
    assert body["template"] == "analysis-basic"
    assert body["parameter_count"] == 1
```

Run:

```bash
uv run pytest -q
```

## 7. Run standalone

```bash
mint dev
```

In another terminal:

```bash
curl -X POST http://127.0.0.1:8003/api/hello-mint/analyze/42 \
  -H "Content-Type: application/json" \
  -d '{"parameters":{"threshold":"0.5"}}'
```

Expected shape:

```json
{
  "experiment_id": 42,
  "status": "standalone",
  "template": "analysis-basic",
  "hint": "No PlatformContext; install the plugin in MINT to read real experiments.",
  "experiment_name": null,
  "experiment_status": null,
  "parameter_count": 1
}
```

This proves the route, request schema, response schema, and service wiring all work without platform setup.

## 8. Run through the platform dev proxy

From the plugin root:

```bash
mint dev --platform
```

The startup summary includes the actual ports. By default:

```text
Platform backend   http://localhost:8001
Plugin backend     http://127.0.0.1:8003/api/hello-mint
Proxy              /hello-mint -> http://localhost:8003
```

Call the route through the platform:

```bash
curl -X POST http://127.0.0.1:8001/api/hello-mint/analyze/1 \
  -H "Content-Type: application/json" \
  -d '{"parameters":{"threshold":"0.5"}}'
```

This verifies that the platform can route to your dev plugin and show it in plugin navigation. The plugin process is still the standalone dev server, so `PlatformContext` is still `None` and the response stays in standalone mode:

```json
{
  "experiment_id": 1,
  "status": "standalone",
  "template": "analysis-basic",
  "hint": "No PlatformContext; install the plugin in MINT to read real experiments.",
  "experiment_name": null,
  "experiment_status": null,
  "parameter_count": 1
}
```

When the plugin is installed and loaded by MINT from its `mint.plugins` entry point, the platform calls `initialize(context)`. In that integrated mode the same route can read experiments, save analysis results, and return a 404 for a missing experiment.

## 9. Validate and build

Run the project checks:

```bash
mint doctor --fix
uv run pytest -q
```

Build the installable bundle:

```bash
mint build
# dist/*.mint
```

The `.mint` file contains the plugin wheel and manifest. If you add a frontend later, `mint build` also builds `frontend/dist/` and includes those assets inside the wheel.

## Where you've landed

You have a runnable analysis plugin that:

- Uses the current `mint init` scaffold
- Serves `/api/hello-mint/health`
- Serves `/api/hello-mint/analyze/{experiment_id}`
- Reads experiments through `PlatformContext` in integrated mode
- Saves a small analysis result through `save_analysis`
- Falls back cleanly in standalone mode
- Passes tests and builds into a `.mint` bundle

## Next

- [Tutorial 2 - Adding a frontend](/sdk/tutorials/adding-a-frontend) - add a Vue UI on top of this backend
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) - own a database schema
- [Recipes](/sdk/recipes/) - patterns for the next features you'll add
