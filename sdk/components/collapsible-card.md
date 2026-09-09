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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/CollapsibleCard.vue">Source</a>
</div>

<ComponentPlayground name="CollapsibleCard" />

## Import

```ts
import { CollapsibleCard } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/CollapsibleCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | Yes | — | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` badge ` | ` string \| number ` | No | ` undefined ` | — |
| ` badgeTone ` | ` SidebarBadgeTone ` | No | ` 'cta' ` | — |
| ` defaultOpen ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` dense ` | ` boolean ` | No | ` false ` | — |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | — |
| ` iconColor ` | ` string ` | No | ` undefined ` | — |
| ` iconBg ` | ` string ` | No | ` undefined ` | — |
| ` actions ` | ` SidebarToolSectionAction[] ` | No | ` () => [] ` | — |
| ` showToggle ` | ` boolean ` | No | ` false ` | — |
| ` toggleValue ` | ` boolean ` | No | ` false ` | — |
| ` toggleColor ` | ` string ` | No | ` '' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SidebarBadgeTone `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L141) | See the linked SDK type definition. |
| [` SidebarToolSectionAction `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L150) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
