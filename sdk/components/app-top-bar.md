---
aside: false
title: AppTopBar
description: "Platform-style top bar for shells that need custom navigation chrome."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppTopBar

Use `AppTopBar` when you build your own shell with [AppLayout](/sdk/components/app-layout). `PluginWorkspaceView` renders the top bar for you.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppTopBar.vue">Source</a>
</div>

<demo vue="./demos/AppTopBar.vue" title="AppTopBar" description="A top bar with page selector, pill navigation and account menu. Click the pills to change the active view." />

## Import

```ts
import { AppTopBar } from "@morscherlab/mint-sdk/shell"
```

## Plugin identity

- Inside the platform, the bar shows the icon and name of the plugin in place of `title` and `subtitle`, when no page selector is present. The name is `PluginInfo.display_name`, or `name` when the platform sends no display name. The identity is not a control: users switch plugins from the platform home.
- A standalone plugin shows `title` and `subtitle`.
- A standalone plugin with a router and two or more pages gets a page selector in place of the title, when you do not set `pageSelector`. The selector lists the `navItems` of the generated contract (seeded by `providePluginIdentity(contract)`) and follows the route.
- Every control is 32px high, so the bar stays 52px high.

## Pill navigation

Set the pills in `spec.pills` and bind the current pill with `v-model:pill`.

- `dot: true` shows a small error-colored dot after the label, for example for an unacknowledged critical alert.
- A pill with `children` opens a dropdown. When a child is the current pill, the pill shows the label of that child.

## Toast positioning

A mounted `AppTopBar` moves the toasts below itself; see [Toast positioning](/sdk/components/app-toast-container#toast-positioning).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppTopBar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | App or plugin title shown in the left title group when no page selector is present. |
| ` subtitle ` | ` string ` | No | ` undefined ` | Secondary title copy shown under the title in title-group layouts. |
| ` spec ` | ` PluginWorkspaceTopBarSpec ` | No | ` {} ` | Structure: variant, home link, logo, pills, theme toggle, settings, standalone badge. Optional: every option has a default. |
| ` pill ` | ` string ` | No | ` undefined ` | Active pill id. Bind with v-model:pill. |
| ` pageSelector ` | ` PageSelectorItemInput[] ` | No | ` undefined ` | Page selector of a platform page. Plugin pages get theirs from the plugin.nav_items metadata through the platform integration script. |
| ` currentPageSelectorId ` | ` string ` | No | ` undefined ` | Active id of the platform page selector. |
| ` job ` | ` TopBarJob \| null ` | No | ` undefined ` | The viewer's own job, joined to the experiment chip. Omit it for no jobs control; null shows the idle Jobs button. Both emit job-click. |
| ` jobsDone ` | ` number ` | No | ` undefined ` | Completed jobs, shown as a small count on the idle Jobs button. Hidden when 0. |
| ` jobsOpen ` | ` boolean ` | No | ` undefined ` | Whether the jobs panel is open; aria-expanded of the job control. |
| ` jobsPanelId ` | ` string ` | No | ` undefined ` | DOM id of the jobs panel; aria-controls of the job control. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PluginWorkspaceTopBarSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L232) | See the linked SDK type definition. |
| [` PageSelectorItemInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L229) | See the linked SDK type definition. |
| [` TopBarJob `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/jobs.ts#L68) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` pill-select ` | ` item: PillNavItem ` | — |
| ` pill-option-select ` | ` option: PillNavOption, item: PillNavItem ` | — |
| ` settings-values-change ` | ` data: Record<string, unknown> ` | — |
| ` job-click ` | — | — |
| ` update:pill ` | ` pillId: string ` | — |
| ` page-selector-select ` | ` page: PageSelectorItem ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` icon ` | — | — |
| ` logo ` | — | — |
| ` page-selector-icon ` | ` { page: PageSelectorItem; } ` | — |
| ` page-selector-item-icon ` | ` { page: PageSelectorItem; } ` | — |
| ` nav ` | — | — |
| ` center ` | — | — |
| ` actions ` | — | — |
| ` account ` | — | — |
| ` settings-appearance ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
