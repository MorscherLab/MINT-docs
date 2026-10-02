# MCP tools

Publish plugin methods to AI assistants connected to the platform's `/mcp` endpoint. The platform owns the MCP protocol; a plugin declares plain async methods with `@mcp_tool`, `@mcp_prompt` or `@mcp_resource`, and the SDK never imports `mcp`. Users connect an assistant with a personal access token as described in [AI Assistants and API Access](/guide/ai-and-api).

## Declare a tool

```python
from mint_sdk import AnalysisPlugin, ToolContext, mcp_tool, mint_plugin
from pydantic import BaseModel, Field


class FitArgs(BaseModel):
    experiment_id: int = Field(description="Experiment to fit")


class FitResult(BaseModel):
    ic50_um: float


@mint_plugin(analysis_type="dose-response", routes_prefix="/dose-response")
class DoseResponsePlugin(AnalysisPlugin):
    @mcp_tool(title="Fit dose-response curve", read_only=True)
    async def fit_curve(self, ctx: ToolContext, args: FitArgs) -> FitResult:
        """Fit a 4-parameter logistic curve to one experiment's design data."""
        design = await ctx.experiments.get_design_data(args.experiment_id)
        return FitResult(ic50_um=fit(design.data))
```

A tool method takes `(self, ctx: ToolContext, args: ArgsModel)` and returns a Pydantic model. The argument and return models become the tool's input and output schemas, and the docstring is the description the assistant reads.

```python
mcp_tool(
    *,
    title: str,
    read_only: bool,
    destructive: bool = False,
    idempotent: bool = False,
    timeout: float = 60,
    requires: str | None = None,
    requires_admin: bool = False,
)
```

| Argument | Meaning |
|---|---|
| `title` | Display name shown by MCP clients |
| `read_only` | Required. `True` when the tool changes nothing; read-only tokens can call only these tools |
| `destructive` | The tool may overwrite or remove data. A read-only tool cannot be destructive |
| `idempotent` | Repeating the call changes nothing more |
| `timeout` | Seconds before the call is stopped; at most 600 |
| `requires` | One extra platform permission the caller needs, such as `experiments.edit` |
| `requires_admin` | Only platform administrators can call the tool |

State the effect honestly: the flags become the MCP tool annotations that clients use to decide whether to ask the user before a call.

## `ToolContext`

| Member | Use |
|---|---|
| `actor` | The caller as a `PluginActor` (`user_id`, `permissions`, `has_permission()`, `is_platform_admin`) |
| `plugin_name` | This plugin's name |
| `experiments` | The plugin's experiment repository, scoped to the plugin and the caller like the plugin's REST routes; `None` when the plugin runs standalone |
| `deadline` | UTC time at which the call is stopped |
| `await report_progress(progress, total=None, message=None)` | Progress notification to the MCP client; dropped when no client listens |
| `await save_artifact(experiment_id, key, result, *, display_name=None, note=None, replace=False)` | Save `result` as this plugin's analysis artifact `key`; fails if the key exists unless `replace=True` |

The platform calls a plugin with the caller's identity, never with the caller's token. An in-process plugin receives the caller as its request actor; a plugin in its own process is called with its internal token and the same identity headers the plugin proxy sends.

## Declare prompts and resources

```python
import json

from mint_sdk import AnalysisPlugin, PromptMessage, ToolContext, mcp_prompt, mcp_resource
from pydantic import BaseModel


class SummaryArgs(BaseModel):
    experiment_id: str


class DoseResponsePlugin(AnalysisPlugin):
    @mcp_prompt(title="Summarize a dose-response run")
    async def summarize_run(self, args: SummaryArgs) -> list[PromptMessage]:
        """Ask the assistant to summarize one run's fit quality."""
        return [PromptMessage(role="user", text=f"Summarize the fit for experiment {args.experiment_id}.")]

    @mcp_resource("fits/{experiment_id}", title="Stored fit", mime_type="application/json")
    async def stored_fit(self, ctx: ToolContext, experiment_id: int) -> str:
        """The latest fit parameters for one experiment as JSON."""
        artifact = await ctx.experiments.get_analysis_artifact(experiment_id, ctx.plugin_name)
        return json.dumps(artifact.result if artifact else {})
```

| Decorator | Method shape | Published as |
|---|---|---|
| `@mcp_prompt(*, title=None)` | `async def name(self, args: ArgsModel) -> str \| list[PromptMessage]`, or `async def name(self)` | Prompt `<plugin>_<name>` |
| `@mcp_resource(path, *, title=None, mime_type="text/plain")` | `async def name(self, ctx: ToolContext, param: T) -> str \| bytes` | Resource template `mint://plugins/<plugin>/<path>` |

Prompt arguments arrive as strings and are validated into the model. A returned `str` becomes one user message.

A resource `path` is relative and names its parameters as `{param}`, or `{+param}` to span `/`. The placeholders must match the method's parameters after `ctx`; each value is converted to its annotation. Return `str` for text and `bytes` for binary content. A resource read is stopped after 60 seconds.

## Names

The platform publishes tools and prompts as `<plugin>_<name>`, where `<plugin>` is the plugin's `metadata.name` (its package name) lowercased with every run of other characters replaced by `_` (a plugin named `dose-response` publishes `dose_response_fit_curve`). Method names must be lowercase `[a-z0-9_]`, starting with a letter, and the published name must fit in 64 characters. The `mint_` prefix is reserved for the platform's own tools, and a name another plugin already published is refused.

If any declaration is invalid, the platform publishes none of the plugin's MCP declarations. `mint doctor` checks names, docstrings, signatures and schemas before you ship.

## Permissions

Every plugin tool, prompt and resource needs `plugins.use` and a role that can see the plugin. A tool adds its own `requires` permission or `requires_admin`. A caller with a read-only token can call only tools declared `read_only=True`. Write calls are recorded in the audit log as `mcp.tool_call`.

`ctx.experiments` applies the plugin's write capabilities and the caller's experiment visibility. Check anything else the tool needs, such as a plugin role, from `ctx.actor`.

## Limits

The platform treats plugin output as untrusted:

- A tool result must match its output schema and fit in 20,000 JSON characters; a larger result is refused with a message telling the assistant to ask for less. Save large outputs with `ctx.save_artifact()` and return a summary.
- A rendered prompt must fit in 20,000 characters.
- A resource must be at most 5 MiB.
- Titles, descriptions and schemas are truncated or rejected when they are too long, and a plugin error reaches the caller as a short message only.

Plugins built on SDKs older than MINT 1.3 publish nothing. The platform picks up an enabled plugin's declarations when the MCP endpoint starts and rechecks every 15 seconds, so a plugin process that starts late or changes its declarations is published without a platform restart.

`@job` methods need no MCP declaration: the platform's job tools (`mint_start_job` and the related tools) offer every job the plugin declares.

## Test a tool

`mint dev` prints the plugin's tools under their published names and a `mint mcp call` line to try one. With the dev server running, call a tool with its arguments from a JSON file:

```bash
echo '{"experiment_id": 42}' > args.json
uv run mint mcp call fit_curve --json args.json
```

`mint mcp call` takes the method name, not the published name. The dev server runs standalone: the tool sees the standalone actor and `ctx.experiments` is `None`. Flags: [CLI reference](/sdk/api/cli-reference#mint-mcp).

For unit tests, call the tool through the SDK as the `mint init` scaffold does:

```python
import asyncio

from mint_sdk import PluginActor
from mint_sdk.mcp_tools import call_tool

from my_plugin.plugin import MyPlugin


def test_double_value_returns_a_real_result() -> None:
    result = asyncio.run(
        call_tool(MyPlugin(), "double_value", {"value": 2.5}, actor=PluginActor.standalone(), experiments=None)
    )

    assert result == {"input": 2.5, "doubled": 5.0}
```

`call_tool()` applies the same argument validation, permission checks, timeout and output validation as the platform. Test a tool that uses `ctx.experiments` against a disposable platform, or pass `RecordingContext().get_experiment_repository()` as `experiments` (see [Testing plugins](/sdk/recipes/testing-plugins)).

Verified against [v@MINT_VERSION@ `mcp_tools.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/mcp_tools.py) and [platform publishing](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/mcp/plugin_tools.py).

- [AI Assistants and API Access](/guide/ai-and-api)
- [Route permissions](/sdk/recipes/route-permissions)
- [Python SDK reference](/sdk/api/python#mcp-declarations)
