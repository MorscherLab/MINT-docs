---
aside: false
title: BaseTabs
description: "BaseTabs is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseTabs

BaseTabs is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseTabs.vue">Source</a>
</div>

<demo vue="./demos/BaseTabs.vue" title="BaseTabs" description="Underline tabs with a count badge. Click a tab to change the model value." />

## Import

```ts
import { BaseTabs } from "@morscherlab/mint-sdk"
```

## Changes in 1.2.1

BaseTabs now renders underline tabs only, with count badges. The `variant` prop
is removed, including `variant="pills"`. Use [SegmentedControl](/sdk/components/segmented-control)
with `variant="card"` for a pill-style choice control.

```vue
<BaseTabs v-model="activeTab" :options="tabs" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseTabs.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` OptionPrimitive ` | Yes | — | — |
| ` options ` | ` SelectOptionInput[] ` | Yes | — | Tabs; icon takes SVG path data, badge a count shown after the label. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` OptionPrimitive `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L98) | See the linked SDK type definition. |
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L117) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: OptionPrimitive ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
