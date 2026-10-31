<script setup lang="ts">
import { ref } from 'vue'
import {
  LayoutResizeHandle,
  useManualLayoutResize,
  resizedLeadingPanelWidth,
} from '@morscherlab/mint-sdk/shell'

const resizeContainer = ref<HTMLElement | null>(null)
const panelWidth = ref(260)
const { startResize } = useManualLayoutResize<'controls'>({
  enabled: true,
  resolveTarget: () => ({
    getContainerElement: () => resizeContainer.value,
    getStartValue: () => panelWidth.value,
    onResize: ({ startValue, deltaX, containerRect }) => {
      panelWidth.value = resizedLeadingPanelWidth(startValue, deltaX, containerRect.width, {
        minWidth: 200, maxWidth: 400,
      })
    },
  }),
})
</script>

<template>
  <div ref="resizeContainer" class="mint-resize-demo" :style="{ gridTemplateColumns: `${panelWidth}px 8px minmax(0, 1fr)` }">
    <aside>Controls · {{ panelWidth }} px</aside>
    <LayoutResizeHandle v-model="panelWidth" :min="200" :max="400" orientation="vertical" label="Resize controls panel" @resize-start="startResize('controls', $event)" />
    <section>Analysis results</section>
  </div>
</template>
