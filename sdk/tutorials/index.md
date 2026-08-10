# Plugin development tutorials

This is the hands-on path for building a MINT plugin. Start with the SDK-managed generated UI path, then move to a custom Vue workspace when you need full control.

For the full Plugin Development chapter map, start at [Plugin Development Guide](/sdk/).

## Before you start

You'll need:

| | |
|---|---|
| **Python** | 3.12 or newer |
| **uv** | Used by generated plugin projects |
| **Bun** | latest (for frontend tutorials) |
| **`mint` CLI** | Installed from `mint-sdk`; see [CLI overview](/cli/overview) |
| **A running platform** | Optional for the first pass; `mint dev --platform` can start one for integrated smoke tests |

You do not need to read the whole SDK reference first. When a tutorial introduces a concept, it links to the deeper page.

## Recommended path

| Step | Tutorial | Project | What you will have afterward |
|------|----------|---------|------------------------------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | `hello-mint` | `generated` mode `ANALYSIS` plugin with `@generated_ui`, one typed `@job`, a job test, and a `.mint` bundle |
| 2 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | `hello-standard` | `standard` mode plugin with `@endpoint` handlers, a Vue 3 workspace, and the generated typed client |
| 3 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | `panel-designer` | `EXPERIMENT_DESIGN` plugin with SQLModel tables, CRUD endpoints, local SQLite, and installed-mode migrations |
| 4 | [Plugin roles](/sdk/tutorials/plugin-roles) | `panel-designer` | Plugin-specific `viewer` / `editor` / `admin` roles enforced by backend routes and reflected in the UI |

The first two tutorials are intentionally separate projects. `generated` mode is the fastest first plugin; `standard` mode is the custom UI path. The last two build a design plugin, which mirrors real MINT deployments: design plugins usually define experiment structure, while analysis plugins read experiments and attach results.

## What to learn before each step

| Before | Read this if the term is new |
|--------|------------------------------|
| Tutorial 1 | [Plugin types](/sdk/concepts/plugin-types), [PlatformContext](/sdk/concepts/platform-context) |
| Tutorial 2 | [Frontend overview](/sdk/frontend/), [Frontend SDK reference](/sdk/api/frontend) |
| Tutorial 3 | [Data model](/workflow/data-model), [Migrations](/sdk/concepts/migrations) |
| Tutorial 4 | [Route permissions](/sdk/recipes/route-permissions), [Permissions](/reference/permissions) |

## How tutorials are structured

- Command blocks are **runnable** as written. Code blocks are either full replacements or explicitly marked as partial snippets.
- File paths are **absolute relative to the plugin project root** unless noted.
- When directory matters, the surrounding text tells you where to run the command.
- Output expected from each command is shown with `→` markers.
- After each section there's a **Checkpoint** — a one-liner you can run to verify your project is in the expected state before moving on.

## After the tutorials

When your plugin works locally:

- Run [Packaging](/sdk/operations/packaging) to produce a `.mint` bundle.
- Use [Publishing](/sdk/operations/publishing) when you are ready for PyPI or a marketplace registry.
- Add CI from [CI patterns](/sdk/operations/ci-patterns).
- Use [Recipes](/sdk/recipes/) for specific tasks such as reading experiments, writing results, route permissions, testing, and R integration.
- Use [API Reference](/sdk/api/) only when you need exact signatures.
