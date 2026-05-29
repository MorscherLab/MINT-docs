import { defineConfig } from 'vitepress'
import { componentSidebarGroups } from './componentCatalog'

export default defineConfig({
  title: 'MINT',
  description: 'Mass-spec INtegrated Toolkit — user manual for the MINT lab platform (formerly MLD)',
  lang: 'en-US',

  cleanUrls: true,
  ignoreDeadLinks: false,
  srcExclude: ['README.md', 'CLAUDE.md', 'AGENTS.md', 'docs/**', 'node_modules/**'],

  head: [
    ['link', { rel: 'icon', href: '/mint-icon.png' }],
    ['meta', { name: 'theme-color', content: '#4F46E5' }],
  ],

  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules)

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const language = token.info.trim().split(/\s+/)[0]

        if (language === 'mermaid') {
          return `<MermaidDiagram encoded="${encodeURIComponent(token.content)}"></MermaidDiagram>`
        }

        return defaultFence
          ? defaultFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
      }
    },
  },

  themeConfig: {
    logo: '/mint-icon.png',
    siteTitle: 'MINT',

    nav: [
      {
        text: 'MINT Guide',
        items: [
          { text: '1. Deploy MINT', link: '/get-started/install-direct' },
          { text: '2. Data model: experiments', link: '/workflow/data-model' },
          { text: '3. Plugin system', link: '/workflow/plugins' },
          { text: '4. Plugin development guide', link: '/sdk/' },
          { text: 'First experiment walkthrough', link: '/get-started/quickstart' },
        ],
      },
      {
        text: 'Build Plugins',
        items: [
          { text: 'Plugin development overview', link: '/sdk/' },
          { text: 'Start: first plugin', link: '/sdk/tutorials/first-analysis-plugin' },
          { text: 'Tutorials', link: '/sdk/tutorials/' },
          { text: 'Component Library', link: '/sdk/components/' },
          { text: 'SDK concepts', link: '/sdk/concepts/' },
          { text: 'Frontend', link: '/sdk/frontend/' },
          { text: 'Recipes', link: '/sdk/recipes/' },
          { text: 'Operations', link: '/sdk/operations/' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'CLI', link: '/cli/overview' },
          { text: 'API Reference', link: '/sdk/api/' },
          { text: 'UI tour', link: '/reference/ui-tour' },
          { text: 'Permissions', link: '/reference/permissions' },
          { text: 'Troubleshooting', link: '/reference/troubleshooting' },
          { text: 'FAQ', link: '/reference/faq' },
          { text: 'Glossary', link: '/reference/glossary' },
        ],
      },
      {
        text: 'More',
        items: [
          { text: 'Team', link: '/team' },
          { text: 'Changelog', link: '/changelog' },
          { text: 'Source code', link: 'https://github.com/MorscherLab/MINT' },
        ],
      },
      { text: 'Open MINT', link: 'https://mint.morscherlab.org' },
    ],

    sidebar: {
      '/get-started/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Install on Linux (direct)', link: '/get-started/install-direct' },
            { text: 'Install on Linux (Docker)', link: '/get-started/install-docker' },
            { text: 'Use the hosted version', link: '/get-started/install-hosted' },
            { text: 'First experiment (5 min)', link: '/get-started/quickstart' },
          ],
        },
      ],
      '/workflow/': [
        {
          text: 'MINT core',
          items: [
            { text: 'Data model', link: '/workflow/data-model' },
            { text: 'Experiments', link: '/workflow/experiments' },
            { text: 'Projects', link: '/workflow/projects' },
            { text: 'Plugin system', link: '/workflow/plugins' },
            { text: 'Marketplace', link: '/workflow/marketplace' },
            { text: 'Members & roles', link: '/workflow/members-roles' },
            { text: 'Authentication', link: '/workflow/auth-passkeys' },
            { text: 'Updates', link: '/workflow/updates' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'mint CLI',
          items: [
            { text: 'Overview', link: '/cli/overview' },
            { text: 'Platform commands', link: '/cli/platform' },
            { text: 'Configuration', link: '/cli/configuration' },
          ],
        },
      ],
      '/sdk/components/': [
        {
          text: 'Component Library',
          items: [
            { text: 'Overview', link: '/sdk/components/' },
          ],
        },
        ...componentSidebarGroups,
      ],
      '/sdk/': [
        {
          text: 'Plugin Development',
          items: [
            { text: 'Overview', link: '/sdk/' },
            { text: 'Tutorial path', link: '/sdk/tutorials/' },
            { text: 'First analysis plugin', link: '/sdk/tutorials/first-analysis-plugin' },
            { text: 'Adding a frontend', link: '/sdk/tutorials/adding-a-frontend' },
            { text: 'Design plugin with tables', link: '/sdk/tutorials/design-plugin-with-tables' },
            { text: 'Plugin roles', link: '/sdk/tutorials/plugin-roles' },
          ],
        },
        {
          text: 'Component Library',
          items: [
            { text: 'Overview', link: '/sdk/components/' },
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Overview', link: '/sdk/concepts/' },
            { text: 'Plugin types', link: '/sdk/concepts/plugin-types' },
            { text: 'Plugin lifecycle', link: '/sdk/concepts/lifecycle' },
            { text: 'Isolation', link: '/sdk/concepts/isolation' },
            { text: 'PlatformContext', link: '/sdk/concepts/platform-context' },
            { text: 'Data model', link: '/sdk/concepts/data-model' },
            { text: 'Migrations', link: '/sdk/concepts/migrations' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Overview', link: '/sdk/recipes/' },
            { text: 'Reading experiments', link: '/sdk/recipes/reading-experiments' },
            { text: 'Writing results', link: '/sdk/recipes/writing-results' },
            { text: 'Querying plugin data', link: '/sdk/recipes/querying-plugin-data' },
            { text: 'Route permissions', link: '/sdk/recipes/route-permissions' },
            { text: 'Error handling', link: '/sdk/recipes/error-handling' },
            { text: 'Logging & tracing', link: '/sdk/recipes/logging-tracing' },
            { text: 'Testing plugins', link: '/sdk/recipes/testing-plugins' },
            { text: 'Backfill migrations', link: '/sdk/recipes/backfill-migration' },
            { text: 'R integration', link: '/sdk/recipes/r-integration' },
          ],
        },
        {
          text: 'Frontend',
          items: [
            { text: 'Overview', link: '/sdk/frontend/' },
            { text: 'Composables', link: '/sdk/frontend/composables' },
            { text: 'Design tokens', link: '/sdk/frontend/design-tokens' },
            { text: 'Theming', link: '/sdk/frontend/theming' },
            { text: 'FormBuilder', link: '/sdk/frontend/form-builder' },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Overview', link: '/sdk/operations/' },
            { text: 'Packaging', link: '/sdk/operations/packaging' },
            { text: 'Publishing', link: '/sdk/operations/publishing' },
            { text: 'CI patterns', link: '/sdk/operations/ci-patterns' },
            { text: 'Versioning', link: '/sdk/operations/versioning' },
            { text: 'Deploying', link: '/sdk/operations/deploying' },
            { text: 'Upgrading the SDK', link: '/sdk/operations/upgrading-sdk' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/sdk/api/' },
            { text: 'Python SDK', link: '/sdk/api/python' },
            { text: 'Frontend SDK', link: '/sdk/api/frontend' },
            { text: 'Migrations', link: '/sdk/api/migrations' },
            { text: 'REST client', link: '/sdk/api/client' },
            { text: 'Exceptions', link: '/sdk/api/exceptions' },
            { text: 'CLI reference', link: '/sdk/api/cli-reference' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'UI tour', link: '/reference/ui-tour' },
            { text: 'Permissions', link: '/reference/permissions' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' },
            { text: 'FAQ', link: '/reference/faq' },
            { text: 'Glossary', link: '/reference/glossary' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MorscherLab/MINT' },
    ],

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/MorscherLab/MINT-docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: { dateStyle: 'medium', timeStyle: undefined },
    },

    footer: {
      message: 'MINT is open source. Made by the Morscher Lab.',
      copyright: `© ${new Date().getFullYear()} Morscher Lab`,
    },

    outline: { level: [2, 3] },
  },

  vite: {
    server: { port: 17174, strictPort: true },
    // Explicit publicDir so CNAME + icon ship in dist/ regardless of cwd
    publicDir: '.vitepress/public',
  },
})
