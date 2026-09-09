---
aside: false
title: DoseDesignWorkspaceView
description: "DoseDesignWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# DoseDesignWorkspaceView

DoseDesignWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DoseDesignWorkspaceView.vue">Source</a>
</div>

<ComponentPlayground name="DoseDesignWorkspaceView" />

## Import

```ts
import { DoseDesignWorkspaceView } from "@morscherlab/mint-sdk/components"
```

## Sidebar compatibility in 1.2.1

This recipe still declares `sidebarVariant`, but AppSidebar no longer has
visual variants, so the option has no visual effect. For a custom sidebar,
compose a `ControlWorkspaceView` or `PluginWorkspaceView` with a sidebar slot.
The generated table below preserves the SDK's declarations and source comments.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DoseDesignWorkspaceView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` model ` | ` ControlModel \| ControlModelBinding ` | No | ` undefined ` | Model returned by defineDoseDesignControlModel(), or a custom compatible ControlWorkspace model. |
| ` workspace ` | ` UseControlWorkspaceReturn<ControlSchema> ` | No | ` undefined ` | Workspace returned by useControlWorkspace(). Use for full manual control. |
| ` doseDesignOptions ` | ` DoseDesignControlModelOptions ` | No | ` () => ({}) ` | Options used when this view creates the default dose-design model internally. |
| ` controlOptions ` | ` ControlWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to the internally generated ControlWorkspaceView workspace. |
| ` initialValues ` | ` Record<string, unknown> ` | No | ` undefined ` | Initial values for the internally generated workspace. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | External values for the internally generated workspace. Supports default v-model. |
| ` values ` | ` Record<string, unknown> ` | No | ` undefined ` | External values for the internally generated workspace. Supports v-model:values. |
| ` plateId ` | ` string ` | No | ` undefined ` | Named component props id for the generated WellPlate binding. |
| ` doseId ` | ` string ` | No | ` undefined ` | Named component props id for the generated DoseCalculator binding. |
| ` wellPlateProps ` | ` ComponentProps ` | No | ` () => ({}) ` | Extra props merged into the generated WellPlate binding. |
| ` doseCalculatorProps ` | ` ComponentProps ` | No | ` () => ({}) ` | Extra props merged into the generated DoseCalculator binding. |
| ` title ` | ` string ` | No | ` 'Dose Design Workspace' ` | AppTopBar title. |
| ` subtitle ` | ` string ` | No | ` undefined ` | AppTopBar subtitle. |
| ` topBarVariant ` | ` TopBarVariant ` | No | ` 'card' ` | AppTopBar visual variant. |
| ` sidebarWidth ` | ` string ` | No | ` '320px' ` | AppSidebar/AppLayout sidebar width. |
| ` sidebarVariant ` | ` DoseDesignSidebarVariant ` | No | ` 'analysis' ` | AppSidebar visual preset. analysis matches the LEAF-style MINT analysis sidebar design language. |
| ` responsiveSidebar ` | ` boolean ` | No | ` true ` | Convert the sidebar into an SDK-owned mobile overlay below the AppLayout breakpoint. |
| ` sidebarPosition ` | ` 'left' \| 'right' ` | No | ` 'left' ` | Sidebar position in AppLayout. |
| ` sidebarTitle ` | ` string ` | No | ` undefined ` | Optional AppSidebar chrome title for LEAF-style plugin workbenches. |
| ` sidebarSubtitle ` | ` string ` | No | ` undefined ` | Optional AppSidebar chrome subtitle for active experiment/run context. |
| ` sidebarBadge ` | ` string \| number ` | No | ` undefined ` | Optional compact badge/count rendered in the AppSidebar chrome header. |
| ` floating ` | ` boolean ` | No | ` false ` | Floating AppLayout style. |
| ` dense ` | ` boolean ` | No | ` true ` | Compact AppSidebar density. |
| ` showSettings ` | ` boolean ` | No | ` true ` | Whether AppTopBar should show generated settings. |
| ` showFormActions ` | ` boolean ` | No | ` false ` | Render FormBuilder actions in the default generated forms. |
| ` formEnhancements ` | ` FormEnhancements<Record<string, unknown>> ` | No | ` undefined ` | Runtime FormBuilder enhancements passed to generated forms. |
| ` formLoading ` | ` boolean ` | No | ` false ` | Loading/saving state passed to generated forms. |
| ` formDisabled ` | ` boolean ` | No | ` false ` | Disabled state passed to generated forms. |
| ` formReadonly ` | ` boolean ` | No | ` false ` | Readonly state passed to generated forms. |
| ` formSize ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | FormBuilder size in generated forms. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ControlModel `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L173) | See the linked SDK type definition. |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L187) | See the linked SDK type definition. |
| [` UseControlWorkspaceReturn `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L359) | See the linked SDK type definition. |
| [` ControlSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L140) | See the linked SDK type definition. |
| [` DoseDesignControlModelOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L323) | See the linked SDK type definition. |
| [` ControlWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L155) | See the linked SDK type definition. |
| [` ComponentProps `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DoseDesignWorkspaceView.vue#L28) | See the linked SDK type definition. |
| [` TopBarVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L182) | ` 'card' \| 'default' ` |
| [` DoseDesignSidebarVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DoseDesignWorkspaceView.vue#L27) | See the linked SDK type definition. |
| [` FormEnhancements `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/form-builder.ts#L166) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
