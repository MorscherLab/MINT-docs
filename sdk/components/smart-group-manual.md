---
aside: false
title: SmartGroupManual
description: "Manual cohort builder for assigning samples when names cannot be parsed automatically."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupManual

`SmartGroupManual` is the manual Smart Group mode for sample names that do not parse cleanly. Users search, filter, select, and assign samples into group, subgroup, and sub-subgroup levels.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupManual.vue">Source</a>
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

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupManual.vue) · [Shared props definition](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` sampleNames ` | ` string[] ` | No | ` () => DEFAULT_NAMES ` | Flat list of sample names to group. |
| ` seed ` | ` Record<string, SmartGroupSeed> ` | No | ` () => DEFAULT_SEED ` | Initial assignments keyed by sample name. |
| ` palette ` | ` ManualPaletteEntry[] ` | No | ` () => DEFAULT_PALETTE ` | Colour swatches offered in the assignment bar. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SmartGroupSeed `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts#L25) | See the linked SDK type definition. |
| [` ManualPaletteEntry `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts#L17) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [SmartGroupModal](/sdk/components/smart-group-modal)
- [SmartGroupFieldRecipe](/sdk/components/smart-group-field-recipe)

[Back to component library](/sdk/components/)
