---
aside: false
title: LayoutResizeHandle
description: "Accessible pointer and keyboard separator for resizable workbench panes."
---

<p class="mint-component-library__eyebrow">Layout</p>

# LayoutResizeHandle

Use `LayoutResizeHandle` as a focusable separator between two resizable panes. Pair it with `useManualLayoutResize()`: the handle does not track pointer movement or size your panels.

<demo vue="./demos/LayoutResizeHandle.vue" title="LayoutResizeHandle" description="Drag the handle to resize a side panel between 200 and 400 pixels." />

## Pointer and keyboard example

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  LayoutResizeHandle,
  resizedLeadingPanelWidth,
  useManualLayoutResize,
} from '@morscherlab/mint-sdk/shell'

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

- `orientation="vertical"` is a vertical separator that sets a width. Left and Right decrease and increase the value. A horizontal separator uses Up and Down.
- Home and End go to `min` and `max`. `step` defaults to 10.
- `label` is the accessible name of the separator. Make it say what it resizes.

`useManualLayoutResize()` records the start geometry, follows the pointer, and removes its listeners when the drag ends, is cancelled or disabled, or the component unmounts.

- `resizedLeadingPanelWidth()` sizes a left panel.
- `resizedTrailingPanelWidth()` sizes a right panel; it reverses the drag direction.
- `resizedVerticalSplitPercent()` gives a bounded percentage for a top and bottom split.

Use the same limits for the keyboard and the pointer. The `edge` prop changes only the style of the handle. It does not reverse your calculation.

The example has a minimum width. On a narrow screen, switch to a stacked or overlay layout and disable resizing. The SDK does not save the widths; store them yourself if the plugin must remember them.

[Resize composable source](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useManualLayoutResize.ts)

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/LayoutResizeHandle.vue).

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

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: number ` | — |
| ` resize-start ` | ` event: PointerEvent ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
