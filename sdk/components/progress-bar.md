---
aside: false
title: ProgressBar
description: "ProgressBar is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# ProgressBar

ProgressBar is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ProgressBar.vue">Source</a>
</div>

<demo vue="./demos/ProgressBar.vue" title="ProgressBar" description="A progress bar with a label and a percent value." />

## Import

```ts
import { ProgressBar } from "@morscherlab/mint-sdk"
```

`ProgressBar` shows a percentage rail (`value`) or an `indeterminate` bar. For step-by-step progress, use [StepWizard](/sdk/components/step-wizard).

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ProgressBar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` value ` | ` number ` | No | ` 0 ` | — |
| ` tone ` | ` Tone ` | No | ` "primary" ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` showValue ` | ` boolean ` | No | ` false ` | — |
| ` indeterminate ` | ` boolean ` | No | ` false ` | — |
| ` ariaLabel ` | ` string ` | No | ` undefined ` | — |

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
