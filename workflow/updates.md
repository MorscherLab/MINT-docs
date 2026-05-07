# Updates

MINT's update story has two layers: the **platform** itself (the FastAPI backend + bundled frontend + `mint` CLI) and the **plugins** installed on top of it. Each layer updates independently: platform updates are checked from GitHub releases, while marketplace plugin updates are checked from the configured registry.

> [Screenshot: Admin → Updates page showing platform and plugin update statuses]

## Platform updates

Configured under `updates` in `config.json`:

```json
{
  "updates": {
    "autoCheckEnabled": true,
    "checkIntervalHours": 24,
    "platformRepo": "MorscherLab/MINT",
    "includePrereleases": false
  }
}
```

| Field | Effect |
|-------|--------|
| `autoCheckEnabled` | Master on/off switch for background update checks |
| `checkIntervalHours` | How often `update_service` polls the GitHub release feed |
| `platformRepo` | Where to pull platform releases from — usually unchanged |
| `includePrereleases` | Include GitHub prereleases in the update list |
| `pluginSources` | Optional per-plugin GitHub release sources used outside the marketplace registry |

Update notifications appear in **Admin → Updates** with the diff of the changelog and a single **Install** button. Installation:

1. Stops the running MINT process gracefully
2. Replaces the wheel
3. Re-applies platform migrations
4. Restarts the process

There is a brief outage during the swap. For zero-downtime upgrades, run two MINT replicas behind a load balancer and rolling-restart them.

## Plugin updates

Plugin updates are surfaced in **Admin → Plugins** and **Admin → Marketplace**, with a per-plugin **Upgrade** button when the registry advertises a newer compatible version. Each plugin has its own marketplace auto-update preference in `marketplace.autoUpdatePlugins` (defaults to off):

> [Screenshot: per-plugin upgrade card with Auto-update toggle and version picker]

| Toggle | Behavior |
|--------|----------|
| **Auto-update off** (default) | Admin upgrades manually |
| **Auto-update enabled** | Platform installs newer compatible versions automatically during the daily check |

The marketplace's compatibility check matches the plugin's declared SDK range against the platform's bundled `mint-sdk` version — if a plugin needs a newer SDK than the current platform offers, it's hidden from the upgrade button until the platform itself is updated.

## Prereleases

Setting `updates.includePrereleases` to `true` opts the platform update checker into GitHub prereleases. Useful for:

- Testing forthcoming releases against your real plugins before stable lands
- Reproducing bugs against a candidate fix
- Plugin authors who need a new SDK feature ahead of stable

Prereleases follow the same migration discipline as stable — migrations are forward-only and tested — but the API surface or UI may change between prereleases. Don't run prereleases on a production lab instance without a rollback plan.

## Rollback

MINT update checks do not replace deployment backups. Before platform upgrades, take a normal database and deployment backup using your lab's operating procedure.

| Layer | Rollback mechanism |
|-------|--------------------|
| Platform | Restore the previous deployment artifact and database backup |
| Plugin | `snapshot.py` captures the Python environment before install / upgrade / uninstall; rollback restores package versions best-effort |

Plugin environment snapshots are useful for Python package recovery, but they are not a substitute for database backups before major schema changes.

## Auto-issued bug reports

When the platform or a plugin raises an unhandled exception, `github_issue_service` can automatically open a deduplicated GitHub issue with the stack trace and request context (no PII). For the platform itself, it's controlled by the `errorReporting` config section. Disabled by default.

## Next

→ [Marketplace](/workflow/marketplace) — install and request plugins
→ [Plugin development → Operations](/sdk/operations/) — building, versioning, publishing
