# Recipes

Goal-oriented patterns for the operations plugin authors do most often. Each recipe is short — a goal, a code block, a few notes, and links to related material. If the recipe doesn't fit, the [Tutorials](/sdk/tutorials/) cover end-to-end builds and the [API Reference](/sdk/api/) covers exact symbol surfaces.

## Reading experiments

| Recipe | When |
|--------|------|
| [Reading experiments](/sdk/recipes/reading-experiments) | Look up one experiment, paginate, filter by status / project |
| [Querying plugin data](/sdk/recipes/querying-plugin-data) | SQLAlchemy patterns on plugin-owned tables |

## Writing results

| Recipe | When |
|--------|------|
| [Writing results](/sdk/recipes/writing-results) | Save / append `PluginAnalysisResult`, preserve run history |
| [Managing artifacts](/sdk/recipes/managing-artifacts) | Upload, persist, and read back files attached to experiments |

## Permissions and identity

| Recipe | When |
|--------|------|
| [Route permissions](/sdk/recipes/route-permissions) | `require_plugin_role`, combining with platform permissions |

## Reliability

| Recipe | When |
|--------|------|
| [Error handling](/sdk/recipes/error-handling) | Map `PluginException` subclasses to HTTP responses; user-facing vs developer-facing |
| [Logging & tracing](/sdk/recipes/logging-tracing) | Structured logs via `get_plugin_logger`; request-scoped fields |
| [Testing plugins](/sdk/recipes/testing-plugins) | In-memory repos, fixtures, end-to-end tests with TestClient |

## Schema evolution

| Recipe | When |
|--------|------|
| [Backfill migrations](/sdk/recipes/backfill-migration) | Schema changes plus chunked data backfill, idempotent on retry |

## Domain-specific

| Recipe | When |
|--------|------|
| [R integration](/sdk/recipes/r-integration) | Calling R from a Python plugin via `rpy2` or subprocess |

::: tip Pattern
Every recipe page follows the same shape: **Goal → Code → Notes → Related**. Read the goal and the code first; the notes are the gotchas you'll hit when adapting the pattern.
:::
