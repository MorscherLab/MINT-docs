---
aside: false
title: SplitButton
description: "Button that runs a default action, with a chevron menu that runs any action and makes it the new default."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SplitButton

Use `SplitButton` for a default action plus a menu of other actions. The last action chosen in the menu becomes the default.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SplitButton.vue">Source</a>
</div>

<demo vue="./demos/SplitButton.vue" title="SplitButton" description="Export actions. Click the left part to run the default. Pick another action in the menu to make it the default." />

## Import

```ts
import { SplitButton } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<SplitButton
  v-model="exportAction"
  :items="[
    { id: 'csv', label: 'Export CSV' },
    { id: 'xlsx', label: 'Export Excel' },
  ]"
  storage-key="results.export"
  @select="runExport"
/>
```

- The left part runs the default action and emits `select` with its item.
- The chevron opens an [ActionMenu](/sdk/components/action-menu) with all items. A choice in the menu runs that item and makes it the default (`v-model`).
- `storageKey` keeps the default in the browser's local storage under `mint.splitButton.<storageKey>`.
- An item with `href` (a link) runs, but never becomes the default.
- When the default is disabled or is not in `items`, the first enabled item that is not a link is the default.
- `label` is the accessible name of the chevron. The default is "More actions".

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SplitButton.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` items ` | ` ActionMenuItem[] ` | Yes | — | — |
| ` label ` | ` string ` | No | ` "More actions" ` | Accessible name of the chevron. |
| ` storageKey ` | ` string ` | No | ` undefined ` | Keeps the default in this browser's local storage under mint.splitButton.&lt;storageKey&gt;. |
| ` variant ` | ` ButtonVariant ` | No | ` "secondary" ` | — |
| ` size ` | ` ButtonSize ` | No | ` "md" ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` modelValue ` | ` string \| undefined ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ActionMenuItem `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L24) | See the linked SDK type definition. |
| [` ButtonVariant `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L11) | ` 'primary' \| 'secondary' \| 'cta' \| 'danger' \| 'success' \| 'ghost' ` |
| [` ButtonSize `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L12) | ` 'sm' \| 'md' \| 'lg' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` select ` | ` item: ActionMenuItem ` | — |
| ` update:modelValue ` | ` value: string \| undefined ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
