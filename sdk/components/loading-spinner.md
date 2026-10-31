---
aside: false
title: LoadingSpinner
description: "LoadingSpinner is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# LoadingSpinner

LoadingSpinner is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/LoadingSpinner.vue">Source</a>
</div>

<demo vue="./demos/LoadingSpinner.vue" title="LoadingSpinner" description="Three loading spinners in different sizes and colors. Compare the small, medium and large variants." />

## Import

```ts
import { LoadingSpinner } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/LoadingSpinner.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` size ` | ` 'xs' \| 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` tone ` | ` Tone \| 'inherit' ` | No | ` "primary" ` | — |
| ` label ` | ` string ` | No | ` "Loading" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
