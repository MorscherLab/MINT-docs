---
aside: false
title: AppSidebar
description: "Sectioned sidebar for plugin-specific navigation and grouped tools."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppSidebar

Sectioned sidebar for plugin-specific navigation and grouped tools.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppSidebar.vue">Source</a>
</div>

<demo vue="./demos/AppSidebar.vue" title="AppSidebar" description="A sidebar with collapsible panels and form controls. Change the slider, select and toggles in the panels." />

## Import

```ts
import { AppSidebar } from "@morscherlab/mint-sdk/shell"
```

## Changes in 1.2.1

Sections now render as flat groups instead of nested cards. The effective default
density is compact; use `density="comfortable"` for more spacing. The old
`variant` prop has been removed, and `dense` is deprecated (removal in MINT 1.4). Use `collapsible`
explicitly when you need a collapse button; it defaults to `false` on AppSidebar.

When AppLayout owns placement, pass `:floating="false"` to the sidebar. The former
"analysis chrome" width is now explicit: use `collapsible` plus `width="20rem"`
instead of a variant:

```vue
<AppSidebar
  :panels="panels"
  active-view="analysis"
  :floating="false"
  density="compact"
  collapsible
  width="20rem"
/>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppSidebar.vue).

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
| [` PluginWorkspaceSidebarSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L251) | See the linked SDK type definition. |

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
