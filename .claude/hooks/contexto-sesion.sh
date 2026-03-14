#!/bin/bash
# Hook: contexto-sesion.sh
# Inyecta contexto crítico del proyecto al iniciar o retomar una sesión.
# Esto ayuda a que Claude no "olvide" reglas importantes después de un /compact.

cat <<'EOF'
=== CONTEXTO AMAUTA ===

Stack:
  - Frontend: Next.js 14 (App Router) → apps/web/
  - Backend:  NestJS + Fastify        → apps/api/
  - ORM:      Prisma
  - DB:       PostgreSQL en VPS (NO hay DB local)

Reglas que no se negocian:
  - Usar safeParse() con Zod, NUNCA parse() directo
  - Soft delete: estado = ARCHIVADO, NUNCA prisma.delete()
  - Leer schema.prisma ANTES de escribir cualquier query
  - La DB está en producción: verificar antes de cualquier migración

Fase actual: Fase 1 MVP (13/16 issues completados)
  - Próximos: F1-014 (API progreso), F1-015 (UI marcar lecciones), F1-016 (dashboard)
  - Para detalles: docs/project-management/roadmap.md

Usuarios de prueba (password: password123):
  - estudiante1@amauta.test / educador1@amauta.test / admin1@amauta.test
======================
EOF

exit 0
