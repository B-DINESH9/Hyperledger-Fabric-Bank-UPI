#!/usr/bin/env bash
# Install all dependencies for backend and frontend workspaces
# Usage:
#   chmod +x setup.sh
#   ./setup.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERR] Required command '$1' not found. Please install it and re-run." >&2
    exit 1
  fi
}

check_cmd node
check_cmd npm

install_pkg() {
  local dir="$1"
  echo "[INFO] Installing dependencies in $(basename "$dir")..."
  if [[ -f "$dir/package-lock.json" ]]; then
    (cd "$dir" && npm ci) || (cd "$dir" && npm install)
  else
    (cd "$dir" && npm install)
  fi
  echo "[OK]   Installed dependencies in $(basename "$dir")."
}

install_pkg "$BACKEND_DIR"
install_pkg "$FRONTEND_DIR"

echo "\n[OK] Setup complete. You can now run:"
echo "  ./start-all.sh"