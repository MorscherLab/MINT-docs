# Troubleshooting

If something isn't working, check here first. If your problem isn't listed, [open an issue](https://github.com/MorscherLab/mld/issues) with the steps to reproduce.

## Install / launch

| Problem | Cause | Fix |
|---------|-------|-----|
| `command not found: mint` | Install location not on PATH | `uv tool update-shell` (uv) or add `~/.local/bin` to PATH (pip) |
| Port 8001 already in use | Another process is on the port | `mint serve --port 8002` |
| Browser shows "Cannot connect" | Server crashed or terminal closed | Re-run `mint serve`; check the terminal for errors |
| MINT starts but no logo / styles | Browser cached an old build | Hard-refresh with **⌘⇧R** (Mac) or **Ctrl+Shift+R** (Win/Linux) |
| Migration fails with advisory-lock error | Two MINT processes started simultaneously | Stop one, let the other finish, restart |
| `mint serve --migrate-only` exits non-zero | A plugin migration failed | Check **Admin → Plugins** for the migration error; fix the migration; reload the plugin |

## Authentication

| Problem | Cause | Fix |
|---------|-------|-----|
| Login loops back to the page | Cookies blocked for the platform domain | Allow cookies and reload |
| "Invalid credentials" with the right password | JWT secret rotated mid-session | Sign in again — token rotation invalidates active sessions |
| Passkey prompt fails | Browser doesn't support WebAuthn, or platform is on `127.0.0.1` over HTTP from a non-localhost browser | Use a recent Chrome/Safari/Firefox/Edge; serve over HTTPS for non-loopback access |
| "Rate limit exceeded" on auth | More than 20 attempts in 60s from your IP | Wait 60s; if you're behind a proxy that doesn't forward `X-Forwarded-For`, configure it to do so |
| All admins lost access | Last admin demoted by mistake | Recover by editing the database directly: set the desired user's role back to Admin (`UPDATE users SET role_id = ...`) |

## Projects and experiments

| Problem | Cause | Fix |
|---------|-------|-----|
| "Permission denied" on a project I should see | You're not a member, or your project role is read-only | Ask the project owner to add you / promote you |
| Experiment status pill won't change | The plugin owning the type rejects the transition | Check the plugin's UI for blockers (missing required fields, unfinished steps) |
| Auto-assigned experiment code skipped a number | Code generator allocates per-attempt; failed creates can leave gaps | Cosmetic only; codes are unique, not gapless |
| Soft-deleted experiment can't be restored | More than 30 days have passed | Beyond the grace window the row is purged; restore from your platform-level database backup |

## Plugins

| Problem | Cause | Fix |
|---------|-------|-----|
| Plugin install fails with a dependency conflict | Plugin requires a clashing dep | The platform retries with an isolated venv automatically; if that also fails, the plugin's deps are inconsistent — open an issue against the plugin |
| Plugin tile not visible to a user | User lacks the plugin role | **Admin → Plugins → \<plugin> → Users** — grant the appropriate plugin role |
| Plugin upgrade fails partway | New migration crashed | Platform rolls back to the previous version; **Admin → Plugins** shows the error; fix the migration in a new plugin release |
| Plugin process keeps crashing | Plugin error in `initialize()` or a request handler | `mint logs --plugin <slug>` for the trace; or open the experiment that triggered it and check the Jobs panel |
| `mint dev` can't find the plugin | Working directory has no `pyproject.toml` with `mld.plugins` entry point | `cd` into the plugin root, or `mint init` to scaffold |
| Plugin appears installed but routes return 404 | Plugin failed `initialize()` and the loader skipped mounting | **Admin → Plugins** shows the failure reason; fix and reload |

## Marketplace

| Problem | Cause | Fix |
|---------|-------|-----|
| Marketplace shows zero plugins | Registry URL unreachable, or registry returns malformed JSON | Check `marketplace.registryUrl`; visit the URL manually to validate |
| "Install request" never gets approved | No admin has the `marketplace.approve_install` permission | Ensure at least one user holds that permission |
| Plugin shows "incompatible" | The plugin's required SDK is newer than the platform's | Upgrade the platform first; only then can you install / upgrade the plugin |

## Updates

| Problem | Cause | Fix |
|---------|-------|-----|
| "Update available" notification keeps coming back | Auto-install disabled and you closed the dialog | Either install (Admin → Updates) or set `updates.enabled: false` |
| Platform update breaks a plugin | Plugin needs a fix for the new SDK | Roll back the platform update (Admin → Updates → Roll back) until the plugin is updated |
| Beta channel shows no updates | You're already on the newest tag | Switch to `stable` if you intended that |

## Database / observability

| Problem | Cause | Fix |
|---------|-------|-----|
| Disk full | Plugin artifact uploads fill `plugins.dataDir` | Move `dataDir` to a larger volume, or purge unused plugin caches |
| Slow queries on Postgres | Missing index on a plugin-owned table | Add the index in a new plugin migration |
| OpenTelemetry exporter errors in logs | OTLP endpoint unreachable | Set `observability.tracing.enabled: false` until fixed; the rest of the platform keeps working |
| Auto-issued GitHub bug reports flooding | A recurring bug spams unique stack traces | Disable `observability.autoIssue` until the bug is fixed |

## Hosted (lab) mode

| Problem | Cause | Fix |
|---------|-------|-----|
| "Plugin not visible" after login | No access to the plugin | Ask your admin to grant the plugin role |
| Files I expect aren't listed | Admin hasn't shared the folder with the plugin | Ask admin to add the folder to the plugin's allowed paths |
| "Server error" during a long analysis | Lab server out of disk or memory | Report to the lab administrator; the issue is server-side |

## Still stuck?

1. **Check the logs** — `journalctl -u mint -n 200` (direct install), `docker compose logs mint` (Docker), or **Admin → Status** in the UI — for error messages.
2. **Search [GitHub issues](https://github.com/MorscherLab/mld/issues)** — someone may have hit it before.
3. **Open a new issue** with: MINT version (`mint --version`), OS, the steps you took, and the error message. Include the request ID from the failing response if available — every response carries one and it indexes the structured logs.
