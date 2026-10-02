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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ArtifactSelectorModal.vue">Source</a>
</div>

<ComponentPlayground name="ArtifactSelectorModal" />

## Import

```ts
import { ArtifactSelectorModal } from "@morscherlab/mint-sdk/components"
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

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/ArtifactSelectorModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` experimentId ` | ` number \| null ` | No | ` null ` | Experiment id override; defaults to platform injection or URL. |
| ` pluginId ` | ` string \| null ` | No | ` null ` | Scope to a single owning plugin; omit to show all plugins. |
| ` currentArtifactId ` | ` number \| null ` | No | ` null ` | Highlights the currently used artifact. |
| ` includeArchived ` | ` boolean ` | No | ` false ` | Start with archived artifacts visible. |
| ` fetchDetailOnSelect ` | ` boolean ` | No | ` false ` | Fetch the full detail before emitting selectDetail. |
| ` title ` | ` string ` | No | ` 'Select Analysis Artifact' ` | — |
| ` size ` | ` ModalSize ` | No | ` 'full' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L36) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
