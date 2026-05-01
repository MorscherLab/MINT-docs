# Tutorials

End-to-end walkthroughs that take you from an empty directory to a runnable plugin. Each tutorial is self-contained and produces working software you can keep extending.

## Before you start

You'll need:

| | |
|---|---|
| **Python** | 3.12 or newer |
| **Bun** | latest (for frontend tutorials) |
| **`mint` CLI** | `uv tool install mint-sdk` (or pip / pipx — see [Get Started](/get-started/install-direct)) |
| **A running platform** | Optional but recommended — `mint dev --platform` from the plugin directory spins up both |
| **Familiarity with the [Concepts](/sdk/concepts/) pages** | Recommended; tutorials reference the vocabulary established there |

## The tutorials

| # | Tutorial | Time | What you'll build |
|---|----------|------|-------------------|
| 1 | [First analysis plugin](/sdk/tutorials/first-analysis-plugin) | 30 min | A hello-world ANALYSIS plugin with one HTTP route, runnable in standalone and integrated mode |
| 2 | [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) | 60 min | An EXPERIMENT_DESIGN plugin with its own database table, schema migrations, and CRUD routes |
| 3 | [Adding a frontend](/sdk/tutorials/adding-a-frontend) | 45 min | A Vue 3 + `@morscherlab/mint-sdk` frontend mounted on the analysis plugin from tutorial 1 |
| 4 | [Plugin roles](/sdk/tutorials/plugin-roles) | 30 min | Adding a per-plugin role enum and gating routes / UI by it |

If you're new to MINT plugin development, do them in order. They share the same starter project, and each builds on the last.

## How tutorials are structured

- Every code block is **runnable** as written. Imports are explicit; commands are exact.
- File paths are **absolute relative to the plugin project root** unless noted.
- Commands are tagged with the directory they should be run from (`# in <plugin-root>/`).
- Output expected from each command is shown with `→` markers.
- After each section there's a **Checkpoint** — a one-liner you can run to verify your project is in the expected state before moving on.

## Where to go from a tutorial

When you finish a tutorial:

- Stuck on a specific operation? → [Recipes](/sdk/recipes/) covers ~10 common patterns
- Need a precise method signature? → [API Reference](/sdk/api/)
- Shipping to PyPI / the marketplace? → [Operations → Publishing](/sdk/operations/publishing)
