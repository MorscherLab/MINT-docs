---
aside: false
title: AppLayout
description: "Lower-level application shell with topbar, sidebar, and content slots."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppLayout

Lower-level application shell with topbar, sidebar, and content slots.

AppLayout is the layout primitive used inside both `PluginWorkspaceView` and `ControlWorkspaceView`. Use it directly when you need to assemble your own top bar, sidebar, and their behavior. A workspace already owns this layout, so do not wrap it in another AppLayout.

See [AppLayout or a workspace](/sdk/frontend/#applayout-or-a-workspace) for the selection guide and normal component nesting.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AppLayout.vue">Source</a>
</div>

<ComponentPlayground name="AppLayout" />

## Import

```ts
import { AppLayout } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AppLayout.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` sidebarPosition ` | ` 'left' \| 'right' ` | No | ` 'left' ` | Position of sidebar (left or right side of screen) |
| ` sidebarWidth ` | ` string ` | No | ` 'auto' ` | Width of sidebar (use 'auto' to fit content) |
| ` floating ` | ` boolean ` | No | ` false ` | When true, topbar/sidebar/main render as floating cards with gaps |
| ` responsiveSidebar ` | ` boolean ` | No | ` false ` | Convert the sidebar into a mobile overlay with built-in toggle and backdrop below 1024px. |
| ` sidebarOpen ` | ` boolean ` | No | ` undefined ` | Controlled mobile sidebar open state. Desktop sidebar remains visible. |
| ` defaultSidebarOpen ` | ` boolean ` | No | ` false ` | Initial mobile sidebar open state when sidebarOpen is uncontrolled. |
| ` sidebarToggleLabel ` | ` string ` | No | ` 'Open sidebar' ` | Accessible label for the mobile sidebar toggle. |
| ` sidebarCloseLabel ` | ` string ` | No | ` 'Close sidebar' ` | Accessible label used when the mobile sidebar is open. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
