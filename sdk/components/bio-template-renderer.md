---
aside: false
title: BioTemplateRenderer
description: "BioTemplateRenderer is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# BioTemplateRenderer

BioTemplateRenderer is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateRenderer.vue">Source</a>
</div>

<ComponentPlayground name="BioTemplateRenderer" />

## Import

```ts
import { BioTemplateRenderer } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BioTemplateRenderer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` target ` | ` BioTemplateEnvelope<unknown> \| TemplateCollectionEnvelope ` | Yes | — | Template envelope or template collection to render. |
| ` include ` | ` string[] ` | No | ` () => [] ` | Optional allow-list of component names, for example ['WellPlate', 'DataFrame']. |
| ` exclude ` | ` string[] ` | No | ` () => [] ` | Optional deny-list of component names. |
| ` dense ` | ` boolean ` | No | ` false ` | Compact child component sizing. |
| ` readonly ` | ` boolean ` | No | ` true ` | Prefer preview-safe props for editable components. |
| ` showHeaders ` | ` boolean ` | No | ` true ` | Show component/template labels above each rendered component. |
| ` showDescriptions ` | ` boolean ` | No | ` true ` | Show binding descriptions in each header. |
| ` emptyText ` | ` string ` | No | ` 'No renderable biology template components.' ` | Message shown when the target has no renderable bindings. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` BioTemplateEnvelope `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/templates/types.ts#L40) | See the linked SDK type definition. |
| [` TemplateCollectionEnvelope `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/templates/types.ts#L50) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
