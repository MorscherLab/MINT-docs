---
aside: false
title: ResourceCard
description: "Card displaying a lab resource with availability status, specs, tags, and a book action."
---

<p class="mint-component-library__eyebrow">Layout</p>

# ResourceCard

Card displaying a lab resource with availability status, specs, tags, and a book action.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ResourceCard.vue">Source</a>
</div>

<demo vue="./demos/ResourceCard.vue" title="ResourceCard" description="A card for a shared instrument. It shows status, location, specifications and tags." />

## Import

```ts
import { ResourceCard } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ResourceCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` name ` | ` string ` | Yes | — | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` status ` | ` ResourceStatus ` | No | ` "available" ` | — |
| ` image ` | ` string ` | No | ` undefined ` | — |
| ` location ` | ` string ` | No | ` undefined ` | — |
| ` specs ` | ` ResourceSpec[] ` | No | ` [] ` | — |
| ` tags ` | ` string[] ` | No | ` [] ` | — |
| ` nextAvailable ` | ` string ` | No | ` undefined ` | — |
| ` showBookAction ` | ` boolean ` | No | ` true ` | — |
| ` compact ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` statusLabel ` | ` string ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ResourceStatus `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L140) | ` 'available' \| 'in-use' \| 'maintenance' \| 'offline' ` |
| [` ResourceSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L142) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` book ` | — | — |
| ` click ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` status ` | — | — |
| ` action ` | — | — |
| ` image ` | — | — |
| ` specs ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
