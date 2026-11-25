#!/bin/sh
# MINT plugin developer toolchain installer (macOS, Linux, WSL).
#
#   curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash
#   curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash -s -- --cli-only
#
# Installs, for the current user and without sudo:
#   uv, Python 3.14 (managed by uv), the mint CLI (mint-sdk[cli,server]) with ruff,
#   and Vite+ (vp), which manages Node and pnpm.

set -eu

PYTHON_VERSION="3.14"
MIN_VP_VERSION="1.5.1"
UV_INSTALLER="https://astral.sh/uv/install.sh"
VP_INSTALLER="https://vite.plus"
DOCS_URL="https://mint-docs.morscherlab.org/sdk/install"

cli_only=0
prerelease=0
dry_run=0
version="${MINT_VERSION:-}"

usage() {
  cat <<EOF
MINT plugin developer toolchain installer

Usage: install.sh [options]

  --cli-only        Install uv, Python and the mint CLI only (no Vite+, Node, pnpm)
  --version X.Y.Z   Install this mint-sdk version (default: the latest stable)
  --pre             Allow a pre-release of mint-sdk (beta, rc)
  --dry-run         Print the commands and change nothing
  -h, --help        Show this help

Environment: MINT_VERSION sets the version, as --version does.
Docs: $DOCS_URL
EOF
}

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  bold=$(printf '\033[1m'); dim=$(printf '\033[2m'); green=$(printf '\033[32m')
  yellow=$(printf '\033[33m'); red=$(printf '\033[31m'); reset=$(printf '\033[0m')
else
  bold=""; dim=""; green=""; yellow=""; red=""; reset=""
fi

say() { printf '%s\n' "$*"; }
step() { printf '%s==>%s %s\n' "$bold" "$reset" "$*"; }
ok() { printf '  %s✓%s %s\n' "$green" "$reset" "$*"; }
warn() { printf '  %s!%s %s\n' "$yellow" "$reset" "$*" >&2; }
die() { printf '%serror:%s %s\n' "$red" "$reset" "$*" >&2; exit 1; }

run() {
  if [ "$dry_run" -eq 1 ]; then
    printf '  %s$ %s%s\n' "$dim" "$*" "$reset"
  else
    "$@"
  fi
}

has() { command -v "$1" >/dev/null 2>&1; }

fetch() {
  if has curl; then
    curl -fsSL "$1"
  elif has wget; then
    wget -qO- "$1"
  else
    die "curl or wget is required"
  fi
}

run_installer() {
  url=$1
  shell=$2
  if [ "$dry_run" -eq 1 ]; then
    printf '  %s$ curl -fsSL %s | %s%s\n' "$dim" "$url" "$shell" "$reset"
    return 0
  fi
  script=$(mktemp)
  fetch "$url" >"$script" || { rm -f "$script"; die "could not download $url"; }
  "$shell" "$script" || { rm -f "$script"; die "the installer from $url failed"; }
  rm -f "$script"
}

prepend_path() {
  case ":$PATH:" in
    *":$1:"*) ;;
    *) if [ -d "$1" ]; then PATH="$1:$PATH"; fi ;;
  esac
}

version_at_least() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -t. -k1,1n -k2,2n -k3,3n | head -n 1)" = "$2" ]
}

check_platform() {
  case "$(uname -s)" in
    Darwin | Linux) ;;
    MINGW* | MSYS* | CYGWIN*)
      die "this script is for macOS, Linux and WSL. In Windows PowerShell run:  irm https://mint-docs.morscherlab.org/install.ps1 | iex"
      ;;
    *) die "unsupported system: $(uname -s)" ;;
  esac
}

install_uv() {
  step "uv"
  prepend_path "$HOME/.local/bin"
  prepend_path "$HOME/.cargo/bin"
  if has uv; then
    ok "$(uv --version) (found)"
    return 0
  fi
  run_installer "$UV_INSTALLER" sh
  prepend_path "${XDG_BIN_HOME:-$HOME/.local/bin}"
  prepend_path "$HOME/.local/bin"
  if [ "$dry_run" -eq 0 ]; then
    has uv || die "uv was installed but is not on PATH. Open a new terminal and run this script again."
    ok "$(uv --version) (installed)"
  fi
}

install_python() {
  step "Python $PYTHON_VERSION"
  run uv python install "$PYTHON_VERSION"
  [ "$dry_run" -eq 1 ] || ok "$(uv python find "$PYTHON_VERSION" 2>/dev/null || echo "Python $PYTHON_VERSION")"
}

install_mint() {
  step "mint CLI"
  spec="mint-sdk[cli,server]"
  [ -z "$version" ] || spec="$spec==$version"
  set -- uv tool install --python "$PYTHON_VERSION" --upgrade --with ruff
  [ "$prerelease" -eq 0 ] || set -- "$@" --prerelease allow
  run "$@" "$spec"
  if [ "$dry_run" -eq 0 ]; then
    prepend_path "$(uv tool dir --bin 2>/dev/null || echo "$HOME/.local/bin")"
    has mint || die "mint was installed but is not on PATH. Run: uv tool update-shell"
    ok "$(mint --version 2>/dev/null | head -n 1)"
  fi
}

vp_version() {
  vp --version 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 || true
}

install_vp() {
  step "Vite+ (vp)"
  prepend_path "$HOME/.vite-plus/bin"
  prepend_path "$HOME/.local/share/vite-plus/bin"
  if has vp; then
    found=$(vp_version)
    if [ -n "$found" ] && version_at_least "$found" "$MIN_VP_VERSION"; then
      ok "vp $found (found)"
      return 0
    fi
    warn "vp ${found:-of an unknown version} is older than $MIN_VP_VERSION; installing a current one"
  fi
  run_installer "$VP_INSTALLER" bash
  prepend_path "$HOME/.vite-plus/bin"
  prepend_path "$HOME/.local/share/vite-plus/bin"
  prepend_path "$HOME/.local/bin"
  if [ "$dry_run" -eq 0 ]; then
    if has vp; then
      ok "vp $(vp_version) (installed)"
    else
      warn "vp was installed but is not on PATH in this shell. Open a new terminal, then run: vp --version"
    fi
  fi
}

check_git() {
  step "git"
  if has git; then
    ok "$(git --version)"
  else
    warn "git was not found. mint init creates a repository, so install git:"
    case "$(uname -s)" in
      Darwin) warn "  xcode-select --install" ;;
      *) warn "  sudo apt install git    (or your distribution's package manager)" ;;
    esac
  fi
}

main() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --cli-only) cli_only=1 ;;
      --pre) prerelease=1 ;;
      --dry-run) dry_run=1 ;;
      --version)
        [ $# -ge 2 ] || die "--version needs a value"
        version=$2
        shift
        ;;
      --version=*) version=${1#--version=} ;;
      -h | --help)
        usage
        exit 0
        ;;
      *) die "unknown option: $1 (see --help)" ;;
    esac
    shift
  done

  check_platform
  say "${bold}MINT installer${reset}  ${dim}plugin developer toolchain${reset}"
  [ "$dry_run" -eq 0 ] || say "${dim}dry run: nothing is changed${reset}"

  install_uv
  install_python
  install_mint
  [ "$cli_only" -eq 1 ] || install_vp
  check_git

  if [ "$dry_run" -eq 0 ]; then
    uv tool update-shell >/dev/null 2>&1 || true
  fi

  say ""
  say "${bold}Done.${reset} Open a new terminal so that PATH is up to date, then:"
  say "  mint init my-plugin"
  say "  mint platform auth login --url https://<your-mint-server>"
  say ""
  say "${dim}Update later: run this script again.  Docs: $DOCS_URL${reset}"
}

main "$@"
