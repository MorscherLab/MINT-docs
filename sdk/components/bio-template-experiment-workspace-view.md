---
aside: false
title: BioTemplateExperimentWorkspaceView
description: "BioTemplateExperimentWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# BioTemplateExperimentWorkspaceView

BioTemplateExperimentWorkspaceView is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue">Source</a>
</div>

<ComponentPlayground name="BioTemplateExperimentWorkspaceView" />

## Import

```ts
import { BioTemplateExperimentWorkspaceView } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` target ` | ` BioTemplateWorkspaceTarget ` | Yes | — | Template envelope or template collection shown in BioTemplateRenderer. |
| ` label ` | ` string ` | Yes | — | Human-readable workspace label. |
| ` status ` | ` TemplateWorkspaceStatus ` | No | ` undefined ` | Grouped request and current-experiment state for generated plugin pages. |
| ` actions ` | ` TemplateWorkspaceActions ` | No | ` undefined ` | Grouped load/reset/save handlers for generated plugin pages. |
| ` message ` | ` string ` | No | ` undefined ` | Copy shown in the status banner. |
| ` loading ` | ` boolean ` | No | ` false ` | Whether the load/save request is active. |
| ` error ` | ` string \| null ` | No | ` null ` | Current request error. |
| ` hasExperiment ` | ` boolean ` | No | ` false ` | Whether a current experiment id is available. |
| ` currentExperimentId ` | ` number ` | No | ` undefined ` | Current experiment id displayed in the footer. |
| ` lastLoadedAt ` | ` Date \| null ` | No | ` null ` | Last successful load timestamp. |
| ` lastSavedAt ` | ` Date \| null ` | No | ` null ` | Last successful save timestamp. |
| ` kind ` | ` WorkspaceKind ` | No | ` 'template' ` | Template vs collection copy defaults. |
| ` dense ` | ` boolean ` | No | ` true ` | Compact preview layout. |
| ` readonly ` | ` boolean ` | No | ` true ` | Render preview components in read-only mode. |
| ` showStatus ` | ` boolean ` | No | ` true ` | Show load/save timestamps. |
| ` showTemplateSummary ` | ` boolean ` | No | ` false ` | Show template id/version cards for collection targets. |
| ` loadLabel ` | ` string ` | No | ` 'Load' ` | — |
| ` resetLabel ` | ` string ` | No | ` 'Reset defaults' ` | — |
| ` saveLabel ` | ` string ` | No | ` 'Save' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` BioTemplateWorkspaceTarget `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue#L27) | See the linked SDK type definition. |
| [` TemplateWorkspaceStatus `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue#L30) | See the linked SDK type definition. |
| [` TemplateWorkspaceActions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue#L40) | See the linked SDK type definition. |
| [` WorkspaceKind `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateExperimentWorkspaceView.vue#L28) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
