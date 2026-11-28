---
layout: home

hero:
  name: MINT
  text: Mass-spec Infrastructure for Next-generation Toolkits
  tagline: A lab web app to plan experiments, group them into projects, and run analysis plugins for LC-MS, drug-response prediction and chemical drawing.
  image:
    src: /mint-icon.svg
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
    details: Open your lab's MINT in a browser. Sign in with a password, a passkey or SWITCH edu-ID. Your lab can require a second factor.
    link: /guide/access
    linkText: Access MINT

  - icon: 🧪
    title: Run your first experiment
    details: Create a project and an experiment, move the experiment to completed, and review the analysis outputs. It takes about five minutes.
    link: /guide/quickstart
    linkText: Quickstart

  - icon: 📁
    title: Organize projects and experiments
    details: Group experiments into projects, add colleagues, filter by status and type, and archive finished work.
    link: /guide/experiments
    linkText: Experiments

  - icon: 📡
    title: Watch your instruments
    details: See which instruments run and which need attention. Get a push message on your phone when a run finishes.
    link: /guide/instruments
    linkText: Instruments

  - icon: 🤖
    title: Connect an AI assistant
    details: Create a personal access token and connect Claude Code or another MCP client. The assistant searches experiments and starts plugin jobs as you.
    link: /guide/ai-and-api
    linkText: AI and API access

  - icon: 🛒
    title: Find plugins
    details: Browse the plugin registry. Admins install plugins from it; other users ask an admin.
    link: /guide/marketplace
    linkText: Marketplace

  - icon: 🛠️
    title: Run a MINT server
    details: For lab admins. Install on Linux, directly or with Docker. Manage users, roles, plugins and updates.
    link: /admin/install-direct
    linkText: Admin guide

  - icon: 🧰
    title: Build a plugin
    details: For developers. Scaffold a plugin with mint init, read experiments, write analysis results, and package a .mint bundle.
    link: /sdk/
    linkText: Plugin development
---

::: tip Using your lab's MINT
If your lab runs MINT, you install nothing. Open the lab's address in a browser and sign in. If you have no account, ask your administrator.

[Open MINT](https://mint.morscherlab.org)
:::

::: info About this site
These pages document MINT @MINT_VERSION@. Guide pages are for all MINT users. Admin pages are for the people who install and run a server. Plugin development pages are for developers who use the `mint-sdk` package.
:::
