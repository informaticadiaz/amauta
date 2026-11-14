# Evidencia ODD — Build y smoke test de la API Amauta

Fecha: 2026-11-14
Rama local: `fix/api-docker-workspaces`

## Diagnóstico

Dokploy mostró que el build de `apps/api/Dockerfile` fallaba porque la imagen no incluía los workspaces `@amauta/types` y `@amauta/shared`. Tras corregir ese punto, el primer arranque aislado reveló una dependencia NestJS no resoluble en `MatriculasService` causada por un `import type` de `PrismaService`.

La auditoría estática detectó el mismo patrón en `HistorialService` y `MatriculasController`; ambos imports fueron corregidos a imports de runtime.

## Correcciones

- `apps/api/Dockerfile`
  - copia manifests de `packages/types` y `packages/shared`;
  - instala todos los workspaces;
  - copia y compila los paquetes compartidos antes de la API;
  - incluye los paquetes compilados en la imagen final.
- `apps/api/src/matriculas/matriculas.service.ts`
  - `PrismaService` pasa de `import type` a import de runtime.
- `apps/api/src/historial/historial.service.ts`
  - `PrismaService` pasa de `import type` a import de runtime.
- `apps/api/src/matriculas/matriculas.controller.ts`
  - `MatriculasService` pasa de `import type` a import de runtime.

## Verificación

- Test focalizado de `MatriculasService`: pasa.
- Test focalizado de `HistorialService`: pasa.
- Lint API: pasa.
- Suite completa API: 36 suites y 406 tests pasan.
- Type-check API: pasa.
- Build Docker API `amauta-api:workspace-fix`: pasa.
- Smoke test final con PostgreSQL 15 descartable:
  - las 16 migraciones se aplican correctamente;
  - NestJS inicia correctamente;
  - el contenedor expone el puerto 4000;
  - `/health` responde HTTP 200;
  - respuesta: `{"status":"ok", ...}`.
- PostgreSQL, contenedor API y red temporales se eliminan al finalizar.

## Límites

- No se modificó producción desde esta corrección.
- No se ejecutó una migración contra la base productiva.
- El despliegue requiere un issue y PR separados, CI verde y verificación posterior de API y frontend.
