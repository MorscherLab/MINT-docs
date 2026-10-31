// Run: bun scripts/update-component-props.ts /path/to/MINT/packages/sdk-frontend
// Use a clean checkout of the release matching the installed frontend SDK, with its node_modules installed.
// vue-component-meta reads props, events and slots through the SDK tsconfig (needs TypeScript 5; TypeScript 7 breaks it).
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strict as assert } from 'node:assert'
import ts from 'typescript'
import { createChecker } from 'vue-component-meta'
import { componentDocs, componentSlug } from '../.vitepress/componentCatalog'
const sdkRoot = resolve(process.argv[2] ?? '')
assert(process.argv[2], 'Pass the released packages/sdk-frontend directory')
const docsRoot = resolve(import.meta.dir, '..')
const version = JSON.parse(readFileSync(`${sdkRoot}/package.json`, 'utf8')).version
const installed = JSON.parse(readFileSync(`${docsRoot}/node_modules/@morscherlab/mint-sdk/package.json`, 'utf8')).version
assert.equal(version, installed, 'Source and installed SDK versions must match')
const { parseComponentExports } = await import(`${sdkRoot}/scripts/extract-docs-components.ts`)
// The package root and the lab, shell, data and runtime entries export components, as in the SDK's extract-docs.ts.
const exports = ['components/index', 'lab', 'shell', 'data', 'runtime']
  .flatMap(entry => parseComponentExports(`${sdkRoot}/src/${entry}.ts`))
interface Prop {
  name: string
  type: string
  required: boolean
  default?: string
  defaultKind?: string
  description: string
  source: string
}
interface Member { name: string; type: string; description: string }
interface Component { source: string; props: Prop[]; events: Member[]; slots: Member[] }
const results: Record<string, Component> = {}
const repoPath = (file: string): string => file.replace(`${sdkRoot}/`, 'packages/sdk-frontend/')
const checker = createChecker(`${sdkRoot}/tsconfig.json`, { forceUseTs: true, printer: { newLine: 1 } })

for (const component of componentDocs) {
  const exported = exports.find(entry => entry.name === component.name)
  assert(exported, `Missing public export: ${component.name}`)
  const filename = `${sdkRoot}/src/components/${exported.fileBase}.vue`
  const meta = checker.getComponentMeta(filename)
  // Global props (class, style, key, ref, ...) are not declared by the component.
  const props: Prop[] = meta.props.filter(prop => !prop.global).map(prop => {
    // The declaration keeps the source type (SelectOptionInput[], 'sm' | 'md'); prop.type is the expanded checker type.
    const declaration = prop.getDeclarations().find(entry => entry.file.startsWith(`${sdkRoot}/src/`))
    assert(declaration, `Missing declaration for ${component.name}.${prop.name}`)
    const text = readFileSync(declaration.file, 'utf8').slice(...declaration.range)
    const type = text.match(/^(?:readonly\s+)?['"]?[\w$-]+['"]?\??\s*:\s*([\s\S]+?)[;,]?$/)?.[1]
    assert(type, `Unsupported declaration for ${component.name}.${prop.name}: ${text}`)
    // Vue casts an absent prop to false when a member of its type union is boolean (not a function returning one).
    const typeObject = prop.getTypeObject()
    const implicitBoolean = !prop.required && prop.default === undefined
      && (typeObject.isUnion() ? typeObject.types : [typeObject]).some(member => member.flags & ts.TypeFlags.BooleanLike)
    return {
      name: prop.name, type, required: prop.required,
      ...(prop.default !== undefined ? { default: prop.default, defaultKind: 'explicit' } : implicitBoolean ? { default: 'false', defaultKind: 'implicit-boolean' } : {}),
      description: prop.description,
      source: repoPath(declaration.file),
    }
  })
  // event.type is the argument tuple, for example [value: OptionPrimitive].
  const events = meta.events.map(event => ({ name: event.name, type: event.type.replace(/^\[([\s\S]*)\]$/, '$1'), description: event.description }))
  const slots = meta.slots.map(slot => ({ name: slot.name, type: slot.type, description: slot.description }))
  results[component.name] = { source: repoPath(filename), props, events, slots }
}

const get = (name: string): any[] => (results[name] as any).props
assert.equal(Object.keys(results).length, componentDocs.length)
assert.equal(get('BaseButton').length, 8)
assert.equal(get('DataFrame').length, 9)
assert.equal(get('DataFrame').find(p => p.name === 'spec').type, 'DataFrameSpec')
assert.equal(get('DataFrame').find(p => p.name === 'data').required, true)
assert(!get('DataFrame').some(p => p.name === 'columns'))
assert(get('FormBuilder').some(p => p.name === 'spec'))
assert(!get('FormBuilder').some(p => p.name === 'schema'))
assert(get('PlateEditor').some(p => p.name === 'spec'))
assert(!get('PlateEditor').some(p => p.name === 'history'))
assert(get('PlotlyChart').length > 0)
assert(Object.values(results).some((entry: any) => entry.props.some((prop: any) => prop.defaultKind === 'implicit-boolean')))
assert.equal(get('AppToastContainer').length, 0)
assert.equal(get('SampleSelector').find(p => p.name === 'enableSmartGroup').default, 'true')
assert(!get('AppSidebar').some(p => p.name === 'variant'))
assert.equal(get('AppSidebar').find(p => p.name === 'spec').type, 'PluginWorkspaceSidebarSpec')
assert(!get('BaseTabs').some(p => p.name === 'variant'))
assert.equal(get('BasePill').find(p => p.name === 'dot').default, 'false')
assert.equal(get('FormField').find(p => p.name === 'layout').default, '"stacked"')
assert.equal(get('BaseSelect').find(p => p.name === 'options').type, 'SelectOptionInput[]')
assert(results.BaseSelect.events.some(event => event.name === 'update:modelValue'))
assert(results.BaseSelect.slots.some(slot => slot.name === 'option'))

const count = (key: 'props' | 'events' | 'slots'): number => Object.values(results).reduce((sum, entry) => sum + entry[key].length, 0)
console.log(`Extracted ${componentDocs.length} components, ${count('props')} props, ${count('events')} events, ${count('slots')} slots; regression assertions passed.`)

// Link uniquely named SDK types without guessing between ambiguous declarations.
const types = new Map<string, { source: string; values?: string }[]>()
for (const file of new Bun.Glob('src/**/*.ts').scanSync(sdkRoot)) {
  if (file.includes('/__tests__/') || file.endsWith('.d.ts') || file.endsWith('.test.ts')) continue
  const source = readFileSync(resolve(sdkRoot, file), 'utf8')
  const declarations = /^(?:export\s+)?(?:declare\s+)?(?:type|interface)\s+(\w+)\b/gm
  for (const match of source.matchAll(declarations)) {
    const line = source.slice(0, match.index).split('\n').length
    const rest = source.slice(match.index + match[0].length).split('\n')[0]
    const literalUnion = rest.match(/^\s*=\s*((?:'[^']*'|"[^"]*")(?:\s*\|\s*(?:'[^']*'|"[^"]*"))*)\s*;?$/)
    const entry = {
      source: `packages/sdk-frontend/${file}#L${line}`,
      ...(literalUnion ? { values: literalUnion[1] } : {}),
    }
    types.set(match[1], [...(types.get(match[1]) ?? []), entry])
  }
}

const sourceUrl = (path: string): string => `https://github.com/MorscherLab/MINT/blob/v${version}/${path}`
const inlineCode = (value: string): string => {
  const flat = value.split('\n').map(line => line.trim()).join(' ')
  const fence = '`'.repeat(Math.max(0, ...(flat.match(/`+/g) ?? []).map(run => run.length)) + 1)
  return `${fence} ${flat.replaceAll('|', '\\|')} ${fence}`
}
const description = (value: string): string => value
  .replace('Keep this comment on one line — the docs extractor drops multi-line JSDoc.', '')
  .replace(/`([^`]+)`/g, '$1')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('|', '\\|').split('\n').map(line => line.trim()).join(' ').trim() || '—'

for (const [name, component] of Object.entries(results)) {
  const path = resolve(docsRoot, 'sdk/components', `${componentSlug(name)}.md`)
  let content = readFileSync(path, 'utf8')
  assert(content.startsWith('---\n'), `Missing frontmatter: ${path}`)
  if (!/^aside:/m.test(content.split('---')[1])) content = content.replace('---\n', '---\naside: false\n')
  const definitions = new Set([component.source, ...component.props.map(prop => prop.source)])
  const links = [...definitions].map((source, index) => `[${index ? 'Shared props definition' : 'Component source'}](${sourceUrl(source)})`).join(' · ')
  const localSource = readFileSync(resolve(sdkRoot, component.source.replace('packages/sdk-frontend/', '')), 'utf8')
  const localTypes = new Map([...localSource.matchAll(/^(?:export\s+)?(?:type|interface)\s+(\w+)\b/gm)]
    .map(match => [match[1], { source: `${component.source}#L${localSource.slice(0, match.index).split('\n').length}` }]))
  const typeDefinition = (type: string): { source: string; values?: string } | undefined =>
    localTypes.get(type) ?? (types.get(type)?.length === 1 ? types.get(type)![0] : undefined)
  const lines = [
    '<!-- sdk-props:start -->',
    '## Props',
    '',
    `MINT SDK **${version}**. ${links}.`,
    '',
  ]
  if (component.props.length) {
    lines.push('| Prop | Type | Required | Default | Description |', '|---|---|---|---|---|')
    for (const prop of component.props) {
      const defaultValue = prop.default === undefined && prop.required ? '—' : inlineCode(prop.default ?? 'undefined')
      lines.push(`| ${inlineCode(prop.name)} | ${inlineCode(prop.type)} | ${prop.required ? 'Yes' : 'No'} | ${defaultValue} | ${description(prop.description)} |`)
    }
    lines.push('', 'Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.', '')
    const referencedTypes = [...new Set(component.props.flatMap(prop => prop.type.match(/\b[A-Z]\w+\b/g) ?? []))]
      .filter(type => typeDefinition(type))
    if (referencedTypes.length) {
      lines.push('### Related types', '', '| Type | Definition / accepted values |', '|---|---|')
      for (const type of referencedTypes) {
        const definition = typeDefinition(type)!
        lines.push(`| [${inlineCode(type)}](${sourceUrl(definition.source)}) | ${definition.values ? inlineCode(definition.values) : 'See the linked SDK type definition.'} |`)
      }
      lines.push('')
    }
  } else {
    lines.push('This component declares no public props. Its behavior is controlled through SDK state and composables.', '')
  }
  // An empty payload ([] from the checker) or slot props ({} or any) has no row text.
  const memberType = (type: string): string => ['', '{}', 'any'].includes(type.trim()) ? '—' : inlineCode(type)
  lines.push('### Events', '')
  if (component.events.length) {
    lines.push('| Event | Payload | Description |', '|---|---|---|')
    for (const event of component.events) lines.push(`| ${inlineCode(event.name)} | ${memberType(event.type)} | ${description(event.description)} |`)
  } else lines.push('This component emits no events.')
  lines.push('', '### Slots', '')
  if (component.slots.length) {
    lines.push('| Slot | Props | Description |', '|---|---|---|')
    for (const slot of component.slots) lines.push(`| ${inlineCode(slot.name)} | ${memberType(slot.type)} | ${description(slot.description)} |`)
  } else lines.push('This component declares no slots.')
  lines.push('', '<!-- sdk-props:end -->')
  const block = lines.join('\n')
  if (content.includes('<!-- sdk-props:start -->')) {
    content = content.replace(/<!-- sdk-props:start -->[\s\S]*?<!-- sdk-props:end -->/, () => block)
  } else if (content.includes('\n## Props\n')) {
    // Replace existing summary tables, preserving their hand-written behavior notes.
    content = content.replace(/\n## Props\n\n(?:\|[^\n]*\n)+/, () => `\n${block}\n`)
  } else if (/\n## Usage Notes\n\nThis component page/.test(content)) {
    content = content.replace(/\n## Usage Notes\n\nThis component page[^\n]*\n/, () => `\n${block}\n`)
  } else {
    const anchor = content.includes('\n## Related\n') ? '\n## Related\n' : '\n[Back to component library]'
    assert(content.includes(anchor), `Missing insertion point: ${path}`)
    content = content.replace(anchor, () => `\n${block}\n${anchor}`)
  }
  content = content.replace(/\/MINT\/blob\/(?:main|v[^/]+)\/packages\/sdk-frontend\//g,
    `/MINT/blob/v${version}/packages/sdk-frontend/`)
  if (!content.includes('href="#props"')) {
    content = content.replace('<div class="mint-component-reference__actions">',
      '<div class="mint-component-reference__actions">\n  <a class="mint-showcase-button" href="#props">Props</a>')
  }
  content = content.replace('\nFor prop-level detail, open the source file.\n', '')
  assert.equal((content.match(/^## Props$/gm) ?? []).length, 1, `Duplicate props section: ${name}`)
  assert(!content.includes('For prop-level detail, open the source file.'), `Stale placeholder: ${name}`)
  writeFileSync(path, content)
}
console.log(`Updated ${componentDocs.length} component pages for SDK ${version}.`)
