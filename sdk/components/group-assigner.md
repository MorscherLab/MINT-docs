---
aside: false
title: GroupAssigner
description: "GroupAssigner is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# GroupAssigner

GroupAssigner is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/GroupAssigner.vue">Source</a>
</div>

<ComponentPlayground name="GroupAssigner" />

## Import

```ts
import { GroupAssigner } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/GroupAssigner.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` groups ` | ` GroupItem[] ` | Yes | — | — |
| ` group1 ` | ` string[] ` | Yes | — | — |
| ` group2 ` | ` string[] ` | Yes | — | — |
| ` label1 ` | ` string ` | No | ` 'Control' ` | — |
| ` label2 ` | ` string ` | No | ` 'Treatment' ` | — |
| ` color1 ` | ` string ` | No | ` '#3B82F6' ` | — |
| ` color2 ` | ` string ` | No | ` '#F43F5E' ` | — |
| ` minPerGroup ` | ` number ` | No | ` 1 ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` GroupItem `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L169) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
