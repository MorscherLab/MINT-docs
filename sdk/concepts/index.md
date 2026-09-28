# Concepts

Learn how MINT 1.2 plugins declare their permissions, receive platform services,
and own data. Start with the type guide, then read the pages relevant to your
plugin before following the [tutorials](/sdk/tutorials/).

| Page | What you will learn |
|---|---|
| [Plugin types](/sdk/concepts/plugin-types) | Static, analysis, design, workflow and full plugins; explicit write policies |
| [Lifecycle](/sdk/concepts/lifecycle) | Discovery, startup, settings, events, shutdown and uninstall |
| [Isolation](/sdk/concepts/isolation) | In-process, subprocess, external and container runtime boundaries |
| [PlatformContext](/sdk/concepts/platform-context) | Scoped repositories, authenticated actors, files and settings |
| [Data model](/sdk/concepts/data-model) | Experiments, design ownership, artifacts, projects and roles |
| [Migrations](/sdk/concepts/migrations) | Creating and upgrading plugin-owned SQL tables |

## Standalone and integrated execution

Standalone development runs with `context=None`; an installed plugin runs in-process or in a subprocess with a scoped context. See [Isolation](/sdk/concepts/isolation#runtime-comparison) for the runtime table.

Code must handle its actual environment. A local SQL session can use SQLite,
but saving a platform analysis artifact requires integration. Authentication
and resource visibility need installed-platform checks as well as local tests.

These execution modes are separate from the `generated`/`standard` UI choice
and `PluginType`. Follow the [development guide](/sdk/) for a learning path or
use the [recipes](/sdk/recipes/) for one concrete task.
