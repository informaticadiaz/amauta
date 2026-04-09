# Auditoría Issue #003 — T-005: Configurar GitHub Actions para CI

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #3 - T-005: Configurar GitHub Actions para CI
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó el workflow principal de CI/CD del repositorio. El archivo [ci.yml](/home/ignacio/amauta/.github/workflows/ci.yml) existe y cubre todos los requisitos del issue: triggers, Node 20, instalación de dependencias, lint, type-check, build y caché de npm. La observación es documental: [README de workflows](/home/ignacio/amauta/.github/README.md) quedó desalineado respecto del workflow real y todavía describe tests y coverage como futuros/placeholders.

---

## Requisitos del Issue

Extraídos del issue #3:

- [x] Crear workflow `.github/workflows/ci.yml`
- [x] Configurar jobs para diferentes ambientes (Node 20)
- [x] Agregar step para install dependencies
- [x] Agregar step para lint
- [x] Agregar step para type checking
- [x] Agregar step para build
- [x] Configurar caché de `node_modules`
- [x] Configurar triggers (push, PR a main/develop)

---

## Verificación de Código

| Archivo                    | ¿Existe? | Notas                                                                                  |
| -------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | ✅       | Workflow principal presente                                                            |
| `.github/README.md`        | ✅       | Documenta el directorio, pero con contenido parcialmente desactualizado                |
| `package.json`             | ✅       | Declara scripts usados por el workflow (`lint`, `type-check`, `build`, `format:check`) |

**Evidencia de implementación en `ci.yml`:**

| Área                 | Evidencia                                        | Estado |
| -------------------- | ------------------------------------------------ | ------ |
| Trigger en push      | `push.branches: [main, master, develop]`         | ✅     |
| Trigger en PR        | `pull_request.branches: [main, master, develop]` | ✅     |
| Node 20              | `matrix.node-version: [20.x]`                    | ✅     |
| Caché npm            | `actions/setup-node@v4` con `cache: 'npm'`       | ✅     |
| Install dependencies | Step `Install dependencies` con `npm ci`         | ✅     |
| Lint                 | Step `Lint` con `npm run lint`                   | ✅     |
| Type checking        | Step `Type checking` con `npm run type-check`    | ✅     |
| Build                | Step `Build` con `npm run build`                 | ✅     |

---

## Tests

**Comando ejecutado:** No aplica.

La auditoría de este issue se enfocó en verificar la definición del pipeline en el repositorio. No ejecuté el workflow de GitHub Actions desde esta sesión.

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

Este issue configura automatización CI/CD del repositorio y no expone endpoints para smoke tests directos sobre `https://amauta-api.diazignacio.ar`.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                            | Verificación                                                                         | Estado |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| 1   | Crear workflow `.github/workflows/ci.yml`           | Archivo presente en el path esperado                                                 | ✅     |
| 2   | Configurar jobs para diferentes ambientes (Node 20) | Strategy matrix definida con `20.x`                                                  | ✅     |
| 3   | Agregar step para install dependencies              | Step `Install dependencies` ejecuta `npm ci`                                         | ✅     |
| 4   | Agregar step para lint                              | Step `Lint` ejecuta `npm run lint`                                                   | ✅     |
| 5   | Agregar step para type checking                     | Step `Type checking` ejecuta `npm run type-check`                                    | ✅     |
| 6   | Agregar step para build                             | Step `Build` ejecuta `npm run build`                                                 | ✅     |
| 7   | Configurar caché de `node_modules`                  | `setup-node` usa caché de npm                                                        | ✅     |
| 8   | Configurar triggers (push, PR a main/develop)       | Triggers configurados para `push` y `pull_request` sobre `main`, `master`, `develop` | ✅     |

---

## Hallazgos

### Documentación del workflow desactualizada

[.github/README.md](/home/ignacio/amauta/.github/README.md) indica que tests y coverage son “placeholder” o expansión futura, pero el workflow real ya ejecuta `Tests API`, `Tests Web` y también contiene un job de `deploy`. No invalida el issue, pero sí reduce la precisión de la documentación operacional.

---

## Observaciones

El workflow hoy supera el alcance original del issue porque además incorpora validaciones adicionales, tests, enforcement de Prisma y deploy condicionado a `master`. El veredicto queda con observaciones solo por la desalineación documental.

---

## Evidencia

```text
$ gh issue view 3 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-005: Configurar GitHub Actions para CI
closedAt: 2025-12-18T11:03:08Z

$ sed -n '1,40p' .github/workflows/ci.yml
on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

$ sed -n '80,140p' .github/workflows/ci.yml
matrix:
  node-version: [20.x]
...
- name: Install dependencies
  run: npm ci
- name: Lint
  run: npm run lint
- name: Type checking
  run: npm run type-check
- name: Build
  run: npm run build
```
