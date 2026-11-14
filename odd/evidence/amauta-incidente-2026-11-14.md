# Evidencia ODD — Recuperación del incidente Amauta 2026-11-14

Fecha de ejecución: 2026-11-14
Repositorio: `/home/ignacio/amauta`
Rama: `feat/f4c006-alertas`

## Frontend

- Se movió el proxy de historial administrativo desde:
  `apps/web/src/app/api/instituciones/[institucionId]/estudiantes/[estudianteId]/historial/`
- A:
  `apps/web/src/app/api/instituciones/[id]/estudiantes/[estudianteId]/historial/`
- Se actualizaron los parámetros del handler y los tests de `institucionId` a `id`.
- Test focalizado: **2/2 passing**.
- ESLint Web: **passing**.
- Type-check Web: **passing**.
- Build Web con `next build --webpack`: **passing**.
- El árbol de rutas fuente ya no contiene `[institucionId]`.
- El build no reportó el conflicto de segmentos dinámicos.

## API y Prisma

- La migración `20261016000100_materias_escolares` ya contiene en el repositorio la corrección SQL previamente committeada: la condición `m."nombre" = c."materia"` se evalúa en `WHERE`, no dentro del `JOIN ... ON`.
- Se ejecutó `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma` contra un PostgreSQL 15 descartable en Docker.
- Todas las migraciones del repositorio se aplicaron correctamente, incluida `20261016000100_materias_escolares`.
- El contenedor temporal fue eliminado automáticamente.
- No se utilizó la base persistente local `amauta-postgres` ni una base productiva.

## Límites

- No se desplegaron imágenes.
- No se reiniciaron servicios.
- No se ejecutó `prisma migrate deploy` contra producción.
- No se marcaron migraciones manualmente como aplicadas o revertidas.
- No se hizo commit, push, pull request, cambio de DNS, Cloudflare o Dokploy.

## Próximo paso operativo separado

Antes de desplegar, una persona autorizada debe confirmar el commit/imagen candidato, el backup reciente, el estado real de la migración en el entorno destino y la ruta de recuperación. Luego se puede desplegar primero la API, verificar su healthcheck y recién después desplegar el frontend.
