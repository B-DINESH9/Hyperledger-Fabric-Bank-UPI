#!/usr/bin/env bash
# Start both backend and frontend for the Blockchain UPI project with basic health checks
# Usage:
#   chmod +x start-all.sh
#   ./start-all.sh
# Or run via npm from project root:
#   npm start

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
success(){ echo -e "${GREEN}[OK]${NC}   $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERR]${NC}  $*"; }

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Required command '$1' not found. Please install it and re-run."
    exit 1
  fi
}

check_cmd node
check_cmd npm
check_cmd curl

# Ensure dependencies are installed (only if node_modules is missing)
install_if_needed() {
  local dir="$1"
  if [[ ! -d "$dir/node_modules" ]]; then
    info "Installing dependencies in $(basename "$dir")..."
    if [[ -f "$dir/package-lock.json" ]]; then
      (cd "$dir" && npm ci) || (cd "$dir" && npm install)
    else
      (cd "$dir" && npm install)
    fi
    success "Installed dependencies in $(basename "$dir")."
  else
    info "Dependencies already installed in $(basename "$dir"). Skipping install."
  fi
}

# Start backend (port 5001)
start_backend() {
  info "Starting backend (port 5001)..."
  : > "$BACKEND_LOG"
  (cd "$BACKEND_DIR" && npm run dev) >> "$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  info "Backend PID: $BACKEND_PID (logs: $BACKEND_LOG)"
}

# Start frontend (port 3000)
start_frontend() {
  info "Starting frontend (port 3000)..."
  : > "$FRONTEND_LOG"
  # Prevent CRA from auto-opening browser
  (cd "$FRONTEND_DIR" && BROWSER=none npm start) >> "$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
  info "Frontend PID: $FRONTEND_PID (logs: $FRONTEND_LOG)"
}

# Health checks with timeout
wait_for_backend() {
  info "Waiting for backend to be healthy at http://localhost:5001/health ..."
  local retries=60
  local delay=1
  local ok=false
  for ((i=1;i<=retries;i++)); do
    if curl -fsS http://localhost:5001/health >/dev/null 2>&1; then
      ok=true
      break
    fi
    sleep "$delay"
  done
  if [[ "$ok" == true ]]; then
    success "Backend is up at http://localhost:5001"
  else
    warn "Backend health check did not confirm in time. It might still be starting. Check $BACKEND_LOG"
  fi
}

wait_for_frontend() {
  info "Waiting for frontend at http://localhost:3000 ..."
  local retries=60
  local delay=1
  local ok=false
  for ((i=1;i<=retries;i++)); do
    if curl -fsS http://localhost:3000 >/dev/null 2>&1; then
      ok=true
      break
    fi
    sleep "$delay"
  done
  if [[ "$ok" == true ]]; then
    success "Frontend is up at http://localhost:3000"
  else
    warn "Frontend check did not confirm in time. It might still be starting. Check $FRONTEND_LOG"
  fi
}

cleanup() {
  echo
  warn "Shutting down servers..."
  if [[ -n "${FRONTEND_PID:-}" ]] && ps -p "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" || true
  fi
  if [[ -n "${BACKEND_PID:-}" ]] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" || true
  fi
  success "All processes terminated."
}

trap cleanup INT TERM EXIT

info "Project root: $ROOT_DIR"

install_if_needed "$BACKEND_DIR"
install_if_needed "$FRONTEND_DIR"

start_backend
start_frontend

wait_for_backend
wait_for_frontend

echo
success "Servers are running!"
echo "- Backend API:   http://localhost:5001"
echo "- Frontend App:  http://localhost:3000"
echo
info "Tail logs in another terminal if needed:"
echo "  tail -f '$BACKEND_LOG'"
echo "  tail -f '$FRONTEND_LOG'"
echo
info "Press Ctrl+C to stop both servers."

# Keep script running while children are alive
wait "$BACKEND_PID" "$FRONTEND_PID"