// Run: bun scripts/update-component-props.ts /path/to/MINT/packages/sdk-frontend
// Use a clean checkout of the release matching the installed frontend SDK.
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { strict as assert } from 'node:assert'
import { parse, babelParse, walk, resolveTypeElements, inferRuntimeType } from '@vue/compiler-sfc'
import { componentDocs, componentSlug } from '../.vitepress/componentCatalog'
const sdkRoot = resolve(process.argv[2] ?? '')
assert(process.argv[2], 'Pass the released packages/sdk-frontend directory')
const docsRoot = resolve(import.meta.dir, '..')
const version = JSON.parse(readFileSync(`${sdkRoot}/package.json`, 'utf8')).version
const installed = JSON.parse(readFileSync(`${docsRoot}/node_modules/@morscherlab/mint-sdk/package.json`, 'utf8')).version
assert.equal(version, installed, 'Source and installed SDK versions must match')
const { parseComponentExports } = await import(`${sdkRoot}/scripts/extract-docs-components.ts`)
const exports = parseComponentExports(`${sdkRoot}/src/components/index.ts`)
interface Prop {
  name: string
  type: string
  required: boolean
  default?: string
  defaultKind?: string
  description: string
  source: string
}
interface Component { source: string; props: Prop[] }
const results: Record<string, Component> = {}
const cleanComment = (node: any): string => (node.leadingComments ?? [])
  .filter((comment: any) => comment.type === 'CommentBlock' && comment.value.startsWith('*'))
  .map((comment: any) => comment.value.replace(/^\s*\*\s?/gm, '').trim()).join('\n')

for (const component of componentDocs) {
  const exported = exports.find(entry => entry.name === component.name)
  assert(exported, `Missing public export: ${component.name}`)
  const filename = `${sdkRoot}/src/components/${exported.fileBase}.vue`
  const descriptor = parse(readFileSync(filename, 'utf8'), { filename }).descriptor
  const source = `${descriptor.script?.content ?? ''}\n${descriptor.scriptSetup?.content ?? ''}`
  const ast = babelParse(source, { sourceType: 'module', plugins: ['typescript'] }).program.body
  const context: any = {
    filename, source, ast,
    options: { fs: { fileExists: existsSync, readFile: (path: string) => readFileSync(path, 'utf8') } },
    error(message: string): never { throw new Error(`${component.name}: ${message}`) },
  }
  let propType: any
  let defaultsNode: any
  const models: any[] = []
  walk({ type: 'Program', body: ast } as any, {
    enter(node: any) {
      if (node.type !== 'CallExpression') return
      if (node.callee.name === 'defineProps') {
        assert(node.typeParameters?.params.length === 1 && !node.arguments.length, `Unsupported defineProps in ${component.name}`)
        propType = node.typeParameters.params[0]
      }
      if (node.callee.name === 'withDefaults') {
        assert(node.arguments[0].callee.name === 'defineProps', `Unsupported withDefaults in ${component.name}`)
        defaultsNode = node.arguments[1]
      }
      if (node.callee.name === 'defineModel') models.push(node)
    },
  })
  const defaults: Record<string, string> = {}
  if (defaultsNode) {
    assert(defaultsNode.type === 'ObjectExpression', `Nonliteral defaults in ${component.name}`)
    for (const property of defaultsNode.properties) {
      assert(property.type === 'ObjectProperty' && !property.computed, `Unsupported default in ${component.name}`)
      defaults[property.key.name ?? property.key.value] = source.slice(property.value.start, property.value.end)
    }
  }
  const props: Prop[] = propType ? Object.entries(resolveTypeElements(context, propType).props).map(([name, property]: any) => {
    const typeNode = property.typeAnnotation?.typeAnnotation
    assert(typeNode, `Missing type for ${component.name}.${name}`)
    const type = property._ownerScope.source.slice(typeNode.start, typeNode.end)
    assert(type.length, `Empty type for ${component.name}.${name}`)
    const explicitDefault = Object.hasOwn(defaults, name)
    const required = !property.optional
    const implicitBoolean = !required && !explicitDefault && inferRuntimeType(context, typeNode, property._ownerScope).includes('Boolean')
    return {
      name, type, required,
      ...(explicitDefault ? { default: defaults[name], defaultKind: 'explicit' } : implicitBoolean ? { default: 'false', defaultKind: 'implicit-boolean' } : {}),
      description: cleanComment(property),
      source: property._ownerScope.filename.replace(`${sdkRoot}/`, 'packages/sdk-frontend/'),
    }
  }) : []
  for (const name of Object.keys(defaults)) assert(props.some(prop => prop.name === name), `Default without prop: ${component.name}.${name}`)
  for (const model of models) {
    const named = model.arguments[0]?.type === 'StringLiteral'
    const name = named ? model.arguments[0].value : 'modelValue'
    const options = model.arguments[named ? 1 : 0]
    assert(!options || options.type === 'ObjectExpression', `Unsupported model options in ${component.name}`)
    const fields = Object.fromEntries((options?.properties ?? []).map((p: any) => {
      assert(p.type === 'ObjectProperty' && !p.computed, `Unsupported model option in ${component.name}`)
      return [p.key.name ?? p.key.value, p.value]
    }))
    const typeNode = model.typeParameters?.params[0]
    assert(typeNode, `Untyped defineModel in ${component.name}`)
    const defaultNode: any = fields.default
    const required = (fields.required as any)?.value === true
    const implicitBoolean = !required && !defaultNode && inferRuntimeType(context, typeNode).includes('Boolean')
    assert(!props.some(prop => prop.name === name), `Duplicate model prop in ${component.name}`)
    props.push({
      name, type: source.slice(typeNode.start, typeNode.end), required,
      ...(defaultNode ? { default: source.slice(defaultNode.start, defaultNode.end), defaultKind: 'explicit' } : implicitBoolean ? { default: 'false', defaultKind: 'implicit-boolean' } : {}),
      description: `Two-way value for v-model${name === 'modelValue' ? '' : `:${name}`}. Emits update:${name}.`,
      source: filename.replace(`${sdkRoot}/`, 'packages/sdk-frontend/'),
    })
  }
  results[component.name] = { source: filename.replace(`${sdkRoot}/`, 'packages/sdk-frontend/'), props }
}

const get = (name: string): any[] => (results[name] as any).props
assert.equal(Object.keys(results).length, componentDocs.length)
assert.equal(get('BaseButton').length, 6)
assert.equal(get('DataFrame').length, 24)
assert.equal(get('DataFrame').find(p => p.name === 'maxHeight').type, 'string | number')
assert.equal(get('DataFrame').find(p => p.name === 'rowKey').type, 'string | ((row: Record<string, unknown>) => string | number)')
assert.match(get('DataFrame').find(p => p.name === 'size').description, /tableDensity/)
assert.equal(get('FormBuilder').length, 11)
assert.equal(get('SmartGroupFieldRecipe').length, 16)
assert(get('SmartGroupManual').length > 0)
assert.equal(get('SmartGroupModal').length, 3)
assert.equal(get('SmartGroupModal').find(p => p.name === 'mode').default, "'auto'")
assert(Object.values(results).some((entry: any) => entry.props.some((prop: any) => prop.defaultKind === 'implicit-boolean')))
assert.equal(get('AppToastContainer').length, 0)
assert.equal(get('SampleLegend').find(p => p.name === 'samples').required, true)
assert.equal(get('SampleLegend').find(p => p.name === 'samples').default, '() => []')

console.log(`Extracted ${componentDocs.length} components, ${Object.values(results).reduce((sum: number, entry: any) => sum + entry.props.length, 0)} props; regression assertions passed.`)

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
    lines.push('', 'Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.', '')
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
  lines.push('<!-- sdk-props:end -->')
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
  content = content.replaceAll('/MINT/blob/main/packages/sdk-frontend/', `/MINT/blob/v${version}/packages/sdk-frontend/`)
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
