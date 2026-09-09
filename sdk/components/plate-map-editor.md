---
aside: false
title: PlateMapEditor
description: "PlateMapEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# PlateMapEditor

PlateMapEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/PlateMapEditor.vue">Source</a>
</div>

<ComponentPlayground name="PlateMapEditor" />

## Import

```ts
import { PlateMapEditor } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/PlateMapEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` PlateMapEditorState ` | No | ` undefined ` | — |
| ` format ` | ` WellPlateFormat ` | No | ` 96 ` | — |
| ` maxPlates ` | ` number ` | No | ` 10 ` | — |
| ` samples ` | ` SampleType[] ` | No | ` () => [] ` | — |
| ` showToolbar ` | ` boolean ` | No | ` true ` | — |
| ` showSidebar ` | ` boolean ` | No | ` true ` | — |
| ` allowAddPlates ` | ` boolean ` | No | ` true ` | — |
| ` allowAddSamples ` | ` boolean ` | No | ` true ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'fill' ` | No | ` 'md' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PlateMapEditorState `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L138) | See the linked SDK type definition. |
| [` WellPlateFormat `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L2) | See the linked SDK type definition. |
| [` SampleType `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L122) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
