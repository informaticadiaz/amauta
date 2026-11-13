# ADR-012: Estado de promoción por estudiante, grupo y período

## Estado

Aceptado para persistencia y lectura; cálculo y cierre masivo pendientes

## Fecha

2026-11

## Decisión resumida

El estado de promoción se modela como una entidad independiente por **estudiante × grupo × período académico**. Esta entrega implementa la persistencia estructural y la lectura desde el historial; no calcula promoción, no ejecuta cierre masivo, no realiza backfill y no incorpora una interfaz de escritura.

## Contexto

F4c-003 ya expone el historial académico y sus vistas estudiantil y administrativa, pero `estadoPromocion` permanece en `null` porque el schema actual no persiste ese dato.

El roadmap de F4c-005 requiere generar el estado por estudiante y grupo durante el cierre de período, conservar una posible sobrescritura administrativa y bloquear registros cuando el período quede cerrado. `Matricula` identifica estudiante, institución y período, mientras que `Grupo` puede asociarse opcionalmente a un período. Por eso guardar el estado solamente en `Matricula` no conserva la trazabilidad del grupo.

## Decisiones adoptadas

| Tema                  | Decisión                                                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Granularidad          | Un registro por estudiante, grupo y período académico.                                                                                                     |
| Estados de esta etapa | `PROMOVIDO`, `REPITENTE` y `EGRESADO`.                                                                                                                     |
| `EN_RIESGO`           | Queda excluido por ahora; no será un estado final persistido en esta primera definición.                                                                   |
| Historial             | No se realizará backfill automático de períodos históricos sin estado. Se mostrarán como sin evaluar hasta definir una regla explícita.                    |
| F4c-003               | Leerá el estado final persistido cuando exista; no calculará promoción implícitamente.                                                                     |
| F4c-005               | Será responsable del cálculo, preview, confirmación y cierre masivo. Es una entrega posterior, no parte de esta ADR implementable.                         |
| Cierre del período    | No se reutilizará `PeriodoAcademico.activo`, porque hoy representa vigencia administrativa/soft delete. Se requiere un estado o marca de cierre explícita. |
| Alcance actual        | Persistencia y lectura implementadas en Prisma, API y UI. El cálculo, preview, confirmación y cierre masivo quedan para F4c-005.                           |

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

## Contrato de cierre pendiente

Antes de implementar la migración y el cierre masivo se deben definir:

1. Nota mínima de aprobación y tratamiento de materias sin calificación.
2. Porcentaje mínimo de asistencia.
3. Tratamiento de `TARDANZA` y `JUSTIFICADO`.
4. Redondeo y escala aplicable.
5. Qué ocurre con grupos sin período académico.
6. Qué escrituras bloquea un período cerrado.
7. Si existe reapertura y qué rol puede ejecutarla.
8. Si la sobrescritura conserva estado calculado y final por separado.
9. Cómo se mostrarán períodos históricos sin estado.

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
- No se ejecuta cálculo automático, backfill, cierre masivo ni escritura desde la UI.
- El repositorio no tiene un patrón establecido de tests de integración automatizados para este módulo; la integración fue verificada mediante migración aplicada, consultas Prisma reales y datos locales, pero queda como deuda de infraestructura de testing.
- La decisión mantiene separado el cálculo y cierre futuro de F4c-005.

## Referencias

- `docs/project-management/roadmap.md` — F4c-003 y F4c-005.
- `apps/api/prisma/schema.prisma` — `Matricula`, `PeriodoAcademico`, `Grupo`, `GrupoEstudiante`, `Asistencia` y `Calificacion`.
- `docs/ai-context/modules/boletin.md` — cálculo de asistencia por rango de fechas.
- `odd/tasks/amauta-f4c-003.md` — historial de decisiones y límites de alcance.
