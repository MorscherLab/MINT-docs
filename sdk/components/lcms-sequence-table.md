---
aside: false
title: LcmsSequenceTable
description: "LcmsSequenceTable is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# LcmsSequenceTable

LcmsSequenceTable is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/LcmsSequenceTable.vue">Source</a>
</div>

<ComponentPlayground name="LcmsSequenceTable" />

## Import

```ts
import { LcmsSequenceTable } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/LcmsSequenceTable.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` items ` | ` LcmsSequenceItem[] ` | No | ` () => [] ` | — |
| ` columns ` | ` LcmsSequenceTableColumn[] ` | No | ` () => DEFAULT_LCMS_SEQUENCE_COLUMNS ` | — |
| ` editable ` | ` boolean ` | No | ` false ` | — |
| ` maxRows ` | ` number ` | No | ` undefined ` | — |
| ` showMoreLabel ` | ` boolean ` | No | ` true ` | — |
| ` emptyMessage ` | ` string ` | No | ` 'No sequence items to display' ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the table with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the table is replaced by an error state. null/undefined renders normally. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` LcmsSequenceItem `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/lcms.ts#L6) | See the linked SDK type definition. |
| [` LcmsSequenceTableColumn `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/lcms.ts#L16) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
