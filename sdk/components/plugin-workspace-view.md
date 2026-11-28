---
aside: false
title: PluginWorkspaceView
description: "Default plugin frontend shell that mint init scaffolds."
---

<p class="mint-component-library__eyebrow">Layout</p>

# PluginWorkspaceView

Use `PluginWorkspaceView` as the shell of a plugin page. It is built on `AppLayout` and gives the top bar, the sidebar and, optionally, the experiment chip. Your slot gives the main content. To choose between it and `AppLayout`, see [AppLayout or a workspace](/sdk/frontend/#applayout-or-a-workspace).

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PluginWorkspaceView.vue">Source</a>
</div>

<demo vue="./demos/PluginWorkspaceView.vue" title="PluginWorkspaceView" description="A workspace with two sidebar views and a main card. Select a pill to change the sidebar sections." />

## Import

```ts
import { PluginWorkspaceView, definePluginWorkspaceView } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<script setup lang="ts">
import { PluginWorkspaceView, definePluginWorkspaceView } from '@morscherlab/mint-sdk'
import { analysisControls } from './stores/analysis'

const workspace = definePluginWorkspaceView({
  floating: true,
  main: 'plain',
  sidebar: { title: 'Parameters', collapsible: true, controls: analysisControls },
})
</script>

<template>
  <PluginWorkspaceView :spec="workspace" @form-submit="(_section, values) => run(values)">
    <router-view />
  </PluginWorkspaceView>
</template>
```

Put `<router-view />` straight into the default slot, without an [AppContainer](/sdk/components/app-container). `spec.sidebar.controls` takes a control model and generates the sidebar sections and their forms. For a full walk-through, see [Adding a frontend](/sdk/tutorials/adding-a-frontend).

## Main pane

`spec.main` sets the surface of the main pane:

| Value | Result |
|-------|--------|
| `'plain'` (default) | The slot renders as it is. Use it for a full-bleed view, or for one `SectionCard` with `fill` |
| `'card'` | One scrolling card that stacks the children of the slot with the gutter. Put `SectionCard`s straight into the slot |

## View pills

A control model in `spec.sidebar.controls` with two or more `views` gives one top-bar pill for each view. A control model with one view shows no pill. `spec.topBar.pills` sets the pills by hand, and the workspace shows them as given. Bind the active pill with `v-model:pill` and the active view with `v-model:view`.

## Experiment and jobs

- `spec.experiment: true` shows the experiment chip in the top bar: the popover, the selector and the save action (`spec.save`). A plugin type that writes experiments uses it.
- `spec.jobs` shows the job of the viewer in the top bar and opens a [JobsStatusTray](/sdk/components/jobs-status-tray).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PluginWorkspaceView.vue) · [Shared props definition](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PluginWorkspaceView.props.ts).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` PluginWorkspaceViewSpec ` | No | ` {} ` | Structure built with definePluginWorkspaceView(). Optional: every option has a default. |
| ` pill ` | ` string ` | No | ` undefined ` | Active pill id. Bind with v-model:pill; defaults to the active view. |
| ` view ` | ` string ` | No | ` undefined ` | Active workspace view. Bind with v-model:view; unbound, the workspace keeps its own. |
| ` values ` | ` Record<string, unknown> ` | No | ` undefined ` | Values of the sidebar control model. Bind with v-model:values. |
| ` sidebarCollapsed ` | ` boolean ` | No | ` undefined ` | Sidebar collapsed state. Bind with v-model:sidebar-collapsed. |
| ` formLoading ` | ` boolean ` | No | ` false ` | Loading / saving state of the sidebar forms. |
| ` formDisabled ` | ` boolean ` | No | ` false ` | Disabled state of the sidebar forms. |
| ` formReadonly ` | ` boolean ` | No | ` false ` | Readonly state of the sidebar forms. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginWorkspaceViewSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L318) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` pill-select ` | ` item: PillNavItem ` | — |
| ` pill-option-select ` | ` option: PillNavOption, item: PillNavItem ` | — |
| ` settings-values-change ` | ` data: Record<string, unknown> ` | — |
| ` update:pill ` | ` pillId: string ` | — |
| ` update:view ` | ` view: string ` | — |
| ` update:values ` | ` values: Record<string, unknown> ` | — |
| ` update:sidebarCollapsed ` | ` value: boolean ` | — |
| ` experiment-select ` | ` experiment: ExperimentSummary ` | — |
| ` experiment-detach ` | — | — |
| ` update:toggle ` | ` sectionId: string, value: boolean ` | — |
| ` section-action ` | ` sectionId: string, actionId: string ` | — |
| ` form-submit ` | ` sectionId: string, values: Record<string, unknown> ` | — |
| ` form-cancel ` | ` sectionId: string ` | — |
| ` job-select ` | ` job: JobState ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | ` PluginWorkspaceSlotProps ` | — |
| ` topbar ` | ` PluginWorkspaceSlotProps ` | — |
| ` sidebar ` | ` PluginWorkspaceSlotProps ` | — |
| ` icon ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` logo ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` nav ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` center ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` actions ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` settings-appearance ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` header ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` collapsed ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` collapsed-footer ` | ` PluginWorkspaceForwardedSlotProps ` | — |
| ` footer ` | ` PluginWorkspaceForwardedSlotProps ` | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
