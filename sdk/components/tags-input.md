---
aside: false
title: TagsInput
description: "TagsInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# TagsInput

TagsInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/TagsInput.vue">Source</a>
</div>

<ComponentPlayground name="TagsInput" />

## Import

```ts
import { TagsInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/TagsInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string[] ` | No | ` () => [] ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` maxTags ` | ` number ` | No | ` undefined ` | — |
| ` allowDuplicates ` | ` boolean ` | No | ` false ` | — |
| ` suggestions ` | ` string[] \| TagSuggestion[] ` | No | ` () => [] ` | — |
| ` categories ` | ` TagCategory[] ` | No | ` () => [] ` | — |
| ` activeCategory ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TagSuggestion `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/TagsInput.vue#L7) | See the linked SDK type definition. |
| [` TagCategory `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/TagsInput.vue#L12) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
