# ADR-012: Estado de promoción por estudiante, grupo y período

## Estado

Aceptado e implementado; actualizado por F4c-005 (PR #112)

## Fecha

2026-11

## Decisión resumida

El estado de promoción se modela como una entidad independiente por **estudiante × grupo × período académico**. F4c-003 implementó la persistencia estructural y la lectura desde el historial; F4c-005 agregó el cálculo, preview, confirmación, sobrescritura auditada, cierre masivo y acta institucional.

## Contexto

F4c-003 expone el historial académico y sus vistas estudiantil y administrativa. El estado de promoción se persiste cuando existe un cierre confirmado; los períodos sin registro se muestran como sin evaluar.

El roadmap de F4c-005 requiere generar el estado por estudiante y grupo durante el cierre de período, conservar una posible sobrescritura administrativa y bloquear registros cuando el período quede cerrado. `Matricula` identifica estudiante, institución y período, mientras que `Grupo` puede asociarse opcionalmente a un período. Por eso guardar el estado solamente en `Matricula` no conserva la trazabilidad del grupo.

## Decisiones adoptadas

| Tema                  | Decisión                                                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Granularidad          | Un registro por estudiante, grupo y período académico.                                                                                                     |
| Estados de esta etapa | `PROMOVIDO`, `REPITENTE` y `EGRESADO`.                                                                                                                     |
| `EN_RIESGO`           | Queda excluido por ahora; no será un estado final persistido en esta primera definición.                                                                   |
| Historial             | No se realizará backfill automático de períodos históricos sin estado. Se mostrarán como sin evaluar hasta definir una regla explícita.                    |
| F4c-003               | Leerá el estado final persistido cuando exista; no calculará promoción implícitamente.                                                                     |
| F4c-005               | Implementa el cálculo, preview, confirmación, sobrescritura auditada, cierre masivo y acta institucional.                                                  |
| Cierre del período    | No se reutilizará `PeriodoAcademico.activo`, porque hoy representa vigencia administrativa/soft delete. Se requiere un estado o marca de cierre explícita. |
| Alcance actual        | Persistencia, lectura, cálculo, preview, confirmación, sobrescritura auditada y cierre implementados en Prisma, API y UI.                                  |

## Modelo implementado y extensión futura

La entidad `EstadoPromocion` implementada conserva como mínimo:

- `estudianteId`.
- `grupoId`.
- `periodoAcademicoId`.
- Estado calculado y estado final, si se permite sobrescritura.
- Justificación de la sobrescritura.
- Usuario y fecha de la sobrescritura.
- Métricas congeladas usadas para decidir, como promedio y porcentaje de asistencia.
- Timestamps.
- Unicidad por `grupoId + estudianteId + periodoAcademicoId`.

El `periodoAcademicoId` es deliberadamente explícito aunque el grupo lo pueda referenciar: permite consultar el historial directamente y protege la semántica si la relación del grupo cambia en el futuro.

## Contrato de cierre implementado

F4c-005 implementa las siguientes reglas y límites:

1. Se consideran todas las materias activas del grupo.
2. Una nota faltante implica `REPITENTE`.
3. `PRESENTE` y `JUSTIFICADO` cuentan para asistencia; `TARDANZA` no.
4. Un período sin asistencias equivale a 0% de asistencia.
5. `EN_RIESGO` queda reservado para preview y no se persiste como estado final.
6. La confirmación cierra explícitamente el período y bloquea nuevas asistencias y calificaciones.
7. La sobrescritura conserva el estado calculado, el estado final, la justificación, el usuario y la fecha.
8. No se implementó reapertura.
9. Los períodos sin estado persistido se muestran como `SIN EVALUAR`.

## Consecuencias

### Positivas

- Conserva la trazabilidad exigida por el cierre por grupo.
- Separa el historial académico de la matrícula institucional.
- Permite auditar cálculos y sobrescrituras.
- Evita inferir estados históricos sin reglas aprobadas.

### Negativas

- Requiere una migración y una API adicionales.
- El cierre deberá coordinar calificaciones y asistencias, que actualmente no comparten la misma referencia temporal.
- F4c-003 devuelve una lista de estados por grupo y período; cuando no existe un registro, el estado se representa como `null` en la API y `SIN EVALUAR` en la UI.

## Verificación de esta etapa

- Se agregó `EstadoPromocion` y una migración Prisma versionada.
- La migración se aplicó en la base local y `prisma migrate status` confirmó que está al día.
- `prisma validate`, type-check y tests unitarios focalizados pasan.
- El cálculo, preview, confirmación, sobrescritura auditada, cierre masivo y descarga del acta están implementados en API y UI; no se realiza backfill automático de períodos históricos.
- El repositorio no tiene un patrón establecido de tests de integración automatizados para este módulo; la integración fue verificada mediante migración aplicada, consultas Prisma reales y datos locales, pero queda como deuda de infraestructura de testing.
- F4c-005 fue integrado mediante la PR #112 (`dd89338`) y el pipeline de `master` terminó con validaciones, build, deploy y healthcheck exitosos.

## Referencias

- `docs/project-management/roadmap.md` — F4c-003 y F4c-005.
- `apps/api/prisma/schema.prisma` — `Matricula`, `PeriodoAcademico`, `Grupo`, `GrupoEstudiante`, `Asistencia` y `Calificacion`.
- `docs/ai-context/modules/boletin.md` — cálculo de asistencia por rango de fechas.
- `odd/tasks/amauta-f4c-003.md` — historial de decisiones y límites de alcance.
