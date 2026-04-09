# Auditoría Issue #15 — T-014: Crear seed data

**Fecha:** 2026-04-09
**Inspector:** Codex (automatizado)
**Issue:** #15 - T-014: Crear seed data
**Estado del issue:** Cerrado
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó el issue que debía dejar operativo el seed de Prisma con datos de prueba para desarrollo y testing. El repositorio sí incluye `prisma/seed.ts`, orquestador, cinco etapas implementadas, usuarios de prueba con distintos roles, categorías base, script ejecutable y documentación; sin embargo, falta la configuración `prisma.seed` en `apps/api/package.json` y parte de la documentación de Prisma quedó desactualizada.

---

## Requisitos del Issue

Extraídos del issue #15:

- [x] Crear prisma/seed.ts
- [x] Agregar usuarios de prueba (roles diferentes)
- [x] Agregar categorías base
- [x] Agregar script de seed a package.json
- [x] Documentar cómo usar seed
- [ ] Configurar seed en package.json

---

## Verificación de Código

| Archivo                                   | ¿Existe? | Notas                                                                                      |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `apps/api/prisma/seed.ts`                 | ✅       | Entry point presente, usa `PrismaClient` y ejecuta `runAllSeeds`                           |
| `apps/api/prisma/seeds/index.ts`          | ✅       | Orquesta 5 etapas en orden correcto                                                        |
| `apps/api/prisma/seeds/usuarios.ts`       | ✅       | Crea usuarios de prueba con roles `SUPER_ADMIN`, `ADMIN_ESCUELA`, `EDUCADOR`, `ESTUDIANTE` |
| `apps/api/prisma/seeds/categorias.ts`     | ✅       | Incluye categorías base                                                                    |
| `apps/api/prisma/seeds/instituciones.ts`  | ✅       | Incluye instituciones y grupos                                                             |
| `apps/api/prisma/seeds/cursos.ts`         | ✅       | Incluye cursos, lecciones y recursos                                                       |
| `apps/api/prisma/seeds/inscripciones.ts`  | ✅       | Incluye inscripciones y progreso                                                           |
| `apps/api/prisma/seeds/administrativo.ts` | ✅       | Incluye asistencias, calificaciones y comunicados                                          |
| `apps/api/package.json`                   | ✅       | Tiene script `prisma:seed`, pero no clave `prisma.seed`                                    |
| `apps/api/prisma/README.md`               | ✅       | Documenta uso del seed, pero conserva secciones desactualizadas                            |

---

## Validaciones Ejecutadas

**Comandos ejecutados:**

```bash
npm run type-check --workspace=@amauta/api
node -e "const p=require('./apps/api/package.json'); console.log(p.scripts['prisma:seed']); console.log(p.prisma?.seed ?? null)"
```

**Resultados:**

- `type-check` del workspace `@amauta/api` pasó sin errores
- `apps/api/package.json` expone el script `prisma:seed = tsx prisma/seed.ts`
- `apps/api/package.json` no define `prisma.seed`

No se ejecutó `npm run prisma:seed` porque, según las reglas operativas del proyecto, el entorno apunta a base de datos de producción y el seed modificaría datos reales.

---

## Pruebas en Producción

No concluyentes en esta sesión. Se intentó verificar la API en `https://amauta-api.diazignacio.ar`, pero el entorno no pudo resolver el host (`curl` devolvió código `000` / exit code `6`), así que no hubo smoke tests remotos confiables.

---

## Criterios de Aceptación

| #   | Criterio                                      | Verificación                                                          | Estado |
| --- | --------------------------------------------- | --------------------------------------------------------------------- | ------ |
| 1   | Crear prisma/seed.ts                          | `apps/api/prisma/seed.ts` existe y ejecuta el orquestador             | ✅     |
| 2   | Agregar usuarios de prueba (roles diferentes) | `usuarios.ts` define 10 usuarios con cuatro roles distintos           | ✅     |
| 3   | Agregar categorías base                       | `categorias.ts` define ocho categorías base                           | ✅     |
| 4   | Agregar script de seed a package.json         | `apps/api/package.json` incluye `prisma:seed`                         | ✅     |
| 5   | Documentar cómo usar seed                     | `apps/api/prisma/README.md` documenta ejecución y estructura del seed | ✅     |
| 6   | Configurar seed en package.json               | No existe clave `prisma.seed` en `apps/api/package.json`              | ❌     |

---

## Hallazgos

1. El seed está materialmente implementado y cubre más alcance que el issue original: cinco etapas completas en lugar de solo usuarios/categorías.
2. Falta la configuración `prisma.seed` en `apps/api/package.json`, por lo que el criterio explícito "Configurar seed en package.json" no está completamente satisfecho.
3. [apps/api/prisma/README.md](/home/ignacio/amauta/apps/api/prisma/README.md) quedó desalineado en varias secciones: todavía dice `seed.ts` "pendiente T-014" y marca etapas 2-5 como pendientes pese a estar implementadas.
4. No hubo ejecución del seed contra la base real por seguridad operacional, lo cual es correcto dado que la DB del proyecto está en producción.

---

## Evidencia

```text
apps/api/prisma/seed.ts
- Entry point presente
- Ejecuta runAllSeeds(prisma)

apps/api/prisma/seeds/index.ts
- Etapa 1: usuarios
- Etapa 2: categorías e instituciones
- Etapa 3: cursos
- Etapa 4: inscripciones
- Etapa 5: administrativo

apps/api/package.json
- scripts.prisma:seed = "tsx prisma/seed.ts"
- prisma.seed = null

apps/api/prisma/README.md
- Documenta "npm run prisma:seed"
- Mantiene referencias "pendiente T-014" y etapas pendientes desactualizadas

Validación local
- npm run type-check --workspace=@amauta/api => exit code 0

Validación remota
- curl a amauta-api.diazignacio.ar => código 000 / exit code 6 en este entorno
```
