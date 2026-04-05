#!/bin/bash
# loop-runner.sh — Runner del agentic loop (Linux/macOS)
#
# Uso:
#   chmod +x docs/ai-skills/automata-dev/loop-runner.sh
#   ./docs/ai-skills/automata-dev/loop-runner.sh
#
# Configuración:
#   AI_CMD: comando del CLI de IA a usar (default: claude)
#   Ejemplos: AI_CMD="aider" o AI_CMD="claude"

set -euo pipefail

NEXT_PROMPT="docs/ai-skills/automata-dev/next-prompt.md"
CLAIMED_PROMPT="${NEXT_PROMPT}.running"
AI_CMD="${AI_CMD:-claude}"
SESSION=0
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-2}"
RATE_LIMIT_RETRY_SECONDS="${RATE_LIMIT_RETRY_SECONDS:-300}"

echo "=== Loop runner iniciado ==="
echo "CLI: $AI_CMD"
echo "Esperando: $NEXT_PROMPT"
echo ""

while true; do
  if [[ ! -f "$NEXT_PROMPT" ]]; then
    sleep "$POLL_INTERVAL_SECONDS"
    continue
  fi

  if ! mv "$NEXT_PROMPT" "$CLAIMED_PROMPT" 2>/dev/null; then
    sleep 1
    continue
  fi

  SESSION=$((SESSION + 1))
  echo "--- Sesión $SESSION — $(date '+%Y-%m-%d %H:%M:%S') ---"

  PROMPT=$(cat "$CLAIMED_PROMPT")
  RUN_LOG=$(mktemp)

  echo "Prompt recibido. Iniciando sesión con $AI_CMD..."
  echo ""

  if printf '%s\n' "$PROMPT" | "$AI_CMD" --print --dangerously-skip-permissions >"$RUN_LOG" 2>&1; then
    cat "$RUN_LOG"
  else
    cat "$RUN_LOG"
    echo ""

    if [[ -f "$CLAIMED_PROMPT" ]]; then
      mv "$CLAIMED_PROMPT" "$NEXT_PROMPT"
    elif [[ -f "$NEXT_PROMPT" ]]; then
      :
    else
      printf '\n## Loop detenido — %s\n- Razón: Falló la sesión del runner y no se pudo restaurar el prompt automáticamente.\n- Acción para reiniciar: Revisar el estado del runner y recrear docs/ai-skills/automata-dev/next-prompt.md si hace falta.\n' \
        "$(date '+%Y-%m-%d %H:%M:%S')" >> docs/ai-skills/automata-dev/loop-status.md
      rm -f "$RUN_LOG"
      echo "ERROR: $AI_CMD falló y no existe un prompt para restaurar."
      exit 1
    fi

    if grep -q "You've hit your limit" "$RUN_LOG"; then
      echo "WARN: Claude alcanzó su límite de uso. El prompt fue restaurado en $NEXT_PROMPT."
      echo "Reintentando automáticamente en $RATE_LIMIT_RETRY_SECONDS segundos."
      rm -f "$RUN_LOG"
      sleep "$RATE_LIMIT_RETRY_SECONDS"
      continue
    fi

    printf '\n## Loop detenido — %s\n- Razón: %s terminó con error en la sesión %s.\n- Acción para reiniciar: Revisar docs/ai-skills/automata-dev/loop-status.md y relanzar el runner cuando corresponda.\n' \
      "$(date '+%Y-%m-%d %H:%M:%S')" "$AI_CMD" "$SESSION" >> docs/ai-skills/automata-dev/loop-status.md
    rm -f "$RUN_LOG"
    echo "ERROR: $AI_CMD terminó con error en la sesión $SESSION."
    echo "El prompt fue restaurado en $NEXT_PROMPT para reintentar."
    echo "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  fi
  rm -f "$RUN_LOG"

  rm -f "$CLAIMED_PROMPT"

  echo ""
  echo "Sesión $SESSION completada."

  # Pausa breve para evitar releer un prompt recién escrito en medio de otro proceso.
  sleep "$POLL_INTERVAL_SECONDS"
done
