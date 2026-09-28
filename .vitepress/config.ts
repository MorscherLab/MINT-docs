import { defineConfig } from 'vitepress'
import { componentSidebarGroups } from './componentCatalog'
import { currentDocsVersion, versionNav } from './versions'

export default defineConfig({
  title: 'MINT',
  description: 'Mass-spec INtegrated Toolkit — user manual for the MINT lab platform (formerly MLD)',
  lang: 'en-US',

  cleanUrls: true,
  ignoreDeadLinks: false,
  srcExclude: ['README.md', 'CLAUDE.md', 'AGENTS.md', 'docs/**', 'tasks/**', 'node_modules/**'],

  head: [
    ['link', { rel: 'icon', href: '/mint-icon.png' }],
    ['meta', { name: 'theme-color', content: '#4F46E5' }],
  ],

  markdown: {
    config(md) {
      // `@MINT_VERSION@` works in prose, code blocks and links; one bump per release.
      md.core.ruler.before('normalize', 'mint-version', (state) => {
        state.src = state.src.replaceAll('@MINT_VERSION@', currentDocsVersion)
      })

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
        text: 'Use MINT',
        items: [
          { text: 'First experiment (5 min)', link: '/guide/quickstart' },
          { text: 'Access MINT', link: '/guide/access' },
          { text: 'Data model', link: '/guide/data-model' },
          { text: 'Projects', link: '/guide/projects' },
          { text: 'Experiments', link: '/guide/experiments' },
          { text: 'Marketplace', link: '/guide/marketplace' },
          { text: 'UI tour', link: '/guide/ui-tour' },
        ],
      },
      {
        text: 'Administer',
        items: [
          { text: 'Install (direct)', link: '/admin/install-direct' },
          { text: 'Install (Docker)', link: '/admin/install-docker' },
          { text: 'Configuration', link: '/admin/configuration' },
          { text: 'Users & roles', link: '/admin/users-roles' },
          { text: 'Plugins', link: '/admin/plugins' },
          { text: 'Updates', link: '/admin/updates' },
          { text: 'mint CLI', link: '/admin/cli' },
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
          { text: 'API reference', link: '/sdk/api/' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Permissions', link: '/reference/permissions' },
          { text: 'Troubleshooting', link: '/reference/troubleshooting' },
          { text: 'FAQ', link: '/reference/faq' },
          { text: 'Glossary', link: '/reference/glossary' },
          { text: 'Changelog', link: '/changelog' },
          { text: 'Team', link: '/team' },
          { text: 'Source code', link: 'https://github.com/MorscherLab/MINT' },
        ],
      },
      versionNav(currentDocsVersion),
      { text: 'Open MINT', link: 'https://mint.morscherlab.org' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Use MINT',
          items: [
            { text: 'First experiment (5 min)', link: '/guide/quickstart' },
            { text: 'Access MINT', link: '/guide/access' },
            { text: 'Data model', link: '/guide/data-model' },
            { text: 'Projects', link: '/guide/projects' },
            { text: 'Experiments', link: '/guide/experiments' },
            { text: 'Marketplace', link: '/guide/marketplace' },
            { text: 'UI tour', link: '/guide/ui-tour' },
          ],
        },
      ],
      '/admin/': [
        {
          text: 'Install',
          items: [
            { text: 'Install on Linux (direct)', link: '/admin/install-direct' },
            { text: 'Install on Linux (Docker)', link: '/admin/install-docker' },
            { text: 'Reverse proxy & first run', link: '/admin/proxy-and-setup' },
          ],
        },
        {
          text: 'Operate',
          items: [
            { text: 'Configuration', link: '/admin/configuration' },
            { text: 'Users & roles', link: '/admin/users-roles' },
            { text: 'Authentication', link: '/admin/authentication' },
            { text: 'Plugins', link: '/admin/plugins' },
            { text: 'Updates', link: '/admin/updates' },
          ],
        },
        {
          text: 'Tools',
          items: [
            { text: 'mint CLI', link: '/admin/cli' },
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
            { text: 'Types & workflow plugin', link: '/sdk/tutorials/plugin-types-workflow' },
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
            { text: 'Platform integration', link: '/sdk/frontend/platform-integration' },
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
            { text: 'Upgrading the SDK', link: '/sdk/operations/upgrading' },
            { text: 'Migrate from 1.1 to 1.2', link: '/sdk/operations/migrate-1.1-to-1.2' },
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
            { text: 'Permissions', link: '/reference/permissions' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' },
            { text: 'FAQ', link: '/reference/faq' },
            { text: 'Glossary', link: '/reference/glossary' },
            { text: 'Changelog', link: '/changelog' },
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
