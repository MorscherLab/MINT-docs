<script setup lang="ts">
// Animated terminal in the termynal style. A line that starts with "$ " is a command and is typed;
// "[progress]" draws a progress bar; any other line is output. "[ok]" at the start shows in teal.
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ lines: string[]; title?: string }>(), { title: 'zsh' })

type Shown = { kind: 'input' | 'output' | 'progress'; text: string; typing?: boolean }
const shown = ref<Shown[]>([])
const done = ref(false)
const copied = ref('')
const root = ref<HTMLElement>()
let run = 0
let observer: IntersectionObserver | undefined

const commands = () => props.lines.filter(l => l.startsWith('$ ')).map(l => l.slice(2))
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const bar = (p: number) => '█'.repeat(p) + '░'.repeat(30 - p) + ` ${Math.round((p / 30) * 100)}%`
const kindOf = (l: string): Shown['kind'] => (l.startsWith('$ ') ? 'input' : l === '[progress]' ? 'progress' : 'output')

function showAll() {
  shown.value = props.lines.map(l => ({ kind: kindOf(l), text: kindOf(l) === 'input' ? l.slice(2) : kindOf(l) === 'progress' ? bar(30) : l }))
  done.value = true
}

async function play() {
  const id = ++run
  shown.value = []
  done.value = false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return showAll()
  for (const line of props.lines) {
    const kind = kindOf(line)
    if (kind === 'input') {
      await sleep(500)
      const row: Shown = { kind, text: '', typing: true }
      shown.value.push(row)
      const target = shown.value[shown.value.length - 1]
      for (const ch of line.slice(2)) {
        if (id !== run) return
        target.text += ch
        await sleep(35 + Math.random() * 35)
      }
      target.typing = false
    } else if (kind === 'progress') {
      shown.value.push({ kind, text: bar(0) })
      const target = shown.value[shown.value.length - 1]
      for (let p = 1; p <= 30; p++) {
        if (id !== run) return
        target.text = bar(p)
        await sleep(30)
      }
    } else {
      await sleep(90)
      if (id !== run) return
      shown.value.push({ kind, text: line })
    }
  }
  if (id === run) done.value = true
}

async function copy() {
  try {
    await navigator.clipboard.writeText(commands().join('\n'))
    copied.value = 'Copied'
  } catch {
    copied.value = 'Copy failed'
  }
  setTimeout(() => (copied.value = ''), 1500)
}

onMounted(() => {
  observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      observer?.disconnect()
      play()
    }
  }, { threshold: 0.3 })
  observer.observe(root.value!)
})
onBeforeUnmount(() => {
  run++
  observer?.disconnect()
})
</script>

<template>
  <div ref="root" class="mint-term">
    <div class="mint-term__bar">
      <span class="mint-term__dots" aria-hidden="true"><i /><i /><i /></span>
      <span class="mint-term__title">{{ title }}</span>
      <span class="mint-term__actions">
        <button type="button" @click="copy">{{ copied || 'Copy commands' }}</button>
        <button type="button" aria-label="Replay" @click="play">↻</button>
      </span>
    </div>
    <pre class="mint-term__body" :style="{ minHeight: `calc(${lines.length + 1} * 1.7em + 32px)` }" :aria-label="`Terminal: ${commands().join('; ')}`"><span
      v-for="(row, i) in shown" :key="i" class="mint-term__line" :class="[`is-${row.kind}`, { 'is-typing': row.typing }]"
    ><template v-if="row.kind === 'output' && row.text.trimStart().startsWith('[ok]')">{{ row.text.slice(0, row.text.indexOf('[ok]')) }}<span class="is-ok">[ok]</span>{{ row.text.slice(row.text.indexOf('[ok]') + 4) }}</template><template v-else>{{ row.text }}</template></span><span
      v-if="done" class="mint-term__line is-input is-typing"
    /></pre>
  </div>
</template>

<style scoped>
.mint-term {
  margin: 16px 0;
  border: 1px solid #1F2937;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-code-block-bg);
}
.mint-term__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #0F172A;
  border-bottom: 1px solid #1F2937;
}
.mint-term__dots { display: flex; gap: 6px; }
.mint-term__dots i { width: 11px; height: 11px; border-radius: 50%; }
.mint-term__dots i:nth-child(1) { background: #F87171; }
.mint-term__dots i:nth-child(2) { background: #FCD34D; }
.mint-term__dots i:nth-child(3) { background: #34D399; }
.mint-term__title {
  flex: 1;
  text-align: center;
  font: 500 12px/1 var(--vp-font-family-mono);
  color: #64748B;
}
.mint-term__actions { display: flex; gap: 6px; }
.mint-term__actions button {
  padding: 4px 8px;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  background: var(--vp-code-copy-code-bg);
  color: var(--vp-code-copy-code-active-text);
  font: 500 12px/1.2 var(--vp-font-family-mono);
  cursor: pointer;
}
.mint-term__actions button:hover {
  border-color: var(--vp-code-copy-code-hover-border-color);
  background: var(--vp-code-copy-code-hover-bg);
}
.mint-term__body {
  margin: 0;
  padding: 16px 20px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: transparent;
  color: var(--vp-code-block-color);
  font: 400 14px/1.7 var(--vp-font-family-mono);
}
.mint-term__line { display: block; min-height: 1.7em; }
.mint-term__line.is-input::before { content: '$ '; color: #2DD4BF; }
.mint-term__line.is-progress, .is-ok { color: #2DD4BF; }
.mint-term__line.is-typing::after {
  content: '▋';
  color: #2DD4BF;
  animation: mint-term-blink 1s steps(1) infinite;
}
@keyframes mint-term-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .mint-term__line.is-typing::after { animation: none; }
}
</style>
