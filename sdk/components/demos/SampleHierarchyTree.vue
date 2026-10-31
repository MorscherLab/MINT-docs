<script setup lang="ts">
import { SampleHierarchyTree } from '@morscherlab/mint-sdk/lab'
import type { TreeNode } from '@morscherlab/mint-sdk'

const sampleTreeNodes: TreeNode[] = [
  {
    id: 'study-dose',
    label: 'Dose Response Study',
    type: 'study',
    badge: 2,
    children: [
      {
        id: 'exp-mint-042',
        label: 'MINT-EXP-2026-0042',
        type: 'experiment',
        badge: 'active',
        badgeVariant: 'success',
        children: [
          {
            id: 'plate-a',
            label: 'Plate A',
            type: 'plate',
            children: [
              { id: 'sample-vehicle-a1', label: 'Vehicle_A1', type: 'sample', badge: 'control' },
              { id: 'sample-drug-a1', label: 'Drug_A1', type: 'sample', badge: 'treated', badgeVariant: 'warning' },
            ],
          },
        ],
      },
    ],
  },
]
</script>

<template>
  <SampleHierarchyTree :nodes="sampleTreeNodes" :default-expanded-ids="['study-dose', 'exp-mint-042', 'plate-a']" />
</template>
