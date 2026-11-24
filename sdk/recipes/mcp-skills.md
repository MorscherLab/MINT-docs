# MCP skills

Ship a skill with your plugin. A skill tells an AI assistant how to do a task with your plugin: the order of tool and job calls, the values that the user must choose, and the rules of the plugin. The platform serves plugin skills on its `/mcp` endpoint (MCP extension `io.modelcontextprotocol/skills`) from MINT 1.6. Claude Code shows a skill as `<server>:<skill name>` and loads it only when a task needs it. Which clients support skills: [Client support](/guide/ai-and-api#client-support).

`Metadata.skills` needs `mint-sdk` 1.6 or later.

## Declare a skill

1. Add the skill name to `Metadata.skills`.
2. Make the directory `skills/<name>/` next to the module that defines the plugin class (the same place as `frontend/`).
3. Write `skills/<name>/SKILL.md`. Start it with YAML frontmatter that has `name` and `description`.
4. Put more files (references, examples) in the same directory if the skill needs them.

The reference plugin [`examples/backend-only-generated-ui`](https://github.com/MorscherLab/MINT/tree/1.6-dev/examples/backend-only-generated-ui) has the entry point `backend-only-charts` and one skill:

```text
src/backend_only_analysis/
├── plugin.py
└── skills/
    └── backend-only-charts-summary/
        └── SKILL.md
```

```python
class BackendOnlyCharts(Metadata):
    domain = "example"
    title = "Backend-only charts"
    prefix = "/backend-only-charts"
    settings = PluginSettings
    settings_access = "configure"
    ui = "generated"
    skills = {"backend-only-charts-summary"}
```

```markdown
---
name: backend-only-charts-summary
description: Make a table or a chart of generated values with the Backend-only charts plugin. Use it when the user asks for a summary table, a Matplotlib chart or a Plotly chart from this plugin.
---

# Backend-only charts

The plugin `backend-only-charts` has three jobs: "Summary table", "Matplotlib chart" and "Plotly chart". Each job makes `points` values from 0 to `(points - 1) * scale`.

1. Call `mint_list_plugins`. Find the plugin `backend-only-charts` and the `job_id` of the job that the user asks for.
2. Call `mint_start_job` with `plugin`, `job_id` and `inputs`, for example `{"points": 8, "scale": 1.0}`. `points` is 2 to 100. `scale` is more than 0 and at most 100.
3. Call `mint_get_job` with the `handle` until the job ends. Then call `mint_get_job_result`.
4. To keep the result in an experiment, send `experiment_id` and a new `save_to` key with `mint_start_job`.
```

The platform serves the file as `skill://plugins/backend-only-charts/backend-only-charts-summary/SKILL.md`. Claude Code shows the skill as `mint:backend-only-charts-summary` when the user named the server `mint`.

## Rules

The platform and `mint doctor` use the same rules (`mint_sdk.mcp_skills.skill_problems`). The platform does not serve a skill that breaks one, and logs the reason.

| Rule | Limit |
|------|-------|
| Name | Parts of `a-z` and `0-9` joined by `-`, at most 64 characters |
| Prefix | The name starts with the plugin name in the same form, then `-`. The plugin name is the entry-point key in lowercase, with each run of other characters replaced by `-`: plugin `drp` gives `drp-dose-response`, plugin `dose_response` gives `dose-response-fit` |
| Frontmatter | `SKILL.md` starts with YAML frontmatter. `name` equals the directory name. `description` is not empty |
| Size | At most 20 skills per plugin, 64 files and 1 MiB per skill |
| Paths | Hidden files (a name that starts with `.`) are left out. Each other file and directory name uses only `A-Z`, `a-z`, `0-9`, `.`, `_` and `-`: a name such as `Lab notes.md` makes the platform refuse the skill. A link that leads out of the skill directory is refused |
| Secrets | No access token (`mint_pat_…`, `mint_svc_…`) and no private key. Every caller who sees the plugin can read the skill |

All MINT skills, from the platform and from every plugin, share one server label in the client. The prefix keeps the skills of two plugins apart. The skill prefix uses `-`; the [tool prefix](/sdk/recipes/mcp-tools#names) uses `_`.

The `Metadata` class checks the form of each name and the count of 20 when Python defines the class.

## Checks before you ship

`mint doctor` adds the check **MCP skills**. It reports an error for each rule above. It reports a warning when:

- Claude may not load the skill: a text file over 100 KB, a skill over 400 KB, an archive, a WebP or OTF file, a binary file other than PNG, JPEG, GIF or PDF, a file under `dist/`, or a description over 1024 characters;
- the frontmatter has `allowed-tools`;
- the text names a `mint_*` or `<plugin>_*` tool that the platform or the plugin does not publish;
- a directory under `skills/` is not in `Metadata.skills`.

The **MCP declarations** line also counts the skills.

`mint build` stops when the wheel leaves out a file under `skills/`, because the platform reads the skills from the installed package. Remove the exclusion of `skills/` from `[tool.hatch.build.targets.wheel]`.

## Who sees a skill

- A caller sees a plugin skill only with `plugins.use` and a role that sees the plugin, as for the tools of the plugin. A skill grants nothing: the platform checks each tool that the skill names again when the model calls it.
- The platform reads the files once per change and serves its own copy, with the digest of the bytes that it serves. A plugin in its own process serves the files at `GET /__mint/mcp/skills/{name}` with its internal token. The platform serves a changed file after the next sync (15 seconds). An in-process plugin needs a reload.
- A disabled or uninstalled plugin loses its skills at once.

## Write a good skill

- Give the order of calls, the input values that the user must choose and the rules of the plugin (for example "use `save_to` with a new key").
- Name tools exactly: `mint_*` for the platform, `<plugin>_<tool>` for the tools of the plugin.
- Keep it short. Put long reference text in a second file and link it.
- Write the skill for lab users, not for plugin authors.

The platform skills `mint-experiments` and `mint-jobs` already describe the platform tools. A plugin skill names them and adds only what is special to the plugin.

Verified against [`mcp_skills.py`](https://github.com/MorscherLab/MINT/blob/1.6-dev/packages/sdk-python/src/mint_sdk/mcp_skills.py), [`doctor_skill_checks.py`](https://github.com/MorscherLab/MINT/blob/1.6-dev/packages/sdk-python/src/mint_sdk/doctor_skill_checks.py) and [platform publishing](https://github.com/MorscherLab/MINT/blob/1.6-dev/api/mcp/plugin_tools.py) on `1.6-dev`.

- [MCP tools](/sdk/recipes/mcp-tools)
- [AI Assistants and API Access](/guide/ai-and-api#skills)
- [Python SDK reference](/sdk/api/python#metadata-fields)
