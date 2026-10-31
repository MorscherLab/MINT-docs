---
aside: false
title: CollapsibleCard
description: "CollapsibleCard is a layout component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Layout</p>

# CollapsibleCard

CollapsibleCard is a layout component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/CollapsibleCard.vue">Source</a>
</div>

<demo vue="./demos/CollapsibleCard.vue" title="CollapsibleCard" description="Collapsible card with a header toggle. Click the header to fold the card, or switch the toggle." />

## Import

```ts
import { CollapsibleCard } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/CollapsibleCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | Yes | — | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` badge ` | ` string \| number ` | No | ` undefined ` | — |
| ` badgeTone ` | ` Tone ` | No | ` "cta" ` | — |
| ` defaultOpen ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` dense ` | ` boolean ` | No | ` false ` | — |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | — |
| ` iconColor ` | ` string ` | No | ` undefined ` | — |
| ` iconBg ` | ` string ` | No | ` undefined ` | — |
| ` actions ` | ` SidebarToolSectionAction[] ` | No | ` [] ` | — |
| ` showToggle ` | ` boolean ` | No | ` false ` | — |
| ` toggleValue ` | ` boolean ` | No | ` false ` | — |
| ` toggleColor ` | ` string ` | No | ` "" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |
| [` SidebarToolSectionAction `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L140) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:toggleValue ` | ` value: boolean ` | — |
| ` action ` | ` actionId: string ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
