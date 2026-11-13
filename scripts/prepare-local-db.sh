#!/usr/bin/env bash

set -euo pipefail

# Start Docker's local PostgreSQL service and prepare Amauta's local database.
# Usage:
#   sudo ./scripts/prepare-local-db.sh
#   sudo ./scripts/prepare-local-db.sh --no-seed
#
# The script starts only PostgreSQL. It never touches the production database.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
CONTAINER_NAME="amauta-postgres"
LOCAL_DATABASE_URL="postgresql://amauta:desarrollo123@localhost:5432/amauta_dev"
NO_SEED=false

if [[ "${1:-}" == "--no-seed" ]]; then
  NO_SEED=true
elif [[ $# -gt 0 ]]; then
  echo "Uso: sudo $0 [--no-seed]" >&2
  exit 2
fi

if [[ "${EUID}" -ne 0 ]]; then
  exec sudo "$0" "$@"
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "Error: systemctl no está disponible en este sistema." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker no está instalado o no está en PATH." >&2
  exit 1
fi

echo "==> Iniciando Docker..."
systemctl start docker

for _ in {1..30}; do
  if docker info >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker no respondió después de 30 segundos." >&2
  exit 1
fi

echo "==> Iniciando PostgreSQL local..."
docker compose -f "$COMPOSE_FILE" up -d postgres

for _ in {1..60}; do
  health="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || true)"
  if [[ "$health" == "healthy" ]]; then
    break
  fi
  if [[ "$health" == "unhealthy" ]]; then
    echo "Error: el contenedor $CONTAINER_NAME quedó unhealthy." >&2
    docker compose -f "$COMPOSE_FILE" logs --tail=80 postgres >&2
    exit 1
  fi
  sleep 1
done

health="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || true)"
if [[ "$health" != "healthy" ]]; then
  echo "Error: PostgreSQL no alcanzó el estado healthy en 60 segundos." >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=80 postgres >&2
  exit 1
fi

echo "==> PostgreSQL local está healthy."

if [[ "$NO_SEED" == true ]]; then
  echo "Preparación terminada sin migraciones ni seed (--no-seed)."
  echo "DATABASE_URL=$LOCAL_DATABASE_URL"
  exit 0
fi

if [[ -z "${SUDO_USER:-}" || "$SUDO_USER" == "root" ]]; then
  echo "Error: ejecutá este script con sudo desde tu usuario normal para poder ejecutar Prisma sin crear archivos root-owned." >&2
  exit 1
fi

run_as_user() {
  sudo -u "$SUDO_USER" -H env "$@"
}

echo "==> Aplicando migraciones locales..."
run_as_user bash -lc "cd '$ROOT_DIR/apps/api' && DATABASE_URL='$LOCAL_DATABASE_URL' npx prisma migrate deploy"

echo "==> Ejecutando seed local..."
run_as_user bash -lc "cd '$ROOT_DIR/apps/api' && DATABASE_URL='$LOCAL_DATABASE_URL' npm run prisma:seed"

echo
 echo "Base local preparada correctamente."
echo "DATABASE_URL=$LOCAL_DATABASE_URL"
echo "Para usarla en esta terminal:"
echo "  export DATABASE_URL='$LOCAL_DATABASE_URL'"
