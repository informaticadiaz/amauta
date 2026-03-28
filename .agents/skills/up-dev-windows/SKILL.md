---
name: up-dev-windows
description: Levanta un entorno de desarrollo en Windows con el menor nivel de friccion posible. Usar cuando haya que arrancar frontend/backend local, sincronizar dependencias, validar archivos .env.local, detectar desalineacion entre package.json y node_modules, verificar healthchecks y diagnosticar errores como ECONNREFUSED o variables faltantes.
---

# Up Dev Windows

## Overview

Esta skill estandariza el arranque local en Windows para proyectos con frontend y backend separados, especialmente monorepos con workspaces.

Su objetivo es evitar errores tipicos de entorno:

- dependencias instaladas desalineadas con el repo
- variables cargadas desde el archivo incorrecto
- backend caido mientras el frontend intenta autenticarse
- artefactos generados o lockfiles cambiados por ejecutar tooling local

## Script incluido

La skill incluye un script PowerShell listo para usar:

- `scripts/up-dev-windows.ps1`

Usarlo cuando el proyecto siga un esquema similar al de esta skill: frontend y backend separados, `npm`, workspaces y `.env.local`.

Para mejoras pendientes y segunda iteración, ver:

- `references/future-review.md`

## Core Capabilities

1. Sincronizar dependencias antes de arrancar.
2. Verificar que los `.env.local` existan y contengan las claves minimas.
3. Levantar backend con ruta de env explicita en Windows.
4. Levantar frontend solo despues de confirmar que el backend responde.
5. Validar URLs/healthchecks antes de probar login o flujos de negocio.
6. Diferenciar errores de credenciales versus errores de infraestructura local.
7. Recomendar limpieza de artefactos locales no persistibles.

## Workflow

### 1. Sincronizacion inicial

- Verificar que `package.json` y `node_modules` no esten desalineados.
- Si el repo cambio dependencias o scripts desde la ultima sesion, correr:

```powershell
npm install
```

- Si aparece un warning de scripts no portables en Windows, tratarlo como ruido de DX salvo que el install falle.

### 2. Verificacion de env locales

- Confirmar que existan los archivos locales requeridos:
  - `apps/web/.env.local`
  - `apps/api/.env.local`
- Confirmar que el frontend tenga al menos:
  - `API_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXTAUTH_URL`
  - `AUTH_SECRET`
- Confirmar que el backend tenga al menos:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `AUTH_SECRET` (si el frontend firma tokens o comparte auth con backend)

- Si frontend y backend comparten auth, exigir que `AUTH_SECRET` sea el mismo en ambos.

### 3. Arranque seguro del backend en Windows

- No asumir que `dotenv/config` va a leer `.env.local`.
- En Windows, preferir `DOTENV_CONFIG_PATH` explicito.
- Si el comando se ejecuta via workspace, usar ruta absoluta o relativa al cwd real del workspace.

Comando recomendado:

```powershell
$env:DOTENV_CONFIG_PATH="C:\ruta\al\repo\apps\api\.env.local"
npm run start:dev --workspace=@tu-scope/api
```

- Si el proyecto no usa scopes, adaptar el workspace o correr el script desde la carpeta del backend.
- No pasar al frontend hasta verificar que el backend levanto.

El script incluido ya resuelve esto levantando el backend con `DOTENV_CONFIG_PATH` absoluto.

### 4. Healthcheck del backend

- Verificar endpoint de salud antes de intentar login o requests del frontend:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3001/health
```

- Si responde conexion rechazada:
  - el backend no esta arriba
  - no diagnosticar credenciales todavia
- Si falla por variables faltantes:
  - revisar `DOTENV_CONFIG_PATH`
  - revisar contenido real de `.env.local`

### 5. Arranque del frontend

- Una vez confirmado el backend, levantar frontend:

```powershell
npm run dev --workspace=@tu-scope/web
```

- Verificar:
  - URL local mostrada por el servidor
  - version esperada del framework
  - entorno cargado (`.env.local`)

El script incluido abre backend y frontend en procesos separados y espera healthcheck del backend antes de continuar.

### 6. Diagnostico de login y flujos autenticados

- Si el frontend muestra `ECONNREFUSED` al hacer login:
  - tratarlo como fallo de backend o de conectividad local, no de credenciales
- Si el login responde pero rutas autenticadas fallan:
  - verificar `AUTH_SECRET` compartido
  - verificar que backend y frontend esten usando la misma URL base

### 7. Higiene del working tree

- Si levantar tooling modifica archivos generados o lockfiles:
  - revisar si son artefactos locales
  - no commitear automaticamente:
    - `next-env.d.ts`
    - `package-lock.json`
    - archivos generados por dev server
- Solo persistir cambios si representan una decision deliberada del repo.

## Guardrails

- No asumir que un error de login es problema de contraseña sin verificar backend.
- No persistir workarounds locales que contradigan decisiones arquitectonicas ya aceptadas.
- No comitear archivos `.env.local`.
- No modificar scripts del repo solo para resolver una sesion local sin explicitar la decision.
- En Windows, preferir rutas absolutas cuando haya dudas con cwd y workspaces.

## Fast Path

Checklist minima:

1. `npm install`
2. validar `apps/web/.env.local`
3. validar `apps/api/.env.local`
4. levantar backend con `DOTENV_CONFIG_PATH` explicito
5. probar `/health`
6. levantar frontend
7. probar login

Comando sugerido:

```powershell
powershell -ExecutionPolicy Bypass -File ".agents/skills/up-dev-windows/scripts/up-dev-windows.ps1"
```

## Output esperado

Cuando esta skill se use, devolver:

- estado de dependencias
- estado de env local
- comando exacto para backend
- comando exacto para frontend
- resultado de healthcheck
- siguiente accion si algo falla
