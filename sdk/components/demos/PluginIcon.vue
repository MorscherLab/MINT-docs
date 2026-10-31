<script setup lang="ts">
import { PluginIcon } from '@morscherlab/mint-sdk'

const pluginIconPath = 'M13 10V3L4 14h7v7l9-11h-7z'
</script>

<template>
  <div class="mint-live-row">
    <PluginIcon :icon="pluginIconPath" size="sm" />
    <PluginIcon :icon="pluginIconPath" size="md" variant="tinted" />
    <PluginIcon :icon="pluginIconPath" size="lg" variant="solid" />
  </div>
</template>
