# R integration

## Goal

Run an R analysis from a Python plugin, with validated input and output, and save the result as a platform artifact.

The SDK's `RAnalysisBridge` keeps FastAPI and Pydantic as the plugin contract and runs R as a child process:

```text
Rscript <script.R> <input.json> <output.json>
```

The bridge validates the input model, writes it to `input.json`, runs the script, and validates `output.json` against the output model. It also enforces a timeout, stops the whole R process group on cancellation, and records provenance.

## Scaffold it

```bash
uv run mint add r-analysis dose_response --generate
uv run mint doctor --r
```

`mint add r-analysis NAME` writes:

| File | Content |
|------|---------|
| `src/<module>/schemas/<name>_r.py` | Request and response Pydantic models |
| `src/<module>/services/<name>_r.py` | A cached `RAnalysisBridge` with `RScriptSpec` |
| `src/<module>/routers/<name>_r.py` | `POST /run/{experiment_id}`, registered on the plugin |
| `src/<module>/r_scripts/<name>.R` | Starter script |
| `src/<module>/r_scripts/mint_bridge.R` | Helpers: `mint_read_input()`, `mint_parameter()`, `mint_write_output()`, `mint_experiment_id()`, `mint_artifact_dir()` |
| `r-requirements.txt` | `jsonlite` |

Other options: `--script PATH` uses an existing script, `--generate` regenerates the frontend contract, and `--page` adds a starter Vue page. `mint doctor --r` checks that `Rscript` is found, that `jsonlite` is declared (in `renv.lock` or `r-requirements.txt`), and that scripts can find `mint_bridge.R`.

## Define the bridge

```python
# src/my_plugin/services/dose_response_r.py
from pathlib import Path

from pydantic import BaseModel
from mint_sdk import RAnalysisBridge, RScriptSpec


class DoseResponseInput(BaseModel):
    doses: list[float]
    response: list[float]


class DoseResponseFit(BaseModel):
    IC50: float
    slope: float
    top: float
    bottom: float


bridge = RAnalysisBridge(
    RScriptSpec(
        script="r_scripts/dose_response.R",
        working_dir=str(Path(__file__).resolve().parents[1]),  # the package root
        input_schema=DoseResponseInput,
        output_schema=DoseResponseFit,
        timeout_seconds=120,
    )
)
```

| `RScriptSpec` field | Default | Meaning |
|---------------------|---------|---------|
| `script` | required | Script path, relative to `working_dir` unless absolute |
| `working_dir` | current directory | Child working directory and base for relative paths |
| `input_schema` / `output_schema` | required | Pydantic models for `input.json` / `output.json` |
| `timeout_seconds` | `600` | Hard limit; the process group is killed and `RBridgeError` is raised |
| `executable` | `MINT_RSCRIPT`, then `Rscript` on `PATH` | R executable |
| `extra_args` | `[]` | Appended after the two JSON paths |
| `artifact_dir` | none | Directory exposed to R as `MINT_R_ARTIFACT_DIR` |

Only JSON input and output are supported.

## Write the R script

```r
# src/my_plugin/r_scripts/dose_response.R
source("r_scripts/mint_bridge.R")

input <- mint_read_input()   # argv[1] or MINT_R_INPUT
fit <- nls(response ~ bottom + (top - bottom) / (1 + (dose / IC50)^slope),
           data = list(dose = input$doses, response = input$response),
           start = list(bottom = 0, top = 100, IC50 = median(input$doses), slope = 1))

mint_write_output(as.list(coef(fit)))   # argv[2] or MINT_R_OUTPUT
```

The script receives the input and output paths as `argv[1]` and `argv[2]`, also exposed as `MINT_R_INPUT` and `MINT_R_OUTPUT`. `MINT_EXPERIMENT_ID` is set when you pass `experiment_id`. Write the output file; stdout is kept only for logs.

## Call it from a route or job

```python
from mint_sdk import AnalysisPlugin, CurrentExperiment, endpoint

from my_plugin.services.dose_response_r import DoseResponseFit, DoseResponseInput, bridge


class MyPlugin(AnalysisPlugin):
    @endpoint.post("/experiments/{experiment_id}/dose-response")
    async def fit_dose_response(
        self, body: DoseResponseInput, experiment: CurrentExperiment,
    ) -> DoseResponseFit:
        fit = await bridge.run(payload=body, experiment_id=experiment.id)
        await self.save_analysis_artifact(
            experiment.id,
            {"fit": fit.model_dump(), "elapsed_s": bridge.last_run.elapsed_seconds},
            artifact_key="dose-response",
            display_name="Dose-response fit",
        )
        return fit
```

For long fits, call the bridge inside a `@job` and pass the job context as `bridge.run(payload=..., context=context)`. On cancellation, the bridge stops the R process group and raises `asyncio.CancelledError`. See [Writing results](/sdk/recipes/writing-results) for artifact keys and run history.

## Environment, errors and provenance

- **Environment.** The R child does not inherit the plugin environment. Only `PATH`, `HOME`, `LANG`, `TMPDIR`, `LC_*` and `R_*` pass through, plus the `MINT_R_*` and `MINT_EXPERIMENT_ID` variables the bridge sets. Plugin tokens and database or S3 credentials stay in the parent. Pass anything else explicitly: `bridge.run(payload=..., extra_env={"MY_TOOL_HOME": "/opt/tool"})`.
- **Errors.** Input validation, a missing script or executable, a non-zero exit, a timeout, a missing output file and output validation all raise `RBridgeError` (code `R_BRIDGE_ERROR`). The error details that reach API clients contain only the last part of stderr (`stderr_tail`) and never stdout. The full stdout and stderr go to the plugin log.
- **Provenance.** `bridge.last_run` is an `RRunProvenance` with the executable, script, paths, exit code, elapsed time and full output. Store what you need for reproducibility in the artifact payload.

## Packaging and deployment

With the scaffold's `[tool.hatch.build.targets.wheel] packages = ["src/<module>"]`, the files under `src/<module>/r_scripts/` ship inside the wheel. Check with `unzip -l` on the built wheel. Setting `working_dir` from `Path(__file__)`, as above, resolves the script in the installed package.

The SDK does not install R or R packages. Install `Rscript` and the packages your script loads (at least `jsonlite`) on the platform host or image, or set `MINT_RSCRIPT`. See [Deploying](/sdk/operations/deploying#native-libraries-and-offline-installs).

## Testing R-backed routes

Replace the bridge in unit tests. Run the real script only where R is installed:

```python
from unittest.mock import AsyncMock

from my_plugin.services import dose_response_r
from my_plugin.services.dose_response_r import DoseResponseFit


async def test_fit_uses_bridge_output(monkeypatch):
    fit = DoseResponseFit(IC50=1.5, slope=1.2, top=100, bottom=0)
    monkeypatch.setattr(dose_response_r.bridge, "run", AsyncMock(return_value=fit))
    assert await dose_response_r.bridge.run(payload={"doses": [1.0], "response": [50.0]}) == fit
```

For integration tests, install R in CI (for example with `r-lib/actions/setup-r`) and cache the R library.

## Notes

- `rpy2`, which embeds R in the plugin process, is not part of the SDK. It shares one interpreter across all requests, and an R crash takes down the plugin process. Prefer the bridge unless you have measured that per-call `Rscript` startup is the bottleneck.
- Use R only for R-specific libraries (`limma`, `DESeq2`, specialized statistics); each R dependency adds deployment work.

Source: [R bridge](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/r.py), [scaffold templates](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/add_r_templates.py).

## Related

- [Recipes → Writing results](/sdk/recipes/writing-results) — how the R output gets persisted
- [Recipes → Error handling](/sdk/recipes/error-handling) — typed errors and request IDs
- [Operations → Deploying](/sdk/operations/deploying) — installing R alongside MINT
