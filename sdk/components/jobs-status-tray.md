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

::: info Needs the platform
This component shows the jobs that `useJobCenter` tracks. The platform runs these jobs. To see it work, open a plugin with `mint dev --platform`.
:::

## Import

```ts
import { JobsStatusTray } from "@morscherlab/mint-sdk/data"
```

## Example

```vue
<script setup lang="ts">
import { JobsStatusTray, useJobCenter } from "@morscherlab/mint-sdk/data"

const center = useJobCenter()
</script>

<template>
  <JobsStatusTray :center="center" title="Analysis jobs" />
</template>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/JobsStatusTray.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` center ` | ` UseJobCenterReturn ` | Yes | — | Job center from useJobCenter(); the parent owns it and opens the panel through it. |
| ` title ` | ` string ` | No | ` "Jobs" ` | — |
| ` teleportTo ` | ` string \| HTMLElement \| false ` | No | ` "body" ` | — |
| ` confirm ` | ` boolean \| Partial<Record<ConfirmAction, boolean>> ` | No | ` false ` | Ask before Cancel, Delete and Clear (true), or before the named ones only. Default off. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UseJobCenterReturn `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/useJobCenter.ts#L184) | See the linked SDK type definition. |
| [` ConfirmAction `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/JobsStatusTray.vue#L35) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` select ` | ` job: JobState ` | — |
| ` error ` | ` message: string ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` job-actions ` | ` { job: JobState; } ` | Extra per-row actions, rendered before the built-in Cancel / Delete. |
| ` job-title ` | ` { job: JobState; } ` | Row title. Default: the job name. |
| ` job-detail ` | ` { job: JobState; } ` | Detail line under the title. Default: the error, progress message or status. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
