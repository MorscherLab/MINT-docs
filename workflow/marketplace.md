# Marketplace

The marketplace is MINT's plugin discovery and install surface. Users browse available plugins; admins approve install requests and manage the lifecycle.

> [Screenshot: Admin -> Plugins -> Registry showing plugin cards, filters, Installed/Update badges, and cached registry status]

## What's a marketplace registry

A registry is a JSON feed of available plugins, hosted at `marketplace.registryUrl` (set in `config.json`). The default registry is `https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json`; private labs can host their own.

The feed for each plugin contains:

| Field | Purpose |
|-------|---------|
| `name` + `display_name` | Stable plugin identity and readable label |
| `source.github_repo` + `source.asset_pattern` | GitHub release source and `.mint` asset glob |
| `latest_version` + `min_platform_version` | Advertised version and minimum platform version |
| `plugin_type` | `static`, `analysis`, `experiment_design`, or `full` |
| `capabilities` | Whether the plugin requires auth, database access, and/or a frontend |
| `auto_update` | Registry preference for whether this plugin can participate in auto-update workflows |
| `source.private` | Marks entries that should only appear when the deployment has a GitHub token configured |
| Author + repo + license | Provenance |
| Description, tags, icon URL | Marketplace UI |

A plugin can be in the registry without yet being installed. Conversely, plugins installed outside the registry through **Admin -> Plugins -> Installed** or the platform API will not appear in the Registry catalog. They still show up under **Installed**.

MINT keeps an in-memory and on-disk registry cache under
`server.dataPath/marketplace/`. If the remote registry is temporarily
unavailable, the catalog falls back to the cache and marks the response as
cached. Click **Refresh** in the Registry section to force a fetch when you have
`plugins.configure`.

## Browsing

Open **Admin -> Plugins -> Registry**. Cards show name, type, latest version,
tags, author, and a one-line summary.

> [Screenshot: marketplace card with Install / Request install buttons]

| Filter | Notes |
|--------|-------|
| **Type** | Static / Analysis / Experiment Design / Full |
| **Installed** | Show already-installed plugins |
| **Updates** | Show installed plugins with a newer registry version |
| **Search** | Free text against display name, description, and tags |

Click a card to open the detail view. It shows the GitHub repository, optional
documentation link, license, type, and **Min Platform** requirement. If the
registry requires a newer MINT version than the one currently running, the card
is labeled **Incompatible** and direct install/update buttons are disabled.

## Install vs request install

Install permissions decide whether a user installs directly or submits a request:

| Mode | Member action | Admin action |
|------|---------------|--------------|
| User has `plugins.install` | User clicks **Install** or **Update** | None |
| User has `plugins.view` but not `plugins.install` | User clicks **Request Install** and enters a justification | Admin reviews the request and either **Approve** (install proceeds) or **Deny** |

Approval requests retain their context — who requested, when, why — so an admin can audit them later.

## What happens during install

1. The marketplace service confirms the registry entry is compatible with the running platform version.
2. The plugin manager downloads the GitHub release asset matching `source.asset_pattern`.
3. If the asset is a `.mint` bundle, the platform checks the bundle manifest's `requires_mint` specifier unless the admin explicitly forces the install.
4. The install path pins `mint-sdk` to the platform's own version so a plugin cannot silently upgrade or downgrade the platform SDK.
5. Dependency preflight checks whether the plugin can share the platform environment. Conflicts are reported as a retry-with-force dialog.
6. The package or bundle is installed, the source artifact is recorded for restore, and a snapshot is kept for best-effort Python package rollback.
7. The platform reports whether a restart is required before the plugin is loaded.
8. On startup, MINT discovers the entry point, applies migrations, resolves plugin settings, runs `initialize(context)`, and mounts endpoints, jobs, generated UI, and frontend assets.

If install fails, the operation reports the failing step and leaves the plugin uninstalled or requiring administrator cleanup, depending on where the failure occurred. Dependency conflicts surface as a retry-with-force dialog; use that only when you understand the dependency change.

> [Screenshot: install progress dialog with each step ticking through]

After a successful install, check **Admin -> Plugins -> Installed**. A package can appear as
**Installed but not loaded yet** with a **Restart required** badge. It is not
serving plugin routes until the server restarts and the plugin reaches the
running state.

## Upgrade

Marketplace cards show an **Update** badge when a newer compatible version is
available. Click **Update**; the platform repeats the install flow against the
new version, records the updated package, and reports whether a server restart
is required before the new code is active.

If the update fails before activation, the platform reports the failing step. If a migration fails during startup, the plugin stays in an error state and the admin surfaces show the failure.

Admins with `plugins.configure` can also use the per-plugin
`marketplace.autoUpdatePlugins` toggles. Auto-update still obeys the same
compatibility gates and restart-required behavior as a manual update.

## Uninstall

From **Admin -> Plugins -> Installed**, click **Uninstall** on the plugin. The current Admin UI and `mint plugin uninstall` use the safe default: remove the package and keep plugin-owned database tables in place.

See [Plugins → Uninstall modes](/workflow/plugins#uninstall-modes) for the full discussion.

## Hosting a private registry

A registry is a static JSON document plus the `.mint` bundle files it points at. Any HTTPS host works (S3, GitHub Pages, an internal HTTP server). Set `marketplace.registryUrl` to the JSON's URL and restart MINT.

The platform reads one registry URL. If your lab wants the public catalog plus
private plugins, publish an aggregate `registry.json` that includes both. For
private GitHub release assets, configure an updates GitHub token so private
entries can be shown and downloaded.

The schema for the registry feed lives in [`api/models/marketplace_schemas.py`](https://github.com/MorscherLab/MINT/blob/main/api/models/marketplace_schemas.py). A reference implementation is at [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).

## Next

→ [Updates](/workflow/updates) — auto-updates and pin versions
→ [Plugin development → Operations → Packaging](/sdk/operations/packaging) — `mint build` produces installable bundles
