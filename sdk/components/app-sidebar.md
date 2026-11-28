---
aside: false
title: AppSidebar
description: "Sectioned sidebar for plugin-specific navigation and grouped tools."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppSidebar

Use `AppSidebar` for plugin navigation and grouped tools in a side panel.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppSidebar.vue">Source</a>
</div>

<demo vue="./demos/AppSidebar.vue" title="AppSidebar" description="A sidebar with collapsible panels and form controls. Change the slider, select and toggles in the panels." />

## Import

```ts
import { AppSidebar } from "@morscherlab/mint-sdk/shell"
```

## Basic usage

Set the structure in `spec`. Its type, `PluginWorkspaceSidebarSpec`, is also the `sidebar` part of a [PluginWorkspaceView](/sdk/components/plugin-workspace-view) spec. Fill a section with the `#section-<id>` slot.

```vue
<script setup lang="ts">
import { AppSidebar } from '@morscherlab/mint-sdk/shell'
import type { PluginWorkspaceSidebarSpec } from '@morscherlab/mint-sdk'

const sidebar: PluginWorkspaceSidebarSpec = {
  title: 'Analysis tools',
  panels: { analysis: [{ id: 'parameters', label: 'Parameters', defaultOpen: true }] },
  floating: false,
  collapsible: true,
  width: '20rem',
}
</script>

<template>
  <AppSidebar :spec="sidebar" active-view="analysis">
    <template #section-parameters><!-- controls --></template>
  </AppSidebar>
</template>
```

- Sections render as flat groups, not as nested cards.
- The sidebar is compact by default (`dense`, default `true`).
- The collapse button shows only with `collapsible`.
- When `AppLayout` places the sidebar, set `floating: false`.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppSidebar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` PluginWorkspaceSidebarSpec ` | No | ` {} ` | Structure: header, sections, forms, width, side, collapse. Optional: every option has a default. |
| ` activeView ` | ` string ` | No | ` "" ` | Which view's panels to display. Defaults to the first non-empty panel view. |
| ` values ` | ` Record<string, unknown> ` | No | ` {} ` | Values of the section forms. Bind with v-model:values. |
| ` collapsed ` | ` boolean ` | No | ` undefined ` | Collapsed state. Bind with v-model:collapsed; unbound, the sidebar keeps its own. |
| ` toggleState ` | ` Record<string, boolean> ` | No | ` {} ` | On / off state of the section toggles, keyed by section id. |
| ` formLoading ` | ` boolean ` | No | ` false ` | Loading / saving state of the section forms. |
| ` formDisabled ` | ` boolean ` | No | ` false ` | Disabled state of the section forms. |
| ` formReadonly ` | ` boolean ` | No | ` false ` | Readonly state of the section forms. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginWorkspaceSidebarSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L270) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:values ` | ` values: Record<string, unknown> ` | — |
| ` update:toggle ` | ` sectionId: string, value: boolean ` | — |
| ` section-action ` | ` sectionId: string, actionId: string ` | — |
| ` form-submit ` | ` sectionId: string, values: Record<string, unknown> ` | — |
| ` form-cancel ` | ` sectionId: string ` | — |
| ` update:collapsed ` | ` value: boolean ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` header ` | ` { collapsed: boolean; toggleCollapsed: () => void; } ` | — |
| ` default ` | ` { sections: SidebarToolSection[]; activeView: string; values: Record<string, unknown>; } ` | — |
| ` collapsed ` | ` { sections: SidebarToolSection[]; expand: () => void; } ` | — |
| ` footer ` | — | — |
| ` collapsed-footer ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
