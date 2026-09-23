---
aside: false
title: LayoutResizeHandle
description: "Accessible pointer and keyboard separator for resizable workbench panes."
---

<p class="mint-component-library__eyebrow">Layout</p>

# LayoutResizeHandle

`LayoutResizeHandle` provides a focusable separator with bounded keyboard updates and a `resize-start` pointer event. Pair it with `useManualLayoutResize()` for drag handling; the handle alone does not listen for pointer movement or size your panels.

<ComponentPlayground name="LayoutResizeHandle" />

## Pointer and keyboard example

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  LayoutResizeHandle,
  resizedLeadingPanelWidth,
  useManualLayoutResize,
} from '@morscherlab/mint-sdk'

const container = ref<HTMLElement | null>(null)
const width = ref(280)
const columns = computed(() => ({ gridTemplateColumns: `${width.value}px 8px minmax(0, 1fr)` }))
const { startResize } = useManualLayoutResize<'sidebar'>({
  enabled: true,
  resolveTarget: () => ({
    getContainerElement: () => container.value,
    getStartValue: () => width.value,
    onResize: ({ startValue, deltaX, containerRect }) => {
      width.value = resizedLeadingPanelWidth(startValue, deltaX, containerRect.width, {
        minWidth: 200,
        maxWidth: 400,
      })
    },
  }),
})
</script>

<template>
  <div ref="container" class="workbench" :style="columns">
    <aside>Controls · {{ width }} px</aside>
    <LayoutResizeHandle
      v-model="width"
      orientation="vertical"
      label="Resize controls panel"
      :min="200"
      :max="400"
      @resize-start="startResize('sidebar', $event)"
    />
    <section>Analysis results</section>
  </div>
</template>

<style scoped>
.workbench { display: grid; min-width: 600px; min-height: 16rem; }
.workbench > aside, .workbench > section { min-width: 0; padding: 1rem; }
</style>
```

`orientation="vertical"` means a vertical separator controlling width: Left/Right decrease/increase the value. For a horizontal separator use Up/Down. Home/End jump to `min`/`max`; `step` defaults to 10. Supply a meaningful `label` for the separator's accessible name.

`useManualLayoutResize()` captures starting geometry, coordinates pointer movement, and removes listeners on completion, cancellation, disable, or unmount. `resizedLeadingPanelWidth()` handles a left panel, `resizedTrailingPanelWidth()` reverses the drag direction for a right panel, and `resizedVerticalSplitPercent()` calculates a bounded vertical percentage. Keep the constraints used by keyboard and pointer paths consistent. The `edge` prop affects handle styling; it does not reverse your resize calculation.

The example has a minimum layout width. For narrow screens, switch to your application's stacked/overlay layout and disable resizing rather than making the content unusably narrow. Persist widths only if the plugin needs to remember them; the SDK does not save layout values automatically.

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/LayoutResizeHandle.vue) · [Resize composable](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/composables/useManualLayoutResize.ts)

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/LayoutResizeHandle.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number ` | Yes | — | — |
| ` min ` | ` number ` | Yes | — | — |
| ` max ` | ` number ` | Yes | — | — |
| ` label ` | ` string ` | Yes | — | — |
| ` orientation ` | ` 'vertical' \| 'horizontal' ` | Yes | — | — |
| ` edge ` | ` 'left' \| 'right' ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` 10 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
