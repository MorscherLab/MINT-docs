---
aside: false
title: GeneratedPathInput
description: "File/folder path picker for backend-declared job inputs in generated plugin UIs."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedPathInput

File/folder path picker for backend-declared job inputs in generated plugin UIs.

::: info Generated UI (internal)
This component renders a piece of the SDK's backend-driven **generated UI** system (`@generated_ui` / job manifests). Plugin authors typically don't place it directly; it is composed automatically inside `GeneratedPluginView`. Documented here for completeness and for authors customizing generated-UI rendering.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/GeneratedPathInput.vue">Source</a>
</div>

::: info Needs the platform
This component browses files through the platform file picker (`usePlatformFilePickerAdapter`) and reads `useExperimentStore`. To see it work, open a plugin with `mint dev --platform`.
:::

## Import

```ts
import { GeneratedPathInput } from "@morscherlab/mint-sdk/runtime"
```

## Basic Usage

```vue
<GeneratedPathInput v-model="inputPath" :multiple="false" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/GeneratedPathInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` PluginJobPathSelection \| PluginJobPathSelection[] \| null ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` multiple ` | ` boolean ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginJobPathSelection `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/generated-ui.ts#L60) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: PluginJobPathSelection \| PluginJobPathSelection[] \| null ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
