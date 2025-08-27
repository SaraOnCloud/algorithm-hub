#!/usr/bin/env bash
# Script: update-frontend.sh
# Actualiza código, reconstruye la imagen del frontend y reinicia solo el servicio frontend.
# Opcionalmente hace prune agresivo (imagenes, contenedores, redes y volúmenes no usados).
# Uso:
#   ./scripts/update-frontend.sh                # pull branch actual, build & restart frontend
#   ./scripts/update-frontend.sh main           # checkout + pull main antes de construir
#   ./scripts/update-frontend.sh --prune        # igual que actual pero con prune
#   ./scripts/update-frontend.sh main --prune   # branch + prune
# Variables de entorno soportadas:
#   PRUNE=yes            Fuerza prune aunque no se pase --prune
#   NO_CACHE=1           Fuerza build sin cache
#   QUIET=1              Menos salida
# Requisitos: git, docker / docker compose

set -euo pipefail
IFS=$'\n\t'

COLOR_GREEN="\033[32m"; COLOR_RED="\033[31m"; COLOR_YELLOW="\033[33m"; COLOR_BLUE="\033[34m"; COLOR_RESET="\033[0m"
log() { [[ "${QUIET:-0}" == 1 ]] && return 0; echo -e "${COLOR_BLUE}[update-frontend]${COLOR_RESET} $*"; }
warn() { echo -e "${COLOR_YELLOW}[warn]${COLOR_RESET} $*"; }
err()  { echo -e "${COLOR_RED}[error]${COLOR_RESET} $*" >&2; }
ok()   { [[ "${QUIET:-0}" == 1 ]] && return 0; echo -e "${COLOR_GREEN}[ok]${COLOR_RESET} $*"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

BRANCH=""
DO_PRUNE=0
for arg in "$@"; do
  case "$arg" in
    --prune) DO_PRUNE=1 ;;
    -h|--help) sed -n '1,60p' "$0"; exit 0 ;;
    -*) err "Argumento no reconocido: $arg"; exit 1 ;;
    *) BRANCH="$arg" ;;
  esac
done

if [[ -n "${PRUNE:-}" && "${PRUNE}" =~ ^(yes|true|1)$ ]]; then
  DO_PRUNE=1
fi

# Detectar comando docker compose
if docker compose version >/dev/null 2>&1; then
  DC_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DC_CMD=(docker-compose)
else
  err "No se encontró docker compose."; exit 1
fi

log "Repositorio: ${REPO_ROOT}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "")
if [[ -n "$BRANCH" && "$BRANCH" != "$CURRENT_BRANCH" ]]; then
  log "Checkout a branch '$BRANCH' (actual: '$CURRENT_BRANCH')"
  git fetch --all --prune
  git checkout "$BRANCH"
fi

log "Actualizando rama..."
git pull --ff-only || { warn "git pull ff-only falló, intentando rebase"; git pull --rebase || { err "No se pudo actualizar la rama"; exit 1; }; }

# Construir solo frontend
log "Construyendo imagen frontend..."
BUILD_ARGS=("${DC_CMD[@]}" build)
if [[ "${NO_CACHE:-0}" == 1 ]]; then BUILD_ARGS+=(--no-cache); fi
BUILD_ARGS+=(frontend)
"${BUILD_ARGS[@]}"
ok "Imagen frontend construida"

log "Levantando servicio frontend..."
"${DC_CMD[@]}" up -d frontend

log "Logs últimos 40 líneas del frontend..."
"${DC_CMD[@]}" logs --tail=40 frontend || true

# Comprobación básica HTTP local (puede no aplicar en servidor remoto sin puertos mapeados)
if command -v curl >/dev/null 2>&1; then
  if curl -sk --max-time 5 https://localhost/ >/dev/null 2>&1 || curl -s --max-time 5 http://localhost/ >/dev/null 2>&1; then
    ok "Frontend responde (contenido recibido)"
  else
    warn "No se pudo verificar respuesta local del frontend."
  fi
fi

if [[ $DO_PRUNE -eq 1 ]]; then
  log "Ejecutando prune agresivo (imágenes, volúmenes y caché no usados)..."
  if [[ $EUID -ne 0 ]]; then
    sudo docker system prune -af --volumes || warn "Prune con sudo falló"
  else
    docker system prune -af --volumes || warn "Prune falló"
  fi
  ok "Prune completado"
else
  log "Prune omitido (use --prune o PRUNE=yes)."
fi

ok "Frontend actualizado correctamente."
