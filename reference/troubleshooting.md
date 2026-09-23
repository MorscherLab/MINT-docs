# Troubleshooting

If something isn't working, check here first. If your problem isn't listed, [open an issue](https://github.com/MorscherLab/MINT/issues) with the steps to reproduce.

## Install / launch

| Problem | Cause | Fix |
|---------|-------|-----|
| `command not found: mint` | CLI not installed or its location is not on PATH | Install `mint-sdk[cli]`, then run `uv tool update-shell` (uv) or add `~/.local/bin` to PATH (pip); see [CLI setup](/cli/overview#install-the-1-2-cli) |
| `mint` reports missing `typer` | Plain `mint-sdk` was installed without CLI dependencies | For a uv tool, run `uv tool install --force 'mint-sdk[cli]==1.2.6'`; in a scaffolded project, run `uv sync` and use `uv run mint` |
| Local serving reports missing `uvicorn` | Server dependencies are missing in the active environment | Keep `mint-sdk[cli,server]` in the project's dev dependency group, run `uv sync`, then `uv run mint dev` |
| Port 8001 already in use | Another process is on the port | Stop the conflicting process or change `--port` in the systemd unit |
| Browser shows "Cannot connect" | Platform process crashed | `journalctl -u mint -n 200` (direct install) or `docker compose logs mint` (Docker); restart |
| MINT starts but no logo / styles | Browser cached an old build | Hard-refresh with **⌘⇧R** (Mac) or **Ctrl+Shift+R** (Win/Linux) |
| Migration fails with advisory-lock error | Two MINT processes started simultaneously | Stop one, let the other finish, restart |
| Alembic plugin migration fails on startup | Migration, ownership, history or model/schema validation failed | The plugin remains disabled before initialization. Inspect migration status in **Admin -> Plugins -> Installed** and the platform logs; fix the cause in a reviewed plugin release. |

## Authentication

| Problem | Cause | Fix |
|---------|-------|-----|
| Login loops back to the page | Cookies blocked for the platform domain | Allow cookies and reload |
| "Invalid credentials" with the right password | JWT secret rotated mid-session | Sign in again — token rotation invalidates active sessions |
| Passkey prompt fails | Browser doesn't support WebAuthn, or platform is on `127.0.0.1` over HTTP from a non-localhost browser | Use a recent Chrome/Safari/Firefox/Edge; serve over HTTPS for non-loopback access |
| SWITCH edu-ID button missing | `sso.eduid.enabled` is false or the frontend is still using cached auth config | Enable `sso.eduid`, reload the page, and confirm `/api/auth/config` returns `sso.eduid.enabled: true` |
| edu-ID callback fails | Missing `server.externalUrl`, missing `openid` scope, or callback URL not registered with edu-ID | Set `server.externalUrl` to the public HTTPS URL and register `<externalUrl>/api/auth/sso/eduid/callback` with edu-ID |
| "Rate limit exceeded" on auth | More than 20 attempts in 60s from your IP | Wait 60s; if you're behind a proxy that doesn't forward `X-Forwarded-For`, configure it to do so |
| All admins lost access | Last admin demoted by mistake | Recover by editing the database directly: set the desired user's role back to Admin (`UPDATE users SET role_id = ...`) |

## Projects and experiments

| Problem | Cause | Fix |
|---------|-------|-----|
| "Permission denied" on a project I should see | Missing system permission, missing project membership, or restricted visibility | Ask the project lead or an admin to check your access |
| Experiment status pill won't change | The plugin owning the type rejects the transition | Check the plugin's UI for blockers (missing required fields, unfinished steps) |
| Auto-assigned experiment code skipped a number | Code generator allocates per-attempt; failed creates can leave gaps | Cosmetic only; codes are unique, not gapless |
| Deleted experiment needs recovery | Experiment delete removes the row from the database | Restore from your platform-level database backup; the UI does not currently provide an undo window |

## Plugins

| Problem | Cause | Fix |
|---------|-------|-----|
| Plugin install fails with a dependency conflict | Plugin requires a clashing dep | The platform retries with an isolated venv automatically; if that also fails, the plugin's deps are inconsistent — open an issue against the plugin |
| Plugin tile not visible to a user | User lacks the plugin role | **Admin -> Plugins -> Installed -> Access control** — grant the appropriate plugin role |
| Plugin upgrade fails partway | Installation or migration failed | Inspect **Admin -> Plugins -> Installed** and logs. Package snapshots are best-effort recovery; they do not undo database changes. Use the verified deployment/database backup when needed. |
| Plugin process keeps crashing | Plugin error in `initialize()` or a request handler | In development, run `mint dev logs backend --lines 100`; in production, use **Admin -> Platform -> Server**, **Admin -> Platform -> Logs**, or the platform service logs. If the failure came from a generated analysis run, also check the plugin page's job status tray. |
| `mint dev` can't find the plugin | Working directory has no `pyproject.toml` with `mint.plugins` entry point | `cd` into the plugin root, or `mint init` to scaffold |
| Plugin appears installed but routes return 404 | Plugin failed `initialize()` and the loader skipped mounting | **Admin -> Plugins -> Installed** shows the failure reason; fix and reload |

## Jobs and file browsing (1.2.4–1.2.6)

| Problem | Check | Next step |
|---------|-------|-----------|
| Failed job only shows `Job failed (job …)` | Platform and plugin SDK version | Upgrade together to 1.2.6; handler failures now report exception type/message. Preserve the job ID when reporting the problem. |
| Worker traceback is absent from admin logs | Runtime is older than 1.2.6 | In 1.2.6 the worker sends its traceback to the host logger. Check **Admin -> Platform -> Logs** or service logs by job ID. |
| Finished analysis fails with `Job worker could not be stopped` | Runtime version and host resource pressure | 1.2.5 adds up to 30 seconds of post-SIGKILL cleanup wait. On 1.2.6, inspect process/kernel cleanup and resource pressure; this message is not the analysis timeout. |
| Newly added server files are missing from a picker | Cached directory metadata | Use refresh or close and reopen the picker. Since 1.2.4, refresh invalidates directory snapshots and reopening re-reads the location. |
| A directory looks empty after filtering | Search/type filters and mount visibility | Clear filters and refresh; 1.2.4 keeps expansion controls available for filtered zero counts. Hidden paths and mount permissions still apply. |

## Marketplace

| Problem | Cause | Fix |
|---------|-------|-----|
| Marketplace shows zero plugins | Registry URL unreachable, or registry returns malformed JSON | Check `marketplace.registryUrl`; visit the URL manually to validate |
| "Install request" never gets approved | No admin with `plugins.install` has reviewed it | Ask an admin with plugin-install permission to approve or deny the request |
| Plugin shows "incompatible" | The registry entry requires a newer MINT platform version | Upgrade the platform first; only then can you install / upgrade the plugin |

## Updates

| Problem | Cause | Fix |
|---------|-------|-----|
| "Update available" notification keeps coming back | Background update checks are enabled and a newer release exists | Install the update or set `updates.autoCheckEnabled: false` |
| Platform update breaks a plugin | Plugin needs a fix for the new SDK | Restore the previous platform deployment/database backup until the plugin is updated |
| Prereleases do not show up | Prerelease checks are disabled, or you're already on the newest tag | Set `updates.includePrereleases: true` if you intentionally want prereleases |
| Docker container updates on restart when you did not expect it | Startup auto-update is enabled | Set `MINT_UPDATES__AUTO_APPLY_ON_STARTUP=false` and redeploy |
| Docker startup auto-update fails but MINT still starts | The entrypoint treats startup update failures as warnings | Check `docker compose logs mint`, fix GitHub token/network/release access, then restart when ready |

## Admin terminal

| Problem | Cause | Fix |
|---------|-------|-----|
| **Admin -> Platform -> Terminal** shows disabled | `adminTerminalEnabled` is false | Set `MINT_ADMIN_TERMINAL_ENABLED=true` or `"adminTerminalEnabled": true`, then restart MINT |
| Terminal tab missing | User lacks `platform.configure`, or admin tabs are filtered by role | Ask an admin to assign a role with `platform.configure` |
| Terminal connects then closes | The short-lived WebSocket token expired or another session replaced it | Click connect again; only one terminal session per user is kept active |
| Startup command does not rerun after container recreation | Startup script was not saved/executable or path was overridden | Check `/app/data/admin-terminal/startup.sh` or `MINT_ADMIN_TERMINAL_STARTUP_SCRIPT` in container logs |

## Database / observability

| Problem | Cause | Fix |
|---------|-------|-----|
| Disk full | Plugin artifact uploads fill `server.dataPath` | Move `server.dataPath` to a larger volume, or purge unused plugin caches |
| Slow queries on Postgres | Missing index on a plugin-owned table | Add the index in a new plugin migration |
| OpenTelemetry exporter errors in logs | OTLP endpoint unreachable | Set `observability.enabled: false` until fixed; the rest of the platform keeps working |
| Auto-issued GitHub bug reports flooding | A recurring bug spams unique stack traces | Disable `errorReporting.enabled` until the bug is fixed |

### Legacy adoption after upgrading from 1.2.1 or earlier

Platform startup completes pending legacy integer migrations through v031 before
validating the Alembic baseline. Errors naming missing history or baseline
schema drift are genuine checks, not instructions to delete the migration
ledger or stamp it manually.

Use 1.2.3 or later (this guide targets **1.2.6, 17 September 2026**) when adopting
a legacy database: the corrected validator accepts `cancelled` experiments and
preserves deliberate plugin-permission revocations and historical/custom Viewer
roles. For a remaining data validation error, back up and inspect the listed
fields and record IDs. The bridge only runs pending migrations; it does not
repair invalid data left after a migration was already marked complete.

`mint db current/check/revision` are developer inspection/authoring commands,
not repair commands. The separate platform `python -m api.migrations
--database-url ...` command applies pending legacy migrations and normally runs
implicitly at startup. Follow the [migration guide](/sdk/operations/migrating-to-1.2#database-migrations-from-1-2-2)
before using it explicitly.

Release evidence: [1.2.6 changelog](https://github.com/MorscherLab/MINT/blob/v1.2.6/CHANGELOG.md),
[adoption validator](https://github.com/MorscherLab/MINT/blob/v1.2.6/api/migrations/alembic_adoption.py),
[plugin loader](https://github.com/MorscherLab/MINT/blob/v1.2.6/api/plugins/loader.py).

## Hosted (lab) mode

| Problem | Cause | Fix |
|---------|-------|-----|
| "Plugin not visible" after login | No access to the plugin | Ask your admin to grant the plugin role |
| Files I expect aren't listed | Admin hasn't shared the folder with the plugin | Ask admin to add the folder to the plugin's allowed paths |
| "Server error" during a long analysis | Lab server out of disk or memory | Report to the lab administrator; the issue is server-side |

## Still stuck?

1. **Check the logs** — `journalctl -u mint -n 200` (direct install), `docker compose logs mint` (Docker), or **Admin -> Platform -> Logs** in the UI — for error messages.
2. **Search [GitHub issues](https://github.com/MorscherLab/MINT/issues)** — someone may have hit it before.
3. **Open a new issue** with: MINT version (`mint --version`), OS, the steps you took, and the error message. Include the request ID from the failing response if available — every response carries one and it indexes the structured logs.
