# Updates

This page tells administrators how to update the platform and the plugins. A platform update includes the matching `mint-sdk`. MINT checks platform updates on GitHub releases and plugin updates in the configured registry.

Before an update, read the [release notes](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md) and the [notable changes](/changelog). Keep the platform, the Python SDK and the frontend SDK on matching releases. Plugins have their own versions.

## The Updates page

**Admin -> System -> Updates** shows platform and plugin updates on one page. The page needs `plugins.view` and `platform.configure` or `plugins.install`. The rail item shows the number of available updates.

> [Screenshot: Admin -> System -> Updates with the status strip, one platform update and two plugin updates in Available updates, and the Update settings card]

| Part | Contents |
|------|----------|
| **Status strip** | The platform version and the newer release, the number of plugins with updates, the schedule, and the time of the last check |
| **Available updates** | One row for the platform (needs `platform.configure`) and one row for each plugin (needs `plugins.install`). Each row has an **Update platform** or **Update** button. **Update all plugins** applies every plugin update. **Plugin pre-releases** adds plugin pre-releases to the check |
| **Update settings** | Schedule, checks and plugin sources. See [Platform updates](#platform-updates) |

The page shows the result of the last check and does not call GitHub. Before the first check, the strip shows **not checked yet**. Click **Check now** to query the update sources. A successful update, manual or scheduled, removes its row at once. The API is `GET /api/updates/status` (`plugins.view`). It returns the last check from memory, with `checkedAt` set to `null` before the first check.

**Admin -> Plugins -> Installed** shows a link with the number of available updates, and an **Update** button on each plugin card that has one.

## Platform updates

The `updates` section of `config.json` holds the settings:

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
| `autoCheckEnabled` | Background update checks (default `false`). A check only reports updates. It installs nothing |
| `checkIntervalHours` | Interval of the background check (default `24`, at least `1`) |
| `autoApplyEnabled` | [Scheduled updates](#scheduled-updates) (default `false`) |
| `autoApplyTime` | Daily run time, server-local, `HH:MM` 24-hour format (default `03:00`) |
| `autoApplyPlatform` | Scheduled updates include the platform (default `true`) |
| `autoApplyPlugins` | Scheduled updates include plugins (default `true`) |
| `platformRepo` | Repository of platform releases (default `MorscherLab/MINT`) |
| `githubToken` | GitHub token for a private or rate-limited release (env `MINT_UPDATES__GITHUB_TOKEN`) |
| `includePrereleases` | Include GitHub pre-releases. See [Pre-releases](#prereleases) |
| `pluginSources` | GitHub release sources for plugins outside the marketplace registry |

The background checker reads `autoCheckEnabled` again every minute. A change takes effect without a restart.

To edit the settings in the UI, use the **Update settings** card: **Schedule** (scheduled updates, daily time, scope), **Checks** (background checks, interval, platform repository, GitHub token status, platform pre-releases) and **Plugin sources**. Saving writes `config.json`. For the permissions, see [Plugins -> Update settings](/admin/plugins#update-settings).

To apply a platform update:

1. Take a database backup.
2. Open **Admin -> System -> Updates**.
3. Click **Update platform** in the platform row.
4. Restart MINT when asked.
5. Check readiness and the plugin states.

With the CLI, run `mint platform update check`, then `mint platform update apply --yes`.

Startup applies the pending platform migrations. A rolling restart does not make a schema upgrade free of downtime. Plan a maintenance window.

### Plugins that exclude the new platform version

A plugin built for SDK 1.4 or later admits every 1.x platform; see [Declare compatibility deliberately](/sdk/operations/versioning#declare-compatibility-deliberately). A plugin that pins one minor excludes the next minor platform. MINT does not block the update in that case:

1. When you apply the update, MINT finds the newest compatible release of each excluded plugin and lists it. MINT stages nothing before you confirm.
2. Review the list in the **Update to MINT `<version>`** dialog, then click **Update**.
3. The listed plugin releases switch with the platform at the next restart. The audit log records each switch as `plugin.upgrade`.
4. A plugin without a compatible release is listed under **Plugins without a compatible release**. To continue, select **Disable these plugins until a compatible release is installed**. The plugin stays disabled until you install a compatible release.

> [Screenshot: Update to MINT dialog with one paired plugin release and one plugin under Plugins without a compatible release]

With the CLI, `mint platform update apply` shows the paired releases and the plugins to disable, and asks. With `--yes` or `--json`, confirm them with flags:

```bash
mint platform update apply --yes --pair-all --disable <package>
```

A plugin that you do not name is never disabled. For the flags and the exit codes, see [`mint platform update`](/sdk/api/cli-reference#mint-platform-update). With `--json`, the answer has `pairing_required: true` and the flags in `confirm_with`.

This flow does not cover installs from a Git checkout.

Updates and other plugin operations run one at a time; see [Install steps](/admin/plugins#install-steps).

### Scheduled updates

With `updates.autoApplyEnabled`, MINT checks for updates once a day at `autoApplyTime` (server-local time) and installs them:

1. MINT stages every plugin update (with `autoApplyPlugins`), then the platform update (with `autoApplyPlatform`). A plugin release for the platform version of the batch is staged against that version. When the new platform excludes an installed plugin, the batch pairs the plugin with a compatible release.
2. The batch is all-or-nothing. If one step fails, MINT discards the plugin updates of this run and does not stage the platform.
3. When all steps succeed, MINT requests one supervised restart. The restart activates the staged updates.

A plugin update that an administrator staged by hand stays as it is. If another plugin or platform operation runs at the scheduled time, the batch tries again every minute. The [audit log](/admin/platform-settings#logs-and-audit-log) records every step as `plugin.upgrade` or `platform.update` with the system actor.

The batch fails, and disables no plugin, in these cases:

- An excluded plugin has no release for the new platform version.
- `autoApplyPlugins` is off, and the platform update needs plugin releases.
- Pairing would replace a plugin update that an administrator staged.

In each case, apply the platform update by hand on **Admin -> System -> Updates**.

::: warning Scheduled updates need a restart supervisor
A scheduled restart stops the MINT process. A supervisor must start it again. MINT allows scheduled updates only when one of these variables is set:

- `MINT_DAEMON=1`. `mint-platform daemon start` and `mint-platform daemon install-service` set it.
- `MINT_RESTART_SUPERVISED=1`. The [Docker Compose file](/admin/install-docker#build-and-start) sets it.

Without either variable, the **Scheduled updates** switch is disabled with the hint "Requires mint-platform daemon or MINT_RESTART_SUPERVISED=1." `GET /api/updates/config` reports the result as `restartSupported`. For a systemd unit that runs `mint-platform serve`, see [Run as a systemd service](/admin/install-direct#run-as-a-systemd-service).
:::

### Runtime bundles

MINT updates itself with the release's `mint-platform-<version>.tar.gz` runtime bundle. It does not run `git checkout`. This applies to Docker and to the [direct install](/admin/install-direct). If the release asset is private or rate-limited, set `updates.githubToken` (`MINT_UPDATES__GITHUB_TOKEN`) first.

A Docker container can also apply a newer bundle each time it is created. This is separate from `updates.autoApplyEnabled`. To turn it on, set:

```bash
MINT_UPDATES__AUTO_APPLY_ON_STARTUP=true
```

- At each container creation, the entrypoint checks for a newer platform bundle and applies it.
- If MINT rejects the bundle safely, the current version keeps running.
- If staging or activation fails in a way that could leave a mixed runtime, the container does not start and logs the reason.
- Leave it off when your lab needs maintenance windows or a manual release review.

### Database migrations

Startup applies pending platform Alembic revisions. Platform migrations go forward only. MINT refuses a database that still has the integer migration history from before Alembic (a `schema_migrations` table and no Alembic revision), and exits with:

```
This database still uses the pre-Alembic integer migration history, which MINT 1.3 no longer runs: upgrade to MINT 1.2.x (>= 1.2.2) first, then to 1.3.
```

See [Upgrading from MINT 1.1](#upgrading-from-mint-1-1). The developer `mint db` commands never apply migrations.

For plugin migrations, see [Plugin migrations](/admin/plugins#plugin-migrations).

## Upgrading from MINT 1.1

MINT 1.3 and later upgrade only a database that MINT 1.2.2 or later adopted into Alembic. Do these steps:

1. Update to the latest 1.2.x (1.2.2 or later). From 1.2.0 or 1.2.1, use the normal platform update. From 1.1, follow the [1.2.9 upgrade guide](https://mint-docs.morscherlab.org/v1.2.9/admin/updates#upgrading-from-mint-1-1).
2. Start 1.2.x once and make sure that it is healthy.
3. Update to 1.3 as in [Platform updates](#platform-updates).

MINT 1.3 does not ship the 1.1 → 1.2 Docker script `scripts/prepare-docker-upgrade.sh` or the `python -m api.migrations` command. To use them, run them from a 1.2.x checkout.

::: danger No downgrade to 1.2.1 or earlier
Do not start MINT 1.2.1 or earlier on a database that has an Alembic revision. Those releases do not know Alembic and have no guard. To go back, restore a database backup from before the upgrade.
:::

Before you upgrade to MINT 1.3:

- Install Python 3.14. MINT 1.3 needs it; the Docker image is `python:3.14-slim`. Each compiled dependency of an installed plugin needs a `cp314` or `abi3` wheel. See [Requirements](/admin/install-direct#requirements).
- Set up a [restart supervisor](#scheduled-updates) if you use scheduled updates.
- Make sure that scripts and plugin frontends send a Bearer credential to plugin routes. See [Plugin requests and credentials](/admin/plugins#plugin-requests-and-credentials).

After the first 1.3 start:

- Open **Admin -> Plugins -> Installed** and look for plugins that the dependency lock disabled. See [Plugin dependency lock](/admin/plugins#plugin-dependency-lock).
- Review custom roles. Every existing role received `instruments.view`, and the Admin role received `instruments.edit`. See [Permissions](/reference/permissions#instruments-2).

## Upgrading from MINT 1.3

Back up the database first. Database revisions run at startup and cannot be undone.

1. **Plugin releases.** MINT 1.4 needs `mint-sdk>=1.4.0b1`. At the first 1.4 start, MINT disables each plugin built for SDK 1.3 and shows the reason in **Admin -> Plugins -> Installed**. An in-process plugin is removed from the platform environment, and a subprocess plugin loses its virtual environment. Plugin data, design data, artifacts and plugin tables stay. The log has one ERROR line for each disabled plugin. Install the 1.4 release of each plugin from the marketplace or as a `.mint` upload. An install enables a disabled in-process plugin again. An update from the admin page of a 1.3 platform pairs each GitHub-release plugin with its release for 1.4.
2. **Docker.** A 1.3 container cannot update itself, because the runtime bundle protocol is 3. Pull the 1.4 image or rebuild. See [Install with Docker](/admin/install-docker#upgrades).
3. **Local daemon.** Stop a 1.3 daemon with `mint platform daemon stop` before the upgrade. The 1.4 `mint-platform daemon status|stop` cannot find a 1.3 supervisor. To stop such a process, use the `supervisor_pid` in `.mint/daemon/state.json`. After the upgrade, run `mint-platform daemon start`. If a systemd user service runs MINT, run `mint-platform daemon install-service` again, because the old unit starts a module that 1.4 removed.
4. **Plugin roles.** The upgrade drops the `user_plugin_roles` table and removes `plugins.configure` from the Member role. Before the upgrade, give each person who must configure plugins a custom role with `plugins.configure`. See [Plugin access levels](/admin/users-roles#plugin-access-levels).
5. **Source routes.** The routes that change where plugin code comes from need `plugins.install`. See [Plugins -> Update settings](/admin/plugins#update-settings).
6. **Job limits.** The `jobs` limits also apply to subprocess and Docker plugins. Check them. See [`jobs`](/admin/configuration#jobs).
7. **Marketplace.** The auto-updater and the install requests are removed. A pending request stays in the `plugin_install_requests` table, but no screen shows it. If you need it, read it with SQL before the upgrade.
8. **Config-declared plugins.** MINT ignores `plugins.plugins` in `config.json`. Install each plugin as a package.
9. **Plugin lock.** In-process plugins restore from `data/plugins/locks/state.json` only. Install again each plugin that is in `manifest.json` but not in `state.json`.
10. **Environment names.** Rename the `MLD_` variables. See [Coming from MLD?](/reference/faq#coming-from-mld).
11. **Removed routes.** Scripts must not call `/api/users/{id}/role|activate|deactivate`, `DELETE /api/users/{id}`, `PUT /api/users/{id}/reset-password`, `/api/admin/plugins*`, `/api/admin/plugin-roles*`, `/api/marketplace/requests*`, `/api/marketplace/auto-update*`, or the per-section `PATCH /api/admin/config/<section>` routes. Use the `/api/admin/users` routes and `PATCH /api/admin/config` with the section as a key.
12. **Scripts and CI.** Use the current commands of the [mint CLI](/admin/cli).

For the changes for plugin authors, see [Migrate from 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4).

## Upgrading from MINT 1.4

Back up the database first. Database revisions run at startup and cannot be undone.

1. **Database.** Update from 1.4.x directly. Six Alembic revisions run at the first 1.5 start. One of them drops the unused `plugin_install_requests` table with its rows.
2. **Docker.** A 1.4 container can update itself to 1.5, but an in-app update replaces only the Python packages. The 1.5 base image has Debian security updates and no system `pip`. Change the Compose image to `ghcr.io/morscherlab/mint:1.5` and run `docker compose pull && docker compose up -d`. In the new image, use `uv pip` in the admin terminal. See [Install with Docker](/admin/install-docker#upgrades).
3. **Plugins.** A plugin with the range `mint-sdk>=1.4.0,<2.0` stays enabled. Check **Admin -> Plugins -> Installed** after the first start.
4. **Realtime stream.** It is on by default. See [`realtimeEnabled`](/admin/configuration#realtimeenabled).
5. **Second factor.** The authenticator app (TOTP) stays off until you set `auth.enableTotp`. See [Authenticator app](/admin/authentication#authenticator-app-totp).
6. **Updates page.** The update controls are on **Admin -> System -> Updates**. See [The Updates page](#the-updates-page).
7. **Teams and Slack.** A single `webhookUrl` becomes the channel `default`. See [Teams and Slack channels](/admin/platform-settings#teams-and-slack-channels).
8. **Roles.** The Admin role gets the new permission `notifications.broadcast`. Give it to other roles that send notifications to other people. See [Permissions](/reference/permissions#notifications-2).

## Upgrading from MINT 1.5

Update from 1.5.x or 1.4.x directly. There is no intermediate release.

### Before the update

1. **Back up the database and the data directory.** Two Alembic revisions run at the first 1.6 start. `platform_after_save_index` adds a partial index on `plugin_events`. `platform_object_cleanup_kind` adds the `kind` column to the object cleanup journal. Neither revision drops data. For Docker, see [Backups](/admin/install-docker#backups).
2. **Turn off platform pre-releases.** The update applies the newest release that the update settings admit. With **Platform pre-releases** on (`updates.includePrereleases`), that is the newest pre-release, not the newest stable 1.6 release.
3. **Check the plugins.** A plugin with the range `mint-sdk>=1.x,<2.0` loads unchanged. A plugin whose own requirements do not resolve against the 1.6 platform lock is disabled at the first 1.6 start. Ask the plugin authors for 1.6 releases first. Plugin authors: see [Migrate from 1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6).
4. **Check the worker count.** Startup refuses more than one worker. See [Run one process](/admin/install-direct#run-one-process).

### Apply the update

1. Open **Admin -> System -> Updates** and click **Update platform**. With the CLI, run `mint platform update apply`.
2. If the update needs plugin changes, confirm them in the dialog, or with `--pair-all` and `--disable PACKAGE` in the CLI. See [Plugins that exclude the new platform version](#plugins-that-exclude-the-new-platform-version).
3. Restart MINT when asked, or run `mint platform restart`.

For Docker, a 1.5 container can update itself in the app, because the runtime bundle protocol is still 3. The in-app update puts 1.6 into the container, not into the image. A container that you create again from a 1.5 image starts 1.5 code on the 1.6 database and does not start. After the update, do one of these steps:

- Set the image in the Compose file to `ghcr.io/morscherlab/mint:1.6`.
- If you build the image from the repository, check out the 1.6 release tag before the next build.

See [Install with Docker](/admin/install-docker#upgrades).

### After the update

- **Plugins.** Open **Admin -> Plugins -> Installed**. A disabled plugin shows the reason: a `mint-sdk` range that excludes 1.6, or a cap below a new platform floor such as `sqlalchemy<2.1`. Install a release that admits 1.6. See [Changes without a new plugin release](/sdk/operations/migrate-1.5-to-1.6#changes-without-a-new-plugin-release).
- **Plugin locks.** `mint platform plugin rollback` refuses a lock from before the upgrade.
- **Scripts.** Many refusals have a specific error `code`. The HTTP status does not change. A script that compares `code` with a generic code, such as `resource.not_found`, must use the new code or the HTTP status. See [Error codes](/reference/error-codes).

For all other changes in 1.6, see [Notable changes](/changelog).

### Go back to 1.5

You can go back only with the backup. After the first 1.6 start, a 1.5 release refuses the database with `Unknown database revision platform_object_cleanup_kind`. No command runs a downgrade. To go back:

1. Stop the platform.
2. Restore the database dump from before the update.
3. Start the 1.5 release with the data directory from before the update.

## Plugin updates

**Available updates** on **Admin -> System -> Updates** lists plugin updates. **Admin -> Plugins -> Installed** has an **Update** button on each plugin card with an update. **Admin -> Plugins -> Registry** shows the registry versions.

> [Screenshot: installed plugin card with the Update ready badge]

The [scheduled update batch](#scheduled-updates) is the only automatic plugin updater. It updates every plugin that has an update source. A marketplace install registers one. There is no opt-in for each plugin. To update only plugins automatically:

1. Set `updates.autoApplyEnabled` and `updates.autoApplyPlugins` to `true`.
2. Set `updates.autoApplyPlatform` to `false`.
3. Make sure that a [restart supervisor](#scheduled-updates) runs MINT.

The marketplace compares the registry metadata and the package constraints with the running platform version. If a plugin needs a newer platform, the install and update actions stay disabled until you update the platform. When the remote catalog is not available, MINT can use the local registry cache.

## Pre-releases {#prereleases}

With `updates.includePrereleases` set to `true`, the platform update check includes GitHub pre-releases. Use them to test a release candidate against your plugins, or to check a bug fix. The API and the UI can change between pre-releases. Do not run pre-releases on a production instance without a rollback plan.

## Rollback

Update checks do not replace backups. Before a platform upgrade, back up the database and the deployment with your lab's procedure.

| Layer | Rollback |
|-------|----------|
| Platform | Restore the previous image or runtime bundle and the database backup |
| Plugin | Apply an earlier plugin lock. See [Plugin lock rollback](/admin/plugins#rollback) |

## Auto-issued bug reports

With `errorReporting.enabled` (off by default), MINT opens a GitHub issue in `errorReporting.githubRepo` for each log record at or above `errorReporting.minLevel` (default `CRITICAL`). MINT opens one issue per fingerprint within a cooldown (`cooldownSeconds`, default 3600). The issue holds the message, the traceback, and context such as the request ID, user ID, plugin and experiment ID. Use a private repository.
