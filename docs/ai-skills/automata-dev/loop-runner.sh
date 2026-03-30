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
AI_CMD="${AI_CMD:-claude}"
SESSION=0

echo "=== Loop runner iniciado ==="
echo "CLI: $AI_CMD"
echo "Esperando: $NEXT_PROMPT"
echo ""

while [[ -f "$NEXT_PROMPT" ]]; do
  SESSION=$((SESSION + 1))
  echo "--- Sesión $SESSION — $(date '+%Y-%m-%d %H:%M:%S') ---"

  PROMPT=$(cat "$NEXT_PROMPT")
  rm "$NEXT_PROMPT"

  echo "Prompt recibido. Iniciando sesión con $AI_CMD..."
  echo ""

  if ! echo "$PROMPT" | "$AI_CMD" --print --dangerously-skip-permissions; then
    echo ""
    echo "ERROR: $AI_CMD terminó con error en la sesión $SESSION."
    echo "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  fi

  echo ""
  echo "Sesión $SESSION completada."

  # Pausa breve para evitar condiciones de carrera con el commit
  sleep 2
done

echo ""
echo "=== Loop terminado. No hay next-prompt.md. ==="
echo "Ver docs/ai-skills/automata-dev/loop-status.md para el estado final."
