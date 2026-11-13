# Checklist de transición a Node.js 22 LTS

Este documento prepara una eventual transición operativa de Amauta a Node.js 22.22.1. No ejecuta ni autoriza un despliegue: separa la evidencia local, la revisión de Dokploy y la decisión de publicar en producción.

## Decisión actual

- Runtime objetivo: **Node.js 22.22.1**.
- npm de verificación: **10.2.5**.
- Compatibilidad local: verificada.
- Imágenes Docker: construidas localmente y probadas en contenedores descartables.
- Producción: **no modificada y no autorizada para cambio**.
- Commit y push: pendientes de una decisión separada.

## Evidencia local disponible

- `odd/evidence/node-lts-verification.txt`
  - format, lint, type-check, build y tests.
  - API: 28 suites / 345 tests.
  - Web: 53 suites / 245 tests.
  - Builds de las imágenes API y Web.
- `odd/evidence/node-lts-smoke-test.txt`
  - PostgreSQL 15 y Redis 7 descartables.
  - Migraciones Prisma ejecutadas.
  - API `/health` saludable.
  - Web HTTP 200 y healthcheck saludable.
- Correcciones locales detectadas durante la verificación:
  - migración `20261016000100_materias_escolares`;
  - inyección de `MateriasService` en `MateriasController`.

## Pre-deploy: revisión obligatoria

- [ ] Revisar el diff completo y confirmar que solo contiene cambios autorizados.
- [ ] Confirmar que el commit se crea en una rama de trabajo, no directamente sobre la rama por defecto si la política del repositorio lo exige.
- [ ] Ejecutar los checks finales desde el commit candidato.
- [ ] Confirmar que CI usa Node.js 22.22.1.
- [ ] Confirmar que los Dockerfiles usan `node:22.22.1-alpine` en todos sus stages.
- [ ] Confirmar que Dokploy construye desde el commit candidato y no desde un tag o rama diferente.
- [ ] Verificar en Dokploy las variables de entorno de API y Web sin imprimir secretos.
- [ ] Confirmar que `DATABASE_URL` apunta a la base de Amauta prevista y no a una base equivocada.
- [ ] Confirmar backup reciente y ruta de recuperación de PostgreSQL.
- [ ] Revisar separadamente el estado de la migración `20261016000100_materias_escolares` en el entorno destino.
- [ ] No ejecutar `prisma migrate deploy` hasta resolver esa revisión: el smoke test local necesitó corregir el SQL de esa migración.

## Despliegue controlado en Dokploy

Solo después de una autorización explícita de despliegue:

1. Confirmar el commit candidato y registrar su identificador.
2. Confirmar que la imagen se construirá con Node.js 22.22.1.
3. Desplegar primero la API o seguir el orden definido por el proyecto en Dokploy.
4. Observar logs de arranque y el resultado de `prisma migrate deploy`.
5. Verificar el healthcheck de la API antes de continuar con Web.
6. Desplegar Web.
7. Verificar el healthcheck de Web y las URLs públicas.
8. Registrar hora, commit, imágenes, resultado y cualquier warning.

## Verificación posterior

- [ ] API responde `GET /health` con HTTP 200.
- [ ] API queda `healthy` en Dokploy/Docker.
- [ ] Web responde HTTP 200.
- [ ] Web queda `healthy`.
- [ ] No hay errores de migración en los logs.
- [ ] No hay errores de conexión a PostgreSQL o Redis.
- [ ] CORS y autenticación se verifican con una prueba funcional acotada.
- [ ] Los backups y el monitoreo siguen activos.

## Recuperación

Si el healthcheck falla o el arranque presenta errores:

1. Detener la progresión del despliegue; no reintentar indefinidamente.
2. Conservar los logs del contenedor y el identificador del commit.
3. Mantener la base de datos sin operaciones manuales improvisadas.
4. Volver en Dokploy a la imagen o commit anterior conocido como funcional, si la recuperación fue previamente validada.
5. No marcar migraciones como aplicadas o revertidas sin revisar el estado real y preservar un backup.
6. Verificar nuevamente API, Web y conexión a la base.
7. Registrar el incidente y la decisión antes de otro intento.

## Fuera de alcance de este documento

- Ejecutar despliegues.
- Aplicar migraciones en producción.
- Cambiar DNS, Cloudflare o Dokploy.
- Crear backups operativos.
- Hacer commit, push o pull request.

## Estado de T4

T4 queda preparado documentalmente: existe un checklist de despliegue separado, una revisión previa obligatoria y una ruta de recuperación. La transición no está ejecutada ni autorizada.
