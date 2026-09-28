# Updates

MINT's update story has three related checks: the **platform** runtime, the bundled **mint-sdk** package, and the **plugins** installed on top of it. Platform and SDK updates are checked from GitHub releases; marketplace plugin updates are checked from the configured registry.

> [Screenshot: Admin -> Platform -> Server and Admin -> Plugins showing platform and plugin update statuses]

Keep the platform, Python SDK and frontend SDK on matching releases; plugins retain their own
package versions and are distributed as `.mint` bundles. Read the
[release notes](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/CHANGELOG.md), the
[notable changes](/changelog#notable-changes-in-1-2) and the [SDK upgrade guide](/sdk/operations/upgrading) before updating.

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

Update status appears in **Admin -> Platform -> Server** alongside platform health and runtime details. Apply the release using the update path supported by your deployment, then
restart when required. Startup applies pending platform migrations; it does not
rerun completed revisions. Plan a maintenance window and verify readiness and
plugin status after restart. A rolling restart alone does not guarantee a
zero-downtime schema upgrade.

### Runtime bundles

Docker/runtime deployments do not have a `.git` checkout inside the container. For that install path, MINT applies the platform release's `mint-platform-*.tar.gz` runtime bundle instead of running `git checkout`. If the GitHub release asset is private or rate-limited, set `MINT_UPDATES__GITHUB_TOKEN` in the container environment before applying updates.

For unattended Docker updates, opt in with:

```bash
MINT_UPDATES__AUTO_APPLY_ON_STARTUP=true
```

On each container creation or recreation, the entrypoint checks for a newer platform bundle, applies it when available, and continues startup even if the preflight update check fails. Leave this off when your lab requires scheduled maintenance windows or manual release review.

### Database adoption and migration status

Startup first completes pending pre-Alembic migrations v001–v031,
then validates the legacy schema/data before adopting `platform_v031`.
Incomplete or unexpected history and baseline drift stop adoption rather than
being stamped silently.

The explicit platform bridge (`python -m api.migrations --database-url ...`)
also applies pending legacy migrations. Developer `mint db` inspection and
revision commands never apply migrations and are not a substitute for that
bridge. See [Upgrading from MINT 1.1](#upgrading-from-mint-1-1).

For Alembic plugins, administration exposes backend, current/target revision,
pending migration count and errors. A failed Alembic migration leaves the
plugin disabled before initialization. Other plugin migration styles remain
supported; adopting the new runtime is a deliberate plugin change.

## Upgrading from MINT 1.1

::: warning SQLite platform data needs a separate migration plan
MINT 1.2 has no SQLite platform backend and does not ship an automatic SQLite-to-PostgreSQL converter. If an older deployment has platform data in SQLite, keep an offline backup and migrate and verify that data with your normal database tooling before starting 1.2. The SDK's standalone local database remains SQLite and does not need to be converted merely because the platform is upgraded.
:::

### Configure PostgreSQL only

Remove the old database selector from `config.json`:

```json
{
  "database": {
    "host": "postgres",
    "port": 5432,
    "databaseName": "mint_db"
  },
  "DB_USERNAME": "mint",
  "DB_PASSWORD": "secret"
}
```

Also remove `MINT_DATABASE__MODE` from systemd, Compose, Kubernetes, and shell environments. `devMode: true` still bypasses authentication, but it now uses the configured PostgreSQL connection instead of substituting a local SQLite database.

SQLite remains supported for plugin-owned standalone storage through `mint-sdk[local-db]`. Calls through `self.get_plugin_db_session()` continue to use SQLite under `mint dev` and a plugin-scoped PostgreSQL schema when installed.

### Database migrations

Platform startup now uses the shared SDK Alembic runtime. Existing installations
first complete pending legacy integer migrations through **v031**, then validate
and adopt the frozen `platform_v031` baseline. Fresh databases use packaged
Alembic revisions. Platform and plugin schemas keep independent migration
histories and database ownership.

The legacy bridge can also be run explicitly from the platform environment:

```bash
uv run python -m api.migrations --database-url "$MINT_LEGACY_DATABASE_URL"
```

Set `MINT_LEGACY_DATABASE_URL` to the intended PostgreSQL database using the
platform's synchronous SQLAlchemy driver. **This command applies pending
legacy migrations**; it is not an inspection command. Startup normally invokes
the bridge itself. Running it does not repair schema drift or data from
migrations already recorded as complete, and it does not replace the subsequent
Alembic adoption checks.

Adoption requires the exact v001–v031 history and the expected baseline schema.
It rejects missing/unexpected revisions, schema drift, and invalid current data.
From 1.2.3, valid `cancelled` experiments, deliberately revoked `plugins.use`
permissions, and historically deleted or custom Viewer roles are accepted.
For a genuine validation failure, back up and inspect the fields/record IDs in
the diagnostic before correcting the data. Do not erase history or stamp a
baseline merely to make startup pass.

## Plugin updates

Plugin updates are surfaced in **Admin -> Plugins -> Installed** and **Admin -> Plugins -> Registry**, with an **Update** action when the registry advertises a newer compatible version. Each plugin has its own marketplace auto-update preference in `marketplace.autoUpdatePlugins`:

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

For the 1.1 to 1.2 boundary, complete [Upgrading from MINT 1.1](#upgrading-from-mint-1-1) and the plugin [migration guide](/sdk/operations/migrate-1.1-to-1.2) before applying the platform update.

| Layer | Rollback mechanism |
|-------|--------------------|
| Platform | Restore the previous image/runtime artifact and database backup |
| Plugin | `snapshot.py` captures the Python environment before install / upgrade / uninstall; rollback restores package versions best-effort |

Plugin environment snapshots are useful for Python package recovery, but they are not a substitute for database backups before major schema changes.

## Auto-issued bug reports

When the platform or a plugin raises an unhandled exception, `github_issue_service` can automatically open a deduplicated GitHub issue with the stack trace and request context (no PII). For the platform itself, it's controlled by the `errorReporting` config section. Disabled by default.

## Next

→ [Marketplace](/guide/marketplace) — install and request plugins
→ [Plugin development → Operations](/sdk/operations/) — building, versioning, publishing
