import { strict as assert } from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { archivedDocs, currentDocsVersion } from '../.vitepress/versions'

const output = resolve(import.meta.dir, '../.vitepress/dist')
const versions = [
  { version: currentDocsVersion, base: '/' },
  ...archivedDocs.map(archive => ({ version: archive.version, base: `/v${archive.version}/` })),
]
for (const { version, base } of versions) {
  const root = join(output, base)
  const index = readFileSync(join(root, 'index.html'), 'utf8')
  assert(index.includes(`v${version}`), `${version}: missing active version label`)
  for (const target of versions) {
    assert(index.includes(`https://mint-docs.morscherlab.org${target.base}`), `${version}: missing version link`)
  }
  const catalog = readFileSync(join(root, 'sdk/components/index.html'), 'utf8')
  assert(catalog.includes(`href="${base}sdk/components/data-frame"`), `${version}: catalog escaped its version`)
  const props = readFileSync(join(root, 'sdk/components/data-frame.html'), 'utf8')
  assert(props.includes(`/blob/v${version}/packages/sdk-frontend/`), `${version}: wrong SDK source`)
  assert(props.includes(`href="${base}sdk/`), `${version}: missing versioned navigation`)
  for (const [, href] of props.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (href.startsWith(`${base}assets/`)) {
      assert(existsSync(join(output, href)), `${version}: missing asset ${href}`)
    }
  }
  assert(existsSync(join(root, 'fonts/jetbrains-mono/JetBrainsMono-variable.woff2')), `${version}: missing code font`)
}
const currentCli = readFileSync(join(output, 'sdk/api/cli-reference.html'), 'utf8')
assert(currentCli.includes('mint db current'), 'Current docs must contain the released database CLI')
const legacyCli = readFileSync(join(output, 'v1.2.1/sdk/api/cli-reference.html'), 'utf8')
assert(!legacyCli.includes('mint db current'), 'Archived docs must preserve the 1.2.1 command surface')
assert(!existsSync(join(output, 'v1.2.1/CNAME')), 'Only the root site owns CNAME')
console.log(`Verified ${versions.length} version labels, switch links, isolated catalogs, assets and API baselines.`)
