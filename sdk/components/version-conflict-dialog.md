---
aside: false
title: VersionConflictDialog
description: "Dialog for a save refused with a 412 version conflict; reload or overwrite."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# VersionConflictDialog

Dialog for a save refused with a 412 version conflict; reload or overwrite.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/VersionConflictDialog.vue">Source</a>
</div>

<demo vue="./demos/VersionConflictDialog.vue" title="VersionConflictDialog" description="A button opens the dialog with two unsaved changes. Choose Overwrite or Reload." />

## Import

```ts
import { VersionConflictDialog } from "@morscherlab/mint-sdk/data"
```

## Usage

Show the dialog while `useVersionedSave().conflict` is set. Reload discards the edits and refetches. Overwrite saves the edits on top of the newer version.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/VersionConflictDialog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` entity ` | ` string ` | No | ` "" ` | The entity line under the title, such as EXP-042 · Cisplatin dose response. |
| ` changes ` | ` string[] ` | No | ` [] ` | Labels of the fields the user changed and did not save. |
| ` loading ` | ` boolean ` | No | ` false ` | True while Overwrite saves. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:open ` | ` value: boolean ` | — |
| ` reload ` | — | — |
| ` overwrite ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
