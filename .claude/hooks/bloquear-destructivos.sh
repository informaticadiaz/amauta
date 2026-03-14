#!/bin/bash
# Hook: bloquear-destructivos.sh
# Bloquea comandos bash que pueden causar daño irreversible en el proyecto.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

[ -z "$COMMAND" ] && exit 0

PATRONES=(
  "rm -rf /"
  "rm -rf \."
  "rm -rf \*"
  "git push --force[^-]"
  "git push -f "
  "git reset --hard"
  "git clean -fd"
  "git clean -fxd"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE TABLE"
  "DELETE FROM .* WHERE 1=1"
)

for patron in "${PATRONES[@]}"; do
  if echo "$COMMAND" | grep -iE "$patron" > /dev/null 2>&1; then
    cat <<EOF >&2
BLOQUEADO: Comando potencialmente destructivo.
Comando: $COMMAND
Motivo: coincide con patrón de riesgo "$patron"

Si necesitás ejecutarlo, hacelo manualmente en la terminal
con plena conciencia de las consecuencias.
EOF
    exit 2
  fi
done

exit 0
