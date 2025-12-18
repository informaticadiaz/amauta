# Gestión de Tareas - Amauta

## Jerarquía de Trabajo

```
Épica
├── Feature / Historia de Usuario
│   ├── Tarea Técnica 1
│   ├── Tarea Técnica 2
│   └── Tarea Técnica N
└── Bug / Mejora
```

## Tipos de Issues

### 1. Épica

**Definición**: Iniciativa grande que abarca múltiples sprints

**Cuándo usar:**

- Feature que toma >3 sprints
- Iniciativa estratégica
- Módulo completo del sistema

**Ejemplo:**

```markdown
# Épica: Sistema de Evaluaciones

## Descripción

Implementar sistema completo de evaluaciones que permita a educadores
crear exámenes y quizzes, y a estudiantes completarlos y recibir feedback.

## Alcance

- Crear evaluaciones con diferentes tipos de preguntas
- Tomar evaluaciones
- Calificación automática
- Generación de certificados

## Features incluidas

- #45 Creación de evaluaciones
- #46 Motor de calificación
- #47 Certificados automáticos
- #48 Analytics de rendimiento

## Criterios de Completitud

- [ ] Educador puede crear evaluación completa
- [ ] Estudiante puede completar y ver resultados
- [ ] Certificados se generan automáticamente
- [ ] Métricas disponibles para educadores

## Estimación total: 55 puntos

## Timeline: Sprint 8-10
```

### 2. Feature / Historia de Usuario

**Definición**: Funcionalidad completa desde perspectiva del usuario

**Template:**

```markdown
## [Título descriptivo]

**Como** [rol de usuario]
**Quiero** [acción]
**Para** [beneficio]

### Descripción

[Contexto adicional necesario]

### Criterios de Aceptación

- [ ] Criterio 1 - específico y testeable
- [ ] Criterio 2 - específico y testeable
- [ ] Criterio 3 - específico y testeable

### Diseño/Mockups

[Link o imagen]

### Consideraciones Técnicas

- API endpoints: [listar]
- Modelos de datos: [listar]
- Dependencias: #[otras issues]

### Tareas de Implementación

- [ ] Backend: Crear endpoint POST /api/cursos
- [ ] Backend: Agregar validaciones
- [ ] Frontend: Crear componente CourseForm
- [ ] Frontend: Integrar con API
- [ ] Testing: Tests unitarios
- [ ] Testing: Tests de integración

### Definition of Done

- [ ] Código revisado y aprobado
- [ ] Tests escritos y pasando
- [ ] Documentación actualizada
- [ ] Deployado a staging
- [ ] Aceptado por PO

**Estimación**: [X] puntos
**Prioridad**: Must/Should/Could/Won't
**Sprint**: [número o Backlog]

**Labels**: `feature`, `frontend`, `backend`
```

**Ejemplo Real:**

```markdown
## Estudiante puede inscribirse en un curso

**Como** estudiante
**Quiero** inscribirme en un curso con un botón
**Para** acceder a su contenido y empezar a aprender

### Descripción

Cuando un estudiante ve un curso que le interesa, debe poder
inscribirse haciendo click en "Inscribirse". Esto lo agrega
a "Mis Cursos" y le da acceso a todas las lecciones.

### Criterios de Aceptación

- [ ] Botón "Inscribirse" visible en página de curso
- [ ] Al hacer click, usuario se inscribe inmediatamente
- [ ] Curso aparece en sección "Mis Cursos"
- [ ] Usuario puede acceder a lecciones del curso
- [ ] Si ya está inscrito, muestra "Ya inscrito" o "Continuar"
- [ ] Muestra mensaje de éxito tras inscripción

### Diseño

![Mockup inscripción](link-a-figma)

### Consideraciones Técnicas

- API: POST /api/cursos/:id/inscribir
- Verificar que usuario esté autenticado
- Prevenir inscripción duplicada
- Actualizar UI sin refresh (optimistic update)

### Tareas

- [ ] Backend: Endpoint de inscripción
- [ ] Backend: Validar autenticación y duplicados
- [ ] Frontend: Botón de inscripción con estados
- [ ] Frontend: Actualizar lista "Mis Cursos"
- [ ] Tests: API endpoint
- [ ] Tests: Componente de botón

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Sprint**: Sprint 3

**Labels**: `feature`, `frontend`, `backend`, `mvp`
```

### 3. Tarea Técnica

**Definición**: Trabajo técnico sin valor directo para usuario

**Cuándo usar:**

- Setup de infraestructura
- Refactoring
- Deuda técnica
- Mejoras de performance

**Template:**

```markdown
## [Título técnico específico]

### Objetivo

[Qué se quiere lograr]

### Motivación

[Por qué es necesario]

### Approach

[Cómo se va a implementar]

### Checklist

- [ ] Paso 1
- [ ] Paso 2
- [ ] Paso 3

### Testing

[Cómo verificar que funciona]

**Estimación**: [X] puntos
**Labels**: `tech-debt`, `infrastructure`, `refactor`
```

**Ejemplo:**

```markdown
## Migrar autenticación a middleware de Next.js

### Objetivo

Refactorizar verificación de autenticación para usar middleware
de Next.js 14 en lugar de HOCs.

### Motivación

- Mejor performance (verifica en edge)
- Código más limpio y mantenible
- Aprovecha features de Next.js 14

### Approach

1. Crear middleware.ts en root
2. Definir rutas protegidas con matcher
3. Migrar lógica de verificación de sesión
4. Actualizar todas las páginas protegidas
5. Eliminar HOCs antiguos

### Checklist

- [ ] Crear middleware.ts
- [ ] Migrar lógica de auth
- [ ] Actualizar 10 páginas protegidas
- [ ] Verificar que redirecciones funcionan
- [ ] Eliminar código legacy
- [ ] Actualizar documentación

### Testing

- Verificar que usuario no autenticado es redirigido
- Verificar que usuario autenticado accede normalmente
- Verificar que refresh mantiene sesión

**Estimación**: 8 puntos
**Labels**: `tech-debt`, `refactor`, `backend`
```

### 4. Bug

**Definición**: Algo que no funciona como se esperaba

**Template:**

```markdown
## [Descripción breve del bug]

### Severidad

- [ ] P0 - Critical
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low

### Descripción

[Qué está mal]

### Pasos para Reproducir

1. Paso 1
2. Paso 2
3. Paso 3

### Comportamiento Esperado

[Qué debería pasar]

### Comportamiento Actual

[Qué pasa realmente]

### Screenshots/Videos

[Si aplica]

### Entorno

- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versión: [X.Y.Z]

### Información Adicional

- Logs: [Si hay]
- User ID afectado: [Si aplica]

### Posible Causa

[Si se sabe]

**Labels**: `bug`, `p1`, `frontend`
```

**Ejemplo:**

```markdown
## Login falla con contraseñas que contienen caracteres especiales

### Severidad

- [x] P1 - High

### Descripción

Usuarios no pueden hacer login si su contraseña contiene
caracteres especiales como &, %, $, #

### Pasos para Reproducir

1. Crear usuario con password "Test&123"
2. Intentar hacer login
3. Recibe error "Credenciales inválidas"

### Comportamiento Esperado

Usuario debería poder hacer login con cualquier carácter válido

### Comportamiento Actual

Login falla con error de credenciales inválidas

### Screenshots

[screenshot del error]

### Entorno

- OS: Todos
- Browser: Todos
- Versión: 0.1.0

### Información Adicional

- Ocurre tanto en web como PWA
- Password hash parece estar correcto en DB
- Error en logs: "URL decode error"

### Posible Causa

Posible problema con encoding en la request o al comparar hashes.
Verificar si bcrypt está recibiendo el string correcto.

**Labels**: `bug`, `p1`, `backend`, `authentication`
```

### 5. Mejora

**Definición**: Optimización de algo existente

**Template:**

```markdown
## [Título de la mejora]

### Funcionalidad Actual

[Cómo funciona ahora]

### Mejora Propuesta

[Cómo debería funcionar]

### Beneficios

- Beneficio 1
- Beneficio 2

### Esfuerzo Estimado

[Bajo/Medio/Alto]

**Labels**: `enhancement`, `ux`, `performance`
```

## Estados de Tareas

### Workflow Estándar

```
📋 Backlog → 🎯 Ready → 🚧 In Progress → 👀 Review → ✅ Done
                                            ↓
                                         ❌ Blocked
```

**Backlog**

- Tarea identificada pero no priorizada
- No lista para desarrollo

**Ready**

- Cumple Definition of Ready
- Lista para ser tomada en sprint

**In Progress**

- Alguien está trabajando activamente
- Asignada a desarrollador

**Review**

- PR creado y esperando aprobación
- En proceso de code review

**Blocked**

- No puede avanzar por impedimento externo
- Identificar y documentar bloqueador

**Done**

- Cumple Definition of Done
- Mergeado y deployado

### Transiciones

**Backlog → Ready**

- Trigger: Sprint Planning o Refinement
- Responsable: Product Owner + Equipo

**Ready → In Progress**

- Trigger: Desarrollador toma la tarea
- Responsable: Desarrollador

**In Progress → Review**

- Trigger: PR creado
- Responsable: Desarrollador

**Review → Done**

- Trigger: PR aprobado y mergeado
- Responsable: Reviewer + Desarrollador

**Cualquier → Blocked**

- Trigger: Impedimento identificado
- Responsable: Quien lo detecta
- Acción: Comunicar inmediatamente

## Labels y Categorización

### Por Tipo

- `feature` - Nueva funcionalidad
- `bug` - Algo no funciona
- `enhancement` - Mejora de algo existente
- `tech-debt` - Deuda técnica
- `docs` - Documentación

### Por Área

- `frontend` - Trabajo de UI/UX
- `backend` - Trabajo de API/lógica
- `database` - Cambios en esquema
- `infrastructure` - DevOps, CI/CD
- `testing` - Tests, QA

### Por Prioridad

- `p0-critical` - Arreglar ahora
- `p1-high` - Próximo sprint
- `p2-medium` - Backlog priorizado
- `p3-low` - Nice to have

### Por Fase

- `mvp` - Parte del MVP
- `phase-1` - Fase 1 del roadmap
- `phase-2` - Fase 2 del roadmap

### Especiales

- `good-first-issue` - Para nuevos contribuidores
- `help-wanted` - Necesita colaboración
- `blocked` - No puede avanzar
- `breaking-change` - Rompe compatibilidad

## Estimación de Tareas

### Story Points

**1 punto** (Trivial - <2 horas)

- Cambio de texto
- Ajuste de estilo simple
- Fix de typo

**2 puntos** (Simple - Medio día)

- Componente UI simple
- Endpoint CRUD básico
- Test unitario

**3 puntos** (Estándar - 1 día)

- Componente UI con lógica
- Endpoint con validaciones
- Integración simple

**5 puntos** (Complejo - 2-3 días)

- Feature pequeño completo
- Sistema con múltiples partes
- Refactor significativo

**8 puntos** (Muy complejo - 1 semana)

- Feature mediano
- Integración compleja
- Arquitectura nueva

**13 puntos** (Épica pequeña)

- Considerar dividir
- Solo si realmente es indivisible

**21+ puntos**

- Definitivamente dividir en historias más pequeñas

### Técnica de Estimación

**Planning Poker:**

1. PO presenta tarea
2. Equipo hace preguntas
3. Cada uno estima en privado
4. Todos revelan al mismo tiempo
5. Discutir diferencias grandes
6. Re-votar hasta consenso

**Criterios para estimar:**

- Complejidad técnica
- Cantidad de trabajo
- Incertidumbre/riesgo
- Dependencias

## Asignación de Tareas

### Reglas

1. **Auto-asignación**: Desarrolladores eligen sus tareas
2. **Límite WIP**: Max 2 tareas en progreso por persona
3. **Finish First**: Terminar antes de empezar nueva
4. **Pair Programming**: OK asignar 2 personas si es complejo

### Consideraciones

- Balance entre frontend/backend
- Distribución de expertise
- Oportunidad de aprendizaje
- Dependencias entre tareas

## Seguimiento de Tareas

### Daily Updates

Cada desarrollador actualiza sus tareas:

```markdown
**Tarea #45: Implementar inscripción a cursos**
Status: In Progress (60%)
Progreso hoy:

- ✅ Endpoint de inscripción completado
- ✅ Tests de API escritos
- 🚧 Trabajando en componente de UI
  Próximo:
- Integrar frontend con API
- Agregar tests de componente
  Bloqueadores: Ninguno
```

### En el Board

**Kanban Visual:**

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Backlog  │  Ready   │   WIP    │  Review  │   Done   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│  #23     │   #12    │   #45    │   #34    │   #56    │
│  #24     │   #13    │   @dev1  │   @dev2  │   ✅     │
│  #25     │   #14    │          │          │          │
│  #26     │   #15    │   #46    │   #35    │   #57    │
│  ...     │   #16    │   @dev3  │   @dev1  │   ✅     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

## Dependencias entre Tareas

### Identificar Dependencias

```markdown
**Tarea #46: Frontend de inscripción**

### Dependencias

- Bloqueada por: #45 (Endpoint de inscripción) - Crítico
- Relacionada con: #44 (Autenticación) - Requiere sesión activa
- Bloquea a: #47 (Tests E2E de inscripción)
```

### Gestionar Dependencias

1. **Documentarlas**: En la issue
2. **Visualizarlas**: En el board
3. **Priorizarlas**: Resolver bloqueadores primero
4. **Comunicarlas**: En planning y dailies

## Refinamiento de Tareas

### Cuándo refinar

- Durante Backlog Refinement (mid-sprint)
- Cuando aparece nueva información
- Antes de mover a "Ready"

### Qué refinar

- Clarificar criterios de aceptación
- Dividir tareas grandes
- Agregar detalles técnicos
- Actualizar estimaciones
- Identificar dependencias

### Checklist de Refinamiento

- [ ] Título claro y descriptivo
- [ ] Descripción completa
- [ ] Criterios de aceptación específicos
- [ ] Estimación actualizada
- [ ] Labels correctos
- [ ] Dependencias identificadas
- [ ] Diseño/mockup si aplica
- [ ] Consideraciones técnicas documentadas

## Templates de GitHub

### Crear Templates

**.github/ISSUE_TEMPLATE/feature.md**

```markdown
---
name: Feature Request
about: Nueva funcionalidad o mejora
title: ''
labels: 'feature'
assignees: ''
---

## Historia de Usuario

**Como** [rol]
**Quiero** [acción]
**Para** [beneficio]

## Descripción

[Contexto y detalles]

## Criterios de Aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## Mockups/Diseño

[Links o imágenes]

## Consideraciones Técnicas

[Detalles de implementación]

## Estimación

[Puntos]

## Prioridad

[Must/Should/Could/Won't]
```

Similares para: bug, tech-debt, documentation

## Herramientas

### Recomendadas

- **GitHub Projects**: Integrado con código
- **Linear**: Rápido y moderno
- **Jira**: Robusto para equipos grandes
- **Trello**: Simple y visual

### Integraciones

- Vincular commits: `git commit -m "feat: add enrollment button (#45)"`
- Auto-cerrar: `git commit -m "fix: resolve login issue (closes #67)"`
- PR links: `Fixes #45` en descripción de PR

## Métricas de Tareas

### Por Sprint

- Tareas completadas vs comprometidas
- Cycle time promedio
- Tareas bloqueadas
- Re-abiertos

### Por Tipo

- Features vs Bugs vs Tech Debt (balance)
- Velocidad por tipo de tarea

## Buenas Prácticas

1. **Tareas Pequeñas**: Idealmente completables en 1-2 días
2. **Descripciones Claras**: Cualquiera debe poder entenderla
3. **Mantener Actualizadas**: Status siempre correcto
4. **Vincular PRs**: Siempre referenciar issue en PR
5. **Celebrar Done**: Reconocer cuando se completa
6. **Limpiar Backlog**: Cerrar tareas obsoletas

## Recursos

- [GitHub Issues Docs](https://docs.github.com/en/issues)
- [User Story Best Practices](https://www.mountaingoatsoftware.com/agile/user-stories)
- [Jira Task Management](https://www.atlassian.com/agile/project-management/epics-stories-themes)
