# Install the toolchain

One command installs the tools that a plugin developer needs. It installs for the current user and does not use `sudo` or administrator rights.

::: code-group

```bash [macOS, Linux, WSL]
curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash
```

```powershell [Windows PowerShell]
irm https://mint-docs.morscherlab.org/install.ps1 | iex
```

:::

Open a new terminal after the install, so that `PATH` is up to date.

## What it installs

| Tool | Use | Install method |
|---|---|---|
| [uv](https://docs.astral.sh/uv/) | Python and package management | The official uv installer, when `uv` is not found |
| Python 3.14 | The SDK needs 3.14 or later | `uv python install 3.14` |
| `mint` | The plugin CLI: `init`, `dev`, `lint`, `doctor`, `migrate`, `build` | `uv tool install 'mint-sdk[cli,server]'`, in its own environment |
| ruff | The Python part of `mint lint` | Inside the environment of `mint`; your own ruff stays unchanged |
| [Vite+](https://viteplus.dev/) (`vp`) | Every frontend command of the CLI; it manages Node and pnpm | The official Vite+ installer, when `vp` is missing or older than 1.5.1 |

The script keeps a tool that is already installed. Run the same command again to update `mint`.

The script does not install git, but `mint init` creates a git repository. Install git when the script reports that it is missing.

The Vite+ installer needs `curl`. On a system with only `wget`, install `curl` or use `--cli-only`. On a minimal Linux system, the Node.js of Vite+ can need the system library `libatomic1`. The script tells you when Node.js does not start.

## Options

Pass options after `bash -s --`:

```bash
curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash -s -- --cli-only
```

| Option | Effect |
|---|---|
| `--cli-only` | Install uv, Python and `mint` only. Skip Vite+, Node and pnpm. This is enough for the `mint platform` commands and for a plugin with no frontend. |
| `--version X.Y.Z` | Install this `mint-sdk` version. The default is the latest stable release. `MINT_VERSION` in the environment does the same. |
| `--pre` | Allow a pre-release (beta, release candidate). |
| `--dry-run` | Print the commands and change nothing. |

In PowerShell, download the script to use options:

```powershell
irm https://mint-docs.morscherlab.org/install.ps1 -OutFile install.ps1
.\install.ps1 -CliOnly
```

The switches are `-CliOnly`, `-Version X.Y.Z`, `-Pre` and `-DryRun`.

## Read the script first

Both scripts are short. To read one before you run it:

```bash
curl -fsSL https://mint-docs.morscherlab.org/install.sh | less
```

The script downloads and runs the uv installer from `astral.sh` and the Vite+ installer from `vite.plus`. It installs `mint-sdk` from PyPI.

## Install the CLI only, without the script

With Python 3.14 or later and uv:

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
```

A standard plugin also needs Vite+ (`vp` 1.5.1 or later). Install it with `curl -fsSL https://vite.plus | bash` on macOS and Linux, and check it with `vp --version`.

## After the install

```bash
mint --version
mint init my-plugin
mint platform auth login --url https://<your-mint-server>
```

Continue with [the first analysis plugin](/sdk/tutorials/first-analysis-plugin).

## Uninstall

```bash
uv tool uninstall mint-sdk
```

uv and Vite+ have their own uninstall steps; see their documentation.
