# Projects

A **project** is the top-level grouping in MINT. It owns a set of experiments and a set of members; every experiment lives in exactly one project, and access is governed primarily through project membership.

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

From the home dashboard, click **New project**.

| Field | Description |
|-------|-------------|
| **Name** | Human-readable label. Required. Shown on the dashboard and in breadcrumbs. |
| **Description** | One- or two-sentence summary. Shown on the project tile. |
| **Members** (optional) | Lab colleagues to invite at creation time. Each picks up the default project role; tune later from the **Members** tab. |

> [Screenshot: new-project modal showing the three fields]

## Project anatomy

The project page is a compact record view:

| Region | Contents |
|--------|----------|
| **Header** | Project name, status, description, **Edit**, and **New Experiment**. |
| **Rollup filters** | Counts for all experiments, experiments with design data, and experiments without design data. Clicking a chip filters the table. |
| **Experiments table** | Dense list with code, name, type, status, design completeness, and created date. Click a row to open the experiment. |
| **Metadata rail** | Project dates, lead/creator context, members, tags, and admin actions. |

The rollups describe the whole project, not just the current search filter. They are meant to answer the first operational question a project lead usually has: "which experiments have a design ready to analyze?"

> [Screenshot: project rollup chips filtering the experiments table]

## Experiment codes within a project

When you create an experiment inside a project, MINT auto-assigns a unique `experiment_code` in `TYPE-EXP-SEQ` format, such as `LCM-EXP-001` or `DR-EXP-001`. Codes are globally unique — they don't restart per project — so they're safe to copy across docs and grant reports.

The type prefix comes from the experiment type slug via `naming_service`; consult your admin if your lab uses a custom convention.

## Project archival

Archiving hides a project from the default dashboard listings without deleting any data. Archive projects when:

- The associated paper has been published and the data is frozen
- A grant period has ended
- You want to declutter the home dashboard for active members

Archived projects remain reachable by direct URL and via the **Show archived** filter. Only admins, the project creator, or the project lead can archive or restore.

## Deleting a project

Deletion is irreversible — every experiment in the project is also removed, including design data and platform analysis artifact records. Plugin-owned tables and files can have their own cleanup policy, so prefer archiving unless the project was created by mistake. The action requires admin privilege and a confirmation dialog with the project name typed back.

::: warning Prefer archival
For nearly every "I'm done with this" case, archive instead of delete. Deletion is for genuinely accidental projects.
:::

## Visibility and access

Project access is governed by:

1. **System role** — route-level permissions such as `projects.view`, `projects.edit`, and `projects.manage_members`
2. **Project creator / lead** — only the creator, lead, or Admin can update/delete the project or manage members
3. **Project membership** — stored as `editor` or `viewer`; used for member lists and, in restricted experiment visibility mode, experiment visibility

See [Permissions](/reference/permissions) for the full RBAC matrix.

## Next

→ [Experiments](/workflow/experiments) — the unit of work inside a project
→ [Members & roles](/workflow/members-roles) — invitations, membership, and RBAC
