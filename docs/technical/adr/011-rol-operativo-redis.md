# ADR-011: Redis como infraestructura preparada, no dependencia operativa

## Estado

Aceptado

## Fecha

2026-11-12

## Contexto

El repositorio incluye Redis 7 en `docker-compose.yml`, variables `REDIS_URL` y `REDIS_CACHE_TTL`, y documentación que lo describe alternativamente como caché, sesiones o servicio opcional. Sin embargo, la API no contiene un cliente Redis, un adaptador de sesiones, un backend de caché, una cola ni un storage distribuido para `@nestjs/throttler`.

Esta diferencia podía hacer que una persona tratara Redis como requisito obligatorio o asumiera garantías de caída, TTL e invalidación que la aplicación no implementa.

## Evidencia revisada

- `apps/api/src`: no contiene imports, providers ni llamadas a Redis.
- `apps/api/package.json` y `package-lock.json`: no contienen `redis`, `ioredis`, `cache-manager`, Bull/BullMQ ni adaptadores equivalentes.
- `apps/api/src/config/env.ts`: `REDIS_URL` es opcional y `REDIS_CACHE_TTL` tiene un valor preparado, pero ninguna de las dos variables se consume después de validar el entorno.
- `apps/api/src/app.module.ts`: el rate limiting usa `@nestjs/throttler` sin storage Redis configurado.
- La autenticación usa JWT y Prisma; no hay sesiones almacenadas en Redis.

## Decisión

Redis se clasifica como **infraestructura preparada y opcional, no utilizada operativamente por la aplicación actual**.

- **Desarrollo:** no es requisito para compilar, ejecutar o probar la API actual. Puede iniciarse con Docker para conservar un entorno preparado.
- **Tests:** no se requiere Redis; no hay integración funcional que probar.
- **Producción:** su despliegue no demuestra una dependencia de la API. Una caída de Redis no tiene un comportamiento de aplicación definido porque la API no abre una conexión.
- **Búsqueda:** no existe caché Redis de catálogo o búsqueda.
- **Sesiones:** no se almacenan sesiones en Redis; la autenticación versionada usa JWT.
- **Rate limiting:** permanece local al proceso de NestJS; no es distribuido entre instancias.
- **TTL, claves e invalidación:** no aplican hasta que se implemente un consumidor concreto.
- **Observabilidad:** no se prometen métricas, logs ni healthchecks de Redis desde la API.

El healthcheck de Docker debe verificar autenticación con `redis-cli ping` y no ejecutar comandos mutantes. La configuración de desarrollo conserva password, AOF, límite de memoria y política LRU como preparación operativa, no como evidencia de uso.

## Fuera de alcance

- Agregar caché de búsqueda.
- Migrar sesiones a Redis.
- Distribuir el rate limiting.
- Incorporar colas, workers o BullMQ.
- Definir TTL, namespaces, invalidación o métricas para una integración todavía inexistente.
- Cambiar la infraestructura externa de Dokploy o producción.

Cualquiera de esas decisiones requiere una nueva tarea con consumidor real, contrato de caída, pruebas y observabilidad.

## Consecuencias

### Positivas

- El requisito de Redis queda explícito y verificable.
- Los entornos locales pueden omitir Redis sin presentar una falsa dependencia.
- Se evita introducir caché o sesiones sin definir invalidación y comportamiento ante caída.

### Negativas

- El rate limiting no comparte estado entre réplicas.
- La infraestructura Docker mantiene un servicio que actualmente no aporta comportamiento a la API.
- La integración futura necesitará una nueva decisión y pruebas antes de volverse obligatoria.

## Referencias

- `odd/tasks/amauta-mejoras.md` — T6
- `docker-compose.yml`
- `apps/api/src/config/env.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `docs/technical/setup.md`
