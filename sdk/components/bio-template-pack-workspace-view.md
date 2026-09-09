---
aside: false
title: BioTemplatePackWorkspaceView
description: "BioTemplatePackWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# BioTemplatePackWorkspaceView

BioTemplatePackWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplatePackWorkspaceView.vue">Source</a>
</div>

<ComponentPlayground name="BioTemplatePackWorkspaceView" />

## Import

```ts
import { BioTemplatePackWorkspaceView } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplatePackWorkspaceView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` workspace ` | ` UseBioTemplatePackWorkspaceReturn ` | No | ` undefined ` | Workspace returned by useBioTemplatePackWorkspace(). Use for full manual control. |
| ` pack ` | ` TemplatePackId \| string ` | No | ` 'cell-culture-screen' ` | Built-in template pack id or alias used when workspace is not provided. |
| ` workspaceOptions ` | ` UseBioTemplatePackWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to the internally generated useBioTemplatePackWorkspace() call. |
| ` status ` | ` PackWorkspaceStatus ` | No | ` undefined ` | External request state when plugin endpoints handle pack persistence. |
| ` actions ` | ` PackWorkspaceActions ` | No | ` undefined ` | External load/reset/save handlers when plugin endpoints handle pack persistence. |
| ` label ` | ` string ` | No | ` undefined ` | Human-readable workspace label. Defaults to the pack catalog label. |
| ` message ` | ` string ` | No | ` undefined ` | Copy shown in the status banner. |
| ` dense ` | ` boolean ` | No | ` true ` | Compact preview layout. |
| ` readonly ` | ` boolean ` | No | ` true ` | Render preview components in read-only mode. |
| ` showStatus ` | ` boolean ` | No | ` true ` | Show load/save timestamps. |
| ` showTemplateSummary ` | ` boolean ` | No | ` true ` | Show template id/version cards for the generated collection. |
| ` loadLabel ` | ` string ` | No | ` 'Load' ` | — |
| ` resetLabel ` | ` string ` | No | ` 'Reset defaults' ` | — |
| ` saveLabel ` | ` string ` | No | ` 'Save' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UseBioTemplatePackWorkspaceReturn `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/useBioTemplatePackWorkspace.ts#L46) | See the linked SDK type definition. |
| [` TemplatePackId `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/templates/types.ts#L34) | See the linked SDK type definition. |
| [` UseBioTemplatePackWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/useBioTemplatePackWorkspace.ts#L44) | See the linked SDK type definition. |
| [` PackWorkspaceStatus `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplatePackWorkspaceView.vue#L37) | See the linked SDK type definition. |
| [` PackWorkspaceActions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplatePackWorkspaceView.vue#L47) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
