# Auditoría Issue #14 — T-007: Configurar pre-commit hooks

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #14 - T-007: Configurar pre-commit hooks
**Estado del issue:** Cerrado
**Veredicto:** ✅ APROBADO

---

## Resumen

Se auditó el issue de infraestructura que debía dejar activos los hooks de Husky para validaciones antes del commit y del mensaje de commit. El repositorio cumple el checklist: Husky está instalado, los hooks `pre-commit` y `commit-msg` existen, `lint-staged` ejecuta ESLint y Prettier sobre archivos staged, y `CONTRIBUTING.md` documenta el flujo.

---

## Requisitos del Issue

Extraídos del issue #14:

- [x] Instalar y configurar Husky
- [x] Configurar pre-commit hook para lint-staged
- [x] Configurar hook para formateo con Prettier
- [x] Configurar hook para linting con ESLint
- [x] Configurar commit-msg hook para conventional commits
- [x] Documentar en CONTRIBUTING.md

---

## Verificación de Código

| Archivo                | ¿Existe? | Notas                                                                                                   |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `package.json`         | ✅       | Incluye `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` y script `prepare` |
| `.husky/pre-commit`    | ✅       | Ejecuta `ESLINT_USE_FLAT_CONFIG=false npx lint-staged`                                                  |
| `.husky/commit-msg`    | ✅       | Ejecuta `npx --no -- commitlint --edit $1`                                                              |
| `.lintstagedrc.js`     | ✅       | Configura `eslint --fix` y `prettier --write` para archivos JS/TS; Prettier para JSON/MD/YAML           |
| `commitlint.config.js` | ✅       | Extiende `@commitlint/config-conventional` y restringe tipos válidos                                    |
| `CONTRIBUTING.md`      | ✅       | Documenta hooks, tipos válidos y comportamiento esperado                                                |

---

## Validaciones Ejecutadas

**Comandos ejecutados:**

```bash
npx lint-staged --debug
npx commitlint --edit /tmp/amauta-commit-valid.txt
npx commitlint --edit /tmp/amauta-commit-invalid.txt
```

**Resultados:**

- `lint-staged` cargó correctamente la configuración desde `.lintstagedrc.js`
- La configuración detectada ejecuta ESLint y Prettier según el tipo de archivo
- `commitlint` aceptó `feat: prueba valida`
- `commitlint` rechazó `mensaje invalido` con errores `subject-empty` y `type-empty`

---

## Pruebas en Producción

No aplica. El issue auditado corresponde a tooling local del repositorio y no introduce endpoints ni comportamiento desplegado en la API o frontend.

---

## Criterios de Aceptación

| #   | Criterio                                             | Verificación                                                                             | Estado |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| 1   | Instalar y configurar Husky                          | `package.json` incluye dependencia `husky` y script `prepare`; `.husky/` está versionado | ✅     |
| 2   | Configurar pre-commit hook para lint-staged          | `.husky/pre-commit` invoca `npx lint-staged`                                             | ✅     |
| 3   | Configurar hook para formateo con Prettier           | `.lintstagedrc.js` ejecuta `prettier --write` para JS/TS/JSON/MD/YAML                    | ✅     |
| 4   | Configurar hook para linting con ESLint              | `.lintstagedrc.js` ejecuta `eslint --fix` para JS/TS                                     | ✅     |
| 5   | Configurar commit-msg hook para conventional commits | `.husky/commit-msg` usa `commitlint`, validado con caso válido e inválido                | ✅     |
| 6   | Documentar en CONTRIBUTING.md                        | `CONTRIBUTING.md` describe Husky, `lint-staged` y `commitlint`                           | ✅     |

---

## Hallazgos

1. La implementación real está alineada con el checklist del issue y funciona.
2. La configuración de `lint-staged` no está en `package.json`, sino en `.lintstagedrc.js`; esto es válido, pero conviene recordarlo cuando se inspeccione el repo.
3. `CONTRIBUTING.md` explica correctamente el comportamiento de los hooks durante la instalación y el commit.

---

## Evidencia

```text
package.json
- script prepare: línea 35
- devDependencies: husky, lint-staged, commitlint

.husky/pre-commit
- ESLINT_USE_FLAT_CONFIG=false npx lint-staged

.husky/commit-msg
- npx --no -- commitlint --edit $1

.lintstagedrc.js
- **/*.{ts,tsx,js,jsx}: eslint --fix, prettier --write
- **/*.json: prettier --write
- **/*.md: prettier --write
- **/*.{yml,yaml}: prettier --write

commitlint.config.js
- extiende @commitlint/config-conventional
- tipos válidos: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert

Validación commitlint
- "feat: prueba valida" => exit code 0
- "mensaje invalido" => exit code 1
```
