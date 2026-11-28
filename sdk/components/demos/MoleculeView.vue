<script setup lang="ts">
import { MoleculeView } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <div class="mint-live-row">
    <MoleculeView smiles="OC(=O)CC(O)(CC(O)=O)C(O)=O" variant="tile" :height="180" />
    <MoleculeView smiles="CC(=O)OC1=CC=CC=C1C(=O)O" :height="140" show-smiles />
  </div>
</template>
