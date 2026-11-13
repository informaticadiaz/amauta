# ODD Plan — Amauta F4c-005: cierre de ciclo lectivo y promoción masiva

Estado: completado e integrado en `master` mediante `dd89338` (PR #112). Este documento conserva el registro histórico; la fuente vigente del estado de producto es `docs/project-management/roadmap.md`.

Repositorio: `/home/ignacio/amauta`
Fuente canónica: `docs/project-management/roadmap.md`

## Specs

### S1 — Continuar el trabajo planificado del proyecto

> "quiero seguir trabajando en el proyecto"

El usuario eligió avanzar con `F4c-005` después de revisar el roadmap y el estado actual del repositorio.

### S2 — Contrato funcional del roadmap

El roadmap define para F4c-005:

- Acción de cierre de período: genera `EstadoPromocion` por estudiante × grupo.
- Reglas configurables por institución: % asistencia mínima + nota de aprobación (ya en escala).
- Promoción masiva con preview: lista de alumnos con estado calculado (`PROMOVIDO` / `EN_RIESGO` / `REPITENTE`).
- El admin puede sobrescribir el estado calculado con justificación.
- Al confirmar: el período queda `CERRADO` (no acepta más registros de asistencia/calificaciones).
- Generación de acta de cierre (PDF descargable).

### S3 — Decisiones funcionales confirmadas

El usuario seleccionó:

- Regla promoción: "Todas las materias + asistencia" — debe alcanzar la nota mínima en cada materia y el porcentaje mínimo de asistencia.
- Estado riesgo: "Solo en preview" — al confirmar solo se persiste `PROMOVIDO` o `REPITENTE`.
- Asistencia: "Presente + justificado" — se mantiene el criterio actual del boletín; `TARDANZA` no suma asistencia.
- Alcance cierre: "Período completo y un PDF" — el admin confirma todos los grupos del período y descarga un acta institucional única.

### S4 — Límites derivados del ADR-012

- `EN_RIESGO` no se agrega como estado final persistido.
- El estado mantiene granularidad estudiante × grupo × período.
- El cierre requiere una marca explícita y no reutiliza `PeriodoAcademico.activo`.
- El cálculo debe conservar las métricas y el estado calculado cuando exista sobrescritura administrativa.
- No se hace backfill implícito de períodos históricos sin estado.

## Tasks

- T1 — S1-S4 — Mapear schema, contratos y reglas de cálculo existentes — completado; commit `779201c`.
- T2 — S2-S4 — Implementar modelo/migración de cierre y motor de preview — completado; commit `779201c`.
- T3 — S2-S4 — Implementar confirmación, sobrescrituras y bloqueo post-cierre — completado; commit `779201c`.
- T4 — S2-S4 — Implementar endpoint/UI de cierre y acta PDF — completado; commit `779201c`.
- T5 — S1-S4 — Agregar tests, documentación y verificación completa — completado; commit `779201c`.

## Log

- L1 — Usuario: "quiero seguir trabajando en el proyecto"
- L2 — El roadmap marca F4c-005 como siguiente trabajo. La persistencia y lectura de `EstadoPromocion` de F4c-003 ya están implementadas; cálculo, preview, confirmación, cierre y acta siguen pendientes.
- L3 — La exploración identificó que el schema actual no tiene marca de cierre ni métricas/auditoría de promoción; asistencia y calificaciones tampoco bloquean períodos cerrados.
- L4 — El usuario confirmó: "Todas las materias + asistencia"; "Solo en preview" para `EN_RIESGO`; "Presente + justificado"; y "Período completo y un PDF".
- L5 — La inspección confirmó que `PeriodoAcademico` solo tiene `activo`, `EstadoPromocion` solo persiste `estado`, y que boletín ya calcula asistencia como `PRESENTE + JUSTIFICADO`; calificaciones y asistencias aún no consultan un cierre explícito.
- L6 — `npx prisma migrate status` no pudo iniciar porque falta `DATABASE_URL`; el repositorio no tiene `apps/api/.env.local`. Por la política del proyecto, no se modifica el schema ni se crea una migración hasta disponer de una conexión de desarrollo válida.
- L7 — El usuario creó `apps/api/.env.local`; Prisma confirmó la conexión a `amauta_dev` y las 13 migraciones están aplicadas.
- L8 — El usuario definió que una nota faltante clasifica como `REPITENTE` y la ausencia de registros de asistencia se calcula como `0%`.
- L9 — T2 agregó el estado explícito de cierre del período (`ABIERTO`/`CERRADO`), configuración de asistencia mínima por período con default 75%, y métricas/auditoría para conservar estado calculado y final sin agregar `EN_RIESGO` al enum persistido.
- L10 — Se implementó `GET /api/v1/instituciones/:institucionId/periodos/:periodoId/cierre-academico/preview`, protegido para `ADMIN_ESCUELA` y `SUPER_ADMIN`, con scope de todos los grupos activos de la institución y período.
- L11 — El preview aplica nota mínima de `EscalaCalificacion.notaAprobacion`, exige todas las materias activas, calcula asistencia como `PRESENTE + JUSTIFICADO` sobre todos los registros del período, excluye `TARDANZA`, clasifica ausencia de registros como `0%` y devuelve razones explícitas para `REPITENTE`.
- L12 — Tests focalizados: 6 tests pasando; cubren promoción, asistencia, notas faltantes/insuficientes, grupos vacíos, scope institucional/período y autorización.
- L13 — Verificación T2: `prisma migrate status`, type-check, lint de archivos tocados y `git diff --check` pasan.
- L14 — T3 implementó confirmación transaccional institucional, recalculo desde datos actuales, persistencia de métricas/estado calculado, sobrescrituras auditadas y cierre atómico con rechazo de períodos ya cerrados.
- L15 — T3 bloquea escrituras de asistencias y calificaciones en períodos cerrados, valida el período de calificaciones contra el grupo y mantiene lecturas disponibles.
- L16 — Tests focalizados API: 34 tests pasando; cubren confirmación, sobrescritura/justificación/auditoría, rechazo idempotente y bloqueos post-cierre.
- L17 — T4 implementó la pantalla administrativa `/dashboard/cierre-academico` para ADMIN_ESCUELA: selección del período de la institución asociada, preview de todos los grupos/estudiantes, métricas y razones, estado final limitado a PROMOVIDO/REPITENTE, justificación obligatoria para cambios, confirmación y feedback de período cerrado.
- L18 — T4 agregó proxies Next.js para preview, confirmación y descarga del acta PDF; no se agregó selector de institución para SUPER_ADMIN, conservando la limitación existente del panel administrativo.
- L19 — T4 agregó `GET /api/v1/instituciones/:institucionId/periodos/:periodoId/cierre-academico/acta`, autorizado para ADMIN_ESCUELA/SUPER_ADMIN, rechazando períodos abiertos y generando un PDF determinista sin dependencias con institución, período, grupos, estados, métricas y justificaciones.
- L20 — Verificación T4: tests API focalizados 12 pasando; test de proxy web focalizado 2 pasando; `npm run type-check` 4 tareas exitosas; ESLint focalizado de fuentes tocadas sin errores; `git diff --check` sin salida.
- L21 — La verificación independiente detectó una regresión del test estructural de Prisma causada por un comentario que contenía el nombre del estado de preview; se corrigió el comentario sin cambiar el enum ni el comportamiento.
- L22 — Verificación final: API completa 34 suites/400 tests; Web completa 70 suites/296 tests; `prisma migrate status` con 14 migraciones al día; type-check del monorepo, ESLint focalizado y `git diff --check` pasan. La comprobación Prettier del roadmap existente reporta estilo previo no normalizado; el documento conserva un diff acotado a F4c-003/F4c-005.
