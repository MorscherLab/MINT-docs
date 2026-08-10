# Updates

MINT's update story has three related checks: the **platform** runtime, the bundled **mint-sdk** package, and the **plugins** installed on top of it. Platform and SDK updates are checked from GitHub releases; marketplace plugin updates are checked from the configured registry.

> [Screenshot: Admin → Plugins page showing platform and plugin update statuses]

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

Update status appears in the Admin area alongside plugin and platform configuration. Installation:

1. Stops the running MINT process gracefully
2. Replaces the wheel
3. Re-applies platform migrations
4. Restarts the process

There is a brief outage during the swap. For zero-downtime upgrades, run two MINT replicas behind a load balancer and rolling-restart them.

### Runtime bundles

Docker/runtime deployments do not have a `.git` checkout inside the container. For that install path, MINT applies the platform release's `mint-platform-*.tar.gz` runtime bundle instead of running `git checkout`. If the GitHub release asset is private or rate-limited, set `MINT_UPDATES__GITHUB_TOKEN` in the container environment before applying updates.

For unattended Docker updates, opt in with:

```bash
MINT_UPDATES__AUTO_APPLY_ON_STARTUP=true
```

On each container creation or recreation, the entrypoint checks for a newer platform bundle, applies it when available, and continues startup even if the preflight update check fails. Leave this off when your lab requires scheduled maintenance windows or manual release review.

## Plugin updates

Plugin updates are surfaced in **Admin → Plugins** and the marketplace modal, with an **Update** action when the registry advertises a newer compatible version. Each plugin has its own marketplace auto-update preference in `marketplace.autoUpdatePlugins`:

> [Screenshot: per-plugin upgrade card with Auto-update toggle and version picker]

| Toggle | Behavior |
|--------|----------|
| **Auto-update off** | Admin upgrades manually |
| **Auto-update enabled** | Platform installs newer compatible versions automatically during the daily check |

The marketplace compatibility check compares registry metadata and package/bundle constraints against the running platform version. If a plugin requires a newer MINT platform, install/update actions are disabled until the platform itself is upgraded. Registry data can fall back to the local cache when the remote catalog is temporarily unavailable.

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
| Platform | Restore the previous image/runtime artifact and database backup |
| Plugin | `snapshot.py` captures the Python environment before install / upgrade / uninstall; rollback restores package versions best-effort |

Plugin environment snapshots are useful for Python package recovery, but they are not a substitute for database backups before major schema changes.

## Auto-issued bug reports

When the platform or a plugin raises an unhandled exception, `github_issue_service` can automatically open a deduplicated GitHub issue with the stack trace and request context (no PII). For the platform itself, it's controlled by the `errorReporting` config section. Disabled by default.

## Next

→ [Marketplace](/workflow/marketplace) — install and request plugins
→ [Plugin development → Operations](/sdk/operations/) — building, versioning, publishing
