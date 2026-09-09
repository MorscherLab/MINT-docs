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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Calendar.vue">Source</a>
</div>

<ComponentPlayground name="Calendar" />

## Import

```ts
import { Calendar } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Calendar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Date \| Date[] \| { start: Date; end: Date } \| null ` | No | ` undefined ` | Selected date(s) - type depends on selectionMode |
| ` selectionMode ` | ` CalendarSelectionMode ` | No | ` 'single' ` | Selection behavior mode |
| ` month ` | ` number ` | No | ` undefined ` | Display month (0-11) |
| ` year ` | ` number ` | No | ` undefined ` | Display year |
| ` fixedWeeks ` | ` boolean ` | No | ` true ` | Always show 6 weeks (42 days) |
| ` weekStartsOn ` | ` 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 ` | No | ` 1 ` | First day of week (0=Sunday, 1=Monday, etc.) |
| ` showOutsideDays ` | ` boolean ` | No | ` true ` | Show days from adjacent months |
| ` showNavigation ` | ` boolean ` | No | ` true ` | Show month navigation buttons |
| ` markers ` | ` CalendarMarker[] ` | No | ` () => [] ` | Visual markers on specific dates |
| ` minDate ` | ` Date \| string ` | No | ` undefined ` | Earliest selectable date |
| ` maxDate ` | ` Date \| string ` | No | ` undefined ` | Latest selectable date |
| ` disabledDates ` | ` Array<Date \| string> ` | No | ` () => [] ` | Explicitly disabled dates |
| ` isDateDisabled ` | ` (date: Date) => boolean ` | No | ` undefined ` | Custom disabled date logic |
| ` locale ` | ` string ` | No | ` 'en-US' ` | Locale for date formatting |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` CalendarSelectionMode `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L329) | ` 'none' \| 'single' \| 'range' \| 'multiple' ` |
| [` CalendarMarker `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L332) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
