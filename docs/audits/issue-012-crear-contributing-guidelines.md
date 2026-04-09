# Auditoría Issue #012 — T-004: Crear Contributing Guidelines

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #12 - T-004: Crear Contributing Guidelines
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó el issue documental `T-004: Crear Contributing Guidelines`. El repositorio contiene `CONTRIBUTING.md` y cubre los ejes pedidos por el issue: proceso de fork/PR, convenciones de commits, requisitos para PRs, code review y setup para contribuidores.

El documento cumple el objetivo general, pero la guía de setup quedó desalineada con la estructura real del monorepo actual. En particular, `CONTRIBUTING.md` indica copiar un `.env.example` en la raíz, mientras que el repositorio expone ejemplos por aplicación en `apps/api/.env.example` y `apps/web/.env.example`.

---

## Requisitos del Issue

Extraídos del issue #12:

- [x] Documentar proceso de fork y PR
- [x] Explicar convenciones de commits
- [x] Listar requisitos para PRs (tests, docs)
- [x] Documentar proceso de code review
- [x] Agregar guía de setup para contribuidores
- [x] Crear archivo `CONTRIBUTING.md`

---

## Verificación de Código

| Archivo                                    | ¿Existe? | Notas                                                     |
| ------------------------------------------ | -------- | --------------------------------------------------------- |
| `CONTRIBUTING.md`                          | ✅       | Documento principal creado y poblado                      |
| `WORKFLOW.md`                              | ✅       | Referenciado desde `CONTRIBUTING.md`                      |
| `docs/technical/code-review.md`            | ✅       | Complementa la sección de review                          |
| `docs/technical/setup.md`                  | ✅       | Complementa la sección de setup                           |
| `docs/project-management/fase-0-tareas.md` | ✅       | La fuente de planificación marca la tarea como completada |

**Evidencia de implementación:**

| Área                    | Evidencia                                                                      | Estado |
| ----------------------- | ------------------------------------------------------------------------------ | ------ |
| Fork del repositorio    | `CONTRIBUTING.md` documenta fork, clone, upstream y sincronización             | ✅     |
| Pull Request            | `CONTRIBUTING.md` incluye checklist, formato y vínculo con issues              | ✅     |
| Convenciones de commits | Hay sección dedicada con formato, tipos y ejemplos                             | ✅     |
| Requisitos para PR      | Se listan tests, documentación, branch actualizado y conflictos                | ✅     |
| Code review             | Se documentan pautas para revisores, autores y criterios de revisión           | ✅     |
| Setup                   | Existe una sección dedicada, pero con una instrucción de `.env` desactualizada | ⚠️     |

---

## Tests

**Comando ejecutado:** No aplica.

La auditoría es documental. No existe una suite de tests automatizados específica para validar este issue.

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

Este issue no agrega endpoints ni comportamiento ejecutable en producción. La validación corresponde a documentación versionada en el repositorio.

| Verificación             | Esperado | Resultado                         | Estado |
| ------------------------ | -------- | --------------------------------- | ------ |
| Smoke test de producción | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                  | Verificación                                                                                              | Estado |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Documentar proceso de fork y PR           | `CONTRIBUTING.md` cubre fork, clone, upstream, branch, push y creación de PR                              | ✅     |
| 2   | Explicar convenciones de commits          | `CONTRIBUTING.md` define Conventional Commits, tipos, ejemplos y reglas de redacción                      | ✅     |
| 3   | Listar requisitos para PRs (tests, docs)  | La sección de PR incluye checklist con tests, documentación y estándares                                  | ✅     |
| 4   | Documentar proceso de code review         | `CONTRIBUTING.md` dedica una sección específica para review                                               | ✅     |
| 5   | Agregar guía de setup para contribuidores | La sección existe, pero la instrucción `cp .env.example .env.local` no refleja el setup real del monorepo | ⚠️     |
| 6   | Crear archivo `CONTRIBUTING.md`           | El archivo existe en la raíz del repo                                                                     | ✅     |

---

## Hallazgos

- `CONTRIBUTING.md:362` indica `cp .env.example .env.local`, pero en el repo no existe `.env.example` en la raíz; los ejemplos reales están en [`apps/api/.env.example`](/home/ignacio/amauta/apps/api/.env.example) y [`apps/web/.env.example`](/home/ignacio/amauta/apps/web/.env.example).
- [`docs/technical/setup.md`](/home/ignacio/amauta/docs/technical/setup.md) ya documenta una configuración más precisa por aplicación, por lo que la guía corta de `CONTRIBUTING.md` quedó desactualizada o excesivamente simplificada.

---

## Observaciones

El issue está sustancialmente cumplido y el documento resultante es útil para onboarding. Para quedar sin observaciones, conviene alinear la sección de setup de `CONTRIBUTING.md` con el flujo real del monorepo y referenciar explícitamente los archivos de entorno por app.

---

## Evidencia

```text
$ gh issue view 12 --json number,title,body,state,labels,closedAt,url
state: CLOSED
title: T-004: Crear Contributing Guidelines
closedAt: 2025-12-18T11:27:18Z

$ rg -n "\.env\.example|cp \.env\.example \.env\.local|Setup para Contribuidores|Proceso de Pull Request|Proceso de Code Review|Convenciones de Commits" CONTRIBUTING.md docs/technical/setup.md package.json -S
CONTRIBUTING.md:192:## Convenciones de Commits
CONTRIBUTING.md:251:## Proceso de Pull Request
CONTRIBUTING.md:315:## Proceso de Code Review
CONTRIBUTING.md:342:## Setup para Contribuidores
CONTRIBUTING.md:362:cp .env.example .env.local
docs/technical/setup.md:76:Ver el archivo `apps/api/.env.example` para la lista completa de variables disponibles, incluyendo:
docs/technical/setup.md:116:Ver el archivo `apps/web/.env.example` para la lista completa de variables disponibles, incluyendo:

$ rg --files -g '.env.example' apps .
apps/api/.env.example
apps/web/.env.example
```
