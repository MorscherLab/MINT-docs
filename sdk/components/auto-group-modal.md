---
title: AutoGroupModal
description: "AutoGroupModal is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# AutoGroupModal

AutoGroupModal is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/AutoGroupModal.vue">Source</a>
</div>

<ComponentPlayground name="AutoGroupModal" />

## Import

```ts
import { AutoGroupModal } from "@morscherlab/mint-sdk/components"
```

## Usage Notes

`AutoGroupModal` is the recommended UI for sample grouping from pasted names, CSV metadata, or experiment design data. It is driven by `useAutoGroup()` and now surfaces the parsed grouping as both flat groups and a nested preview tree.

Recent grouping behavior:

- Trailing injection/run numbers such as `_085` or `_00B` are kept as an `Injection #` / run-order column instead of being silently stripped.
- Samples are split by token count after sample-type classification, so ragged names do not align unrelated fields into the same column.
- The preview can render a three-layer hierarchy: sample class, enabled group-by columns, then sample leaves.
- QC-like classes can be grouped, overlaid, or excluded without losing the experimental group preview.

The applied result includes `groups`, `experimentalGroups`, `qcGroups`, `metadata`, `excludedSamples`, and `groupTree`. Use `groupTree` with `SampleHierarchyTree` when you want to render the same hierarchy outside the modal.

For prop-level detail, open the source file.

[Back to component library](/sdk/components/)
