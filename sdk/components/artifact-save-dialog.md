---
aside: false
title: ArtifactSaveDialog
description: "Save/update dialog for analysis artifacts; delegates the write to a plugin-supplied handler."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ArtifactSaveDialog

Save/update dialog for analysis artifacts; delegates the write to a plugin-supplied handler.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ArtifactSaveDialog.vue">Source</a>
</div>

::: info Needs the platform
This component reads the current experiment from `useExperimentStore`. The `saveHandler` writes to the platform. To see it work, open a plugin with `mint dev --platform`.
:::

## Import

```ts
import { ArtifactSaveDialog } from "@morscherlab/mint-sdk/data"
```

## Basic Usage

```vue
<ArtifactSaveDialog
  v-model="open"
  :save-handler="saveArtifact"
  mode="json"
  :result="results"
  default-artifact-key="dose-response.summary"
  @saved="handleSaved"
  @error="handleError"
/>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ArtifactSaveDialog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` saveHandler ` | ` ArtifactSaveDialogHandler ` | Yes | — | Performs the backend write; the dialog never calls the platform itself. |
| ` mode ` | ` 'json' \| 'file' \| 'both' ` | No | ` "file" ` | Which artifact kinds the form offers. |
| ` fileSource ` | ` ArtifactFileSource ` | No | ` "upload" ` | Use handler when the plugin backend serializes the file content itself. |
| ` result ` | ` Record<string, unknown> ` | No | ` undefined ` | JSON result payload supplied programmatically by the host. |
| ` experimentId ` | ` number \| null ` | No | ` null ` | Experiment id override; defaults to the current experiment (useExperimentStore). |
| ` experiment ` | ` ExperimentSummary \| null ` | No | ` null ` | Experiment shown in the strip at the top. Defaults to the store's current experiment when it is the one being saved to; no strip when unknown. |
| ` existingArtifact ` | ` AnalysisArtifactDetail \| null ` | No | ` null ` | Existing artifact detail; when set the dialog updates instead of creating. |
| ` existingArtifactKeys ` | ` string[] ` | No | ` undefined ` | Known artifact keys, used to warn (json) or block (file) on collisions. |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` ModalSize ` | No | ` "md" ` | — |
| ` defaultArtifactKey ` | ` string ` | No | ` "default" ` | — |
| ` defaultDisplayName ` | ` string ` | No | ` undefined ` | — |
| ` defaultFileKind ` | ` string ` | No | ` "file" ` | Maps to the Python kind= argument for new file artifacts. |
| ` accept ` | ` string ` | No | ` undefined ` | Forwarded to the file uploader. |
| ` maxFileSize ` | ` number ` | No | ` undefined ` | Forwarded to the file uploader (bytes). |
| ` metadata ` | ` Record<string, unknown> ` | No | ` undefined ` | Result metadata for file artifacts. Backend-side this REPLACES the previous metadata; on replacement the existing artifact's metadata is carried through unless this prop supplies a new map. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ArtifactSaveDialogHandler `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L176) | See the linked SDK type definition. |
| [` ArtifactFileSource `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L61) | ` 'upload' \| 'handler' ` |
| [` ExperimentSummary `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L158) | See the linked SDK type definition. |
| [` AnalysisArtifactDetail `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L30) | See the linked SDK type definition. |
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L39) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` error ` | ` message: string ` | — |
| ` update:open ` | ` value: boolean ` | — |
| ` cancel ` | — | — |
| ` saved ` | ` result: ArtifactSaveResult & { payload: ArtifactSaveDialogPayload; } ` | — |
| ` change-experiment ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
