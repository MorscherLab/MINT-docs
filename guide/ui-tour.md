# UI Tour

This page shows where each control is. Use it when you cannot find a setting or a workflow.

> [Screenshot: home page with the top action bar, the status strip, the Experiments and Projects cards, the Plugins launcher and the open account menu labeled]

## Top action bar

The top action bar shows on platform pages and plugin pages. The controls depend on the page and on your permissions.

| Element | What it does |
|---------|--------------|
| MINT logo | Opens the home dashboard |
| Navigation | The pills **Home**, **Experiments** (with **Experiments** and **Projects**) and **Instruments** open the platform pages. **Instruments** shows a red dot while an active instrument has an unacknowledged critical alert. On a detail page, breadcrumbs lead back |
| Page selector | On a plugin with more than one page: the plugin name and the current page. Lists the plugin pages that you may open |
| Experiment | On a plugin page that works on an experiment: the selected experiment. Select another one, save, or detach it |
| Jobs | On a plugin page that runs jobs: your latest job and its progress, or **Jobs** with the count of completed jobs. Opens the [jobs tray](#jobs-tray) |
| Getting started | A chip with the progress, such as `1/2`, while the checklist is open. Its **x** button hides the chip |
| Help | Opens the [checklist, the tours, and **What's new**](#help-and-tours). A count on the button shows unread news |
| Theme toggle | Switches between light, dark and system theme |
| Settings | On the home page only: opens the settings window on [Appearance](#appearance) |
| Admin | Opens the Admin workspace. See [Permissions -> Admin panel](/reference/permissions#admin-panel) for who sees it |
| Account menu | Shows your name. Choose **Profile** to open **Your account**, **Send feedback** to [send a message to the lab admins](#send-feedback), or **Sign out** |

## Help and tours

MINT has two short tours and a checklist for new users. MINT keeps their state per browser and per user.

- Tours: the tour **The MINT top bar** starts once for each user. It shows the page pills, the account menu and the **Help** button. The tour **Experiments** starts on your first visit to the Experiments page. Its step about creating an experiment shows only when you may create experiments.
- Getting started: the checklist has two tasks, **Create an experiment** and **Create a project**. A task shows only when your role may do it. MINT marks a task done when you create the record. If you already own an experiment or belong to a project, the task is done at once. The **Open** link beside a task goes to the right page.
- Help button: click it to open the checklist, play a tour again, read **What's new**, or hide or show the **Getting started** chip. The chip goes away when all tasks are done.

> [Screenshot: Help panel with the Getting started checklist and the list of tours]

## Appearance

Click **Settings** on the home page. The **Appearance** tab has three settings. MINT keeps them in your browser.

| Setting | Options |
|---------|---------|
| Theme | **Light**, **Dark**, **System** |
| Color palette | **Teal** (default), **Colour-blind safe**, **Purple**, **Ocean**, **Forest** |
| Density | **Compact**, **Normal** (default), **Comfortable**. Sets the height of table rows, fields and buttons. The preview in the window shows the effect |

The settings apply to all platform pages and plugin pages. Other pages have only the theme toggle.

> [Screenshot: Settings window on the Appearance tab with the theme, color palette and density options and the preview]

## Jobs tray

A plugin page that runs jobs, such as a generated analysis plugin, shows a **Jobs** control in the top bar. The control shows one item, in this order of priority:

1. A job that needs your input.
2. Your first running job.
3. A job that just finished, for 6 seconds.
4. The number of failed jobs that you have not seen.

Without a job, it shows **Jobs** and the count of completed jobs.

Click the control to open the tray under the top bar. The tray lists your jobs in two sections, **Active** and **Finished**:

- An active job has **Cancel**.
- A job that can be deleted has **Delete**.
- **Clear** in the **Finished** section removes all finished jobs.

A plugin can make the tray ask for confirmation before **Cancel**, **Delete** and **Clear**. Press Escape to close the tray. The tray shows the jobs of that plugin only. MINT has no platform-wide jobs list.

> [Screenshot: plugin page with the jobs tray open under the top bar]

## Send feedback

Choose **Send feedback** in the account menu, select **Bug**, **Idea** or **Other**, write your message (at most 5000 characters), and click **Send**. For what admins receive, see [Audit log and feedback](/admin/platform-settings#audit-log-and-feedback).

## Home dashboard

The home dashboard opens after you sign in. It shows what needs your attention.

| Region | What it shows |
|--------|---------------|
| Status strip | Today's date, the open items that need you (**Needs you**), and the lab notice board |
| Notice board | The pinned or newest active notice. When there are earlier notices, a window lists them |
| Experiments | Recently updated experiments with status and code. The **Mine** chip shows only your own |
| Projects | Recently updated projects with experiment counts and status. The **Mine** chip shows only your own |
| Instruments | Live status of active instruments, errors and offline first. Shows with `instruments.view` when at least one instrument is active. See [Instruments](/guide/instruments#instruments-on-home) |
| Plugins | The enabled plugins that your role may open, as a grid or list. Search by display name or plugin ID, and pin the plugins that you use most |

Admins who can manage notices see a link from the notice board to **Admin -> Lab content -> Notices**.

A plugin shows under the display name from its author, or under its plugin ID when there is none. The plugin page, the experiment page and the settings list use the same name. In the settings window, the **Plugins** tab under **Platform** lists the installed plugins that you can open.

> [Screenshot: home dashboard with the status strip, the notice board, the Experiments and Projects cards, and the Plugins launcher labeled]

## Sign-in pages

| Page | What it does |
|------|--------------|
| `/login` | Sign-in with password, passkey or SWITCH edu-ID. Then the second-factor step, if your lab requires it. See [Access -> Sign in](/guide/access#sign-in) |
| `/register` | Self-registration. Sends you to `/login` when an admin turned registration off |
| `/setup` | First-run setup wizard for the database and the first admin account. Shows until setup is complete |
| `/device` | Approve a sign-in code that the `mint` CLI shows. See [AI Assistants and API Access](/guide/ai-and-api#sign-in-the-mint-cli) |

MINT does not support mobile browsers. On a phone, it shows **Desktop browser required**. The `/device` page and the sign-in page before it work on a phone.

## Projects and Experiments lists

`/projects` and `/experiments` list every record you can see, with search and filters. Both lists switch between **Table** and **Cards** layouts. Click a row to open its detail page.

## Project page

The project page has a header, rollup chips, an experiments table and a metadata rail. See [Projects -> Project page](/guide/projects#project-page).

## Experiment detail page

The experiment page has a header with the status, the **Design data** card, the **Analysis artifacts** card and a metadata rail. See [Experiments -> Design and analysis on the detail page](/guide/experiments#design-and-analysis-on-the-detail-page).

## Your account

Open the account menu in the top action bar and choose **Profile**.

| Section | Contains |
|---------|----------|
| Profile | First name, last name, short name, email, and the read-only username |
| Password | Change your password. See [Access -> Change your password](/guide/access#change-your-password) |
| Security | Passkeys, the authenticator app and SWITCH edu-ID, when your lab turned them on. See [Access -> Second factor](/guide/access#second-factor) |
| AI & API | The MCP URL for AI assistants, and your personal access tokens. See [AI Assistants and API Access](/guide/ai-and-api) |

**Log out** is at the bottom of the side rail of the window.

> [Screenshot: Your account modal with Profile, Password, Security, and AI & API sections]

## Admin workspace

Click **Admin** in the top action bar, or go to `/admin`. You see only the sections that your permissions allow.

| Group | Section | Contains |
|-------|---------|----------|
| People & access | Users | Account list, role assignment, disable / re-enable, password reset, and passkey reset |
| People & access | Roles | Built-in role presets and custom-role editor |
| People & access | Access tokens | Every user's personal access tokens, with revoke |
| People & access | Service tokens | Tokens for instrument daemons that report to a plugin, with revoke |
| Plugins | Installed | Installed plugins (display name; the second line adds the plugin ID when it is different), runtime state, access control, update, and uninstall actions |
| Plugins | Registry | Marketplace catalog, install (admins only), refresh, compatibility, and update badges |
| Plugins | Libraries | Reference files that plugins read. See [Libraries](/admin/libraries) |
| Lab content | Experiment types | Experiment type registration and platform-owned design metadata |
| Lab content | Notices | Publish, pin, archive, restore, and delete home-dashboard notices |
| System | Configuration | Platform, auth, database, storage, access, marketplace, notification (email, Teams, Slack, Apple Push), and observability settings |
| System | Notifications | Teams and Slack channels. See [Teams and Slack channels](/admin/platform-settings#teams-and-slack-channels) |
| System | Updates | Platform and plugin updates, and the update settings. See [Updates](/admin/updates) |
| System | Server | Runtime health, platform version, update status, and plugin process information |
| System | Logs | Structured platform logs and health diagnostics |
| System | Terminal | Optional shell in the server process and a saved startup script. Hidden unless turned on and permitted. See [Permissions -> Admin terminal](/reference/permissions#admin-terminal) |

The admin navigation rail shows the running version and API health in its footer.

> [Screenshot: Admin workspace showing the People & access, Plugins, Lab content and System groups in the navigation rail]

## Plugin views

Each plugin shows inside the platform shell. The shell keeps the top action bar. The plugin owns the main content.

A plugin page usually has a title or tabs at the top, the main panel, an optional right sidebar for parameters, and actions such as **Run** or **Export**. The top bar shows the [page selector](#top-action-bar) and the [jobs tray](#jobs-tray). The address keeps the selected experiment (`experiment_id`).

## Reload notice, shortcuts and notifications

After an update of the platform, open tabs show a notice with a reload action. A plugin page shows the same notice when a newer plugin version is installed.

MINT has no global keyboard shortcuts. Menus, tables and windows use the standard browser keys.

MINT has no notification bell. See [Notifications and iOS push](/guide/notifications).
