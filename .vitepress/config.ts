import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MINT',
  description: 'Mass-spec INtegrated Toolkit — user manual for the MINT lab platform (formerly MLD)',
  lang: 'en-US',

  cleanUrls: true,
  ignoreDeadLinks: false,
  srcExclude: ['README.md', 'CLAUDE.md', 'docs/**', 'node_modules/**'],

  head: [
    ['link', { rel: 'icon', href: '/mint-icon.png' }],
    ['meta', { name: 'theme-color', content: '#4F46E5' }],
  ],

  themeConfig: {
    logo: '/mint-icon.png',
    siteTitle: 'MINT',

    nav: [
      { text: 'Get Started', link: '/get-started/install-direct' },
      { text: 'Guide', link: '/workflow/projects' },
      { text: 'Reference', link: '/reference/ui-tour' },
      {
        text: 'For Developers',
        items: [
          { text: 'mint CLI', link: '/cli/overview' },
          { text: 'SDK overview', link: '/sdk/overview' },
          { text: 'SDK reference', link: 'https://github.com/MorscherLab/mld/tree/main/sdk' },
        ],
      },
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
          text: 'SDK',
          items: [
            { text: 'Overview', link: '/sdk/overview' },
            { text: 'Python SDK', link: '/sdk/python' },
            { text: 'Frontend SDK', link: '/sdk/frontend' },
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
