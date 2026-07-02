---
title: SmartGroupManual
description: "Manual cohort builder for assigning samples when names cannot be parsed automatically."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupManual

`SmartGroupManual` is the manual Smart Group mode for sample names that do not parse cleanly. Users search, filter, select, and assign samples into group, subgroup, and sub-subgroup levels.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/SmartGroupManual.vue">Source</a>
</div>

<ComponentPlayground name="SmartGroupManual" />

## Import

```ts
import { SmartGroupManual } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<SmartGroupManual
  :sample-names="sampleNames"
  :seed="existingAssignments"
  @done="saveAssignments"
  @auto="mode = 'auto'"
/>
```

Use this when automatic parsing is not reliable enough and the user should build cohorts by hand. The `done` event returns the updated sample assignments.

## Related

- [SmartGroupModal](/sdk/components/smart-group-modal)
- [SmartGroupFieldRecipe](/sdk/components/smart-group-field-recipe)

[Back to component library](/sdk/components/)
