---
aside: false
title: AppAvatarMenu
description: "AppAvatarMenu is a layout component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppAvatarMenu

AppAvatarMenu is a layout component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AppAvatarMenu.vue">Source</a>
</div>

<ComponentPlayground name="AppAvatarMenu" />

## Import

```ts
import { AppAvatarMenu } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AppAvatarMenu.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` userName ` | ` string ` | No | ` undefined ` | — |
| ` userInitial ` | ` string ` | No | ` undefined ` | — |
| ` userEmail ` | ` string ` | No | ` undefined ` | — |
| ` items ` | ` AccountMenuItem[] ` | No | ` () => [] as AccountMenuItem[] ` | — |
| ` showSignOut ` | ` boolean ` | No | ` true ` | — |
| ` signOutLabel ` | ` string ` | No | ` 'Sign out' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` AccountMenuItem `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L266) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
