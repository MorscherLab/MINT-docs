# Marketplace

Admins find and install plugins in the marketplace. If you are not an admin and need a plugin, tell your admin its name. MINT has no install request form.

## Registry

The marketplace reads one registry: a JSON catalog of plugins at `marketplace.registryUrl` in `config.json`. The default registry is `https://raw.githubusercontent.com/MorscherLab/mint-registry/main/registry.json`. A lab can host its own. For the format, see [Publishing -> Registry format](/sdk/operations/publishing#registry-format).

An entry marked `source.private` shows only when the server has a GitHub token for updates.

The **Registry** catalog lists only registry plugins. A plugin installed outside the registry shows only under **Installed**.

MINT keeps a cache of the registry in memory and under `server.dataPath/marketplace/`. When the registry is not available, the catalog uses the cache and the **Registry** section shows a warning. To fetch the registry again, click **Refresh** in the warning. You need `plugins.configure`.

## Browse plugins

1. Open **Admin -> Plugins -> Registry**.
2. Select a type in the filter list, or **Installed** or **Updates**. **Installed** and **Updates** show a count when it is not zero.
3. Optional: type in **Search**.
4. Click a card to open its details.

To see the **Registry** section, you need `plugins.view` and `plugins.configure` or `plugins.install`. The Member role does not have these; see [Users & roles -> Plugin access levels](/admin/users-roles#plugin-access-levels).

A card shows the name, the author, the latest version, a one-line summary and up to three tags. An **Installed** or **Update** badge follows the name. The details show the GitHub repository, the documentation link, the license, the type and the **Min Platform** version. If the plugin needs a newer MINT version, the card shows **Incompatible** and the install and update buttons are disabled.

![Admin, Plugins, Registry with the plugin type filter, the search field, and plugin cards with an Update badge, Install buttons and one Incompatible plugin](/screenshots/guide/marketplace-registry.webp)

## Install

Only administrators see the install, update and uninstall buttons. For the full rule, see [Plugins -> Who can install](/admin/plugins#who-can-install).

MINT refuses an install when the `mint-sdk` requirement of the plugin excludes the SDK of the running platform. For the install steps, see [Plugins -> Install steps](/admin/plugins#install-steps).

## Update

A card shows an **Update** badge when a newer compatible version is available.

1. Click **Update**.
2. Read the result. MINT repeats the install for the new version and tells you if a server restart is necessary.

If the update fails before activation, MINT names the failed step. If the plugin migration fails at startup, the plugin shows **Migration failed** and stays disabled.

The marketplace does not update plugins automatically. Your admin can schedule updates of the platform and its plugins; see [Updates](/admin/updates).

## Uninstall

An admin uninstalls plugins. See [Plugins -> Uninstall modes](/admin/plugins#uninstall-modes).

## Host a private registry

1. Put the registry JSON and the `.mint` bundles on an HTTPS host, such as GitHub Pages, S3 or an internal server.
2. Set `marketplace.registryUrl` to the URL of the JSON.
3. Restart MINT.

MINT reads one registry URL. To show the public catalog and your private plugins, publish one `registry.json` that contains both. For private GitHub release assets, set a GitHub token for updates.

The schema is in [`api/models/marketplace_schemas.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/models/marketplace_schemas.py). A reference registry is [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).
