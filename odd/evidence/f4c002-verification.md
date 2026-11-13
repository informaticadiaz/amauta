# Verificación de F4c-002 — Matrícula formal

Fecha: 2026-11-12
Rama: `master`
Commits de trabajo: `38c21a3` (API), `acd7766` (web), `887c4d2` (documentación y evidencia)
Alcance: verificación local y aislada; no se consultó ni modificó producción.

## Resultado

F4c-002 queda verificado para cierre formal. La implementación formaliza la relación estudiante–institución–período, agrega padrón administrativo paginado y filtrable, permite altas y cambios de estado, y exige matrícula activa exacta al asignar estudiantes a grupos.

## Evidencia

- Tests completos API: 30 suites, 374 tests aprobados.
- Tests completos web: 61 suites, 272 tests aprobados.
- Type-check monorepo: aprobado.
- Lint monorepo: 4 tareas exitosas; solo warnings preexistentes de ESLint sobre `.eslintrc` deprecated.
- Build monorepo: 4 tareas exitosas.
- Formato de fuentes y documentación modificadas: aprobado.
- `git diff --check`: aprobado.
- PostgreSQL descartable:
  - 12 migraciones aplicadas correctamente.
  - `20261113013417_matriculas_formales` aplicada correctamente.
  - `prisma migrate status`: schema actualizado.
- Migración local:
  - `prisma validate`: aprobado.
  - `prisma generate`: aprobado.
  - `prisma migrate dev`: aplicado sobre la base local de desarrollo.

## Cambios verificados

- Modelo `Matricula` con unicidad por estudiante, institución y período.
- Estados `ACTIVA`, `BAJA` y `EGRESADO`.
- Observaciones opcionales para registrar motivos.
- API administrativa de alta, padrón paginado/filtrable y actualización de estado.
- Validación de estudiante activo, rol, institución, período y permisos administrativos.
- Asignación a grupos bloqueada cuando el grupo no tiene período o no existe matrícula `ACTIVA` exacta.
- Página `/dashboard/matriculas` para `ADMIN_ESCUELA`.
- Proxies Next.js, navegación lateral y documentación técnica/funcional.

## Observación de migración

La migración generada incluye dos normalizaciones de diferencias preexistentes detectadas por Prisma: el tipo de `lecciones.estado` y el nombre truncado de un índice de calificaciones. Se verificaron en una base descartable junto con la creación de `matriculas`; no se modificó producción.

## Decisión

La evidencia satisface S1-S3 de `odd/tasks/f4c002-matricula.md`. F4c-002 quedó marcado como completado en el roadmap y sus commits son `38c21a3`, `acd7766` y `887c4d2`.
