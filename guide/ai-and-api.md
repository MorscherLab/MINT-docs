# AI Assistants and API Access

A **personal access token** lets a program act as you in MINT: an AI assistant such as Claude Code, a script calling the REST API, or the `mint` CLI. MINT also runs an **MCP server** (Model Context Protocol) so AI assistants can search experiments, read designs and results, and start plugin jobs on your behalf.

A token can do exactly what your account can do, and no more. Treat it like a password.

## Open AI & API

1. Open the account menu in the top action bar and choose **Profile**. The **Your account** window opens.
2. Select **AI & API** in the side rail.

The section shows the MCP URL for this MINT server (for example `https://mint.example.org/mcp`) with a **Copy** button, and a table of your **Access tokens**.

> [Screenshot: Your account modal with the AI & API section: MCP URL and the Access tokens table]

## Create a token

1. In **AI & API**, click **New token**.
2. Enter a **Name** that says where the token will be used, for example "Claude Code on my laptop".
3. Choose **Expires in**: 30, 90, or 365 days. The default is 90 days. Your admin may cap the lifetime; longer options are then disabled.
4. Optional: switch on **Read-only**. A read-only token can read data but cannot create, change, or delete anything.
5. Click **Create token**.
6. Copy the token (it starts with `mint_pat_`) or the prefilled **Add to Claude Code** command, then click **Done**.

The secret is shown only once. MINT stores only a fingerprint of it, so neither you nor an admin can view it again. If you lose it, revoke the token and create a new one.

> [Screenshot: New token dialog, step 2 Copy, with the secret and the Add to Claude Code command]

## Connect Claude Code

Run the command from the dialog in a terminal. It has this form:

```bash
claude mcp add --transport http mint https://mint.example.org/mcp \
  --header "Authorization: Bearer mint_pat_..."
```

Other MCP clients need the same two things: the MCP URL from **AI & API**, and the header `Authorization: Bearer <your token>`. The MCP server accepts personal access tokens only, not your browser sign-in.

## Manage your tokens

The **Access tokens** table lists each token's name and prefix, access (**full**, **read-only**, or **expired**), expiry date, and when it was last used.

To revoke a token, click **Revoke**, then **Confirm** within a few seconds. The token stops working at once. Expired tokens show **Remove** instead.

A token cannot create or revoke tokens. Sign in to the web UI to manage them. Changing your password does not revoke your tokens. If a token may have leaked, revoke it. Admins can also see and revoke every user's tokens; see [Authentication](/admin/authentication).

## Use a token with the API or CLI

- **REST API**: send the token as `Authorization: Bearer mint_pat_...`. It works on every platform route and on plugin routes. A read-only token is refused (403) on anything other than `GET`, `HEAD`, and `OPTIONS`.
- **`mint` CLI and Python client**: run `mint platform auth login` and approve the code in your browser (see below), or set the `MINT_TOKEN` environment variable. Add `--read-only` to `mint platform auth login` for a read-only token. The old top-level `mint auth` command no longer exists. See [mint CLI](/admin/cli) and the [CLI reference](/sdk/api/cli-reference) for token commands.

## Sign in the mint CLI

`mint platform auth login` shows an 8-letter code and asks for no password, so it also works with passkey and edu-ID accounts.

1. Run `mint platform auth login --url <your MINT address>` in a terminal.
2. Open the address that the terminal prints (the `/device` page of your MINT server). The terminal also tries to open it in your browser. Sign in if MINT asks.
3. Type the code from the terminal. The code expires 10 minutes after the terminal shows it.
4. Check that the page names your terminal, choose **Valid for** (up to your admin's token lifetime limit), and click **Approve**. Click **Deny** to refuse.

Approve a code only when you typed it from your own terminal. Someone who sends you a code can use your account. The approval creates a personal access token for the CLI. It appears in **AI & API** and you can revoke it there. The `/device` page also works on a phone.

## What an AI assistant can do over MCP

Every tool runs as you and respects your role, project access, and plugin visibility. Tools you lack the permission for are not offered.

| Group | Tools | Available to read-only tokens |
|-------|-------|:---:|
| **Read** | `mint_whoami`, `mint_search_experiments`, `mint_get_experiment`, `mint_list_plugins`, `mint_get_design`, `mint_list_artifacts`, `mint_get_artifact`, `mint_list_instruments` and `mint_get_instrument_history` (both need `instruments.view`) | Yes |
| **Write** | `mint_create_experiment`, `mint_save_design`, `mint_save_artifact`, `mint_archive_artifact`, `mint_restore_artifact` | No |
| **Jobs** | `mint_start_job`, `mint_get_job`, `mint_get_job_result`, `mint_cancel_job` | Status and results only |
| **Plugin tools** | Tools, prompts, and resources that installed plugins publish, named `<plugin>_<name>` | Read tools only |

The assistant can also read `mint://` resources: an experiment with its design data, a single analysis artifact, or a stored file of up to 5 MiB. Larger files must be downloaded from MINT directly. A plugin can also offer its exports and its recent events as `mint://plugins/...` resources; see [Plugin communication](/sdk/concepts/plugin-communication#read-an-export-over-mcp). The tabs that plugins add to the experiment page are resources too: `mint://experiments/{id}` lists them as `panels`, each with its `mint://plugins/<plugin>/panels/<panel>/experiments/<id>` address. A read-only token can read them.

Things to know:

- **Confirmation questions.** Before a destructive call, MINT asks you in the AI client. If you decline or cancel, the call stops before it runs. MINT asks for these calls:
  - `mint_save_design` without `expected_version`, when a design is already stored.
  - `mint_save_artifact` with `replace=true`, over an artifact that an assistant saved.
  - `mint_start_job`, for a job that the plugin marks destructive. The question shows the job title.
  - `mint_cancel_job`, unless MINT knows that the job has already ended.
  - A plugin tool that the plugin marks destructive. The question shows the tool title and the argument values, shortened.

  A client that cannot ask questions runs the call without a question. Some clients say that they can ask, but they cannot show a dialog, for example in a headless run. These clients cancel the question, so the call fails. Answer the question with a client hook. In Claude Code, use an `Elicitation` hook. The question is not a permission check. A hook can answer it, and your role limits stay the same.
- **Versions.** `mint_search_experiments`, `mint_get_experiment` and `mint_get_design` report a `version`. `mint_save_design` takes an optional `expected_version` and refuses a stale one, so an assistant does not overwrite a newer design.
- **No delete tools.** An assistant cannot delete experiments, designs, or artifacts. It can archive an artifact, and you can restore it.
- **Writes are audited.** Every write call appears in the audit log as `mcp.tool_call`, and artifacts saved over MCP record that they came from MCP and which token saved them.
- **Saving results is create-only.** An assistant cannot overwrite an artifact a plugin created. With `replace=true` it can replace only an artifact that an assistant saved before.
- **Jobs.** `mint_list_plugins` lists each plugin's jobs and their inputs. A job input can be an experiment file, a file on a server mount, or an inline file of at most 4 MiB. One token can hold at most 64 unfinished job handles; finished, cancelled, and saved jobs do not count.
- **Restarts.** Job handles and [tasks](#jobs-as-background-tasks) do not survive a platform restart. A handle then reports `lost`, and a task ends as failed. Start the job again.

Plugin authors who want to publish their own tools: see [MCP tools for plugins](/sdk/recipes/mcp-tools).

## Skills

From MINT 1.6, the MCP server also serves **skills** (MCP extension `io.modelcontextprotocol/skills`). A skill is a short set of instructions for the assistant: the order of tool calls for a task, the values you must choose, and the rules of a plugin. The assistant loads a skill only when a task needs it.

Claude Code shows each skill as `<server>:<skill>`. `<server>` is the name you gave the server in `claude mcp add`. With the command above, the name is `mint`:

| Skill | Source | Use |
|-------|--------|-----|
| `mint:mint-experiments` | Platform | Find and read experiments, create an experiment, save design data or an analysis artifact |
| `mint:mint-jobs` | Platform | Start a plugin job, follow it, read its result, keep it in an experiment, or cancel it |
| `mint:<plugin>-<name>` | A plugin | The procedure of that plugin, for example `mint:backend-only-charts-summary` |

To find the skills in Claude Code, type `/` at the prompt, or run `/skills` in the terminal. To use a skill, ask Claude, or type its name as a command, for example `/mint:mint-jobs`.

Every token sees the two platform skills. You see the skill of a plugin only when your role sees the plugin and has `plugins.use`, as for the tools of that plugin. A skill gives no permission: MINT checks each tool call again.

## Jobs as background tasks

From MINT 1.6, the MCP server also serves **tasks** (MCP extension `io.modelcontextprotocol/tasks`). A client that supports tasks runs a plugin job in the background:

1. The assistant calls `mint_start_job`. MINT starts the job and answers at once with a task. The task id is the job handle.
2. The client asks MINT for the status of the task. The assistant does not poll in the conversation. In Claude Code, the footer shows a count such as `1 MCP task`.
3. When the job ends, the client gives the result to the assistant. A task with `save_to` continues until MINT has saved the result in the experiment, or the save has failed.

The task and the job handle are the same object. `mint_get_job`, `mint_get_job_result` and `mint_cancel_job` accept the task id. Tasks and handles share the limit of 64 unfinished jobs per token. MINT keeps a task for 24 hours.

To stop a task in Claude Code, select it in `/tasks` and press `x`, or ask Claude to stop it. MINT then cancels the job without a confirmation question. A job that has ended stays as it is.

MINT keeps tasks in memory. After a platform restart, MINT reports the task as failed with the reason "The job was lost in a platform restart: its handle and in-memory result are gone." A result that MINT saved with `save_to` before the restart stays in the experiment. Ask the assistant to check the experiment before you start the job again.

A client without tasks gets the plain job handle, as before. The assistant then polls with `mint_get_job`. The job tools work the same in both cases.

## Client support

MINT serves skills and tasks to every client. The client decides whether it uses them. At the time of writing (2026-11-24), Claude Code supports them as follows. Check the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp#use-skills-from-mcp-servers) for the current state.

| | Skills | Tasks |
|---|---|---|
| Status | Public beta | Generally available |
| Claude Code version | 2.1.331 or later | 2.1.304 or later in the terminal; 2.1.331 or later in the VS Code extension and in local sessions of the Desktop app |
| Sessions that get them | Terminal (also in JetBrains IDEs) and local sessions in the Desktop app. The VS Code extension gets them in a rollout | Calls of the main conversation. On 2.1.331 or later, also calls of a subagent in an interactive terminal session |
| Sessions that do not get them | Cloud sessions, `claude -p`, `claude remote-control` server mode, GitHub Actions and the Agent SDK | A one-shot `claude -p "<prompt>"` run. Cloud sessions and claude.ai chats give tasks only to claude.ai connectors |
| Other conditions | A Fable model, or Claude Opus 4.8, Sonnet 5, Haiku 5.5 or later, with a direct connection to Anthropic and feature flag fetching on. On a Team or Enterprise plan, skills are off until the organization turns them on. With an API key or a Console login, skills are off now (rolling out). Organizations with a compliance setting such as HIPAA or zero data retention do not get skills | Protocol revision 2026-07-28. `MCP_SDK_GENERATION=v1` or `MCP_PROTOCOL_NEGOTIATION=legacy` turns tasks off. The VS Code extension and the Desktop app need a session that fetches feature flags |

Claude Code shows at most 100 skills per server. Other MCP clients can use the job tools and the `mint://` resources without skills or tasks.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Longer lifetimes are greyed out | Your admin caps token lifetime; pick a shorter one or ask your admin |
| Assistant gets 401 | The token expired, was revoked, or your account was disabled; create a new token |
| Assistant cannot find a write tool | The token is read-only, or your role lacks the permission |
| A tool says "This access token is read-only" | Create a full-access token for that task |
| A destructive call is cancelled in a headless run | The client cannot show the confirmation question. Answer it with a client hook, or run the call in an interactive client |
| Claude Code shows no `mint:` skills | Check the [client support](#client-support) table. MINT serves skills from version 1.6. A plugin skill needs `plugins.use` and a role that sees the plugin |
| A task ends as failed after a platform restart | MINT keeps tasks in memory. Check the experiment for a saved result, then start the job again |
