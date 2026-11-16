# Libraries

The library store holds large, read-only reference files that plugins use: spectral libraries, databases and similar data. An administrator imports each file or directory once. MINT checks it with a SHA-256 hash and keeps every version. A plugin that declares a library reads the version that you choose.

Use the store for files that are too large for a plugin wheel and that many plugins can share. Plugin authors: see [Use a reference library](/sdk/recipes/libraries).

> [Screenshot: Admin -> Platform -> Libraries listing two libraries with versions, states and the Promote, Retire and Delete actions]

## Where the files live

`libraries.path` (env `MINT_LIBRARIES__PATH`) is the directory of the store. The default is `<server.dataPath>/libraries`. The value must be an absolute path. The directory holds:

| Directory | Contents |
|-----------|----------|
| `incoming/` | Sources that you copied for an import |
| `.staging/` | Sources during an import. MINT manages it |
| `<publisher>/<name>/<version>/` | Published versions. MINT makes them read-only |

`incoming/`, `.staging/` and the published versions must be on the same file system, because MINT moves files with a rename and does not copy them.

## Import a library

The Libraries page has no import button. Import with the `mint` CLI from a signed-in terminal. The command needs `platform.configure`. See [`mint libraries`](/sdk/api/cli-reference#mint-libraries).

1. Copy the file or directory into `<libraries.path>/incoming/` on the server.
2. Run the import:

   ```bash
   mint libraries import incoming/gnps.mgf --name gnps --version 2024.1 --promote
   ```

3. Wait until the command prints `done`. The command shows the progress of the hash.

The import takes these inputs:

| Input | Rule |
|-------|------|
| Source | A path inside `incoming/`. It cannot hold a symbolic link |
| `--name` | Lowercase letters, digits, `_` and `-`, at most 64 characters, starting with a letter or digit |
| `--version` | Letters, digits and `.`, `_`, `+`, `-`, at most 64 characters, starting with a letter or digit |
| `--license`, `--media-type`, `--meta` | Optional text and a JSON object for the library record |
| Publisher | `platform`. No other publisher exists in this release |

MINT moves the source to `.staging/`, hashes it in the background and then publishes it as read-only files at `platform/<name>/<version>`. A file keeps its name inside the version directory. A version goes through these states:

| State | Meaning |
|-------|---------|
| `verifying` | The import is running. No plugin can read the version |
| `published` | The version is ready. A plugin reads it when it is the latest or when a pin names it |
| `retired` | The version is hidden. Only a pin still resolves it |

A failed import, a shutdown or a crash returns the source to `incoming/`. MINT never deletes the bytes of an unfinished import. When the name is taken there, MINT adds a suffix. The same version number cannot be imported twice (409 `library.exists`).

## Choose the latest version

Publishing never moves the latest version. Only a promote does. Without `--promote`, the new version stays unused until you promote it.

Open **Admin -> Platform -> Libraries** and click **Promote** on a published version, or run `mint libraries promote platform/gnps 2024.1`. MINT hashes the files again. It makes the version the latest only when the hash still matches the import (409 `library.integrity` otherwise). A library has at most one latest version.

## Retire, restore and delete

| Action | Rule |
|--------|------|
| **Retire** | The version must not be the latest. A plugin no longer reads it, except through a pin |
| **Restore** | Publishes a retired version again |
| **Delete** | The version must be retired. No plugin pin can name it. No plugin can have read it in the last 24 hours (409 `library.in_use`). MINT deletes the files and the plugin caches that were built from them, unless another version has the same content |

The same actions are available in the CLI: `retire`, `restore` and `delete`.

## Pin a plugin to a version

A plugin reads the latest version unless you pin it. A pin keeps one plugin on one version, also after a promote. Only a platform administrator can set a pin:

```bash
curl -X PATCH "$MINT_URL/api/plugins/<plugin>/config" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"config": {"library_pins": {"platform/gnps": "2023.4"}}}'
```

The plugin must declare the library, and the version must exist. Otherwise the request fails with 422. Send `"library_pins": null` to remove all pins. The **Readers** column of the Libraries page lists the plugins that declare each library and the plugins that pin each version. A retired version resolves only through a pin.

## Check the store

- The Libraries page shows the path, the number of libraries and versions, the size and the first characters of the hash of each version.
- `GET /api/health/ready` reports `checks.libraries` for each plugin: the version that the plugin would read now and whether it can read it. A problem shows as a warning and does not change the overall status. See [Server health](/admin/platform-settings#server-health).
- A plugin that reads files that changed since the import gets 409 `library.integrity`. MINT compares the size and the newest modification time. Re-import the library as a new version.

MINT records imports, promotes, retires, restores and deletes in the [audit log](/admin/platform-settings#logs-and-audit-log) as `library.*` events.

## Docker

The default Compose file keeps `libraries.path` on the data volume (`/app/data/libraries`), so the platform process sees it. A plugin that runs in its own Docker container does not. Bind-mount `libraries.path` read-only into that container, at the same path. See [Isolation](/admin/plugins#isolation).

## Errors

| Code | Status | Cause |
|------|--------|-------|
| `library.not_declared` | 403 | The plugin does not list the library in `Metadata.libraries` |
| `library.not_found` | 404 | The library or version does not exist, or the version is not published |
| `library.invalid_source` | 400 | The source is outside `incoming/`, does not exist, or holds a symbolic link |
| `library.exists` | 409 | The version already exists |
| `library.integrity` | 409 | The files changed since the import |
| `library.is_latest` | 409 | You tried to retire the latest version |
| `library.not_retired` | 409 | You tried to delete a version that is not retired |
| `library.in_use` | 409 | A pin names the version, or a plugin read it in the last 24 hours |

## Next

→ [Use a reference library](/sdk/recipes/libraries) — the plugin side
→ [Configuration](/admin/configuration#libraries) — `libraries.path`
