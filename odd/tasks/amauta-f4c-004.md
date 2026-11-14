# ODD Plan — Amauta F4c-004: horarios semanales por grupo

Estado: en progreso
Repositorio: `/home/ignacio/amauta`
Fuente canónica: `docs/project-management/roadmap.md`

## Specs

### S1 — Continuar el trabajo planificado del proyecto

> "quiero continuar trabajando con amauta"

El usuario confirmó avanzar con la siguiente funcionalidad del roadmap: F4c-004.

### S2 — Contrato funcional del roadmap

El roadmap define para F4c-004:

- Entidad `FranjaHoraria`: `grupoId`, `materiaId`, `educadorId`, `diaSemana` (LUN-VIE), `horaInicio`, `horaFin`, `activo`.
- CRUD de horario por grupo (`ADMIN_ESCUELA`).
- Vista semanal del grupo (tabla día × hora).
- Vista del educador: mis clases de la semana.
- Vista del estudiante: mi horario semanal.

### S3 — Decisiones funcionales confirmadas

- Solapamientos: bloquear franjas superpuestas para el mismo grupo y para el mismo educador.
- Educadores: una franja solo puede asignarse a un educador con asignación activa en `GrupoEducador`.
- Horas: persistir texto `HH:mm`, validando formato y que `horaInicio` sea menor que `horaFin`.

### S4 — Límites de autorización y consistencia

- Las franjas solo pueden usar materias activas asignadas al grupo mediante `GrupoMateria`.
- Las consultas de educadores y estudiantes deben respetar sus asignaciones activas al grupo.
- La baja será lógica mediante `activo = false`.
- No se incorporan fines de semana ni períodos independientes de los definidos por el grupo en esta entrega.

## Tasks

- T1 — S1-S4 — Mapear contratos, schema y patrones reutilizables — completado.
- T2 — S2-S4 — Implementar modelo Prisma, migración y validaciones de dominio — completado; pendiente verificación final del conjunto.
- T3 — S2-S4 — Implementar API de CRUD y consultas semanales por rol — completado; pendiente verificación final del conjunto.
- T4 — S2-S4 — Implementar proxies, vistas administrativas, educador y estudiante — completado.
- T5 — S2-S4 — Agregar tests focalizados y actualizar documentación — completado.
- T6 — S1-S4 — Ejecutar verificación final y registrar evidencia — completado.

## Log

- L1 — Usuario: "quiero continuar trabajando con amauta"
- L2 — El roadmap identifica F4c-004 como el siguiente trabajo, luego de F4c-005.
- L3 — La exploración confirmó que no existe aún `FranjaHoraria`, `DiaSemana` ni rutas de horarios. `GrupoMateria` y `GrupoEducador` aportan las relaciones y validaciones necesarias.
- L4 — El usuario confirmó: "si" para avanzar con F4c-004.
- L5 — El usuario eligió bloquear solapamientos de grupo y educador, limitar educadores a asignaciones activas del grupo y guardar horas como texto `HH:mm`.
- L6 — La verificación previa confirmó 14 migraciones aplicadas y schema actualizado antes de crear la migración de horarios. El backend agregó `DiaSemana`, `FranjaHoraria`, CRUD administrativo, consultas por rol y 4 tests focalizados; type-check, lint y validación Prisma pasan.
- L7 — La UI agregó proxies para CRUD y consultas por rol, vistas semanales responsive para admin/educador/estudiante y navegación del sidebar. La suite web completa pasó con 71 suites y 298 tests; los tests focalizados nuevos de horarios pasaron con 3 suites y 6 tests; ambos type-checks y lint focalizado pasan.
- L8 — Se agregaron pruebas de forwarding para los proxies grupales, edición/baja, educador y estudiante; tras ajustar las expectativas al `API_URL` capturado por módulo, las 5 pruebas de los proxies grupales y las 6 pruebas restantes de horarios pasan. Se actualizó la guía funcional de grupos, el README del sistema y el estado F4c-004 del roadmap.
- L9 — Verificación final: 35 suites/404 tests de API pasan; 71 suites/298 tests web pasan; 11 tests focalizados de horarios pasan; type-check del monorepo, lint focalizado, Prisma validate, migraciones (15 aplicadas), Prettier y `git diff --check` pasan. Quedan cambios sin commit; no se hizo commit ni push.
