# Auditoría Issue #13 — T-006: Configurar tests en CI

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #13 - T-006: Configurar tests en CI
**Estado del issue:** Cerrado
**Veredicto:** ❌ RECHAZADO

---

## Resumen

Se auditó el issue de infraestructura que debía dejar el pipeline de CI con ejecución de tests, reporting de coverage, subida de coverage a un servicio externo, umbrales mínimos y badge en el README. El repositorio hoy sí ejecuta tests en CI, pero no cumple varios criterios explícitos del issue: falta integración activa con Codecov/Coveralls, no hay umbrales mínimos de coverage, no existe badge de coverage en el README y el job actual de frontend falla en modo CI.

---

## Requisitos del Issue

Extraídos del issue #13:

- [x] Agregar step para ejecutar tests
- [ ] Configurar coverage reporting
- [ ] Subir coverage a servicio (Codecov, Coveralls)
- [ ] Configurar umbrales mínimos de coverage
- [ ] Agregar badge de coverage al README

---

## Verificación de Código

| Archivo                    | ¿Existe? | Notas                                                                                       |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | ✅       | El workflow ejecuta tests de API y Web                                                      |
| `apps/api/jest.config.js`  | ✅       | Recolecta coverage, pero no define `coverageThreshold`                                      |
| `apps/web/jest.config.js`  | ✅       | Recolecta coverage, pero no define `coverageThreshold`                                      |
| `README.md`                | ✅       | No incluye badge de coverage                                                                |
| `.github/README.md`        | ✅       | Sigue describiendo tests y coverage como placeholders, inconsistente con el workflow actual |

---

## Tests

**Comandos ejecutados:**

```bash
npm run test:cov --workspace=@amauta/api
npm run test:ci --workspace=@amauta/web
```

**Resultados:**

- API:
  - Total: 266
  - Pasaron: 266
  - Fallaron: 0
- Web:
  - Total: 204
  - Pasaron: 203
  - Fallaron: 1

**Cobertura:**

| Suite | Statements | Branches | Functions | Lines  | Estado |
| ----- | ---------- | -------- | --------- | ------ | ------ |
| API   | 73.76%     | 58.98%   | 71.13%    | 73.41% | ❌     |
| Web   | 34.91%     | 35.28%   | 39.31%    | 36.26% | ❌     |

**Observación:** el criterio mínimo del skill es `>80%` de coverage en statements. Ninguna de las dos suites alcanza ese umbral.

---

## Pruebas en Producción

No aplica. El issue auditado corresponde a infraestructura de CI/CD y no define endpoints funcionales propios para smoke tests en producción.

---

## Criterios de Aceptación

| #   | Criterio                                       | Verificación                                                                                                                                 | Estado |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Agregar step para ejecutar tests               | El workflow incluye `Tests API` y `Tests Web` en `.github/workflows/ci.yml`                                                                  | ✅     |
| 2   | Configurar coverage reporting                  | Solo hay recolección parcial de coverage en Jest; el workflow actual no ejecuta coverage para API ni publica artefactos/reportes consumibles | ❌     |
| 3   | Subir coverage a servicio (Codecov, Coveralls) | No hay `codecov-action`, `coverallsapp/github-action` ni equivalente en el workflow vigente                                                  | ❌     |
| 4   | Configurar umbrales mínimos de coverage        | No existe `coverageThreshold` en `apps/api/jest.config.js` ni en `apps/web/jest.config.js`                                                   | ❌     |
| 5   | Agregar badge de coverage al README            | `README.md` solo muestra badges de producción, versión, licencia, PRs y code of conduct                                                      | ❌     |

---

## Hallazgos

1. El workflow sí corre tests, pero no satisface los criterios de coverage prometidos por el issue.
2. `npm run test:ci --workspace=@amauta/web` falla actualmente con 1 test roto en `src/components/asistencias/AsistenciaRapidaSection.test.tsx`.
3. La cobertura global real está por debajo del mínimo esperado por el skill y del espíritu del issue.
4. La documentación en `.github/README.md` quedó desalineada: todavía presenta tests y coverage como trabajo futuro.

---

## Observaciones

- Este issue no debería figurar como cerrado sin una integración activa de coverage externa o una redefinición explícita del alcance.
- Si el proyecto abandonó Codecov/Coveralls intencionalmente, el issue y la documentación deberían reflejar ese cambio de decisión.

---

## Evidencia

```text
.github/workflows/ci.yml
- Step "Tests API": líneas 146-150
- Step "Tests Web": líneas 152-153

apps/api/jest.config.js
- collectCoverageFrom configurado: líneas 11-17
- sin coverageThreshold

README.md
- badges actuales: líneas 397-401
- sin badge de coverage

Resultado tests API
- 20 suites, 266 tests, 0 fallos
- Coverage statements: 73.76%

Resultado tests Web
- 40 suites, 204 tests, 1 fallo
- Coverage statements: 34.91%
- Falla: src/components/asistencias/AsistenciaRapidaSection.test.tsx
```
