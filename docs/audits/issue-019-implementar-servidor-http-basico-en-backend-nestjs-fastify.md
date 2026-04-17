# Auditoría Issue #19 — T-018: Implementar servidor HTTP básico en Backend (NestJS + Fastify)

**Fecha:** 2026-04-17
**Inspector:** Codex (automatizado)
**Issue:** #19 - T-018: Implementar servidor HTTP básico en Backend (NestJS + Fastify)
**Estado del issue:** Cerrado
**Fecha de cierre:** 2025-12-23T11:29:45Z
**Veredicto:** ❌ RECHAZADO

---

## Resumen

Se auditó el issue que introdujo la base HTTP del backend con NestJS + Fastify, incluyendo estructura esperada, build local y smoke tests contra producción.

La base del servidor existe, compila y el deployment responde correctamente en `/health` y `/`. El rechazo se fundamenta en dos puntos concretos: hubo un cambio de path no declarado respecto del contrato del issue (`/api/v1` pasó a `/api/v1/info`) y no existen tests específicos para el módulo base entregado por esta tarea.

---

## Requisitos del Issue

Extraídos del issue #19:

- [x] Servidor NestJS + Fastify arranca correctamente
- [x] `GET /health` responde con status 200 y JSON válido
- [ ] `GET /api/v1` responde con información de la API
- [x] CORS configurado para el dominio del frontend
- [x] Variables de entorno integradas correctamente
- [x] Build de producción funciona (`npm run build`)
- [x] Dockerfile actualizado y container arranca con servidor real
- [x] Healthcheck del container pasa

---

## Verificación de Código

| Archivo                          | ¿Existe? | Notas                                                                         |
| -------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `apps/api/src/main.ts`           | ✅       | Inicializa NestJS con `FastifyAdapter`, CORS, prefijo global y static/uploads |
| `apps/api/src/app.module.ts`     | ✅       | Módulo raíz NestJS                                                            |
| `apps/api/src/app.controller.ts` | ✅       | Expone `GET /health`, `GET /` y `GET /info`                                   |
| `apps/api/src/app.service.ts`    | ✅       | Devuelve health e info de API                                                 |
| `apps/api/Dockerfile`            | ✅       | Arranca `node dist/main.js` y define healthcheck HTTP                         |

### Observaciones de implementación

- En [app.controller.ts](/home/ignacio/amauta/apps/api/src/app.controller.ts:46) el comentario indica `GET /api/v1`, pero la ruta real es `@Get('info')`, por lo que el endpoint efectivo es `GET /api/v1/info`.
- No encontré evidencia de que ese cambio de path haya quedado declarado de forma explícita en el issue, en su cierre, ni en el contrato auditado.
- En [main.ts](/home/ignacio/amauta/apps/api/src/main.ts:49) el prefijo global `api/v1` excluye `/` y `health`, consistente con los smoke tests.
- En [env.ts](/home/ignacio/amauta/apps/api/src/config/env.ts:75) `CORS_ORIGIN` se valida e inyecta como arreglo de orígenes.
- En [Dockerfile](/home/ignacio/amauta/apps/api/Dockerfile:103) el `HEALTHCHECK` consulta `http://localhost:4000/health`, consistente con el requisito del contenedor.

---

## Tests

**Comandos ejecutados:**

```bash
npm run build --workspace=@amauta/api
npx jest --config apps/api/jest.config.js --testPathPatterns=app --coverage --collectCoverageFrom='apps/api/src/app*.ts'
```

**Resultados:**

- Build: ✅ exitoso
- Total de suites ejecutadas por Jest: 20
- Suites pasando: 20
- Suites fallando: 0
- Tests pasando: 266
- Tests fallando: 0

**Cobertura reportada por esa corrida:**

| Métrica    | Valor | Estado |
| ---------- | ----- | ------ |
| Statements | 0%    | ❌     |
| Branches   | 0%    | ❌     |
| Functions  | 0%    | ❌     |
| Lines      | 0%    | ❌     |

### Observaciones de testing

- No existen specs dedicados para `app.controller.ts`, `app.service.ts` o `main.ts`.
- La corrida con `--testPathPatterns=app` terminó ejecutando suites amplias del backend por coincidencia de nombres/rutas, pero no produjo cobertura útil del módulo auditado.
- Por lo tanto, el módulo base entregado por este issue no quedó validado con tests específicos, aunque el build y producción sí prueban parte del comportamiento.

---

## Pruebas en Producción

**Ambiente:** `https://amauta-api.diazignacio.ar`

| Endpoint       | Método | Esperado | Resultado | Estado |
| -------------- | ------ | -------- | --------- | ------ |
| `/health`      | GET    | 200      | 200       | ✅     |
| `/`            | GET    | 200      | 200       | ✅     |
| `/api/v1`      | GET    | 200      | 404       | ❌     |
| `/api/v1/info` | GET    | 200      | 200       | ✅     |

**Cuerpos relevantes:**

- `/health`:

```json
{
  "status": "ok",
  "timestamp": "2026-04-17T10:09:23.370Z",
  "version": "0.1.0",
  "uptime": 1626156
}
```

- `/api/v1`:

```json
{ "message": "Cannot GET /api/v1", "error": "Not Found", "statusCode": 404 }
```

- `/api/v1/info`:

```json
{
  "name": "Amauta API",
  "version": "0.1.0",
  "description": "Sistema educativo para la gestión del aprendizaje",
  "environment": "production",
  "documentation": "https://github.com/informaticadiaz/amauta/blob/master/docs/technical/architecture.md",
  "repository": "https://github.com/informaticadiaz/amauta"
}
```

---

## Criterios de Aceptación

| Criterio                                                     | Verificación                                                                                                           | Estado |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| Servidor NestJS + Fastify arranca correctamente              | Build local exitoso y backend en producción respondiendo                                                               | ✅     |
| `GET /health` responde con 200 y JSON válido                 | Código + smoke test producción                                                                                         | ✅     |
| `GET /api/v1` responde con información de la API             | Smoke test devuelve 404; la implementación expone `/api/v1/info` y el cambio de path no quedó declarado explícitamente | ❌     |
| CORS configurado para el dominio del frontend                | `main.ts` usa `env.CORS_ORIGIN`                                                                                        | ✅     |
| Variables de entorno integradas correctamente                | `env.ts` validado e importado en `main.ts` y `app.service.ts`                                                          | ✅     |
| Build de producción funciona                                 | `npm run build --workspace=@amauta/api` exitoso                                                                        | ✅     |
| Dockerfile actualizado y container arranca con servidor real | `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]`                                                   | ✅     |
| Healthcheck del container pasa                               | `HEALTHCHECK` a `/health` y smoke test 200                                                                             | ✅     |

---

## Veredicto

**❌ RECHAZADO**

El issue no cumple completamente sus criterios de aceptación por dos razones.

1. El endpoint especificado `GET /api/v1` no existe en la implementación/despliegue actual. La información de API quedó expuesta en `GET /api/v1/info`, pero ese cambio de path no quedó declarado explícitamente en el contrato auditado.
2. No existen tests específicos para `AppController`, `AppService` o `main.ts`, por lo que el módulo base entregado por esta tarea quedó sin validación automatizada directa.

---

## Recomendaciones

1. Restaurar `GET /api/v1` para que responda la información de API, o documentar de forma explícita el cambio contractual a `GET /api/v1/info` en el issue y artefactos relacionados.
2. Agregar tests dedicados para `AppController` y `AppService` que validen al menos `/health`, `/`, y la ruta oficial de info de API.
3. Corregir el comentario de [app.controller.ts](/home/ignacio/amauta/apps/api/src/app.controller.ts:46) para que coincida con la ruta real y evitar auditorías ambiguas futuras.
