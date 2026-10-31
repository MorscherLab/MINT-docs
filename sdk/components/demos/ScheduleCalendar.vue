<script setup lang="ts">
import { ScheduleCalendar } from '@morscherlab/mint-sdk/lab'
import type { ScheduleEvent } from '@morscherlab/mint-sdk'

const scheduleEvents: ScheduleEvent[] = [
  {
    id: 'schedule-1',
    title: 'LC-MS run',
    start: '2026-05-29T09:00:00',
    end: '2026-05-29T11:30:00',
    status: 'confirmed',
    color: '#0ea5e9',
    draggable: false,
    resizable: false,
  },
  {
    id: 'schedule-2',
    title: 'QC review',
    start: '2026-05-29T13:00:00',
    end: '2026-05-29T14:00:00',
    status: 'pending',
    color: '#f97316',
    draggable: false,
    resizable: false,
  },
]

const scheduleBlockedSlots = [
  { start: '2026-05-29T12:00:00', end: '2026-05-29T13:00:00', label: 'Instrument maintenance' },
]
</script>

<template>
  <div class="mint-schedule-demo">
    <ScheduleCalendar
      model-value="2026-05-29"
      view="day"
      :events="scheduleEvents"
      :blocked-slots="scheduleBlockedSlots"
      :day-start-hour="8"
      :day-end-hour="18"
      :slot-duration="60"
      :show-view-toggle="false"
      :show-now-indicator="false"
      readonly
    />
  </div>
</template>
