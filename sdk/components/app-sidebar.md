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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AppSidebar.vue">Source</a>
</div>

<ComponentPlayground name="AppSidebar" />

## Import

```ts
import { AppSidebar } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AppSidebar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | Optional chrome title rendered above generated sections. |
| ` subtitle ` | ` string ` | No | ` undefined ` | Optional secondary chrome copy rendered below title. |
| ` badge ` | ` string \| number ` | No | ` undefined ` | Optional compact badge/count rendered in the chrome header. |
| ` variant ` | ` 'default' \| 'analysis' ` | No | ` 'default' ` | Visual preset for common plugin sidebars. analysis preserves the LEAF-style MINT analysis sidebar design language. |
| ` panels ` | ` Record<string, SidebarToolSection[]> ` | No | ` () => ({}) ` | Map of view IDs to their tool sections |
| ` activeView ` | ` string ` | No | ` '' ` | Which view's panels to display. Defaults to the first non-empty panel view. |
| ` floating ` | ` boolean ` | No | ` undefined ` | Floating variant with absolute positioning. Defaults to false for analysis variant. |
| ` dense ` | ` boolean ` | No | ` false ` | Compact layout: smaller headers, tighter spacing, no icon backgrounds |
| ` width ` | ` string ` | No | ` undefined ` | Width when visible. Defaults to 20rem for analysis variant, otherwise 280px. |
| ` side ` | ` 'left' \| 'right' ` | No | ` 'left' ` | Position sidebar on left or right side |
| ` toggleState ` | ` Record<string, boolean> ` | No | ` () => ({}) ` | Toggle state map: sectionId → boolean |
| ` forms ` | ` Record<string, FormSchema> ` | No | ` () => ({}) ` | Optional FormBuilder schemas keyed by section ID. Used when no section slot is provided. |
| ` viewIds ` | ` string[] ` | No | ` () => [] ` | Generated view IDs from useControlSchema(). Consumed for clean v-bind ergonomics. |
| ` viewItems ` | ` PillNavItem[] ` | No | ` () => [] ` | Generated AppTopBar pillNav-compatible view items from useControlSchema(). Consumed for clean v-bind ergonomics. |
| ` defaultView ` | ` string ` | No | ` '' ` | Default view ID used when activeView is omitted. |
| ` model ` | ` ControlModel \| ControlModelBinding ` | No | ` undefined ` | Model returned by defineControlModel(), or a raw nested ControlModel for one-step sidebar/form generation. |
| ` controls ` | ` ControlSchema ` | No | ` undefined ` | Compact control schema. When provided, AppSidebar generates panels, section forms, and default values. |
| ` controlOptions ` | ` ControlWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to compact control schema generation, including shared initialValues. |
| ` contentId ` | ` string ` | No | ` undefined ` | DOM id for the scrollable content area. Use with Teleport when route/tab children own sidebar controls. |
| ` showWhenEmpty ` | ` boolean ` | No | ` false ` | Render the sidebar shell even when no panel matches the active view. Useful for default-slot or Teleport-driven sidebars. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | Shared values for auto-rendered section forms. Supports default v-model. |
| ` values ` | ` Record<string, unknown> ` | No | ` () => ({}) ` | Shared values for auto-rendered section forms |
| ` formEnhancements ` | ` FormEnhancements<Record<string, unknown>> ` | No | ` undefined ` | Runtime FormBuilder enhancements for auto-rendered section forms |
| ` showFormActions ` | ` boolean ` | No | ` false ` | Show submit/cancel actions inside auto-rendered section forms |
| ` formLoading ` | ` boolean ` | No | ` false ` | Loading/saving state for auto-rendered section forms |
| ` formDisabled ` | ` boolean ` | No | ` false ` | Disabled state for auto-rendered section forms |
| ` formReadonly ` | ` boolean ` | No | ` false ` | Readonly state for auto-rendered section forms |
| ` formSize ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'sm' ` | Size passed to auto-rendered section forms |
| ` collapsible ` | ` boolean ` | No | ` undefined ` | Show a built-in collapse/expand button in the sidebar chrome. Defaults to true for analysis variant. |
| ` collapsed ` | ` boolean ` | No | ` undefined ` | Controlled collapsed state. |
| ` defaultCollapsed ` | ` boolean ` | No | ` false ` | Initial collapsed state when collapsed is uncontrolled. |
| ` collapsedWidth ` | ` string ` | No | ` '3rem' ` | Width when collapsed. |
| ` collapseButtonLabel ` | ` string ` | No | ` 'Collapse sidebar' ` | Accessible label for the collapse action. |
| ` expandButtonLabel ` | ` string ` | No | ` 'Expand sidebar' ` | Accessible label for the expand action. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SidebarToolSection `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L136) | See the linked SDK type definition. |
| [` FormSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/form-builder.ts#L133) | See the linked SDK type definition. |
| [` PillNavItem `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L198) | See the linked SDK type definition. |
| [` ControlModel `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L173) | See the linked SDK type definition. |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L187) | See the linked SDK type definition. |
| [` ControlSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L140) | See the linked SDK type definition. |
| [` ControlWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L155) | See the linked SDK type definition. |
| [` FormEnhancements `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/form-builder.ts#L164) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
