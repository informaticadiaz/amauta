#!/bin/bash
# Hook: validar-schema-prisma.sh
# Valida la sintaxis del schema.prisma después de cada modificación.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Solo aplica al schema de Prisma
[[ ! "$FILE" =~ schema\.prisma$ ]] && exit 0

cd "$CWD" || exit 0

OUTPUT=$(npx prisma validate 2>&1)

if [ $? -ne 0 ]; then
  cat <<EOF >&2
Error en schema.prisma:

$OUTPUT

Corregí los errores antes de continuar.

Problemas comunes:
  - Relaciones mal definidas (falta el campo inverso)
  - Tipos de datos incorrectos
  - Falta @id en algún modelo
  - Enums con valores no definidos
EOF
  exit 2
fi

echo "schema.prisma válido ✓" >&2
exit 0
