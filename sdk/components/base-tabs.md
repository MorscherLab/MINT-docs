---
aside: false
title: BaseTabs
description: "BaseTabs is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseTabs

BaseTabs is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseTabs.vue">Source</a>
</div>

<ComponentPlayground name="BaseTabs" />

## Import

```ts
import { BaseTabs } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseTabs.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | Yes | — | — |
| ` tabs ` | ` TabItemInput[] ` | Yes | — | — |
| ` variant ` | ` 'underline' \| 'pills' ` | No | ` 'underline' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TabItemInput `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L73) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
