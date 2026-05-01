# Run Your First Experiment

A complete walkthrough from logging into MINT to running your first analysis plugin — about 5 minutes.

> [Screenshot: full MINT window showing the home dashboard, ready to start]

## Prerequisites

- A running MINT instance (hosted, direct, or Docker — see [Get Started](/get-started/install-direct))
- An account with at least the **Member** role
- At least one analysis plugin installed and visible to your role (your admin can install one from the [marketplace](/workflow/marketplace) if not)

## Step 1: Create a project

From the home dashboard, click **New project**.

> [Screenshot: New-project modal with name and description fields]

| Field | What it's for |
|-------|---------------|
| Name | Human-readable label, e.g., "TCA flux pilot" |
| Description | One-line summary shown on the dashboard |
| Members (optional) | Lab colleagues to invite — they get the default project role |

Click **Create**. You're now inside the project page.

## Step 2: Create an experiment

Click **New experiment**. MINT auto-assigns a unique code (`EXP-001`, `EXP-002`, …) — you don't pick it.

| Field | What it's for |
|-------|---------------|
| Title | Human label |
| Type | Pick an experiment type registered by an installed design plugin (e.g., LCMS sequence, drug-response panel). Determines the design fields below. |
| Status | Starts at **planned** |
| Collaborators (optional) | Per-experiment overrides on top of project members |

Fill in the design fields exposed by the experiment type, then **Save**. The experiment is now in `planned` status. See [Experiments](/workflow/experiments) for the status flow.

> [Screenshot: experiment-detail page in planned status]

## Step 3: Move to ongoing and upload data

Switch the status to **ongoing**. Most plugins gate result writes on `ongoing` or `completed`. Then upload the relevant artifacts (RAW files, sequence sheets, design plates) — the file picker shows the experiment-type's expected attachments.

> [Screenshot: experiment file uploader with attachments queued]

## Step 4: Run an analysis plugin

Open the **Analyze** tab on the experiment. Pick an installed analysis plugin from the dropdown, fill in its parameters, and click **Run**.

The plugin runs in its own isolated subprocess; MINT proxies its UI back into the page. Progress is tracked in the **Jobs** panel (top-right).

> [Screenshot: analysis-plugin sidebar with parameters and Run button]

Approximate runtimes depend on the plugin and dataset size. The Jobs panel shows live status: queued → running → done (or failed).

## Step 5: See your results

When the plugin finishes, the experiment's **Results** tab populates with whatever the plugin wrote (charts, tables, downloadable artifacts). Multiple analysis runs accumulate over time — every run is timestamped and attributed to the user who launched it.

> [Screenshot: results tab showing accumulated analysis runs]

## Step 6: Wrap up

Switch the experiment status to **completed** to lock it. Completed experiments are read-only by default; only owners and admins can re-open them.

## Further steps

- **Invite collaborators** — see [Members & roles](/workflow/members-roles)
- **Install another plugin** — see [Marketplace](/workflow/marketplace)
- **Use the CLI** — see [`mint` overview](/cli/overview) for scripted experiment + project access
- **Build your own plugin** — see [SDK overview](/sdk/overview)

## Troubleshooting

→ [Common issues and resolutions](/reference/troubleshooting)
