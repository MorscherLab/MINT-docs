import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MINT',
  description: 'Mass-spec INtegrated Toolkit — user manual for the MINT lab platform (formerly MLD)',
  lang: 'en-US',

  cleanUrls: true,
  // Temporarily allow forward-references to /sdk/ sections still being written.
  // Reset to `false` (strict) once all sections are written — see Task 9 of
  // docs/superpowers/plans/2026-05-01-mint-docs-sdk-deepening.md
  ignoreDeadLinks: [
    /^\/sdk\/(tutorials|recipes|frontend|operations|api)/,
  ],
  srcExclude: ['README.md', 'CLAUDE.md', 'docs/**', 'node_modules/**'],

  head: [
    ['link', { rel: 'icon', href: '/mint-icon.png' }],
    ['meta', { name: 'theme-color', content: '#4F46E5' }],
  ],

  themeConfig: {
    logo: '/mint-icon.png',
    siteTitle: 'MINT',

    nav: [
      {
        text: 'User Manual',
        items: [
          { text: 'Get Started', link: '/get-started/install-direct' },
          { text: 'Guide', link: '/workflow/projects' },
          { text: 'CLI', link: '/cli/overview' },
        ],
      },
      {
        text: 'Plugin Development',
        items: [
          { text: 'Concepts', link: '/sdk/concepts/' },
          { text: 'Tutorials', link: '/sdk/tutorials/' },
          { text: 'Recipes', link: '/sdk/recipes/' },
          { text: 'Frontend', link: '/sdk/frontend/' },
          { text: 'Operations', link: '/sdk/operations/' },
          { text: 'API Reference', link: '/sdk/api/' },
        ],
      },
      { text: 'Reference', link: '/reference/ui-tour' },
      {
        text: 'More',
        items: [
          { text: 'Team', link: '/team' },
          { text: 'Changelog', link: '/changelog' },
          { text: 'Source code', link: 'https://github.com/MorscherLab/mld' },
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
          text: 'Guide',
          items: [
            { text: 'Projects', link: '/workflow/projects' },
            { text: 'Experiments', link: '/workflow/experiments' },
            { text: 'Members & roles', link: '/workflow/members-roles' },
            { text: 'Authentication', link: '/workflow/auth-passkeys' },
            { text: 'Plugins', link: '/workflow/plugins' },
            { text: 'Marketplace', link: '/workflow/marketplace' },
            { text: 'Updates', link: '/workflow/updates' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'mint CLI',
          items: [
            { text: 'Overview', link: '/cli/overview' },
            { text: 'mint serve', link: '/cli/serve' },
            { text: 'Plugin development', link: '/cli/plugin-dev' },
            { text: 'Platform commands', link: '/cli/platform' },
            { text: 'Configuration', link: '/cli/configuration' },
          ],
        },
      ],
      '/sdk/': [
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
          text: 'Tutorials',
          items: [
            { text: 'Overview', link: '/sdk/tutorials/' },
            { text: 'First analysis plugin', link: '/sdk/tutorials/first-analysis-plugin' },
            { text: 'Design plugin with tables', link: '/sdk/tutorials/design-plugin-with-tables' },
            { text: 'Adding a frontend', link: '/sdk/tutorials/adding-a-frontend' },
            { text: 'Plugin roles', link: '/sdk/tutorials/plugin-roles' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Overview', link: '/sdk/recipes/' },
            { text: 'Reading experiments', link: '/sdk/recipes/reading-experiments' },
            { text: 'Writing results', link: '/sdk/recipes/writing-results' },
            { text: 'Managing artifacts', link: '/sdk/recipes/managing-artifacts' },
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
            { text: 'Components', link: '/sdk/frontend/components' },
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
      { icon: 'github', link: 'https://github.com/MorscherLab/mld' },
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
