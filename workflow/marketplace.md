# Marketplace

The marketplace is MINT's plugin discovery and install surface. Users browse available plugins; admins approve install requests and manage the lifecycle.

> [Screenshot: marketplace page showing plugin cards with install buttons]

## What's a marketplace registry

A registry is a JSON feed of available plugins, hosted at `marketplace.registryUrl` (set in `config.json`). The default Morscher Lab registry is `https://marketplace.morscherlab.org`; private labs can host their own.

The feed for each plugin contains:

| Field | Purpose |
|-------|---------|
| Name + slug | Identity and URL routing |
| Versions | Ordered list with download URLs and SDK compatibility ranges |
| Plugin type | `EXPERIMENT_DESIGN` / `ANALYSIS` / `TOOL` |
| Capabilities | What `PlatformContext` permissions the plugin asks for |
| Author + repo + license | Provenance |
| Long description, screenshots | Marketplace UI |

A plugin can be in the registry without yet being installed. Conversely, plugins installed manually via `mint plugin install <git-url>` won't appear in the registry — they show up under **Installed** but not **Marketplace**.

## Browsing

Open **Admin → Marketplace** (admins) or **Plugins → Marketplace** (members, if your platform allows self-service). Cards show name, type, latest version, and a one-line summary.

> [Screenshot: marketplace card with Install / Request install buttons]

| Filter | Notes |
|--------|-------|
| **Type** | Design / Analysis / Tool |
| **Installed?** | Hide already-installed plugins |
| **Compatible** | Hide plugins whose latest version requires an SDK newer than what your MINT supports |
| **Search** | Free text against name and description |

## Install vs request install

`marketplace.requireApproval` controls whether non-admins can install directly:

| Mode | Member action | Admin action |
|------|---------------|--------------|
| `requireApproval: false` | Member clicks **Install** | None — self-service |
| `requireApproval: true` (default) | Member clicks **Request install**; the request lands in **Admin → Plugin requests** | Admin reviews and either **Approve** (install proceeds) or **Reject** (with optional reason) |

Approval requests retain their context — who requested, when, why — so an admin can audit them later.

## What happens during install

1. The plugin manager downloads the requested version
2. `conflict.py` checks the plugin's dependency tree against everything already installed
3. If conflicts exist, `isolation.py` provisions a per-plugin venv via `uv`
4. `snapshot.py` captures the pre-install database state for rollback
5. `MigrationRunner` applies the plugin's migrations
6. The plugin's `initialize(context)` runs; its routers mount

If any step fails, the snapshot is restored and the plugin is left uninstalled.

> [Screenshot: install progress dialog with each step ticking through]

## Upgrade

Marketplace cards show a badge when a newer version is available. Click **Upgrade**; the platform repeats the install flow against the new version, runs any pending migrations, and swaps the active plugin process atomically.

If the upgrade fails (e.g., a new migration errors), the platform rolls back to the previous version and surfaces the failure on the plugin's admin row.

## Uninstall

From **Admin → Plugins**, click the plugin and choose **Uninstall**. The dialog asks how to handle owned data:

- **Keep** — leave tables in place
- **Archive** — rename tables with an `archived_*` prefix
- **Purge** — drop everything (with a typed confirmation)

See [Plugins → Uninstall modes](/workflow/plugins#uninstall-modes) for the full discussion.

## Hosting a private registry

A registry is a static JSON document plus the wheel files it points at. Any HTTPS host works (S3, GitHub Pages, an internal HTTP server). Set `marketplace.registryUrl` to the JSON's URL and restart MINT.

The schema for the registry feed lives in [`api/services/marketplace_service.py`](https://github.com/MorscherLab/mld/blob/main/api/services/marketplace_service.py). A reference implementation is at [`MorscherLab/mld-registry`](https://github.com/MorscherLab/mld-registry).

## Next

→ [Updates](/workflow/updates) — auto-updates and pin versions
→ [Plugin development](/cli/plugin-dev) — `mint build` produces installable bundles
