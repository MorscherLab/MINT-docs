# mint CLI

The `mint` command works with a running MINT instance. Use it to sign in, script experiment and project changes, manage plugins and users, check health and apply platform updates. It calls the platform REST API with a personal access token.

The [CLI reference](/sdk/api/cli-reference) lists every command and flag. Plugin developers use the same CLI to scaffold, lint and build plugins. Those commands also need the Vite+ CLI `vp`; the commands on this page do not.

## Install

1. Install the CLI as a uv tool:

   ```bash
   uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
   ```

   Keep the quotes, so that shells such as zsh do not read the square brackets. The `[cli]` extra supplies the command-line dependencies. To add the extra to an existing install without it, run the command again with `--force`.

2. Check the install:

   ```bash
   mint --version
   mint --help
   ```

If the shell does not find `mint`, run `uv tool update-shell`. After `pip install --user 'mint-sdk[cli]'`, add `~/.local/bin` to `PATH`.

The `mint` tool environment is separate from the platform environment. The `mint` command does not start the platform; see [Run the platform](#run-the-platform).

## Authenticate

```bash
mint platform auth login --url https://mint.example.org
```

The command shows a code and the `/device` address of the platform. Approve the code in a signed-in browser. The CLI then stores a personal access token. For the steps, see [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli). For the other `mint platform auth` commands (several hosts, tokens, logout), see [`mint platform auth`](/sdk/api/cli-reference#mint-platform-auth).

For unattended scripts, create a dedicated token with `mint platform auth token create` and give it as `MINT_TOKEN`. See [AI assistants and API access](/guide/ai-and-api).

## Experiments

```bash
mint platform experiment list                              # all visible experiments
mint platform experiment list --project-id 12              # filter by project ID
mint platform experiment list --status ongoing             # filter by status
mint platform experiment list --search "TCA" --mine        # search my experiments
mint platform experiment get 42                            # show one experiment
mint platform experiment create "Run 17" \
  --type lcms_sequence \
  --project-id 12 \
  --notes "TCA flux batch"                                 # create
mint platform experiment update 42 --status completed      # change the status
mint platform experiment data 42 --view summary            # design-data summary
mint platform experiment results 42 --plugin dose-response # one plugin result
```

Other subcommands: `types` lists the experiment types, `next-seq` shows the next experiment code for a type, and `delete` deletes an experiment.

## Projects

```bash
mint platform project list                                 # all visible projects
mint platform project create "TCA flux" \
  --description "..."                                      # create
mint platform project update 12 --status archived          # archive
mint platform project experiments 12                       # list project experiments
mint platform project members 12                           # list project members
```

Project status values are `active`, `archived` and `completed`.

## Plugins

These commands need the matching plugin permissions. They call the running MINT server, which does the dependency checks, the bundle extraction and the settings writes. They install nothing into your local shell environment.

```bash
mint platform plugin list
mint platform plugin upload ./dist/my-plugin-1.0.0.mint
mint platform plugin github install MorscherLab/my-plugin --tag v1.0.0
mint platform plugin config get my-plugin
mint platform plugin config update my-plugin --file settings.json
mint platform plugin snapshots
mint platform plugin rollback <snapshot-id>
```

- `plugin list` shows the state of each plugin (`enabled`, `disabled`, or `error` with the migration error). It also lists the plugins that the dependency lock disabled, with the reason.
- `plugin snapshots` lists the plugin lock history. `plugin rollback` applies one lock again. Restart the platform after a rollback. See [Rollback](/admin/plugins#rollback).

For all subcommands and flags, see [`mint platform plugin`](/sdk/api/cli-reference#mint-platform-plugin).

## Status

```bash
mint platform status
```

The command shows the configured host, the stored username, the token validity and expiry, and whether the platform answers on the public `/api/health` endpoint. For more detail, open **Admin -> System -> Server**.

## Admin

`mint platform admin user` and `mint platform admin role` manage users and roles. They need the matching permissions. Run `--help` on each subcommand before you script a change. `mint platform admin feedback` lists the [feedback](/admin/platform-settings#audit-log-and-feedback) that users send.

## Debug

`mint platform debug summary | health | system | config | logs | updates` are read-only diagnostics for support and operations.

## Run the platform

`mint platform restart` asks the configured platform to restart (needs `platform.configure`).

The `mint` command does not start the platform. The `mint-platform` command of the platform environment does:

- `mint-platform serve` runs it in the foreground.
- `mint-platform daemon start|stop|restart|status|logs|install-service|uninstall-service` runs it in the background.
- `mint-platform dev` runs it with hot reload.

A bare `uvicorn` launch must set `MINT_LISTEN_PORT`; see [`server`](/admin/configuration#server). `mint daemon` runs one plugin, not the platform. See [Install directly](/admin/install-direct).

## Updates

```bash
mint platform update check
mint platform update apply --yes
```

`update check` reports the platform and plugin updates. `update apply` applies the latest platform update and needs `platform.configure`. If the update needs plugin changes, confirm them; see [Plugins that exclude the new platform version](/admin/updates#plugins-that-exclude-the-new-platform-version).

## Libraries

`mint libraries import|list|promote|retire|restore|delete` manages the [library store](/admin/libraries). The commands need `platform.configure`. See [`mint libraries`](/sdk/api/cli-reference#mint-libraries).

## Scripting

Combine `--json` with `jq`. This example marks every ongoing experiment of project 12 as completed:

```bash
mint platform experiment list --project-id 12 --status ongoing --json \
  | jq -r '.[].id' \
  | xargs -n1 -I{} mint platform experiment update {} --status completed
```
