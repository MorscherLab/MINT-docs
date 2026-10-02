---
aside: false
title: ActionMenu
description: "Compact overflow actions with an IconButton trigger and a viewport-safe teleported menu."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# ActionMenu

Compact overflow actions with an IconButton trigger and a viewport-safe teleported menu.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ActionMenu.vue">Source</a>
</div>

<ComponentPlayground name="ActionMenu" />

## Import

```ts
import { ActionMenu } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<ActionMenu
  label="Row actions"
  :items="[
    { id: 'export', label: 'Export CSV' },
    { id: 'archive', label: 'Archive run' },
  ]"
  @select="handleAction"
/>
```

The `#trigger` slot replaces the default icon trigger. Render one `<button>` and wire the slot's `toggle` and `keydown` to it:

```vue
<ActionMenu :items="items" @select="handleAction">
  <template #trigger="{ open, toggle, keydown }">
    <button type="button" aria-haspopup="menu" :aria-expanded="open" @click="toggle" @keydown="keydown">Actions</button>
  </template>
</ActionMenu>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ActionMenu.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` label ` | ` string ` | Yes | — | — |
| ` items ` | ` ActionMenuItem[] ` | Yes | — | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ActionMenuItem `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L20) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
