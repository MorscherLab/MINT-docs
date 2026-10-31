---
aside: false
title: Calendar
description: "Calendar is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# Calendar

Calendar is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Calendar.vue">Source</a>
</div>

<demo vue="./demos/Calendar.vue" title="Calendar" description="Month calendar with three dated markers. Click a day to change the model value." />

## Import

```ts
import { Calendar } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Calendar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Date \| Date[] \| { start: Date; end: Date } \| null ` | No | ` undefined ` | Selected date(s) - type depends on selectionMode |
| ` selectionMode ` | ` CalendarSelectionMode ` | No | ` "single" ` | Selection behavior mode |
| ` month ` | ` number ` | No | ` undefined ` | Display month (0-11) |
| ` year ` | ` number ` | No | ` undefined ` | Display year |
| ` fixedWeeks ` | ` boolean ` | No | ` true ` | Always show 6 weeks (42 days) |
| ` weekStartsOn ` | ` 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 ` | No | ` 1 ` | First day of week (0=Sunday, 1=Monday, etc.) |
| ` showOutsideDays ` | ` boolean ` | No | ` true ` | Show days from adjacent months |
| ` showNavigation ` | ` boolean ` | No | ` true ` | Show month navigation buttons |
| ` markers ` | ` CalendarMarker[] ` | No | ` [] ` | Visual markers on specific dates |
| ` minDate ` | ` Date \| string ` | No | ` undefined ` | Earliest selectable date |
| ` maxDate ` | ` Date \| string ` | No | ` undefined ` | Latest selectable date |
| ` disabledDates ` | ` Array<Date \| string> ` | No | ` [] ` | Explicitly disabled dates |
| ` isDateDisabled ` | ` (date: Date) => boolean ` | No | ` undefined ` | Custom disabled date logic |
| ` locale ` | ` string ` | No | ` "en-US" ` | Locale for date formatting |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` CalendarSelectionMode `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L384) | ` 'none' \| 'single' \| 'range' \| 'multiple' ` |
| [` CalendarMarker `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L387) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` navigate ` | ` direction: "prev" \| "next", month: number, year: number ` | — |
| ` update:modelValue ` | ` value: Date \| Date[] \| { start: Date; end: Date; } \| null ` | — |
| ` update:month ` | ` month: number ` | — |
| ` update:year ` | ` year: number ` | — |
| ` day-click ` | ` context: CalendarDayContext ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` header ` | ` { month: number; year: number; prevMonth: () => void; nextMonth: () => void; } ` | — |
| ` week-day ` | ` { dayName: string; index: number; } ` | — |
| ` day-content ` | ` { day: CalendarDayContext; } ` | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
