---
aside: false
title: StepWizard
description: "Multi-step workflow container with progress, validation, and navigation slots."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# StepWizard

Use `StepWizard` to split a task into steps, with progress, validation and Back and Next buttons.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/StepWizard.vue">Source</a>
</div>

<demo vue="./demos/StepWizard.vue" title="StepWizard" description="A three-step wizard with free navigation. Click a step to show its panel." />

## Import

```ts
import { StepWizard } from "@morscherlab/mint-sdk/lab"
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

- The default navigation shows a step counter (`2 / 4`) on the left, and Cancel, Back and Next (or Finish) buttons on the right.
- The `#navigation` slot replaces all of it.
- The `#actions-start` slot adds an action that keeps the wizard open, for example Save draft. It shows to the left of Cancel, Back and Next.

## In a modal

Inside a [BaseModal](/sdk/components/base-modal), the wizard puts its buttons in the modal footer, so that the dialog has one footer. Do not give the modal its own `#footer` slot. The `mint lint` rule `wizard-in-modal` reports a `StepWizard` in a `BaseModal` that has its own footer.

```vue
<BaseModal v-model:open="open" title="New sequence">
  <StepWizard v-model="step" :steps="steps" @complete="create" @cancel="open = false">
    <template #step-samples><!-- sample fields --></template>
    <template #step-review><!-- summary --></template>
    <template #actions-start>
      <BaseButton variant="ghost" @click="saveDraft">Save draft</BaseButton>
    </template>
  </StepWizard>
</BaseModal>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/StepWizard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` steps ` | ` WizardStep[] ` | Yes | — | — |
| ` modelValue ` | ` number ` | No | ` 0 ` | — |
| ` linear ` | ` boolean ` | No | ` true ` | — |
| ` showProgress ` | ` boolean ` | No | ` true ` | — |
| ` showStepNumbers ` | ` boolean ` | No | ` true ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` orientation ` | ` 'horizontal' \| 'vertical' ` | No | ` "horizontal" ` | vertical stacks the steps in a rail beside the step content. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` WizardStep `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L15) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` index: number ` | — |
| ` cancel ` | — | — |
| ` complete ` | — | — |
| ` step-change ` | ` change: [from: number, to: number] ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` progress ` | ` { steps: WizardStep[]; current: number; states: WizardStepState[]; } ` | Replaces the step indicator. |
| ` navigation ` | ` { goBack: () => void; goNext: () => void; finish: () => void; cancel: () => void; isFirst: boolean; isLast: boolean; canProceed: boolean; } ` | Replaces the button row. |
| ` actions-start ` | — | An action that keeps the wizard open (Save draft), left of Cancel / Back / Next. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
