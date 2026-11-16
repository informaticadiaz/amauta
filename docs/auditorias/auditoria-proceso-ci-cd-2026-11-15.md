# Auditoría del proceso de CI/CD

**Fecha de revisión:** 2026-11-15
**Estado:** Documento de evaluación para el equipo de desarrollo
**Alcance:** Workflow actual de GitHub Actions, validaciones automatizadas, tests, seguridad del pipeline y relación con el deploy productivo.

> Este documento no propone aplicar cambios todavía. Su objetivo es dejar una base común para que el equipo evalúe prioridades, riesgos y decisiones de diseño con tiempo.

## Resumen ejecutivo

El pipeline actual cubre correctamente una base de integración continua: instalación reproducible, validaciones de Prisma, formato, lint, TypeScript, build y tests Jest de API y Web.

Sin embargo, todavía presenta cinco brechas importantes:

1. El mismo workflow mezcla CI con deploy automático a producción.
2. Los tests E2E de Playwright existen, pero no forman parte del gate de CI.
3. La cobertura no tiene umbrales, artefactos ni publicación verificable.
4. La detección de archivos sensibles sólo advierte en algunos casos y no inspecciona contenido.
5. La documentación de workflows está desactualizada respecto del pipeline real.

La principal decisión a discutir es si queremos que `ci.yml` siga siendo un workflow mixto CI/CD o si debemos separar la validación del código del despliegue productivo.

## Estado actual del pipeline

### Eventos que lo disparan

`.github/workflows/ci.yml` se ejecuta en:

- `push` a `main`, `master` y `develop`.
- `pull_request` dirigido a `main`, `master` y `develop`.
- Se cancelan ejecuciones anteriores del mismo branch o PR mediante `concurrency`.

No tiene actualmente un disparador manual mediante `workflow_dispatch`.

### Flujo de jobs

```text
validate ──> build ──> deploy (sólo push a master)
     \          \          /
      └────────> summary <─┘
```

| Job        | Qué hace                                                                                 | Resultado esperado                                                 |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `validate` | Estructura, archivos sensibles, documentación básica y disciplina de migraciones Prisma  | Falla ante errores estructurales o cambios de schema sin migración |
| `build`    | Instala dependencias, genera/valida Prisma, formatea, lint, tipos, build y tests API/Web | Falla ante errores de calidad, compilación o tests                 |
| `deploy`   | Dispara el deploy de Dokploy por SSH y espera el healthcheck de API                      | Sólo corre después de `build`, en push a `master`                  |
| `summary`  | Imprime un resumen de la ejecución                                                       | Siempre corre, incluso si otro job falla                           |

## Qué está cubierto hoy

| Área                               | Estado                     | Evidencia                                                       |
| ---------------------------------- | -------------------------- | --------------------------------------------------------------- |
| Instalación reproducible           | Cubierta                   | `npm ci` en el job `build`                                      |
| Node.js                            | Cubierta con versión fija  | `actions/setup-node@v4`, Node `22.22.1`                         |
| Cache de dependencias              | Cubierta                   | Cache npm de `setup-node`                                       |
| Formato                            | Parcialmente cubierta      | `npm run format:check`; cubre TS, TSX, JS, JSX, JSON y Markdown |
| ESLint                             | Cubierta                   | `npm run lint`                                                  |
| TypeScript                         | Cubierta                   | `npm run type-check`                                            |
| Build                              | Cubierta                   | `npm run build`                                                 |
| Prisma Client y schema             | Parcialmente cubierta      | Generación, `prisma validate` y regla de migraciones            |
| Tests API                          | Cubierta                   | `npm run test --workspace=@amauta/api`                          |
| Tests Web                          | Cubierta                   | `npm run test:ci --workspace=@amauta/web`                       |
| Tests E2E                          | No cubierta en CI          | Hay scripts en `apps/e2e`, pero no se invocan desde `ci.yml`    |
| Umbrales de cobertura              | No cubierta                | No hay `coverageThreshold` configurado                          |
| Publicación de cobertura           | No cubierta                | No hay artefactos ni Codecov/Coveralls/equivalente              |
| Escaneo de dependencias y secretos | Parcial                    | Sólo hay controles básicos propios                              |
| Validación del workflow YAML       | No cubierta explícitamente | No hay `actionlint` o herramienta equivalente                   |

## Hallazgos para evaluar

### H1 — Separación entre CI y deploy productivo

**Prioridad sugerida: alta**

El job `deploy` está en el mismo workflow que valida pull requests y branches. Se ejecuta automáticamente después de un `push` a `master` y:

- Conecta al VPS como `root`.
- Usa una clave SSH almacenada como secret.
- Desactiva la verificación de host con `StrictHostKeyChecking=no`.
- Depende de una rama concreta (`master`) mientras el workflow también contempla `main`.
- Utiliza una IP de infraestructura directamente en el workflow.

**Riesgo:** un cambio no deseado en el workflow, una modificación de la rama protegida o un compromiso del entorno de Actions puede tener impacto directo sobre producción.

**Preguntas para el equipo:**

- ¿El deploy debe seguir siendo automático ante cada push a `master`?
- ¿La rama productiva es realmente `master` o debería ser `main`?
- ¿Necesitamos aprobación manual mediante un environment de GitHub?
- ¿Podemos usar un usuario de deploy limitado en lugar de `root`?
- ¿Podemos separar `ci.yml` y `deploy.yml`?

**Dirección recomendada para evaluar:** separar CI y CD; proteger el environment de producción; usar un usuario con permisos mínimos; configurar `known_hosts` explícitamente.

### H2 — Los tests E2E no son parte del gate

**Prioridad sugerida: alta**

El workspace `apps/e2e` tiene scripts para Playwright y suites separadas de frontend y API, pero el workflow no instala navegadores ni ejecuta esos tests.

**Impacto:** el pipeline no verifica integración real entre frontend y API ni recorridos críticos de usuario. Un build puede pasar aunque falle una interacción completa.

**Preguntas para el equipo:**

- ¿Qué recorridos son críticos para bloquear un PR?
- ¿Los E2E deben correr en cada PR o sólo en una suite reducida?
- ¿Qué servicios y datos de prueba necesita el entorno de E2E?
- ¿Conviene separar E2E rápidos de una suite nocturna o de release?

### H3 — La cobertura no es una condición verificable

**Prioridad sugerida: alta**

La configuración de Jest recolecta cobertura en algunos paquetes, pero el pipeline no define un mínimo obligatorio ni publica resultados consumibles por el equipo.

Actualmente no hay:

- `coverageThreshold` aplicable al gate.
- Artefactos de cobertura en GitHub Actions.
- Integración con Codecov, Coveralls u otro servicio.
- Badge o indicador visible en la documentación principal.
- Política diferenciada para cobertura global y código nuevo.

**Preguntas para el equipo:**

- ¿Queremos un umbral global, un umbral incremental o ambos?
- ¿Cuál es el mínimo razonable para API y Web?
- ¿La cobertura debe bloquear PRs o sólo informar?
- ¿Necesitamos conservar los reportes como artefactos?

**Advertencia:** no conviene fijar un porcentaje sin acordar primero qué mide, qué excluye y cómo se tratará el código legado.

### H4 — El control de archivos sensibles no bloquea todos los casos

**Prioridad sugerida: media-alta**

El workflow rechaza archivos `.env` versionados, pero la búsqueda de nombres como `secret`, `credentials` o `private key` sólo emite una advertencia. Además, el control se basa en nombres de archivo y no en el contenido.

**Impacto:** un archivo sospechoso puede llegar a pasar el job `validate`; también pueden existir secretos con nombres no obvios.

**Preguntas para el equipo:**

- ¿Qué scanner está permitido para este repositorio?
- ¿Queremos bloquear hallazgos nuevos o sólo reportarlos?
- ¿Cómo se manejarán falsos positivos y excepciones documentadas?
- ¿Necesitamos habilitar controles nativos de GitHub, como secret scanning o push protection?

### H5 — El resumen no refleja los resultados reales

**Prioridad sugerida: media**

El job `summary` usa `if: always()`, pero imprime mensajes estáticos de éxito sin consultar `needs.<job>.result`.

**Impacto:** el estado global del workflow puede ser fallido, pero el resumen puede decir que build, tests o validaciones fueron exitosos. Esto dificulta el diagnóstico y puede confundir a quien revisa un PR.

**Dirección recomendada:** mostrar el resultado real de cada job y distinguir entre `success`, `failure`, `cancelled` y `skipped`.

### H6 — Documentación desalineada

**Prioridad sugerida: media**

`.github/WORKFLOWS.md` todavía describe tests y coverage como placeholders o trabajo futuro, aunque el workflow actual ya ejecuta tests API y Web. También menciona una matrix de Node que no existe actualmente.

**Impacto:** el equipo no puede usar esa documentación como fuente confiable para entender el pipeline.

**Dirección recomendada:** actualizar la documentación después de acordar el diseño objetivo y mantenerla junto con cada cambio del workflow.

### H7 — Validaciones de formato y del workflow incompletas

**Prioridad sugerida: media-baja**

`format:check` no cubre YAML, CSS u otros formatos del repositorio. Tampoco existe una validación específica de sintaxis y prácticas de GitHub Actions mediante `actionlint` o equivalente.

**Impacto:** algunos errores de configuración o formato pueden detectarse recién al ejecutar Actions o al revisar manualmente.

## Propuesta de evaluación por etapas

Se recomienda discutir las decisiones en este orden:

### Etapa 1 — Seguridad y límites de producción

- Confirmar rama productiva.
- Decidir si el deploy seguirá siendo automático.
- Separar CI de CD o justificar formalmente mantenerlos juntos.
- Retirar el acceso SSH como `root` si la infraestructura lo permite.
- Definir protección y aprobación del environment de producción.

### Etapa 2 — Gate funcional

- Identificar los recorridos E2E críticos.
- Definir qué corre en cada PR, en `main`/`master` y de forma nocturna.
- Definir servicios, datos de prueba y artefactos de Playwright.

### Etapa 3 — Calidad medible

- Acordar política de cobertura.
- Definir umbrales para API y Web.
- Publicar reportes y decidir si bloquean o informan.
- Revisar si la política se aplica al código legado, al código nuevo o a ambos.

### Etapa 4 — Mantenibilidad del pipeline

- Corregir `summary`.
- Actualizar `.github/WORKFLOWS.md`.
- Añadir validación de YAML/Actions.
- Revisar cobertura de formatos.

## Checklist de decisión del equipo

- [ ] Confirmamos cuál es la rama de producción.
- [ ] Decidimos si CI y CD deben estar separados.
- [ ] Definimos el modelo de permisos del deploy.
- [ ] Identificamos los E2E que deben bloquear un PR.
- [ ] Definimos una política de cobertura.
- [ ] Definimos cómo se escanean secretos y dependencias.
- [ ] Acordamos el comportamiento esperado del resumen.
- [ ] Actualizamos la documentación del workflow.
- [ ] Acordamos qué cambios requieren revisión de seguridad.

## Fuentes revisadas

- `.github/workflows/ci.yml`
- `.github/WORKFLOWS.md`
- `package.json`
- `apps/e2e/package.json`
- `docs/audits/issue-003-github-actions-ci.md`
- `docs/audits/issue-010-expandir-ci-lint-typecheck-build.md`
- `docs/audits/issue-013-configurar-tests-ci.md`
- `.github/SECURITY_SANITIZATION.md`

## No incluido en esta revisión

- No se ejecutó el workflow remoto en GitHub Actions.
- No se modificó la configuración de CI/CD.
- No se validó el estado actual del VPS ni de Dokploy.
- No se evaluaron costos, tiempos de ejecución ni límites de minutos de GitHub Actions.
- No se eligió todavía una herramienta concreta para E2E, cobertura o secret scanning.
