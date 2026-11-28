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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SectionCard.vue">Source</a>
</div>

<demo vue="./demos/SectionCard.vue" title="SectionCard" description="A card with a header, run count and action button. Use it to group one page region." />

## Import

```ts
import { SectionCard } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<SectionCard title="QC summary" count="42 total" accent="primary">
  <template #actions>
    <BaseButton size="sm" variant="ghost">Export</BaseButton>
  </template>
  <DataFrame :spec="table" :data="rows" />
</SectionCard>
```

## Content in a card

Content components have no border, radius or background of their own. The card draws the frame. Put a content component straight into a `SectionCard`; a component placed straight on a page has no frame.

```vue
<SectionCard title="Plate layout">
  <PlateEditor v-model:active-rack="activeId" :spec="plateSpec" :model-value="racks" />
</SectionCard>
```

Content tells the card how it sits with the `data-mint-bleed` attribute on its root element. The card reads only this attribute.

| `data-mint-bleed` | Components | In the card |
|-------------------|------------|-------------|
| `inset` | `FormBuilder`, `ProgressBar`, `SequenceProgressBar`, `BatchProgressList`, `AuditTrail`, `Calendar` | Keeps the text inset of the card |
| `edge` | `DataFrame`, `MetadataSheet`, `ChartContainer` (and `PlotlyChart`), `PlateEditor`, `SampleSelector`, `ScheduleCalendar`, `DoseCalculator`, `ProtocolStepEditor` | Runs to the edges of the card |
| `strip` | `AlertBox`, `EmptyState variant="inline"` | A full-width band whose text starts on the card inset. `--mint-strip-bg` tints it |

Edge and strip content get one hairline where other content sits next to them. In a card with `fill`, each `edge` child gets the height that is left and never shrinks below its content (the card body scrolls). `MetadataSheet` shrinks to the height that is left and scrolls its own rows.

Your own component can opt in: set `data-mint-bleed="inset"`, `"edge"` or `"strip"` on its root element. Do not put a card in a card: the `mint lint` rule `nested-card` reports it.

## Collapsible card

Set `collapsible` to make the title a disclosure button with a chevron. Bind `v-model:collapsed` to hold or read the state. A collapsed card hides its toolbar, body and footer. The header stays, so the user can open the card again. A collapsible card does not show `count`.

```vue
<SectionCard title="History" collapsible v-model:collapsed="historyCollapsed">
  <DataFrame :spec="historySpec" :data="history" />
</SectionCard>
```

## Text inset

The header, the rows and the footer start on one text inset, `--mint-section-card-inset` (0.75rem; 0.875rem at comfortable density). The first and last text columns of a `DataFrame` that is a direct child of the card body use it too. Titles, table columns and row text line up.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SectionCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | Yes | — | — |
| ` count ` | ` string \| number ` | No | ` undefined ` | Monospace meta shown next to the title, e.g. "14 ongoing · 42 total". |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | SVG path(s) for the 22px icon chip; omit to render no chip. |
| ` accent ` | ` SectionCardAccent ` | No | ` "primary" ` | Tint of the icon chip. |
| ` uppercase ` | ` boolean ` | No | ` false ` | Uppercase category heading (home cards) vs plain heading (detail cards). |
| ` divider ` | ` SectionCardDivider ` | No | ` "strong" ` | Header hairline: 'strong' = --border-color, 'light' = --border-light. |
| ` fill ` | ` boolean ` | No | ` false ` | Stretch to fill the height its parent offers, scrolling the body and pinning the header and footer. Requires a parent that gives the card a definite height (a flex or grid track). |
| ` collapsible ` | ` boolean ` | No | ` false ` | The title toggles the body; bind v-model:collapsed to control or keep the state. |
| ` collapsed ` | ` boolean \| undefined ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SectionCardAccent `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L130) | ` 'primary' \| 'experiment' \| 'project' \| 'success' \| 'error' \| 'warning' \| 'info' ` |
| [` SectionCardDivider `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L132) | ` 'strong' \| 'light' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:collapsed ` | ` value: boolean ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` actions ` | — | — |
| ` toolbar ` | — | — |
| ` default ` | — | — |
| ` footer ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
