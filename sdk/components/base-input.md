---
title: BaseInput
description: "Themed text and numeric input with error, placeholder, and v-model support."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseInput

Themed text and numeric input with error, placeholder, and v-model support.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/BaseInput.vue">Source</a>
</div>

<ComponentPlayground name="BaseInput" />

## Import

```ts
import { BaseInput } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<FormField label="Panel name" :error="errors.name" field-id="panel-name">
  <template #default="{ describedBy }">
    <BaseInput v-model="name" :aria-describedby="describedBy" />
  </template>
</FormField>
```

[Back to component library](/sdk/components/)
