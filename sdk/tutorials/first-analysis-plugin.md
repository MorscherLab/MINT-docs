# Tutorial 1 - First Analysis Plugin

Build `hello-mint`, a small analysis plugin in `generated` mode. You write Python decorators. The SDK supplies the job API and a generated UI.

Time: 20 to 30 minutes. Prerequisite: the toolchain from [Install the toolchain](/sdk/install). The generated project has its own environment.

There is no `mint add job` command. To add a job to an existing plugin, write an `@job` method in the plugin class.

## 1. Scaffold the Project

```bash
mint init hello-mint \
  --name "Hello MINT" \
  --description "Hello world analysis plugin" \
  --mode generated \
  --type analysis \
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
| Plugin mode | `generated` |

The scaffold creates these files:

```text
hello-mint/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .gitignore
├── CLAUDE.md                 # Default; --ai-assistant codex writes AGENTS.md instead
├── README.md
├── pyproject.toml
├── src/
│   └── mint_plugin_hello_mint/
│       ├── __init__.py
│       └── plugin.py
└── tests/
    └── test_plugin.py
```

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
```

Both commands must pass before you change anything. A complete run of this step looks like this:

<Terminal title="~/plugins — zsh" :lines="[
  '$ mint init hello-mint --name \'Hello MINT\' --description \'Hello world analysis plugin\' --mode generated --type analysis --yes',
  'Creating mint-plugin-hello-mint in ~/plugins/hello-mint/ ...',
  '  pyproject.toml',
  '  src/mint_plugin_hello_mint/plugin.py',
  '  tests/test_plugin.py',
  '  CLAUDE.md',
  '  Initialized git repository',
  '  Running uv sync...',
  '[progress]',
  '$ cd hello-mint',
  '$ mint doctor --strict',
  '  [ok]  Runtime boot  lifespan and safe GET probes passed',
  '36/36 checks passed',
  '$ uv run pytest -q',
  '.                                                      [100%]',
  '1 passed in 0.66s',
]" />

## 2. Inspect the Plugin Class

Open `src/mint_plugin_hello_mint/plugin.py`. The main parts are:

```python
from mint_sdk import Metadata, Plugin, job, plugin


class HelloMint(Metadata):
    domain = "custom"
    title = "Hello MINT"
    icon = "M4 19h16M7 16V8m5 8V4m5 12v-6"
    ui = "generated"


@plugin(HelloMint)
class HelloMintPlugin(Plugin):
    @job()
    def analyze(self, value: float = 1.0) -> dict[str, float]:
        return {
            "input": value,
            "doubled": value * 2,
        }
```

| Declaration | What it declares |
|-------------|------------------|
| `Metadata` subclass | Plugin title, icon, pages, write set, settings model and `ui = "generated"` |
| `@plugin(HelloMint)` | Joins the class to its `Metadata` |
| `@job()` | A typed calculation the runtime can submit, track, cancel, and render. `@job(Spec)` takes a `Job` subclass with options such as `cpu` or `access` |

The package name and dependency constraints live in `pyproject.toml`. The scaffold uses `dynamic = ["version"]` with `hatch-vcs`; Git tags supply the package version. Before the first tag, Git supplies a development version such as `0.1.1.dev0+d20261128`. `0.1.0` is the fallback only when no Git metadata is available. The plugin name is the key of the `mint.plugins` entry point; do not duplicate package identity inside the class. The route prefix defaults to `/hello-mint`. See [packaging](/sdk/operations/packaging) for bundle and release versioning.

`Metadata.writes` defaults to `{"artifacts"}`: the plugin can write its own analysis results when integrated, but cannot create experiments or change design data. The sample calculation uses no platform data and saves no experiment artifact. A generated form alone does not authorize access to experiments; platform authentication is on by default (`auth = True`).

## 3. Run the Job Test

Open `tests/test_plugin.py`:

```python
from mint_sdk.testing import Harness

from mint_plugin_hello_mint.plugin import HelloMintPlugin


def test_generated_manifest_exposes_job() -> None:
    with Harness(HelloMintPlugin) as harness:
        run = harness.run(HelloMintPlugin.analyze, value=2.5)

    assert run.value == {"input": 2.5, "doubled": 5.0}
```

`Harness` starts the real standalone plugin app, submits the job through the SDK job API, waits until it completes and returns a `Run` with the result. This test finds more integration errors than a direct call to `HelloMintPlugin().analyze()`.

Run the test:

```bash
uv run pytest -q
```

## 4. Make the Job More Real

Replace `analyze()` with a normalization example that accepts finite, nonnegative intensities. Replace the imports at the top of `plugin.py` with this block, and add the `Intensity` type and the `Normalize` job spec below it. `mint lint` sorts `mint_sdk` and `pydantic` into one third-party import group:

```python
from typing import Annotated

from mint_sdk import Job, Metadata, Plugin, job, plugin
from pydantic import Field

Intensity = Annotated[float, Field(ge=0, allow_inf_nan=False)]


class Normalize(Job):
    title = "Normalize intensities"
    description = "Divide every value by the largest submitted intensity."
    cpu = 1
```

Then replace the method inside `HelloMintPlugin`:

```python
@job(Normalize)
def analyze(
    self,
    values: Annotated[list[Intensity], Field(min_length=1)],
) -> dict[str, object]:
    maximum = max(values)
    normalized = [value / maximum if maximum else 0.0 for value in values]
    return {
        "count": len(values),
        "maximum": maximum,
        "normalized": normalized,
    }
```

The job schema rejects empty lists, negative intensities, and non-finite values. All-zero inputs produce zeros instead of a division error. Nothing replaces an explicitly submitted empty list with sample data.

Update `tests/test_plugin.py`:

```python
import pytest
from mint_sdk.testing import Harness

from mint_plugin_hello_mint.plugin import HelloMintPlugin


@pytest.mark.parametrize(
    ("values", "expected"),
    [
        ([2.0, 4.0, 8.0], {
            "count": 3, "maximum": 8.0, "normalized": [0.25, 0.5, 1.0],
        }),
        ([0.0, 0.0], {
            "count": 2, "maximum": 0.0, "normalized": [0.0, 0.0],
        }),
    ],
)
def test_analyze_values_normalized(values: list[float], expected: dict[str, object]) -> None:
    with Harness(HelloMintPlugin) as harness:
        run = harness.run(HelloMintPlugin.analyze, values=values)

    assert run.value == expected
```

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
```

Generated controls handle numeric arrays, nullable and empty inputs, fixed literals and numeric bounds. The backend validators decide which values the job accepts. A failed custom Pydantic validation returns 422.

## 5. Preview the Generated UI

Start the standalone runtime:

```bash
mint dev
```

By default the plugin backend serves:

```text
http://127.0.0.1:8003/api/hello-mint
```

Because the `Metadata` sets `ui = "generated"`, the same process also serves the generated workspace below the plugin route prefix:

```text
http://127.0.0.1:8003/hello-mint
```

Open the workspace in a browser. **Values** is a tag field: type one value, press Enter, and repeat for each value. A comma-separated line is one tag, and the job returns **Validation error**. Click **Run analysis**. The result card shows the returned JSON.

![Generated hello-mint workspace with the Normalize intensities form in the Parameters sidebar and the JSON result of a completed job](/screenshots/sdk/first-analysis-plugin-generated-workspace.webp)

The generated UI fits a plugin that has typed inputs and a result. For a custom layout, multi-step interaction, live previews or a domain control such as a plate map, use `standard` mode in [Tutorial 2](/sdk/tutorials/adding-a-frontend).

## 6. Build the Bundle

Run the release checks that CI also runs:

```bash
mint doctor --strict
uv run mint lint
uv run pytest -q
mint build
```

`mint lint` runs ruff with the SDK preset and the MINT design rules. A new plugin passes with no finding; see [`mint lint`](/sdk/api/cli-reference#mint-lint).

The bundle lands in:

```text
dist/mint-plugin-hello-mint-<version>.mint
```

A `.mint` bundle contains the plugin wheel, the manifest and the frontend assets, if any. A generated-mode plugin has no `frontend/` directory, because the SDK supplies the UI.

## 7. Verify and deploy

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying).

## Next

- [Tutorial 2 - Adding a frontend](/sdk/tutorials/adding-a-frontend): build a custom Vue workspace in `standard` mode.
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables): own a database schema.
