---
aside: false
title: RackEditor
description: "RackEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# RackEditor

RackEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/RackEditor.vue">Source</a>
</div>

<ComponentPlayground name="RackEditor" />

## Import

```ts
import { RackEditor } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/RackEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Rack[] ` | No | ` undefined ` | — |
| ` activeRackId ` | ` string ` | No | ` undefined ` | — |
| ` maxRacks ` | ` number ` | No | ` 10 ` | — |
| ` minRacks ` | ` number ` | No | ` 1 ` | — |
| ` allowReorder ` | ` boolean ` | No | ` true ` | — |
| ` editable ` | ` boolean ` | No | ` true ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` wellPlateSize ` | ` WellPlateSize ` | No | ` 'md' ` | — |
| ` showLegend ` | ` boolean ` | No | ` true ` | — |
| ` showBadges ` | ` boolean ` | No | ` true ` | — |
| ` allowSampleDrop ` | ` boolean ` | No | ` false ` | — |
| ` sampleDropMapper ` | ` RackSampleDropMapper ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Rack `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L100) | See the linked SDK type definition. |
| [` WellPlateSize `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L5) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'fill' ` |
| [` RackSampleDropMapper `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L116) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
