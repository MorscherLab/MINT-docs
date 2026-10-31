# UI Tour

Every major MINT screen, mapped to the controls users see in the current platform UI. Use this when you cannot find a setting or are not sure where a workflow starts.

> [Screenshot: full MINT window with regions labeled - top action bar, home dashboard, plugin launcher, main content, and account menu]

## Top action bar

The top action bar appears on platform pages and SDK plugin shells. The exact controls depend on the page and on your permissions.

| Element | What it does |
|---------|--------------|
| **MINT logo / platform name** | Returns to the home dashboard |
| **Navigation / breadcrumb** | The pill navigation (**Home**, **Experiments** with **Experiments** and **Projects**, and **Instruments**) moves between platform pages. **Instruments** shows a red dot while an active instrument has an unacknowledged critical alert. Breadcrumbs lead back from record detail pages |
| **Page selector** | On a plugin page with more than one page: the plugin name and the current page. Lists the plugin pages that you may open |
| **Experiment** | On plugin pages that work on an experiment: the selected experiment. Select another one, save, or detach it |
| **Jobs** | On plugin pages that run jobs: your latest job and its progress, or an idle **Jobs** button with a count of completed jobs. Opens the [jobs tray](#jobs-tray) |
| **Getting started** | A chip with progress such as `1/2` while the checklist is open. Its **x** button hides the chip |
| **Help** | Opens the [Getting started checklist, the tours, and **What's new**](#help-and-tours). A count on the button shows unread news |
| **Theme toggle** | Switches the active light/dark/system theme for the shell |
| **Settings** | On the home page: opens the settings window, which starts on [Appearance](#appearance) |
| **Admin** | Opens the Admin workspace when your role exposes at least one admin section |
| **Account menu** | Shows your name. Choose **Profile** to open **Your account**, **Send feedback** to [send a message to the lab admins](#send-feedback), or **Sign out** |

## Help and tours

MINT guides new users with two short tours and a checklist. All of them are per browser and per user.

- **Tours.** The tour **The MINT top bar** starts once for every user. It shows the page pills, the account menu, and the **Help** button. The tour **Experiments** starts on your first visit to the Experiments page. Its step about creating an experiment shows only when you may create experiments.
- **Getting started.** The checklist has two tasks: **Create an experiment** and **Create a project**. A task shows only when your role may do it. MINT marks a task done when you create the record, or at once when you already own an experiment or belong to a project. The **Open** link beside a task goes to the right page.
- **Help button.** Click it to open the checklist, to play a tour again, to read **What's new**, and to hide or show the **Getting started** chip. Hide the chip with its **x** button. The checklist chip disappears when all tasks are done.

> [Screenshot: Help panel with the Getting started checklist and the list of tours]

## Appearance

Click **Settings** on the home page. The **Appearance** tab has three settings. MINT keeps them in your browser.

| Setting | Options |
|---------|---------|
| **Theme** | **Light**, **Dark**, **System** |
| **Color palette** | **Teal** (default), **Colour-blind safe**, **Purple**, **Ocean**, **Forest** |
| **Density** | **Compact**, **Normal** (default), **Comfortable**. Sets the height of table rows, fields, and buttons. The preview in the window shows the effect |

The other pages have the theme toggle only. The settings apply to every platform page and to plugin pages.

## Jobs tray

A plugin page that runs jobs, such as a generated analysis plugin, shows a **Jobs** control in the top bar. The control shows the job that matters most to you, in this order: a job that needs your input, your first running job, a job that just finished (for 6 seconds), and the number of failed jobs that you have not seen. Without a job, it shows **Jobs** and the count of completed jobs.

Click the control to open the tray under the top bar. The tray lists your jobs in two sections, **Active** and **Finished**. An active job has **Cancel**. A job that can be deleted has **Delete**. **Clear** in the **Finished** section removes all finished jobs. A plugin can make the tray ask for confirmation before **Cancel**, **Delete** and **Clear**. Press Escape to close the tray.

> [Screenshot: plugin page with the jobs tray open under the top bar]

## Send feedback

Choose **Send feedback** in the account menu. Select **Bug**, **Idea**, or **Other**, write your message (at most 5000 characters), and click **Send**. MINT sends the page address (without query) and your browser version with the message. Admins read feedback in the audit log. You can send 10 messages per hour.

## Home dashboard

The landing page after logging in. The dashboard is built for quick triage:

| Region | What it shows |
|--------|---------------|
| **Status strip** | Today's date, open items that need attention, and the lab notice board |
| **Notice board** | The pinned or newest active notice, with an earlier-notices modal when history exists |
| **Experiments** | Recently updated experiments with status and code; a toggle shows only your own |
| **Projects** | Recently updated projects with experiment counts and project status; a toggle shows only your own |
| **Instruments** | Live status of active instruments, errors and offline first. Shown with `instruments.view` when at least one instrument is active. See [Instruments](/guide/instruments#instruments-on-home) |
| **Plugins** | Searchable grid/list of enabled plugins by display name or plugin ID, with per-user pinning and entry-point links |

Admins who can manage notices see a shortcut from the notice board to **Admin -> Platform -> Notices**.

Plugins appear under the display name their authors declare, or under the plugin ID if there is none. The plugin page, the experiment page, and the settings list use the same name. The Home settings window opens on [**Appearance**](#appearance). Its **Plugins** tab, under **Platform** in the side rail, lists the installed plugins you can open.

> [Screenshot: home dashboard with status strip, notice board, recent records, and plugin launcher labeled]

## Sign-in pages

| Page | What it does |
|------|--------------|
| `/login` | Password, passkey and (when enabled) SWITCH edu-ID sign-in. A lab that requires a second factor then shows **Verify it's you** or **Set up a passkey**. An account that waits for an admin shows **Waiting for approval** |
| `/register` | Self-registration; sends you to `/login` when an admin has turned registration off |
| `/setup` | First-run setup wizard (database, first admin account) shown until setup completes |
| `/device` | Approve a sign-in code that the `mint` CLI shows. See [AI Assistants and API Access](/guide/ai-and-api#sign-in-the-mint-cli) |

MINT does not support mobile browsers: on a phone it shows **Desktop browser required** instead of the app. The `/device` page and the sign-in page that leads to it also work on a phone.

## Projects and Experiments lists

`/projects` and `/experiments` list every record you can see, with search and filters. Both lists switch between **Table** and **Cards** layouts. Click a row to open its detail page.

## Project page

Single project record view:

| Region | Contents |
|--------|----------|
| **Header** | Project name, status, description, edit action, and **New experiment** |
| **Rollup chips** | Counts for all experiments, experiments with design data, and experiments without design data; click to filter the table |
| **Experiments table** | Code, name, type, status, design completeness, and created date |
| **Metadata rail** | Project dates, members, tags, and admin-only destructive actions |

> [Screenshot: project page with rollup chips and experiments table]

## Experiment detail page

Single experiment record view:

| Region | Contents |
|--------|----------|
| **Header** | Experiment code (or **+ Assign number**), title, status stepper, people avatars when realtime updates are on, edit/cancel/reactivate actions, and an **Open in plugin** action when a design plugin owns the experiment |
| **Design data** | Grouped design fields, sample rows, JSON/CSV export, and fallback full-document viewer |
| **Analysis artifacts** | Outputs grouped by producing plugin, with status, artifact key, result keys, open/download/edit/archive actions, and a show-archived toggle |
| **Instrument records** | With `instruments.view`: instrument history rows that name this experiment |
| **Metadata rail** | Type, project, timeline, creator, parent link, data lineage, collaborators, tags, and delete action |

The status control in the header drives writability. See [Experiments -> Lifecycle](/guide/experiments#lifecycle).

> [Screenshot: experiment detail page with the Analysis artifacts card open]

## Your account

Open the account menu in the top action bar and choose **Profile**.

| Section | Contains |
|---------|----------|
| **Profile** | First name, last name, display shortname, email, and read-only username |
| **Password** | Current password, new password (at least 8 characters, at most 72 bytes), confirmation, and the password-change action. Changing it keeps you signed in here and signs out your other sessions |
| **Security** | Passkeys and SWITCH edu-ID linking, when those auth features are enabled. When your lab requires a second factor, MINT keeps your last passkey: you cannot delete it |
| **AI & API** | MCP URL for AI assistants, and your personal access tokens. See [AI Assistants and API Access](/guide/ai-and-api) |

The account modal is for identity, sign-in, and access-token settings; **Log out** sits at the bottom of its side rail. Shell appearance is controlled by the theme toggle in the top action bar and by **Settings** on the home page.

> [Screenshot: Your account modal with Profile, Password, Security, and AI & API sections]

## Admin workspace

Open **Admin** from the top action bar or go to `/admin`. Users only see sections allowed by their platform permissions.

| Group | Section | Contains |
|-------|---------|----------|
| **People** | **Users** | Account list, role assignment, disable / re-enable, password reset, and passkey reset |
| **People** | **Roles** | Built-in role presets and custom-role editor |
| **Plugins** | **Installed** | Installed plugins (display name; the second line adds the plugin ID when it is different), runtime state, access control, update, and uninstall actions |
| **Plugins** | **Registry** | Marketplace catalog, install (admins only), refresh, compatibility, and update badges |
| **Platform** | **Experiment types** | Experiment type registration and platform-owned design metadata |
| **Platform** | **Notices** | Publish, pin, archive, restore, and delete home-dashboard notices |
| **Platform** | **Configuration** | Platform, auth, database, storage, access, marketplace, notification (email, Teams, Slack, Apple Push), and observability settings |
| **Platform** | **Access tokens** | Every user's personal access tokens, with revoke |
| **Platform** | **Service tokens** | Tokens for instrument daemons that report to a plugin, with revoke |
| **Platform** | **Server** | Runtime health, platform version, update status, and plugin process information |
| **Platform** | **Terminal** | Optional container/process shell and persisted startup script; hidden unless enabled and permitted |
| **Platform** | **Logs** | Structured platform logs and health diagnostics |

The admin navigation rail shows the running version and API health in its footer.

> [Screenshot: Admin workspace showing People, Plugins, and Platform groups in the navigation rail]

## Plugin views

Each installed plugin renders inside the platform shell at its plugin route. The shell keeps the platform identity, navigation, theme, and account controls; the plugin owns the main content.

| Region | Convention |
|--------|------------|
| Top of plugin content | Plugin-owned title, breadcrumb, tabs, or step indicator |
| Main panel | Plugin UI, generated form, workspace, chart, table, or custom Vue view |
| Right sidebar (optional) | Per-plugin parameters, details, or compact controls |
| Bottom or inline actions (optional) | Run, save, export, upload, or open artifact actions |

Plugin pages that run jobs, such as generated analysis plugins, show the [jobs tray](#jobs-tray) from the top bar. The tray shows the jobs of that plugin only; MINT has no platform-wide jobs list. The plugin top bar also lists the plugin's pages in a page selector, and it keeps the selected experiment in the address (`experiment_id`).

Plugins should use the `AppLayout`, `PluginWorkspaceView`, `AppTopBar`, and related components from `@morscherlab/mint-sdk`. See [Frontend SDK](/sdk/frontend/).

## Notes on shortcuts and notifications

After the platform is updated, open tabs show a notice with a reload action so the page picks up the new version. The same notice appears on a plugin page when a newer plugin version is installed.

Current MINT releases rely on standard browser and component keyboard behavior for focus, menus, tables, and modal dismissal. Do not assume global shortcut overlays are available unless your deployment or plugin adds them.

Notification delivery (email and push) is configured by your admin, and plugin features can publish notification events through the platform. The platform shell does not show a notification bell. See [Notifications and iOS push](/guide/notifications).

## Next

-> [Permissions](/reference/permissions) - what each role can see and do
-> [Troubleshooting](/reference/troubleshooting) - when things do not work
-> [FAQ](/reference/faq) - quick answers
-> [Glossary](/reference/glossary) - terms used across MINT
