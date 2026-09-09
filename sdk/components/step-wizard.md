---
aside: false
title: StepWizard
description: "Multi-step workflow container with progress, validation, and navigation slots."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# StepWizard

Multi-step workflow container with progress, validation, and navigation slots.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/StepWizard.vue">Source</a>
</div>

<ComponentPlayground name="StepWizard" />

## Import

```ts
import { StepWizard } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<StepWizard v-model="currentStep" :steps="steps">
  <template #step-basics>
    <!-- basic fields -->
  </template>
  <template #step-review>
    <!-- summary -->
  </template>
</StepWizard>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/StepWizard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` steps ` | ` WizardStep[] ` | Yes | — | — |
| ` modelValue ` | ` number ` | No | ` 0 ` | — |
| ` linear ` | ` boolean ` | No | ` true ` | — |
| ` showProgress ` | ` boolean ` | No | ` true ` | — |
| ` showStepNumbers ` | ` boolean ` | No | ` true ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` WizardStep `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L15) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
