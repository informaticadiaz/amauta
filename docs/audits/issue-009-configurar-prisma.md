# Auditoría Issue #009 — T-013: Configurar Prisma

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #9 - T-013: Configurar Prisma
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó la integración de Prisma en el backend. Prisma y Prisma Client están instalados, el schema existe y valida correctamente, hay migraciones versionadas, scripts de Prisma en [package.json](/home/ignacio/amauta/apps/api/package.json) y documentación operativa en [apps/api/prisma/README.md](/home/ignacio/amauta/apps/api/prisma/README.md). La observación es documental: parte del README de Prisma quedó desactualizado respecto del estado actual del repositorio y de la política vigente de migraciones.

---

## Requisitos del Issue

Extraídos del issue #9:

- [x] Instalar Prisma y Prisma Client
- [x] Inicializar Prisma (`prisma init`)
- [x] Crear `schema.prisma` base
- [x] Definir modelos iniciales (`Usuario`, `Perfil`)
- [x] Generar primera migración
- [x] Generar Prisma Client
- [x] Configurar scripts en `package.json`
- [x] Documentar comandos Prisma

---

## Verificación de Código

| Archivo                         | ¿Existe? | Notas                               |
| ------------------------------- | -------- | ----------------------------------- |
| `apps/api/prisma/schema.prisma` | ✅       | Schema principal presente           |
| `apps/api/prisma/migrations/`   | ✅       | Historial de migraciones versionado |
| `apps/api/prisma/README.md`     | ✅       | Documentación de comandos Prisma    |
| `apps/api/package.json`         | ✅       | Scripts Prisma configurados         |
| `apps/api/prisma/seed.ts`       | ✅       | Entry point de seed presente        |

**Evidencia de implementación:**

| Área              | Evidencia                                                                                    | Estado |
| ----------------- | -------------------------------------------------------------------------------------------- | ------ |
| Prisma instalado  | `prisma` y `@prisma/client` en dependencias                                                  | ✅     |
| Schema base       | `schema.prisma` con `generator client` y `datasource db`                                     | ✅     |
| Modelos iniciales | `model Usuario` y `model Perfil` presentes                                                   | ✅     |
| Migraciones       | Carpeta `prisma/migrations/` con SQL versionado                                              | ✅     |
| Prisma Client     | Script `prisma:generate` configurado y CLI detecta `@prisma/client`                          | ✅     |
| Scripts           | `prisma:migrate`, `prisma:migrate:deploy`, `prisma:generate`, `prisma:studio`, `prisma:seed` | ✅     |
| Documentación     | README específico de Prisma con comandos y troubleshooting                                   | ✅     |

---

## Tests

**Comandos ejecutados:**

```bash
cd apps/api && npx prisma validate
cd apps/api && npx prisma --version
```

**Resultados:**

- `prisma validate`: OK
- Prisma CLI y Prisma Client detectados correctamente (`6.19.1`)

**Cobertura:**

| Métrica    | Valor | Estado |
| ---------- | ----- | ------ |
| Statements | N/A   | N/A    |
| Branches   | N/A   | N/A    |
| Functions  | N/A   | N/A    |
| Lines      | N/A   | N/A    |

Nota: este issue audita configuración ORM y migraciones, no cobertura de tests unitarios.

---

## Pruebas en Producción

**Ambiente:** No aplica.

El issue configura ORM y workflow de base de datos, no endpoints verificables por smoke test HTTP.

| Verificación      | Esperado | Resultado                         | Estado |
| ----------------- | -------- | --------------------------------- | ------ |
| Smoke test de API | N/A      | No aplica para este tipo de issue | N/A    |

---

## Criterios de Aceptación

| #   | Criterio                                        | Verificación                                                            | Estado |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| 1   | Instalar Prisma y Prisma Client                 | Dependencias presentes y `npx prisma --version` resuelve ambos paquetes | ✅     |
| 2   | Inicializar Prisma (`prisma init`)              | Estructura `apps/api/prisma/` presente con schema, README y migraciones | ✅     |
| 3   | Crear `schema.prisma` base                      | Archivo presente y válido                                               | ✅     |
| 4   | Definir modelos iniciales (`Usuario`, `Perfil`) | Modelos `Usuario` y `Perfil` definidos en el schema                     | ✅     |
| 5   | Generar primera migración                       | Existen migraciones versionadas en `apps/api/prisma/migrations/`        | ✅     |
| 6   | Generar Prisma Client                           | Script `prisma:generate` configurado; Prisma Client instalado           | ✅     |
| 7   | Configurar scripts en `package.json`            | Scripts Prisma presentes en `apps/api/package.json`                     | ✅     |
| 8   | Documentar comandos Prisma                      | `apps/api/prisma/README.md` documenta comandos y flujo básico           | ✅     |

---

## Hallazgos

### README de Prisma parcialmente desactualizado

[apps/api/prisma/README.md](/home/ignacio/amauta/apps/api/prisma/README.md) todavía describe el flujo como si la “primera migración” estuviera pendiente o fuera el próximo paso principal, cuando el repositorio ya tiene varias migraciones versionadas. Además conserva referencias a `db push` como comando normal de desarrollo, aunque la política vigente del proyecto hoy exige migraciones versionadas como flujo estándar.

---

## Observaciones

El issue está claramente cumplido y además el estado actual del schema supera el alcance original, porque ya no se limita a `Usuario` y `Perfil`: hoy modela múltiples módulos académicos y administrativos. La única observación es mantener la documentación alineada al flujo Prisma actual del repo.

---

## Evidencia

```text
$ gh issue view 9 --json number,title,body,state,labels,closedAt
state: CLOSED
title: T-013: Configurar Prisma
closedAt: 2025-12-18T17:54:40Z

$ cd apps/api && npx prisma validate
The schema at prisma/schema.prisma is valid

$ cd apps/api && npx prisma --version
prisma         : 6.19.1
@prisma/client : 6.19.1

$ find apps/api/prisma/migrations -maxdepth 2 -type f | head
.../20260317000100_baseline_prod_schema/migration.sql
.../20260317232417_evaluaciones_base/migration.sql
...
```
