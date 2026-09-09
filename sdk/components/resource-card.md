---
aside: false
title: ResourceCard
description: "ResourceCard is a layout component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Layout</p>

# ResourceCard

ResourceCard is a layout component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ResourceCard.vue">Source</a>
</div>

<ComponentPlayground name="ResourceCard" />

## Import

```ts
import { ResourceCard } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ResourceCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` name ` | ` string ` | Yes | — | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` status ` | ` ResourceStatus ` | No | ` 'available' ` | — |
| ` image ` | ` string ` | No | ` undefined ` | — |
| ` location ` | ` string ` | No | ` undefined ` | — |
| ` specs ` | ` ResourceSpec[] ` | No | ` () => [] ` | — |
| ` tags ` | ` string[] ` | No | ` () => [] ` | — |
| ` nextAvailable ` | ` string ` | No | ` undefined ` | — |
| ` showBookAction ` | ` boolean ` | No | ` true ` | — |
| ` compact ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` statusLabel ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ResourceStatus `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L134) | ` 'available' \| 'in-use' \| 'maintenance' \| 'offline' ` |
| [` ResourceSpec `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L136) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
