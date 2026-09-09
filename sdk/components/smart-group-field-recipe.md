---
aside: false
title: SmartGroupFieldRecipe
description: "Auto grouping view that turns parsed sample-name fields into group recipes."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupFieldRecipe

`SmartGroupFieldRecipe` renders the automatic side of Smart Group: parsed sample fields, factor toggles, QC routing, upload/download actions, and a live group preview.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.vue">Source</a>
</div>

<ComponentPlayground name="SmartGroupFieldRecipe" />

## Import

```ts
import { SmartGroupFieldRecipe } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<SmartGroupFieldRecipe
  :samples="samples"
  :fields="fields"
  experiment-label="EXP-014"
  @toggle="toggleField"
  @update:route="route = $event"
  @csv-file="parseMetadataFile"
  @apply="applyGroups"
  @manual="mode = 'manual'"
/>
```

Use this component when a plugin already owns the outer modal shell and only needs the automatic grouping view. It emits the applied groups, active factors, QC route, sample total, CSV upload, and template-download actions.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.vue) · [Shared props definition](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` samples ` | ` SmartGroupSampleRecord[] ` | No | ` () => DEFAULT_SAMPLES ` | Sample records behind the experiment (one row per real sample). |
| ` fields ` | ` SmartGroupField[] ` | No | ` () => DEFAULT_FIELDS ` | Candidate grouping fields with role + value preview. |
| ` experimentLabel ` | ` string ` | No | ` 'EXP-014' ` | Experiment code shown in the header; omitted from the subtitle when empty. |
| ` headerCount ` | ` number ` | No | ` 12 ` | Sample count shown in the header (real + QC). |
| ` initialOn ` | ` boolean[] ` | No | ` undefined ` | Which fields start switched on; defaults to every non-replicate field. |
| ` initialRoute ` | ` QcRoute ` | No | ` 'Overlay only' ` | Initial QC routing. |
| ` palette ` | ` string[] ` | No | ` () => DEFAULT_PALETTE ` | Group colours, cycled in group order. |
| ` qcColor ` | ` string ` | No | ` 'var(--grp-qc)' ` | Colour used for the QC pool. |
| ` enabled ` | ` boolean[] ` | No | ` undefined ` | Controls the field toggles; when set, clicking a toggle emits toggle. |
| ` layers ` | ` (number \| null)[] ` | No | ` undefined ` | Per-card 1-based hierarchy layer (1 = the sample selector's major group), null for cards not grouped by. When set, reorder clicks emit move. |
| ` groups ` | ` FieldRecipeGroup[] ` | No | ` undefined ` | Pre-computed resulting groups; when set, the rail renders these directly. |
| ` qcChip ` | ` FieldRecipeQcChip \| null ` | No | ` undefined ` | QC summary chip to show in the rail; null hides it (e.g. when mixed). |
| ` route ` | ` QcRoute ` | No | ` undefined ` | Controlled QC routing; when set, changing the select emits update:route. |
| ` qcCount ` | ` number ` | No | ` undefined ` | QC sample count for the footer hint; defaults to headerCount - samples. |
| ` canDownloadTemplate ` | ` boolean ` | No | ` true ` | Whether the template-download menu items are enabled (default true). |
| ` loading ` | ` boolean ` | No | ` false ` | Show a loading state in the main body (e.g. while experiment data loads). |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SmartGroupSampleRecord `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.groups.ts#L22) | See the linked SDK type definition. |
| [` SmartGroupField `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.groups.ts#L10) | See the linked SDK type definition. |
| [` QcRoute `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.groups.ts#L32) | ` 'Overlay only' \| 'Exclude' \| 'Mix into groups' ` |
| [` FieldRecipeGroup `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.groups.ts#L25) | See the linked SDK type definition. |
| [` FieldRecipeQcChip `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts#L33) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [SmartGroupModal](/sdk/components/smart-group-modal)
- [SmartGroupManual](/sdk/components/smart-group-manual)

[Back to component library](/sdk/components/)
