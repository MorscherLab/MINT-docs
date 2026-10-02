# Run Your First Experiment

A complete walkthrough from logging into MINT to running your first analysis plugin — about 5 minutes.

> [Screenshot: full MINT window showing the home dashboard, ready to start]

## Prerequisites

- A running MINT instance (hosted, direct, or Docker — see [Get Started](/admin/install-direct))
- An account with the **Member** role (the default for new accounts) or equivalent permissions
- At least one experiment type created by your admin, and one analysis plugin installed and visible to your role (see [Marketplace](/guide/marketplace))

## Step 1: Create a project

Open **Projects** from the top navigation and click **New Project**.

> [Screenshot: New project form with name, status, dates, description, lead, and members]

| Field | What it's for |
|-------|---------------|
| Name | Human-readable label, e.g., "TCA flux pilot" |
| Description | Goals and scope |
| Lead (optional) | The person responsible; the lead can edit the project and manage members |
| Members (optional) | Existing MINT users to add; they join as `editor` |

Click **Create**. You're now inside the project page.

## Step 2: Create an experiment

On the project page, click **New Experiment**. MINT assigns a unique code from the experiment type, such as `DR-EXP-001` for a `dose_response` type or `LCM-EXP-001` for `lcms`.

| Field | What it's for |
|-------|---------------|
| Name | Human label |
| Type | One of the experiment types your admin created. Sets the code prefix. |
| Sequence (optional) | Override the code number; leave empty for the next free number |
| Start / End date, Notes (optional) | Planning details |
| Project | Preset when you start from a project page |
| Collaborators (optional) | Single-experiment access; you are stored as owner |

Save the form. The experiment starts in `planned` status. Design data is added later by the design plugin for that type. See [Experiments](/guide/experiments) for the status flow.

> [Screenshot: experiment-detail page in planned status]

## Step 3: Move to ongoing and attach data

Switch the status to **ongoing**. Most plugins gate result writes on `ongoing` or `completed`. If your workflow needs files or instrument output, open the relevant design or analysis plugin and attach the data there; plugin-produced files come back to the experiment as analysis artifacts.

> [Screenshot: experiment detail page with status set to ongoing and plugin launch options visible]

## Step 4: Run an analysis plugin

Use the experiment's **Analysis artifacts** card to pick an available analysis plugin, or open the plugin from the home **Plugins** launcher (it lists plugins by display name) and select this experiment. Fill in the plugin's parameters and click **Run**.

If the plugin needs dependency isolation, MINT runs it in a subprocess and proxies its UI back into the page. Generated analysis plugins show run progress in the plugin page's job status tray.

> [Screenshot: analysis-plugin sidebar with parameters and Run button]

Approximate runtimes depend on the plugin and dataset size. The plugin job tray shows live status: queued → running → done (or failed).

## Step 5: Review analysis artifacts

When the plugin finishes, the experiment's **Analysis artifacts** card populates with the outputs it wrote. Artifacts are grouped by producing plugin and can include summaries, tables, downloadable files, or JSON payloads. If you edit the design after an analysis runs, MINT marks older artifacts as **stale** so you know which outputs may need to be regenerated.

> [Screenshot: analysis artifacts card showing one plugin group with downloadable outputs]

## Step 6: Wrap up

Switch the experiment status to **completed** when the work is finished. MINT records `end_date` automatically if it was empty. Plugins may treat completed experiments as read-only, depending on their own workflow rules.

## Further steps

- **Add collaborators** — see [Experiments → Collaborators](/guide/experiments#collaborators)
- **Install another plugin** — see [Marketplace](/guide/marketplace)
- **Use the CLI** — see [`mint` overview](/admin/cli) for scripted experiment + project access
- **Build your own plugin** — start with the [Plugin Development Guide](/sdk/)

## Troubleshooting

→ [Common issues and resolutions](/reference/troubleshooting)
