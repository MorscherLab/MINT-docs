# MCP tools

Publish plugin methods to AI assistants connected to the platform's `/mcp` endpoint. The platform owns the MCP protocol; a plugin declares plain async methods with `@tool`, `@prompt` or `@resource` from `mint_sdk.mcp`, and the SDK never imports `mcp`. Users connect an assistant with a personal access token as described in [AI Assistants and API Access](/guide/ai-and-api).

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

A tool method takes `(self, ctx: ToolContext, args: ArgsModel)` and returns a Pydantic model. The argument and return models become the tool's input and output schemas, and the docstring is the description the assistant reads.

| `Tool` option | Meaning |
|---|---|
| `effect` | Required. `"read"` changes nothing; read-only tokens can call only these tools. `"write"` changes data. `"destructive"` may overwrite or remove data |
| `title` | Display name shown by MCP clients (defaults to the method name in title case) |
| `idempotent` | Repeating the call changes nothing more. Defaults to `True` for `"read"` and `False` otherwise |
| `timeout` | Seconds before the call is stopped; at most 600 (default 60) |
| `access` | Who may call the tool: `"use"` (default), `"configure"` (adds `plugins.configure`) or `"admin"` (platform administrators) |

The class is checked when Python defines it: an unknown or invalid option raises `TypeError`. State the effect honestly: it becomes the MCP tool annotations that clients use to decide whether to ask the user before a call. For a tool with `effect = "destructive"`, the platform asks the user to confirm the question before the call runs, when the client supports it. A decline ends the call before the method runs. The question is not an authorization: a client hook can answer it.

## `ToolContext`

| Member | Use |
|---|---|
| `actor` | The caller as an `Actor` (`user_id`, `permissions`, `has_permission()`, `can(access)`, `is_platform_admin`) |
| `design` | The plugin's design data, read and written as the caller. Raises `PluginException` standalone |
| `artifacts` | The plugin's artifacts, read and written as the caller (`ctx.artifacts.save(...)`). Raises `PluginException` standalone |
| `deadline` | UTC time at which the call is stopped |
| `await report(progress, total=None, message=None)` | Progress notification to the MCP client; dropped when no client listens |

`ctx.design` and `ctx.artifacts` apply the plugin's write capabilities and the caller's experiment visibility, as for the plugin's REST routes. The platform calls a plugin with the caller's identity, never with the caller's token. An in-process plugin receives the caller as its request actor; a plugin in its own process is called with its internal token and the same identity headers the plugin proxy sends.

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

Prompt arguments arrive as strings and are validated into the model. A returned `str` becomes one user message.

A resource `path` is relative and names its parameters as `{param}`, or `{+param}` to span `/`. The placeholders must match the method's parameters after `ctx`; each value is converted to its annotation. Return `str` for text and `bytes` for binary content. A resource read is stopped after 60 seconds. A resource path with `.` or `..` segments is skipped.

## Names

The platform publishes tools and prompts as `<plugin>_<name>`, where `<plugin>` is the plugin name (its entry-point key) lowercased with every run of other characters replaced by `_` (a plugin named `dose-response` publishes `dose_response_fit_curve`). Method names must be lowercase `[a-z0-9_]`, starting with a letter, and the published name must fit in 64 characters. The `mint_` prefix is reserved for the platform's own tools, and a name another plugin already published is refused.

If any declaration is invalid, the platform publishes none of the plugin's MCP declarations. `mint doctor` checks names, docstrings, signatures and schemas before you ship.

## Permissions

Every plugin tool, prompt and resource needs `plugins.use` and a role that can see the plugin. A tool adds its own `access` level. A caller with a read-only token can call only tools with `effect = "read"`. Write calls are recorded in the audit log as `mcp.tool_call`.

`ctx.design` and `ctx.artifacts` apply the plugin's write capabilities and the caller's experiment visibility. Check anything else the tool needs from `ctx.actor`.

## Limits

The platform treats plugin output as untrusted:

- A tool result must match its output schema and fit in 20,000 JSON characters; a larger result is refused with a message telling the assistant to ask for less. Save large outputs with `ctx.artifacts.save()` and return a summary.
- A rendered prompt must fit in 20,000 characters.
- A resource must be at most 5 MiB.
- Titles, descriptions and schemas are truncated or rejected when they are too long, and a plugin error reaches the caller as a short message only.

The platform picks up an enabled plugin's declarations when the MCP endpoint starts and rechecks every 15 seconds, so a plugin process that starts late or changes its declarations is published without a platform restart. The platform reads `effect` and `idempotent` from the plugin MCP manifest, so a plugin process needs SDK 1.4.

`@job` methods need no MCP declaration: the platform's job tools (`mint_start_job` and the related tools) offer every job the plugin declares.

## Test a tool

`mint dev` prints the plugin's tools under their published names and a `mint mcp call` line to try one. With the dev server running, call a tool with its arguments from a JSON file:

```bash
echo '{"experiment_id": 42}' > args.json
uv run mint mcp call fit_curve --json args.json
```

`mint mcp call` takes the method name, not the published name. The dev server runs standalone: the tool sees the standalone actor, and `ctx.design` and `ctx.artifacts` raise `PluginException`. Flags: [CLI reference](/sdk/api/cli-reference#mint-mcp).

For unit tests, call the tool through the SDK as the `mint init` scaffold does:

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

`call_tool()` applies the same argument validation, permission checks, timeout and output validation as the platform. `platform` is the plugin's platform context (`None` standalone); the call runs as `actor` in that context, so `ctx.design` and `ctx.artifacts` act as the caller. Test a tool that uses them with `platform=RecordingContext(...)` (see [Testing plugins](/sdk/recipes/testing-plugins)) or against a disposable platform. `render_prompt(plugin, name, args, actor=..., platform=...)` and `read_resource(plugin, name, params, actor=..., platform=...)` work the same way.

Verified against [v@MINT_VERSION@ `mcp.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/mcp.py) and [platform publishing](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/mcp/plugin_tools.py).

- [AI Assistants and API Access](/guide/ai-and-api)
- [Route permissions](/sdk/recipes/route-permissions)
- [Python SDK reference](/sdk/api/python#mcp-declarations)
