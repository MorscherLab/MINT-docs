# Troubleshooting

Find your problem in the tables below. If it is not listed, [open an issue](https://github.com/MorscherLab/MINT/issues) with the steps to reproduce.

## Install and start

| Problem | Cause | Fix |
|---------|-------|-----|
| `command not found: mint` | The CLI is not installed, or its folder is not on PATH | Install the CLI; see [mint CLI -> Install](/admin/cli#install) |
| `mint` reports missing `typer` | `mint-sdk` was installed without the CLI extra | For a uv tool, run `uv tool install --force 'mint-sdk[cli]==@MINT_VERSION@'`. In a scaffolded project, run `uv sync` and use `uv run mint` |
| Local serving reports missing `uvicorn` | The server dependencies are missing in the active environment | Keep `mint-sdk[cli,server]` in the dev dependency group of the project, run `uv sync`, then `uv run mint dev` |
| Port 8001 already in use | Another process uses the port | Stop the other process, or change `--port` in the systemd unit |
| Plugin processes cannot reach the platform after a bare `uvicorn` start | `MINT_LISTEN_PORT` is not set, so plugins use port 8001 | Start with `mint-platform serve --port <N>`, or set `MINT_LISTEN_PORT`. See [Configuration -> `server`](/admin/configuration#server) |
| Startup fails with a multiple-worker error | More than one worker is set | Run one worker. See [Install directly](/admin/install-direct) |
| `mint platform daemon` not found, or `mint-platform daemon status` shows "not running" after the 1.4 upgrade | The 1.3 supervisor was started with `mint platform daemon`. The 1.4 command cannot see it | Stop the old supervisor with the `supervisor_pid` in `.mint/daemon/state.json`, then run `mint-platform daemon start` |
| The browser shows "Cannot connect" | The platform process stopped | Read the logs: `journalctl -u mint -n 200` (direct install) or `docker compose -f deploy/docker/docker-compose.yml logs app` (Docker). Restart MINT |
| MINT starts without logo or styles | The browser cached an old build | Reload without cache: **⌘⇧R** (Mac) or **Ctrl+Shift+R** (Windows, Linux) |
| A restart takes a long time | A startup phase is slow, for example `plugin_restore` or `isolated_plugins` | Read the startup log. MINT writes one line per phase (`Startup phase '<name>' took 1.03s`) and a summary (`Startup complete in 3.90s (database=0.41s, ...)`). The phase with the largest time is the cause |
| A migration fails with an advisory-lock error | Two MINT processes started at the same time | Stop one, let the other finish, and restart |
| MINT stops at startup with "This database still uses the pre-Alembic integer migration history, which MINT 1.3 no longer runs" | The database never ran on MINT 1.2.2 or later | Upgrade your MINT 1.2.x deployment to 1.2.2 or later, start it once, then upgrade to 1.3. Do not create or stamp `alembic_version` by hand. See [Upgrading from MINT 1.1](/admin/updates#upgrading-from-mint-1-1) |
| A 1.5 release stops at startup with `Unknown database revision platform_object_cleanup_kind` | MINT 1.6 ran on this database. A 1.5 release cannot run on it, and there is no downgrade | Start MINT 1.6, or restore the backups from before the upgrade. See [Go back to 1.5](/admin/updates#go-back-to-1-5) |
| Pages show errors, and the browser console shows a `TypeError` | The browser is too old | See [Supported browsers](/guide/access#supported-browsers) |
| A plugin migration fails at startup | The migration failed, or the plugin still defines the removed `get_migrations_package()` (`migration_error`) | The plugin stays disabled. See [Plugins -> Plugin migrations](/admin/plugins#plugin-migrations) |

## Authentication

| Problem | Cause | Fix |
|---------|-------|-----|
| Sign-in loops back to the sign-in page | The browser blocks cookies, or users open MINT over HTTP while `server.externalUrl` is `https://` | Allow cookies, and open MINT at the `externalUrl` address. See [Reverse proxy -> Public URL](/admin/reverse-proxy#public-url) |
| "Account is temporarily locked" | Too many failed password sign-ins | Wait for the lockout to end. See [Authentication -> Sign in with a password](/admin/authentication#sign-in-with-a-password) |
| 423 on a password change | Too many wrong current passwords | Wait for the time in `Retry-After`. See [Authentication -> Sign in with a password](/admin/authentication#sign-in-with-a-password) |
| Sign-in fails with the right password | The account is deactivated | Ask an admin to activate it in **Admin -> People & access -> Users** |
| MINT refuses a new password (422 `validation.request`) | The password breaks the length rules | See [Authentication -> Accounts and registration](/admin/authentication#accounts-and-registration) |
| `/register` sends you to the sign-in page | Self-registration is off | Ask an admin to create your account. See [Authentication -> Accounts and registration](/admin/authentication#accounts-and-registration) |
| Signed out after a password change | A password change ends the other sessions of the account | Sign in again with the new password |
| An AI client gets 421 from `/mcp` | The `Host` of the request is not localhost or the host of `server.externalUrl` | See the MCP host check in [Configuration -> Security settings](/admin/configuration#security-settings) |
| The passkey prompt fails | The browser does not support WebAuthn, or MINT is on plain HTTP and the browser is not on localhost | Use a [supported browser](/guide/access#supported-browsers), and serve MINT over HTTPS. Behind a reverse proxy, add the proxy to `server.trustedProxyCidrs` so that MINT uses `X-Forwarded-Host` |
| The SWITCH edu-ID button is missing | `sso.eduid.enabled` is false, or the page uses a cached auth config | Turn on `sso.eduid` and reload. Make sure that `/api/auth/config` returns `sso.eduid.enabled: true` |
| The edu-ID callback fails | `server.externalUrl` or the `openid` scope is missing, or the callback URL is not registered | Set `server.externalUrl` to the public HTTPS URL. Register `<externalUrl>/api/auth/sso/eduid/callback` with edu-ID |
| 401 `auth.second_factor_required` | The session came from a password or edu-ID sign-in, and the second factor is required. `details.second_factor` is `verify` or `enrol` | Finish the second-factor step on the sign-in page. A script must use a personal access token. See [Second factor](/admin/authentication#second-factor) |
| The second factor is on in the settings, but the sign-in has no second step | The site meets none of the enforcement conditions | The startup log names the unmet condition. See [Second factor](/admin/authentication#second-factor) |
| A user lost every passkey and the authenticator app | The second factor blocks the sign-in | See [Authentication -> Recovery](/admin/authentication#recovery) |
| Role create or update returns 422 on `slug` | The slug does not match `^[a-z0-9][a-z0-9_-]*$` | Use lowercase letters, digits, `-` and `_` |
| 409 when you delete, deactivate or demote an administrator | It would remove the last active administrator | Create or keep another administrator first |
| "Rate limit exceeded" on sign-in | Too many auth requests from one client IP | Wait 60 s. Behind a reverse proxy, see [Authentication -> Rate limiting](/admin/authentication#rate-limiting) and [Reverse proxy -> Trusted proxies](/admin/reverse-proxy#trusted-proxies) |
| `mint platform auth login` waits and then fails | The code expired before approval, or the platform restarted | Run the command again. See [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli). The `/device` page must be reachable from your browser; set `server.externalUrl` |
| All admins lost access | The last admin was demoted by mistake | Edit the database: set the role of a user back to Admin (`UPDATE users SET role_id = ...`) |
| A Member or Viewer does not see the **Admin** entry | Their role has no admin-panel permission | This is expected. See [Permissions -> Admin panel](/reference/permissions#admin-panel) |

### Waiting for approval

| Problem | Cause | Fix |
|---------|-------|-----|
| After registration or sign-in, the page says "Waiting for approval" | A self-registered account is inactive until an admin activates it | An admin opens **Admin -> People & access -> Users**, selects the account and chooses **Activate user**. See [Authentication -> Accounts and registration](/admin/authentication#accounts-and-registration) |

## Projects and experiments

| Problem | Cause | Fix |
|---------|-------|-----|
| "Permission denied" on a project that you should see | A system permission or project membership is missing, or visibility is restricted | Ask the project lead or an admin to check your access |
| The experiment status does not change | The plugin of the type refuses the change | Look in the plugin UI for missing required fields or unfinished steps |
| The experiment numbers of a type have a gap | MINT gives the highest number of the type plus 1. A deleted experiment, a removed number, or a sequence that an admin typed leaves a gap | No action. Numbers are unique, not gapless. See [Experiment numbers](/guide/experiments#experiment-numbers) |
| An edit returns 412 `experiment.version_conflict` or `project.version_conflict` | Someone else saved first, so the `If-Match` version is old | Reload and apply the edit again. The UI asks you to reload or overwrite. A write without `If-Match` always wins |
| A deleted experiment must come back | Deletion removes the records and the stored files | Restore the database and object store backups. See [Deleting experiments](/guide/experiments#deleting-experiments) |

## Plugins

| Problem | Cause | Fix |
|---------|-------|-----|
| A plugin install fails with a dependency conflict | The requirements of the plugin do not resolve with the platform and the other plugins, or they change packages that other plugins use | Read the conflict report. Use force only when you understand the change; an unresolvable lock cannot be forced. See [Plugin dependency lock](/admin/plugins#plugin-dependency-lock) |
| The install fails with "Plugin requires mint-sdk<…, platform has …" | The plugin was built for another `mint-sdk` range | Install a plugin release for the running platform, or upgrade the platform |
| After the 1.4 upgrade, every plugin shows **Disabled by the dependency lock** | The 1.3 plugin releases pin `mint-sdk<1.4` | Install the 1.4 release of each plugin. See [Upgrading from MINT 1.3](/admin/updates#upgrading-from-mint-1-3) |
| A plugin does not load, and **Admin** shows no error | Its name is `platform`, or it imports a name that SDK 1.4 removed from the `mint_sdk` root | Read the platform log. The plugin author must rename the plugin or run `mint doctor --fix` |
| A runtime (subprocess, Docker or external) does not start, and the log says that its prefix is taken | The prefix of the plugin is not allowed or is in use | Change `Metadata.prefix`. See [Isolation](/sdk/concepts/isolation) |
| After the 1.4 upgrade, a user cannot change the settings of a plugin | The settings need the `configure` level or a platform administrator | Give the role `plugins.configure`, or ask the author to set `settings_access = "configure"`. See [Plugin access levels](/admin/users-roles#plugin-access-levels) |
| 403 on update sources, private package indexes or the Prereleases toggle | The role does not have `plugins.install` | Give a custom role `plugins.install`, or ask an administrator |
| After a platform upgrade, a plugin shows **Disabled by the dependency lock** | The plugin does not fit the new platform, conflicts with an earlier plugin, or cannot install again from its lock | The row in **Admin -> Plugins -> Installed** shows the reason. Install a compatible release, or uninstall the plugin. See [Startup reconcile](/admin/plugins#startup-reconcile) |
| After the 1.6 upgrade, a plugin is disabled | The requirements of the plugin do not resolve against the 1.6 platform lock | Install a plugin release that admits 1.6. See [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5) |
| `mint platform plugin rollback` refuses a lock after a platform upgrade | The lock was made for another platform release | Use a lock made after the upgrade. To go back to the earlier platform, restore the backups. See [Rollback](/admin/updates#rollback) |
| A plugin operation waits, or a scheduled update is skipped | Plugin operations and platform updates run one at a time | Wait for the running operation to finish. A scheduled batch tries again every minute. See [Plugins](/admin/plugins#install-steps) |
| Plugin calls return 401 `auth.required` | The caller sends no `Authorization: Bearer` credential, or MINT cannot resolve it. Plugin routes do not read the session cookie | See [Plugin requests and credentials](/admin/plugins#plugin-requests-and-credentials) |
| Plugin calls return 503 `auth.unavailable` | MINT cannot reach the database to check the credential | Restore the database connection, then try again |
| A user does not see a plugin | The role does not have `plugins.use` or access to the plugin, or the page needs `configure` and the role does not have `plugins.configure` | Check the role and its **Plugin access** in **Admin -> People & access -> Roles** |
| A plugin upgrade fails partway | The install or the migration failed | Read **Admin -> Plugins -> Installed** and the logs. A failed install applies the previous lock again. [Lock rollback](/admin/plugins#rollback) does not undo database changes; restore the backup if necessary |
| A plugin process stops again and again | An error in `initialize()` or a request handler | In development, run `mint dev logs backend --lines 100`. In production, use **Admin -> System -> Server**, **Admin -> System -> Logs** or the service logs. For a generated analysis run, also read the jobs tray of the plugin page |
| `mint dev` cannot find the plugin | The working directory has no `pyproject.toml` with a `mint.plugins` entry point | Go to the plugin root, or run `mint init` |
| A plugin shows as installed, but its routes return 404 | `initialize()` failed, and the loader did not mount the plugin | **Admin -> Plugins -> Installed** shows the reason. Fix it and reload |

## API clients and scripts

| Problem | Cause | Fix |
|---------|-------|-----|
| A script that compares the error `code` does not match, for example it expects `resource.not_found` | Platform refusals have a specific code, such as `user.not_found` | Compare with the specific code, or use the HTTP status. See [Error codes](/reference/error-codes) |
| An error answer has an unknown `code` | — | Find the code in [Error codes](/reference/error-codes). When you report the problem, give the `request_id` of the answer |

## Jobs and file browsing

| Problem | Cause | Fix |
|---------|-------|-----|
| A failed job shows only `Job failed (job …)` | The platform or the plugin SDK is old | Upgrade the platform and the plugin SDK together. Keep the job ID for the report |
| The worker traceback is not in the admin logs | The worker sends its traceback to the host logger | Search **Admin -> System -> Logs** or the service logs by job ID |
| A finished analysis fails with `Job worker could not be stopped` | The host is short of resources | This is not the analysis timeout. See [Failed jobs and host logs](/sdk/recipes/error-handling#failed-jobs-and-host-logs) |
| New server files are missing from a picker | The picker cached the folder | Click refresh, or close and open the picker again |
| A folder looks empty after filtering | Search or type filters, or mount visibility | Clear the filters and refresh. Hidden paths and mount permissions still apply |
| Files that you expect are not listed | The folder is not a server mount, or your role does not have `filesystem.browse` | Ask an admin. See [Server file browser](/admin/platform-settings#server-file-browser) |

## Marketplace

| Problem | Cause | Fix |
|---------|-------|-----|
| The marketplace shows no plugins | The registry URL is unreachable, or the registry JSON is malformed | Check `marketplace.registryUrl`. Open the URL to check the JSON |
| No install button in the registry | Only platform administrators see it | Ask an administrator. See [Plugins -> Who can install](/admin/plugins#who-can-install) |
| A plugin shows "incompatible" | The plugin needs a newer MINT version | Upgrade the platform first |

## Updates

| Problem | Cause | Fix |
|---------|-------|-----|
| The "Update available" notice comes back | Update checks are on and a newer release exists | Install the update, or set `updates.autoCheckEnabled: false` |
| A platform update breaks a plugin | The plugin needs a fix for the new SDK | Restore the backups of the previous platform until the plugin is updated |
| Prereleases do not show | Prerelease checks are off, or you have the newest tag | Set `updates.includePrereleases: true` if you want prereleases |
| The platform update installed a prerelease | **Platform pre-releases** (`updates.includePrereleases`) is on | Turn off **Platform pre-releases** in the **Update settings** card before the update |
| `mint platform update apply --yes` stops with "confirm these plugin changes: run again with …" | The update pairs or disables plugins, and `--yes` or `--json` does not ask | Run the command again with the flags that it names. See [Plugins that exclude the new platform version](/admin/updates#plugins-that-exclude-the-new-platform-version) |
| The release list of a plugin source says "GitHub rejected the configured token" or "GitHub repository … does not exist" (400 `update_source.repository_inaccessible`) | The token expired or was revoked, the repository name is wrong, or the repository is private and no token can read it | Correct the repository, or set a token with read access in `updates.githubToken` (`MINT_UPDATES__GITHUB_TOKEN`). See [Updates](/admin/updates) |
| After an in-app update in Docker, a new container does not start | The container was created again from the old image | See [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5) |
| A Docker container updates when it restarts, and you did not expect it | Startup auto-update is on | Set `MINT_UPDATES__AUTO_APPLY_ON_STARTUP=false` and deploy again. See [Runtime bundles](/admin/updates#runtime-bundles) |
| Docker startup auto-update is skipped, but MINT starts | MINT refused the update safely and keeps the current runtime | Read `docker compose -f deploy/docker/docker-compose.yml logs app`. Fix the GitHub token, network or release access, then restart |
| The container stops with code 20 at startup | Staging or activating the update failed unsafely | Read the `[mint-entrypoint] ERROR` line in the container logs. Fix the cause, or set `MINT_UPDATES__AUTO_APPLY_ON_STARTUP=false` |
| The **Scheduled updates** toggle is disabled ("Requires mint-platform daemon or MINT_RESTART_SUPERVISED=1.") | No restart supervisor is declared | See [Scheduled updates](/admin/updates#scheduled-updates) |

## Admin terminal

For the conditions, see [Permissions -> Admin terminal](/reference/permissions#admin-terminal).

| Problem | Cause | Fix |
|---------|-------|-----|
| **Admin -> System -> Terminal** shows disabled | `adminTerminalEnabled` is false | Set `MINT_ADMIN_TERMINAL_ENABLED=true` or `"adminTerminalEnabled": true`, then restart MINT |
| The Terminal tab is missing | The user does not have `platform.configure` | Ask an admin for a role with `platform.configure` |
| The terminal connects, then closes | The short-lived WebSocket token expired, or another session replaced it | Connect again. MINT keeps one terminal session per user |
| The terminal closes with "access revoked" | The account was deactivated, its role lost `platform.configure`, or its session was revoked | Sign in again with an account that has `platform.configure` |
| The startup command does not run after the container is created again | The startup script was not saved or is not executable, or its path was changed | Check `/app/data/admin-terminal/startup.sh` or `MINT_ADMIN_TERMINAL_STARTUP_SCRIPT` in the container logs |

## Database and observability

| Problem | Cause | Fix |
|---------|-------|-----|
| Disk full | Plugin artifact uploads fill `server.dataPath` | Move `server.dataPath` to a larger volume, or purge unused plugin caches |
| Slow queries on PostgreSQL | An index is missing on a plugin table | Add the index in a new plugin migration |
| OpenTelemetry exporter errors in the logs | The OTLP endpoint is unreachable | Set `observability.enabled: false` until it is fixed. The rest of the platform keeps working |
| Push notifications do not arrive | Apple Push is not set up, the device registered with a session token, or Apple refused the token | Use **Send test push** in the Apple Push settings. See [Push notifications](/admin/platform-settings#push-notifications) |
| The page does not update when a colleague saves | `realtimeEnabled` is off, or a proxy buffers or closes `GET /api/events` | Remove `MINT_REALTIME_ENABLED=false`. See [Reverse proxy -> Streams and WebSockets](/admin/reverse-proxy#streams-and-websockets) |
| Too many automatic GitHub bug reports | A recurring bug makes many different stack traces | Set `errorReporting.enabled` to false until the bug is fixed |
| "Server error" during a long analysis | The lab server is out of disk or memory | Tell your lab administrator |

## Still stuck?

1. Read the logs: `journalctl -u mint -n 200` (direct install), `docker compose -f deploy/docker/docker-compose.yml logs app` (Docker), or **Admin -> System -> Logs**.
2. Search the [GitHub issues](https://github.com/MorscherLab/MINT/issues).
3. Open a new issue. Give the MINT platform version, the operating system, your steps, and the error message. The Admin navigation footer and `GET /api/health` show the platform version; `mint --version` shows only the CLI version. Give the request ID of the failing response, if there is one. Each response has one, and it finds the entry in the logs.
