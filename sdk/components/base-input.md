---
aside: false
title: BaseInput
description: "Themed text and numeric input with error, placeholder, and v-model support."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseInput

Themed text and numeric input with error, placeholder, and v-model support.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseInput.vue">Source</a>
</div>

<ComponentPlayground name="BaseInput" />

## Import

```ts
import { BaseInput } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<FormField label="Panel name" :error="errors.name" field-id="panel-name">
  <template #default="{ describedBy }">
    <BaseInput v-model="name" :aria-describedby="describedBy" />
  </template>
</FormField>
```

The `#prefix` slot takes a bare leading glyph (a search icon, a currency sign); the `#suffix` slot renders a unit segment inside the field border:

```vue
<BaseInput v-model="volume" type="number">
  <template #suffix>µL</template>
</BaseInput>
```

Without either slot, the component renders the bare `<input>` as its root.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` type ` | ` InputType ` | No | ` 'text' ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` autocomplete ` | ` string ` | No | ` undefined ` | — |
| ` autofocus ` | ` boolean ` | No | ` false ` | — |
| ` maxlength ` | ` number ` | No | ` undefined ` | — |
| ` list ` | ` string ` | No | ` undefined ` | — |
| ` ariaDescribedby ` | ` string ` | No | ` undefined ` | — |
| ` rows ` | ` number ` | No | ` 3 ` | Visible text lines (textarea). |
| ` resize ` | ` 'none' \| 'vertical' \| 'horizontal' \| 'both' ` | No | ` 'vertical' ` | Resize handle (textarea). |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InputType `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L36) | ` 'text' \| 'password' \| 'email' \| 'search' \| 'tel' \| 'url' \| 'textarea' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
