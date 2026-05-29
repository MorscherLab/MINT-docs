# Plugin Development Guide

This chapter is the shortest path from "I understand what MINT is" to "I can build and install a plugin." Read it after the platform path is clear: deploy MINT, understand the experiment data model, then learn how plugins fit into the platform.

## Core path

| Step | Page | Outcome |
|------|------|---------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | Scaffold `hello-mint`, run it locally, read an experiment through `PlatformContext`, and build a `.mint` bundle |
| 2 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | Add a Vue frontend with SDK components, generated API clients, and platform-aware layout |
| 3 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | Build an experiment-design plugin with SQLModel tables, CRUD routes, and migrations |
| 4 | [Plugin roles](/sdk/tutorials/plugin-roles) | Add plugin-specific viewer/editor/admin roles and enforce them in backend routes |

The tutorials are written so you can follow them in order without reading the full API reference first. Each step links to the concept page or recipe you need at that moment.

## Mental model before coding

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
