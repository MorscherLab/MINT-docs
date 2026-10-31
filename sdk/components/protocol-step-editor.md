---
aside: false
title: ProtocolStepEditor
description: "ProtocolStepEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# ProtocolStepEditor

ProtocolStepEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ProtocolStepEditor.vue">Source</a>
</div>

<demo vue="./demos/ProtocolStepEditor.vue" title="ProtocolStepEditor" description="An editor for one protocol step. Change the name, duration and parameters of the step." />

## Import

```ts
import { ProtocolStepEditor } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ProtocolStepEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ProtocolStep ` | No | ` undefined ` | — |
| ` templates ` | ` StepTemplate[] ` | No | ` undefined ` | — |
| ` customTemplates ` | ` StepTemplate[] ` | No | ` undefined ` | — |
| ` mode ` | ` 'create' \| 'edit' ` | No | ` "create" ` | — |
| ` showPreview ` | ` boolean ` | No | ` true ` | — |
| ` stepNumber ` | ` number ` | No | ` undefined ` | 1-based position of this step, shown as "3 / 7" beside the title together with stepCount. |
| ` stepCount ` | ` number ` | No | ` undefined ` | Total steps in the protocol; the ordinal shows only when both are set. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ProtocolStep `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L238) | See the linked SDK type definition. |
| [` StepTemplate `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/protocolTemplateCatalog.ts#L18) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` step: ProtocolStep ` | — |
| ` cancel ` | — | — |
| ` save ` | ` step: ProtocolStep ` | — |
| ` save-template ` | ` template: StepTemplate ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
