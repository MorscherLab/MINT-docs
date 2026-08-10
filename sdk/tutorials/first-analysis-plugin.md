# Tutorial 1 - First Analysis Plugin

You'll build **hello-mint**, a small `ANALYSIS` plugin in `generated` mode. This is the shortest path to a useful first plugin: you write Python decorators, and the SDK supplies the standard job API plus a generated UI.

By the end you will have:

- A real `mint init --mode generated` project
- One typed `@job`
- A job test that uses the SDK runtime through `PluginTestHarness`
- A `.mint` bundle ready to install

**Time:** 20-30 minutes
**Prereqs:** Python 3.12+, `uv`, and the `mint` CLI from `mint-sdk`

::: info Current CLI shape
MINT v1.1.9 does not have `mint add job`. Start a job-based plugin with `mint init --mode generated`, or add `@job` methods directly to an existing plugin class.
:::

## 1. Scaffold the Project

Create the plugin:

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

The generated tree is intentionally small:

```text
hello-mint/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .gitignore
├── CLAUDE.md
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

Both should pass before you change anything.

## 2. Inspect the Plugin Class

Open `src/mint_plugin_hello_mint/plugin.py`. The important parts look like this:

```python
from mint_sdk import (
    AnalysisPlugin,
    PluginCapabilities,
    PluginType,
    generated_ui,
    job,
    mint_plugin,
)


@mint_plugin(
    analysis_type="custom",
    routes_prefix="/hello-mint",
    plugin_type=PluginType.ANALYSIS,
    capabilities=PluginCapabilities(),
    icon="M4 19h16M7 16V8m5 8V4m5 12v-6",
)
@generated_ui()
class HelloMintPlugin(AnalysisPlugin):
    @job(cpu=1)
    def analyze(self, value: float = 1.0) -> dict[str, float]:
        return {
            "input": value,
            "doubled": value * 2,
        }
```

Three decorators do the work:

| Decorator | What it declares |
|-----------|------------------|
| `@mint_plugin(...)` | Plugin metadata, route prefix, type, capabilities, icon, navigation, and optional settings model |
| `@generated_ui()` | The plugin uses the SDK-managed form/result workspace |
| `@job(...)` | A typed calculation the runtime can submit, track, cancel, and render |

The package name and dependency versions still live in `pyproject.toml`. Do not duplicate package identity inside the class.

## 3. Run the Job Test

Open `tests/test_plugin.py`:

```python
from mint_sdk.testing import PluginTestHarness

from mint_plugin_hello_mint.plugin import HelloMintPlugin


def test_generated_manifest_exposes_job() -> None:
    with PluginTestHarness(HelloMintPlugin) as harness:
        completed = harness.run("analyze", value=2.5)

    assert completed.value == {"input": 2.5, "doubled": 5.0}
```

`PluginTestHarness` starts the real standalone plugin app, submits the job through the SDK job API, waits for completion, and loads the standardized result payload. This catches more integration drift than calling `HelloMintPlugin().analyze()` directly.

Run it:

```bash
uv run pytest -q
```

## 4. Make the Job More Real

Replace `analyze()` with a small normalization example:

```python
@job(
    title="Normalize intensities",
    description="Divide every value by the largest value in the submitted list.",
    cpu=1,
)
def analyze(self, values: list[float] | None = None) -> dict[str, object]:
    submitted = values or [1.0, 2.0, 4.0]
    maximum = max(submitted) if submitted else 0.0
    normalized = [value / maximum for value in submitted] if maximum else []
    return {
        "count": len(submitted),
        "maximum": maximum,
        "normalized": normalized,
    }
```

Then update the test:

```python
def test_generated_manifest_exposes_job() -> None:
    with PluginTestHarness(HelloMintPlugin) as harness:
        completed = harness.run("analyze", values=[2.0, 4.0, 8.0])

    assert completed.value == {
        "count": 3,
        "maximum": 8.0,
        "normalized": [0.25, 0.5, 1.0],
    }
```

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
```

## 5. Preview the Generated UI

Start the standalone runtime:

```bash
mint dev
```

By default the plugin backend serves:

```text
http://127.0.0.1:8003/api/hello-mint
```

Because the plugin uses `@generated_ui()`, the same process also serves the generated workspace below the plugin route prefix:

```text
http://127.0.0.1:8003/hello-mint
```

> [Screenshot: generated hello-mint workspace showing the Normalize intensities job form and completed JSON result]

The generated UI is good when the plugin can be described as typed inputs plus result output. If the user experience needs custom layout, multi-step interaction, live previews, or a domain-specific control such as a plate map, use `standard` mode in [Tutorial 2](/sdk/tutorials/adding-a-frontend).

## 6. Build the Bundle

Run the release checks you should expect in CI:

```bash
mint doctor --strict
uv run pytest -q
mint build .
```

The bundle lands in:

```text
dist/hello-mint-<version>.mint
```

A `.mint` bundle contains the plugin wheel, manifest, and any bundled frontend assets. Generated-mode plugins usually have no `frontend/` directory because the UI is supplied by the SDK.

## Where You've Landed

You now have a generated-mode analysis plugin that:

- Declares metadata with `@mint_plugin`
- Exposes one typed `@job`
- Lets the SDK provide the standard form/result UI
- Tests the real job runtime with `PluginTestHarness`
- Builds into an installable `.mint` bundle

## Next

- [Tutorial 2 - Adding a frontend](/sdk/tutorials/adding-a-frontend) - build a custom Vue workspace with `standard` mode
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) - own a database schema
- [Recipes](/sdk/recipes/) - patterns for the next features you'll add
