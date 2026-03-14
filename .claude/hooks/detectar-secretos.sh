#!/bin/bash
# Hook: detectar-secretos.sh
# Detecta posibles secretos hardcodeados antes de guardar un archivo.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

[ -z "$FILE" ] || [ -z "$CONTENT" ] && exit 0

# No verificar archivos .env (son el lugar correcto para secretos)
if [[ "$FILE" =~ \.env(\.|$|-) ]] || [[ "$FILE" =~ \.env$ ]]; then
  exit 0
fi

# No verificar archivos de documentación
if [[ "$FILE" =~ \.(md|txt)$ ]]; then
  exit 0
fi

PATRONES=(
  'api[_-]?key\s*[:=]\s*["'"'"'][a-zA-Z0-9_\-]{16,}'
  'secret\s*[:=]\s*["'"'"'][a-zA-Z0-9_\-]{16,}'
  'password\s*[:=]\s*["'"'"'][^"'"'"']{8,}'
  'token\s*[:=]\s*["'"'"'][a-zA-Z0-9_\-]{20,}'
  'BEGIN (RSA |EC )?PRIVATE KEY'
  'sk-[a-zA-Z0-9]{40,}'
  'NEXTAUTH_SECRET\s*=\s*[a-zA-Z0-9]{20,}'
  'DATABASE_URL\s*=\s*postgresql://'
)

for patron in "${PATRONES[@]}"; do
  if echo "$CONTENT" | grep -iE "$patron" > /dev/null 2>&1; then
    cat <<EOF >&2
SEGURIDAD: Posible secreto detectado en $FILE

Los secretos no deben hardcodearse en el código fuente.

Solución correcta:
  1. Definí la variable en el archivo .env:
     MI_SECRET=valor_real

  2. Usala en el código:
     process.env.MI_SECRET          (Node.js)
     configService.get('MI_SECRET') (NestJS)

El archivo .env está en .gitignore y nunca se commitea.
EOF
    exit 2
  fi
done

exit 0
