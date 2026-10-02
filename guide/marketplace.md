# Marketplace

The marketplace is where you find plugins for MINT. Users with install rights install them directly; others file an install request for an admin.

> [Screenshot: Admin -> Plugins -> Registry showing plugin cards, filters, Installed/Update badges, and cached registry status]

## What's a marketplace registry

A registry is a JSON feed of available plugins, hosted at `marketplace.registryUrl` (set in `config.json`). The default registry is `https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json`; private labs can host their own.

The feed for each plugin contains:

| Field | Purpose |
|-------|---------|
| `name` + `display_name` | Stable plugin ID and the readable label. After install, the platform shows the display name the plugin declares |
| `source.github_repo` + `source.asset_pattern` | GitHub release source and `.mint` asset glob |
| `latest_version` + `min_platform_version` | Advertised version and minimum platform version |
| `plugin_type` | `static`, `analysis`, `experiment_design`, `full`, or `workflow` |
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

Open **Admin -> Plugins -> Registry**. You need `plugins.view` plus either `plugins.configure` or `plugins.install` to see this section; the Member role qualifies, the Viewer role does not. Cards show name, type, latest version, tags, author, and a one-line summary.

> [Screenshot: marketplace card with Install / Request install buttons]

| Filter | Notes |
|--------|-------|
| **Type** | All / Static / Analysis / Experiment Design / Workflow / Full |
| **Installed** | Show already-installed plugins |
| **Updates** | Show installed plugins with a newer registry version |
| **Search** | Free text search over the plugin list |

Click a card to open the detail view. It shows the GitHub repository, optional
documentation link, license, type, and **Min Platform** requirement. If the
registry requires a newer MINT version than the one currently running, the card
is labeled **Incompatible** and direct install/update buttons are disabled.

## Install vs request install

Install permissions decide whether a user installs directly or submits a request:

| Mode | Member action | Admin action |
|------|---------------|--------------|
| User has `plugins.install` | User clicks **Install** or **Update** | None |
| User has `plugins.view` but not `plugins.install` | User clicks **Request Install** and enters a justification. The detail view then shows **Install request pending review**. | An admin approves (the install starts) or denies the request. Review is not in the web UI yet; see [Plugins → Install requests](/admin/plugins#install-requests). |

Requests keep who asked, when, and why.

## What happens during install

See [Plugins → Install steps](/admin/plugins#install-steps) for the install lifecycle.

## Upgrade

Marketplace cards show an **Update** badge when a newer compatible version is
available. Click **Update**; the platform repeats the install flow against the
new version, records the updated package, and reports whether a server restart
is required before the new code is active.

If the update fails before activation, the platform reports the failing step. If the plugin's migration fails at startup, that plugin shows **Migration failed** and stays disabled.

Automatic plugin updates are configured per plugin by an admin; see [Updates → Plugin updates](/admin/updates#plugin-updates).

## Uninstall

An admin uninstalls plugins; see [Plugins → Uninstall modes](/admin/plugins#uninstall-modes).

## Hosting a private registry

A registry is a static JSON document plus the `.mint` bundle files it points at. Any HTTPS host works (S3, GitHub Pages, an internal HTTP server). Set `marketplace.registryUrl` to the JSON's URL and restart MINT.

The platform reads one registry URL. If your lab wants the public catalog plus
private plugins, publish an aggregate `registry.json` that includes both. For
private GitHub release assets, configure an updates GitHub token so private
entries can be shown and downloaded.

The schema for the registry feed lives in [`api/models/marketplace_schemas.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/models/marketplace_schemas.py). A reference implementation is at [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).

## Next

→ [Updates](/admin/updates) — auto-updates and pin versions
→ [Plugin development → Operations → Packaging](/sdk/operations/packaging) — `mint build` produces installable bundles
