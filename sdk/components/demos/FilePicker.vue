<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@morscherlab/mint-sdk'
import { FilePicker } from '@morscherlab/mint-sdk/data'
import type { PickerAdapter, PickerFile, PickerFolder, PickerNode, PickerSelection } from '@morscherlab/mint-sdk'

const file = (dir: string, name: string, bytes: number, modifiedAt: string): PickerFile => ({
  kind: 'file', path: `${dir}/${name}`, name, parentPath: dir,
  format: name.slice(name.indexOf('.') + 1), bytes, modifiedAt,
})
const folder = (path: string, name: string, parentPath: string | null): PickerFolder => ({
  kind: 'folder', path, name, parentPath, hasChildren: true,
})

const tree: Record<string, PickerNode[]> = {
  '/orbitrap': [folder('/orbitrap/2026-10', 'EXP-042', '/orbitrap'), folder('/orbitrap/qc', 'QC', '/orbitrap')],
  '/orbitrap/2026-10': [
    file('/orbitrap/2026-10', 'EXP042_S001.raw', 812_000_000, '2026-10-28T09:14:00Z'),
    file('/orbitrap/2026-10', 'EXP042_S002.raw', 806_000_000, '2026-10-28T09:41:00Z'),
    file('/orbitrap/2026-10', 'EXP042_S003.mzML', 1_240_000_000, '2026-10-28T10:08:00Z'),
  ],
  '/orbitrap/qc': [file('/orbitrap/qc', 'QC01.raw', 790_000_000, '2026-10-27T18:02:00Z')],
  '/exploris': [folder('/exploris/pilot', 'Pilot', '/exploris')],
  '/exploris/pilot': [
    file('/exploris/pilot', 'pilot_01.mzML', 980_000_000, '2026-10-20T14:30:00Z'),
    file('/exploris/pilot', 'pilot_02.mzML', 975_000_000, '2026-10-20T15:02:00Z'),
  ],
}
const all = Object.values(tree).flat()

// In-memory adapter: two mounts, no network.
const adapter: PickerAdapter = {
  mounts: true,
  mountOf: path => path.startsWith('/exploris') ? '/exploris' : '/orbitrap',
  listRoot: async () => [
    { kind: 'folder', path: '/orbitrap', name: 'Orbitrap data', hasChildren: true },
    { kind: 'folder', path: '/exploris', name: 'Exploris data', hasChildren: true },
  ],
  listChildren: async path => tree[path] ?? [],
  search: async query => all.filter(n => n.name.toLowerCase().includes(query.toLowerCase())),
}

const open = ref(false)
const selection = ref<PickerSelection | null>(null)

function select(value: PickerSelection): void {
  selection.value = value
  open.value = false
}
</script>

<template>
  <div class="mint-live-row">
    <BaseButton @click="open = true">Select input data</BaseButton>
    <p class="mint-live-caption">
      {{ selection && selection.source === 'server' ? selection.files.length : 0 }} files selected
    </p>
  </div>
  <FilePicker
    v-model:open="open"
    :adapter="adapter"
    :initial-selection="selection"
    selection-mode="multi-file"
    :capabilities="{ server: { formats: ['raw', 'mzML'] } }"
    @select="select"
  />
</template>
