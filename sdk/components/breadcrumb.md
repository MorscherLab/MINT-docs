---
aside: false
title: Breadcrumb
description: "Breadcrumb trail; ancestors are links or buttons, the last item is the current page."
---

<p class="mint-component-library__eyebrow">Layout</p>

# Breadcrumb

Use `Breadcrumb` to show where the current page is in a hierarchy, for example project, experiment and analysis.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/Breadcrumb.vue">Source</a>
</div>

<demo vue="./demos/Breadcrumb.vue" title="Breadcrumb" description="Breadcrumb trail with three levels. Read the path from project to experiment to analysis." />

## Import

```ts
import { Breadcrumb } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/Breadcrumb.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` items ` | ` BreadcrumbItemInput[] ` | Yes | — | — |
| ` separator ` | ` string ` | No | ` "/" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` BreadcrumbItemInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L556) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` navigate ` | ` item: BreadcrumbItem ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` item ` | ` { item: BreadcrumbItem; index: number; isLast: boolean; } ` | — |
| ` separator ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
