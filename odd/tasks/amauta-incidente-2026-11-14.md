# ODD Plan — Amauta: recuperación del incidente 2026-11-14

Estado: completado localmente; se reparó el frontend y se verificó la migración en un entorno descartable, sin intervenir producción.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Resolver la indisponibilidad del frontend

> "avancemos con la solucion de los problemas"

El frontend debe dejar de fallar por el conflicto entre rutas dinámicas equivalentes `[id]` e `[institucionId]`, responder HTTP 200 en `/` y quedar listo para una verificación de healthcheck.

### S2 — Resolver el bloqueo de la migración de materias

El despliegue de la API no debe continuar bloqueado por `P3009` en `20261016000100_materias_escolares`. La corrección debe probarse contra una base descartable o representativa antes de cualquier intervención productiva.

### S3 — Mantener separado el cambio productivo

La reparación local, el commit y la preparación de despliegue no autorizan por sí solos cambios en producción, migraciones productivas, reinicios, DNS ni publicación.

## Tasks

### T1 — Corregir el conflicto de rutas dinámicas

- Estado: completado
- Commit: pendiente de decisión separada
- Specs: S1
- Ruta: `apps/web/src/app/api/instituciones/`
- Resultado: la ruta de historial administrativo usa `[id]`, con handler y tests ajustados.
- Verificación: test focalizado 2/2, lint, type-check y build de Web pasan; no queda `[institucionId]` en el árbol de rutas fuente.

### T2 — Verificar la migración corregida en entorno aislado

- Estado: completado
- Commit: pendiente de decisión separada
- Specs: S2
- Ruta: `apps/api/prisma/migrations/20261016000100_materias_escolares/migration.sql`
- Resultado: la versión actual ya contiene la corrección SQL previamente committeada.
- Verificación: `prisma migrate deploy` aplicó todas las migraciones contra PostgreSQL 15 descartable; el contenedor fue eliminado.

### T3 — Preparar la recuperación operativa sin ejecutarla

- Estado: completado
- Evidencia: `odd/evidence/amauta-incidente-2026-11-14.md`
- Commit: pendiente de decisión separada
- Specs: S2-S3
- Ruta: evidencia ODD y documentación técnica
- Resultado: quedaron registrados checks, límites, backup requerido y pasos manuales para producción.
- Verificación: diff revisado y `git diff --check` pasa; no se ejecutó ninguna acción productiva.

## Log

### L1

> "avancemos con la solucion de los problemas"

Se inicia la recuperación del incidente documentado en `docs/auditorias/informe-incidente-amauta-2026-11-14.md`. La línea inmediata es reparar y probar el frontend; la migración de API se trata separadamente y no se aplica en producción desde esta sesión.

### L2

La exploración confirmó que el conflicto está en `apps/web/src/app/api/instituciones/[id]/` frente a `apps/web/src/app/api/instituciones/[institucionId]/`. La migración SQL actual del repositorio ya contiene la corrección previamente committeada que mueve la condición `m."nombre" = c."materia"` al `WHERE`; `origin/master` también la contiene. El bloqueo P3009 observado en producción requiere verificar qué imagen/commit se desplegó y no justifica reescribir otra vez la migración local.

### L3

T1 quedó completado: la ruta de historial se movió bajo `[id]`, el test focalizado pasó 2/2 y el Web pasó lint, type-check y build. T2 quedó completado: todas las migraciones, incluida `20261016000100_materias_escolares`, se aplicaron en PostgreSQL 15 descartable y el contenedor se eliminó. T3 quedó completado con evidencia en `odd/evidence/amauta-incidente-2026-11-14.md`; producción no fue modificada.
