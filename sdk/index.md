# Plugin Development Guide

This chapter is the shortest path from "I understand what MINT is" to "I can build and install a plugin." Read it after the platform path is clear: deploy MINT, understand the experiment data model, then learn how plugins fit into the platform.

## Choose your starting mode

`mint init` has two first-class modes. Start with the one that matches the UI
you need today; both produce installable `.mint` bundles.

| Mode | Use it when | What you write |
|------|-------------|----------------|
| `generated` | You need a standard parameter form, job runner, and result display | Python only: `@mint_plugin`, `@generated_ui`, `@job` |
| `standard` | You need custom interaction, custom layout, or rich Vue pages | Python `@endpoint` handlers plus a Vue 3 workspace using `@morscherlab/mint-sdk` |

Default to `generated` for a first plugin. Move to `standard` when the user
experience cannot be described by typed job inputs and standard result views.

## Core Path

| Step | Page | Outcome |
|------|------|---------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | Scaffold `hello-mint` in `generated` mode, run a `@job`, test it with `PluginTestHarness`, and build a `.mint` bundle |
| 2 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | Scaffold `hello-standard` in `standard` mode, call `@endpoint` handlers through the generated client, and render an SDK form |
| 3 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | Build an experiment-design plugin with SQLModel tables, CRUD routes, and migrations |
| 4 | [Plugin roles](/sdk/tutorials/plugin-roles) | Add plugin-specific viewer/editor/admin roles and enforce them in backend routes |

The tutorials are written so you can follow them in order without reading the full API reference first. Each step links to the concept page or recipe you need at that moment.

## Daily Development Loop

| Task | Command |
|------|---------|
| Scaffold | `mint init my-plugin --mode generated --yes` or `mint init my-plugin --mode standard --yes` |
| Run locally | `mint dev` |
| Inspect SDK APIs | `mint docs python AnalysisPlugin`, `mint docs frontend components`, `mint docs contract .` |
| Regenerate frontend client | `mint sdk generate` |
| Validate project | `mint doctor --strict` |
| Package | `mint build .` |
| Verify real install path | `mint verify .` |
| Deploy to a test platform | `mint deploy . --to http://127.0.0.1:18020` |

::: warning Current CLI note
MINT v1.1.9 does not expose `mint add job`. Use `mint init --mode generated`
for the current `@job` scaffold, or add `@job` methods directly to an existing
plugin class.
:::

## Mental Model Before Coding

| Concept | Read when |
|---------|-----------|
| [Plugin types](/sdk/concepts/plugin-types) | You need to choose `STATIC`, `ANALYSIS`, `EXPERIMENT_DESIGN`, or `FULL` |
| [Plugin lifecycle](/sdk/concepts/lifecycle) | You need to know what happens during install, initialize, upgrade, and uninstall |
| [PlatformContext](/sdk/concepts/platform-context) | Your plugin needs experiments, users, project data, settings, or plugin-owned storage |
| [Migrations](/sdk/concepts/migrations) | Your plugin owns tables or needs production-safe schema changes |

## What to use after the first plugin works

| Need | Section |
|------|---------|
| A copy-paste pattern for one task | [Recipes](/sdk/recipes/) |
| Frontend components, composables, tokens, or FormBuilder | [Frontend](/sdk/frontend/) |
| Packaging, publishing, CI, deployment, versioning | [Operations](/sdk/operations/) |
| Exact Python, frontend, migration, client, or CLI signatures | [API Reference](/sdk/api/) |

## Platform path

New to the platform itself? Read these first, then come back here:

1. [Deploy MINT](/get-started/install-direct)
2. [Experiment data model](/workflow/data-model)
3. [Plugin system](/workflow/plugins)
