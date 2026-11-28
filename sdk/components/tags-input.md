---
aside: false
title: TagsInput
description: "Tag field with suggestions, categories and a maximum count."
---

<p class="mint-component-library__eyebrow">Forms</p>

# TagsInput

Use `TagsInput` to enter a list of tags, with suggestions as the user types.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/TagsInput.vue">Source</a>
</div>

<demo vue="./demos/TagsInput.vue" title="TagsInput" description="A tag field with suggestions. Type a tag or pick a suggestion to add it to the list." />

## Import

```ts
import { TagsInput } from "@morscherlab/mint-sdk/data"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/TagsInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string[] ` | No | ` [] ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` maxTags ` | ` number ` | No | ` undefined ` | — |
| ` allowDuplicates ` | ` boolean ` | No | ` false ` | — |
| ` suggestions ` | ` string[] \| TagSuggestion[] ` | No | ` [] ` | — |
| ` categories ` | ` TagCategory[] ` | No | ` [] ` | — |
| ` activeCategory ` | ` string ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TagSuggestion `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/TagsInput.vue#L9) | See the linked SDK type definition. |
| [` TagCategory `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/TagsInput.vue#L14) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: string[] ` | — |
| ` update:activeCategory ` | ` prefix: string ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
