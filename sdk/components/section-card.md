---
aside: false
title: SectionCard
description: "One-card page region from the MINT 1.1 card system: header strip, hairline-separated content, no card-in-card."
---

<p class="mint-component-library__eyebrow">Layout</p>

# SectionCard

One-card page region from the MINT 1.1 card system: header strip, hairline-separated content, no card-in-card.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/SectionCard.vue">Source</a>
</div>

<ComponentPlayground name="SectionCard" />

## Import

```ts
import { SectionCard } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<SectionCard title="QC summary" count="42 total" accent="primary">
  <template #actions>
    <BaseButton size="sm" variant="ghost">Export</BaseButton>
  </template>
  <DataFrame :columns="columns" :data="rows" row-key="id" />
</SectionCard>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/SectionCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | Yes | — | — |
| ` count ` | ` string \| number ` | No | ` undefined ` | Monospace meta shown next to the title, e.g. "14 ongoing · 42 total". |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | SVG path(s) for the 22px icon chip; omit to render no chip. |
| ` accent ` | ` SectionCardAccent ` | No | ` 'primary' ` | Tint of the icon chip. |
| ` uppercase ` | ` boolean ` | No | ` false ` | Uppercase category heading (home cards) vs plain heading (detail cards). |
| ` divider ` | ` SectionCardDivider ` | No | ` 'strong' ` | Header hairline: 'strong' = --border-color, 'light' = --border-light. |
| ` fill ` | ` boolean ` | No | ` false ` | Stretch to fill the height its parent offers, scrolling the body and pinning the header and footer. Requires a parent that gives the card a definite height (a flex or grid track). |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SectionCardAccent `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L143) | See the linked SDK type definition. |
| [` SectionCardDivider `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L152) | ` 'strong' \| 'light' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
