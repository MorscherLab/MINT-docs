---
aside: false
title: SampleSelector
description: "SampleSelector is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SampleSelector

SampleSelector is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SampleSelector.vue">Source</a>
</div>

<ComponentPlayground name="SampleSelector" />

## Import

```ts
import { SampleSelector } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SampleSelector.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` samples ` | ` string[] ` | No | ` () => [] ` | — |
| ` modelValue ` | ` string[] ` | Yes | — | — |
| ` groups ` | ` SampleGroup[] ` | No | ` () => [] ` | — |
| ` enableGrouping ` | ` boolean ` | No | ` true ` | — |
| ` enableSmartGroup ` | ` boolean ` | No | ` true ` | — |
| ` experimentId ` | ` number ` | No | ` undefined ` | — |
| ` designData ` | ` Record<string, unknown> ` | No | ` undefined ` | — |
| ` autoloadExperimentData ` | ` boolean ` | No | ` true ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the selector body with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the selector body is replaced by an error state. null/undefined renders normally. |
| ` emptyMessage ` | ` string ` | No | ` 'No samples available' ` | Empty-state headline shown when there are no samples to select from. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SampleGroup `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L162) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
