# Recipes

Each recipe shows one plugin task with working code and its pitfalls. For a full build, use the [Tutorials](/sdk/tutorials/). For exact signatures, use the [API Reference](/sdk/api/).

| Recipe | Use it to |
|--------|-----------|
| [Reading experiments](/sdk/recipes/reading-experiments) | Read one experiment, list experiments with filters, create and update experiments |
| [Writing results](/sdk/recipes/writing-results) | Save named `Artifact` outputs, keep run history, save file-backed artifacts |
| [Querying plugin data](/sdk/recipes/querying-plugin-data) | Read and write plugin-owned tables with SQLAlchemy |
| [Route permissions](/sdk/recipes/route-permissions) | Check the caller, the `access` level and experiment visibility |
| [MCP tools](/sdk/recipes/mcp-tools) | Publish tools, prompts and resources on the platform `/mcp` endpoint |
| [MCP skills](/sdk/recipes/mcp-skills) | Ship a skill that tells an AI assistant how to use the plugin |
| [Plugin panels](/sdk/recipes/panels) | Show plugin data as a tab on the experiment page, without a frontend |
| [Live design forms](/sdk/recipes/live-design) | Let the platform draw the design form and save each field |
| [Report instrument status](/sdk/recipes/instrument-status) | Send live instrument state from a daemon through the plugin to the platform |
| [Use a reference library](/sdk/recipes/libraries) | Read a large read-only file from the platform library store |
| [Error handling](/sdk/recipes/error-handling) | Raise typed SDK errors and read the error envelope |
| [Logging & tracing](/sdk/recipes/logging-tracing) | Write logs and spans that carry the request ID |
| [Testing plugins](/sdk/recipes/testing-plugins) | Test routes, jobs, panels, frontends and migrations with `Harness` and `RecordingContext` |
| [Backfill migrations](/sdk/recipes/backfill-migration) | Add a column and fill historical rows, safe on retry |
| [R integration](/sdk/recipes/r-integration) | Run R through `RAnalysisBridge` and `mint add r-analysis` |
