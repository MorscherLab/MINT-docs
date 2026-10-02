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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ArtifactSaveDialog.vue">Source</a>
</div>

<ComponentPlayground name="ArtifactSaveDialog" />

## Import

```ts
import { ArtifactSaveDialog } from "@morscherlab/mint-sdk/components"
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

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ArtifactSaveDialog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` saveHandler ` | ` ArtifactSaveDialogHandler ` | Yes | — | Performs the backend write; the dialog never calls the platform itself. |
| ` mode ` | ` 'json' \| 'file' \| 'both' ` | No | ` 'file' ` | Which artifact kinds the form offers. |
| ` fileSource ` | ` ArtifactFileSource ` | No | ` 'upload' ` | Use handler when the plugin backend serializes the file content itself. |
| ` result ` | ` Record<string, unknown> ` | No | ` undefined ` | JSON result payload supplied programmatically by the host. |
| ` experimentId ` | ` number \| null ` | No | ` null ` | Experiment id override; defaults to platform injection or URL. |
| ` existingArtifact ` | ` AnalysisArtifactDetail \| null ` | No | ` null ` | Existing artifact detail; when set the dialog updates instead of creating. |
| ` existingArtifactKeys ` | ` string[] ` | No | ` undefined ` | Known artifact keys, used to warn (json) or block (file) on collisions. |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` ModalSize ` | No | ` 'md' ` | — |
| ` defaultArtifactKey ` | ` string ` | No | ` 'default' ` | — |
| ` defaultDisplayName ` | ` string ` | No | ` undefined ` | — |
| ` defaultFileKind ` | ` string ` | No | ` 'file' ` | Maps to the Python kind= argument for new file artifacts. |
| ` accept ` | ` string ` | No | ` undefined ` | Forwarded to the file uploader. |
| ` maxFileSize ` | ` number ` | No | ` undefined ` | Forwarded to the file uploader (bytes). |
| ` metadata ` | ` Record<string, unknown> ` | No | ` undefined ` | Result metadata for file artifacts. Backend-side this REPLACES the previous metadata; on replacement the existing artifact's metadata is carried through unless this prop supplies a new map. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ArtifactSaveDialogHandler `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L176) | See the linked SDK type definition. |
| [` ArtifactFileSource `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L61) | ` 'upload' \| 'handler' ` |
| [` AnalysisArtifactDetail `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/analysisArtifactTypes.ts#L30) | See the linked SDK type definition. |
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L36) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
