# Tutorial 1 - First Analysis Plugin

You'll build **hello-mint**, a small `ANALYSIS` plugin in `generated` mode. This is the shortest path to a useful first plugin: you write Python decorators, and the SDK supplies the standard job API plus a generated UI.

By the end you will have:

- A real `mint init --mode generated` project
- One typed `@job`
- A job test that uses the SDK runtime through `Harness`
- A `.mint` bundle ready to install

**Time:** 20-30 minutes
**Prereqs:** Python 3.14+, `uv`, and the MINT SDK 1.4. Install the CLI with `uv tool install "mint-sdk[cli]==@MINT_VERSION@"`; the generated project has its own environment.

::: info Current CLI shape
MINT v@MINT_VERSION@ does not have `mint add job`. Start a job-based plugin with `mint init --mode generated`, or add `@job` methods directly to an existing plugin class.
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

Both should pass before you change anything.

## 2. Inspect the Plugin Class

Open `src/mint_plugin_hello_mint/plugin.py`. The important parts look like this:

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

Three declarations do the work:

| Declaration | What it declares |
|-------------|------------------|
| `Metadata` subclass | Plugin title, icon, pages, write set, settings model and `ui = "generated"` |
| `@plugin(HelloMint)` | Joins the class to its `Metadata` |
| `@job()` | A typed calculation the runtime can submit, track, cancel, and render. `@job(Spec)` takes a `Job` subclass with options such as `cpu` or `access` |

The package name and dependency constraints live in `pyproject.toml`. The scaffold uses `dynamic = ["version"]` with `hatch-vcs`; Git tags supply the package version, with `0.1.0` as the fallback before a tag exists. The plugin name is the key of the `mint.plugins` entry point; do not duplicate package identity inside the class. The route prefix defaults to `/hello-mint`. See [packaging](/sdk/operations/packaging) for bundle and release versioning.

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

`Harness` starts the real standalone plugin app, submits the job through the SDK job API, waits for completion, and returns a `Run` with the result value. This catches more integration drift than calling `HelloMintPlugin().analyze()` directly.

Run it:

```bash
uv run pytest -q
```

## 4. Make the Job More Real

Replace `analyze()` with a normalization example that accepts finite, nonnegative intensities. Add these imports at the top of `plugin.py`:

```python
from typing import Annotated

from pydantic import Field

from mint_sdk import Job

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
def test_normalization(values: list[float], expected: dict[str, object]) -> None:
    with Harness(HelloMintPlugin) as harness:
        run = harness.run(HelloMintPlugin.analyze, values=values)

    assert run.value == expected
```

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
```

Generated controls handle numeric arrays, nullable/empty inputs, fixed literals
and numeric bounds. Backend validators still decide which values
are accepted; custom Pydantic validation failures return 422 responses.

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

> [Screenshot: generated hello-mint workspace showing the Normalize intensities job form and completed JSON result]

The generated UI is good when the plugin can be described as typed inputs plus result output. If the user experience needs custom layout, multi-step interaction, live previews, or a domain-specific control such as a plate map, use `standard` mode in [Tutorial 2](/sdk/tutorials/adding-a-frontend).

## 6. Build the Bundle

Run the release checks you should expect in CI:

```bash
mint doctor --strict
uv run pytest -q
mint build
```

The bundle lands in:

```text
dist/mint-plugin-hello-mint-<version>.mint
```

A `.mint` bundle contains the plugin wheel, manifest, and any bundled frontend assets. Generated-mode plugins usually have no `frontend/` directory because the UI is supplied by the SDK.

## 7. Verify and deploy

Check the real install path in a disposable platform container (requires Docker):

```bash
mint verify
```

`mint verify` builds the bundle, boots the MINT platform image, installs the bundle through the normal upload path, restarts, and waits until the plugin loads.

Then deploy to a test platform you administer:

```bash
mint platform auth login --url https://mint-test.example.org
mint deploy --to https://mint-test.example.org
```

`mint deploy` builds the same bundle, uploads it, restarts the platform, and confirms the restart by the new server `boot_id`. The restart requires the `platform.configure` permission; `--timeout` (default 180 s) covers the restart and the plugin load together. Use a test platform, not production.

## Where You've Landed

You now have a generated-mode analysis plugin that:

- Declares metadata with `Metadata` and `@plugin`
- Exposes one typed `@job`
- Lets the SDK provide the standard form/result UI
- Tests the real job runtime with `Harness`
- Builds into an installable `.mint` bundle

## Next

- [Tutorial 2 - Adding a frontend](/sdk/tutorials/adding-a-frontend) - build a custom Vue workspace with `standard` mode
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) - own a database schema
- [Recipes](/sdk/recipes/) - patterns for the next features you'll add
