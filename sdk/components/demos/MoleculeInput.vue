<script setup lang="ts">
import { ref } from 'vue'
import { MoleculeInput } from '@morscherlab/mint-sdk/lab'

const moleculeValue = ref({
  smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
  molfile: '',
})
</script>

<template>
  <MoleculeInput v-model="moleculeValue" readonly :height="180" />
</template>
