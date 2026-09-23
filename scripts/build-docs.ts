import { strict as assert } from 'node:assert'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { archivedDocs, currentDocsVersion } from '../.vitepress/versions'

const root = resolve(import.meta.dir, '..')
const installedSdk = JSON.parse(readFileSync(join(root, 'node_modules/@morscherlab/mint-sdk/package.json'), 'utf8')).version
assert.equal(installedSdk, currentDocsVersion, 'Update the docs version and SDK together')
const run = (command: string, args: string[], cwd = root): void => {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

run('bun', ['run', 'build:current'])
const destination = join(root, '.vitepress/dist')
for (const archive of archivedDocs) {
  assert(/^\d+\.\d+\.\d+$/.test(archive.version), 'Use an exact release version')
  const workspace = mkdtempSync(join(tmpdir(), `mint-docs-${archive.version}-`))
  try {
    const tar = join(workspace, 'source.tar')
    run('git', ['archive', archive.ref, '--output', tar])
    run('tar', ['-xf', tar, '-C', workspace])
    rmSync(tar)
    const archiveTheme = join(workspace, '.vitepress')
    renameSync(join(archiveTheme, 'config.ts'), join(archiveTheme, 'config.original.ts'))
    cpSync(join(root, '.vitepress/versions.ts'), join(archiveTheme, 'versions.ts'))
    // Repair a historical navigation anchor without changing the archived API text.
    const themingPath = join(workspace, 'sdk/frontend/theming.md')
    writeFileSync(themingPath, readFileSync(themingPath, 'utf8')
      .replace('/sdk/frontend/composables#usetheme', '/sdk/frontend/composables#other-notable-composables-one-line-each'))
    // This catalog-only fix keeps historical component links under the archive base.
    const catalogPath = join(archiveTheme, 'theme/components/ComponentCatalog.vue')
    let catalog = readFileSync(catalogPath, 'utf8')
    if (!catalog.includes("from 'vitepress'")) {
      catalog = catalog.replace('<script setup lang="ts">', '<script setup lang="ts">\nimport { withBase } from \'vitepress\'')
      catalog = catalog.replace(':href="`/sdk/components/${componentSlug(component.name)}`"', ':href="withBase(`/sdk/components/${componentSlug(component.name)}`)"')
      writeFileSync(catalogPath, catalog)
    }
    writeFileSync(join(archiveTheme, 'config.ts'), `import original from './config.original'\nimport { versionNav } from './versions'\nexport default {\n  ...original,\n  base: '/v${archive.version}/',\n  outDir: ${JSON.stringify(join(destination, `v${archive.version}`))},\n  lastUpdated: false,\n  themeConfig: { ...original.themeConfig, siteTitle: 'MINT v${archive.version}', editLink: undefined, nav: [...original.themeConfig.nav.filter(item => !/^v[0-9]/.test(item.text ?? '')), versionNav('${archive.version}')] },\n}\n`)
    run('bun', ['install', '--frozen-lockfile'], workspace)
    const archivedSdk = JSON.parse(readFileSync(join(workspace, 'node_modules/@morscherlab/mint-sdk/package.json'), 'utf8')).version
    assert.equal(archivedSdk, archive.version, 'Archive lockfile must match its documented SDK')
    run('node', [join(workspace, 'node_modules/vitepress/bin/vitepress.js'), 'build'], workspace)
    // Only the root Pages artifact declares a custom domain.
    rmSync(join(destination, `v${archive.version}`, 'CNAME'), { force: true })
  } finally {
    rmSync(workspace, { recursive: true, force: true })
  }
}
console.log(`Built current ${currentDocsVersion} and ${archivedDocs.length} documentation archive(s).`)

run('bun', ['scripts/check-doc-versions.ts'])
