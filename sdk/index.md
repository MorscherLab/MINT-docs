# Plugin Development Guide

Build plugins for **MINT @MINT_VERSION@**: start with an installable scaffold, choose its
data permissions, connect it to experiments, add storage and a frontend, then
test and version the bundle. The examples in this track are checked against
the released `v@MINT_VERSION@` source.

## What to learn

| Your goal | Start here | What you will implement |
|---|---|---|
| Create different plugin types | [Type guide](/sdk/concepts/plugin-types), [type and workflow tutorial](/sdk/tutorials/plugin-types-workflow) | Analysis, design, workflow, static and full plugins; `Metadata.writes` |
| Create a Python-only analysis tool | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | Typed job inputs, generated UI, result output and tests |
| Read/write platform data | [PlatformContext](/sdk/concepts/platform-context), [result recipe](/sdk/recipes/writing-results) | Visible experiments, design ownership, artifacts, files, settings, events and access levels |
| Create your own SQL tables | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | SQLModel models, scoped sessions, CRUD and fresh/upgrade migration paths |
| Version and upgrade a plugin | [Versioning](/sdk/operations/versioning), [upgrading the SDK](/sdk/operations/upgrading) | Git tags, SDK compatibility, design formats, SQL revisions and rollback planning |
| Use the CLI through deployment | [CLI reference](/sdk/api/cli-reference), [deployment](/sdk/operations/deploying) | Scaffold, generate, diagnose, build, verify and install |
| Build a custom frontend | [Frontend tutorial](/sdk/tutorials/adding-a-frontend), [platform integration](/sdk/frontend/platform-integration) | Vue 3, typed clients, experiment selection, authentication, forms, files and charts |

### The baseline

Use Python 3.14+ and install `mint-sdk[cli]` to scaffold plugins:

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
```

Then scaffold a plugin, check it and run it:

<Terminal title="~/plugins — zsh" :lines="[
  '$ mint init my-plugin --mode generated --yes',
  'Creating mint-plugin-my-plugin/ ...',
  '  pyproject.toml',
  '  src/mint_plugin_my_plugin/plugin.py',
  '  tests/test_plugin.py',
  '  Initialized git repository',
  '  Running uv sync...',
  '[progress]',
  '$ cd my-plugin',
  '$ uv run mint doctor',
  '  [ok]  Deprecated SDK APIs  none found',
  '  [ok]  Runtime boot  lifespan and safe GET probes passed',
  '30/30 checks passed',
  '$ uv run mint dev',
  'Discovered plugin: MyPluginPlugin (mint_plugin_my_plugin.plugin)',
  '  Backend   http://127.0.0.1:8003/api/my-plugin',
  'Press Ctrl+C to stop.',
]" />

`mint init` supplies `mint-sdk[cli,server]` in the generated project's dev
dependencies. Run `uv sync` and use `uv run mint` inside that project. The
plain `mint-sdk` dependency is for the runtime library; see [CLI setup](/sdk/api/cli-reference#install-and-choose-the-environment).

Standard plugins also need Bun for the scaffolded Vue frontend. Platform
integration needs a configured MINT server; MINT requires PostgreSQL.
Standalone plugin SQLite is still available for local development.

Three choices are independent: **UI mode** (`generated` or `standard`),
**plugin type** (data-access defaults), and **runtime** (in-process, subprocess,
external or Docker). In v@MINT_VERSION@, generated mode supports analysis plugins only;
choose standard mode for design, workflow, static or full plugins.

This track follows the released @MINT_VERSION@ API. A plugin declares itself with a `Metadata` subclass and `@plugin`, and declares its tables with `Metadata.database` ([Alembic migrations](/sdk/concepts/migrations)); `mint db current` inspects development
databases and `mint add migration` authors revisions without applying them. A plugin built for SDK 1.3 or earlier does not load on a 1.4 platform: see the [migration guide](/sdk/operations/migrate-1.3-to-1.4). Plugins declare `mint-sdk>=1.4.0,<2.0`; the plugin SDK contract has no breaking change within 1.x. See the [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md)
and [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md)
for the release history.

## Choose your starting mode

`mint init` has two first-class modes. Start with the one that matches the UI
you need today; both produce installable `.mint` bundles.

| Mode | Use it when | What you write |
|------|-------------|----------------|
| `generated` | You need a standard parameter form, job runner, and result display | Python only: `Metadata` with `ui = "generated"`, `@plugin`, `@job` |
| `standard` | You need custom interaction, custom layout, or rich Vue pages | Python `@endpoint` handlers plus a Vue 3 workspace using `@morscherlab/mint-sdk` |

Default to `generated` for a first plugin. Move to `standard` when the user
experience cannot be described by typed job inputs and standard result views.

## Core Path

| Step | Page | Outcome |
|------|------|---------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | Scaffold `hello-mint` in `generated` mode, run a `@job`, test it with `Harness`, and build a `.mint` bundle |
| 2 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | Scaffold `hello-standard` in `standard` mode, call `@endpoint` handlers through the generated client, and render an SDK form |
| 3 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | Build an experiment-design plugin with SQLModel tables, CRUD routes, and migrations |
| 4 | [Access levels](/sdk/tutorials/access-levels) | Tag endpoints and pages with `use` / `configure` / `admin` access levels and enforce them in the backend |
| 5 | [Types and workflow plugin](/sdk/tutorials/plugin-types-workflow) | Create a workflow that manages experiments without taking design ownership |
| 6 | [Analyze an experiment](/sdk/tutorials/analyze-an-experiment) | Read a visible experiment's design, compute a summary, and save it as a named analysis artifact |

The tutorials are written so you can follow them in order without reading the full API reference first. Each step links to the concept page or recipe you need at that moment.

## Daily Development Loop

| Task | Command |
|------|---------|
| Scaffold | `mint init my-plugin --mode generated --yes` or `mint init my-plugin --mode standard --yes` |
| Run locally | `mint dev` |
| Inspect SDK APIs | `mint docs python`, `mint docs frontend components`, `mint docs contract` |
| Regenerate frontend client | `mint sdk generate` |
| Validate project | `mint doctor --strict` |
| Package | `mint build` |
| Verify real install path | `mint verify` |
| Deploy to a test platform | `mint deploy --to http://127.0.0.1:18020` |
| Upgrade a 1.3 plugin | `mint doctor --fix`, then see the [migration guide](/sdk/operations/migrate-1.3-to-1.4) |



## Mental Model Before Coding

| Concept | Read when |
|---------|-----------|
| [Plugin types](/sdk/concepts/plugin-types) | You need to choose `Metadata.writes` and a plugin type (static, analysis, design, workflow, or full) |
| [Plugin lifecycle](/sdk/concepts/lifecycle) | You need to know what happens during install, initialize, upgrade, and uninstall |
| [PlatformContext](/sdk/concepts/platform-context) | Your plugin needs experiments, users, project data, settings, access levels, or plugin-owned storage |
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

1. [Deploy MINT](/admin/install-direct)
2. [Experiment data model](/guide/data-model)
3. [Plugin system](/admin/plugins)
