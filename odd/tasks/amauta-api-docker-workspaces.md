# ODD Plan — Amauta: corregir build Docker de la API

Estado: completado localmente; build, migraciones, arranque NestJS y healthcheck de la imagen API verificados en entorno descartable.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Construir la imagen API desde el monorepo

> "avancemos con la solucion"

La imagen Docker de la API debe poder compilar `@amauta/api` junto con sus dependencias internas `@amauta/types` y `@amauta/shared`.

### S2 — Verificar el camino productivo

El Dockerfile debe pasar un build real de imagen y la API debe poder iniciar en un entorno aislado hasta ejecutar sus migraciones y healthcheck. No se debe asumir que el healthcheck de una réplica anterior prueba la imagen nueva.

### S3 — Mantener producción controlada

La corrección se prueba localmente y se entrega mediante un PR separado. No se ejecutan migraciones productivas ni operaciones manuales en el VPS desde este trabajo.

## Tasks

### T1 — Incorporar los workspaces compartidos al Dockerfile

- Estado: completado
- Resultado: `docker build -f apps/api/Dockerfile -t amauta-api:workspace-fix .` pasa y produce la imagen.
- Specs: S1
- Ruta: `apps/api/Dockerfile`, `packages/shared/`, `packages/types/`
- Resultado esperado: las etapas de dependencias y builder disponen de manifests y código de los paquetes compartidos, y los compilan antes de la API.
- Verificación: build Docker API exitoso.

### T2 — Ejecutar verificaciones de API e imagen

- Estado: completado
- Evidencia: `odd/evidence/amauta-api-docker-workspaces.md`
- Resultado: las 16 migraciones se aplican, NestJS inicia y `/health` responde HTTP 200 en la imagen corregida.
- Specs: S2
- Resultado esperado: type-check/build API, tests focalizados y smoke test aislado de imagen/API.
- Verificación: comandos reproducibles y evidencia registrada.

### T3 — Preparar entrega separada

- Estado: en curso
- Evidencia: `odd/evidence/amauta-api-docker-workspaces.md`
- Pendiente: issue aprobado, commit, PR y CI.
- Specs: S3
- Resultado esperado: issue aprobado, commit convencional, PR a `master`, CI verde y merge separado.
- Verificación: no modificar producción directamente.

## Log

### L1

> "avancemos con la solucion"

Los logs de Dokploy confirmaron que el frontend terminó correctamente, mientras la imagen API falló durante `npm run build` con módulos faltantes `@amauta/types` y `@amauta/shared`. El error ocurre antes de iniciar el contenedor y antes de ejecutar Prisma.

### L2

El Dockerfile actual copia `apps/api` pero no copia ni compila los workspaces `packages/types` y `packages/shared`. El build raíz de CI no detecta el problema porque Turborepo construye los paquetes compartidos antes de la API.

### L3

Se corrigió `apps/api/Dockerfile` para instalar manifests de todos los workspaces, copiar `packages/types` y `packages/shared`, compilarlos antes de la API e incluirlos en la imagen final. El primer build Docker real pasó. El primer smoke test aislado llegó a migraciones, pero NestJS falló en `MatriculasService` por un import type-only de `PrismaService`. La auditoría estática encontró el mismo patrón en `HistorialService` y `MatriculasController`.

### L4

Se corrigieron los tres imports de dependencias NestJS. El build Docker, tests focalizados y type-check pasaron. El smoke test final contra PostgreSQL 15 descartable aplicó las 16 migraciones, inició NestJS y obtuvo HTTP 200 en `/health`. Los recursos temporales fueron eliminados; producción no fue modificada.

### L5

El lint completo de la API pasó y la suite completa pasó con 36 suites y 406 tests. La entrega queda separada para un issue y PR nuevos; no se desplegará esta corrección desde la sesión sin completar ese flujo.

### L3

Se corrigió `apps/api/Dockerfile` para instalar manifests de todos los workspaces, copiar `packages/types` y `packages/shared`, compilarlos antes de la API e incluirlos en la imagen final. El build Docker real pasó. El smoke test aislado falló durante la preparación: después de iniciar el contenedor no quedó disponible `127.0.0.1:14000`, por lo que no se pudo observar migración ni healthcheck; el cleanup eliminó el contenedor y la red. No se reintentó para respetar el límite de una ejecución y no hubo cambios en producción.
