<script setup lang="ts">
import { ref } from 'vue'
import { BaseSlider } from '@morscherlab/mint-sdk'

const sliderValue = ref(72)
</script>

<template>
  <BaseSlider v-model="sliderValue" :min="0" :max="100" show-value />
</template>
