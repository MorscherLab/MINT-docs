# Concepts

Learn how MINT plugins declare their access levels, receive platform services,
and own data. Start with the type guide, then read the pages relevant to your
plugin before following the [tutorials](/sdk/tutorials/).

| Page | What you will learn |
|---|---|
| [Plugin types](/sdk/concepts/plugin-types) | Static, analysis, design, workflow and full plugins; `Metadata.writes` |
| [Lifecycle](/sdk/concepts/lifecycle) | Discovery, startup, settings, events, shutdown and uninstall |
| [Isolation](/sdk/concepts/isolation) | In-process, subprocess, external and container runtime boundaries |
| [PlatformContext](/sdk/concepts/platform-context) | Context namespaces, authenticated actors, files and settings |
| [Data model](/sdk/concepts/data-model) | Experiments, design ownership, artifacts and projects |
| [Migrations](/sdk/concepts/migrations) | Creating and upgrading plugin-owned SQL tables |
| [Plugin communication](/sdk/concepts/plugin-communication) (1.5 beta) | Durable events and read-only exports between plugins |
| [Database & revisions](/sdk/concepts/database-and-revisions) (1.5 beta) | Generated revisions, `mint dev`, `mint doctor --fix` |

## Standalone and integrated execution

Standalone development runs with a `StandaloneContext` (`self.is_standalone` is `True`); an installed plugin runs in-process or in a subprocess with a scoped context. See [Isolation](/sdk/concepts/isolation#runtime-comparison) for the runtime table.

Code must handle its actual environment. A local SQL session can use SQLite,
but saving a platform analysis artifact requires integration. Authentication
and resource visibility need installed-platform checks as well as local tests.

These execution modes are separate from the `generated`/`standard` UI choice
and the write set (`Metadata.writes`). Follow the [development guide](/sdk/) for a learning path or
use the [recipes](/sdk/recipes/) for one concrete task.
