# Concepts

These pages explain what a plugin declares, which platform services it gets and which data it owns. Read the type guide first. Then read the pages that apply to your plugin before you follow the [tutorials](/sdk/tutorials/).

| Page | Read it when |
|---|---|
| [Plugin types](/sdk/concepts/plugin-types) | You choose the UI mode, the plugin type and `Metadata.writes` |
| [Lifecycle](/sdk/concepts/lifecycle) | You need to know what runs at install, startup, settings changes, events and shutdown |
| [Isolation](/sdk/concepts/isolation) | You choose a runtime: in-process, subprocess, external or Docker |
| [PlatformContext](/sdk/concepts/platform-context) | Your plugin reads experiments, users, files, settings or its own storage |
| [Plugin communication](/sdk/concepts/plugin-communication) | Your plugin uses events, exports or calls of other plugins |
| [Data model](/sdk/concepts/data-model) | You work with experiments, design data, artifacts and projects |
| [Migrations](/sdk/concepts/migrations) | Your plugin owns SQL tables |

## Standalone and integrated execution

Under `mint dev`, a plugin runs standalone with a `StandaloneContext`, and `self.is_standalone` is `True`. An installed plugin gets a scoped platform context. [Isolation](/sdk/concepts/isolation#runtime-comparison) compares the runtimes.

Write code for both environments. A local SQL session can use SQLite, but an analysis artifact needs the platform. Test authentication and resource visibility on an installed platform, not only in local tests.

The execution mode does not depend on the UI mode (`generated` or `standard`) or on `Metadata.writes`.
