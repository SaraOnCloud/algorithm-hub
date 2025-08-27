#!/usr/bin/env bash
# Script: update-backend.sh
# Actualiza código, reconstruye la imagen del backend y reinicia solo el servicio backend.
# Opcionalmente hace prune agresivo (imagenes, contenedores, redes y volúmenes no usados).
# Uso:
#   ./scripts/update-backend.sh                # pull branch actual, build & restart backend
#   ./scripts/update-backend.sh main           # checkout + pull main antes de construir
#   ./scripts/update-backend.sh --prune        # igual que actual pero con prune
#   ./scripts/update-backend.sh main --prune   # branch + prune
# Variables de entorno soportadas:
#   PRUNE=yes            Fuerza prune aunque no se pase --prune
#   NO_CACHE=1           Fuerza build sin cache
#   QUIET=1              Menos salida
# Requisitos: git, docker / docker compose

set -euo pipefail
IFS=$'\n\t'

COLOR_GREEN="\033[32m"; COLOR_RED="\033[31m"; COLOR_YELLOW="\033[33m"; COLOR_BLUE="\033[34m"; COLOR_RESET="\033[0m"
log() { [[ "${QUIET:-0}" == 1 ]] && return 0; echo -e "${COLOR_BLUE}[update-backend]${COLOR_RESET} $*"; }
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

# Construir solo backend
log "Construyendo imagen backend..."
BUILD_ARGS=("${DC_CMD[@]}" build)
if [[ "${NO_CACHE:-0}" == 1 ]]; then BUILD_ARGS+=(--no-cache); fi
BUILD_ARGS+=(backend)
"${BUILD_ARGS[@]}"
ok "Imagen backend construida"

log "Levantando servicio backend..."
"${DC_CMD[@]}" up -d backend

log "Verificando estado (logs últimos 40 líneas)..."
"${DC_CMD[@]}" logs --tail=40 backend || true

# Health simple: intentar curl interno si está expuesto localmente (puede no funcionar en remoto)
if command -v curl >/dev/null 2>&1; then
  if curl -sk --max-time 5 https://localhost/api/health >/dev/null 2>&1 || curl -s --max-time 5 http://localhost/api/health >/dev/null 2>&1; then
    ok "Health endpoint responde"
  else
    warn "No se pudo verificar health (quizá detrás de Traefik o puerto no mapeado)."
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

ok "Backend actualizado correctamente."

