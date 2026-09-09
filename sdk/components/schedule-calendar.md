---
aside: false
title: ScheduleCalendar
description: "ScheduleCalendar is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ScheduleCalendar

ScheduleCalendar is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ScheduleCalendar.vue">Source</a>
</div>

<ComponentPlayground name="ScheduleCalendar" />

## Import

```ts
import { ScheduleCalendar } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ScheduleCalendar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Date \| string ` | No | ` undefined ` | — |
| ` view ` | ` ScheduleView ` | No | ` 'week' ` | — |
| ` events ` | ` ScheduleEvent[] ` | No | ` () => [] ` | — |
| ` dayStartHour ` | ` number ` | No | ` 6 ` | — |
| ` dayEndHour ` | ` number ` | No | ` 22 ` | — |
| ` slotDuration ` | ` number ` | No | ` 30 ` | — |
| ` showNowIndicator ` | ` boolean ` | No | ` true ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` blockedSlots ` | ` ScheduleBlockedSlot[] ` | No | ` () => [] ` | — |
| ` weekStartsOn ` | ` 0 \| 1 ` | No | ` 1 ` | — |
| ` showViewToggle ` | ` boolean ` | No | ` true ` | — |
| ` showNavigation ` | ` boolean ` | No | ` true ` | — |
| ` statusColors ` | ` Record<string, string> ` | No | ` undefined ` | — |
| ` locale ` | ` string ` | No | ` 'en-US' ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the calendar grid with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the calendar grid is replaced by an error state. null/undefined renders normally. |
| ` emptyMessage ` | ` string ` | No | ` undefined ` | Opt-in empty-state headline. An empty grid is meaningful on a calendar, so the empty state only replaces it when this message is supplied and there are no events. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ScheduleView `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L68) | ` 'day' \| 'week' \| 'month' ` |
| [` ScheduleEvent `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L71) | See the linked SDK type definition. |
| [` ScheduleBlockedSlot `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L83) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
