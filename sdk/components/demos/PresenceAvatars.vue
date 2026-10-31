<script setup lang="ts">
import { PresenceAvatars } from '@morscherlab/mint-sdk/runtime'

const people = [
  { id: 'u1', name: 'Mara Keller', activity: 'viewing' as const },
  { id: 'u2', name: 'Jonas Weiss', activity: 'editing' as const },
  { id: 'u3', name: 'Lena Fischer', activity: 'viewing_results' as const },
  { id: 'u4', name: 'Tom Brandt', activity: 'viewing_design' as const },
  { id: 'u5', name: 'Aiko Tanaka', activity: 'viewing' as const },
  { id: 'u6', name: 'Priya Nair', activity: 'viewing' as const },
]
</script>

<template>
  <div class="mint-live-row">
    <PresenceAvatars :people="people" self-id="u1" :max="3" />
  </div>
  <p class="mint-live-caption">Click the avatars to list each person and activity.</p>
</template>
