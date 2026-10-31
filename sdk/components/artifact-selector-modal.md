---
aside: false
title: ArtifactSelectorModal
description: "Modal for browsing and selecting an analysis artifact of an experiment, with filters and keyboard navigation."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ArtifactSelectorModal

Modal for browsing and selecting an analysis artifact of an experiment, with filters and keyboard navigation.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ArtifactSelectorModal.vue">Source</a>
</div>

::: info Needs the platform
This component lists artifacts with `useArtifacts` and reads the current experiment from `useExperimentStore`. To see it work, open a plugin with `mint dev --platform`.
:::

## Import

```ts
import { ArtifactSelectorModal } from "@morscherlab/mint-sdk/data"
```

## Basic Usage

```vue
<ArtifactSelectorModal
  v-model="open"
  :experiment-id="experimentId"
  @select="selectArtifact"
/>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ArtifactSelectorModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` experimentId ` | ` number \| null ` | No | ` null ` | Experiment id override; defaults to the current experiment (useExperimentStore). |
| ` pluginId ` | ` string \| null ` | No | ` null ` | Scope to a single owning plugin; omit to show all plugins. |
| ` currentArtifactId ` | ` number \| null ` | No | ` null ` | Highlights the currently used artifact. |
| ` includeArchived ` | ` boolean ` | No | ` false ` | Start with archived artifacts visible. |
| ` fetchDetailOnSelect ` | ` boolean ` | No | ` false ` | Fetch the full detail before emitting selectDetail. |
| ` title ` | ` string ` | No | ` "Select Analysis Artifact" ` | — |
| ` size ` | ` ModalSize ` | No | ` "full" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L39) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` select ` | ` artifact: AnalysisArtifactSummary ` | — |
| ` update:open ` | ` value: boolean ` | — |
| ` selectDetail ` | ` detail: AnalysisArtifactDetail ` | — |
| ` archive ` | ` artifact: AnalysisArtifactSummary ` | — |
| ` restore ` | ` artifact: AnalysisArtifactSummary ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
