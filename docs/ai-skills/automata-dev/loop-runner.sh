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

  echo "Prompt recibido. Iniciando sesión con $AI_CMD..."
  echo ""

  if ! printf '%s\n' "$PROMPT" | "$AI_CMD" --print --dangerously-skip-permissions; then
    mv "$CLAIMED_PROMPT" "$NEXT_PROMPT"
    echo ""
    echo "ERROR: $AI_CMD terminó con error en la sesión $SESSION."
    echo "El prompt fue restaurado en $NEXT_PROMPT para reintentar."
    echo "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  fi

  rm -f "$CLAIMED_PROMPT"

  echo ""
  echo "Sesión $SESSION completada."

  # Pausa breve para evitar releer un prompt recién escrito en medio de otro proceso.
  sleep "$POLL_INTERVAL_SECONDS"
done
