<script setup lang="ts">
import { AuditTrail } from '@morscherlab/mint-sdk/data'
import type { AuditEntry } from '@morscherlab/mint-sdk'

const auditEntries: AuditEntry[] = [
  {
    id: 'audit-3',
    type: 'update',
    action: 'QC thresholds updated',
    detail: 'Z-score cutoff changed from 2.5 to 3.0.',
    user: 'MINT Admin',
    timestamp: '2026-05-29T10:20:00Z',
    metadata: { plugin: 'dose-response' },
  },
  {
    id: 'audit-2',
    type: 'create',
    action: 'Plate design imported',
    detail: '96 wells, 8 controls, 3 dose levels.',
    user: 'Analysis Lead',
    timestamp: '2026-05-29T08:45:00Z',
  },
  {
    id: 'audit-1',
    type: 'system',
    action: 'Experiment initialized',
    detail: 'Project workspace and default permissions were created.',
    timestamp: '2026-05-28T15:30:00Z',
  },
]
</script>

<template>
  <AuditTrail :entries="auditEntries" show-filters max-height="18rem" />
</template>
