# Projects

A project groups experiments and members. An experiment belongs to at most one project. Your system role decides what you can do; project membership records who works on the project.

## When to create a project

Create a project for each unit of work that has its own scope and team. Examples:

- One paper: "TCA flux paper 2026"
- One grant: "SNF metabolomics 2024–2027"
- One disease model: "MDA-MB-231 xenograft series"
- One ongoing service: "Routine targeted panel — clinical"

You can rename a project at any time. Prefer more, narrower projects to one large project.

## Create a project

1. Open **Experiments -> Projects** in the top navigation.
2. Click **New project**.
3. Fill in the fields.
4. Click **Create project**.

| Field | Description |
|-------|-------------|
| Name | Required. Shows on the dashboard and in breadcrumbs. |
| Status | Active, Completed, or Archived. |
| Start date / End date | Optional. |
| Description | Goals and scope. Shows on the project tile. |
| Lead | Optional. The lead can edit the project and manage members. |
| Members | Optional. Existing MINT users. They join as `editor`. To change a member to `viewer`, use **Edit**. |

> [Screenshot: New project form with the name, status, dates, description, lead and members fields]

## Project page

| Region | Contents |
|--------|----------|
| Header | Project name, status, description, **Edit**, and **New experiment**. A new experiment starts with this project selected and the project members in its **Team** list. |
| Rollup filters | Counts of all experiments, experiments with design data, and experiments without design data. Click a chip to filter the table. |
| Experiments table | Code, name, type, status, design completeness, and created date. Click a row to open the experiment. |
| Metadata rail | Project dates, lead and creator, the **Team** card with members, tags, and **Delete project**. |

The rollup counts include all experiments of the project, not only the experiments that match the search. Use them to find the experiments that have a design ready to analyze.

> [Screenshot: project page with the "with design data" rollup chip selected and the experiments table filtered]

An experiment gets its code from its experiment type, not from the project. Codes are unique across all projects. See [Experiments -> Experiment numbers](/guide/experiments#experiment-numbers).

## Archive a project

1. Click **Edit**.
2. Set **Status** to **Archived**.
3. Save.

Archiving deletes nothing. To restore a project, set its status back to **Active**. The **Archived** status chip on the **Projects** page lists archived projects.

If someone else saved the project after you opened the form, MINT asks you to reload or overwrite. See [Experiments -> Edit an experiment and resolve conflicts](/guide/experiments#edit-an-experiment-and-resolve-conflicts).

Only an admin, the project creator, or the project lead can change the status. They also need `projects.edit`.

## Delete a project

1. In the metadata rail, click **Delete** under **Delete project**.
2. Confirm.

MINT removes the project and its member list. The experiments stay in MINT without a project. You cannot undo the deletion. To delete, you need `projects.delete`, and you must be an admin, the project creator, or the project lead.

::: warning Archive instead
Archive a project when the work is done. Delete only a project that you created by mistake.
:::

## Members and access

- Your system role gives permissions such as `projects.view`, `projects.edit`, and `projects.manage_members`.
- Only the creator, the lead, or an admin can edit or delete the project, or manage its members.
- A member is `editor` or `viewer`. In restricted visibility mode, membership also lets a member see the experiments of the project.

For the membership rules, see [Users & roles](/admin/users-roles). For all permissions, see [Permissions](/reference/permissions).
