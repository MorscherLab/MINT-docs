# Plugin Development Guide

This track shows how to build, test and ship a plugin for MINT @MINT_VERSION@. The examples are checked against the released `v@MINT_VERSION@` source.

## Install the toolchain

Run the install script from [Install the toolchain](/sdk/install). It installs uv, Python 3.14, the `mint` CLI and Vite+.

## Create a first plugin

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

`mint init` adds `mint-sdk[cli,server]` to the dev dependencies of the new project. Inside the project, run `uv sync`, then use `uv run mint`. The plain `mint-sdk` dependency is the runtime library; see [CLI setup](/sdk/api/cli-reference#install-and-choose-the-environment).

A plugin has three separate choices: the UI mode, the plugin type and the runtime. Start with `generated` mode for a Python-only first plugin. See [Plugin types](/sdk/concepts/plugin-types) for the modes and types, and [Isolation](/sdk/concepts/isolation) for the runtimes.

A standard plugin also needs the Vite+ CLI `vp` 1.5.1 or later. The `mint` CLI runs every frontend command through `vp`, and new frontends use pnpm. Local development uses a standalone SQLite database. Platform integration needs a configured MINT server.

## Learn the platform

- Follow the [tutorials](/sdk/tutorials/) in order for a first plugin.
- Read the [concepts](/sdk/concepts/) before you design data access or tables.
- Use the [recipes](/sdk/recipes/) for one task at a time.
- Use the [frontend guide](/sdk/frontend/) for components, composables and tokens.
- Use [operations](/sdk/operations/) to package, publish, deploy and version a plugin.
- Use the [API reference](/sdk/api/) for exact signatures.

New to MINT itself? Read [Install directly](/admin/install-direct), the [experiment data model](/guide/data-model) and [Plugins](/admin/plugins) first.

## Daily development loop

| Task | Command |
|------|---------|
| Scaffold | `mint init my-plugin --mode generated --yes` or `--mode standard` |
| Run locally | `mint dev` |
| Look up SDK APIs | `mint docs python`, `mint docs frontend components`, `mint docs contract` |
| Regenerate the frontend client | `mint sdk generate` |
| Check the project | `mint doctor --strict` |
| Lint (design rules, ruff, oxlint) | `mint lint` |
| Package | `mint build` |
| Test the real install path | `mint verify` |
| Deploy to a test platform | `mint deploy --url http://127.0.0.1:18020` |

The [CLI reference](/sdk/api/cli-reference) has every command and flag.

## Upgrade a plugin

A plugin declares `mint-sdk>=<floor>,<2.0`; see [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately). To move a plugin to a newer SDK, follow the matching guide:

- From 1.5: run `mint migrate`, then follow [Migrate from 1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6).
- From 1.4: run `mint doctor`, then follow [Migrate from 1.4 to 1.5](/sdk/operations/migrate-1.4-to-1.5).
- From 1.3 or earlier: run `mint doctor --fix`, then follow [Migrate from 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4). A plugin built for SDK 1.3 or earlier does not load on a 1.4 platform.

The release history is in the [SDK changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/CHANGELOG.md) and the [platform changelog](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md).
