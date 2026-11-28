# Plugins

This page tells administrators how to install, check, update and remove plugins. The platform holds projects, experiments, members and the marketplace. Plugins add all lab-specific functions, for example LC-MS sequence design, drug-response prediction, importers and viewers.

![Installed plugins list with running plugins, one plugin disabled by the dependency lock and one plugin with a Restart required badge](/screenshots/admin/plugins-installed.webp)

Each plugin has a type that sets its default experiment write policy. See [How plugins attach data](/guide/data-model#how-plugins-attach-data). Plugin authors: see [Plugin types](/sdk/concepts/plugin-types).

## Plugin states

**Admin -> Plugins -> Installed** shows one of these states for each plugin:

- **Installed but not loaded yet**, with a **Restart required** badge: the package is installed, but MINT does not serve its routes until the server restarts.
- **Running**: MINT mounted the routes, jobs, generated UI and frontend assets of the plugin.
- **Update ready**: an update check found a newer release. Click **Update** to install it. See [Plugin updates](/admin/updates#plugin-updates).
- **Updating**: an update is in progress.
- **Migration failed**: a plugin migration failed. See [Plugin migrations](#plugin-migrations).
- **Disabled**: the plugin does not load, for example after the [dependency lock](#startup-reconcile) disabled it.

For each phase from the plugin side, see [Plugin lifecycle](/sdk/concepts/lifecycle).

## Install steps

To install a plugin, use **Admin -> Plugins -> Registry**, upload a `.mint` bundle, or run `mint platform plugin upload` or `mint platform plugin github install` (see [mint CLI](/admin/cli#plugins)). MINT then does these checks:

1. The registry entry must be compatible with the running platform version (`min_platform_version`).
2. For a GitHub release, MINT downloads the asset that matches `source.asset_pattern`.
3. A `.mint` bundle must have a `manifest.json`, and its `requires_mint` must admit the platform. An administrator can force the install past `requires_mint`. A bundle without `manifest.json` gets "Invalid .mint bundle: bundle has no manifest.json". Rebuild it with `mint build`.
4. The plugin's `mint-sdk` requirement must admit the platform's `mint-sdk`, because plugins always run the platform's SDK. Otherwise MINT refuses the install, for example: `Plugin requires mint-sdk>=1.3.0,<1.4, platform has 1.4.3.` The same check runs for subprocess installs and at startup restore.
5. MINT compiles the [plugin dependency lock](#plugin-dependency-lock) with the new plugin and installs the package exactly as the lock pins it.
6. MINT reports whether a restart is necessary. At the next start, MINT applies the plugin migrations, resolves the settings, runs `initialize(context)`, and mounts the plugin.

There is no progress dialog. The upload or install button shows a spinner until all steps are complete. Then a message above **Install a plugin** tells you the result, for example "Plugin installed successfully. Restart the server to load it."

![Install a plugin card with the message Plugin installed successfully. Restart the server to load it.](/screenshots/admin/plugins-install-bundle.webp)

After the install, open **Admin -> Plugins -> Installed**. If the plugin shows **Restart required**, restart the server.

If an install fails, MINT reports the failing step. The plugin stays uninstalled or needs cleanup, depending on the step. A dependency conflict opens a retry-with-force dialog. Use force only when you understand the dependency change.

Plugin installs, upgrades, uninstalls, lock rollbacks, and plugin and platform updates run one at a time. A second operation waits until the first one ends.

Other install rules:

- `POST /api/plugins/install` accepts a package name, a Git URL, a wheel or an sdist. A local or editable source works only in dev mode. The route refuses a `.mint` file name and a `github:` release: upload the bundle, or install the release from the marketplace.
- A plugin named `platform` (any case) does not load. The name is reserved for platform events.
- MINT refuses a GitHub plugin update with an invalid bundle when it stages the update. If a staged update is later missing, is not a valid ZIP archive, or excludes the running platform, MINT moves it to `<server.dataPath>/updates/failed/plugins` with the reason and starts normally.

To remove a plugin, click **Uninstall** on its card in **Admin -> Plugins -> Installed**. See [Uninstall modes](#uninstall-modes).

## Who can install

- The **Registry** section needs `plugins.configure` or `plugins.install`.
- The install and update buttons on the registry cards appear only for a platform administrator (the `admin` role).
- `POST /api/marketplace/install/{plugin_name}` and `POST /api/marketplace/uninstall/{plugin_name}` need `plugins.install`.
- There are no install requests.

## Plugin dependency lock

In-process plugins share the platform's Python environment. MINT controls their packages with a lock in `<server.dataPath>/plugins/locks/`:

| File | Contents |
|------|----------|
| `requirements.in` | One requirement for each in-process plugin, in install order |
| `state.json` | The structured copy of `requirements.in`, plus the disabled plugins. It is the only install record of in-process plugins |
| `plugins.lock` | The hashed lock. `uv pip compile` makes it, with the platform's own lock as constraints. It leaves out platform-owned packages |
| `history/` | The 10 most recent previous locks, as rollback points |

Every install, upgrade and uninstall edits `requirements.in` and compiles the lock again:

- If the lock does not resolve, MINT blocks the operation and shows the resolver error.
- MINT compares the old and the new lock. If the new lock changes or removes packages, the operation stops until you retry with force (`force=true` in the API). A plugin downgrade also needs force.
- MINT uninstalls packages that leave the lock. It never uninstalls platform-owned packages.
- `POST /api/plugins/{name}/upgrade` fails for a plugin that the lock does not track. A local or editable source can upgrade only in dev mode. An upgrade of a disabled plugin enables it again.

### Source policy

| Source | Locked by |
|--------|-----------|
| Package index, wheel, `.mint` bundle | Version and hash |
| Git | Commit |
| Source distribution | Hash. Marked as not reproducible, because it is built at install |
| Local path or editable install | Not locked. Accepted only in dev mode |

### Startup reconcile

At each start, MINT makes the platform environment agree with the lock. It restores in-process plugins from `state.json` only. MINT does not install a plugin that is in `data/plugins/manifest.json` but not in `state.json`; install it again.

- At the first start without a lock, MINT builds the lock from the manifest. It uses the cached wheel, then the release download, then the installed package, then the source.
- After a platform upgrade, MINT compiles the lock again. It disables a plugin that does not resolve: a plugin that is incompatible with the new platform, or, of two conflicting plugins, the one installed later.
- MINT reinstalls locked packages that are missing, for example after a container rebuild.
- If a locked wheel is gone and the plugin came from a GitHub release, MINT downloads the wheel again. It does this only when a compile or a reinstall needs the wheel.
- If MINT cannot reinstall a locked artifact (a local wheel that is gone, or a hash mismatch), it disables only that plugin. It tries again at each later start.
- If the lock does not compile for another reason, for example an unreachable package index, MINT changes nothing and restores no plugin. It tries again at the next start.
- Outside dev mode, MINT disables plugins from local or editable sources.

A disabled plugin appears at the bottom of **Admin -> Plugins -> Installed** as **Disabled by the dependency lock — `<package>`: `<reason>`**. `GET /api/plugins` lists it under `dependency_lock`. Typical reasons start with:

- `Plugin requires mint-sdk…`
- `Incompatible with MINT <version>`
- `Conflicts with earlier-installed plugin(s) …`
- `Could not reinstall from the plugin lock`
- `Local and editable plugin sources are only allowed in dev mode.`

To fix it, install a compatible plugin release, or uninstall the plugin from the row's action menu.

![Installed plugins footer with a Disabled by the dependency lock row and its Incompatible with MINT reason](/screenshots/admin/plugins-dependency-lock-disabled.webp)

The row shows the start of the reason. Point to the row to see the full reason.

### Rollback

A rollback applies a lock from `history/` and makes it current. There is no UI. Use the API or `mint platform plugin rollback`, then restart the platform.

| Action | Route | Permission |
|--------|-------|------------|
| List history | `GET /api/plugins/snapshots` | `plugins.configure` |
| Show one entry | `GET /api/plugins/snapshots/{id}` | `plugins.configure` |
| Apply it | `POST /api/plugins/snapshots/{id}/rollback` | `plugins.install` |

- A plugin that the rollback removes stays removed after a restart.
- If the rollback fails, MINT applies the current lock again.
- MINT refuses a lock that it compiled for another platform version. A rollback cannot undo a platform upgrade.
- Outside dev mode, MINT refuses a lock with local or editable sources.
- A rollback restores Python packages only. It does not undo plugin database migrations. Keep database backups.

### Cache cleanup

A daily task, `uv_cache_prune`, runs `uv cache prune --ci` under the plugin operation lock. It removes the downloaded wheels and keeps the wheels built from source. The next plugin install downloads its wheels again. The task does not run in dev mode.

## Event deliveries

MINT delivers plugin events through a durable event bus, at least once, with retries. For the delivery rules, see [Delivery rules](/sdk/concepts/plugin-communication#delivery-rules).

To see the deliveries of one plugin:

1. Open **Admin -> Plugins -> Installed**.
2. Open the action menu of the plugin card.
3. Choose **Event deliveries**. This needs `plugins.configure`.

The list shows the 50 most recent deliveries, newest first. Each row has the event name, the event number, the attempts, the time, the last error and a status.

| Status | Meaning |
|--------|---------|
| `pending` | MINT did not deliver the event yet |
| `processing` | MINT is delivering the event now |
| `delivered` | The plugin accepted the event |
| `skipped` | The plugin was disabled or uninstalled |
| `dead` | The delivery failed five times |

To try a dead delivery again, click **Retry**. It gets five new attempts. The [audit log](/admin/platform-settings#logs-and-audit-log) records each retry as `plugin.event_retry`. The API routes are `GET /api/plugins/{name}/event-deliveries` and `POST /api/plugins/{name}/event-deliveries/{event_id}/retry`. Both need `plugins.configure`.

A daily task deletes delivered and skipped deliveries after 7 days and dead deliveries after 30 days. An uninstall drops the unfinished deliveries of the plugin.

![Event deliveries dialog of the Run log plugin with one dead delivery, its last error and a Retry button, and two delivered events](/screenshots/admin/plugins-event-deliveries.webp)

## Plugins that read other plugins

A plugin with `"*"` in `reads_from` can read every enabled plugin, but only after an administrator consents. To consent, a platform administrator sets the plugin setting `reads_from_any_plugin` with `PATCH /api/plugins/{name}/config`. Until then, `GET /api/plugins` shows `reads_from_consent_needed` for the plugin. See [Read every plugin](/sdk/concepts/plugin-communication#read-every-plugin-reads-from).

## MCP skills and tasks

The `/mcp` endpoint serves plugin skills and runs plugin jobs as tasks. There is no setting for them. For users, see [Skills](/guide/ai-and-api#skills) and [Jobs as background tasks](/guide/ai-and-api#jobs-as-background-tasks). For the skill rules, see [MCP skills](/sdk/recipes/mcp-skills#rules).

- MINT serves the skills of every enabled plugin. There is no switch for each plugin. The AI assistant reads a skill as instructions, so install only plugins that you trust.
- When MINT refuses a skill, the log has the warning `Skipping MCP skill '<name>' of plugin '<plugin>': <reason>`.
- A plugin from the dev proxy (`config.dev.toml`) serves skills only in dev mode.
- A platform restart, also a scheduled update, ends every task. The client reports it as failed.
- When a user stops a task in the client, MINT cancels the job. The audit log records `mcp.tool_call` of `tasks/cancel`.

## Plugin requests and credentials

With authentication on, every request to a plugin route needs an `Authorization: Bearer` credential: a session token, a [personal access token](/admin/authentication#personal-access-tokens) or a [service token](/admin/authentication#service-tokens). This applies to the plugin proxy and to in-process plugin routes. For the responses, see [Platform authentication gate](/sdk/recipes/route-permissions#platform-authentication-gate).

- MINT does not read the session cookie on plugin routes. A plugin cannot declare a public path.
- A plugin that checked its own ingest key must use a service token.
- With authentication off, plugin routes stay open.

## Isolation

A plugin runs in the platform process or in its own runtime. For the runtime types, see [Runtime isolation](/sdk/concepts/isolation). For administrators:

- An administrator with `plugins.install` registers an external HTTP runtime (`POST /api/plugins/runtime/external`) or a Docker-managed runtime (`POST /api/plugins/runtime/docker`).
- No API installs a subprocess plugin. MINT restores subprocess plugins only from existing manifest entries.
- A subprocess plugin has its own hashed `plugin.lock` next to its wheel. MINT installs and restores its venv with `uv pip install --no-deps -r plugin.lock`. MINT installs `mint-sdk[server]` into each venv, so an offline `find-links` directory must also hold the `uvicorn[standard]` wheels.
- A gone local-source wheel, a hash mismatch, or a wheel that excludes the platform `mint-sdk` leaves a subprocess plugin disabled. After a platform upgrade, MINT compiles the lock again and rebuilds the venv.
- MINT refuses a runtime whose prefix is `/` or conflicts with another route, and logs an error. See [Runtime isolation](/sdk/concepts/isolation#runtime-comparison).
- Plugin processes reach the platform at `127.0.0.1:<MINT_LISTEN_PORT>`; see [`server`](/admin/configuration#server). A Docker plugin uses `server.externalUrl`, or else `host.docker.internal:<port>`.
- After a plugin process starts, MINT polls its `GET /__mint/health` route. A degraded or unhealthy answer marks the plugin degraded. If a process exits before its port opens, MINT starts it again on the same port.
- MINT sends a settings write for a plugin in its own process to that process. When the process does not answer, the write fails with 503. See [Settings revisions](/sdk/concepts/lifecycle#settings-revisions-and-runtime-changes).
- A plugin crash does not stop the platform.

**Admin -> System -> Server** shows a **Plugin processes** card with the name, status, port, start time and restart count of each plugin process.

## Plugin migrations

Plugins that own database tables ship Alembic revisions. See [Migrations](/sdk/concepts/migrations). The admin UI shows:

- `schema_revision`: the applied revision of the plugin.
- `pending_migrations`: the revisions that the plugin knows but has not applied.
- `migration_error`: the reason of a failed migration.

If a migration fails, the plugin shows **Migration failed** and stays disabled. MINT does not mount its routes, and the rest of MINT keeps running. Install a fixed plugin release and restart; MINT then tries the pending migrations again. A plugin that still defines the removed `get_migrations_package()` also stays disabled, with the reason in `migration_error`. Its author must move to `Metadata.database`; see [Migrations reference](/sdk/api/migrations).

Schema drift against the plugin's models shows as a warning badge and does not disable the plugin.

## Update settings

The **Update settings** card on **Admin -> System -> Updates** edits the `updates` section of `config.json`. For what each setting does, see [Updates](/admin/updates#platform-updates). The permissions:

- The schedule and the checks need `platform.configure`.
- **Admin -> Plugins -> Advanced** holds only the private package indexes and needs `plugins.configure`.
- Changes to where plugin code comes from need `plugins.install`: the private package indexes (`PUT /api/plugins/config/extra-index-urls`), the update sources (`PUT|DELETE /api/updates/sources/{package}`) and the **Plugin pre-releases** switch. A role with `plugins.configure` but not `plugins.install` gets 403.
- The audit log records these writes as `plugins.extra_index_urls_update` (values redacted), `updates.source_update` and `updates.source_delete`.

The release list of a GitHub plugin source comes from `GET /api/updates/releases` (`plugins.install`). When GitHub answers 401 or 404, the list shows 400 `update_source.repository_inaccessible` with one of these messages:

| Message | Cause | Fix |
|---------|-------|-----|
| GitHub rejected the configured token | The GitHub token expired or was revoked | Replace the token in the update settings |
| GitHub repository `<owner>/<repo>` does not exist, or the configured GitHub token cannot read it | The repository name is wrong, or the token cannot read the private repository | Correct the repository, or give the token read access |
| GitHub repository `<owner>/<repo>` does not exist, or it is private | No token is set, and the repository is wrong or private | Correct the repository, or set `updates.githubToken` (`MINT_UPDATES__GITHUB_TOKEN`) |

## Uninstall modes

| Mode | Effect on data |
|------|----------------|
| keep | MINT uninstalls the package and keeps the plugin tables and rows. A reinstall can use them again. The admin UI and `mint platform plugin uninstall` always use this mode |
| archive | MINT renames the plugin schema to `_archived_<schema>_<date>`. No code reads it, but a database administrator can recover it |
| purge | MINT drops the plugin schema with all tables. It needs a confirmation token that is the plugin name. This cannot be undone |

Archive and purge are available only in the plugin manager, not in the UI or the CLI. Take a database backup before you use them or remove a schema by hand.

An uninstall also:

- Revokes the plugin's [service tokens](/admin/authentication#service-tokens). MINT retries a failed revocation at the next start. After a reinstall, issue a new token.
- Records the cleanup of notifications and calendar feeds, so that MINT can finish it after an interrupted uninstall.

## Plugin access levels

A plugin tags each endpoint, job, MCP tool and page with an access level (`use`, `configure` or `admin`). See [Plugin access levels](/admin/users-roles#plugin-access-levels).
