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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ProtocolStepEditor.vue">Source</a>
</div>

<ComponentPlayground name="ProtocolStepEditor" />

## Import

```ts
import { ProtocolStepEditor } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ProtocolStepEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ProtocolStep ` | No | ` undefined ` | — |
| ` templates ` | ` StepTemplate[] ` | No | ` undefined ` | — |
| ` customTemplates ` | ` StepTemplate[] ` | No | ` undefined ` | — |
| ` mode ` | ` 'create' \| 'edit' ` | No | ` 'create' ` | — |
| ` showPreview ` | ` boolean ` | No | ` true ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ProtocolStep `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L150) | See the linked SDK type definition. |
| [` StepTemplate `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/protocolTemplateCatalog.ts#L18) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
