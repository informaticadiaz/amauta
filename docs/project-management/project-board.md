# Project Board - Amauta

**Última actualización**: 2024-12-23
**Sprint actual**: Sprint 0 - Fundamentos (89% Completado)

## 🟢 Estado de Producción

| Servicio    | URL                               |
| ----------- | --------------------------------- |
| Frontend    | https://amauta.diazignacio.ar     |
| Backend API | https://amauta-api.diazignacio.ar |

## Vista del Board (Kanban)

> **Nota**: Este tablero es una referencia visual. Para estado en tiempo real usar:
>
> ```bash
> gh issue list --limit 50
> ```

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│    📋 BACKLOG    │    🎯 READY      │  🚧 IN PROGRESS  │   👀 REVIEW      │    ✅ DONE       │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│                  │                  │                  │                  │                  │
│ FASE 0 (2 pend)  │ T-014 (3pts)     │                  │                  │ ✅ T-001 (1pt)   │
│ ────────         │ Seed data #15    │                  │                  │ .gitignore       │
│ T-015 (3pts)     │                  │                  │                  │                  │
│ Diagramas #16    │ T-014b (3pts)    │                  │                  │ ✅ T-002 (1pt)   │
│                  │ Expandir CI #10  │                  │                  │ Licencia AGPL    │
│ T-016 (2pts)     │                  │                  │                  │                  │
│ API docs #17     │                  │                  │                  │ ✅ T-003 (2pts)  │
│                  │                  │                  │                  │ Code of Conduct  │
│ TRANSVERSAL      │                  │                  │                  │                  │
│ ────────         │                  │                  │                  │ ✅ T-004 (3pts)  │
│ NAP (20pts) #21  │                  │                  │                  │ Contributing     │
│ 🔄 #22 4/21 PDFs │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-005 (5pts)  │
│ FASE 1           │                  │                  │                  │ GitHub Actions   │
│ ────────         │                  │                  │                  │                  │
│ US-001 (5pts)    │                  │                  │                  │ ✅ T-006 (3pts)  │
│ Registro         │                  │                  │                  │ Tests en CI      │
│                  │                  │                  │                  │                  │
│ US-002 (3pts)    │                  │                  │                  │ ✅ T-007 (3pts)  │
│ Login            │                  │                  │                  │ Pre-commit hooks │
│                  │                  │                  │                  │                  │
│ US-003 (5pts)    │                  │                  │                  │ ✅ T-008 (5pts)  │
│ Recuperar pass   │                  │                  │                  │ Monorepo setup   │
│                  │                  │                  │                  │                  │
│ ... más items    │                  │                  │                  │ ✅ T-009 (3pts)  │
│                  │                  │                  │                  │ TypeScript       │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-010 (3pts)  │
│                  │                  │                  │                  │ ESLint/Prettier  │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-011 (2pts)  │
│                  │                  │                  │                  │ Env vars         │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-012 (3pts)  │
│                  │                  │                  │                  │ PostgreSQL+Redis │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-013 (5pts)  │
│                  │                  │                  │                  │ Prisma ORM       │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-017 (8pts)  │
│                  │                  │                  │                  │ Deployment Prod  │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-018 (5pts)  │
│                  │                  │                  │                  │ NestJS+Fastify   │
│                  │                  │                  │                  │                  │
│                  │                  │                  │                  │ ✅ T-019 (5pts)  │
│                  │                  │                  │                  │ Next.js Frontend │
│                  │                  │                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┘

Total Sprint 0: 63 puntos | Completado: 57 puntos (90%)
Done: 16 items | Ready: 2 items | Backlog: 35+ items (Fase 1+) | Transversal: NAP #21/#22 (20pts, 4/21 analizados)
```

---

## Sprint 0 - Fundamentos (89% Completado)

### Objetivo del Sprint

Establecer la infraestructura base del proyecto y deployment en producción.

### Estado Actual

- **Desarrolladores**: Claude Code
- **Puntos comprometidos**: 63 puntos
- **Puntos completados**: 57 puntos (90%)
- **Fechas**: 01/12/2024 - 31/12/2024
- **Deployment**: ✅ EN PRODUCCIÓN

---

## Columnas del Board

### 📋 BACKLOG

Items identificados pero no priorizados para sprints futuros.

**Items en Backlog (Fase 0 - Could Have):**

- [ ] T-015: Crear diagramas de arquitectura (3pts)
- [ ] T-016: Documentar API endpoints (2pts)
- [ ] DT-002: Monitoreo de errores (3pts)

**Items en Backlog (Fase 1):**

- [ ] US-001: Como usuario puedo registrarme (5pts)
- [ ] US-002: Como usuario puedo hacer login (3pts)
- [ ] US-003: Como usuario puedo recuperar contraseña (5pts)
- [ ] US-004: Como usuario puedo ver/editar perfil (5pts)
- [ ] ... (ver backlog.md para lista completa)

**Total en Backlog**: 40+ items

---

### 🎯 READY (Sprint 0)

Items listos para ser tomados. Cumplen Definition of Ready.

**Items Ready:**

#### T-014: Crear seed data

- **Estimación**: 3 puntos
- **Prioridad**: Should Have
- **Asignado**: Sin asignar
- **Criterios**: Datos de prueba, script de seed, documentación

#### T-014b: Expandir CI con lint, type-check y build

- **Estimación**: 3 puntos
- **Prioridad**: Should Have
- **Asignado**: Sin asignar
- **Criterios**: Agregar jobs al workflow, optimizar caché

**Total Ready**: 6 puntos

---

### 🚧 IN PROGRESS

Items en desarrollo activo.

**Regla**: Máximo 2 items por desarrollador simultáneamente.

**Items en progreso:**

- Ninguno actualmente (Sprint no iniciado)

---

### 👀 REVIEW

Items con Pull Request abierto esperando code review.

**Items en review:**

- Ninguno actualmente

**Proceso de Review:**

1. PR creado y vinculado a issue
2. CI checks pasando
3. Al menos 1 aprobación requerida
4. Sin cambios solicitados pendientes
5. Conflictos resueltos

---

### ✅ DONE

Items completados que cumplen Definition of Done.

**Items completados Sprint 0:**

| ID    | Tarea                           | Puntos | Fecha      |
| ----- | ------------------------------- | ------ | ---------- |
| T-001 | Configurar .gitignore           | 1      | 01/12/2024 |
| T-002 | Definir licencia AGPL-3.0       | 1      | 01/12/2024 |
| T-003 | Crear Code of Conduct           | 2      | 02/12/2024 |
| T-004 | Crear Contributing Guidelines   | 3      | 02/12/2024 |
| T-005 | Configurar GitHub Actions CI    | 5      | 03/12/2024 |
| T-006 | Configurar tests en CI          | 3      | 03/12/2024 |
| T-007 | Configurar pre-commit hooks     | 3      | 04/12/2024 |
| T-008 | Inicializar monorepo Turborepo  | 5      | 05/12/2024 |
| T-009 | Configurar TypeScript strict    | 3      | 06/12/2024 |
| T-010 | Configurar ESLint y Prettier    | 3      | 06/12/2024 |
| T-011 | Configurar variables entorno    | 2      | 07/12/2024 |
| T-012 | Configurar PostgreSQL + Redis   | 3      | 08/12/2024 |
| T-013 | Configurar Prisma ORM           | 5      | 10/12/2024 |
| T-018 | Servidor HTTP NestJS + Fastify  | 5      | 18/12/2024 |
| T-019 | Configurar Next.js Frontend     | 5      | 20/12/2024 |
| T-017 | Deployment producción (Dokploy) | 8      | 23/12/2024 |

**Hitos adicionales:**

- ✅ Repositorio en GitHub: https://github.com/informaticadiaz/amauta
- ✅ Documentación técnica base completa
- ✅ Documentación de gestión creada
- ✅ README.md y CLAUDE.md completos
- ✅ **EN PRODUCCIÓN**: Frontend y Backend desplegados

**Total Done**: 16 tareas (57 puntos)

---

## Definition of Ready (DoR)

Un item está listo para "Ready" si:

- [ ] Tiene criterios de aceptación claros y testeables
- [ ] Tiene estimación (story points)
- [ ] Dependencias identificadas y resueltas/documentadas
- [ ] Tamaño <= 8 puntos (dividir si es mayor)
- [ ] Diseño/mockup adjunto (si aplica a UI)
- [ ] Product Owner disponible para aclaraciones
- [ ] Equipo entiende qué hay que hacer

---

## Definition of Done (DoD)

Un item está "Done" cuando:

- [ ] Código escrito y funcional
- [ ] Tests unitarios escritos (>80% coverage)
- [ ] Tests de integración si aplica
- [ ] Code review aprobado (mínimo 1 aprobación)
- [ ] CI checks pasando (lint, types, tests, build)
- [ ] Documentación técnica actualizada
- [ ] Sin deuda técnica crítica introducida
- [ ] Merged a rama principal (main/develop)
- [ ] Deployado a ambiente de staging
- [ ] Aceptado por Product Owner

---

## Workflow de Estados

```
📋 BACKLOG
    │
    ├─> Sprint Planning
    │
    ▼
🎯 READY
    │
    ├─> Desarrollador toma tarea
    │
    ▼
🚧 IN PROGRESS
    │
    ├─> Crear Pull Request
    │
    ▼
👀 REVIEW
    │
    ├─> Aprobado y mergeado
    │
    ▼
✅ DONE
```

**Nota**: Desde cualquier estado se puede pasar a ❌ BLOCKED si hay impedimentos.

---

## Métricas del Board

### Velocidad

- **Sprint 0**: 57 puntos (en progreso)
- **Promedio**: 57 puntos/sprint

### Cycle Time

- **Promedio**: ~1-2 días por item
- **Objetivo**: < 3 días por item ✅

### Lead Time

- **Promedio**: ~3 días
- **Objetivo**: < 1 semana ✅

### WIP (Work In Progress)

- **Actual**: 0 items
- **Límite**: 2 items por persona
- **Total equipo**: 1 (Claude Code)

---

## Etiquetas (Labels)

### Por Tipo

- `feature` - Nueva funcionalidad
- `bug` - Algo roto
- `enhancement` - Mejora
- `tech-debt` - Deuda técnica
- `docs` - Documentación

### Por Área

- `frontend` - UI/UX
- `backend` - API/lógica
- `database` - BD
- `infrastructure` - DevOps
- `testing` - Tests

### Por Prioridad

- `p0-critical` - Urgente
- `p1-high` - Alta
- `p2-medium` - Media
- `p3-low` - Baja

### Por Fase

- `phase-0` - Fundamentos
- `phase-1` - MVP
- `phase-2` - Offline/PWA
- `mvp` - Parte del MVP

### Especiales

- `good-first-issue` - Para nuevos
- `help-wanted` - Colaboración
- `blocked` - Bloqueado

---

## Uso con GitHub Projects

### Configuración recomendada

1. **Crear GitHub Project** (Beta) vinculado al repo
2. **Columnas**:
   - Backlog
   - Ready
   - In Progress
   - Review
   - Done

3. **Vistas**:
   - **Board**: Vista Kanban
   - **Table**: Lista detallada
   - **Roadmap**: Timeline por fases

4. **Automatizaciones**:
   - Issue abierto → Backlog
   - Issue asignado → In Progress
   - PR creado → Review
   - PR mergeado → Done

5. **Filtros**:
   - Por sprint
   - Por fase
   - Por prioridad
   - Por asignado

---

## Próximos Pasos

### Para completar Sprint 0

1. [x] ~~Deployment en producción~~ ✅
2. [ ] T-014: Crear seed data para testing
3. [ ] T-014b: Expandir CI con más validaciones

### Para Sprint 1 (Enero 2025)

1. [ ] Refinar items de Fase 1
2. [ ] Mover US-001 a US-005 a Ready
3. [ ] Sprint Planning para definir scope
4. [ ] Implementar autenticación de usuarios
5. [ ] Actualizar board con nuevos compromisos

---

## Notas

- Actualizar board diariamente
- Comunicar bloqueos inmediatamente
- Respetar límites WIP
- Celebrar cuando items llegan a Done 🎉

**Última actualización**: 23/12/2024
**Responsable**: Product Owner / Scrum Master
