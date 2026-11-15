export const currentDocsVersion = '1.5.5'

// Frozen documentation commits, each built with its own package.json and lockfile.
export const archivedDocs = [
  { version: '1.4.3', ref: 'f35b5f7db4f0e0a6169a907573af6965243822ef' },
  { version: '1.3.0', ref: '4ef01239a12ed29793808e35a11397609d83582b' },
  { version: '1.2.9', ref: '796bbf2938f99fc6df909136a71ae42417ce6f76' },
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
