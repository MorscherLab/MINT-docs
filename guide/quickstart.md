# Run Your First Experiment

This walkthrough takes you from sign-in to your first analysis results. It takes about 5 minutes.

## Prerequisites

- A running MINT server. To install one, see [Install directly](/admin/install-direct).
- An account with the **Member** role, the default for new accounts, or equivalent permissions.
- At least one experiment type that your admin created.
- At least one analysis plugin that is installed and that your role can use. See [Marketplace](/guide/marketplace).

On your first visit, MINT shows a tour and a **Getting started** checklist. See [UI tour -> Help and tours](/guide/ui-tour#help-and-tours).

## Step 1: Create a project

1. Open **Experiments -> Projects** in the top navigation.
2. Click **New project**.
3. Fill in the form and click **Create project**. For the fields, see [Projects -> Create a project](/guide/projects#create-a-project).
4. The new project shows in the list. Click it to open the project page.

## Step 2: Create an experiment

1. On the project page, click **New experiment**. The form starts with this project and its members selected.
2. Enter a **Name**.
3. Select a **Type**. The type sets the prefix of the experiment code.
4. Click **Create experiment**.

The experiment starts in `planned` status and has no code yet. For when MINT assigns the code, see [Experiments -> Experiment numbers](/guide/experiments#experiment-numbers). For the other form fields, see [Experiments -> Create an experiment](/guide/experiments#create-an-experiment).

![Experiment detail page in planned status, with the + Assign number button in place of the code](/screenshots/guide/quickstart-experiment-planned.webp)

## Step 3: Move the experiment to ongoing

1. Set the status to **ongoing**. MINT assigns the experiment number if the experiment has none.
2. If your workflow needs files or instrument output, open the design or analysis plugin and attach the data there.

Most plugins write results only when the experiment is `ongoing` or `completed`.

## Step 4: Run an analysis plugin

1. Open an analysis plugin. Use the **Analysis artifacts** card on the experiment page, or the **Plugins** launcher on the home page.
2. If you opened the plugin from the home page, select this experiment.
3. Fill in the parameters of the plugin.
4. Click **Run analysis**.

A generated analysis plugin shows the run status in the **Jobs** control of its top bar: queued, running, done or failed. See [UI tour -> Jobs tray](/guide/ui-tour#jobs-tray). The run time depends on the plugin and the size of the dataset.

![Generated analysis plugin page with the parameter form, the Run analysis button, and the progress of a running job in the Jobs control of the top bar](/screenshots/guide/quickstart-running-job.webp)

## Step 5: Review the analysis artifacts

When the plugin finishes, its outputs show in the **Analysis artifacts** card of the experiment, grouped by plugin. See [Experiments -> Artifacts](/guide/experiments#artifacts).

![Analysis artifacts card with one plugin group and an artifact with Open, Edit, Download and Archive actions](/screenshots/guide/quickstart-analysis-artifacts.webp)

## Step 6: Complete the experiment

Set the status to **completed** when the work is finished. MINT sets `end_date` if it is empty. Some plugins make completed experiments read-only.

## Next steps

- Add people to the experiment: [Experiments -> Collaborators](/guide/experiments#collaborators).
- Connect an AI assistant: [AI Assistants and API Access](/guide/ai-and-api).
- Use the `mint` CLI for scripts: [`mint` overview](/admin/cli).
- Build your own plugin: [Plugin Development Guide](/sdk/).

If something does not work, see [Troubleshooting](/reference/troubleshooting).
