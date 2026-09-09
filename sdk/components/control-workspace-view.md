---
aside: false
title: ControlWorkspaceView
description: "ControlWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ControlWorkspaceView

ControlWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ControlWorkspaceView.vue">Source</a>
</div>

<ComponentPlayground name="ControlWorkspaceView" />

## Import

```ts
import { ControlWorkspaceView } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ControlWorkspaceView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` model ` | ` ControlModel \| ControlModelBinding ` | No | ` undefined ` | Model returned by defineControlModel()/defineDoseDesignControlModel(), or a raw nested ControlModel. |
| ` workspace ` | ` UseControlWorkspaceReturn<ControlSchema> ` | No | ` undefined ` | Workspace returned by useControlWorkspace(). Use for full manual control. |
| ` controls ` | ` ControlSchema ` | No | ` undefined ` | Compact controls schema. When provided without workspace, the view creates the workspace internally. |
| ` controlOptions ` | ` ControlWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to the internally generated useControlWorkspace() call. |
| ` initialValues ` | ` Record<string, unknown> ` | No | ` undefined ` | Initial values for the internally generated workspace. Merged over controlOptions.initialValues. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | External values for the internally generated workspace. Supports default v-model. |
| ` values ` | ` Record<string, unknown> ` | No | ` undefined ` | External values for the internally generated workspace. Supports v-model:values. |
| ` title ` | ` string ` | No | ` 'Workspace' ` | AppTopBar title. |
| ` subtitle ` | ` string ` | No | ` undefined ` | AppTopBar subtitle. |
| ` topBarVariant ` | ` TopBarVariant ` | No | ` 'card' ` | AppTopBar visual variant. |
| ` sidebarWidth ` | ` string ` | No | ` '320px' ` | AppSidebar/AppLayout sidebar width. |
| ` sidebarVariant ` | ` ControlWorkspaceSidebarVariant ` | No | ` 'analysis' ` | AppSidebar visual preset. analysis matches the LEAF-style MINT analysis sidebar design language. |
| ` responsiveSidebar ` | ` boolean ` | No | ` true ` | Convert the sidebar into an SDK-owned mobile overlay below the AppLayout breakpoint. |
| ` sidebarPosition ` | ` 'left' \| 'right' ` | No | ` 'left' ` | Sidebar position in AppLayout. |
| ` sidebarTitle ` | ` string ` | No | ` undefined ` | Optional AppSidebar chrome title for LEAF-style plugin workbenches. |
| ` sidebarSubtitle ` | ` string ` | No | ` undefined ` | Optional AppSidebar chrome subtitle for active experiment/run context. |
| ` sidebarBadge ` | ` string \| number ` | No | ` undefined ` | Optional compact badge/count rendered in the AppSidebar chrome header. |
| ` floating ` | ` boolean ` | No | ` false ` | Floating AppLayout style. |
| ` dense ` | ` boolean ` | No | ` true ` | Compact AppSidebar density. |
| ` showSettings ` | ` boolean ` | No | ` true ` | Whether AppTopBar should show generated settings. |
| ` showFormActions ` | ` boolean ` | No | ` false ` | Render FormBuilder actions in the default content. |
| ` formEnhancements ` | ` FormEnhancements<Record<string, unknown>> ` | No | ` undefined ` | Runtime FormBuilder enhancements passed to generated forms. |
| ` componentBindings ` | ` ControlComponentBindingsConfig ` | No | ` undefined ` | Optional SDK component bindings exposed to the default slot with resolved props. |
| ` componentProps ` | ` ControlComponentPropsMap ` | No | ` undefined ` | Optional mapping from workspace values to component props exposed to the default slot. |
| ` componentPropsById ` | ` ControlComponentPropsByIdMap ` | No | ` undefined ` | Optional named mappings from workspace values to component props exposed to the default slot. |
| ` formLoading ` | ` boolean ` | No | ` false ` | Loading/saving state passed to generated forms. |
| ` formDisabled ` | ` boolean ` | No | ` false ` | Disabled state passed to generated forms. |
| ` formReadonly ` | ` boolean ` | No | ` false ` | Readonly state passed to generated forms. |
| ` formSize ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | FormBuilder size in the default content. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ControlModel `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L173) | See the linked SDK type definition. |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L187) | See the linked SDK type definition. |
| [` UseControlWorkspaceReturn `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L359) | See the linked SDK type definition. |
| [` ControlSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L140) | See the linked SDK type definition. |
| [` ControlWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L155) | See the linked SDK type definition. |
| [` TopBarVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L159) | ` 'card' \| 'default' ` |
| [` ControlWorkspaceSidebarVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ControlWorkspaceView.vue#L30) | See the linked SDK type definition. |
| [` FormEnhancements `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/form-builder.ts#L164) | See the linked SDK type definition. |
| [` ControlComponentBindingsConfig `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L281) | See the linked SDK type definition. |
| [` ControlComponentPropsMap `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L263) | See the linked SDK type definition. |
| [` ControlComponentPropsByIdMap `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L267) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
