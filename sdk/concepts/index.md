# Concepts

The Concepts section explains how the MINT plugin model is organized, what runs where, and why. Read these pages first if you're new to MINT plugin development; everything in [Tutorials](/sdk/tutorials/), [Recipes](/sdk/recipes/), and [API Reference](/sdk/api/) assumes the vocabulary introduced here.

## Reading order

| # | Page | What you'll learn |
|---|------|-------------------|
| 1 | [Plugin types](/sdk/concepts/plugin-types) | Analysis vs experiment-design plugins; what each owns and writes |
| 2 | [Plugin lifecycle](/sdk/concepts/lifecycle) | The phases a plugin moves through, from registration to uninstall |
| 3 | [Isolation](/sdk/concepts/isolation) | How conflicting plugins run in their own venvs and subprocesses |
| 4 | [PlatformContext](/sdk/concepts/platform-context) | The single object that gives a plugin access to platform services |
| 5 | [Data model](/sdk/concepts/data-model) | Experiments, projects, design data, analysis results, plugin roles |
| 6 | [Migrations](/sdk/concepts/migrations) | Per-plugin schema evolution with `mint_sdk.migrations` |

Allow ~30 minutes for the full set; each page is short and standalone.

## Two run modes

A `mint-sdk`-based plugin can run in two complementary modes:

| Mode | When | Storage | Auth |
|------|------|---------|------|
| **Standalone** | Plugin author developing locally; small single-user deployments; CI tests | Local SQLite via `LocalDatabase` | Skipped (or fake) |
| **Integrated** | Real platform install — production lab use | Plugin's schema inside the platform's PostgreSQL | Real users via `PlatformContext` |

Plugin code is identical between modes. The platform hands the plugin a `PlatformContext` when integrated; in standalone mode `context` is `None`. The SDK's helpers (`save_design`, `load_analysis`, `get_plugin_db_session`) transparently route to the right backend depending on mode.

## Where to go next

- **Want to build something now?** → [Tutorials](/sdk/tutorials/) — start with [First analysis plugin](/sdk/tutorials/first-analysis-plugin)
- **Need a specific pattern?** → [Recipes](/sdk/recipes/)
- **Looking up an exact symbol?** → [API Reference](/sdk/api/)
- **Frontend / UI?** → [Frontend](/sdk/frontend/)
- **Shipping a release?** → [Operations](/sdk/operations/)
