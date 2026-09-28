---
aside: false
title: AppToastContainer
description: "AppToastContainer is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# AppToastContainer

AppToastContainer is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/AppToastContainer.vue">Source</a>
</div>

<ComponentPlayground name="AppToastContainer" />

## Import

```ts
import { AppToastContainer } from "@morscherlab/mint-sdk/components"
```

## Structured notifications in 1.2.1

This component renders the shared `useToast()` queue. Use `toast.push()` for a
title, detail, actions and progress indicator; the existing `success()` /
`error()` helpers still work. See [useToast](/sdk/frontend/composables#usetoast)
for an example and dismissal behavior.

## Toast positioning

When a [AppTopBar](/sdk/components/app-top-bar) is mounted, it publishes
`--mint-toast-offset-top` on `<html>`, and `AppToastContainer` reads it so toasts render
1rem below the top bar instead of covering its right-hand controls. Without a mounted
`AppTopBar`, the container stays 1rem from the top of the viewport.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/AppToastContainer.vue).

This component declares no public props. Its behavior is controlled through SDK state and composables.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
