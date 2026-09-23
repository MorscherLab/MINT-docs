---
aside: false
title: SearchableSelect
description: "Searchable single-select listbox with option descriptions and disabled reasons."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SearchableSelect

Use `SearchableSelect` when users need to search a supplied list of choices. It supports a single string/number value, descriptive options, disabled reasons, and keyboard navigation. Use [BaseSelect](/sdk/components/base-select) for a short native select and [MultiSelect](/sdk/components/multi-select) for multiple selections.

<ComponentPlayground name="SearchableSelect" />

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SearchableSelect } from '@morscherlab/mint-sdk'

const method = ref<string | number>('targeted')
const options = [
  { value: 'targeted', label: 'Targeted LC-MS', description: 'Known metabolite panel', meta: 'LC-MS' },
  { value: 'screening', label: 'Screening', description: 'Broad feature search', meta: 'LC-MS' },
  { value: 'gc', label: 'GC-MS', disabled: true, disabledReason: 'No GC method configured' },
]
</script>

<template>
  <fieldset>
    <legend>Analysis method</legend>
    <SearchableSelect
      v-model="method"
      :options="options"
      placeholder="Choose an analysis method"
      search-placeholder="Search analysis methods"
    >
      <template #footer>Only configured methods can be selected.</template>
    </SearchableSelect>
  </fieldset>
</template>
```

String/number option arrays also work. Object options use `value`, `label`, and optional `description`, `meta`, `disabled`, and `disabledReason`. Search matches the label, description, metadata, and disabled reason without regard to case. Filtering happens locally; this component has no remote-search event or pagination API.

## Slots and keyboard behavior

- `option` receives `{ option, selected, active }` and replaces the option's inner content; retain a readable label and disabled explanation.
- `footer` adds content below the option list.

Arrow keys move through enabled options, Home/End move to the first/last enabled option, Enter selects, and Escape closes and restores trigger focus. Selection emits `update:modelValue`. Use `disabled` for the entire control while its prerequisites are unavailable.

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/SearchableSelect.vue)

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/SearchableSelect.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | No | ` undefined ` | — |
| ` options ` | ` SelectOptionInput<string \| number>[] ` | Yes | — | — |
| ` placeholder ` | ` string ` | No | ` 'Select an option' ` | — |
| ` searchPlaceholder ` | ` string ` | No | ` 'Search options…' ` | — |
| ` noResultsText ` | ` string ` | No | ` 'No matching options' ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/components.ts#L112) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
