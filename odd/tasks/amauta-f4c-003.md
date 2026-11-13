# ODD Plan — Amauta F4c-003: historial académico API

Repositorio: `/home/ignacio/amauta`
Fuente canónica: `docs/project-management/roadmap.md`

## Specs

### S1 — Continuar el trabajo pendiente del módulo escolar

> "quiero seguir trabajando en amauta"

El siguiente trabajo planificado es F4c-003 — Historial académico del estudiante, según `docs/project-management/roadmap.md`.

### S2 — Alcance autorizado de esta entrega

> "API y tests primero"

Implementar primero la API y sus tests para el historial académico; dejar la UI para una segunda entrega.

### S3 — Contrato inicial de historial

El roadmap define estos endpoints:

- `GET /me/historial` → todas las calificaciones del estudiante agrupadas por período y materia.
- `GET /instituciones/:id/estudiantes/:estudianteId/historial` → vista administrativa del legajo.
- Promedio general acumulado y evolución por materia entre períodos.
- Registro de estado de promoción por período (`PROMOVIDO` / `REPITENTE` / `EGRESADO`).

En esta entrega no se inventará persistencia para estados de promoción ni se incorporarán asistencia, gráficos o descarga de boletín sin una decisión posterior, porque el modelo actual no contiene aún un estado de promoción por período y el detalle del issue separa esas capacidades.

## Tasks

- T1 — S1-S3 — Mapear contrato y modelos existentes — commit pendiente
- T2 — S2-S3 — Implementar endpoints y autorización administrativa — completado; commit pendiente
- T3 — S2-S3 — Agregar tests de servicio/controller y regresiones — completado; commit pendiente
- T4 — S1-S3 — Verificar, documentar evidencia y actualizar roadmap — completado; commit `062f9bc`
- T5 — S2-S3 — Implementar UI estudiantil del historial académico y proxy — completado; commit `325e38b`
- T6 — S2-S3 — Implementar vista administrativa de historial para ADMIN_ESCUELA — completado; commit `f69b03d`
- T7 — S3 — Documentar diseño de estado de promoción y cierre, sin modificar schema — completado; commit pendiente

## Log

- L1 — Usuario: "quiero seguir trabajando en amauta"
- L2 — Se consultó el estado del repositorio: F4c-001 y F4c-002 están implementados; el roadmap marca F4c-003 como siguiente trabajo. Hay artefactos PWA sin seguimiento (`apps/web/public/sw.js` y `apps/web/public/workbox-b52a85cb.js`) que se preservan fuera de este alcance.
- L3 — El usuario eligió "API y tests primero" como alcance de la primera entrega.
- L4 — Se implementaron `GET /api/v1/me/historial` y `GET /api/v1/instituciones/:institucionId/estudiantes/:estudianteId/historial`, con agrupación por período/materia, promedios por período, promedio acumulado y evolución por materia. `estadoPromocion` queda explícitamente en `null` porque el schema actual no lo persiste.
- L5 — Verificación: 2 suites y 9 tests focalizados, type-check, ESLint del módulo y `git diff --check` aprobados. El verificador independiente ejecutó además las 32 suites/381 tests de API y build API, todos aprobados.
- L6 — Documentación actualizada en `AGENTS.md` y `docs/project-management/roadmap.md`; la UI, la descarga/gráficos y la persistencia de promoción quedan fuera de esta entrega API-first.
- L7 — El usuario indicó "continuemos"; se autoriza continuar F4c-003 con una primera UI estudiantil. El alcance es proxy, página, navegación y tests; no se agregan promoción, asistencia, gráficos ni descargas.
- L8 — Se implementó la UI estudiantil en `/dashboard/historial`, el proxy `/api/me/historial` y navegación desktop/móvil. Verificación: 5 suites/12 tests focalizados, suite web completa con 65 suites/281 tests, type-check, lint, Prettier y `git diff --check` aprobados. La vista administrativa, promoción, asistencia, gráficos y descargas siguen fuera de alcance.
- L9 — El usuario indicó "continuemos"; se autoriza una vista administrativa de solo lectura para `ADMIN_ESCUELA`, con selección de estudiantes y detalle reutilizando el componente académico. `SUPER_ADMIN` queda fuera de esta UI inicial porque todavía falta una selección explícita de institución.
- L10 — Se implementaron `/dashboard/historial/estudiantes`, su detalle por estudiante, el proxy administrativo y navegación desktop/móvil. Verificación: 10 suites/30 tests focalizados, type-check, lint, Prettier y `git diff --check` aprobados; el worker reportó además 69 suites/291 tests web completos aprobados. La UI administrativa sigue siendo de solo lectura y no muestra promoción, asistencia, gráficos ni descargas.
- L11 — El usuario eligió documentar primero el diseño, sin modificar el schema. Decisiones: estado por estudiante × grupo × período; `EN_RIESGO` queda fuera por ahora; la próxima implementación debe limitarse a una migración/API planificada separadamente del cierre masivo F4c-005.
- L12 — Se creó el ADR propuesto `docs/technical/adr/012-estado-promocion-y-cierre-academico.md` y se agregó al índice de ADRs y al roadmap. No se modificó Prisma, no se creó migración y no se ejecutaron cambios de datos.
