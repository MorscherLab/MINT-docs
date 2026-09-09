---
aside: false
title: BioTemplatePresetWorkspaceView
description: "BioTemplatePresetWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# BioTemplatePresetWorkspaceView

BioTemplatePresetWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BioTemplatePresetWorkspaceView.vue">Source</a>
</div>

<ComponentPlayground name="BioTemplatePresetWorkspaceView" />

## Import

```ts
import { BioTemplatePresetWorkspaceView } from "@morscherlab/mint-sdk/components"
```

## Sidebar compatibility in 1.2.1

This recipe still declares `sidebarVariant`, but AppSidebar no longer has
visual variants, so the option has no visual effect. For a custom sidebar,
compose a `ControlWorkspaceView` or `PluginWorkspaceView` with a sidebar slot.
The generated table below preserves the SDK's declarations and source comments.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BioTemplatePresetWorkspaceView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` workspace ` | ` UseBioTemplatePresetWorkspaceReturn ` | No | ` undefined ` | Workspace returned by useBioTemplatePresetWorkspace(). Use for full manual control. |
| ` preset ` | ` TemplatePresetId ` | No | ` 'wellplate-screen' ` | Built-in preset id used to create the workspace when workspace is not provided. |
| ` workspaceOptions ` | ` UseBioTemplatePresetWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to the internally generated useBioTemplatePresetWorkspace() call. |
| ` initialValues ` | ` BioTemplateControlValues ` | No | ` undefined ` | Initial control values for the internally generated preset workspace. |
| ` modelValue ` | ` BioTemplateControlValues ` | No | ` undefined ` | External control values for the internally generated preset workspace. Supports default v-model. |
| ` values ` | ` BioTemplateControlValues ` | No | ` undefined ` | External control values for the internally generated preset workspace. Supports v-model:values. |
| ` label ` | ` string ` | No | ` undefined ` | Label shown in the status banner. Defaults to the humanized preset id. |
| ` sidebarWidth ` | ` string ` | No | ` '320px' ` | Sidebar CSS width. |
| ` sidebarVariant ` | ` BioTemplatePresetSidebarVariant ` | No | ` 'analysis' ` | AppSidebar visual preset. analysis matches the LEAF-style MINT analysis sidebar design language. |
| ` dense ` | ` boolean ` | No | ` true ` | Compact sidebar and preview layout. |
| ` readonly ` | ` boolean ` | No | ` true ` | Render preview components in read-only mode. |
| ` showStatus ` | ` boolean ` | No | ` true ` | Show save timestamp. |
| ` showTemplateSummary ` | ` boolean ` | No | ` true ` | Show cards for templates included in the preset collection. |
| ` showComponentSummary ` | ` boolean ` | No | ` false ` | Show component binding count. |
| ` saveLabel ` | ` string ` | No | ` 'Save' ` | — |
| ` resetLabel ` | ` string ` | No | ` 'Reset defaults' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UseBioTemplatePresetWorkspaceReturn `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/useBioTemplatePresetWorkspace.ts#L61) | See the linked SDK type definition. |
| [` TemplatePresetId `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/templates/types.ts#L25) | See the linked SDK type definition. |
| [` UseBioTemplatePresetWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/useBioTemplatePresetWorkspace.ts#L54) | See the linked SDK type definition. |
| [` BioTemplateControlValues `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/templates/builderPresetControls.ts#L25) | See the linked SDK type definition. |
| [` BioTemplatePresetSidebarVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BioTemplatePresetWorkspaceView.vue#L24) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
