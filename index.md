---
layout: home

hero:
  name: MINT
  text: Mass-spec INtegrated Toolkit
  tagline: Plan experiments, group them into projects, and run analysis plugins for LC-MS, drug-response prediction, chemical drawing, and more, all in one lab web app.
  image:
    src: /mint-icon.png
    alt: MINT
  actions:
    - theme: brand
      text: Run your first experiment
      link: /guide/quickstart
    - theme: alt
      text: Open the lab's MINT
      link: https://mint.morscherlab.org
    - theme: alt
      text: Set up a server
      link: /admin/install-direct

features:
  - icon: 🔑
    title: Sign in
    details: Open your lab's MINT in a browser and sign in with a password, a passkey, or SWITCH edu-ID. Create your own account if your lab allows it.
    link: /guide/access
    linkText: Access MINT

  - icon: 🧪
    title: Run your first experiment
    details: Create a project, add an experiment, move it through planned, ongoing, and completed, and review the analysis outputs, in about five minutes.
    link: /guide/quickstart
    linkText: Quickstart

  - icon: 📁
    title: Organize projects and experiments
    details: Group experiments into projects, add colleagues as members or collaborators, filter by status and type, and archive finished work.
    link: /guide/experiments
    linkText: Experiments

  - icon: 🛒
    title: Find and request plugins
    details: Browse the plugin registry, install plugins if your role allows it, or request one with a short justification.
    link: /guide/marketplace
    linkText: Marketplace

  - icon: 🛠️
    title: Run a MINT server
    details: For lab admins. Install on Linux directly or with Docker, put a reverse proxy in front, finish setup, and manage users, roles, plugins, and updates.
    link: /admin/install-direct
    linkText: Admin guide

  - icon: 🧰
    title: Build a plugin
    details: For developers. Scaffold with mint init, read experiments through the SDK, write analysis results, and package a .mint bundle.
    link: /sdk/
    linkText: Plugin development
---

::: tip Using your lab's MINT
If your lab already runs MINT, you do not need to install anything. Open the lab's address in a browser and sign in; ask your administrator if you do not have an account.

[Open MINT](https://mint.morscherlab.org)
:::

::: info About this site
These pages document MINT @MINT_VERSION@. **Guide** pages are for everyone who uses MINT day to day. **Admin** pages cover installing and running a server. **Plugin development** is for developers who extend MINT with the `mint-sdk` package.
:::
