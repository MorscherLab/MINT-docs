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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/components/SampleSelector.vue">Source</a>
</div>

<demo vue="./demos/SampleSelector.vue" title="SampleSelector" description="Select samples from a list and sort them into colored groups. Click samples to change the selection." />

## Import

```ts
import { SampleSelector } from "@morscherlab/mint-sdk/lab"
```

## Group separator

`SampleSelector` splits a group name into nested levels. Without `groupSeparator`, it splits at `/` when a name contains one, and at `_` otherwise. A name such as `B13_7` then shows as the subgroup `7` of `B13`. If your group names carry data values, pass a character that the names never contain. The selector then shows each group flat.

```vue
<SampleSelector v-model="selected" :samples="samples" group-separator="|" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.5.5**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/components/SampleSelector.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` samples ` | ` string[] ` | No | ` [] ` | — |
| ` modelValue ` | ` string[] ` | Yes | — | — |
| ` groups ` | ` SampleGroup[] ` | No | ` [] ` | — |
| ` enableGrouping ` | ` boolean ` | No | ` true ` | — |
| ` enableSmartGroup ` | ` boolean ` | No | ` true ` | — |
| ` experimentId ` | ` number ` | No | ` undefined ` | — |
| ` designData ` | ` Record<string, unknown> ` | No | ` undefined ` | — |
| ` autoloadExperimentData ` | ` boolean ` | No | ` true ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the selector body with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the selector body is replaced by an error state. null/undefined renders normally. |
| ` emptyText ` | ` string ` | No | ` "No samples available" ` | Empty-state headline shown when there are no samples to select from. |
| ` groupSeparator ` | ` string ` | No | ` undefined ` | Splits group names into nested levels. Default: / when a group name contains one, otherwise _. Pass a character the names never contain to show every group flat. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SampleGroup `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/types/componentLabTypes.ts#L255) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` samples: string[] ` | — |
| ` update:groups ` | ` groups: SampleGroup[] ` | — |
| ` smartGroup ` | ` result: AutoGroupResult ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` error ` | ` { error: string; } ` | — |
| ` loading ` | — | — |
| ` empty ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
