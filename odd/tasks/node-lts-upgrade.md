# ODD Plan — Amauta: actualización del runtime Node.js a una línea LTS

Estado: T1, T2, T3, T4 y T5 completados; implementación local preparada, sin despliegue.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Actualización coordinada a Node.js LTS

> "coincido con que la versión lts es la recomendada y que habría que chequear todos los puntos que mencionas por eso creo que importante crear un odd aparte para esta tarea."

Amauta debe evaluar y actualizar su runtime desde Node.js 20 a Node.js 22 LTS, cubriendo CI, imágenes Docker, engines, documentación y entorno de producción sin dejar referencias operativas contradictorias.

### S2 — Compatibilidad verificable antes de desplegar

La actualización debe comprobar compatibilidad con las dependencias y herramientas que usa el monorepo, incluyendo Next.js, NestJS, Prisma, TypeScript, Jest, npm, Alpine y Dokploy. Los checks deben ejecutarse antes de cualquier despliegue y los resultados deben quedar registrados.

### S3 — Despliegue controlado

La actualización no autoriza por sí sola cambios en producción. Cualquier despliegue, migración o cambio operativo debe mantener su autorización separada y contar con una ruta de recuperación.

## Tasks

### T1 — Inventariar referencias y elegir la línea LTS objetivo

- Estado: completado
- Specs: S1-S2
- Ruta: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, Dockerfiles, documentación y configuración de despliegue
- Dependencias: ninguna
- Entregables:
  - Inventario completo de versiones y referencias a Node.js/npm.
  - Verificación de la línea LTS soportada al momento de implementar.
  - Matriz de compatibilidad de dependencias críticas y runtime de producción.
  - Decisión documentada de versión objetivo y criterio para no usar `latest`.
- Criterio de cierre: existe una versión objetivo justificada y no quedan incertidumbres críticas sin registrar.
- Verificación: búsqueda reproducible de referencias y revisión de documentación oficial de soporte.
- Resultado: Node.js 22 LTS, con imágenes/CI fijados en 22.22.1 y engines restringido a la línea 22.
- Riesgo: item 5 — cambio de runtime, imágenes y entorno de entrega.
- Commit: pendiente

### T2 — Actualizar CI, engines, Dockerfiles y documentación

- Estado: completado
- Specs: S1
- Ruta: configuración de CI, `package.json`, Dockerfiles y documentación técnica/de desarrollo
- Dependencias: T1
- Entregables:
  - CI ejecutando con la versión objetivo.
  - Imágenes de API y web basadas en la línea objetivo.
  - `engines` y documentación alineados.
  - Lockfile actualizado solamente si corresponde y con cambios revisados.
- Criterio de cierre: todos los puntos de ejecución documentados usan la política de versión acordada.
- Verificación: búsqueda sin referencias operativas obsoletas y revisión de los diffs de configuración.
- Resultado: CI y Docker usan Node.js 22.22.1; `engines` restringe la línea 22; la documentación operativa fue alineada. Las referencias en auditorías y registros históricos se conservaron como evidencia histórica.
- Riesgo: item 5 — una imagen o entorno olvidado puede mantener Node 20 en producción.
- Commit: pendiente

### T3 — Ejecutar compatibilidad y pruebas completas

- Estado: completado
- Specs: S2
- Ruta: monorepo y artefactos Docker
- Dependencias: T2
- Entregables:
  - `npm ci` reproducible.
  - Prisma generate/validate.
  - format check, lint, type-check y build.
  - Tests API y web.
  - Build de las imágenes Docker y smoke test aislado.
  - Registro de fallos, incompatibilidades y correcciones.
- Criterio de cierre: los checks aplicables pasan o cada bloqueo queda explícitamente registrado.
- Verificación: comandos reproducibles y resultados observables.
- Resultado: Node v22.22.1; Prisma generate/validate, lint, type-check, build del monorepo, API (28 suites/345 tests), web (53 suites/245 tests) y `format:check` pasan. Se excluyeron del formateo los artefactos generados `.atl/`, `apps/web/next-env.d.ts` y los service workers generados.
- Referencias operativas: no quedan referencias activas a Node 20; las referencias en auditorías, tareas históricas y este plan se conservaron como evidencia histórica.
- Resultado final: npm 10.2.5 quedó disponible; todos los checks locales pasaron y las imágenes API y Web se construyeron correctamente con Docker. La migración de materias y la inyección de `MateriasService` se corrigieron localmente. El smoke test aislado confirmó migraciones, arranque API, `/health` saludable, arranque Web, respuesta HTTP 200 y healthcheck Web saludable. No se desplegó producción.
- Riesgo: item 6 — diferencias de runtime pueden aparecer solo durante build, test o ejecución.
- Commit: pendiente

### Evidencia automatizada de T3

- Script: `scripts/verify-node22-docker.sh`
- Salida: `odd/evidence/node-lts-verification.txt`
- El script ejecuta preflight de Node/npm, format, lint, type-check, build, tests y builds Docker. No instala npm ni inicia Docker automáticamente.
- Ejecución completa: Node.js 22.22.1 y npm 10.2.5; format, lint, type-check, build del monorepo, tests y ambos builds Docker pasaron (API: 28 suites/345 tests; web: 53 suites/245 tests). Las imágenes son locales y no se desplegaron. El smoke test adicional está registrado en `odd/evidence/node-lts-smoke-test.txt`.

### L4

La segunda ejecución del script encontró npm 10.2.5 mediante `~/.npm-global/bin/npm`. Pasaron format, lint, type-check, build del monorepo y todos los tests API/web. La ejecución posterior confirmó Docker cliente 29.8.2, construyó las imágenes `amauta-api:node22-t3` y `amauta-web:node22-t3`, y terminó con `OK: verificaciones completadas`. La corrección de ESLint agregó `**/next-env.d.ts` a `.eslintrc.js` y mantuvo el mismo ignore en `eslint.config.js`.

### L5

El smoke test local aislado se ejecutó contra PostgreSQL 15 y Redis 7 descartables. Primero detectó y corrigió una condición SQL incompatible con PostgreSQL en la migración `20261016000100_materias_escolares`; luego detectó y corrigió un `import type` que impedía la inyección de `MateriasService` en `MateriasController`. Con ambas correcciones, la API ejecutó las migraciones, respondió `GET /health` con `status: ok` y quedó `healthy`; la Web respondió HTTP 200 y su healthcheck también quedó `healthy`. Todos los contenedores temporales y la red fueron eliminados al finalizar. Producción no fue consultada ni modificada.

### T4 — Preparar la transición operativa

- Estado: completado
- Specs: S1-S3
- Ruta: Dokploy, documentación operativa y procedimiento de recuperación
- Dependencias: T3
- Entregables:
  - Confirmación documentada del flujo Dokploy/Docker y sus healthchecks.
  - Checklist de despliegue separado de la implementación en `docs/technical/node-lts-transition-checklist.md`.
  - Ruta de recuperación documentada en el mismo checklist.
  - Decisión explícita: el despliegue queda postergado y requiere autorización separada.
- Criterio de cierre: se puede decidir el despliegue con evidencia de compatibilidad y sin mezclarlo con la actualización local.
- Verificación: revisión operativa sin ejecutar cambios de producción no autorizados.
- Riesgo: item 5 — cambios de entorno y entrega pueden afectar producción.
- Commit: pendiente

### T5 — Cerrar documentación y evidencia

- Estado: completado
- Specs: S1-S3
- Ruta: `AGENTS.md`, `CLAUDE.md`, documentación técnica y este plan
- Dependencias: T3 y T4
- Entregables:
  - Estado final de la versión soportada registrado: Node.js 22.22.1 y npm 10.2.5.
  - Evidencia de checks, builds y smoke test registrada en `odd/evidence/`.
  - Pendientes y límites registrados: no hay despliegue, commit ni push; la DB real no fue consultada.
  - Separación explícita entre actualizado localmente, preparado operativamente y desplegado en producción.
- Criterio de cierre: otro colaborador puede reconstruir la decisión y verificar el runtime sin depender de la conversación.
- Verificación: revisión cruzada de referencias y enlaces.
- Riesgo: none
- Commit: pendiente

## Orden ODD y gates

1. **T1 — Inventario y decisión:** no se cambia Node sin una versión LTS objetivo justificada.
2. **T2 — Implementación de configuración:** actualizar todos los puntos coordinadamente.
3. **T3 — Compatibilidad:** observar checks antes de preparar cualquier entrega.
4. **Gate operativo:** T4 no autoriza despliegue; solo prepara la decisión y la recuperación.
5. **T5 — Cierre:** registrar evidencia y distinguir runtime actualizado de producción actualizada.

## Definición de terminado global

- La versión objetivo es una línea Node.js LTS soportada y documentada.
- CI, Dockerfiles, engines y documentación están alineados.
- Las verificaciones aplicables pasan o sus bloqueos quedan registrados.
- La compatibilidad de API, web, Prisma y builds Docker tiene evidencia.
- Producción solo cambia mediante autorización operativa separada.

## Log

### L1

> "coincido con que la versión lts es la recomendada y que habría que chequear todos los puntos que mencionas por eso creo que importante crear un odd aparte para esta tarea."

Se crea este plan separado para evaluar y actualizar Node.js de manera coordinada, sin mezclar la decisión de runtime con el trabajo documental T1 ni asumir autorización de despliegue.

### L2

La compatibilidad local de código y tests fue verificada con Node.js v22.22.1. La verificación Docker quedó bloqueada por la indisponibilidad del daemon local; no se reintentó ni se inició ningún servicio del sistema. El despliegue y cualquier cambio operativo permanecen fuera de alcance sin autorización separada.

### L3

Se corrigió el alcance del `format:check` para ignorar artefactos generados y se alinearon las referencias operativas de Node.js en la documentación. `npm run format:check` pasa y no quedan referencias operativas a Node 20. En ese momento npm 9.2.0 y la indisponibilidad del daemon Docker bloqueaban la verificación; esos bloqueos se resolvieron posteriormente sin modificar producción.

### L6

T5 queda cerrado. `npm run format:check`, `git diff --check`, la búsqueda de referencias operativas obsoletas y el enlace del checklist técnico pasan. El ODD documenta Node.js 22.22.1 como runtime preparado localmente, evidencia completa de compatibilidad y smoke test, transición operativa preparada y producción sin cambios. Commit, push y despliegue permanecen fuera de alcance hasta autorización separada.
