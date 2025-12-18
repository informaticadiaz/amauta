# Project Board - Amauta

**Última actualización**: 2024-12-18
**Sprint actual**: Sprint 0 - Fundamentos

## Vista del Board (Kanban)

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│    📋 BACKLOG    │    🎯 READY      │  🚧 IN PROGRESS  │   👀 REVIEW      │    ✅ DONE       │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│                  │                  │                  │                  │                  │
│ FASE 0           │ SPRINT 0         │                  │                  │ ✅ Repo creado   │
│ ────────         │ ────────         │                  │                  │ ✅ Docs creadas  │
│ T-006 (3pts)     │ T-001 (1pt)      │                  │                  │ ✅ README        │
│ Tests en CI      │ .gitignore       │                  │                  │ ✅ CLAUDE.md     │
│                  │                  │                  │                  │                  │
│ T-003 (2pts)     │ T-002 (1pt)      │                  │                  │                  │
│ Code of Conduct  │ Licencia         │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ T-004 (3pts)     │ T-005 (5pts)     │                  │                  │                  │
│ Contributing     │ GitHub Actions   │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ T-007 (3pts)     │ T-008 (5pts)     │                  │                  │                  │
│ Pre-commit hooks │ Monorepo setup   │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ T-014 (3pts)     │ T-009 (3pts)     │                  │                  │                  │
│ Seed data        │ TypeScript       │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ T-015 (3pts)     │ T-010 (3pts)     │                  │                  │                  │
│ Diagramas        │ ESLint/Prettier  │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ FASE 1           │ T-011 (2pts)     │                  │                  │                  │
│ ────────         │ Env vars         │                  │                  │                  │
│ US-001 (5pts)    │                  │                  │                  │                  │
│ Registro         │ T-012 (3pts)     │                  │                  │                  │
│                  │ PostgreSQL       │                  │                  │                  │
│ US-002 (3pts)    │                  │                  │                  │                  │
│ Login            │ T-013 (5pts)     │                  │                  │                  │
│                  │ Prisma           │                  │                  │                  │
│ US-003 (5pts)    │                  │                  │                  │                  │
│ Recuperar pass   │                  │                  │                  │                  │
│                  │                  │                  │                  │                  │
│ ... más items    │                  │                  │                  │                  │
│                  │                  │                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┘

Total comprometido Sprint 0: 28 puntos
Completado: 4 items documentación
En progreso: 0 items
Ready: 9 items
```

---

## Sprint 0 - Fundamentos

### Objetivo del Sprint
Establecer la infraestructura base del proyecto y el sistema de autenticación funcional.

### Capacidad
- **Desarrolladores**: Por definir
- **Puntos comprometidos**: 28 puntos
- **Fechas**: 18/12/2024 - 31/12/2024

---

## Columnas del Board

### 📋 BACKLOG

Items identificados pero no priorizados para este sprint.

**Items en Backlog (Fase 0):**
- [ ] T-006: Configurar tests en CI (3pts)
- [ ] T-003: Crear Code of Conduct (2pts)
- [ ] T-004: Crear Contributing Guidelines (3pts)
- [ ] T-007: Configurar pre-commit hooks (3pts)
- [ ] T-014: Crear seed data (3pts)
- [ ] T-015: Crear diagramas de arquitectura (3pts)
- [ ] T-016: Documentar API endpoints (2pts)
- [ ] DT-001: Docker desarrollo completo (5pts)
- [ ] DT-002: Monitoreo de errores (3pts)

**Items en Backlog (Fase 1):**
- [ ] US-001: Como usuario puedo registrarme (5pts)
- [ ] US-002: Como usuario puedo hacer login (3pts)
- [ ] US-003: Como usuario puedo recuperar contraseña (5pts)
- [ ] US-004: Como usuario puedo ver/editar perfil (5pts)
- [ ] ... (ver backlog.md para lista completa)

**Total en Backlog**: 50+ items

---

### 🎯 READY (Sprint 0)

Items listos para ser tomados por un desarrollador. Cumplen Definition of Ready.

**Items Ready:**

#### T-001: Configurar .gitignore
- **Estimación**: 1 punto
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: Reglas para Node.js, Next.js, env vars, IDEs

#### T-002: Definir licencia del proyecto
- **Estimación**: 1 punto
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: Investigar opciones, crear LICENSE, actualizar README

#### T-005: Configurar GitHub Actions para CI
- **Estimación**: 5 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: Workflow CI, lint, type check, build, caché

#### T-008: Inicializar estructura de monorepo
- **Estimación**: 5 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: Turborepo, apps/web, apps/api, workspaces

#### T-009: Configurar TypeScript
- **Estimación**: 3 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: tsconfig.json, strict mode, paths, tipos compartidos

#### T-010: Configurar ESLint y Prettier
- **Estimación**: 3 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: ESLint config, Prettier config, scripts, VSCode

#### T-011: Configurar variables de entorno
- **Estimación**: 2 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: .env.example, validación, documentación

#### T-012: Configurar PostgreSQL
- **Estimación**: 3 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: docker-compose, DB creada, conexión verificada

#### T-013: Configurar Prisma
- **Estimación**: 5 puntos
- **Prioridad**: Must Have
- **Asignado**: Sin asignar
- **Criterios**: Schema, modelos base, migración, client generado

**Total Ready**: 28 puntos

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

**Items completados:**

#### ✅ Repositorio creado en GitHub
- **Completado**: 18/12/2024
- **URL**: https://github.com/informaticadiaz/amauta

#### ✅ Documentación técnica base creada
- **Completado**: 18/12/2024
- **Archivos**:
  - docs/technical/architecture.md
  - docs/technical/coding-standards.md
  - docs/technical/database.md
  - docs/technical/setup.md

#### ✅ Documentación de gestión creada
- **Completado**: 18/12/2024
- **Archivos**:
  - docs/project-management/metodologia.md
  - docs/project-management/roadmap.md
  - docs/project-management/sprints.md
  - docs/project-management/tareas.md

#### ✅ README.md completo
- **Completado**: 18/12/2024

#### ✅ CLAUDE.md creado
- **Completado**: 18/12/2024

**Total Done**: 5 items (documentación)

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
- **Sprint 0**: TBD (primer sprint)
- **Promedio**: TBD

### Cycle Time
- **Promedio**: TBD
- **Objetivo**: < 3 días por item

### Lead Time
- **Promedio**: TBD
- **Objetivo**: < 1 semana

### WIP (Work In Progress)
- **Actual**: 0 items
- **Límite**: 2 items por persona
- **Total equipo**: TBD

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

### Para iniciar Sprint 0

1. [ ] Asignar tareas a desarrolladores
2. [ ] Mover items a "In Progress" cuando se empiece
3. [ ] Daily updates en cada item
4. [ ] Mover a Review cuando hay PR
5. [ ] Mover a Done al mergear

### Para Sprint 1

1. [ ] Refinar items de Fase 1
2. [ ] Mover US-001 a US-005 a Ready
3. [ ] Sprint Planning para definir scope
4. [ ] Actualizar board con nuevos compromisos

---

## Notas

- Actualizar board diariamente
- Comunicar bloqueos inmediatamente
- Respetar límites WIP
- Celebrar cuando items llegan a Done 🎉

**Última actualización**: 18/12/2024
**Responsable**: Product Owner / Scrum Master
