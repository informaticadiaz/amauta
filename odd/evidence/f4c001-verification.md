# Verificación de F4c-001 — Catálogo de materias

Fecha: 2026-11-12
Rama: `master`
Commit de trabajo: `ab024aa` (`feat: cerrar F4c-001 catálogo de materias`)
Alcance: verificación local y aislada; no se consultó ni modificó producción.

## Resultado

F4c-001 queda **verificado y listo para cierre formal**. La implementación cubre el catálogo institucional, la migración de calificaciones a `materiaId`, el CRUD administrativo, la asignación de materias a grupos, los proxies frontend y la cobertura de regresión correspondiente.

## Evidencia

- Tests focalizados API de materias: 2 suites, 18 tests aprobados.
- Tests completos API: 28 suites, 350 tests aprobados.
- Tests completos web: 58 suites, 263 tests aprobados.
- Type-check monorepo: 4 tareas exitosas.
- Lint monorepo: 4 tareas exitosas.
- Build monorepo: 4 tareas exitosas.
- Formato de archivos modificados: aprobado con Prettier.
- `git diff --check`: aprobado.
- Prisma en PostgreSQL descartable vacía:
  - `prisma validate`: aprobado.
  - `prisma generate`: aprobado.
  - `prisma migrate deploy`: 11 migraciones aplicadas, incluida F4c-001.
  - `prisma migrate status`: schema actualizado.
  - restricciones FK y unique de `calificaciones.materiaId`: presentes.
- Migración con fixture legacy en PostgreSQL descartable:
  - 2 calificaciones legacy conservaron nota y observaciones.
  - Se crearon 2 materias institucionales.
  - Se crearon 2 asignaciones grupo-materia.
  - 0 calificaciones quedaron sin `materiaId`.

## Cambios verificados

- Backend: `safeParse`, conflictos de nombres como `409 Conflict`, CRUD, permisos, soft delete/reactivación y asignación/remoción.
- Frontend: proxies `POST`/`DELETE` para `grupos/:grupoId/materias/:materiaId`, manejo de `204 No Content` y cobertura de `MateriasSection` y proxies.
- Documentación: calificaciones y análisis funcional actualizados para `materiaId`, catálogo institucional y `GrupoMateria`.

## Observaciones no bloqueantes

- ESLint emite el warning existente sobre la configuración `.eslintrc` deprecated; no hay errores.
- Los tests existentes muestran warnings de React/Tiptap no relacionados con F4c-001.
- Permanecen artefactos generados locales ajenos al trabajo funcional: `apps/web/next-env.d.ts`, `apps/web/public/sw.js` y `apps/web/public/workbox-b52a85cb.js`. No fueron incluidos en el cambio.

## Decisión

La evidencia satisface S1-S3 de `odd/tasks/f4c001-cierre.md`. F4c-001 quedó marcado como completado en el roadmap y el commit de trabajo es `ab024aa`.
