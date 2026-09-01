# Troubleshooting

If something isn't working, check here first. If your problem isn't listed, [open an issue](https://github.com/MorscherLab/MINT/issues) with the steps to reproduce.

## Install / launch

| Problem | Cause | Fix |
|---------|-------|-----|
| `command not found: mint` | Install location not on PATH | `uv tool update-shell` (uv) or add `~/.local/bin` to PATH (pip) |
| Port 8001 already in use | Another process is on the port | Stop the conflicting process or change `--port` in the systemd unit |
| Browser shows "Cannot connect" | Platform process crashed | `journalctl -u mint -n 200` (direct install) or `docker compose logs mint` (Docker); restart |
| MINT starts but no logo / styles | Browser cached an old build | Hard-refresh with **⌘⇧R** (Mac) or **Ctrl+Shift+R** (Win/Linux) |
| Migration fails with advisory-lock error | Two MINT processes started simultaneously | Stop one, let the other finish, restart |
| Plugin migration fails on platform startup | A plugin's migration raised | Platform exits non-zero; **Admin -> Plugins -> Installed** (after restart from a known-good plugin set) shows the error. Fix the plugin's migration in a follow-up release. |

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
| Plugin upgrade fails partway | New migration crashed | Platform rolls back to the previous version; **Admin -> Plugins -> Installed** shows the error; fix the migration in a new plugin release |
| Plugin process keeps crashing | Plugin error in `initialize()` or a request handler | In development, run `mint dev logs backend --lines 100`; in production, use **Admin -> Platform -> Server**, **Admin -> Platform -> Logs**, or the platform service logs. If the failure came from a generated analysis run, also check the plugin page's job status tray. |
| `mint dev` can't find the plugin | Working directory has no `pyproject.toml` with `mint.plugins` entry point | `cd` into the plugin root, or `mint init` to scaffold |
| Plugin appears installed but routes return 404 | Plugin failed `initialize()` and the loader skipped mounting | **Admin -> Plugins -> Installed** shows the failure reason; fix and reload |

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
