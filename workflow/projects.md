# Projects

A **project** is the top-level grouping in MINT. It owns a set of experiments and a set of members; every experiment lives in exactly one project, and access is governed primarily through project membership.

> [Screenshot: project detail page with experiments list, members panel, and overview tiles]

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

Every project page has four tabs:

| Tab | Contents |
|-----|----------|
| **Overview** | Project description, recent activity, experiment counts by status |
| **Experiments** | Sortable, filterable list of experiments — see [Experiments](/workflow/experiments) |
| **Members** | Per-project members and their roles — see [Members & roles](/workflow/members-roles) |
| **Settings** | Rename, archive, delete (admin only) |

> [Screenshot: project tabs with Experiments selected]

## Experiment codes within a project

When you create an experiment inside a project, MINT auto-assigns a unique `experiment_code` like `EXP-001`. Codes are globally unique — they don't restart per project — so they're safe to copy across docs and grant reports.

The auto-naming pattern is configurable per platform via `naming_service`; consult your admin if your lab uses a custom convention.

## Project archival

Archiving hides a project from the default dashboard listings without deleting any data. Archive projects when:

- The associated paper has been published and the data is frozen
- A grant period has ended
- You want to declutter the home dashboard for active members

Archived projects remain reachable by direct URL and via the **Show archived** filter. Only admins or the project owner can archive or restore.

## Deleting a project

Deletion is irreversible — every experiment in the project is also removed, including uploaded artifacts and analysis-plugin results. The action requires admin privilege and a confirmation dialog with the project name typed back.

::: warning Prefer archival
For nearly every "I'm done with this" case, archive instead of delete. Deletion is for genuinely accidental projects.
:::

## Visibility and access

Project access is governed by:

1. **System role** — Admins see every project; Viewers see read-only
2. **Project membership** — non-admins must be added to a project to see it
3. **Per-project role** — membership comes with a role override (e.g., a system Member can be a project Owner inside one project)

See [Permissions](/reference/permissions) for the full RBAC matrix.

## Next

→ [Experiments](/workflow/experiments) — the unit of work inside a project
→ [Members & roles](/workflow/members-roles) — invitations, role overrides
