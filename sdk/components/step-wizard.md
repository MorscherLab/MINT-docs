---
title: StepWizard
description: "Multi-step workflow container with progress, validation, and navigation slots."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# StepWizard

Multi-step workflow container with progress, validation, and navigation slots.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/StepWizard.vue">Source</a>
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

[Back to component library](/sdk/components/)
