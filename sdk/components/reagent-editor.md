---
aside: false
title: ReagentEditor
description: "ReagentEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# ReagentEditor

ReagentEditor is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ReagentEditor.vue">Source</a>
</div>

<ComponentPlayground name="ReagentEditor" />

## Import

```ts
import { ReagentEditor } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ReagentEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ReagentDefinition ` | Yes | — | — |
| ` plateFormat ` | ` 96 \| 384 ` | No | ` 96 ` | — |
| ` units ` | ` string[] ` | No | ` () => DEFAULT_UNITS ` | — |
| ` presets ` | ` DilutionPreset[] ` | No | ` () => DEFAULT_PRESETS ` | — |
| ` maxLevels ` | ` number ` | No | ` 24 ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ReagentDefinition `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ReagentEditor.vue#L15) | See the linked SDK type definition. |
| [` DilutionPreset `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/useReagentSeries.ts#L12) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
