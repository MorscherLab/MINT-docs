export const currentDocsVersion = '1.2.6'

// Frozen documentation commits, each built with its own package.json and lockfile.
export const archivedDocs = [
  { version: '1.2.1', ref: '5e3b5e900d49d57b2a6acb5eb29df0dd380d8b9c' },
]

export function versionNav(version: string) {
  return {
    text: `v${version}`,
    items: [
      { text: `${currentDocsVersion} (current)`, link: 'https://mint-docs.morscherlab.org/', target: '_self' },
      ...archivedDocs.map(archive => ({
        text: `${archive.version} (archived)`,
        link: `https://mint-docs.morscherlab.org/v${archive.version}/`,
        target: '_self',
      })),
    ],
  }
}
