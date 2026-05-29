---
title: DataFrame
description: "Searchable, sortable, selectable table for dense experiment and analysis results."
---

<p class="mint-component-library__eyebrow">Data display</p>

# DataFrame

Searchable, sortable, selectable table for dense experiment and analysis results.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/DataFrame.vue">Source</a>
</div>

<ComponentPlayground name="DataFrame" />

## Import

```ts
import { DataFrame } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<DataFrame
  :columns="columns"
  :data="rows"
  row-key="id"
  searchable
  sortable
  sticky-header
/>
```

## Related

- [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables)

[Back to component library](/sdk/components/)
