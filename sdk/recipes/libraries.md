# Use a reference library

## Goal

Read a large, read-only reference file (a spectral library, a database) that an administrator keeps in the platform's [library store](/admin/libraries). The plugin gets a local path. It does not bundle the file.

## Declare the library

List each library in `Metadata.libraries` as `"<publisher>/<name>"`. This release has one publisher, `platform`.

```python
from mint_sdk import Metadata, Plugin, plugin


class Annotator(Metadata):
    domain = "metabolomics"
    title = "Annotator"
    libraries = {"platform/gnps"}


@plugin(Annotator)
class AnnotatorPlugin(Plugin):
    async def load_spectra(self):
        lib = await self.context.libraries.get("platform/gnps")
        return lib.path  # read-only
```

A reference outside this set raises `PermissionException` (`library.not_declared`, HTTP 403).

## Read the files

`context.libraries.get(ref, version=None)` returns a `Library`. The platform picks the version:

1. the `version` that you pass, if any;
2. else the version that an administrator pinned for your plugin (`library_pins` in the plugin settings);
3. else the latest version.

A retired version resolves only through a pin.

| Field | Meaning |
|-------|---------|
| `path` | The read-only file, or the read-only directory |
| `kind` | `"file"` or `"directory"` |
| `version`, `sha256`, `size`, `media_type`, `license`, `meta` | The library record |
| `cache_dir` | A writable directory of your plugin for files derived from this exact content |

`path` is read-only. Write derived files, such as an index, to `self.context.libraries.cache_dir(lib)`. The directory is created on first use. It is keyed by the `sha256`, so a new version starts with an empty cache. The platform deletes it when the version is deleted.

Record which version produced a result with `lib.provenance()`. It returns `publisher`, `name`, `version` and `sha256`.

| Error | Exception | Cause |
|-------|-----------|-------|
| `library.not_declared` | `PermissionException` | The library is not in `Metadata.libraries` |
| `library.not_found` | `NotFoundException` | No such library or version, no latest version, or the version is not published |
| `library.integrity` | `ConflictException` | The files changed since the import |

## Run it standalone

In `mint dev` and in tests, `context.libraries` reads a local store, `LocalLibraryStore`, under `~/.mint/libraries` (a SQLite registry plus the files). It has no pins. Fill it with the same CLI, with `--local`:

```bash
mint libraries import ./gnps.mgf --local --name gnps --version 2024.1 --promote
mint libraries list --local
```

`mint doctor` warns about a declared library that is not in the local store, and prints the import command to run. See [`mint libraries`](/sdk/api/cli-reference#mint-libraries).

## Pitfalls

- Do not write into `lib.path`. The files are read-only and shared by every plugin.
- Do not cache the path across restarts. A promote or a pin change can select another version.
- A plugin in its own Docker container needs the library directory mounted read-only at the same path. See [Libraries](/admin/libraries#docker).

## Related

- [Libraries (admin)](/admin/libraries)
- [`mint libraries`](/sdk/api/cli-reference#mint-libraries)
