# Auditoría Issue #006 — T-010: Configurar ESLint y Prettier

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #6 - T-010: Configurar ESLint y Prettier
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó la configuración de linting y formateo del repositorio. Existen [/.eslintrc.js](/home/ignacio/amauta/.eslintrc.js), [/.prettierrc](/home/ignacio/amauta/.prettierrc), [/.prettierignore](/home/ignacio/amauta/.prettierignore), scripts de lint/format en los workspaces y configuración de VSCode en [settings.json](/home/ignacio/amauta/.vscode/settings.json). La observación es técnica: ESLint 9 ejecuta esta configuración en modo legado y muestra advertencia de deprecación por uso de `.eslintrc.js`.

---

## Requisitos del Issue

Extraídos del issue #6:

- [x] Instalar ESLint y plugins necesarios
- [x] Configurar `.eslintrc.js` con reglas
- [x] Instalar Prettier
- [x] Configurar `.prettierrc`
- [x] Crear `.prettierignore`
- [x] Asegurar compatibilidad ESLint + Prettier
- [x] Agregar scripts lint y format
- [x] Configurar extensión en VSCode (`settings.json`)

---

## Verificación de Código

| Archivo                 | ¿Existe? | Notas                                             |
| ----------------------- | -------- | ------------------------------------------------- |
| `.eslintrc.js`          | ✅       | Configuración ESLint presente                     |
| `.prettierrc`           | ✅       | Configuración Prettier presente                   |
| `.prettierignore`       | ✅       | Exclusiones definidas                             |
| `.vscode/settings.json` | ✅       | Configuración editor/ESLint/Prettier presente     |
| `.lintstagedrc.js`      | ✅       | Integra ESLint + Prettier en staged files         |
| `package.json`          | ✅       | Scripts globales `lint`, `format`, `format:check` |

**Evidencia de implementación:**

| Área                             | Evidencia                                                                                                 | Estado |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| ESLint instalado                 | `eslint`, `@typescript-eslint/*`, `eslint-config-prettier`, `eslint-plugin-prettier` en `devDependencies` | ✅     |
| Reglas ESLint                    | `.eslintrc.js` define parser, extends, plugins y reglas                                                   | ✅     |
| Prettier instalado               | `prettier` en `devDependencies`                                                                           | ✅     |
| Configuración Prettier           | `.prettierrc` con estilo definido                                                                         | ✅     |
| Ignore de Prettier               | `.prettierignore` presente                                                                                | ✅     |
| Compatibilidad ESLint + Prettier | `plugin:prettier/recommended` configurado como último `extends`                                           | ✅     |
| Scripts                          | scripts `lint`, `lint:fix`, `format`, `format:check` presentes                                            | ✅     |
| VSCode                           | `editor.formatOnSave`, `defaultFormatter` y `source.fixAll.eslint` configurados                           | ✅     |

---

## Tests

**Comandos ejecutados:**

```bash
timeout 15s npm run lint --workspace=@amauta/types
npx prettier --check .eslintrc.js .prettierrc .vscode/settings.json .lintstagedrc.js
```

**Resultados:**

- Lint del workspace `@amauta/types`: OK (exit code `0`) con advertencia de deprecación de ESLintRC
- Prettier sobre archivos de configuración parseables: OK

**Cobertura:**

| Métrica    | Valor | Estado |
| ---------- | ----- | ------ |
| Statements | N/A   | N/A    |
| Branches   | N/A   | N/A    |
| Functions  | N/A   | N/A    |
| Lines      | N/A   | N/A    |

Nota: este issue audita toolchain de calidad y estilo, no cobertura de tests unitarios.

---

## Pruebas en Producción

**Ambiente:** No aplica.

La tarea configura herramientas de desarrollo locales/CI y no expone endpoints para smoke tests en producción.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                         | Verificación                                         | Estado |
| --- | ------------------------------------------------ | ---------------------------------------------------- | ------ |
| 1   | Instalar ESLint y plugins necesarios             | Dependencias presentes en `package.json`             | ✅     |
| 2   | Configurar `.eslintrc.js` con reglas             | Archivo presente con reglas TypeScript + generales   | ✅     |
| 3   | Instalar Prettier                                | Dependencia presente en `package.json`               | ✅     |
| 4   | Configurar `.prettierrc`                         | Archivo presente con estilo definido                 | ✅     |
| 5   | Crear `.prettierignore`                          | Archivo presente con exclusiones relevantes          | ✅     |
| 6   | Asegurar compatibilidad ESLint + Prettier        | `plugin:prettier/recommended` activo                 | ✅     |
| 7   | Agregar scripts lint y format                    | Scripts presentes en raíz y workspaces               | ✅     |
| 8   | Configurar extensión en VSCode (`settings.json`) | `.vscode/settings.json` presente y alineado al flujo | ✅     |

---

## Hallazgos

### Configuración ESLint en modo legado

La ejecución de `eslint` funciona, pero emite advertencia de deprecación porque el repositorio depende de `ESLINT_USE_FLAT_CONFIG=false` y de [/.eslintrc.js](/home/ignacio/amauta/.eslintrc.js). Esto no invalida el issue original, pero deja una deuda técnica para migrar a `eslint.config.js` antes de ESLint 10.

---

## Observaciones

El issue está cumplido y además el proyecto integró esta configuración con `lint-staged` y VSCode. El único punto pendiente es la migración futura al formato flat config de ESLint.

---

## Evidencia

```text
$ gh issue view 6 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-010: Configurar ESLint y Prettier
closedAt: 2025-12-18T12:40:11Z

$ timeout 15s npm run lint --workspace=@amauta/types
exit code: 0
ESLintRCWarning: You are using an eslintrc configuration file...

$ npx prettier --check .eslintrc.js .prettierrc .vscode/settings.json .lintstagedrc.js
All matched files use Prettier code style!
```
