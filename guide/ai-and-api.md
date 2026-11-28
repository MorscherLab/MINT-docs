# AI Assistants and API Access

A personal access token lets a program act as you in MINT. The program can be an AI assistant such as Claude Code, a script that calls the REST API, or the `mint` CLI. The MINT MCP server (Model Context Protocol) lets AI assistants search experiments, read designs and results, and start plugin jobs as you.

A token can do what your account can do, and no more. Keep it as secret as a password.

## Open AI & API

1. Open the account menu in the top action bar and choose **Profile**.
2. Select **AI & API** in the side rail.

The section shows the MCP URL of this MINT server, for example `https://mint.example.org/mcp`, with a **Copy** button. Below it is the table of your **Access tokens**.

> [Screenshot: Your account modal with the AI & API section: MCP URL and the Access tokens table]

## Create a token

1. In **AI & API**, click **New token**.
2. Enter a **Name** that tells where you use the token, for example "Claude Code on my laptop".
3. Choose **Expires in**: 30, 90, or 365 days. The default is 90 days. If your admin set a maximum lifetime, longer options are disabled.
4. Optional: switch on **Read-only**. A read-only token can read data. It cannot create, change or delete data.
5. Click **Create token**.
6. Copy the token, which starts with `mint_pat_`, or copy the **Add to Claude Code** command.
7. Click **Done**.

MINT shows the secret only once. MINT stores only a fingerprint, so nobody can see the secret again. If you lose it, revoke the token and create a new one.

> [Screenshot: New token dialog, step 2 Copy, with the secret and the Add to Claude Code command]

## Connect Claude Code

Run the command from the dialog in a terminal. It has this form:

```bash
claude mcp add --transport http mint https://mint.example.org/mcp \
  --header "Authorization: Bearer mint_pat_..."
```

Other MCP clients need the MCP URL from **AI & API** and the header `Authorization: Bearer <your token>`. The MCP server accepts only personal access tokens, not your browser sign-in.

## Manage your tokens

The **Access tokens** table lists the name, prefix, access (**full**, **read-only** or **expired**), expiry date and last use of each token.

To revoke a token, click **Revoke**, then click **Confirm** within a few seconds. The token stops working at once. An expired token shows **Remove** instead.

A token cannot create or revoke tokens. Use the web UI for this. A password change does not revoke your tokens. If a token can have leaked, revoke it. Admins can see and revoke the tokens of all users; see [Authentication -> Personal access tokens](/admin/authentication#personal-access-tokens).

## Use a token with the API or CLI

- REST API: send the token as `Authorization: Bearer mint_pat_...`. It works on all platform routes and plugin routes. A read-only token gets 403 on all methods other than `GET`, `HEAD` and `OPTIONS`.
- `mint` CLI and Python client: run `mint platform auth login` and approve the code in your browser (see below), or set the `MINT_TOKEN` environment variable. For a read-only token, add `--read-only`. For the token commands, see the [CLI reference](/sdk/api/cli-reference).

## Sign in the mint CLI

`mint platform auth login` shows an 8-letter code and asks for no password. It works with passkey and edu-ID accounts.

1. Run `mint platform auth login --url <your MINT address>` in a terminal.
2. Open the address that the terminal shows. It is the `/device` page of your MINT server. The terminal also tries to open it in your browser.
3. Sign in if MINT asks.
4. Type the code from the terminal. The code expires after 10 minutes.
5. Make sure that the page names your terminal.
6. Choose **Valid for**. The maximum is the token lifetime limit of your admin.
7. Click **Approve**, or click **Deny** to refuse.

Approve only a code from your own terminal. A person who sends you a code can get access to your account. The approval creates a personal access token for the CLI. The token shows in **AI & API**, where you can revoke it. The `/device` page also works on a phone.

## What an AI assistant can do over MCP

Each tool runs as you, with your role, project access and plugin visibility. MINT does not offer tools that you have no permission for.

| Group | Tools | Available to read-only tokens |
|-------|-------|:---:|
| Read | `mint_whoami`, `mint_search_experiments`, `mint_get_experiment`, `mint_list_plugins`, `mint_get_design`, `mint_list_artifacts`, `mint_get_artifact`, `mint_list_instruments` and `mint_get_instrument_history` (both need `instruments.view`) | Yes |
| Write | `mint_create_experiment`, `mint_save_design`, `mint_save_artifact`, `mint_archive_artifact`, `mint_restore_artifact` | No |
| Jobs | `mint_start_job`, `mint_get_job`, `mint_get_job_result`, `mint_cancel_job` | Status and results only |
| Plugin tools | Tools, prompts, and resources that installed plugins publish, named `<plugin>_<name>` | Read tools only |

The assistant can also read `mint://` resources: an experiment with its design data, one analysis artifact, or a stored file of up to 5 MiB. Download larger files from MINT directly. A plugin can also offer its exports and its recent events as `mint://plugins/...` resources; see [Plugin communication](/sdk/concepts/plugin-communication#read-an-export-over-mcp). The tabs that plugins add to the experiment page are resources too: `mint://experiments/{id}` lists them as `panels`, each with its `mint://plugins/<plugin>/panels/<panel>/experiments/<id>` address. A read-only token can read them.

### Rules for MCP calls

- Confirmation questions: before a destructive call, MINT asks you in the AI client. If you decline or cancel, the call stops before it runs. MINT asks for these calls:
  - `mint_save_design` without `expected_version`, when a design is already stored.
  - `mint_save_artifact` with `replace=true`, over an artifact that an assistant saved.
  - `mint_start_job`, for a job that the plugin marks destructive. The question shows the job title.
  - `mint_cancel_job`, unless MINT knows that the job has already ended.
  - A plugin tool that the plugin marks destructive. The question shows the tool title and the argument values, shortened.

  A client that cannot ask questions runs the call without a question. Some clients say that they can ask, but they cannot show a dialog, for example in a headless run. These clients cancel the question, so the call fails. Answer the question with a client hook. In Claude Code, use an `Elicitation` hook. The question is not a permission check. A hook can answer it, and your role limits stay the same.
- Versions: `mint_search_experiments`, `mint_get_experiment` and `mint_get_design` report a `version`. `mint_save_design` takes an optional `expected_version` and refuses a stale one, so an assistant does not overwrite a newer design.
- No delete tools: an assistant cannot delete experiments, designs, or artifacts. It can archive an artifact, and you can restore it.
- Audit: each write call shows in the audit log as `mcp.tool_call`. An artifact saved over MCP records that it came from MCP and which token saved it.
- Results are create-only: an assistant cannot overwrite an artifact a plugin created. With `replace=true` it can replace only an artifact that an assistant saved before.
- Jobs: `mint_list_plugins` lists the jobs of each plugin and their inputs. A job input can be an experiment file, a file on a server mount, or an inline file of at most 4 MiB. One token can hold at most 64 unfinished job handles. Finished, cancelled and saved jobs do not count.
- Restarts: job handles and [tasks](#jobs-as-background-tasks) do not survive a platform restart. A handle then reports `lost`, and a task ends as failed. Start the job again.

To publish tools from a plugin, see [MCP tools for plugins](/sdk/recipes/mcp-tools).

## Skills

The MCP server also serves skills (MCP extension `io.modelcontextprotocol/skills`). A skill is a short set of instructions for the assistant: the order of tool calls for a task, the values you must choose, and the rules of a plugin. The assistant loads a skill only when a task needs it.

Claude Code shows each skill as `<server>:<skill>`. `<server>` is the name that you gave the server in `claude mcp add`, here `mint`:

| Skill | Source | Use |
|-------|--------|-----|
| `mint:mint-experiments` | Platform | Find and read experiments, create an experiment, save design data or an analysis artifact |
| `mint:mint-jobs` | Platform | Start a plugin job, follow it, read its result, keep it in an experiment, or cancel it |
| `mint:<plugin>-<name>` | A plugin | The procedure of that plugin, for example `mint:backend-only-charts-summary` |

To find the skills in Claude Code, type `/` at the prompt, or run `/skills` in the terminal. To use a skill, ask Claude, or type its name as a command, for example `/mint:mint-jobs`.

Each token sees the two platform skills. You see the skill of a plugin only when your role sees the plugin and has `plugins.use`. A skill gives no permission. MINT checks each tool call again.

## Jobs as background tasks

The MCP server also serves tasks (MCP extension `io.modelcontextprotocol/tasks`). A client that supports tasks runs a plugin job in the background:

1. The assistant calls `mint_start_job`. MINT starts the job and answers at once with a task. The task id is the job handle.
2. The client asks MINT for the status of the task. The assistant does not poll in the conversation. In Claude Code, the footer shows a count such as `1 MCP task`.
3. When the job ends, the client gives the result to the assistant. A task with `save_to` continues until MINT has saved the result in the experiment, or the save has failed.

The task and the job handle are the same object. `mint_get_job`, `mint_get_job_result` and `mint_cancel_job` accept the task id. Tasks and handles share the limit of 64 unfinished jobs per token. MINT keeps a task for 24 hours.

To stop a task in Claude Code, select it in `/tasks` and press `x`, or ask Claude to stop it. MINT then cancels the job without a confirmation question. A job that has ended stays as it is.

MINT keeps tasks in memory. After a platform restart, the task fails with the reason "The job was lost in a platform restart: its handle and in-memory result are gone." A result that MINT saved with `save_to` before the restart stays in the experiment. Ask the assistant to check the experiment before you start the job again.

A client without tasks gets the plain job handle. The assistant then polls with `mint_get_job`. The job tools work the same in both cases.

## Client support

MINT serves skills and tasks to every client. The client decides whether it uses them. For the Claude Code versions, sessions and plans that use them, see the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp#use-skills-from-mcp-servers). Other MCP clients can use the job tools and the `mint://` resources without skills or tasks.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Longer lifetimes are greyed out | Your admin set a maximum lifetime. Pick a shorter one, or ask your admin |
| The assistant gets 401 | The token expired or was revoked, or your account was disabled. Create a new token |
| The assistant cannot find a write tool | The token is read-only, or your role lacks the permission |
| A tool says "This access token is read-only" | Create a full-access token for that task |
| A destructive call is cancelled in a headless run | The client cannot show the confirmation question. Answer it with a client hook, or run the call in an interactive client |
| Claude Code shows no `mint:` skills | Check that your Claude Code session gets MCP skills; see [Client support](#client-support). A plugin skill needs `plugins.use` and a role that sees the plugin |
| A task ends as failed after a platform restart | MINT keeps tasks in memory. Check the experiment for a saved result, then start the job again |
