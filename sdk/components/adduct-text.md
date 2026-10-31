---
aside: false
title: AdductText
description: "Compact, overflow-safe mass-spectrometry adduct notation."
---

<p class="mint-component-library__eyebrow">Data display</p>

# AdductText

`AdductText` displays a supplied mass-spectrometry adduct with consistent typography and optional badge styling. The full trimmed value is available as the element's title when compact layouts truncate the text.

<demo vue="./demos/AdductText.vue" title="AdductText" description="Three adduct labels in plain, badge and muted styles. Compare how each variant and tone looks." />

## Example

```vue
<script setup lang="ts">
import { AdductText } from '@morscherlab/mint-sdk'
</script>

<template>
  <AdductText value="[M+H]+" />
  <AdductText value="[M+Na]+" variant="badge" />
  <AdductText value="[M-H]-" tone="muted" font="sans" size="inherit" />
  <AdductText :value="null" empty-text="Not assigned" />
</template>
```

The defaults are `variant="inline"`, `tone="default"`, `size="xs"`, and `font="mono"`. Use `tone="on-primary"` on an appropriate primary-colored surface. Null, empty, and whitespace-only values use `emptyText` (default `-`).

This is a text display component, not an adduct parser or m/z calculator. Pair it with [ChemicalFormula](/sdk/components/chemical-formula), or use that component's `adduct` prop to show formula and ion notation together.

[Release source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AdductText.vue)

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AdductText.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` value ` | ` string \| null ` | No | ` null ` | — |
| ` emptyText ` | ` string ` | No | ` "-" ` | — |
| ` variant ` | ` 'inline' \| 'badge' ` | No | ` "inline" ` | — |
| ` tone ` | ` 'default' \| 'on-primary' \| 'muted' ` | No | ` "default" ` | — |
| ` size ` | ` 'xs' \| 'inherit' ` | No | ` "xs" ` | — |
| ` font ` | ` 'mono' \| 'sans' ` | No | ` "sans" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
