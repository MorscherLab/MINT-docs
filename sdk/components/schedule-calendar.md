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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ScheduleCalendar.vue">Source</a>
</div>

<demo vue="./demos/ScheduleCalendar.vue" title="ScheduleCalendar" description="Read-only day view of instrument runs and a blocked maintenance slot. Check the booked and blocked times." />

## Import

```ts
import { ScheduleCalendar } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ScheduleCalendar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Date \| string ` | No | ` undefined ` | — |
| ` view ` | ` ScheduleView ` | No | ` "week" ` | — |
| ` events ` | ` ScheduleEvent[] ` | No | ` [] ` | — |
| ` dayStartHour ` | ` number ` | No | ` 6 ` | — |
| ` dayEndHour ` | ` number ` | No | ` 22 ` | — |
| ` slotDuration ` | ` number ` | No | ` 30 ` | — |
| ` showNowIndicator ` | ` boolean ` | No | ` true ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` blockedSlots ` | ` ScheduleBlockedSlot[] ` | No | ` [] ` | — |
| ` weekStartsOn ` | ` 0 \| 1 ` | No | ` 1 ` | — |
| ` showViewToggle ` | ` boolean ` | No | ` true ` | — |
| ` showNavigation ` | ` boolean ` | No | ` true ` | — |
| ` statusColors ` | ` Record<string, string> ` | No | ` undefined ` | — |
| ` locale ` | ` string ` | No | ` "en-US" ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the calendar grid with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the calendar grid is replaced by an error state. null/undefined renders normally. |
| ` emptyText ` | ` string ` | No | ` undefined ` | Opt-in empty-state headline. An empty grid is meaningful on a calendar, so the empty state only replaces it when this message is supplied and there are no events. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ScheduleView `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L74) | ` 'day' \| 'week' \| 'month' ` |
| [` ScheduleEvent `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L77) | See the linked SDK type definition. |
| [` ScheduleBlockedSlot `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L89) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:view ` | ` value: ScheduleView ` | — |
| ` navigate ` | ` context: { direction: string; date: Date; } ` | — |
| ` update:modelValue ` | ` value: Date ` | — |
| ` event-click ` | ` event: ScheduleEvent ` | — |
| ` event-create ` | ` context: { start: Date; end: Date; } ` | — |
| ` event-update ` | ` context: { event: ScheduleEvent; newStart: Date; newEnd: Date; } ` | — |
| ` slot-click ` | ` context: { date: Date; hour: number; minute: number; } ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` error ` | ` { error: string; } ` | — |
| ` loading ` | — | — |
| ` empty ` | — | — |
| ` day-header ` | ` { date: Date; isToday: boolean; } ` | — |
| ` time-label ` | ` { label: string; index: number; } ` | — |
| ` event ` | ` { event: ScheduleEvent; } ` | — |
| ` month-day ` | ` { date: Date; isToday: boolean; events: ScheduleEvent[]; } ` | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
