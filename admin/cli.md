# mint CLI

The `mint` command talks to a running MINT instance: sign in, script experiment and project changes, administer plugins and users, check health and apply platform updates. It uses the platform's REST API with the same JWT sign-in as the browser UI.

Plugin developers use the same CLI to scaffold and build plugins; see the [CLI reference](/sdk/api/cli-reference), which lists every command and flag.

## Install

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
```

Quote the requirement so shells such as zsh do not interpret the square brackets. The `[cli]` extra supplies the command-line dependencies; the plain `mint-sdk` package does not. To add the extra to an existing bare install, rerun with `uv tool install --force`.

## Verifying the install

```bash
mint --version
# → mint <version>
mint --help
```

If the command isn't found, the install location isn't on your `PATH`. With `uv tool install 'mint-sdk[cli]==@MINT_VERSION@'`, run `uv tool update-shell`. With `pip install --user 'mint-sdk[cli]'`, add `~/.local/bin` to `PATH`.

## Authenticate

```bash
mint platform auth login --url https://mint.morscherlab.org
```

Prompts for the platform URL if none is stored, then prints a short code and the platform's `/device` address (`<externalUrl>/device`), and opens it when run in a terminal. Open that page in a browser where you are signed in, type the code, choose the token lifetime and approve. The CLI then stores the personal access token it is granted in `~/.config/mint/credentials.json` (or `$XDG_CONFIG_HOME/mint/credentials.json`). Subsequent commands use it automatically. Add `--read-only` for a read-only token, or pass `--token` to paste an existing personal access token instead. Password login (`--username`) was removed in 1.3.

| Subcommand | Purpose |
|------------|---------|
| `mint platform auth login` | Sign in with a device code and store a personal access token for the given platform URL |
| `mint platform auth logout` | Revoke the stored token on the platform and discard it |
| `mint platform auth status` | Print the active platform URL, user, expiration |
| `mint platform auth hosts` | List the hosts with a stored credential; `*` marks the default |
| `mint platform auth use <host>` | Make a stored host the default for every command |
| `mint platform auth name <host> <name>` | Give a stored host a short name, for `--url` and `use` |
| `mint platform auth token create\|list\|revoke` | Manage your personal access tokens for scripts and AI assistants |

The credential file tracks one default host plus per-host tokens. To add an instance, run `mint platform auth login --url <other-url>` (`--name prod` gives it a short name). To switch the default, run `mint platform auth use <name>`. For unattended scripts, create a personal access token with `mint platform auth token create` and pass it as `MINT_TOKEN`; see [AI Assistants and API Access](/guide/ai-and-api) and the [CLI reference](/sdk/api/cli-reference#mint-platform-auth).

## Experiments

```bash
mint platform experiment list                              # all visible experiments
mint platform experiment list --project-id 12             # filter by project ID
mint platform experiment list --status ongoing             # filter by status
mint platform experiment list --search "TCA" --mine        # search my experiments
mint platform experiment get 42                            # show a single experiment
mint platform experiment create "Run 17" \
  --type lcms_sequence \
  --project-id 12 \
  --notes "TCA flux batch"                        # create
mint platform experiment update 42 --status completed      # status flip
mint platform experiment data 42 --view summary            # design-data summary
mint platform experiment results 42 --plugin dose-response # one plugin result
```

Other subcommands read design data (`data`), results (`results`), list types (`types`), show the next experiment code for a type (`next-seq`) and delete (`delete`).

## Projects

```bash
mint platform project list                                 # all visible projects
mint platform project create "TCA flux" \
  --description "..."                             # create
mint platform project update 12 --status archived          # archive
mint platform project experiments 12                       # list project experiments
mint platform project members 12                           # list project members
```

Project status values are `active`, `archived`, and `completed`.

## Plugins

Published plugins are `.mint` bundles. Install them with `mint platform plugin upload`
or `mint platform plugin github install`. Full subcommands and flags: [CLI reference](/sdk/api/cli-reference#mint-platform-plugin).

Plugin commands are for administrators and other users with matching server-side plugin permissions.

```bash
mint platform plugin list
mint platform plugin upload ./dist/my-plugin-1.0.0.mint
mint platform plugin github install MorscherLab/my-plugin --tag v1.0.0
mint platform plugin config get my-plugin
mint platform plugin config update my-plugin --file settings.json
```

These commands do not install plugins into your local shell environment. They call the running MINT server, and the server performs dependency checks, bundle extraction, settings writes, and restart-required reporting.

## Status

```bash
mint platform status
```

Prints a one-screen health overview:

- Configured host
- Stored username
- Platform reachability via the public `/api/health` endpoint (it reports status, version and a per-process `boot_id`, not the plugin list)
- Token validity / expiry when the server can verify it

For deeper operational status, use **Admin -> Platform -> Server** in the browser UI.

## Admin

`mint platform admin user` and `mint platform admin role` manage users and RBAC roles. They require the matching server-side permissions. Use `--help` on each subcommand for the exact flags before scripting changes. `mint platform admin feedback` lists the [feedback](/admin/platform-settings#audit-log-and-feedback) that users send from the account menu.

There are no plugin roles. Plugins use [access levels](/admin/users-roles#plugin-access-levels) instead.

## Debug

`mint platform debug summary | health | system | config | logs | updates` are read-only diagnostics for support and ops checks.

## Restart and run the platform

`mint platform restart` asks the configured platform to restart (requires `platform.configure`). The `mint` command does not start the platform. The `mint-platform` command of the platform checkout does: `mint-platform serve` runs it in the foreground, and `mint-platform daemon start|stop|restart|status|logs|install-service|uninstall-service` runs it in the background. `mint daemon` runs one plugin, not the platform. See [Install directly](/admin/install-direct) and the [CLI reference](/sdk/api/cli-reference).

## Updates

```bash
mint platform update check
mint platform update apply --yes
```

`mint platform update check` reports platform and plugin update sources. `mint platform update apply` applies the latest platform update and requires `platform.configure`.

## Scripting tips

Combine commands with `--json` and `jq`:

```bash
# Find every ongoing experiment in the active project, mark completed
mint platform experiment list --project-id 12 --status ongoing --json \
  | jq -r '.[].id' \
  | xargs -n1 -I{} mint platform experiment update {} --status completed
```

The token stored by `mint platform auth login` is a personal access token: it lasts the lifetime chosen at approval (30, 90 or 365 days, capped by `auth.patMaxLifetimeDays`). For unattended scripts, pass a dedicated token as `MINT_TOKEN` rather than relying on the stored one.

## What `mint` is not

- **Not the platform launcher.** The platform starts with `mint-platform serve` (foreground), `mint-platform daemon start` (background) or `mint-platform dev` (hot reload). Running `uvicorn` directly needs `MINT_LISTEN_PORT` set to the bound port.
- **Not a local `pip install <plugin>` replacement.** `mint platform plugin install` asks the running platform server to install a package or server-visible source, and `mint platform plugin upload` sends a `.mint` bundle to that server. For day-to-day use, admins usually use the Marketplace or Admin UI.
- **Not a platform command set at the top level.** Since MINT 1.4, the commands that call a running platform (`auth`, `experiment`, `project`, `plugin`, `update`, `status`, and so on) exist only under `mint platform`. The old top-level forms no longer work. Change scripts and CI steps.

## Next

→ [CLI reference](/sdk/api/cli-reference) — every command and flag
→ [Configuration](/admin/configuration) — config file and env vars
→ [REST client](/sdk/api/client) — typed Python access instead of the CLI
