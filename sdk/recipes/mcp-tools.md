# MCP tools

Publish plugin methods to AI assistants that connect to the platform `/mcp` endpoint. Declare plain async methods with `@tool`, `@prompt` or `@resource` from `mint_sdk.mcp`. The platform runs the MCP protocol; the SDK never imports `mcp`. For how users connect an assistant, see [AI Assistants and API Access](/guide/ai-and-api).

## Declare a tool

A tool has a spec class (a `Tool` subclass) and a method with `@tool(Spec)`.

```python
from mint_sdk import Plugin
from mint_sdk.mcp import Tool, ToolContext, tool
from pydantic import BaseModel, Field


class FitArgs(BaseModel):
    experiment_id: int = Field(description="Experiment to fit")


class FitResult(BaseModel):
    ic50_um: float


class FitCurve(Tool):
    title = "Fit dose-response curve"
    effect = "read"


class DoseResponsePlugin(Plugin):
    @tool(FitCurve)
    async def fit_curve(self, ctx: ToolContext, args: FitArgs) -> FitResult:
        """Fit a 4-parameter logistic curve to one experiment's design data."""
        design = await ctx.design.get(args.experiment_id)
        return FitResult(ic50_um=fit(design.data))
```

A tool method takes `(self, ctx: ToolContext, args: ArgsModel)` and returns a Pydantic model. The two models become the input and output schemas of the tool. The docstring is the description that the assistant reads.

| `Tool` option | Meaning |
|---|---|
| `effect` | Required. `"read"` changes nothing; read-only tokens can call only these tools. `"write"` changes data. `"destructive"` may overwrite or remove data |
| `title` | Display name shown by MCP clients (defaults to the method name in title case) |
| `idempotent` | Repeating the call changes nothing more. Defaults to `True` for `"read"` and `False` otherwise |
| `timeout` | Seconds before the call is stopped; at most 600 (default 60) |
| `access` | Who may call the tool: `"use"` (default), `"configure"` (adds `plugins.configure`) or `"admin"` (platform administrators) |
| `callers` | Plugins that may call the tool with `context.plugins.call`: a set of plugin names, or `"readers"` for every plugin that lists this plugin in `reads_from`. Defaults to `"readers"` for `"read"` and to none otherwise. See [Plugin communication](/sdk/concepts/plugin-communication#calls-to-tools-and-jobs) |

An unknown or invalid option raises `TypeError` when Python defines the class. Set `effect` to what the tool really does: clients read it from the MCP tool annotations to decide whether to ask the user first. Before a tool with `effect = "destructive"` runs, the platform asks the user to confirm. See [confirmation questions](/guide/ai-and-api#what-an-ai-assistant-can-do-over-mcp).

## `ToolContext`

| Member | Use |
|---|---|
| `actor` | The caller as an `Actor` (`user_id`, `permissions`, `has_permission()`, `can(access)`, `is_platform_admin`) |
| `design` | The plugin's design data, read and written as the caller. Raises `PluginException` standalone |
| `artifacts` | The plugin's artifacts, read and written as the caller (`ctx.artifacts.save(...)`). Raises `PluginException` standalone |
| `deadline` | UTC time at which the call is stopped |
| `await report(progress, total=None, message=None)` | Progress notification to the MCP client; dropped when no client listens |

The platform calls a plugin with the identity of the caller, never with the caller's token. An in-process plugin gets the caller as its request actor. A plugin in its own process gets its internal token and the identity headers that the plugin proxy sends.

## Declare prompts and resources

```python
import json

from mint_sdk import Plugin
from mint_sdk.mcp import PromptMessage, ToolContext, prompt, resource
from pydantic import BaseModel


class SummaryArgs(BaseModel):
    experiment_id: str


class DoseResponsePlugin(Plugin):
    @prompt(title="Summarize a dose-response run")
    async def summarize_run(self, args: SummaryArgs) -> list[PromptMessage]:
        """Ask the assistant to summarize one run's fit quality."""
        return [PromptMessage(role="user", text=f"Summarize the fit for experiment {args.experiment_id}.")]

    @resource("fits/{experiment_id}", title="Stored fit", mime_type="application/json")
    async def stored_fit(self, ctx: ToolContext, experiment_id: int) -> str:
        """The latest fit parameters for one experiment as JSON."""
        artifact = await ctx.artifacts.get(experiment_id, "fit")
        return json.dumps(artifact.result if artifact else {})
```

| Decorator | Method shape | Published as |
|---|---|---|
| `@prompt(*, title=None)` | `async def name(self, args: ArgsModel) -> str \| list[PromptMessage]`, or `async def name(self)` | Prompt `<plugin>_<name>` |
| `@resource(path, *, title=None, mime_type="text/plain")` | `async def name(self, ctx: ToolContext, param: T) -> str \| bytes` | Resource template `mint://plugins/<plugin>/<path>` |

- Prompt arguments arrive as strings and are validated into the model. A returned `str` becomes one user message.
- A resource `path` is relative. It names its parameters as `{param}`, or `{+param}` to span `/`. The placeholders must match the method parameters after `ctx`. Each value is converted to its annotation.
- A resource returns `str` for text and `bytes` for binary content. A read stops after 60 seconds.
- The platform skips a resource path with `.` or `..` segments.

## Names

The platform publishes tools and prompts as `<plugin>_<name>`. `<plugin>` is the entry-point key in lowercase, with each run of other characters replaced by `_`. For example, a plugin named `dose-response` publishes `dose_response_fit_curve`.

- A method name is lowercase `[a-z0-9_]` and starts with a letter.
- The published name fits in 64 characters.
- The `mint_` prefix is reserved for the platform tools.
- The platform refuses a name that another plugin already published.

If one declaration is invalid, the platform publishes no MCP declaration of the plugin. `mint doctor` checks names, docstrings, signatures and schemas.

## Permissions

- Every plugin tool, prompt and resource needs `plugins.use` and a role that can see the plugin. A tool adds its own `access` level.
- A read-only token can call only tools with `effect = "read"`.
- The audit log records write calls as `mcp.tool_call`.
- `ctx.design` and `ctx.artifacts` apply the plugin write capabilities and the caller's experiment visibility, as for the plugin REST routes. Check all other needs of the tool on `ctx.actor`.

## Limits

The platform treats plugin output as untrusted:

- A tool result must match its output schema and fit in 20,000 JSON characters. The platform refuses a larger result and tells the assistant to ask for less. Save large outputs with `ctx.artifacts.save()` and return a summary.
- A rendered prompt must fit in 20,000 characters.
- A resource must be at most 5 MiB.
- The platform cuts or refuses titles, descriptions and schemas that are too long. A plugin error reaches the caller as a short message only.

The platform reads the declarations of an enabled plugin when the MCP endpoint starts, and again every 15 seconds. A plugin process that starts late or changes its declarations is published without a platform restart. The platform reads `effect` and `idempotent` from the plugin MCP manifest, so a plugin process needs SDK 1.4 or later.

## Panels and jobs over MCP

`@job` methods need no MCP declaration. The platform job tools (`mint_start_job` and related tools) offer every job of the plugin. A job with `effect = "destructive"` on its `Job` spec gets the same confirmation question as a destructive tool. For tasks and questions, see [Jobs as background tasks](/guide/ai-and-api#jobs-as-background-tasks).

`@panel` methods need no MCP declaration either:

- The platform publishes each [panel](/sdk/recipes/panels) as the resource template `mint://plugins/<plugin>/panels/<panel_id>/experiments/{experiment_id}`.
- A read returns the panel answer `{plugin, panel, experiment_id, sections, built_at}`, built for the caller, with the checks of the REST route. A read-only token can read it.
- `mint://experiments/{id}` lists the panels that apply to the experiment and that the caller may open, as `panels: [{plugin, id, title, uri}]`.
- The export and panel templates are published before the plugin resources, so a `@resource` path cannot take their addresses.

To tell the assistant how to use your tools and jobs, ship a [skill](/sdk/recipes/mcp-skills).

## Test a tool

`mint dev` prints the plugin tools under their published names, and a `mint mcp call` line to try one. With the dev server running, call a tool with arguments from a JSON file:

```bash
echo '{"experiment_id": 42}' > args.json
uv run mint mcp call fit_curve --json args.json
```

`mint mcp call` takes the method name, not the published name. The dev server runs standalone: the tool sees the standalone actor, and `ctx.design` and `ctx.artifacts` raise `PluginException`. For the flags, see [CLI reference](/sdk/api/cli-reference#mint-mcp).

For unit tests, call the tool through the SDK, as the `mint init` scaffold does:

```python
import asyncio

from mint_sdk import Actor
from mint_sdk.mcp import call_tool

from my_plugin.plugin import MyPlugin


def test_double_value_returns_a_real_result() -> None:
    result = asyncio.run(
        call_tool(MyPlugin(), "double_value", {"value": 2.5}, actor=Actor.standalone(), platform=None)
    )

    assert result == {"input": 2.5, "doubled": 5.0}
```

`call_tool()` applies the same argument validation, permission checks, timeout and output validation as the platform. `platform` is the plugin platform context (`None` in standalone mode). The call runs as `actor` in that context, so `ctx.design` and `ctx.artifacts` act as the caller. To test a tool that uses them, pass `platform=RecordingContext(...)` (see [Testing plugins](/sdk/recipes/testing-plugins)) or use a disposable platform. `render_prompt(plugin, name, args, actor=..., platform=...)` and `read_resource(plugin, name, params, actor=..., platform=...)` work the same way.

Verified against [v@MINT_VERSION@ `mcp.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/mcp.py) and [platform publishing](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/mcp/plugin_tools.py). For all symbols, see [Python SDK reference](/sdk/api/python#mcp-declarations).
