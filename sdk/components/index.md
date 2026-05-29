---
title: Component Library
description: Standalone reference for MINT frontend SDK components.
---

# Component Library

`@morscherlab/mint-sdk` ships the Vue components plugin authors use to build frontends that feel native inside MINT. This section is the public component library: a searchable catalog and one page per exported component, with each component page embedding its own playground.

## Start Here

| Need | Page |
|------|------|
| Preview a component | Open the component page below and use its embedded playground |
| Check one component import and source | Open the component page below |
| Learn token and theme behavior | [Design tokens](/sdk/frontend/design-tokens), [Theming](/sdk/frontend/theming) |
| Build schema-driven experiment forms | [FormBuilder guide](/sdk/frontend/form-builder) |

<ComponentCatalog />

## SDK Maintainer Storybook

The component pages above are compiled into the VitePress docs site. SDK maintainers can also run the full Histoire lab while changing SDK components and testing exhaustive prop controls:

```bash
cd packages/sdk-frontend
bun run story:dev
# http://localhost:6006
```
