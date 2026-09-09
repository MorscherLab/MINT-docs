---
aside: false
title: Component Library
description: Standalone reference for MINT frontend SDK components.
---

# Component Library

`@morscherlab/mint-sdk` ships the Vue components plugin authors use to build frontends that feel native inside MINT. This section is the public component library: a searchable catalog and one page per exported component, with live playgrounds and a props reference for every component. The reference targets **MINT SDK 1.2.0**.

## Start Here

| Need | Page |
|------|------|
| Preview a component | Open the component page below and use its embedded playground |
| Look up props, types, defaults and required inputs | Open the component page and read **Props** |
| Check one component import and source | Open the component page below |
| Learn token and theme behavior | [Design tokens](/sdk/frontend/design-tokens), [Theming](/sdk/frontend/theming) |
| Build schema-driven experiment forms | [FormBuilder guide](/sdk/frontend/form-builder) |

<ComponentCatalog />

## Reading the props reference

Props use their TypeScript names, such as `modelValue` or `maxHeight`; Vue
templates also accept kebab-case names such as `max-height`. Bind numbers,
objects and arrays with `:`. `modelValue` usually pairs with `v-model`; named
models use `v-model:name`.

**Required** means the caller must supply the prop. Defaults show the SDK's
source expression; `() => []` and `() => ({})` create a fresh value for each
component instance. `undefined` means no explicit value is supplied; the
component may derive its behavior from platform settings or other props.
Optional Boolean props default to `false` unless the component overrides that.
Descriptions include source comments where available. Named object types are
linked to their source definitions when available.

## SDK Maintainer Storybook

The component pages above are compiled into the VitePress docs site. SDK maintainers can also run the full Histoire lab while changing SDK components and testing exhaustive prop controls:

```bash
cd packages/sdk-frontend
bun run story:dev
# http://localhost:6006
```
