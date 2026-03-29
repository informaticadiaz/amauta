# Gestión de Sprints - Amauta

## Sprint Actual: Sprint 14 - Módulo Escolar (PLANIFICADO)

**Fase**: Fase 4 - Módulo Escolar
**Objetivo**: Iniciar el bloque operativo de asistencias con base backend y primera UI de carga rápida.

### Issues comprometidas

- 📋 F4-011: API Registro diario de asistencias por grupo
- 📋 F4-012: UI Carga rápida de asistencias por grupo
- 📋 F4-013: API Resumen mensual de asistencias por grupo

## Sprint 13 - Módulo Escolar (COMPLETADO)

**Fase**: Fase 4 - Módulo Escolar
**Objetivo**: Resolver asignaciones de estudiantes y educadores para habilitar la operación de grupos.

### Issues comprometidas

- ✅ #72 F4-007: API Asignación masiva de estudiantes a grupos
- ✅ #73 F4-008: API Asignación de educadores a grupos
- ✅ #74 F4-009: UI Asignación de estudiantes y educadores

## Sprint 12 - Módulo Escolar Base (COMPLETADO)

**Fase**: Fase 4 - Módulo Escolar
**Objetivo**: Iniciar ejecución con configuración institucional y gestión de grupos.

### Issues comprometidas

- ✅ #67 F4-004: API Periodos Académicos + Escala de Calificación (Institución)
- ✅ #68 F4-005: API Gestión de Grupos/Clases (CRUD + estados)
- ✅ #69 F4-006: UI Gestión de Grupos/Clases (Listado + Form)

## Sprint 11 - Preparación Fase 4 (COMPLETADO)

**Fase**: Fase 4 - Módulo Escolar
**Objetivo**: Preparar historias, dependencias y flujos por rol para iniciar el módulo escolar.

### Issues comprometidas

- ✅ #64 F4-001: Refinar historias y criterios de aceptación (Fase 4)
- ✅ #65 F4-002: Matriz de dependencias UI/Backend (Fase 4)
- ✅ #66 F4-003: Diseño funcional de flujos administrativos (roles)

### Preparación Fase 3 (completada)

- ✅ #52 F3-001: Refinar historias y criterios de aceptación
- ✅ #53 F3-002: Matriz de dependencias UI/Backend
- ✅ #54 F3-003: Diseño funcional de flujos de evaluación

### Último Sprint Completado ✅

**Sprint 13 - Módulo Escolar (Fase 4)**

- Estado: ✅ Completado
- Referencia: `docs/project-management/roadmap.md` → Fase 4

---

## Estructura de Sprints

### Duración

**2 semanas** (10 días hábiles)

### Ciclo

```
Sprint N
│
├─ Día 1: Sprint Planning (2-4h)
├─ Día 2-9: Desarrollo
│   ├─ Daily Standups (15min cada día)
│   └─ Refinement (1h en día 5-6)
└─ Día 10: Review (1-2h) + Retrospective (1h)
    │
    └─> Sprint N+1 Planning
```

## Nomenclatura de Sprints

**Formato**: `Sprint [Número] - [Nombre Temático]`

**Ejemplos:**

- Sprint 1 - Fundamentos
- Sprint 2 - Primera Sangre
- Sprint 3 - Autenticación
- Sprint 4 - Cursos MVP
- Sprint 5 - Offline First

Los nombres temáticos ayudan a recordar el objetivo principal.

## Plantilla de Sprint

### Sprint [N] - [Nombre]

**Fechas**: [DD/MM/YYYY] - [DD/MM/YYYY]

#### Objetivo del Sprint

[Una frase clara sobre qué se quiere lograr]

#### Capacidad del Equipo

- Desarrolladores: [N]
- Velocity promedio: [X] puntos
- Días festivos/ausencias: [Si aplica]
- Capacidad estimada: [Y] puntos

#### Historias Comprometidas

| ID  | Historia                              | Estimación | Asignado | Estado         |
| --- | ------------------------------------- | ---------- | -------- | -------------- |
| #12 | Como usuario puedo registrarme        | 5          | @dev1    | ✅ Done        |
| #13 | Como usuario puedo login              | 3          | @dev2    | 🚧 In Progress |
| #14 | Como usuario puedo recuperar password | 3          | @dev1    | 📋 To Do       |

**Total comprometido**: [Total] puntos

#### Bugs Críticos

| ID  | Descripción                   | Severidad | Asignado | Estado   |
| --- | ----------------------------- | --------- | -------- | -------- |
| #45 | Login falla con emails largos | P1        | @dev3    | ✅ Fixed |

#### Deuda Técnica

- [ ] Refactorizar sistema de autenticación (2 puntos)
- [ ] Agregar tests a módulo de cursos (3 puntos)

#### Métricas del Sprint

- **Velocity**: [Completado] / [Comprometido] puntos
- **Commitment accuracy**: [%]
- **Bugs introducidos**: [N]
- **Bugs resueltos**: [N]

#### Retrospectiva Rápida

**❤️ Lo que funcionó bien:**

- [Ítem 1]
- [Ítem 2]

**⚡ Lo que podemos mejorar:**

- [Ítem 1]
- [Ítem 2]

**🎯 Acciones para próximo sprint:**

- [ ] Acción 1 (Responsable: @persona)
- [ ] Acción 2 (Responsable: @persona)

---

## Ejemplo Completo: Sprint 1

### Sprint 1 - Fundamentos

**Fechas**: 18/12/2024 - 31/12/2024

#### Objetivo del Sprint

Establecer la infraestructura base del proyecto y el sistema de autenticación funcional.

#### Capacidad del Equipo

- Desarrolladores: 3
- Velocity promedio: N/A (primer sprint)
- Días festivos: 25/12 (Navidad)
- Capacidad estimada: 20-25 puntos

#### Historias Comprometidas

| ID  | Historia                               | Puntos | Asignado | Estado         |
| --- | -------------------------------------- | ------ | -------- | -------------- |
| #1  | Setup de proyecto Next.js + TypeScript | 3      | @dev1    | ✅ Done        |
| #2  | Configuración de PostgreSQL + Prisma   | 5      | @dev1    | ✅ Done        |
| #3  | Setup de CI/CD con GitHub Actions      | 5      | @dev2    | 🚧 In Progress |
| #4  | Implementar registro de usuarios       | 5      | @dev2    | 📋 To Do       |
| #5  | Implementar login con NextAuth.js      | 5      | @dev3    | 📋 To Do       |
| #6  | Crear layout base de aplicación        | 3      | @dev3    | 📋 To Do       |

**Total comprometido**: 26 puntos

#### Deuda Técnica

- [ ] Configurar ESLint + Prettier (2 puntos)
- [ ] Setup de testing con Jest (3 puntos)

#### Notas

- Sprint incluye periodo navideño, equipo trabajará solo 8 días
- Priorizar historias #1, #2, #4, #5 como mínimo

---

## Seguimiento Diario

### Daily Standup Template (Async)

**Fecha**: [DD/MM/YYYY]

**@desarrollador1**

- ✅ Ayer: Completé configuración de Prisma (#2)
- 🎯 Hoy: Empezar con setup de CI/CD (#3)
- 🚫 Bloqueadores: Ninguno

**@desarrollador2**

- ✅ Ayer: Avancé 70% en registro de usuarios (#4)
- 🎯 Hoy: Terminar registro y agregar tests
- 🚫 Bloqueadores: Necesito review del esquema de DB

**@desarrollador3**

- ✅ Ayer: Investigué NextAuth.js para #5
- 🎯 Hoy: Implementar providers de autenticación
- 🚫 Bloqueadores: Esperando que #2 esté mergeado

---

## Burn Down Chart

Seguimiento visual del progreso del sprint:

```
Puntos
26 │ ●
   │   ●
20 │     ●
   │       ●
15 │         ●
   │           ●
10 │             ●
   │               ●
 5 │                 ●
   │                   ●
 0 └─────────────────────●─> Días
   1  2  3  4  5  6  7  8  9  10

● Ideal
● Real
```

Herramientas para generar:

- GitHub Projects (automático)
- Jira (automático)
- Hoja de cálculo manual

---

## Sprint Review Checklist

### Preparación (1 día antes)

- [ ] Ambiente de demo actualizado y funcional
- [ ] Historias completadas identificadas
- [ ] Demo script preparado
- [ ] Stakeholders invitados
- [ ] Grabar la sesión (opcional)

### Durante el Review

- [ ] Presentar objetivo del sprint
- [ ] Demostrar cada historia completada
- [ ] Recolectar feedback
- [ ] Discutir historias no completadas
- [ ] Preview del próximo sprint

### Después del Review

- [ ] Documentar feedback
- [ ] Actualizar backlog con nuevo aprendizaje
- [ ] Mover historias incompletas
- [ ] Celebrar logros del equipo 🎉

---

## Sprint Retrospective

### Formato: Start / Stop / Continue

**START** (Comenzar a hacer)

- ¿Qué prácticas nuevas deberíamos adoptar?

**STOP** (Dejar de hacer)

- ¿Qué nos está frenando o no agrega valor?

**CONTINUE** (Continuar haciendo)

- ¿Qué está funcionando bien?

### Ejemplo de Retro

**START**

- Hacer pair programming en features complejas
- Documentar decisiones técnicas en ADRs

**STOP**

- Hacer code review sin probar el código localmente
- Posponer escritura de tests

**CONTINUE**

- Daily standups async (funcionan bien)
- Celebrar PRs mergeados en Slack

**Acciones:**

1. [ ] Implementar template de ADR (@dev1, antes de Sprint 2)
2. [ ] Agregar checklist a PR template sobre testing (@dev2, esta semana)

---

## Gestión de Scope Creep

### Si aparece trabajo nuevo mid-sprint:

**Proceso:**

1. **Evaluar criticidad**
   - ¿Es bloqueante para el objetivo del sprint?
   - ¿Puede esperar al próximo sprint?

2. **Si es crítico:**
   - Discutir con PO
   - Identificar qué historia remover para mantener capacidad
   - Comunicar cambio a todo el equipo

3. **Si puede esperar:**
   - Agregar al backlog
   - Priorizar para próximo sprint

**Regla de oro:** Proteger el commitment del sprint

---

## Historias No Completadas

### Qué hacer al final del sprint:

**Opción 1: Re-estimar y mover**

- Si apenas empezó, mover al backlog
- Re-estimar con conocimiento actual
- Priorizar en próximo sprint si sigue siendo importante

**Opción 2: Split**

- Si está 70%+ completa, considerar split
- Completar lo que falta como historia nueva pequeña

**Opción 3: Cancelar**

- Si el contexto cambió y ya no es relevante

**Importante:**

- No extender el sprint para terminarla
- No contar puntos parciales en velocity

---

## Calendario Ejemplo (Primeros 6 Sprints)

### Q1 2025

**Sprint 1: Fundamentos**

- 18/12/2024 - 31/12/2024
- Setup, infraestructura, autenticación

**Sprint 2: Cursos Básicos I**

- 01/01/2025 - 14/01/2025
- CRUD de cursos, modelos de datos

**Sprint 3: Cursos Básicos II**

- 15/01/2025 - 28/01/2025
- Lecciones, contenido, inscripciones

**Sprint 4: UI/UX & Progreso**

- 29/01/2025 - 11/02/2025
- Interfaces de usuario, seguimiento de progreso

**Sprint 5: Offline I**

- 12/02/2025 - 25/02/2025
- Service workers, caché estrategia

**Sprint 6: Offline II**

- 26/02/2025 - 11/03/2025
- IndexedDB, sincronización, PWA

---

## Comunicación del Sprint

### Kickoff (Inicio)

**Canal**: Slack/Discord + GitHub Issue

```markdown
🚀 **Sprint 1 - Fundamentos** inicia hoy!

**Objetivo**: Establecer infraestructura base y autenticación

**Scope**: 26 puntos comprometidos

- #1 Setup Next.js (3 pts) - @dev1
- #2 PostgreSQL + Prisma (5 pts) - @dev1
- #3 CI/CD (5 pts) - @dev2
- #4 Registro usuarios (5 pts) - @dev2
- #5 Login (5 pts) - @dev3
- #6 Layout base (3 pts) - @dev3

**Fechas**: 18/12 - 31/12
**Review**: 31/12 a las 15:00 GMT-5

¡A por ello equipo! 💪
```

### Updates Mid-Sprint

**Frecuencia**: Cada 3-4 días

```markdown
📊 Sprint 1 - Update Día 5

**Progreso**: 11/26 puntos completados (42%)
**On track**: ✅ Sí

**Completado esta semana:**

- ✅ #1 Setup Next.js
- ✅ #2 PostgreSQL + Prisma

**En progreso:**

- 🚧 #3 CI/CD (80%)
- 🚧 #4 Registro usuarios (60%)

**Próximos días:**

- #5 Login
- #6 Layout base

**Bloqueadores**: Ninguno por ahora
```

### Cierre (Review)

```markdown
🎉 **Sprint 1 - Fundamentos** Completado!

**Resultados**:

- Comprometido: 26 puntos
- Completado: 23 puntos (88%)
- Velocity: 23 puntos

**Logros:**

- ✅ Infraestructura base funcionando
- ✅ Autenticación implementada
- ✅ CI/CD configurado
- ⏸️ Layout base movido a Sprint 2

**Demo**: [Link a video/ambiente]

**Highlights:**

- Cero downtime en desarrollo
- Todos los tests pasando
- Documentación actualizada

**Próximo Sprint 2** inicia mañana!
Objetivo: CRUD de Cursos
```

---

## Métricas y Reportes

### Por Sprint

Documentar en archivo `docs/project-management/sprints/sprint-[N].md`:

- Velocity
- Commitment vs Completed
- Bugs introducidos vs resueltos
- Deployment frequency
- Code coverage
- Retrospectiva y action items

### Dashboard Recomendado

- Velocity trend (últimos 6 sprints)
- Cumulative flow diagram
- Bug trend
- Team happiness (encuesta post-retro)

---

## Recursos

- [Scrum Sprint Guide](https://www.scrum.org/resources/what-is-a-sprint-in-scrum)
- [Atlassian Sprint Planning](https://www.atlassian.com/agile/scrum/sprint-planning)
- [Sprint Retrospective Ideas](https://www.funretrospectives.com/)
