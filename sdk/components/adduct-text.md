---
aside: false
title: AdductText
description: "Compact, overflow-safe mass-spectrometry adduct notation."
---

<p class="mint-component-library__eyebrow">Data display</p>

# AdductText

Use `AdductText` to show a mass-spectrometry adduct, such as `[M+H]+`, as text or as a badge. When the layout cuts the text, the element title holds the full value.

<demo vue="./demos/AdductText.vue" title="AdductText" description="Three adduct labels in plain, badge and muted styles. Compare how each variant and tone looks." />

## Example

```vue
<script setup lang="ts">
import { AdductText } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <AdductText value="[M+H]+" />
  <AdductText value="[M+Na]+" variant="badge" />
  <AdductText value="[M-H]-" tone="muted" font="sans" size="inherit" />
  <AdductText :value="null" empty-text="Not assigned" />
</template>
```

- The defaults are `variant="inline"`, `tone="default"`, `size="xs"` and `font="mono"`.
- Use `tone="on-primary"` on a primary-colored surface.
- A null, empty or whitespace-only value shows `emptyText` (default `-`).

The component only shows text. It does not parse an adduct or calculate an m/z. To show a formula and its adduct together, use the `adduct` prop of [ChemicalFormula](/sdk/components/chemical-formula).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AdductText.vue).

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
