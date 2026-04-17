# Auditoría Issue #18 — T-017: Configurar deployment en VPS con Dokploy

**Fecha:** 2026-04-17
**Inspector:** Codex (automatizado)
**Issue:** #18 - T-017: Configurar deployment en VPS con Dokploy
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó la issue de infraestructura que pedía dejar operativo el deployment en VPS con Dokploy para frontend y backend. La evidencia local y las pruebas en producción confirman que el frontend y la API están accesibles por HTTPS, que el healthcheck responde correctamente y que el repositorio contiene Dockerfiles multi-stage y pipeline de CI/CD con webhook a Dokploy; las observaciones principales son que no existen los documentos pedidos con los nombres exactos `docs/technical/deployment.md` y `docs/technical/dokploy-setup.md`, y que no hay evidencia local directa de una verificación de logs "sin errores críticos".

---

## Requisitos del Issue

Extraídos del issue #18:

- [x] Backend API accesible en `https://api.amauta.your-domain.com`
- [x] Frontend accesible en `https://amauta.your-domain.com`
- [x] SSL/HTTPS funcionando correctamente (certificado válido)
- [x] Base de datos PostgreSQL conectada y con migraciones aplicadas
- [x] Variables de entorno de producción configuradas (sin leaks)
- [x] Deploy automático funciona (push a main → deploy)
- [ ] Documentación completa de deployment
- [x] Health checks respondiendo correctamente
- [ ] Logs accesibles y sin errores críticos

---

## Verificación de Código

| Archivo                                              | ¿Existe? | Notas                                                                |
| ---------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `apps/api/Dockerfile`                                | ✅       | Multi-stage build, healthcheck y `prisma migrate deploy` al arranque |
| `apps/web/Dockerfile`                                | ✅       | Multi-stage build para Next.js con standalone output                 |
| `apps/api/.dockerignore`                             | ❌       | No existe en el repo auditado                                        |
| `apps/web/.dockerignore`                             | ❌       | No existe en el repo auditado                                        |
| `.github/workflows/ci.yml`                           | ✅       | Incluye validación, build, tests y deploy por webhook a Dokploy      |
| `DEPLOYMENT_PROGRESS.md`                             | ✅       | Documenta estado productivo, URLs, migraciones y pipeline            |
| `docs/technical/deployment.md`                       | ❌       | No existe con ese nombre                                             |
| `docs/technical/dokploy-setup.md`                    | ❌       | No existe con ese nombre                                             |
| `docs/technical/dokploy-ui-deployment-guide.md`      | ✅       | Cubre setup operativo en Dokploy UI                                  |
| `docs/technical/understanding-dokploy-deployment.md` | ✅       | Explica arquitectura y funcionamiento del deployment                 |
| `docs/technical/adr/005-deployment-dokploy.md`       | ✅       | Formaliza la decisión arquitectónica                                 |

---

## Validaciones Ejecutadas

**Comandos ejecutados:**

```bash
gh issue view 18 --json number,title,body,state,labels,closedAt,url
rg --files apps/api apps/web docs .github | rg '(^apps/api/Dockerfile$|^apps/api/\.dockerignore$|^apps/web/Dockerfile$|^apps/web/\.dockerignore$|^docs/technical/deployment\.md$|^docs/technical/dokploy-setup\.md$|^DEPLOYMENT_PROGRESS\.md$|^\.github/workflows/ci\.yml$)'
sed -n '1,260p' apps/api/Dockerfile
sed -n '1,260p' apps/web/Dockerfile
sed -n '1,260p' .github/workflows/ci.yml
sed -n '1,260p' DEPLOYMENT_PROGRESS.md
sed -n '1,220p' docs/technical/dokploy-ui-deployment-guide.md
sed -n '1,220p' docs/technical/understanding-dokploy-deployment.md
sed -n '1,220p' docs/technical/adr/005-deployment-dokploy.md
rg -n "dokploy|deployment|health" apps/api/src apps/web/src --glob '*spec.ts' --glob '*test.ts' --glob '*test.tsx'
sed -n '1,220p' apps/api/src/app.controller.ts
```

**Resultados:**

- El backend define healthcheck en [apps/api/Dockerfile](/home/ignacio/amauta/apps/api/Dockerfile:1) y arranca con `npx prisma migrate deploy && node dist/main.js`.
- El frontend define imagen productiva standalone en [apps/web/Dockerfile](/home/ignacio/amauta/apps/web/Dockerfile:1).
- El pipeline en [ci.yml](/home/ignacio/amauta/.github/workflows/ci.yml:1) incluye job `deploy` con webhook a Dokploy y healthcheck contra la API publicada.
- El estado productivo está documentado en [DEPLOYMENT_PROGRESS.md](/home/ignacio/amauta/DEPLOYMENT_PROGRESS.md:1).
- No existen `apps/api/.dockerignore` ni `apps/web/.dockerignore`.
- No existen `docs/technical/deployment.md` ni `docs/technical/dokploy-setup.md`; parte del contenido aparece repartido en otros documentos.
- No se encontró una suite de tests local específica para deployment/Dokploy; el issue es de infraestructura y la evidencia principal está en configuración y producción.

---

## Pruebas en Producción

**Ambiente:** `https://amauta.diazignacio.ar` y `https://amauta-api.diazignacio.ar`

| Endpoint                                              | Método     | Esperado         | Resultado | Estado |
| ----------------------------------------------------- | ---------- | ---------------- | --------- | ------ |
| `https://amauta.diazignacio.ar`                       | GET        | 200              | 200       | ✅     |
| `https://amauta-api.diazignacio.ar/health`            | GET        | 200              | 200       | ✅     |
| `https://amauta-api.diazignacio.ar/api/v1/ruta-falsa` | GET        | 404              | 404       | ✅     |
| `https://amauta.diazignacio.ar`                       | HEAD HTTPS | 200 + TLS válido | 200       | ✅     |
| `https://amauta-api.diazignacio.ar/health`            | HEAD HTTPS | 200 + TLS válido | 200       | ✅     |

---

## Criterios de Aceptación

| #   | Criterio                                                  | Verificación                                                                                                                                                                                                          | Estado |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Backend API accesible públicamente                        | `curl` a `https://amauta-api.diazignacio.ar/health` respondió `200`                                                                                                                                                   | ✅     |
| 2   | Frontend accesible públicamente                           | `curl` a `https://amauta.diazignacio.ar` respondió `200`                                                                                                                                                              | ✅     |
| 3   | SSL/HTTPS válido                                          | Requests HTTPS sin `-k` devolvieron `HTTP/2 200` en frontend y backend                                                                                                                                                | ✅     |
| 4   | PostgreSQL conectada y migraciones aplicadas              | [DEPLOYMENT_PROGRESS.md](/home/ignacio/amauta/DEPLOYMENT_PROGRESS.md:1) documenta migraciones aplicadas; [apps/api/Dockerfile](/home/ignacio/amauta/apps/api/Dockerfile:1) ejecuta `prisma migrate deploy` al iniciar | ✅     |
| 5   | Variables de entorno de producción configuradas sin leaks | No hay `.env` versionados según reglas de CI; el workflow valida ausencia de secretos obvios                                                                                                                          | ✅     |
| 6   | Deploy automático funciona                                | [ci.yml](/home/ignacio/amauta/.github/workflows/ci.yml:1) implementa webhook a Dokploy y healthcheck posterior                                                                                                        | ✅     |
| 7   | Documentación completa de deployment                      | Existen docs relacionadas, pero faltan los documentos pedidos con nombre exacto y la cobertura quedó fragmentada                                                                                                      | ❌     |
| 8   | Health checks respondiendo correctamente                  | `/health` responde `200` y el backend define endpoint y healthcheck Docker                                                                                                                                            | ✅     |
| 9   | Logs accesibles y sin errores críticos                    | `DEPLOYMENT_PROGRESS.md` describe el acceso a logs, pero no hay evidencia local directa de revisión de logs sin errores críticos                                                                                      | ❌     |

---

## Hallazgos

1. La issue está sustancialmente cumplida en su objetivo principal: Amauta está desplegado en producción con frontend y backend accesibles por HTTPS.
2. El repositorio contiene la infraestructura técnica esperable para este entregable: Dockerfiles multi-stage, migraciones automáticas de Prisma y pipeline CI/CD con webhook a Dokploy.
3. Los archivos `docs/technical/deployment.md` y `docs/technical/dokploy-setup.md` pedidos por la issue no existen; la documentación quedó repartida entre [DEPLOYMENT_PROGRESS.md](/home/ignacio/amauta/DEPLOYMENT_PROGRESS.md:1), [dokploy-ui-deployment-guide.md](/home/ignacio/amauta/docs/technical/dokploy-ui-deployment-guide.md:1) y [understanding-dokploy-deployment.md](/home/ignacio/amauta/docs/technical/understanding-dokploy-deployment.md:1).
4. Tampoco existen `apps/api/.dockerignore` y `apps/web/.dockerignore`, que estaban explicitados en el checklist de implementación.
5. No encontré evidencia local trazable de una verificación de logs "sin errores críticos"; eso deja ese criterio sin cerrar con pruebas objetivas dentro del repo.

---

## Evidencia

```text
Pruebas de producción
- GET https://amauta.diazignacio.ar -> 200
- GET https://amauta-api.diazignacio.ar/health -> 200
- GET https://amauta-api.diazignacio.ar/api/v1/ruta-falsa -> 404
- HEAD https://amauta.diazignacio.ar -> HTTP/2 200
- HEAD https://amauta-api.diazignacio.ar/health -> HTTP/2 200

Infraestructura observada en repo
- apps/api/Dockerfile:
  CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
  HEALTHCHECK contra http://localhost:4000/health
- apps/web/Dockerfile:
  standalone output con HEALTHCHECK HTTP
- .github/workflows/ci.yml:
  job deploy vía webhook de Dokploy
  healthcheck posterior a https://amauta-api.diazignacio.ar/health

Documentación
- Existe DEPLOYMENT_PROGRESS.md
- Existen docs/technical/dokploy-ui-deployment-guide.md y understanding-dokploy-deployment.md
- No existen docs/technical/deployment.md ni docs/technical/dokploy-setup.md
```
