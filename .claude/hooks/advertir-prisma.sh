#!/bin/bash
# Hook: advertir-prisma.sh
# Advierte o bloquea operaciones de Prisma que afectan la DB de producción.
# IMPORTANTE: En Amauta no hay DB local. Toda operación afecta producción.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

[ -z "$COMMAND" ] && exit 0

# Bloquear reset (destruye todos los datos)
if echo "$COMMAND" | grep -E "prisma migrate reset" > /dev/null 2>&1; then
  cat <<EOF >&2
BLOQUEADO: prisma migrate reset

Este comando ELIMINA TODOS LOS DATOS de la base de datos.
En Amauta, la DB está en producción (VPS). No hay DB local.

Ejecutar esto borraría todos los datos reales de usuarios,
cursos, lecciones e inscripciones.

Si necesitás hacer esto, ejecutalo manualmente con plena conciencia.
EOF
  exit 2
fi

# Advertir sobre deploy (ejecuta migraciones en producción)
if echo "$COMMAND" | grep -E "prisma migrate (dev|deploy)" > /dev/null 2>&1; then
  cat <<EOF >&2
ADVERTENCIA: Operación de migración de Prisma detectada.

En Amauta NO HAY base de datos local.
Este comando afecta directamente la base de datos de PRODUCCIÓN.

Antes de continuar verificá:
  - ¿La migración fue revisada?
  - ¿El equipo está al tanto?
  - ¿Hay backup disponible?

Ver: ia-skills/prisma-db-management.md
EOF
  # Solo advertimos, no bloqueamos. El desarrollador decide.
  exit 0
fi

# Validar schema si se está generando el cliente
if echo "$COMMAND" | grep -E "prisma (generate|validate|format)" > /dev/null 2>&1; then
  exit 0
fi

exit 0
