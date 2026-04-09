# Auditoría Issue #008 — T-012: Configurar PostgreSQL

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #8 - T-012: Configurar PostgreSQL
**Estado del issue:** Cerrado
**Veredicto:** ✅ APROBADO

---

## Resumen

Se auditó la configuración de PostgreSQL para desarrollo local. El repositorio incluye [docker-compose.yml](/home/ignacio/amauta/docker-compose.yml) con PostgreSQL 15, volumen persistente, base `amauta_dev` y healthcheck; además existe una guía alternativa de instalación local en [LOCAL_INSTALL.md](/home/ignacio/amauta/docker/postgres/LOCAL_INSTALL.md). La documentación y los templates de entorno cubren `DATABASE_URL` y el flujo de verificación de conexión.

---

## Requisitos del Issue

Extraídos del issue #8:

- [x] Crear `docker-compose.yml` con PostgreSQL
- [x] Configurar volúmenes para persistencia
- [x] Documentar instalación local alternativa
- [x] Crear base de datos de desarrollo
- [x] Configurar `DATABASE_URL` en `.env`
- [x] Verificar conexión

---

## Verificación de Código

| Archivo                            | ¿Existe? | Notas                                     |
| ---------------------------------- | -------- | ----------------------------------------- |
| `docker-compose.yml`               | ✅       | Servicio PostgreSQL configurado           |
| `docker/postgres/LOCAL_INSTALL.md` | ✅       | Guía local alternativa presente           |
| `docker/postgres/init/01-init.sql` | ✅       | Inicialización DB/extensiones             |
| `apps/api/.env.example`            | ✅       | Template con `DATABASE_URL`               |
| `docs/technical/setup.md`          | ✅       | Instrucciones Docker/local y verificación |

**Evidencia de implementación:**

| Área                  | Evidencia                                                   | Estado |
| --------------------- | ----------------------------------------------------------- | ------ |
| Docker PostgreSQL     | Servicio `postgres` con imagen `postgres:15-alpine`         | ✅     |
| Persistencia          | Volumen `postgres_data:/var/lib/postgresql/data`            | ✅     |
| Base de desarrollo    | `POSTGRES_DB: amauta_dev`                                   | ✅     |
| Usuario/credenciales  | `POSTGRES_USER: amauta`, `POSTGRES_PASSWORD: desarrollo123` | ✅     |
| `DATABASE_URL`        | Definido/documentado en `apps/api/.env.example`             | ✅     |
| Verificación conexión | `psql -U amauta -d amauta_dev -h localhost` documentado     | ✅     |

---

## Tests

**Comando ejecutado:** No aplica.

La auditoría verificó la configuración versionada, los scripts de inicialización y la documentación operativa del entorno local.

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

Este issue configura infraestructura de desarrollo local y no expone endpoints específicos para smoke tests en producción.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                  | Verificación                                                | Estado |
| --- | ----------------------------------------- | ----------------------------------------------------------- | ------ |
| 1   | Crear `docker-compose.yml` con PostgreSQL | Archivo presente con servicio `postgres`                    | ✅     |
| 2   | Configurar volúmenes para persistencia    | Volumen `postgres_data` configurado                         | ✅     |
| 3   | Documentar instalación local alternativa  | `docker/postgres/LOCAL_INSTALL.md` presente                 | ✅     |
| 4   | Crear base de datos de desarrollo         | `POSTGRES_DB=amauta_dev` y guía SQL crean `amauta_dev`      | ✅     |
| 5   | Configurar `DATABASE_URL` en `.env`       | `apps/api/.env.example` documenta `DATABASE_URL`            | ✅     |
| 6   | Verificar conexión                        | `docs/technical/setup.md` documenta verificación con `psql` | ✅     |

---

## Hallazgos

Ningún hallazgo. El issue cumple todos sus requisitos.

---

## Observaciones

Además del setup mínimo pedido, el repositorio incluye inicialización automática con extensiones útiles (`uuid-ossp`, `pg_trgm`, `unaccent`) en [01-init.sql](/home/ignacio/amauta/docker/postgres/init/01-init.sql).

---

## Evidencia

```text
$ gh issue view 8 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-012: Configurar PostgreSQL
closedAt: 2025-12-18T17:12:04Z

$ sed -n '1,80p' docker-compose.yml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: amauta_dev
    POSTGRES_USER: amauta

$ rg -n "DATABASE_URL|psql -U amauta -d amauta_dev -h localhost" docs/technical/setup.md apps/api/.env.example
apps/api/.env.example:41:DATABASE_URL=postgresql://usuario:password@localhost:5432/amauta_dev
docs/technical/setup.md:284:psql -U amauta -d amauta_dev -h localhost
```
