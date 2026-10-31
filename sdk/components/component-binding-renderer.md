---
aside: false
title: ComponentBindingRenderer
description: "ComponentBindingRenderer is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ComponentBindingRenderer

ComponentBindingRenderer is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ComponentBindingRenderer.vue">Source</a>
</div>

<demo vue="./demos/ComponentBindingRenderer.vue" title="ComponentBindingRenderer" description="Read-only renderer that builds a table and a well plate from binding data." />

## Import

```ts
import { ComponentBindingRenderer } from "@morscherlab/mint-sdk/runtime"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ComponentBindingRenderer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` binding ` | ` ComponentBindingRendererBinding ` | No | ` undefined ` | Single generated SDK component binding to render. |
| ` bindings ` | ` ComponentBindingRendererBinding[] ` | No | ` [] ` | Generated SDK component bindings to render. |
| ` include ` | ` string[] ` | No | ` [] ` | Optional allow-list of component names, for example ['WellPlate', 'DataFrame']. |
| ` exclude ` | ` string[] ` | No | ` [] ` | Optional deny-list of component names. |
| ` dense ` | ` boolean ` | No | ` false ` | Compact child component sizing. |
| ` readonly ` | ` boolean ` | No | ` true ` | Prefer preview-safe props for editable components. |
| ` showHeaders ` | ` boolean ` | No | ` true ` | Show component labels above each rendered component. |
| ` showDescriptions ` | ` boolean ` | No | ` true ` | Show binding descriptions in each header. |
| ` layout ` | ` ComponentBindingRendererLayout ` | No | ` "grid" ` | Grid or vertical stack layout. |
| ` emptyText ` | ` string ` | No | ` "No renderable SDK component bindings." ` | Message shown when no binding can be rendered. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ComponentBindingRendererBinding `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ComponentBindingRenderer.vue#L18) | See the linked SDK type definition. |
| [` ComponentBindingRendererLayout `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ComponentBindingRenderer.vue#L26) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
