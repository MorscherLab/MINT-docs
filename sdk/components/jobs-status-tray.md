---
aside: false
title: JobsStatusTray
description: "Floating, source-driven job status tray for plugin and platform workflows."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# JobsStatusTray

Floating, source-driven job status tray for plugin and platform workflows.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/JobsStatusTray.vue">Source</a>
</div>

<ComponentPlayground name="JobsStatusTray" />

## Import

```ts
import { JobsStatusTray } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<JobsStatusTray :source="jobs" title="Analysis jobs" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/JobsStatusTray.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` center ` | ` UseJobCenterReturn ` | Yes | — | Job center from useJobCenter(); the parent owns it and opens the panel through it. |
| ` title ` | ` string ` | No | ` 'Jobs' ` | — |
| ` teleportTo ` | ` string \| HTMLElement \| false ` | No | ` 'body' ` | — |
| ` confirm ` | ` boolean \| Partial<Record<ConfirmAction, boolean>> ` | No | ` false ` | Ask before Cancel, Delete and Clear (true), or before the named ones only. Default off. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UseJobCenterReturn `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/useJobCenter.ts#L184) | See the linked SDK type definition. |
| [` ConfirmAction `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/JobsStatusTray.vue#L35) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
