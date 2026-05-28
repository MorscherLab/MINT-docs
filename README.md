# MINT Docs

The user-facing documentation site for [MINT](https://github.com/MorscherLab/MINT) — Mass-spec INtegrated Toolkit (formerly MLD). Built with [VitePress](https://vitepress.dev/), deployed to **mint-docs.morscherlab.org** via GitHub Pages.

This repository contains the user manual and the Plugin Development documentation track: install guides, workflow walkthroughs, UI tour, FAQ, glossary, user-level CLI usage, SDK concepts, tutorials, recipes, frontend SDK guidance, operations, and API reference. The platform repository remains the implementation source of truth.

## Layout

```
MINT-docs/
  package.json          # vitepress (Bun-managed)
  bunfig.toml           # forces hoisted node_modules
  index.md              # home page
  changelog.md          # links to GitHub releases
  team.md               # team and contributors
  get-started/
    install-direct.md
    install-docker.md
    install-hosted.md
    quickstart.md
  workflow/
    data-model.md
    projects.md
    experiments.md
    members-roles.md
    auth-passkeys.md
    plugins.md
    marketplace.md
    updates.md
  cli/
    overview.md
    platform.md
    configuration.md
  sdk/
    concepts/
    tutorials/
    recipes/
    frontend/
    operations/
    api/
  reference/
    ui-tour.md
    permissions.md
    troubleshooting.md
    faq.md
    glossary.md
  .vitepress/
    config.ts           # nav, sidebar, theme, search, edit links
    theme/              # MINT brand color overrides
    public/
      CNAME             # mint-docs.morscherlab.org
      mint-icon.png     # site icon (master in MorscherLab/MINT/assets/)
  .github/workflows/
    deploy.yml          # build + GitHub Pages on push to main
```

## Local development

```bash
bun install
bun run dev      # http://localhost:17174/
bun run build    # outputs to .vitepress/dist/
bun run preview  # serve the built site
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes to GitHub Pages. The CNAME file ships in the build artifact.

**One-time DNS setup**:

1. Add a CNAME record `mint-docs.morscherlab.org` → `morscherlab.github.io` at your DNS provider.
2. In the repo's GitHub Pages settings: Source = "GitHub Actions", custom domain = `mint-docs.morscherlab.org`, enable "Enforce HTTPS".

## Adding a page

1. Create a new `.md` file under `get-started/`, `workflow/`, `cli/`, `sdk/`, or `reference/`.
2. Add an entry to the relevant `sidebar` group in `.vitepress/config.ts`.
3. Optionally link to it from the home page or other pages.

## Contributing

Edits welcome — every page has an "Edit on GitHub" link in the footer that takes you straight to the source. Or open a PR.

## License

Documentation under the same license as the platform (see the [MINT repository](https://github.com/MorscherLab/MINT)).
