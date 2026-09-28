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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/JobsStatusTray.vue">Source</a>
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

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/JobsStatusTray.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` source ` | ` PluginJobCenterSource ` | No | ` undefined ` | — |
| ` jobs ` | ` readonly JobStateInput[] ` | No | ` undefined ` | @deprecated Pass a source instead. |
| ` adapter ` | ` JobsStatusTrayAdapter ` | No | ` undefined ` | @deprecated Pass source actions instead. |
| ` eventStream ` | ` UsePluginEventStreamReturn<JobStreamData> ` | No | ` undefined ` | @deprecated Event streams belong to the source runtime. |
| ` loadOnMount ` | ` boolean ` | No | ` true ` | — |
| ` title ` | ` string ` | No | ` 'Analysis jobs' ` | — |
| ` teleportTo ` | ` string \| HTMLElement \| false ` | No | ` 'body' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginJobCenterSource `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/composables/useJobsStatusTray.ts#L35) | See the linked SDK type definition. |
| [` JobStateInput `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/jobs.ts#L51) | See the linked SDK type definition. |
| [` JobsStatusTrayAdapter `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/composables/useJobsStatusTray.ts#L150) | See the linked SDK type definition. |
| [` UsePluginEventStreamReturn `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/composables/usePluginClient.ts#L234) | See the linked SDK type definition. |
| [` JobStreamData `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/jobs.ts#L70) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
