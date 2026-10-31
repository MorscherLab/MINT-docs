# Marketplace

The marketplace is where admins find and install plugins for MINT. Other users ask an admin to install a plugin; MINT has no in-app install request.

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

Open **Admin -> Plugins -> Registry**. You need `plugins.view` plus either `plugins.configure` or `plugins.install` to see this section. The Member role does not hold `plugins.configure` since MINT 1.4, so a Member sees the section only when an admin gave the role one of these permissions. Cards show name, type, latest version, tags, author, and a one-line summary.

> [Screenshot: marketplace card with the Install button]

| Filter | Notes |
|--------|-------|
| **Filter plugins** list | All / Static / Analysis / Experiment design / Workflow / Full, then **Installed** and **Updates**, each with a count |
| **Search** | Free text search over the plugin list |

Click a card to open the detail view. It shows the GitHub repository, optional
documentation link, license, type, and **Min Platform** requirement. If the
registry requires a newer MINT version than the one currently running, the card
is labeled **Incompatible** and direct install/update buttons are disabled.

## Install

Install, update, and uninstall buttons show to administrators. A user who is not an administrator sees no install buttons. This also applies to a user with `plugins.install`. The marketplace API accepts an install from a role with `plugins.install`. If you need a plugin, tell your admin its name. There is no install request form: MINT 1.4 removed the **Request Install** button and the review step.

An install is refused when the plugin's `mint-sdk` requirement excludes the SDK of the running platform. See [Plugins](/admin/plugins) for the install steps and the plugin lock.

## What happens during install

See [Plugins → Install steps](/admin/plugins#install-steps) for the install lifecycle.

## Upgrade

Marketplace cards show an **Update** badge when a newer compatible version is
available. Click **Update**; the platform repeats the install flow against the
new version, records the updated package, and reports whether a server restart
is required before the new code is active.

If the update fails before activation, the platform reports the failing step. If the plugin's migration fails at startup, that plugin shows **Migration failed** and stays disabled.

MINT has no per-plugin automatic update in the marketplace. Your admin can schedule updates for the platform and its plugins together; see [Updates](/admin/updates).

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
