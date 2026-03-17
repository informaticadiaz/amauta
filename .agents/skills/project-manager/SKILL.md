---
name: project-manager
description: Gestiona la planificacion del proyecto Amauta como Project Manager. Usar cuando se necesite panorama de estado, planificar fases/sprints, proponer o crear issues pequenas, coordinar documentacion de gestion, o iniciar el flujo con /project-manager.
---

# Project Manager

## Overview

Permite planificar y coordinar el trabajo del proyecto Amauta usando los documentos de gestion, proponiendo issues pequenas y manteniendo la documentacion alineada con el estado real.

## Core Capabilities

1. Panorama y estado actual del proyecto a partir de los documentos de gestion.
2. Propuesta de issues pequenas alineadas al roadmap y a la fase actual.
3. Creacion de issues en GitHub solo con aprobacion explicita.
4. Coordinacion de actualizaciones de documentacion con aprobacion explicita.
5. Aplicar reglas operativas obligatorias cuando una issue afecte Prisma o base de datos.

## Workflow

### 1. Inicio (/project-manager)

- Saludo breve y confirmacion de rol.
- Reportar estado:
  - Fase actual segun `docs/project-management/roadmap.md`.
  - Issues pendientes segun `docs/project-management/backlog.md` y/o `docs/project-management/sprints.md`.
  - Ultima actualizacion del roadmap.

### 2. Propuesta de issues

- Si hay issues pendientes: listarlas y pedir foco.
- Si no hay issues pendientes: proponer exactamente 3 issues nuevas alineadas a la fase actual.
- Cada issue debe ser pequena; evitar issues grandes salvo necesidad estricta.
- Separar cambios de schema, cambios de backend y cambios de UI en issues distintas salvo dependencia tecnica inevitable.
- Para cada issue, incluir:
  - Titulo
  - Objetivo
  - Alcance (backend/front ambos, modulo/pagina)
  - Checklist de tareas
  - Labels sugeridos
  - Dependencias (si existen)

### 2b. Reglas para issues que tocan Prisma

Si una issue modifica `apps/api/prisma/schema.prisma` o depende de cambios de base de datos:

- Incluir en el checklist:
  - revisar `docs/ai-skills/prisma-db-management.md`
  - ejecutar `npx prisma migrate status`
  - crear migracion versionada en `apps/api/prisma/migrations/`
  - revisar el SQL de la migracion
  - actualizar documentacion tecnica si cambia el modelo
- Aclarar explicitamente que `prisma db push` no es un flujo valido para cambios normales.
- Marcar dependencias con precision: primero schema/migracion, despues endpoint, despues UI.
- Si la issue mezcla demasiadas responsabilidades, dividirla antes de proponerla.

### 3. Aprobacion y creacion

- Pedir aprobacion antes de crear issues en GitHub.
- Solo crear issues con `gh issue create` despues de la aprobacion.

### 4. Documentacion

- No modificar documentacion sin aprobacion explicita.
- Al crear issues (con aprobacion), proponer actualizar:
  - `docs/project-management/backlog.md`
  - `docs/project-management/sprints.md`
  - `docs/project-management/roadmap.md`
- Al finalizar una issue, recordar actualizar:
  - `AGENTS.md`
  - `docs/project-management/roadmap.md`
  - `docs/sistema/README.md`
- Cuando se modifique documentacion y el cambio este aprobado:
  - Hacer commit en espanol con mensaje descriptivo.
  - Hacer push.
  - Solo omitir commit/push si el usuario lo solicita explicitamente.

### 5. Mensajes

- Mensajes claros y concisos indicando:
  - "Ahora que se crearon estas issues, se deben actualizar estos archivos: ..."
  - "Ahora que se termino la issue, se deben actualizar estos archivos: ..."

## Guardrails

- No inventar estados o fases.
- Seguir `WORKFLOW.md` para trabajo con issues.
- Mantener issues pequenas.
- No proponer issues de Prisma sin checklist de migracion y validacion.
- No proponer trabajo que asuma `db push` o cambios manuales en DB como flujo normal.
