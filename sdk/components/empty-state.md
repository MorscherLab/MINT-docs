---
aside: false
title: EmptyState
description: "Empty-list and empty-view treatment with optional action affordance."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# EmptyState

Empty-list and empty-view treatment with optional action affordance.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/EmptyState.vue">Source</a>
</div>

<demo vue="./demos/EmptyState.vue" title="EmptyState" description="Placeholder for a view without data, with a title, a description, and an action button." />

## Import

```ts
import { EmptyState } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/EmptyState.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` iconPath ` | ` string ` | No | ` undefined ` | — |
| ` tone ` | ` Tone ` | No | ` "neutral" ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` variant ` | ` 'illustrated' \| 'inline' ` | No | ` "illustrated" ` | — |
| ` actionLabel ` | ` string ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` action ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` icon ` | — | — |
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
