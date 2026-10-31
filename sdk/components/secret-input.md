---
aside: false
title: SecretInput
description: "Edits one plugin secret setting: shows set / not set / provided-by-environment state and submits a replacement, keep, or clear."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SecretInput

Edits one plugin secret setting: shows set / not set / provided-by-environment state and submits a replacement, keep, or clear.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SecretInput.vue">Source</a>
</div>

<demo vue="./demos/SecretInput.vue" title="SecretInput" description="A stored plugin secret field. Change or clear the secret and read the submitted value below." />

## Import

```ts
import { SecretInput } from "@morscherlab/mint-sdk/data"
```

## Basic Usage

```vue
<FormField label="API token">
  <SecretInput v-model="apiToken" placeholder="Paste a new token" />
</FormField>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SecretInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` SecretValue ` | No | ` null ` | The $secret marker from the settings response, a typed string, or null. |
| ` placeholder ` | ` string ` | No | ` "Enter a new value" ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` changeLabel ` | ` string ` | No | ` "Change" ` | Label on the control that starts entering a replacement value. |
| ` clearLabel ` | ` string ` | No | ` "Clear" ` | Label on the control that clears a stored secret. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SecretValue `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SecretInput.vue#L9) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: SecretValue ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
