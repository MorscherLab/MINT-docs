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
      text: Deploy MINT
      link: /get-started/install-direct
    - theme: alt
      text: Build a plugin
      link: /sdk/
    - theme: alt
      text: Hosted MINT instance
      link: https://mint.morscherlab.org

features:
  - icon: 🚀
    title: Deploy MINT first
    details: Install MINT on a Linux server directly or with Docker, configure Postgres, auth, passkeys, marketplace registry, and the reverse proxy before inviting lab users.
    link: /get-started/install-direct
    linkText: Deployment guide

  - icon: 🧪
    title: Understand the experiment model
    details: "Experiments are the central database object: projects group them, plugins attach design data and analysis results, and roles decide who can view or edit each workflow."
    link: /workflow/data-model
    linkText: Data model

  - icon: 🔌
    title: Learn the plugin system
    details: MINT plugins can be static, analysis, experiment-design, or full workflow plugins. They mount routes, expose frontend pages, use migrations, and run isolated when dependencies require it.
    link: /workflow/plugins
    linkText: Plugin system

  - icon: 🧰
    title: Build a plugin step by step
    details: Start with mint init, run the backend and frontend in development mode, read experiments through PlatformContext, write results, add migrations, and package a .mint bundle.
    link: /sdk/
    linkText: Plugin development guide

  - icon: 🔐
    title: Auth, roles, and passkeys
    details: JWT plus WebAuthn / passkey login. Eighteen permissions in five groups, three platform roles (Admin, Member, Viewer), project membership, and experiment collaborators. Route-level guards enforce every action.
    link: /workflow/auth-passkeys
    linkText: Authentication

  - icon: 🛒
    title: Install and update plugins
    details: Browse the registry, upload .mint bundles, install from GitHub release assets, configure plugin settings, and keep compatible plugins updated.
    link: /workflow/marketplace
    linkText: Marketplace

  - icon: 📡
    title: Reference and operations
    details: Use the mint CLI, inspect permissions, troubleshoot deployments, publish plugins, and check the API reference after the core path is clear.
    link: /cli/overview
    linkText: CLI and reference
---

::: tip Hosted MINT access
If your lab operates a MINT server, no local installation is required. The hosted version uses your lab credentials; contact your administrator to request access.

[Open MINT](https://mint.morscherlab.org)
:::

::: info Rebrand in flight
MINT is the new name for what was formerly called MLD. The rebrand landed alongside `v1.0.0`: the SDK is now `mint-sdk` (PyPI) / `@morscherlab/mint-sdk` (npm), the CLI binary is `mint`, env vars use the `MINT_` prefix. Legacy `mld-sdk` / `@morscherlab/mld-sdk` packages are frozen — no further releases. See the [rebrand decision record](https://github.com/MorscherLab/MINT/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).
:::

::: info Developer documentation
This site is organized as a learning path: deploy MINT, understand the experiment data model, learn the plugin system, then build plugins with the SDK tutorials. Reference material, operations, CLI, and API pages come after that core path. The platform repository remains the source of truth for implementation details.
:::
