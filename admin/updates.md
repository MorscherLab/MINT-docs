# Updates

MINT's update story has three related checks: the **platform** runtime, the bundled **mint-sdk** package, and the **plugins** installed on top of it. Platform and SDK updates are checked from GitHub releases; marketplace plugin updates are checked from the configured registry.

> [Screenshot: Admin -> Plugins -> Installed showing the platform release card and plugin update badges]

Keep the platform, Python SDK and frontend SDK on matching releases; plugins retain their own
package versions and are distributed as `.mint` bundles. Read the
[release notes](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md), the
[notable changes](/changelog#notable-changes-in-1-3) and the [SDK upgrade guide](/sdk/operations/upgrading) before updating.

## Platform updates

Configured under `updates` in `config.json`:

```json
{
  "updates": {
    "autoCheckEnabled": true,
    "checkIntervalHours": 24,
    "autoApplyEnabled": false,
    "autoApplyTime": "03:00",
    "autoApplyPlatform": true,
    "autoApplyPlugins": true,
    "platformRepo": "MorscherLab/MINT",
    "includePrereleases": false
  }
}
```

| Field | Effect |
|-------|--------|
| `autoCheckEnabled` | Background update checks (default `false`). Checks only report availability; they install nothing |
| `checkIntervalHours` | How often the background checker polls the GitHub release feed (default `24`, at least `1`) |
| `autoApplyEnabled` | [Scheduled updates](#scheduled-updates) (default `false`) |
| `autoApplyTime` | Daily run time, server-local `HH:MM` 24-hour format (default `03:00`) |
| `autoApplyPlatform` | Scheduled updates include the platform (default `true`) |
| `autoApplyPlugins` | Scheduled updates include plugins (default `true`) |
| `platformRepo` | Where to pull platform releases from — usually unchanged |
| `includePrereleases` | Include GitHub prereleases in the update list |
| `pluginSources` | Optional per-plugin GitHub release sources used outside the marketplace registry |

The background checker always runs and re-reads `autoCheckEnabled` every minute, so turning checks on or off takes effect without a restart.

Users with `plugins.configure` and `platform.configure` can edit these settings under **Admin -> Plugins -> Installed -> Advanced -> Update settings**; saving writes them to `config.json`. See [Plugins → Update settings](/admin/plugins#update-settings).

When a newer platform release is found, a release card appears in **Admin -> Plugins -> Installed** for users with `platform.configure`. Click **Apply Bundle** (or **Update** when the release has no runtime bundle), then restart when asked. The CLI equivalent is `mint platform update check` followed by `mint platform update apply --yes`. Startup applies pending platform migrations; it does not
rerun completed revisions. Plan a maintenance window and verify readiness and
plugin status after restart. A rolling restart alone does not guarantee a
zero-downtime schema upgrade.

Platform updates, plugin installs, upgrades and uninstalls, plugin lock rollbacks and SDK updates share one lock and run one at a time.

### Scheduled updates

With `updates.autoApplyEnabled`, MINT checks for updates once a day at `autoApplyTime` (server-local time) and installs them without an administrator:

1. It stages every available plugin update (when `autoApplyPlugins` is on), then the platform update (when `autoApplyPlatform` is on).
2. The batch is all-or-nothing. If one step fails, MINT discards the plugin updates it staged in this run and does not stage the platform.
3. When everything staged, MINT requests one supervised restart, which activates the staged updates.

A plugin update that an administrator already staged by hand is kept as is. If another plugin or platform operation is running at the scheduled time, the batch does not start and retries every minute. Every step is written to the [audit log](/admin/platform-settings#logs-and-audit-log) as `plugin.upgrade` or `platform.update` with the system actor.

Plugins are staged against the running platform. A plugin release that needs the newer platform therefore fails the batch and holds the platform update back; apply the platform update by hand in that case.

::: warning Scheduled updates need a restart supervisor
The scheduled restart exits the MINT process and relies on a supervisor to start it again. MINT allows scheduled updates only when one of these is set:

- `MINT_DAEMON=1`, which `mint platform daemon start` and `mint platform daemon install-service` set;
- `MINT_RESTART_SUPERVISED=1`, which the [Docker Compose file](/admin/install-docker#build-and-start) sets.

Without either, the **Scheduled updates** toggle is disabled with the hint "Requires mint platform daemon or MINT_RESTART_SUPERVISED=1." `GET /api/updates/config` reports the result as `restartSupported`. For a systemd unit that runs `mint daemon` directly, see [Install directly → Run as a systemd service](/admin/install-direct#run-as-a-systemd-service).
:::

`updates.autoApplyEnabled` is separate from the Docker entrypoint's `MINT_UPDATES__AUTO_APPLY_ON_STARTUP` below, which applies a platform bundle only when a container is created.

### Runtime bundles

By default MINT updates itself by applying the release's `mint-platform-<version>.tar.gz` runtime bundle; it does not run `git checkout`. This covers both Docker and the [direct install](/admin/install-direct). If the release asset is private or rate-limited, set `updates.githubToken` (`MINT_UPDATES__GITHUB_TOKEN`) before applying updates.

For unattended Docker updates, opt in with:

```bash
MINT_UPDATES__AUTO_APPLY_ON_STARTUP=true
```

On each container creation or recreation, the entrypoint checks for a newer platform bundle and applies it when available. A safely rejected candidate leaves the current version running; a staging or activation failure that could leave a mixed runtime stops the container from starting. Leave this off when your lab requires scheduled maintenance windows or manual release review.

### Database migrations

Startup applies pending platform Alembic revisions. A database that still carries the pre-Alembic integer migration history (a `schema_migrations` table and no Alembic revision) is refused, and MINT exits with:

```
This database still uses the pre-Alembic integer migration history, which MINT 1.3 no longer runs: upgrade to MINT 1.2.x (>= 1.2.2) first, then to 1.3.
```

See [Upgrading from MINT 1.1](#upgrading-from-mint-1-1). Developer `mint db` inspection and revision commands never apply migrations.

For Alembic plugins, administration exposes backend, current/target revision,
pending migration count and errors. A failed plugin migration leaves the
plugin disabled before initialization. See [Plugin migrations](/admin/plugins#plugin-migrations).

## Upgrading from MINT 1.1

MINT 1.3 upgrades only databases that MINT 1.2.2 or later has already adopted into Alembic. The upgrade path is:

1. **1.1 (or 1.2.0 / 1.2.1) → 1.2.x (1.2.2 or later).** From 1.2.0 or 1.2.1, apply the normal platform update to the latest 1.2.x. From 1.1, follow the [1.2.9 upgrade guide](https://mint-docs.morscherlab.org/v1.2.9/admin/updates#upgrading-from-mint-1-1). That release moves the platform to PostgreSQL-only configuration, completes the legacy integer migrations and adopts the database into Alembic. Start it once and confirm it is healthy.
2. **1.2.x → 1.3.** Update as described in [Platform updates](#platform-updates).

MINT 1.3 no longer ships the 1.1 → 1.2 Docker bridge `scripts/prepare-docker-upgrade.sh` or the `python -m api.migrations` command. If you still need the bridge, run it from a 1.2.x checkout.

::: danger No downgrade to 1.2.1 or earlier
Once a database has an Alembic revision (any database started by 1.2.2 or later), do not start MINT 1.2.1 or earlier on it. Those releases do not recognise Alembic and have no guard. To go back, restore a database backup taken before the upgrade.
:::

After the first 1.3 start:

- Check **Admin -> Plugins -> Installed** for plugins disabled by the dependency lock. See [Plugin dependency lock](/admin/plugins#plugin-dependency-lock).
- Every existing role receives `instruments.view`; the Admin role also receives `instruments.edit`. Review custom roles. See [Permissions](/reference/permissions#instruments-2).

## Plugin updates

Plugin updates are surfaced in **Admin -> Plugins -> Installed** and **Admin -> Plugins -> Registry**, with an **Update** action when the registry advertises a newer compatible version.

> [Screenshot: installed plugin row with Update ready badge]

Automatic plugin updates are set per plugin in `config.json`; there is no toggle in the web UI:

```json
{
  "marketplace": {
    "autoUpdatePlugins": { "my-plugin": true }
  }
}
```

A user with `plugins.configure` can also set it with `PUT /api/marketplace/auto-update/{plugin_name}`. When at least one plugin is listed at startup, MINT checks every `marketplace.cacheTtlMinutes` (default 60) and installs newer compatible versions of the enabled plugins. A restart is still needed before new code runs. To install plugin updates and restart automatically, use [Scheduled updates](#scheduled-updates) instead.

The marketplace compatibility check compares registry metadata and package/bundle constraints against the running platform version. If a plugin requires a newer MINT platform, install/update actions are disabled until the platform itself is upgraded. Registry data can fall back to the local cache when the remote catalog is temporarily unavailable.

## Prereleases

Setting `updates.includePrereleases` to `true` opts the platform update checker into GitHub prereleases. Useful for:

- Testing forthcoming releases against your real plugins before stable lands
- Reproducing bugs against a candidate fix
- Plugin authors who need a new SDK feature ahead of stable

Prereleases follow the same migration discipline as stable — migrations are forward-only and tested — but the API surface or UI may change between prereleases. Don't run prereleases on a production lab instance without a rollback plan.

## Rollback

MINT update checks do not replace deployment backups. Before platform upgrades, take a normal database and deployment backup using your lab's operating procedure.

Coming from 1.1 or 1.2.1 and earlier, complete [Upgrading from MINT 1.1](#upgrading-from-mint-1-1) before applying the platform update.

| Layer | Rollback mechanism |
|-------|--------------------|
| Platform | Restore the previous image/runtime artifact and database backup |
| Plugin | Apply an earlier plugin lock from the lock history (`data/plugins/locks/history/`, the 10 most recent). List entries with `GET /api/plugins/snapshots` (`plugins.configure`) and apply one with `POST /api/plugins/snapshots/{id}/rollback` (`plugins.install`); there is no UI yet |

A lock compiled for another platform version cannot be applied, so plugin lock rollback does not undo a platform upgrade. The lock history restores Python packages only; it is not a substitute for database backups before major schema changes. See [Plugin dependency lock](/admin/plugins#plugin-dependency-lock).

## Auto-issued bug reports

With `errorReporting.enabled`, MINT opens a GitHub issue in `errorReporting.githubRepo` for log records at or above `errorReporting.minLevel` (default `CRITICAL`). Issues are de-duplicated per fingerprint with a cooldown (`cooldownSeconds`, default 3600). The issue body contains the message, traceback, and context fields such as request ID, user ID, plugin, and experiment ID, so point it at a private repository. Disabled by default.

## Next

→ [Marketplace](/guide/marketplace) — install and request plugins
→ [Plugin development → Operations](/sdk/operations/) — building, versioning, publishing
