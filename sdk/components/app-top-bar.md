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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/AppTopBar.vue">Source</a>
</div>

<ComponentPlayground name="AppTopBar" />

## Import

```ts
import { AppTopBar } from "@morscherlab/mint-sdk/components"
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

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/AppTopBar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | App or plugin title shown in the left title group when no page selector is present. |
| ` subtitle ` | ` string ` | No | ` undefined ` | Secondary title copy shown under the title in title-group layouts. |
| ` showLogo ` | ` boolean ` | No | ` true ` | Show the default MINT logo when the icon/logo slot is not provided. |
| ` variant ` | ` TopBarVariant ` | No | ` 'card' ` | Top bar visual treatment. |
| ` homePath ` | ` string ` | No | ` '/' ` | Home link used by the brand icon. |
| ` pageSelector ` | ` PageSelectorItemInput[] ` | No | ` undefined ` | Preferred route-level page switch entries for plugin and platform pages. Integrated plugins read platform plugin.nav_items metadata automatically when pageSelector is omitted. |
| ` currentPageSelectorId ` | ` string ` | No | ` undefined ` | Active id for the preferred page selector. |
| ` pillNav ` | ` PillNavItemInput[] ` | No | ` undefined ` | Preferred centered navigation for local modes inside the current route. |
| ` currentPillId ` | ` string ` | No | ` undefined ` | Active id for the preferred centered pill navigation. |
| ` accountMenu ` | ` AccountMenuItem[] ` | No | ` undefined ` | Account dropdown entries. |
| ` showNotifications ` | ` boolean ` | No | ` false ` | Show the notifications icon button. |
| ` hasNotificationDot ` | ` boolean ` | No | ` false ` | Draw a notification dot on the notifications icon. |
| ` showThemeToggle ` | ` boolean ` | No | ` false ` | Show the theme toggle button. |
| ` showSettings ` | ` boolean ` | No | ` false ` | Show the settings button and modal. |
| ` settingsConfig ` | ` TopBarSettingsConfig ` | No | ` undefined ` | Built-in SettingsModal configuration. |
| ` showStandaloneLabel ` | ` boolean ` | No | ` true ` | Show the standalone badge when the plugin is not integrated into the platform. |
| ` standaloneLabel ` | ` string ` | No | ` 'Standalone' ` | Custom standalone badge label. |
| ` showAdmin ` | ` boolean ` | No | ` false ` | Show the admin shortcut. |
| ` adminPath ` | ` string ` | No | ` '/admin' ` | Route used by the admin shortcut. |
| ` userName ` | ` string ` | No | ` undefined ` | Account display name. |
| ` userInitial ` | ` string ` | No | ` undefined ` | Explicit account avatar initial. |
| ` userEmail ` | ` string ` | No | ` undefined ` | Account email shown in the avatar menu. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TopBarVariant `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L196) | ` 'card' \| 'default' ` |
| [` PageSelectorItemInput `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L264) | See the linked SDK type definition. |
| [` PillNavItemInput `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L249) | See the linked SDK type definition. |
| [` AccountMenuItem `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L267) | See the linked SDK type definition. |
| [` TopBarSettingsConfig `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/components.ts#L210) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
