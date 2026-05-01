# Experiments

An **experiment** is the central unit of work in MINT. It has a unique code, a type (which determines the design fields and which plugins can act on it), a status that progresses through a lifecycle, optional collaborators, and accumulated analysis results.

> [Screenshot: experiment detail page with header, design panel, analyze tab, and results tab]

## Anatomy

| Field | Description |
|-------|-------------|
| **Code** | Auto-assigned, globally unique (`EXP-001`, `EXP-002`, …). Not editable. |
| **Title** | Human-readable label. Editable any time. |
| **Type** | Selected at creation; determines design schema (an experiment-design plugin owns this). Not editable after creation. |
| **Status** | `planned` → `ongoing` → `completed`. See [Lifecycle](#lifecycle). |
| **Owner** | The user who created it. |
| **Collaborators** | Per-experiment role overrides on top of project membership. |
| **Design data** | JSON validated against the experiment type's schema. |
| **Analysis results** | Accumulated outputs from analysis-plugin runs, indexed by run ID. |
| **Artifacts** | Uploaded files (RAW data, plates, sequence sheets, etc.). |

## Create an experiment

From a project page, click **New experiment** on the **Experiments** tab.

> [Screenshot: new-experiment modal with type selector and design fields]

| Field | Notes |
|-------|-------|
| **Title** | Required. |
| **Type** | Required. Populated from installed experiment-design plugins (e.g., LCMS sequence, drug-response panel). If empty, ask your admin to install a relevant plugin. |
| **Design data** | The form here is rendered by the type's plugin — it's whatever the plugin author defined. |
| **Collaborators** (optional) | Add now or later. |

Click **Create**. You land on the new experiment in `planned` status.

## Lifecycle

```
   planned ──▶ ongoing ──▶ completed
      ▲                       │
      └──────── (admin) ──────┘
```

| Status | Meaning | Who can write |
|--------|---------|---------------|
| **planned** | Design is being filled in. No data uploaded yet. | Owner, collaborators with edit role, project members per role |
| **ongoing** | Data is being collected; analysis can run. | Same as planned |
| **completed** | Final state. Read-only by default. | Owner and admins only — and only after re-opening |

Most plugins gate writes on `ongoing` or `completed`; some require `completed` before they'll publish results downstream. Each plugin documents its own status requirements.

> [Screenshot: status pill control showing the three states]

## Design plugins vs analysis plugins

Two plugin types interact with experiments differently:

| | Experiment-design plugin | Analysis plugin |
|---|---|---|
| Owns | An experiment type, with its own database schema and CRUD | None — reads existing experiments |
| Writes | The experiment's `design_data` and any owned tables | The experiment's `analysis_results` and produced artifacts |
| Visible at | Experiment creation form, design tab | Experiment **Analyze** tab |

A given experiment has exactly one design plugin (selected by its type) but can be analyzed by many analysis plugins over time.

See [Plugins](/workflow/plugins) for the full plugin model.

## Collaborators

By default, every project member can view every experiment in the project, with edit rights determined by their project role. To override that for a specific experiment, add **collaborators**:

| Collaborator role | Effect |
|-------------------|--------|
| **Viewer** | Can read the experiment even if they're not a project member |
| **Editor** | Can edit design data and run analyses |
| **Owner** | Same as the original owner — including delete |

Collaborators are stored on the experiment itself (in `collaborators`), not on the project — they survive even if the user is later removed from the project. See [Members & roles](/workflow/members-roles) for the underlying RBAC.

## Search and filters

The experiments list inside a project supports:

| Filter | Notes |
|--------|-------|
| **Status** | planned / ongoing / completed |
| **Type** | Faceted by installed experiment types |
| **Owner** | Anyone in the project |
| **Created in** | Date range |
| **Free text** | Searches title, code, design fields, and notes |

> [Screenshot: experiments list with multiple filters applied]

## Soft delete vs hard delete

Deleting an experiment marks it as removed but keeps the row, the artifacts, and any plugin-owned data for 30 days. After 30 days the row is purged. Admins can restore within the grace window. After purge, the data is gone — there is no extra backup beyond what your platform admin separately runs.

## Next

→ [Plugins](/workflow/plugins) — design vs analysis plugins
→ [Marketplace](/workflow/marketplace) — install and request plugins
→ [Members & roles](/workflow/members-roles) — collaborators and overrides
