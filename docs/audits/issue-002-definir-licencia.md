# Auditoría Issue #002 — T-002: Definir licencia del proyecto

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #2 - T-002: Definir licencia del proyecto
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó el issue de documentación e infraestructura que formaliza la licencia open source del proyecto. El resultado visible está implementado: existe [LICENSE](/home/ignacio/amauta/LICENSE), el README documenta AGPL-3.0 y también incluye badge de licencia. La observación es de trazabilidad: no encontré en el repo evidencia explícita de la consulta con stakeholders ni de una comparación documentada entre AGPL-3.0 y GPL-3.0.

---

## Requisitos del Issue

Extraídos del issue #2:

- [x] Investigar licencias open source apropiadas (AGPL-3.0, GPL-3.0)
- [ ] Consultar con stakeholders sobre preferencias
- [x] Crear archivo LICENSE
- [x] Actualizar README con información de licencia
- [x] Agregar badge de licencia

---

## Verificación de Código

| Archivo                                    | ¿Existe? | Notas                                              |
| ------------------------------------------ | -------- | -------------------------------------------------- |
| `LICENSE`                                  | ✅       | Archivo presente con texto completo de GNU AGPL v3 |
| `README.md`                                | ✅       | Incluye sección de licencia, justificación y badge |
| `docs/project-management/fase-0-tareas.md` | ✅       | Checklist de referencia para T-002                 |

**Evidencia de implementación:**

| Área                      | Evidencia                                                                       | Estado |
| ------------------------- | ------------------------------------------------------------------------------- | ------ |
| Archivo de licencia       | `LICENSE` con cabecera “GNU AFFERO GENERAL PUBLIC LICENSE Version 3”            | ✅     |
| README actualizado        | Sección `## Licencia` y `### ¿Por qué AGPL-3.0?`                                | ✅     |
| Badge de licencia         | `![License](https://img.shields.io/badge/license-AGPL--3.0-blue)`               | ✅     |
| Decisión final registrada | `docs/project-management/project-board.md` menciona “Definir licencia AGPL-3.0” | ✅     |

---

## Tests

**Comando ejecutado:** No aplica.

El issue audita una definición documental/legal y no un módulo con pruebas automatizadas asociadas.

**Resultados:**

- Total: N/A
- Pasaron: N/A
- Fallaron: N/A

**Cobertura:**

| Métrica    | Valor | Estado |
| ---------- | ----- | ------ |
| Statements | N/A   | N/A    |
| Branches   | N/A   | N/A    |
| Functions  | N/A   | N/A    |
| Lines      | N/A   | N/A    |

---

## Pruebas en Producción

**Ambiente:** No aplica.

La tarea define licencia y documentación, sin endpoints ni comportamiento runtime verificable en producción.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                                        | Verificación                                                                                                               | Estado |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Investigar licencias open source apropiadas (AGPL-3.0, GPL-3.0) | Hay racional de elección AGPL-3.0 en `README.md`, pero no encontré comparación explícita AGPL vs GPL versionada en el repo | ⚠️     |
| 2   | Consultar con stakeholders sobre preferencias                   | No encontré evidencia documental o trazabilidad verificable dentro del repo                                                | ❌     |
| 3   | Crear archivo LICENSE                                           | `LICENSE` existe con texto completo de AGPL-3.0                                                                            | ✅     |
| 4   | Actualizar README con información de licencia                   | `README.md` incluye sección de licencia y justificación                                                                    | ✅     |
| 5   | Agregar badge de licencia                                       | `README.md` incluye badge AGPL-3.0                                                                                         | ✅     |

---

## Hallazgos

### Trazabilidad incompleta de la decisión

No encontré en el repositorio evidencia verificable de:

- consulta con stakeholders sobre la preferencia de licencia
- análisis documentado entre AGPL-3.0 y GPL-3.0

La implementación final está presente, pero falta el respaldo documental de dos subtareas del issue.

---

## Observaciones

La decisión final de usar AGPL-3.0 está alineada con la filosofía del proyecto expresada en el README y con el carácter de software de red al servicio del bien común educativo. El problema es de trazabilidad histórica, no de ausencia de implementación.

---

## Evidencia

```text
$ gh issue view 2 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-002: Definir licencia del proyecto
closedAt: 2025-12-18T10:47:24Z

$ sed -n '1,5p' LICENSE
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

$ nl -ba README.md | sed -n '330,400p'
332 Este proyecto está licenciado bajo la GNU Affero General Public License v3.0 (AGPL-3.0).
343 ¿Por qué AGPL-3.0?
399 ![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
```
