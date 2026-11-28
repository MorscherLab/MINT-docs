---
aside: false
title: PanelSections
description: "Draws the sections of a plugin panel: key/value, table, text, JSON, bar, link, status and plate."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PanelSections

Use `PanelSections` on a plugin page to draw panel sections: key/value, table, text, JSON, bar, link, status and plate.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PanelSections.vue">Source</a>
</div>

<demo vue="./demos/PanelSections.vue" title="PanelSections" description="Five section kinds in the six-column grid. Click the plugin link to see the navigate event." />

## Import

```ts
import { PanelSections } from "@morscherlab/mint-sdk/lab"
import type { PanelSection } from "@morscherlab/mint-sdk"
```

## When to use it

The platform draws the panels that a plugin declares with `@panel` on the experiment page; see [Plugin panels](/sdk/recipes/panels). Use `PanelSections` only on your own plugin page, for example to show the answer of a panel or an instrument status report. [InstrumentStatusPanels](/sdk/components/instrument-status-panels) uses it for each panel.

## Basic Usage

```vue
<PanelSections :sections="answer.sections" @navigate="routeInApp" />
```

## Section kinds

| `kind` | Draws |
|--------|-------|
| `kv` | A key/value list |
| `table` | A table. It shows 20 rows, then "Show all N rows". It sorts all rows before it cuts. `column_types` sets each column to `text`, `number` or `mono`. A column without an entry is `number` when all values are numbers or null, else `text` |
| `text` | Plain text |
| `json` | A collapsed JSON tree |
| `bar` | A bar chart with [PlotlyChart](/sdk/components/plotly-chart). It shows one series at a time |
| `link` | A link. An external link opens in a new tab and shows its host. A link under `/plugin/` emits `navigate` |
| `status` | An [AlertBox](/sdk/components/alert-box) with the state tone. Only `warning` and `error` are announced as alerts |
| `plate` | A read-only [WellPlate](/sdk/components/well-plate). `format` is `54` (a 54-vial rack, A1 to F9), `96` or `384`. Groups take `--mint-sample-1` to `--mint-sample-9` in declaration order. A `blank` group has a dashed outline and a `qc` group a "Q" marker. `color_by: "value"` uses the heat scale, and `highlight` rings wells |

A section of a kind that this SDK does not know shows "This section needs a newer MINT version". The other sections show as usual.

## Layout

- Sections fill rows of six columns, in order. `width` sets the share of a row: `full` (default) 6 columns, `two-thirds` 4, `half` 3 and `third` 2.
- A section that does not fit in the current row starts the next row.
- When the component is narrower than 53rem, each section takes the full width.
- Each section has the class `mint-panel-sections__section--<width>`.

## Links in the app

A click on a `/plugin/` link without a modifier key emits `navigate` with the `href` and the mouse event. Call `event.preventDefault()` and route the link in your app. Otherwise the browser follows the link.

::: info Charts need Plotly
A `bar` section renders `PlotlyChart`, so the plugin must declare `plotly.js-dist-min`; see [Charts need Plotly](/sdk/frontend/#charts-need-plotly). The demo above has no `bar` section.
:::

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PanelSections.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` sections ` | ` readonly (PanelSection \| UnknownPanelSection)[] ` | Yes | — | — |
| ` titles ` | ` boolean ` | No | ` true ` | Draw each section's title above it; off when a tab already names the only section. |
| ` emptyText ` | ` string ` | No | ` "Nothing to show" ` | Text when there are no sections. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PanelSection `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/instrument.ts#L126) | See the linked SDK type definition. |
| [` UnknownPanelSection `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/instrument.ts#L129) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` navigate ` | ` href: string, event: MouseEvent ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
