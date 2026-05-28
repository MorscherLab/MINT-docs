# Marketplace

The marketplace is MINT's plugin discovery and install surface. Users browse available plugins; admins approve install requests and manage the lifecycle.

> [Screenshot: marketplace page showing plugin cards with install buttons]

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
| Author + repo + license | Provenance |
| Description, tags, icon URL | Marketplace UI |

A plugin can be in the registry without yet being installed. Conversely, plugins installed outside the registry through **Admin → Plugins** or the platform API won't appear in Marketplace — they show up under **Installed** but not **Marketplace**.

## Browsing

Open **Admin → Plugins**, then **Browse Registry**. Cards show name, type, latest version, tags, author, and a one-line summary.

> [Screenshot: marketplace card with Install / Request install buttons]

| Filter | Notes |
|--------|-------|
| **Type** | Static / Analysis / Experiment Design / Full |
| **Installed** | Show already-installed plugins |
| **Updates** | Show installed plugins with a newer registry version |
| **Search** | Free text against display name, description, and tags |

## Install vs request install

Install permissions decide whether a user installs directly or submits a request:

| Mode | Member action | Admin action |
|------|---------------|--------------|
| User has `plugins.install` | User clicks **Install** | None |
| User has `plugins.view` but not `plugins.install` | User clicks **Request install**; the request lands in **Admin → Plugin requests** | Admin reviews and either **Approve** (install proceeds) or **Deny** |

Approval requests retain their context — who requested, when, why — so an admin can audit them later.

## What happens during install

1. The plugin manager downloads the requested version
2. `conflict.py` checks the plugin's dependency tree against everything already installed
3. If conflicts exist, `isolation.py` provisions a per-plugin venv via `uv`
4. `snapshot.py` captures the pre-install Python environment for package rollback
5. `MigrationRunner` applies the plugin's migrations
6. The platform reports whether a restart is required before the plugin is loaded
7. On startup, the plugin's `initialize(context)` runs and its routers mount

If install fails, the operation reports the failing step and leaves the plugin uninstalled or requiring administrator cleanup, depending on where the failure occurred. Dependency conflicts surface as a retry-with-force dialog; use that only when you understand the dependency change.

> [Screenshot: install progress dialog with each step ticking through]

## Upgrade

Marketplace cards show an **Update** badge when a newer version is available. Click **Update**; the platform repeats the install flow against the new version, records the updated package, and reports whether a server restart is required before the new code is active.

If the update fails before activation, the platform reports the failing step. If a migration fails during startup, the plugin stays in an error state and the admin surfaces show the failure.

## Uninstall

From **Admin → Plugins**, click **Uninstall** on the plugin. The current Admin UI and `mint plugin uninstall` use the safe default: remove the package and keep plugin-owned database tables in place.

See [Plugins → Uninstall modes](/workflow/plugins#uninstall-modes) for the full discussion.

## Hosting a private registry

A registry is a static JSON document plus the `.mint` bundle files it points at. Any HTTPS host works (S3, GitHub Pages, an internal HTTP server). Set `marketplace.registryUrl` to the JSON's URL and restart MINT.

The schema for the registry feed lives in [`api/models/marketplace_schemas.py`](https://github.com/MorscherLab/MINT/blob/main/api/models/marketplace_schemas.py). A reference implementation is at [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).

## Next

→ [Updates](/workflow/updates) — auto-updates and pin versions
→ [Plugin development → Operations → Packaging](/sdk/operations/packaging) — `mint build` produces installable bundles
