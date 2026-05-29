---
title: WellPlate
description: "Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# WellPlate

Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/WellPlate.vue">Source</a>
</div>

<ComponentPlayground name="WellPlate" />

## Import

```ts
import { WellPlate } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<WellPlate
  v-model="selectedWells"
  :format="384"
  :wells="wells"
  selection-mode="multiple"
  size="fill"
/>
```

## Related

- [WellPlate playground](/sdk/components/well-plate)

[Back to component library](/sdk/components/)
