---
aside: false
title: FormActions
description: "FormActions is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# FormActions

FormActions is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FormActions.vue">Source</a>
</div>

<ComponentPlayground name="FormActions" />

## Import

```ts
import { FormActions } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FormActions.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` isWizard ` | ` boolean ` | No | ` false ` | — |
| ` isFirst ` | ` boolean ` | No | ` true ` | — |
| ` isLast ` | ` boolean ` | No | ` true ` | — |
| ` canProceed ` | ` boolean ` | No | ` true ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` submitLabel ` | ` string ` | No | ` 'Submit' ` | — |
| ` cancelLabel ` | ` string ` | No | ` 'Cancel' ` | — |
| ` showCancel ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
