---
title: FormBuilder
description: "Schema-driven form renderer for experiment-design and plugin settings UIs."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# FormBuilder

Schema-driven form renderer for experiment-design and plugin settings UIs.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/FormBuilder.vue">Source</a>
</div>

<ComponentPlayground name="FormBuilder" />

## Import

```ts
import { FormBuilder } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<FormBuilder :schema="designSchema" v-model="designData" />
```

## Related

- [FormBuilder deep dive](/sdk/frontend/form-builder)

[Back to component library](/sdk/components/)
