# R integration

## Goal

Run an R analysis from inside a Python plugin and ship the result back into the platform's data model.

Two viable patterns:

| Pattern | When |
|---------|------|
| **`rpy2`** — embed R inside the Python process | Frequent calls; small payloads; full data marshaling |
| **Subprocess + `Rscript`** — run R as a child process | Occasional calls; large payloads; the R script is self-contained |

Pick subprocess for most cases — it's simpler, isolates failures, and avoids R-Python ABI hazards. Reach for `rpy2` only when call latency matters or you need fine-grained data type marshaling.

## Subprocess pattern

```python
# src/my_plugin/r_runner.py
import asyncio
import json
import shutil
from pathlib import Path

from mint_sdk import ConfigurationException


def _ensure_rscript() -> str:
    rscript = shutil.which("Rscript")
    if rscript is None:
        raise ConfigurationException(
            "Rscript not found on PATH. Install R or set the script path explicitly.",
            config_key="rscript_path",
        )
    return rscript


async def run_r_script(
    script: Path,
    *,
    input_data: dict,
    timeout_s: int = 60,
) -> dict:
    rscript = _ensure_rscript()
    payload = json.dumps(input_data)

    process = await asyncio.create_subprocess_exec(
        rscript, "--vanilla", str(script),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        stdout, stderr = await asyncio.wait_for(
            process.communicate(input=payload.encode()),
            timeout=timeout_s,
        )
    except asyncio.TimeoutError:
        process.kill()
        raise

    if process.returncode != 0:
        raise RuntimeError(
            f"R script failed (exit {process.returncode}):\n"
            + stderr.decode(errors="replace")
        )

    return json.loads(stdout.decode())
```

```r
# scripts/dose_response_fit.R
library(jsonlite)

# Read JSON from stdin
input <- fromJSON(file("stdin", "r"), simplifyVector = TRUE)

doses    <- input$doses
response <- input$response

fit <- nls(response ~ bottom + (top - bottom) / (1 + (dose/IC50)^slope),
           data = list(dose=doses, response=response),
           start = list(bottom=0, top=100, IC50=median(doses), slope=1))

result <- list(
  IC50  = unname(coef(fit)["IC50"]),
  slope = unname(coef(fit)["slope"]),
  top   = unname(coef(fit)["top"]),
  bottom = unname(coef(fit)["bottom"])
)

cat(toJSON(result, auto_unbox = TRUE))
```

```python
# src/my_plugin/plugin.py
from pathlib import Path
from my_plugin.r_runner import run_r_script

class MyPlugin(AnalysisPlugin):
    async def fit_dose_response(self, experiment_id: int, doses: list[float],
                                 response: list[float]):
        script = Path(__file__).parent.parent / "scripts" / "dose_response_fit.R"
        result = await run_r_script(script,
                                    input_data={"doses": doses, "response": response})
        await self.save_analysis(experiment_id, {"fit": result})
        return result
```

## `rpy2` pattern

`rpy2` embeds R into the Python process. It's faster per call (~ms instead of ~100ms for a fresh `Rscript` startup) but harder to debug and reproduce.

```python
# src/my_plugin/r_inproc.py
from rpy2 import robjects
from rpy2.robjects import pandas2ri
from rpy2.robjects.packages import importr

pandas2ri.activate()
base = importr("base")
stats = importr("stats")


def fit_lm(x, y):
    df = pandas2ri.py2rpy({"x": x, "y": y})
    model = stats.lm("y ~ x", data=df)
    return {
        "coef": list(stats.coef(model)),
        "r_squared": float(stats.summary_lm(model).rx2("r.squared")[0]),
    }
```

::: warning rpy2 deployment caveats
`rpy2` requires R installed at build time and at runtime, with matching versions. In Docker deployments, install R in the image alongside Python. In direct installs, mark R as an explicit dependency in your plugin's README.
:::

## Packaging the R scripts

Ship the `.R` files inside your plugin package so they're available in installed wheels:

```toml
# pyproject.toml
[tool.hatch.build]
include = [
    "src/my_plugin/**/*.py",
    "src/my_plugin/scripts/*.R",       # ← R scripts
]

[tool.hatch.build.targets.wheel]
packages = ["src/my_plugin"]
```

Or for `setuptools`, use `package_data`. Either way, reference the script via `Path(__file__).parent / "scripts" / "...R"`.

## Standalone vs integrated

The pattern works in both modes — neither `rpy2` nor `Rscript` cares about the platform context. In standalone mode, the analysis still runs and `save_analysis` no-ops; in integrated mode, the result lands in `PluginAnalysisResult`.

## Performance considerations

| Concern | Subprocess | rpy2 |
|---------|-----------|------|
| Startup cost | ~100–300 ms per call (R interpreter spin-up) | ~0 ms (R initialized once at plugin start) |
| Memory | Forked process, dies after | Long-lived in plugin process |
| Crash blast radius | Subprocess only | Plugin process — affects every other route |
| Concurrency | Per-call subprocess | One global R interpreter (GIL-equivalent — serialize calls) |

For analyses that run on the order of seconds, subprocess overhead is negligible. For sub-second analyses called many times per request, rpy2 wins.

## Testing R-backed routes

For unit tests, mock the R call:

```python
import pytest
from unittest.mock import AsyncMock


@pytest.mark.asyncio
async def test_fit_dose_response_saves_result(plugin, monkeypatch):
    fake_result = {"IC50": 1.5, "slope": 1.2, "top": 100, "bottom": 0}
    monkeypatch.setattr(
        "my_plugin.plugin.run_r_script",
        AsyncMock(return_value=fake_result),
    )

    result = await plugin.fit_dose_response(
        experiment_id=1,
        doses=[0.1, 1.0, 10.0],
        response=[10, 50, 90],
    )
    assert result == fake_result
    saved = await plugin.load_analysis(1)
    assert saved.result["fit"] == fake_result
```

For integration tests, install R in your CI runner and let the real script run. Cache the R installation across CI runs — it's one of the slowest parts of the workflow.

## Notes

- `--vanilla` makes the R subprocess deterministic — no user `.Rprofile`, no saved workspace.
- Always feed input through stdin / structured JSON, not via command-line args. R's argument quoting on Windows is unreliable.
- For mathematical results that may be `Inf` / `NaN` / `null`, `jsonlite::toJSON` has options (`na = "string"`, `auto_unbox = TRUE`) — pin them so your plugin parser can rely on the shape.
- Don't use R for things Python can do natively — adding an R dependency raises the deployment cost. Reserve it for genuinely R-specific libraries (`limma`, `DESeq2`, specialized stats packages).

## Related

- [Recipes → Writing results](/sdk/recipes/writing-results) — how the R output gets persisted
- [Recipes → Error handling](/sdk/recipes/error-handling) — wrapping subprocess failures
- [Operations → Deploying](/sdk/operations/deploying) — installing R alongside MINT
