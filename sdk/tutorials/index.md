# Plugin development tutorials

Follow these tutorials in order to build MINT plugins step by step. Tutorial 1 uses the generated UI. Tutorial 2 adds a custom Vue workspace.

## Before you start

- Install the toolchain from [Install the toolchain](/sdk/install). The frontend tutorials need the Vite+ CLI `vp` 1.5.1 or later.
- For the final steps, get access to a test MINT platform where you can install plugins. Local code runs without a platform.

You do not need to read the SDK reference first. Each tutorial links to the concept page when it introduces a term.

## Recommended path

| Step | Tutorial | Project | Result |
|------|----------|---------|--------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | `hello-mint` | A `generated` mode analysis plugin with one typed `@job`, a job test and a `.mint` bundle |
| 2 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | `hello-standard` | A `standard` mode plugin with `@endpoint` handlers, a Vue 3 workspace and the generated typed client |
| 3 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | `panel-designer` | A design plugin (`writes = {"experiments", "design"}`) with SQLModel tables, CRUD endpoints and migrations |
| 4 | [Access levels](/sdk/tutorials/access-levels) | `panel-designer` | `use`, `configure` and `admin` access levels on endpoints and pages |
| 5 | [Types and workflow plugin](/sdk/tutorials/plugin-types-workflow) | `batch-coordinator` | A workflow plugin (`writes = {"experiments"}`) that manages experiments without design ownership |
| 6 | [Analyze an experiment](/sdk/tutorials/analyze-an-experiment) | `panel-summary` | An analysis plugin that reads an experiment design and saves a named artifact |

Tutorials 1 and 2 are separate projects. Tutorials 3 and 4 build one design plugin. In a typical MINT deployment, a design plugin defines the experiment structure, and an analysis plugin reads experiments and attaches results.

## What to read before each step

| Before | Read this if the term is new |
|--------|------------------------------|
| Tutorial 1 | [Plugin types](/sdk/concepts/plugin-types), [PlatformContext](/sdk/concepts/platform-context) |
| Tutorial 2 | [Frontend overview](/sdk/frontend/), [Frontend SDK reference](/sdk/api/frontend) |
| Tutorial 3 | [Data model](/guide/data-model), [Migrations](/sdk/concepts/migrations) |
| Tutorial 4 | [Route permissions](/sdk/recipes/route-permissions), [Permissions](/reference/permissions) |
| Tutorial 6 | [PlatformContext](/sdk/concepts/platform-context), [Writing results](/sdk/recipes/writing-results) |

## Conventions

- You can run each command block as written. A code block is a full replacement unless the text calls it a partial snippet.
- File paths are relative to the plugin project root, unless the text says otherwise.
- Each tutorial ends with a test of the bundle in a disposable platform (`mint verify`) and a deploy (`mint deploy`). [Deploying and verifying](/sdk/operations/deploying) explains both commands.

## After the tutorials

- Package the plugin: [Packaging](/sdk/operations/packaging).
- Release the bundle and list it in a marketplace: [Publishing](/sdk/operations/publishing).
- Add CI: [CI patterns](/sdk/operations/ci-patterns).
- Do one specific task, such as reading experiments or testing: [Recipes](/sdk/recipes/).
