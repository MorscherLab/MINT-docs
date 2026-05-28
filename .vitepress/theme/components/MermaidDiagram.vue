<script setup lang="ts">
import { computed } from 'vue'
import { renderMermaidSVG } from 'beautiful-mermaid'

const props = defineProps<{
  encoded: string
}>()

const source = computed(() => decodeURIComponent(props.encoded))

const diagram = computed(() => {
  try {
    return {
      error: '',
      svg: renderMermaidSVG(source.value, {
        bg: 'var(--vp-c-bg)',
        fg: 'var(--vp-c-text-1)',
        line: 'var(--vp-c-brand-2)',
        accent: 'var(--vp-c-brand-1)',
        muted: 'var(--vp-c-text-2)',
        surface: 'var(--vp-c-bg-soft)',
        border: 'var(--vp-c-divider)',
        font: 'Inter, ui-sans-serif, system-ui, sans-serif',
        padding: 28,
        transparent: true,
      }),
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      svg: '',
    }
  }
})
</script>

<template>
  <figure class="mint-mermaid">
    <div
      v-if="diagram.svg"
      class="mint-mermaid__svg"
      v-html="diagram.svg"
    />
    <pre v-else class="mint-mermaid__error"><code>{{ diagram.error }}

{{ source }}</code></pre>
  </figure>
</template>

<style scoped>
.mint-mermaid {
  margin: 1.25rem 0;
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.mint-mermaid__svg {
  min-width: min-content;
  padding: 1rem;
}

.mint-mermaid__svg :deep(svg) {
  display: block;
  width: max-content;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.mint-mermaid__error {
  margin: 0;
  padding: 1rem;
  color: var(--vp-c-danger-1);
  white-space: pre-wrap;
}
</style>
