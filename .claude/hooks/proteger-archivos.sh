#!/bin/bash
# Hook: proteger-archivos.sh
# Bloquea modificaciones a archivos críticos del proyecto.
# Estos archivos deben editarse manualmente con conciencia plena.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE" ] && exit 0

declare -A PROTEGIDOS
PROTEGIDOS[".env"]="Contiene secretos. Editá manualmente."
PROTEGIDOS[".env.production"]="Variables de producción. Editá solo con supervisión."
PROTEGIDOS[".env.local"]="Variables locales sensibles. Editá manualmente."
PROTEGIDOS[".github/workflows"]="Pipeline CI/CD. Un cambio mal hecho rompe el deploy."
PROTEGIDOS["package-lock.json"]="Generado automáticamente. Ejecutá 'npm install' para actualizarlo."
PROTEGIDOS[".husky"]="Hooks de git ya configurados. No modificar."
PROTEGIDOS["commitlint.config"]="Reglas de commits ya definidas. No modificar."

for archivo in "${!PROTEGIDOS[@]}"; do
  if [[ "$FILE" == *"$archivo"* ]]; then
    cat <<EOF >&2
ARCHIVO PROTEGIDO: $FILE
Motivo: ${PROTEGIDOS[$archivo]}

Editá este archivo manualmente si realmente es necesario.
EOF
    exit 2
  fi
done

exit 0
