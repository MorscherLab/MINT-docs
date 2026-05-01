---
layout: home

hero:
  name: MINT
  text: Mass-spec INtegrated Toolkit
  tagline: A modular laboratory platform for projects, experiments, and analysis plugins. FastAPI backend + Vue 3 frontend, with a marketplace of installable plugins for LC-MS, drug-response prediction, chemical drawing, and more.
  image:
    src: /mint-icon.png
    alt: MINT
  actions:
    - theme: brand
      text: Get Started
      link: /get-started/install-direct
    - theme: alt
      text: Quickstart
      link: /get-started/quickstart
    - theme: alt
      text: Hosted MINT instance
      link: https://mint.morscherlab.org

features:
  - icon: 🧪
    title: Experiments and projects
    details: Track experiments end-to-end with unique codes (EXP-001), status workflow (planned → ongoing → completed), collaborators, and versioned design data. Group experiments under projects with per-project membership.
    link: /workflow/experiments
    linkText: Experiment workflow

  - icon: 🔌
    title: Plugin architecture
    details: Two plugin types — design plugins own their data schemas and full CRUD, analysis plugins read experiment data and produce results. Each plugin runs isolated, with its own venv when needed and per-plugin migrations.
    link: /workflow/plugins
    linkText: Plugins

  - icon: 🛒
    title: Plugin marketplace
    details: Discover, request, install, and upgrade plugins from a registry. Admins approve install requests; lifecycle hooks ship snapshots so an uninstall can roll back cleanly.
    link: /workflow/marketplace
    linkText: Marketplace

  - icon: 🔐
    title: Auth, roles, and passkeys
    details: JWT plus WebAuthn / passkey login. Eighteen permissions in five groups, three system roles (Admin, Member, Viewer), and per-project role overrides. Route-level guards enforce every action.
    link: /workflow/auth-passkeys
    linkText: Authentication

  - icon: 🧰
    title: SDK for plugin authors
    details: mint-sdk (Python) provides AnalysisPlugin, PlatformContext, repositories, and per-plugin schema migrations. @morscherlab/mint-sdk (npm) ships ~96 Vue 3 components and ~27 composables for plugin frontends.
    link: /sdk/overview
    linkText: SDK overview

  - icon: 📡
    title: Observability and updates
    details: OpenTelemetry tracing, structured logs, automatic GitHub issue reports for unhandled errors, and platform / plugin auto-updates wired to the GitHub release feed.
    link: /workflow/updates
    linkText: Updates
---

::: tip Hosted MINT access
If your lab operates a MINT server, no local installation is required. The hosted version uses your lab credentials; contact your administrator to request access.

[Open MINT](https://mint.morscherlab.org)
:::

::: info Rebrand in flight
MINT is the new name for what was formerly called MLD. The rebrand landed alongside `v1.0.0`: the SDK is now `mint-sdk` (PyPI) / `@morscherlab/mint-sdk` (npm), the CLI binary is `mint`, env vars use the `MINT_` prefix. Legacy `mld-sdk` / `@morscherlab/mld-sdk` packages are frozen — no further releases. See the [rebrand decision record](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).
:::

::: info Developer documentation
This site is the user manual. For full SDK reference, plugin internals, and contributor guides, see the [SDK documentation](https://github.com/MorscherLab/mld/tree/main/sdk) in the platform repository.
:::
