# ODD Plan — Amauta: actualización del runtime Node.js a una línea LTS

Estado: planificado, sin implementación iniciada.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Actualización coordinada a Node.js LTS

> "coincido con que la versión lts es la recomendada y que habría que chequear todos los puntos que mencionas por eso creo que importante crear un odd aparte para esta tarea."

Amauta debe evaluar y, una vez aprobada la versión objetivo, actualizar su runtime desde Node.js 20 a una línea LTS soportada, cubriendo CI, imágenes Docker, engines, documentación y entorno de producción sin dejar referencias operativas contradictorias.

### S2 — Compatibilidad verificable antes de desplegar

La actualización debe comprobar compatibilidad con las dependencias y herramientas que usa el monorepo, incluyendo Next.js, NestJS, Prisma, TypeScript, Jest, npm, Alpine y Dokploy. Los checks deben ejecutarse antes de cualquier despliegue y los resultados deben quedar registrados.

### S3 — Despliegue controlado

La actualización no autoriza por sí sola cambios en producción. Cualquier despliegue, migración o cambio operativo debe mantener su autorización separada y contar con una ruta de recuperación.

## Tasks

### T1 — Inventariar referencias y elegir la línea LTS objetivo

- Estado: pendiente
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
- Riesgo: item 5 — cambio de runtime, imágenes y entorno de entrega.
- Commit: pendiente

### T2 — Actualizar CI, engines, Dockerfiles y documentación

- Estado: pendiente
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
- Riesgo: item 5 — una imagen o entorno olvidado puede mantener Node 20 en producción.
- Commit: pendiente

### T3 — Ejecutar compatibilidad y pruebas completas

- Estado: pendiente
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
- Riesgo: item 6 — diferencias de runtime pueden aparecer solo durante build, test o ejecución.
- Commit: pendiente

### T4 — Preparar la transición operativa

- Estado: pendiente
- Specs: S1-S3
- Ruta: Dokploy, documentación operativa y procedimiento de recuperación
- Dependencias: T3
- Entregables:
  - Confirmación de cómo Dokploy construye y ejecuta las imágenes.
  - Checklist de despliegue separado de la implementación.
  - Ruta de recuperación documentada.
  - Decisión explícita sobre autorización o postergación del despliegue.
- Criterio de cierre: se puede decidir el despliegue con evidencia de compatibilidad y sin mezclarlo con la actualización local.
- Verificación: revisión operativa sin ejecutar cambios de producción no autorizados.
- Riesgo: item 5 — cambios de entorno y entrega pueden afectar producción.
- Commit: pendiente

### T5 — Cerrar documentación y evidencia

- Estado: pendiente
- Specs: S1-S3
- Ruta: `AGENTS.md`, `CLAUDE.md`, documentación técnica y este plan
- Dependencias: T3 y T4
- Entregables:
  - Estado final de la versión soportada.
  - Evidencia de checks y builds.
  - Pendientes o verificadores no disponibles registrados.
  - Separación clara entre actualizado, preparado y desplegado.
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
