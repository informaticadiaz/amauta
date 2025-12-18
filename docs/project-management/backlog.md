# Product Backlog - Amauta

**Última actualización**: 2024-12-18
**Product Owner**: [Por definir]

## Cómo usar este documento

Este backlog contiene todas las historias de usuario, épicas y tareas priorizadas para el desarrollo de Amauta. Las tareas se organizan por:

1. **Prioridad** (MoSCoW: Must/Should/Could/Won't)
2. **Fase** del roadmap
3. **Estimación** en story points
4. **Estado** (Backlog, Ready, In Progress, Done)

---

## Sprint Actual: Sprint 0 (Fase 0)

**Fechas**: 18/12/2024 - 31/12/2024
**Objetivo**: Establecer fundamentos técnicos y de gestión del proyecto
**Capacidad**: 25 puntos (estimado para primer sprint)

### Comprometido para Sprint 0

| ID | Tarea | Estimación | Asignado | Estado | Prioridad |
|----|-------|-----------|----------|---------|-----------|
| T-001 | Configurar .gitignore | 1 | - | 📋 To Do | Must |
| T-002 | Definir licencia del proyecto | 1 | - | 📋 To Do | Must |
| T-005 | Configurar GitHub Actions para CI | 5 | - | 📋 To Do | Must |
| T-008 | Inicializar estructura de monorepo | 5 | - | 📋 To Do | Must |
| T-009 | Configurar TypeScript | 3 | - | 📋 To Do | Must |
| T-010 | Configurar ESLint y Prettier | 3 | - | 📋 To Do | Must |
| T-011 | Configurar variables de entorno | 2 | - | 📋 To Do | Must |
| T-012 | Configurar PostgreSQL | 3 | - | 📋 To Do | Must |
| T-013 | Configurar Prisma | 5 | - | 📋 To Do | Must |

**Total comprometido**: 28 puntos

---

## Backlog Priorizado

### FASE 0: Fundamentos (Sprint 0)

#### Must Have (Crítico para completar Fase 0)

| ID | Historia/Tarea | Estimación | Estado | Sprint |
|----|---------------|-----------|---------|---------|
| T-001 | Configurar .gitignore | 1 | Ready | Sprint 0 |
| T-002 | Definir licencia del proyecto | 1 | Ready | Sprint 0 |
| T-005 | Configurar GitHub Actions para CI | 5 | Ready | Sprint 0 |
| T-006 | Configurar tests en CI | 3 | Backlog | Sprint 0 |
| T-008 | Inicializar estructura de monorepo | 5 | Ready | Sprint 0 |
| T-009 | Configurar TypeScript | 3 | Ready | Sprint 0 |
| T-010 | Configurar ESLint y Prettier | 3 | Ready | Sprint 0 |
| T-011 | Configurar variables de entorno | 2 | Ready | Sprint 0 |
| T-012 | Configurar PostgreSQL | 3 | Ready | Sprint 0 |
| T-013 | Configurar Prisma | 5 | Ready | Sprint 0 |

**Subtotal Must Have Fase 0**: 31 puntos

#### Should Have (Importante pero no bloqueante)

| ID | Historia/Tarea | Estimación | Estado | Sprint |
|----|---------------|-----------|---------|---------|
| T-003 | Crear Code of Conduct | 2 | Backlog | Sprint 0 |
| T-004 | Crear Contributing Guidelines | 3 | Backlog | Sprint 0 |
| T-007 | Configurar pre-commit hooks | 3 | Backlog | Sprint 0 |
| T-014 | Crear seed data | 3 | Backlog | Sprint 0 |
| T-015 | Crear diagramas de arquitectura | 3 | Backlog | Sprint 0 |

**Subtotal Should Have Fase 0**: 14 puntos

#### Could Have (Deseable si hay tiempo)

| ID | Historia/Tarea | Estimación | Estado | Sprint |
|----|---------------|-----------|---------|---------|
| T-016 | Documentar API endpoints (preparación) | 2 | Backlog | Futuro |
| DT-001 | Configurar Docker para desarrollo completo | 5 | Backlog | Futuro |
| DT-002 | Configurar herramienta de monitoreo | 3 | Backlog | Futuro |

**Subtotal Could Have Fase 0**: 10 puntos

---

### FASE 1: MVP - Plataforma de Cursos Básica (Sprints 1-4)

#### Épica 1: Sistema de Autenticación y Usuarios

**Estimación total**: 21 puntos
**Prioridad**: Must Have
**Sprints**: 1-2

| ID | Historia de Usuario | Estimación | Estado | Sprint |
|----|-------------------|-----------|---------|---------|
| US-001 | Como usuario puedo registrarme en la plataforma | 5 | Backlog | Sprint 1 |
| US-002 | Como usuario puedo hacer login | 3 | Backlog | Sprint 1 |
| US-003 | Como usuario puedo recuperar mi contraseña | 5 | Backlog | Sprint 1 |
| US-004 | Como usuario puedo ver y editar mi perfil | 5 | Backlog | Sprint 1 |
| US-005 | Como usuario puedo cambiar mi contraseña | 3 | Backlog | Sprint 2 |

#### Épica 2: Gestión de Cursos (Educador)

**Estimación total**: 34 puntos
**Prioridad**: Must Have
**Sprints**: 2-3

| ID | Historia de Usuario | Estimación | Estado | Sprint |
|----|-------------------|-----------|---------|---------|
| US-010 | Como educador puedo crear un curso | 8 | Backlog | Sprint 2 |
| US-011 | Como educador puedo editar un curso | 5 | Backlog | Sprint 2 |
| US-012 | Como educador puedo agregar lecciones a un curso | 8 | Backlog | Sprint 2 |
| US-013 | Como educador puedo publicar un curso | 3 | Backlog | Sprint 3 |
| US-014 | Como educador puedo ver estadísticas de mi curso | 5 | Backlog | Sprint 3 |
| US-015 | Como educador puedo archivar un curso | 2 | Backlog | Sprint 3 |
| US-016 | Como educador puedo agregar contenido multimedia | 3 | Backlog | Sprint 3 |

#### Épica 3: Catálogo y Navegación (Estudiante)

**Estimación total**: 26 puntos
**Prioridad**: Must Have
**Sprints**: 3-4

| ID | Historia de Usuario | Estimación | Estado | Sprint |
|----|-------------------|-----------|---------|---------|
| US-020 | Como estudiante puedo ver el catálogo de cursos | 5 | Backlog | Sprint 3 |
| US-021 | Como estudiante puedo filtrar cursos por categoría | 3 | Backlog | Sprint 3 |
| US-022 | Como estudiante puedo buscar cursos | 5 | Backlog | Sprint 3 |
| US-023 | Como estudiante puedo ver detalles de un curso | 3 | Backlog | Sprint 3 |
| US-024 | Como estudiante puedo inscribirme en un curso | 5 | Backlog | Sprint 4 |
| US-025 | Como estudiante puedo ver mis cursos inscritos | 3 | Backlog | Sprint 4 |
| US-026 | Como estudiante puedo desinscribirme de un curso | 2 | Backlog | Sprint 4 |

#### Épica 4: Consumo de Contenido

**Estimación total**: 29 puntos
**Prioridad**: Must Have
**Sprints**: 4

| ID | Historia de Usuario | Estimación | Estado | Sprint |
|----|-------------------|-----------|---------|---------|
| US-030 | Como estudiante puedo ver las lecciones de un curso | 5 | Backlog | Sprint 4 |
| US-031 | Como estudiante puedo ver contenido de video | 5 | Backlog | Sprint 4 |
| US-032 | Como estudiante puedo ver contenido de texto | 3 | Backlog | Sprint 4 |
| US-033 | Como estudiante puedo marcar lecciones como completadas | 5 | Backlog | Sprint 4 |
| US-034 | Como estudiante puedo ver mi progreso en el curso | 5 | Backlog | Sprint 4 |
| US-035 | Como estudiante puedo navegar entre lecciones | 3 | Backlog | Sprint 4 |
| US-036 | Como estudiante puedo descargar recursos de la lección | 3 | Backlog | Sprint 4 |

---

### FASE 2: Offline-First & PWA (Sprints 5-7)

**Estado**: Backlog
**Prioridad**: Should Have

| ID | Historia de Usuario | Estimación | Estado | Sprint |
|----|-------------------|-----------|---------|---------|
| US-050 | Como estudiante puedo descargar un curso para offline | 8 | Backlog | Sprint 5 |
| US-051 | Como estudiante puedo ver cursos sin conexión | 5 | Backlog | Sprint 5 |
| US-052 | Como usuario mi progreso se sincroniza automáticamente | 8 | Backlog | Sprint 6 |
| US-053 | Como usuario puedo instalar Amauta como app | 5 | Backlog | Sprint 6 |
| US-054 | Como usuario recibo notificaciones push | 5 | Backlog | Sprint 7 |

---

## Bugs y Issues

Actualmente no hay bugs reportados (proyecto en fase inicial).

### Template para reportar bugs

Cuando se encuentre un bug, agregarlo aquí con este formato:

| ID | Descripción | Severidad | Estado | Asignado |
|----|-------------|-----------|---------|----------|
| BUG-XXX | [Descripción breve] | P0/P1/P2/P3 | Open/In Progress/Fixed | @usuario |

---

## Deuda Técnica

| ID | Descripción | Estimación | Impacto | Estado |
|----|-------------|-----------|---------|---------|
| DT-001 | Configurar Docker desarrollo completo | 5 | Medio | Backlog |
| DT-002 | Configurar monitoreo de errores | 3 | Alto | Backlog |

---

## Métricas del Backlog

### Distribución por Prioridad
- **Must Have**: 110+ puntos
- **Should Have**: 31+ puntos
- **Could Have**: 10+ puntos

### Distribución por Fase
- **Fase 0**: 55 puntos (en progreso)
- **Fase 1**: 110 puntos
- **Fase 2**: 31 puntos

### Backlog Health
- **Ready for Development**: 10 items
- **Needs Refinement**: 35+ items
- **Blocked**: 0 items

---

## Proceso de Refinamiento

### Cuándo refinar
- **Backlog Refinement**: Cada miércoles mid-sprint (1 hora)
- **Sprint Planning**: Primer día de cada sprint (2-4 horas)

### Checklist para pasar a "Ready"
- [ ] Historia tiene criterios de aceptación claros
- [ ] Historia está estimada
- [ ] Dependencias identificadas
- [ ] Diseño/mockup disponible (si aplica)
- [ ] Tamaño <= 8 puntos (dividir si es mayor)

### Responsables
- **Product Owner**: Prioriza y acepta historias
- **Equipo de Desarrollo**: Estima y refina detalles técnicos
- **Scrum Master**: Facilita sesiones de refinamiento

---

## Próximos Pasos

### Para Sprint 1 (después de Sprint 0)
1. Refinar historias US-001 a US-005 (Autenticación)
2. Crear mockups para pantallas de login/registro
3. Definir API endpoints necesarios
4. Estimar con Planning Poker

### Para Fase 1 completa
1. Detallar todas las épicas 1-4
2. Dividir historias grandes (>8 puntos)
3. Crear designs/wireframes
4. Validar con stakeholders

---

## Notas

- Este backlog es un documento vivo que se actualiza constantemente
- Las estimaciones pueden cambiar durante el refinamiento
- Las prioridades pueden ajustarse según feedback de usuarios
- Nuevas historias pueden agregarse en cualquier momento

**Última revisión**: Sprint 0
**Próxima revisión**: Sprint Planning Sprint 1
