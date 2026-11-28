# Users & Roles

This page tells administrators how to manage accounts, roles, project membership and plugin access. Each user has one system role. The role decides which actions the user can do in the whole platform. Project membership records who works on a project. In restricted visibility mode, it also decides which experiments a user can see. For the full permission catalog, see [Permissions](/reference/permissions).

> [Screenshot: Admin -> People & access -> Roles with the Admin, Member and Viewer roles and one custom role]

## Accounts

People get an account by self-registration or from an administrator. See [Accounts and registration](/admin/authentication#accounts-and-registration).

To activate a self-registered account:

1. Open **Admin -> People & access -> Users** (needs `users.view`).
2. Find the inactive account. The person sees "Waiting for approval" at sign-in.
3. Open its action menu and choose **Activate user** (needs `users.manage`).

With `users.manage`, you can also edit a user, change the role, reset the password, reset the passkeys (see [Recovery](/admin/authentication#recovery)), deactivate, activate again, or delete.

- MINT refuses an action on your own account (delete, deactivate, password reset, passkey reset, role change) with 400.
- MINT refuses to delete, deactivate or demote the last active administrator with 409.

> [Screenshot: Admin -> People & access -> Users with one inactive account and its action menu open on Activate user]

## System roles

MINT has three system roles: Admin, Member (the default for new accounts) and Viewer. For the permissions of each role, see [System roles](/reference/permissions#system-roles).

- Member does not have `plugins.configure`, because that permission gives the plugin `configure` access level. See [Plugin access levels](#plugin-access-levels).
- Member and Viewer do not see the **Admin** entry. See [Admin panel](/reference/permissions#admin-panel).
- A new role does not get `instruments.edit` automatically. Grant it to the roles that maintain the [instrument directory](/guide/instruments).

To change the role of a user, open **Admin -> People & access -> Users** and edit the user.

## Custom roles

To create or edit a role:

1. Open **Admin -> People & access -> Roles** (needs `users.manage`).
2. Click **New role**, or open an existing role.
3. Enter the name and the slug.
4. Switch on the permissions.
5. Set the project scope and the plugin access (see the table below).
6. Click **Create role** (or **Save role** for an existing role).

| Setting | Options | Effect |
|---------|---------|--------|
| **Project scope** | All projects / Assigned only | The role sees every project, or only the projects that the user is assigned to |
| **Plugin access** | All plugins / Selected only | The plugins that the role can see and open. A plugin matches by its registry name or its route prefix |

> [Screenshot: role editor with the permission switches, the project scope and the plugin access list]

The slug of a role must match `^[a-z0-9][a-z0-9_-]*$` and have at most 100 characters. MINT refuses other slugs with 422, so a look-alike such as `Admin` cannot exist. Only the exact slug `admin` is a platform administrator, for the platform and for every plugin. A role that had an empty slug got the slug `role-<id>` at the upgrade. Rename it if necessary.

Use a custom role for a narrow job. Example: a "Plugin operator" with `plugins.view`, `plugins.use` and `plugins.configure`, but not `plugins.install`.

### Who can manage whom

A non-admin with `users.manage` can act only within their own rights. They cannot assign or edit the Admin role, give a permission that they do not have, or act on a user whose role outranks theirs. See [Limits on `users.manage`](/reference/permissions#limits-on-users-manage).

## Project membership

Each project has a creator and an optional lead. The creator, the lead or an Admin can edit the project, delete it and manage its members. Each of them also needs the matching permission: `projects.edit`, `projects.delete` or `projects.manage_members`.

To add a member, open the project's **Edit** form and select an existing user under **Members**. For the steps in the UI, see [Projects](/guide/projects).

| Project relationship | Effect |
|----------------------|--------|
| Creator or lead | Can edit or delete the project and manage members, with the matching permission |
| Member: `editor` | A label only. Counts for restricted experiment visibility |
| Member: `viewer` | A label only. Counts for restricted experiment visibility |

Project membership does not replace system roles. A user still needs `experiments.edit` to edit experiments. To show one experiment to a person, add them as a [collaborator](/guide/experiments#collaborators).

> [Screenshot: project Team card with three members and their editor or viewer labels]

## Plugin access levels

A plugin tags each endpoint, job, MCP tool and page with an access level. The platform maps the level to the caller's system role. There are no roles for each plugin.

| Level | Who passes |
|-------|-----------|
| `use` | A role with `plugins.use` that can see the plugin (**Plugin access**) |
| `configure` | The `use` rule, plus `plugins.configure` |
| `admin` | A platform administrator (the `admin` role). An administrator passes every level |

- MINT treats an unknown level from a plugin as `admin`.
- A plugin page with the `configure` level is hidden from a role without `plugins.configure`.
- Only a platform administrator can change the settings of a plugin. If the plugin sets `settings_access = "configure"` in its `Metadata`, a role with `plugins.configure` can also change them.

To let a person configure plugins, give their role `plugins.configure`, for example with a "Plugin operator" role.

**Plugin access** and `plugins.use` decide which plugins a role can see. This applies to the plugin proxy, in-process plugin routes, `GET /api/plugins`, and the plugin data on the REST and MCP APIs. For a role without access to a plugin:

- MINT leaves the experiment data and artifacts of that plugin out of lists.
- A single read of that data answers 404.
- A request that names the plugin answers 403 `plugin.not_visible`.

A write into the design data or objects of a plugin also needs `plugins.use`. A `plugin_access` value other than `"all"`, a list of plugin names, or null grants no plugin.

Plugin authors: see [Route permissions](/sdk/recipes/route-permissions).
