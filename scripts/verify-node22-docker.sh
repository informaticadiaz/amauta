#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="${1:-$ROOT_DIR/odd/evidence/node-lts-verification.txt}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

exec > >(tee "$OUTPUT_FILE") 2>&1

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  printf 'La salida completa quedó registrada en: %s\n' "$OUTPUT_FILE" >&2
  exit 1
}

version_at_least() {
  node -e '
    const [major, minor, patch] = process.argv[1].split(".").map(Number);
    const [requiredMajor, requiredMinor, requiredPatch] = process.argv[2].split(".").map(Number);
    const current = major * 1_000_000 + minor * 1_000 + patch;
    const required = requiredMajor * 1_000_000 + requiredMinor * 1_000 + requiredPatch;
    process.exit(current >= required ? 0 : 1);
  ' "$1" "$2"
}

run_check() {
  printf '\n$ %s\n' "$*"
  "$@"
}

cd "$ROOT_DIR"

# Prefer the user-local npm installation when the script runs outside an
# interactive shell whose PATH already contains it.
if [[ -x "$HOME/.npm-global/bin/npm" ]]; then
  export PATH="$HOME/.npm-global/bin:$PATH"
  hash -r
fi

printf 'Amauta — verificación Node.js 22 y Docker\n'
printf 'Fecha: %s\n' "$(date --iso-8601=seconds)"
printf 'Repositorio: %s\n' "$ROOT_DIR"
printf 'Archivo de salida: %s\n' "$OUTPUT_FILE"

printf '\n== Preflight de runtime ==\n'
NODE_VERSION="$(node --version | sed 's/^v//')"
NPM_VERSION="$(npm --version)"
printf 'Node.js: %s\n' "$NODE_VERSION"
printf 'npm: %s\n' "$NPM_VERSION"

version_at_least "$NODE_VERSION" "22.11.0" || fail "Se requiere Node.js >=22.11.0."
[[ "$NODE_VERSION" == 22.* ]] || fail "Se requiere la línea Node.js 22.x."
version_at_least "$NPM_VERSION" "10.0.0" || fail "Se requiere npm >=10.0.0. No se instalará automáticamente."

printf '\n== Verificaciones del monorepo ==\n'
run_check npm run format:check
run_check npm run lint
run_check npm run type-check
run_check npm run build
run_check npm run test:all

printf '\n== Preflight de Docker ==\n'
command -v docker >/dev/null 2>&1 || fail "El comando docker no está instalado."
run_check docker version
run_check docker info

printf '\n== Builds Docker ==\n'
run_check docker build --pull=false -f apps/api/Dockerfile -t amauta-api:node22-t3 .
run_check docker build --pull=false -f apps/web/Dockerfile -t amauta-web:node22-t3 .

printf '\nOK: verificaciones completadas.\n'
printf 'Las imágenes generadas son locales y no se desplegaron.\n'
printf 'Salida registrada en: %s\n' "$OUTPUT_FILE"
