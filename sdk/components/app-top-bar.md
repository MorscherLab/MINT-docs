---
aside: false
title: AppTopBar
description: "Platform-style top bar for shells that need custom navigation chrome."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppTopBar

Platform-style top bar for shells that need custom navigation chrome.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppTopBar.vue">Source</a>
</div>

<ComponentPlayground name="AppTopBar" />

## Import

```ts
import { AppTopBar } from "@morscherlab/mint-sdk/shell"
```

## Plugin identity

Inside the platform, `AppTopBar` shows an integrated plugin's icon and name as a static identity. The name is `PluginInfo.display_name`; it falls back to `name` when the platform sends no display name. It takes the place of `title` / `subtitle` when no page selector is present. It is not a control. Users switch plugins from the platform home. Standalone plugins show `title` / `subtitle`. Every control is 32px high, so the bar stays 52px.

## Pill navigation

`pillNav` items take an optional `dot`. A `dot` shows a small error-colored dot after the label (for example, an unacknowledged critical alert). A pill with `children` opens a dropdown. When a child is the current item (`currentPillId`), the pill shows the label of that child.

## Toast positioning

A mounted `AppTopBar` publishes `--mint-toast-offset-top` on `<html>`, measured from the
top-most bar and refreshed on resize and scroll. [AppToastContainer](/sdk/components/app-toast-container)
reads this variable so toasts render 1rem below the top bar instead of covering its
right-hand controls. Without a mounted `AppTopBar`, the toast container stays 1rem from
the top of the viewport.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppTopBar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | App or plugin title shown in the left title group when no page selector is present. |
| ` subtitle ` | ` string ` | No | ` undefined ` | Secondary title copy shown under the title in title-group layouts. |
| ` spec ` | ` PluginWorkspaceTopBarSpec ` | No | ` () => ({}) ` | Structure: variant, home link, logo, pills, theme toggle, settings, standalone badge. Optional: every option has a default. |
| ` pill ` | ` string ` | No | ` undefined ` | Active pill id. Bind with v-model:pill. |
| ` pageSelector ` | ` PageSelectorItemInput[] ` | No | ` undefined ` | Page selector of a platform page. Plugin pages get theirs from the plugin.nav_items metadata through the platform integration script. |
| ` currentPageSelectorId ` | ` string ` | No | ` undefined ` | Active id of the platform page selector. |
| ` job ` | ` TopBarJob \| null ` | No | ` undefined ` | The viewer's own job, joined to the experiment chip. Omit it for no jobs control; null shows the idle Jobs button. Both emit job-click. |
| ` jobsDone ` | ` number ` | No | ` undefined ` | Completed jobs, shown as a small count on the idle Jobs button. Hidden when 0. |
| ` jobsOpen ` | ` boolean ` | No | ` undefined ` | Whether the jobs panel is open; aria-expanded of the job control. |
| ` jobsPanelId ` | ` string ` | No | ` undefined ` | DOM id of the jobs panel; aria-controls of the job control. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginWorkspaceTopBarSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L233) | See the linked SDK type definition. |
| [` PageSelectorItemInput `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L230) | See the linked SDK type definition. |
| [` TopBarJob `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/jobs.ts#L73) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
