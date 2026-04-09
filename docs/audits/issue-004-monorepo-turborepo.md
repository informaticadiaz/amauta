# Auditoría Issue #004 — T-008: Inicializar estructura de monorepo

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #4 - T-008: Inicializar estructura de monorepo
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó la base estructural del monorepo. El repositorio usa Turborepo, tiene workspaces configurados, existen las carpetas `apps/` y `packages/`, `turbo.json` define pipeline y los workspaces `@amauta/web` y `@amauta/api` están creados y operativos. La observación es documental: algunos README internos, en especial [apps/web/README.md](/home/ignacio/amauta/apps/web/README.md), quedaron desactualizados frente al estado real del proyecto.

---

## Requisitos del Issue

Extraídos del issue #4:

- [x] Instalar y configurar Turborepo
- [x] Crear estructura de carpetas (`apps/`, `packages/`)
- [x] Configurar workspaces en `package.json`
- [x] Crear `turbo.json` con pipeline
- [x] Configurar `apps/web` (Next.js)
- [x] Configurar `apps/api` (Express/Fastify)
- [x] Documentar estructura en README

---

## Verificación de Código

| Archivo                        | ¿Existe? | Notas                                             |
| ------------------------------ | -------- | ------------------------------------------------- |
| `package.json`                 | ✅       | Declara workspaces y scripts raíz con `turbo run` |
| `turbo.json`                   | ✅       | Define pipeline base del monorepo                 |
| `apps/web/package.json`        | ✅       | Workspace frontend creado                         |
| `apps/api/package.json`        | ✅       | Workspace backend creado                          |
| `packages/shared/package.json` | ✅       | Package compartido creado                         |
| `packages/types/package.json`  | ✅       | Package de tipos creado                           |
| `README.md`                    | ✅       | Documenta estructura del monorepo                 |

**Evidencia de implementación:**

| Área                             | Evidencia                                                                                               | Estado |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| Turborepo instalado              | `turbo` en `devDependencies` y scripts raíz `turbo run ...`                                             | ✅     |
| Estructura `apps/` y `packages/` | Existen `apps/api`, `apps/web`, `packages/shared`, `packages/types`                                     | ✅     |
| Workspaces                       | `package.json` define `apps/*` y `packages/*`                                                           | ✅     |
| Pipeline                         | `turbo.json` define `build`, `lint`, `type-check`, `dev`, `start`, `clean`                              | ✅     |
| Frontend Next.js                 | `apps/web/package.json`, `next.config.js`, `src/app/`                                                   | ✅     |
| Backend Fastify                  | `apps/api/package.json` usa `@nestjs/platform-fastify`; `apps/api/README.md` documenta NestJS + Fastify | ✅     |
| README raíz                      | Sección `## Estructura del Monorepo` presente                                                           | ✅     |

---

## Tests

**Comando ejecutado:** No aplica.

La auditoría de este issue se centró en verificar estructura, configuración y documentación del monorepo. No ejecuté builds ni tests específicos desde esta sesión.

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

Este issue define estructura de repositorio y no expone endpoints o comportamiento runtime específico para smoke tests en producción.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                            | Verificación                                               | Estado |
| --- | --------------------------------------------------- | ---------------------------------------------------------- | ------ |
| 1   | Instalar y configurar Turborepo                     | `package.json` usa `turbo run` y `turbo` está instalado    | ✅     |
| 2   | Crear estructura de carpetas (`apps/`, `packages/`) | Estructura presente con apps y packages esperados          | ✅     |
| 3   | Configurar workspaces en `package.json`             | `workspaces: ["apps/*", "packages/*"]`                     | ✅     |
| 4   | Crear `turbo.json` con pipeline                     | Archivo presente con pipeline funcional                    | ✅     |
| 5   | Configurar `apps/web` (Next.js)                     | Workspace web con `next`, `next.config.js` y README propio | ✅     |
| 6   | Configurar `apps/api` (Express/Fastify)             | Workspace API configurado sobre NestJS + Fastify           | ✅     |
| 7   | Documentar estructura en README                     | README raíz incluye árbol y descripción del monorepo       | ✅     |

---

## Hallazgos

### Documentación interna parcialmente desactualizada

[apps/web/README.md](/home/ignacio/amauta/apps/web/README.md) menciona versiones y pendientes que ya no representan el estado actual del workspace, por ejemplo “Next.js 14.2”, “React 18” y tareas pendientes ya completadas en fases posteriores. La estructura del monorepo está bien, pero parte de la documentación satélite perdió vigencia.

---

## Observaciones

El issue está claramente cumplido. La mención del checklist a “Express/Fastify” quedó absorbida por una implementación concreta en NestJS + Fastify, alineada además con la arquitectura actual del proyecto.

---

## Evidencia

```text
$ gh issue view 4 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-008: Inicializar estructura de monorepo
closedAt: 2025-12-18T12:10:52Z

$ cat package.json
workspaces:
- apps/*
- packages/*
scripts:
- dev: turbo run dev
- build: turbo run build

$ cat turbo.json
pipeline:
  build
  lint
  type-check
  dev
  start
  clean

$ nl -ba README.md | sed -n '74,100p'
74  ## Estructura del Monorepo
80  ├── apps/
83  ├── packages/
94  - **@amauta/web**
95  - **@amauta/api**
```
