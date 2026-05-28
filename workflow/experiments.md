# Experiments

An **experiment** is the central unit of work in MINT. It has a unique type-scoped code, a type, a status, optional dates, optional collaborators, one design-data payload, and analysis results keyed by plugin.

> [Screenshot: experiment detail page with header, design panel, analyze tab, and results tab]

## Anatomy

| Field | Description |
|-------|-------------|
| **Code** | Auto-assigned, globally unique, and derived from the experiment type (`LCM-EXP-001`, `DR-EXP-001`, …). |
| **Title** | Human-readable label. Editable any time. |
| **Type** | Selected at creation; determines the design schema and plugin allowlists. |
| **Status** | `planned`, `ongoing`, `completed`, or `cancelled`. See [Lifecycle](#lifecycle). |
| **Owner** | The user who created it. |
| **Collaborators** | Per-experiment role overrides on top of project membership. |
| **Design data** | One JSON payload owned by the experiment-design or full plugin. |
| **Analysis results** | JSON outputs keyed by plugin ID. A plugin can keep its own run history inside its result payload. |
| **Artifacts** | Uploaded files (RAW data, plates, sequence sheets, etc.). |

## Create an experiment

From a project page, click **New experiment** on the **Experiments** tab.

> [Screenshot: new-experiment modal with type selector and design fields]

| Field | Notes |
|-------|-------|
| **Title** | Required. |
| **Type** | Required. Populated from installed `EXPERIMENT_DESIGN` and `FULL` plugins (e.g., LC-MS sequence, drug-response panel). If empty, ask your admin to install a relevant plugin. |
| **Design data** | The form here is rendered by the type's plugin; it's whatever the plugin author defined. |
| **Collaborators** (optional) | Add now or later. New collaborators are added with the `collaborator` role; the creator is stored as `owner`. |

Click **Create**. You land on the new experiment in `planned` status.

## Lifecycle

```
   planned ──▶ ongoing ──▶ completed
      │          │
      └──────────┴──▶ cancelled ──▶ planned
```

| Status | Meaning | Who can write |
|--------|---------|---------------|
| **planned** | Design is being filled in. No data uploaded yet. | Users with `experiments.edit` and visibility |
| **ongoing** | Data is being collected; analysis can run. Moving here auto-fills `start_date` if empty. | Same as planned |
| **completed** | Final state. Moving here auto-fills `end_date` if empty. | Same as planned unless a plugin blocks writes |
| **cancelled** | Terminal off-ramp for planned/ongoing work. Can be reactivated only to `planned`. | Same as planned |

Core MINT validates only the `cancelled` rules above. Plugins can be stricter: many gate writes on `ongoing` or `completed`, and some require `completed` before publishing downstream results.

> [Screenshot: status pill control showing the three states]

## Plugin interaction

Plugin types interact with experiments differently:

| Type | Experiment role |
|------|-----------------|
| `STATIC` | Can read experiment context for viewers or reference tools, but cannot write design data or analysis results. |
| `ANALYSIS` | Reads existing experiments and writes its own entry under `analysis_results` plus produced artifacts. |
| `EXPERIMENT_DESIGN` | Owns an experiment type and writes that experiment's `design_data`. |
| `FULL` | Owns design data and can also write analysis results/artifacts. |

A given experiment has exactly one design-owning plugin, selected by its type, but it can be analyzed by many `ANALYSIS` or `FULL` plugins over time.

See [Plugins](/workflow/plugins) for the full plugin model.

## Collaborators

Experiment visibility depends on `access.experimentVisibilityMode`:

| Mode | Behavior |
|------|----------|
| `open` (default) | Users with `experiments.view` can list/read experiments broadly. |
| `restricted` | Non-admin users see experiments they created, collaborate on, or can access through project membership. |

Write actions are still gated by system permissions such as `experiments.edit` and `experiments.delete`. To grant visibility on a single experiment, add **collaborators**:

| Collaborator role | Effect |
|-------------------|--------|
| **collaborator** | Can see the experiment even if they are not a project member |
| **owner** | Can manage collaborators and delete the experiment; MINT keeps at least one owner |

Collaborators are stored on the experiment itself (in `collaborators`), not on the project. They survive even if the user is later removed from the project. See [Members & roles](/workflow/members-roles) for the underlying RBAC.

## Search and filters

The experiments list inside a project supports:

| Filter | Notes |
|--------|-------|
| **Status** | planned / ongoing / completed / cancelled |
| **Type** | Faceted by installed experiment types |
| **Owner** | Anyone in the project |
| **Created in** | Date range |
| **Free text** | Searches name and notes |

> [Screenshot: experiments list with multiple filters applied]

## Deleting experiments

Deleting an experiment currently removes the experiment row. Treat it as irreversible from the UI and make sure your platform database backups cover the recovery window your lab needs. Plugin-owned tables and external artifacts should define their own cleanup or retention policy.

## Next

→ [Plugins](/workflow/plugins) — the full plugin model
→ [Marketplace](/workflow/marketplace) — install and request plugins
→ [Members & roles](/workflow/members-roles) — collaborators and overrides
