# Recipes

Goal-oriented patterns for the operations plugin authors do most often. Each recipe is short: a goal, working code, the pitfalls, and links to related material. If the recipe doesn't fit, the [Tutorials](/sdk/tutorials/) cover end-to-end builds and the [API Reference](/sdk/api/) covers exact symbol surfaces.

## Reading experiments

| Recipe | When |
|--------|------|
| [Reading experiments](/sdk/recipes/reading-experiments) | Look up one experiment, paginate, filter by status / project |
| [Querying plugin data](/sdk/recipes/querying-plugin-data) | SQLAlchemy patterns on plugin-owned tables |

## Writing results

| Recipe | When |
|--------|------|
| [Writing results](/sdk/recipes/writing-results) | Save named `AnalysisArtifact` outputs, preserve visible run history, and publish file-backed artifacts |

## Permissions and identity

| Recipe | When |
|--------|------|
| [Route permissions](/sdk/recipes/route-permissions) | Typed actors, SDK permission guards and experiment visibility |

## Reliability

| Recipe | When |
|--------|------|
| [Error handling](/sdk/recipes/error-handling) | Typed SDK errors, HTTP envelopes and request IDs |
| [Logging & tracing](/sdk/recipes/logging-tracing) | Stdlib `logging` in the platform formatter; request IDs and spans |
| [Testing plugins](/sdk/recipes/testing-plugins) | `RecordingContext`, route tests, `PluginTestHarness` job tests, migrations |

## Schema evolution

| Recipe | When |
|--------|------|
| [Backfill migrations](/sdk/recipes/backfill-migration) | Schema changes plus chunked data backfill, idempotent on retry |

## Domain-specific

| Recipe | When |
|--------|------|
| [R integration](/sdk/recipes/r-integration) | Calling R through the SDK `RAnalysisBridge` and `mint add r-analysis` |
