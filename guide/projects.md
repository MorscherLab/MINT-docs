# Projects

A **project** is the top-level grouping in MINT. It groups experiments and members. An experiment belongs to at most one project. What each person can do is decided mainly by their system role; project membership adds who works on it.

> [Screenshot: project detail page with header, rollup filters, experiments table, and metadata rail]

## When to create a project

Create a project for any unit of work that has its own scope and team. Typical examples:

| Granularity | Example |
|-------------|---------|
| One paper / manuscript | "TCA flux paper 2026" |
| One funded grant | "SNF metabolomics 2024–2027" |
| One disease model | "MDA-MB-231 xenograft series" |
| One ongoing service | "Routine targeted panel — clinical" |

Projects are inexpensive to create and renaming is allowed at any time, so it's better to err on the side of more, narrower projects than one mega-project.

## Create a project

Open **Projects** from the top navigation and click **New Project**.

| Field | Description |
|-------|-------------|
| **Name** | Human-readable label. Required. Shown on the dashboard and in breadcrumbs. |
| **Status** | Active, Completed, or Archived |
| **Start date / End date** | Optional |
| **Description** | Goals and scope. Shown on the project tile. |
| **Lead** | Optional. The lead can edit the project and manage members. |
| **Members** (optional) | Existing MINT users. They join as `editor`; change a member to `viewer` later from **Edit**. |

> [Screenshot: new-project form with name, status, dates, description, lead, and members]

## Project anatomy

The project page is a compact record view:

| Region | Contents |
|--------|----------|
| **Header** | Project name, status, description, **Edit**, and **New Experiment**. |
| **Rollup filters** | Counts for all experiments, experiments with design data, and experiments without design data. Clicking a chip filters the table. |
| **Experiments table** | Dense list with code, name, type, status, design completeness, and created date. Click a row to open the experiment. |
| **Metadata rail** | Project dates, lead and creator, the **Team** card with members, tags, and **Delete project**. |

The rollups describe the whole project, not just the current search filter. They are meant to answer the first operational question a project lead usually has: "which experiments have a design ready to analyze?"

> [Screenshot: project rollup chips filtering the experiments table]

## Experiment codes within a project

When you create an experiment inside a project, MINT auto-assigns a unique `experiment_code` in `TYPE-EXP-SEQ` format, such as `LCM-EXP-001` or `DR-EXP-001`. Codes are globally unique — they don't restart per project — so they're safe to copy across docs and grant reports.

The prefix comes from the experiment type slug: initials for slugs with underscores (`dose_response` → `DR`), the whole slug up to three characters, otherwise its first three letters (`lcms` → `LCM`). See [Experiment types](/admin/platform-settings#experiment-types).

## Project archival

To archive a project, click **Edit** and set **Status** to **Archived**. Nothing is deleted. Archive projects when:

- The associated paper has been published and the data is frozen
- A grant period has ended
- You want to declutter the home dashboard for active members

On the **Projects** page, the **Archived** status chip lists archived projects; set the status back to **Active** to restore one. Only an admin, the project creator, or the project lead can change the status, and they need `projects.edit`.

## Deleting a project

Use **Delete** under **Delete project** in the metadata rail, then confirm. The project and its member list are removed. Its experiments are **not** deleted; they stay in MINT without a project. Deleting needs `projects.delete`, and only an admin, the project creator, or the project lead can do it. It cannot be undone.

::: warning Prefer archival
For nearly every "I'm done with this" case, archive instead of delete. Deletion is for projects created by mistake.
:::

## Visibility and access

Project access is governed by:

1. **System role** — route-level permissions such as `projects.view`, `projects.edit`, and `projects.manage_members`
2. **Project creator / lead** — only the creator, lead, or Admin can update/delete the project or manage members
3. **Project membership** — stored as `editor` or `viewer`; used for member lists and, in restricted experiment visibility mode, experiment visibility

See [Permissions](/reference/permissions) for the full RBAC matrix.

## Next

→ [Experiments](/guide/experiments) — the unit of work inside a project
→ [Users & roles](/admin/users-roles) — membership and system roles
