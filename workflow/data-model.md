# MINT data model

MINT is organized around one central object: the **experiment**. Projects group experiments, users and roles decide who can see or edit them, and plugins attach design data, analysis results, and plugin-owned tables around them.

This page is the conceptual database map before you install or write plugins.

## Core entities

| Entity | What it represents | Owned by |
|--------|--------------------|----------|
| **Project** | A lab project, study, collaboration, or dataset container | Platform |
| **Experiment** | One unit of scientific work with a type-scoped code, type, status, design data, results, and artifacts | Platform + plugins |
| **Experiment type** | A slug plus display metadata selected when creating an experiment | Platform; usually paired with a design or full plugin |
| **User** | A person or service account | Platform |
| **Role** | Platform permissions such as viewing projects, managing users, or installing plugins | Platform |
| **Project member** | A user's role inside one project | Platform |
| **Plugin role** | A plugin-specific role string such as `viewer`, `editor`, or `admin` | Plugin + platform |
| **Plugin table** | Plugin-owned relational tables for domain-specific data | Plugin |

## Experiment shape

An experiment combines platform fields with plugin-defined fields:

| Field group | Examples | Notes |
|-------------|----------|-------|
| Identity | `id`, `experiment_code`, `name` | `experiment_code` is generated from type + sequence, e.g. `LCM-EXP-001` |
| Classification | `experiment_type`, `status`, project link | Status is `planned`, `ongoing`, `completed`, or `cancelled` |
| Ownership | creator, collaborators, project members | Access is resolved from platform RBAC and project membership |
| Design data | sample layout, plate map, run sequence, treatment plan | One JSON payload written by an `EXPERIMENT_DESIGN` or `FULL` plugin |
| Analysis results | run outputs, summaries, result metadata | JSON entries keyed by plugin ID, written by `ANALYSIS` or `FULL` plugins |
| Artifacts | uploaded files, generated reports, exported tables | Usually plugin-produced or plugin-consumed |

Think of the platform experiment row as the stable spine. Plugins should store highly structured or query-heavy data in their own tables, then write compact design/result summaries back onto the experiment so the MINT UI can show status and launch follow-up workflows.

## How plugins attach data

| Plugin type | Can read experiments | Can write design data | Can write analysis results | Typical use |
|-------------|----------------------|-----------------------|----------------------------|-------------|
| `STATIC` | Yes | No | No | Reference viewers and calculators |
| `ANALYSIS` | Yes | No | Yes | Peak picking, model fitting, report generation |
| `EXPERIMENT_DESIGN` | Yes | Yes | No | Plate maps, acquisition sequences, treatment layouts |
| `FULL` | Yes | Yes | Yes | End-to-end workflows that own design and analysis |

The plugin type is declared in `PluginMetadata.plugin_type`. The platform enforces write boundaries through `PlatformContext`, so an analysis plugin cannot accidentally overwrite design data.

## Storage layers

| Layer | What lives there |
|-------|------------------|
| Platform database | Users, roles, projects, experiments, experiment types, plugin role assignments, plugin migration records |
| `server.dataPath` | SQLite/local files when used, passkeys, marketplace cache, uploaded `.mint` bundles, plugin install snapshots |
| Plugin schema or tables | Domain-specific relational data created by plugin migrations |
| Experiment JSON fields | `design_data` and `analysis_results` stored on the experiment row so other workflows can read them |

For production, use PostgreSQL. SQLite mode is useful for single-server evaluation installs, but plugin roles, shared plugin tables, and multi-user operations are designed around database-backed deployments. `database.mode: "none"` only keeps file-backed setup/auth basics alive; experiments and projects require SQLite or PostgreSQL.

## Lifecycle

1. A user creates a project.
2. An admin creates or enables an experiment type and installs the plugin(s) that act on it.
3. A user creates an experiment and chooses that type.
4. The design plugin writes structured design data.
5. One or more analysis/full plugins read the experiment and upsert their result entries.
6. Users review results, export artifacts, or launch follow-up plugin workflows.

## Read next

→ [Experiments](/workflow/experiments) - user workflow around the model
→ [Plugins](/workflow/plugins) - how plugins attach to experiments
→ [First analysis plugin](/sdk/tutorials/first-analysis-plugin) - build a plugin that reads an experiment and writes results
