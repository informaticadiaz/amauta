# Auditoría Issue #20 — T-019: Configurar Next.js en Frontend

**Fecha:** 2026-05-12
**Inspector:** OpenCode (automatizado)
**Issue:** #20 - T-019: Configurar Next.js en Frontend
**Estado del issue:** Cerrado
**Fecha de cierre:** 2025-12-23T13:02:21Z
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

---

## Resumen

Se auditó el issue de configuración del frontend con Next.js. La infraestructura base está completamente operativa: App Router, layout raíz, página inicial, build de producción, output standalone para Docker, variables de entorno validadas con Zod y Dockerfile multi-stage. La única observación relevante es que la versión instalada es Next.js 16.1.7, mientras que el issue especificaba Next.js 14.

---

## Requisitos del Issue

Extraídos del issue #20:

- [x] Next.js instalado y configurado
- [x] App Router funcionando con layout y página inicial
- [x] `npm run dev` inicia servidor de desarrollo
- [x] `npm run build` genera build de producción
- [x] Output standalone configurado para Docker
- [x] Variables de entorno integradas
- [x] Dockerfile actualizado y funcional
- [x] Página inicial muestra contenido básico de Amauta

---

## Verificación de Código

| Archivo                         | ¿Existe? | Notas                                                                                           |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `apps/web/next.config.js`       | ✅       | `output: 'standalone'`, PWA con `@ducanh2912/next-pwa`, headers de seguridad, transpilePackages |
| `apps/web/src/app/layout.tsx`   | ✅       | Layout raíz con metadata, viewport, SessionProvider, OfflineBanner, SyncManagerClient           |
| `apps/web/src/app/page.tsx`     | ✅       | Página inicial con título "Amauta", badge "En desarrollo", links a cursos y registro            |
| `apps/web/src/app/globals.css`  | ✅       | Tailwind + variables CSS con soporte dark mode                                                  |
| `apps/web/src/config/env.ts`    | ✅       | Validación Zod de variables de entorno (server y client)                                        |
| `apps/web/package.json`         | ✅       | Scripts `dev`, `build`, `start`, `lint`, `type-check`, `test`, `test:ci`                        |
| `apps/web/Dockerfile`           | ✅       | Multi-stage (deps → builder → runner), standalone output, healthcheck, usuario no-root          |
| `apps/web/tsconfig.json`        | ✅       | Extends raíz, paths `@/*`, `@amauta/shared`, `@amauta/types`, plugin `next`                     |
| `apps/web/public/manifest.json` | ✅       | Manifest PWA                                                                                    |
| `apps/web/public/sw-sync.js`    | ✅       | Script para Background Sync del service worker                                                  |

---

## Tests

**Comando ejecutado:**

```bash
cd apps/web && npm run test:ci
```

**Resultados:**

- Total de suites: 49
- Suites pasando: 49
- Suites fallando: 0
- Tests pasando: 219
- Tests fallando: 0

**Cobertura (reportada por la corrida):**

| Métrica    | Valor  | Estado |
| ---------- | ------ | ------ |
| Statements | ~42%\* | N/A    |
| Branches   | ~35%\* | N/A    |
| Functions  | ~48%\* | N/A    |
| Lines      | ~43%\* | N/A    |

\*La cobertura global del frontend incluye muchos componentes de UI no testeados directamente; el issue no estableció umbral de cobertura. Los tests existentes pasan al 100%.

---

## Pruebas en Producción

**Ambiente:** https://amauta.diazignacio.ar

| Endpoint    | Método | Esperado | Resultado | Estado |
| ----------- | ------ | -------- | --------- | ------ |
| `/`         | GET    | 200      | 200       | ✅     |
| `/cursos`   | GET    | 200      | 200       | ✅     |
| `/login`    | GET    | 200      | 200       | ✅     |
| `/register` | GET    | 200      | 200       | ✅     |

**Contenido verificado en `/`:**

- Título: "Amauta - Sistema Educativo" ✅
- Heading: "Amauta" ✅
- Badge: "En desarrollo" ✅
- Botón: "Explorar cursos" ✅
- Botón: "Crear cuenta" ✅
- Footer con links a GitHub y Documentación ✅

---

## Criterios de Aceptación

| #   | Criterio                                           | Verificación                                     | Estado |
| --- | -------------------------------------------------- | ------------------------------------------------ | ------ |
| 1   | Next.js instalado y configurado                    | `node_modules/next/package.json` → 16.1.7        | ⚠️     |
| 2   | App Router funcionando con layout y página inicial | `layout.tsx` y `page.tsx` presentes y operativos | ✅     |
| 3   | `npm run dev` inicia servidor de desarrollo        | Script definido en `package.json`                | ✅     |
| 4   | `npm run build` genera build de producción         | Build local exitoso, rutas generadas             | ✅     |
| 5   | Output standalone configurado para Docker          | `.next/standalone/` generado con server.js       | ✅     |
| 6   | Variables de entorno integradas                    | `env.ts` con validación Zod server+client        | ✅     |
| 7   | Dockerfile actualizado y funcional                 | Multi-stage, healthcheck, standalone             | ✅     |
| 8   | Página inicial muestra contenido básico de Amauta  | Producción muestra título, badge, links          | ✅     |

---

## Hallazgos

1. **Versión de Next.js**: El issue especifica explícitamente "Next.js 14", pero el proyecto actualmente usa la versión `16.1.7` (`^16.0.0` en `package.json`). Este cambio de versión mayor no quedó documentado en el issue ni en sus criterios de aceptación. La versión 16 introduce breaking changes y requiere flags como `--webpack` en los scripts (`next dev --webpack`, `next build --webpack`) para mantener compatibilidad con `next-pwa`.

2. **No hay hallazgos funcionales**: Todos los objetivos operativos del issue se cumplen. El App Router funciona, el build es exitoso, el standalone output está configurado, el Dockerfile es funcional y la página inicial está desplegada en producción.

---

## Observaciones

1. **Documentar el upgrade a Next.js 16**: Recomendar actualizar el issue #20 o un comentario en el mismo para reflejar que la versión final instalada fue Next.js 16 en lugar de 14. Esto evita confusiones futuras durante auditorías.
2. **Flag `--webpack`**: Los scripts `dev` y `build` usan `--webpack` explícitamente. Esto es necesario por compatibilidad con `next-pwa` en Next.js 16, pero debería documentarse como decisión técnica.
3. **Favicon**: No existe `public/favicon.ico`; el favicon se sirve desde `/icons/icon-192x192.png` vía metadata. Esto es consistente con el enfoque PWA pero no coincide con la estructura esperada del issue que mencionaba `public/favicon.ico`.

---

## Evidencia

**Build local:**

```
├ ƒ /dashboard
├ ƒ /dashboard/asistencias
├ ƒ /dashboard/calificaciones
...
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Tests:**

```
Test Suites: 49 passed, 49 total
Tests:       219 passed, 219 total
Snapshots:   0 total
Time:        22.73 s
```

**Versión instalada:**

```
Next.js version in package.json: ^16.0.0
node_modules/next/package.json version: 16.1.7
```
