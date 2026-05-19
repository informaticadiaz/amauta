# Auditoría Issue #94 — F6-002: API de búsqueda básica de cursos con full-text y filtros iniciales

**Fecha:** 2026-05-19  
**Inspector:** Codex (automatizado)  
**Issue:** #94 — F6-002: API de búsqueda básica de cursos con full-text y filtros iniciales  
**Estado del issue:** CERRADO (closedAt: 2026-05-07)  
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

El issue #94 implementa el endpoint público `GET /api/v1/cursos/buscar` con búsqueda por texto en `titulo`/`descripcion`, filtros (categoría, nivel, duración, idioma), paginación y opciones de orden. Los tests del módulo `cursos` pasan y el endpoint responde correctamente en producción.

Observación principal: la ejecución de cobertura devuelve 0% (parece un problema de configuración de Jest), por lo que **no se puede verificar** el umbral de cobertura desde la herramienta tal como está hoy.

---

## Requisitos del Issue (checklist)

Extraídos del body del issue #94:

- [x] revisar definición funcional aprobada en F6-001
- [x] definir contrato del endpoint de búsqueda
- [x] implementar búsqueda por texto en título y descripción
- [x] agregar filtros iniciales por categoría, nivel y duración
- [x] soportar paginación con parámetros consistentes
- [x] definir ordenamiento inicial de resultados
- [x] devolver metadata mínima de paginación/filtros aplicados
- [x] cubrir casos de consulta vacía y sin resultados
- [x] agregar tests unitarios y/o integración del módulo
- [x] documentar contrato técnico del endpoint

---

## Verificación de código

| Archivo                                                     | ¿Existe? | Notas                                                |
| ----------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `apps/api/src/cursos/cursos.controller.ts`                  | ✅       | Expone `@Public() GET buscar`                        |
| `apps/api/src/cursos/cursos.service.ts`                     | ✅       | Implementa `buscarCursos()` con filtros + relevancia |
| `apps/api/src/cursos/dto/busqueda-cursos.dto.ts`            | ✅       | Zod schema con `buscar`, filtros y paginación        |
| `apps/api/src/cursos/cursos.controller.spec.ts`             | ✅       | Tests de controller                                  |
| `apps/api/src/cursos/cursos.service.spec.ts`                | ✅       | Tests de service (incluye `buscarCursos`)            |
| `docs/human-context/issue-94-api-busqueda-basica-cursos.md` | ✅       | Contrato técnico / ejemplos                          |

Notas de implementación relevantes:

- Endpoint público: `GET /api/v1/cursos/buscar` (`@Public()`).
- Búsqueda por texto: `contains` case-insensitive en `titulo` y `descripcion`.
- Relevancia inicial: cuando `ordenarPor` no se envía y hay `buscar`, ordena priorizando coincidencia en **título** (y desempata por `publicadoEn desc`).
- Duración por rangos: `corta` (< 60), `media` (60–180), `larga` (> 180).
- Siempre filtra `estado: PUBLICADO`.

---

## Tests

**Comando ejecutado:**

```bash
npx jest --config apps/api/jest.config.js --testPathPatterns=cursos --coverage --collectCoverageFrom='apps/api/src/cursos/**/*.ts'
```

**Resultados:**

- Suites: 2 passed / 2 total
- Tests: 51 passed / 51 total

**Cobertura (estado actual):**

- Reporte de cobertura mostrado por Jest: **0% en todas las métricas**.
- Interpretación: la configuración actual parece no estar recolectando archivos para cobertura (ej.: patrón `collectCoverageFrom` en `apps/api/jest.config.js` usa `**/*.(t|j)s`, que no matchea como glob estándar).

**Estado de criterio “>80%”:** ❌ _No verificable con la herramienta en su estado actual_ (recomendación: corregir configuración y re-ejecutar).

---

## Pruebas en producción (smoke tests)

**Ambiente:** https://amauta-api.diazignacio.ar

| Endpoint                                              | Método | Esperado         | Resultado | Estado |
| ----------------------------------------------------- | ------ | ---------------- | --------- | ------ |
| `/api/v1/cursos/buscar`                               | GET    | 200              | 200       | ✅     |
| `/api/v1/cursos/buscar?buscar=python&page=1&limit=10` | GET    | 200              | 200       | ✅     |
| `/api/v1/cursos/buscar?buscar=`                       | GET    | 400 (validación) | 400       | ✅     |
| `/api/v1/cursos/mis-cursos`                           | GET    | 401 (sin token)  | 401       | ✅     |
| `/api/v1/ruta-falsa`                                  | GET    | 404              | 404       | ✅     |

---

## Criterios de aceptación (verificación)

| #   | Criterio                         | Verificación                                                                                  | Estado |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| 1   | Contrato del endpoint definido   | Doc `docs/human-context/issue-94-api-busqueda-basica-cursos.md`                               | ✅     |
| 2   | Búsqueda por texto título/descr. | `buscarCursos()` usa OR `contains` en `titulo`/`descripcion`                                  | ✅     |
| 3   | Filtros iniciales                | `categoriaId`, `nivel`, `duracion` (+ `idioma` extra)                                         | ✅     |
| 4   | Paginación consistente           | `page`, `limit`, `total`, `totalPages`                                                        | ✅     |
| 5   | Ordenamiento inicial             | default: `relevancia` con `buscar`, si no `publicadoEn`                                       | ✅     |
| 6   | Consulta vacía / sin resultados  | `buscar` opcional; `buscar=` invalida (400); sin término devuelve catálogo publicado paginado | ✅     |
| 7   | Tests                            | 51 tests pasando                                                                              | ✅     |
| 8   | Cobertura >80%                   | Reporte de cobertura 0% (config)                                                              | ⚠️     |

---

## Hallazgos

1. **Cobertura no medible (sale 0%)** aun con `--coverage`: probablemente por patrón inválido en `collectCoverageFrom` de `apps/api/jest.config.js`.

---

## Observaciones

- El título menciona “full-text”; la implementación actual es búsqueda “básica” vía `contains` (coherente con el alcance funcional F6-001), pero **no** es FTS a nivel DB.
- Hay ruido de consola (“Console Ninja…”) durante los tests; no rompe, pero contamina output de CI/QA.

---

## Evidencia (salida relevante)

```
Test Suites: 2 passed, 2 total
Tests:       51 passed, 51 total
Ran all test suites matching cursos.
```
