<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@morscherlab/mint-sdk'
import type { CalendarMarker } from '@morscherlab/mint-sdk'

const calendarValue = ref(new Date(2026, 4, 29))
const calendarMarkers: CalendarMarker[] = [
  { date: '2026-05-28', color: '#0ea5e9', label: 'LC-MS run', type: 'dot' },
  { date: '2026-05-29', color: '#f97316', label: 'Review due', type: 'highlight' },
  { date: '2026-05-31', color: '#22c55e', label: 'Export ready', type: 'bar' },
]
</script>

<template>
  <Calendar v-model="calendarValue" :month="4" :year="2026" :markers="calendarMarkers" />
</template>
