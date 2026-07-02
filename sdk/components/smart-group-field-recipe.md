---
title: SmartGroupFieldRecipe
description: "Auto grouping view that turns parsed sample-name fields into group recipes."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupFieldRecipe

`SmartGroupFieldRecipe` renders the automatic side of Smart Group: parsed sample fields, factor toggles, QC routing, upload/download actions, and a live group preview.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/SmartGroupFieldRecipe.vue">Source</a>
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

## Related

- [SmartGroupModal](/sdk/components/smart-group-modal)
- [SmartGroupManual](/sdk/components/smart-group-manual)

[Back to component library](/sdk/components/)
