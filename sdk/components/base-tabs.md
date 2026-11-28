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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseTabs.vue">Source</a>
</div>

<demo vue="./demos/BaseTabs.vue" title="BaseTabs" description="Underline tabs with a count badge. Click a tab to change the model value." />

## Import

```ts
import { BaseTabs } from "@morscherlab/mint-sdk"
```

## Tabs

BaseTabs renders underline tabs, with count badges. There is no `variant` prop. Use [SegmentedControl](/sdk/components/segmented-control)
with `variant="card"` for a pill-style choice control.

```vue
<BaseTabs v-model="activeTab" :options="tabs" />
```

An option's `meta` shows as muted text after the label.

With `overflow="menu"`, the tabs that do not fit move into a trailing **More** menu. The selected tab stays in the bar. A long label is cut, and the label and meta show in `title`. A tab chosen from the menu gets the focus.

```vue
<BaseTabs v-model="activeTab" :options="runTabs" overflow="menu" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseTabs.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` OptionPrimitive ` | Yes | — | — |
| ` options ` | ` SelectOptionInput[] ` | Yes | — | Tabs; icon takes SVG path data, badge a count shown after the label, meta muted text after it. |
| ` overflow ` | ` 'none' \| 'menu' ` | No | ` "none" ` | menu moves the tabs that do not fit into a trailing "More" menu and cuts long labels, with the full label and meta on hover. The selected tab always stays in the bar. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` OptionPrimitive `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L99) | See the linked SDK type definition. |
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L118) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: OptionPrimitive ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
