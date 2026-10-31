---
aside: false
title: RuntimeUpdateNotice
description: "Fixed-position notice offering a reload when a newer plugin or platform build is ready."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# RuntimeUpdateNotice

Fixed-position notice offering a reload when a newer plugin or platform build is ready.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/RuntimeUpdateNotice.vue">Source</a>
</div>

<demo vue="./demos/RuntimeUpdateNotice.vue" title="RuntimeUpdateNotice" description="The notice for a new plugin version. Show or hide it and click Reload now to count reload requests." />

## Import

```ts
import { RuntimeUpdateNotice } from "@morscherlab/mint-sdk/runtime"
```

## Basic Usage

```vue
<RuntimeUpdateNotice :visible="updateAvailable" @reload="reloadApp" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/RuntimeUpdateNotice.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` visible ` | ` boolean ` | Yes | — | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` reload ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
