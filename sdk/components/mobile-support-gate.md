---
aside: false
title: MobileSupportGate
description: "Gates a workspace behind a minimum viewport width, showing a desktop-required message on narrow screens."
---

<p class="mint-component-library__eyebrow">Layout</p>

# MobileSupportGate

Gates a workspace behind a minimum viewport width, showing a desktop-required message on narrow screens.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/MobileSupportGate.vue">Source</a>
</div>

<ComponentPlayground name="MobileSupportGate" />

## Import

```ts
import { MobileSupportGate } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<MobileSupportGate app-name="Dose Response">
  <PluginWorkspaceView title="Dose Response" :panels="panels" />
</MobileSupportGate>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/MobileSupportGate.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` supported ` | ` boolean ` | No | ` true ` | — |
| ` mediaQuery ` | ` string ` | No | ` DEFAULT_MOBILE_VIEWPORT_QUERY ` | — |
| ` appName ` | ` string ` | No | ` 'MINT' ` | — |
| ` title ` | ` string ` | No | ` 'Desktop workspace recommended' ` | — |
| ` message ` | ` string ` | No | ` 'This workspace is optimized for a wider desktop screen and is not supported on mobile.' ` | — |
| ` desktopLabel ` | ` string ` | No | ` 'Open this page from a desktop browser to use the full workflow.' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
