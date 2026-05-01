# Updates

MINT's update story has two layers: the **platform** itself (the FastAPI backend + bundled frontend + `mint` CLI) and the **plugins** installed on top of it. Each layer updates independently and can be configured to auto-check, auto-install, or remain on a pinned version.

> [Screenshot: Admin → Updates page showing platform and plugin update statuses]

## Platform updates

Configured under `updates` in `config.json`:

```json
{
  "updates": {
    "enabled": true,
    "channel": "stable",
    "checkIntervalHours": 24,
    "githubRepo": "MorscherLab/mld",
    "autoInstall": false
  }
}
```

| Field | Effect |
|-------|--------|
| `enabled` | Master on/off switch |
| `channel` | `stable` (default) or `beta` |
| `checkIntervalHours` | How often `update_service` polls the GitHub release feed |
| `githubRepo` | Where to pull releases from — usually unchanged |
| `autoInstall` | If `true`, installs new releases as they appear; otherwise admins click **Install** manually |

Update notifications appear in **Admin → Updates** with the diff of the changelog and a single **Install** button. Installation:

1. Stops the running MINT process gracefully
2. Replaces the wheel
3. Re-applies platform migrations
4. Restarts the process

There is a brief outage during the swap. For zero-downtime upgrades, run two MINT replicas behind a load balancer and rolling-restart them.

## Plugin updates

Plugin updates are surfaced in **Admin → Plugins**, with a per-plugin **Upgrade** button when the registry advertises a newer compatible version. Each plugin has its own auto-update preference (defaults to off):

> [Screenshot: per-plugin upgrade card with Auto-update toggle and version picker]

| Toggle | Behavior |
|--------|----------|
| **Auto-update off** (default) | Admin upgrades manually |
| **Auto-update enabled** | Platform installs newer compatible versions automatically during the daily check |
| **Pin version** | Locks the plugin at a specific version even if newer ones appear |

The marketplace's compatibility check matches the plugin's declared SDK range against the platform's bundled `mint-sdk` version — if a plugin needs a newer SDK than the current platform offers, it's hidden from the upgrade button until the platform itself is updated.

## Beta channel

Setting the platform `channel` to `beta` opts you in to pre-release builds tagged `*-beta.*`. Useful for:

- Testing forthcoming releases against your real plugins before stable lands
- Reproducing bugs against a candidate fix
- Plugin authors who need a new SDK feature ahead of stable

Beta releases follow the same migration discipline as stable — migrations are forward-only and tested — but the API surface or UI may change between betas. Don't run beta on a production lab instance without a rollback plan.

## Pinning

Pin a plugin's version to opt out of auto-updates without disabling the global feature:

```json
{
  "plugins": {
    "pin": {
      "mint-ms-designer": "1.4.0",
      "mint-plugin-drp": "0.9.2"
    }
  }
}
```

Pinned plugins still show "Update available" in the UI, but the upgrade button is replaced with a notice saying the plugin is pinned.

## Rollback

Both platform and plugin upgrades take pre-upgrade snapshots:

| Layer | Rollback mechanism |
|-------|--------------------|
| Platform | `update_service` keeps the previous wheel for 7 days; click **Roll back** under **Admin → Updates** |
| Plugin | `snapshot.py` captures the database + filesystem state before the upgrade; the **Roll back** button restores from snapshot |

After the retention window, the snapshot is purged. For longer retention, do a separate database backup before any major upgrade.

## Auto-issued bug reports

When the platform or a plugin raises an unhandled exception, `github_issue_service` can automatically open a deduplicated GitHub issue with the stack trace and request context (no PII). It's enabled per-plugin via the plugin's marketplace metadata; for the platform itself, it's controlled by `observability.autoIssue`. Disabled by default.

## Next

→ [Marketplace](/workflow/marketplace) — install and request plugins
→ [Plugin development → Operations](/sdk/operations/) — building, versioning, publishing
