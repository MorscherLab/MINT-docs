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
mint auth login --url https://mint.morscherlab.org
```

Prompts for the platform URL if none is stored, your username or email, and your password, then stores the resulting JWT in `~/.config/mint/credentials.json` (or `$XDG_CONFIG_HOME/mint/credentials.json`). Subsequent commands use it automatically.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login` | Acquire a JWT for the given platform URL |
| `mint auth logout` | Discard the stored JWT |
| `mint auth status` | Print the active platform URL, user, expiration |
| `mint auth token create\|list\|revoke` | Manage your personal access tokens for scripts and AI assistants |

The credential file tracks one default host plus per-host tokens. To switch instances, run `mint auth login --url <other-url>`. For unattended scripts, create a personal access token with `mint auth token create` and pass it as `MINT_TOKEN`; see [AI Assistants and API Access](/guide/ai-and-api) and the [CLI reference](/sdk/api/cli-reference#mint-auth).

## Experiments

```bash
mint experiment list                              # all visible experiments
mint experiment list --project-id 12             # filter by project ID
mint experiment list --status ongoing             # filter by status
mint experiment list --search "TCA" --mine        # search my experiments
mint experiment get 42                            # show a single experiment
mint experiment create "Run 17" \
  --type lcms_sequence \
  --project-id 12 \
  --notes "TCA flux batch"                        # create
mint experiment update 42 --status completed      # status flip
mint experiment data 42 --view summary            # design-data summary
mint experiment results 42 --plugin dose-response # one plugin result
```

Other subcommands read design data (`data`), results (`results`), list types (`types`), show the next experiment code for a type (`next-seq`) and delete (`delete`).

## Projects

```bash
mint project list                                 # all visible projects
mint project create "TCA flux" \
  --description "..."                             # create
mint project update 12 --status archived          # archive
mint project experiments 12                       # list project experiments
mint project members 12                           # list project members
```

Project status values are `active`, `archived`, and `completed`.

## Plugins

Published plugins are `.mint` bundles. Install them with `mint plugin upload`
or `mint plugin github install`. Full subcommands and flags: [CLI reference](/sdk/api/cli-reference#mint-plugin).

Plugin commands are for administrators and other users with matching server-side plugin permissions.

```bash
mint plugin list
mint plugin upload ./dist/my-plugin-1.0.0.mint
mint plugin github install MorscherLab/my-plugin --tag v1.0.0
mint plugin config get my-plugin
mint plugin config update my-plugin --file settings.json
```

These commands do not install plugins into your local shell environment. They call the running MINT server, and the server performs dependency checks, bundle extraction, settings writes, and restart-required reporting.

## Status

```bash
mint status
```

Prints a one-screen health overview:

- Configured host
- Stored username
- Platform reachability via the public `/api/health` endpoint (it reports status, version and a per-process `boot_id`, not the plugin list)
- Token validity / expiry when the server can verify it

For deeper operational status, use **Admin -> Platform -> Server** in the browser UI.

## Admin

`mint admin user`, `mint admin role` and `mint admin plugin-role` manage users, RBAC roles and per-plugin roles. They require the matching server-side permissions. Use `--help` on each subcommand for the exact flags before scripting changes.

## Debug

`mint debug summary | health | system | config | logs | updates` are read-only diagnostics for support and ops checks.

## Restart and run the platform

`mint platform restart` asks the configured platform to restart (requires `platform.configure`). All platform commands are also available under `mint platform …`, for example `mint platform admin user list`. `mint daemon` and `mint platform daemon start|stop|restart|status|logs` run the platform without Docker; see the [CLI reference](/sdk/api/cli-reference#mint-daemon-and-mint-platform-daemon).

## Updates

```bash
mint update check
mint update apply --yes
```

`mint update check` reports platform, SDK, and plugin update sources. `mint update apply` applies the latest platform update and requires `platform.configure`.

## Scripting tips

Combine commands with `--json` and `jq`:

```bash
# Find every ongoing experiment in the active project, mark completed
mint experiment list --project-id 12 --status ongoing --json \
  | jq -r '.[].id' \
  | xargs -n1 -I{} mint experiment update {} --status completed
```

Authentication tokens expire after `auth.tokenExpireMinutes` (7 days by default). For long-running scripts, catch 401s and re-run `mint auth login`; the Python `MINTClient` can attempt token refresh automatically during requests.

## What `mint` is not

- **Not a generic platform launcher.** `mint serve` doesn't exist. Direct installs usually run the ASGI factory with `uvicorn api.main:create_app --factory`; runtime/source deployments can use `mint daemon` when they need the job/session host worker.
- **Not a local `pip install <plugin>` replacement.** `mint plugin install` asks the running platform server to install a package or server-visible source, and `mint plugin upload` sends a `.mint` bundle to that server. For day-to-day use, admins usually use the Marketplace or Admin UI.
- **Not the production daemon by default.** `mint dev` is for plugin hot reload, while `mint daemon` is the foreground runtime command used by Linux deployments.

## Next

→ [CLI reference](/sdk/api/cli-reference) — every command and flag
→ [Configuration](/admin/configuration) — config file and env vars
→ [REST client](/sdk/api/client) — typed Python access instead of the CLI
