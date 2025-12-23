# Sistema de Gestión de Proyecto - Amauta

## Introducción

Este documento explica cómo y por qué gestionamos el desarrollo de Amauta de la manera en que lo hacemos. Está dirigido a cualquier desarrollador que quiera entender el sistema antes de contribuir.

Amauta utiliza una metodología ágil basada en **Scrum adaptado**, diseñada para:

1. Permitir iteraciones rápidas con entregas de valor constantes
2. Mantener transparencia total en el proceso de desarrollo
3. Facilitar la colaboración con herramientas de IA (Claude Code)
4. Escalar hacia una comunidad open source en el futuro

---

## Filosofía del Sistema

### Principios Fundamentales

| Principio              | Significado                                     | En la práctica                                                   |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Transparencia**      | Todo el trabajo es visible y documentado        | Issues públicos, commits descriptivos, documentación actualizada |
| **Iteración**          | Entregar valor frecuentemente, no todo al final | Sprints de 2 semanas, releases incrementales                     |
| **Trazabilidad**       | Cada cambio tiene un origen y propósito claro   | Commits vinculados a issues, historial completo                  |
| **Calidad sostenible** | No sacrificar calidad por velocidad             | Code review, tests, estándares de código                         |

### Por qué Scrum Adaptado

Elegimos Scrum como base porque:

- **Estructura clara**: Roles, ceremonias y artefactos bien definidos
- **Flexibilidad**: Permite adaptaciones según necesidades del proyecto
- **Enfoque en valor**: Priorización constante de lo que más importa
- **Mejora continua**: Retrospectivas para evolucionar el proceso

Las **adaptaciones** que hicimos:

- Daily standups opcionales/asincrónicos (equipo distribuido)
- Documentación extensa (para onboarding y trabajo con IA)
- Flujo de trabajo optimizado para GitHub CLI
- Integración con TodoWrite para tracking en tiempo real

---

## Estructura del Proyecto

### Fases y Roadmap

El desarrollo de Amauta está organizado en **fases incrementales**:

```
Fase 0: Fundamentos      → Infraestructura, CI/CD, configuración base
Fase 1: MVP Cursos       → Plataforma básica funcional
Fase 2: Offline/PWA      → Funcionamiento sin conexión
Fase 3: Evaluaciones     → Quizzes, exámenes, certificados
Fase 4: Admin Escolar    → Gestión institucional
Fase 5: Comunidad        → Foros, mensajería, colaboración
...
```

Cada fase tiene:

- **Objetivos claros**: Qué se quiere lograr
- **Épicas**: Grandes bloques de funcionalidad
- **Historias de usuario**: Funcionalidades desde la perspectiva del usuario
- **Tareas técnicas**: Trabajo concreto a realizar

### Jerarquía del Trabajo

```
Roadmap
└── Fases
    └── Épicas
        └── Features
            └── Historias de Usuario (US-XXX)
                └── Tareas Técnicas (T-XXX)
```

**Ejemplo concreto:**

```
Fase 1: MVP Cursos
└── Épica: Sistema de Autenticación
    └── Feature: Login de usuarios
        └── US-002: Como usuario puedo hacer login
            └── T-020: Implementar endpoint POST /auth/login
            └── T-021: Crear formulario de login en frontend
            └── T-022: Integrar con NextAuth.js
```

---

## Ciclo de Trabajo

### Sprint (2 semanas)

Un sprint es un ciclo de trabajo con inicio y fin definidos:

```
Día 1:     Sprint Planning (2-4h)
           → Definir qué se va a hacer

Días 2-9:  Desarrollo
           → Trabajo en las tareas comprometidas
           → Daily standups (opcional, async)
           → Refinement mid-sprint (1h)

Día 10:    Review + Retrospectiva (2-3h)
           → Demostrar lo completado
           → Reflexionar sobre el proceso
```

### Flujo de una Tarea

```
1. BACKLOG        → Tarea identificada pero no priorizada
       ↓
2. READY          → Tarea refinada, estimada, lista para trabajar
       ↓
3. IN PROGRESS    → Alguien está trabajando activamente
       ↓
4. IN REVIEW      → Código escrito, esperando code review
       ↓
5. DONE           → Completada, mergeada, deployada
```

### Flujo Detallado con GitHub

Este es el proceso paso a paso para trabajar en una tarea:

```bash
# 1. Ver tareas disponibles
gh issue list --limit 100

# 2. Elegir y entender la tarea
gh issue view <número> --json title,body,labels

# 3. Crear rama (opcional pero recomendado)
git checkout -b feature/T-XXX-descripcion-corta

# 4. Trabajar en la tarea
#    - Usar TodoWrite para tracking
#    - Hacer commits incrementales
#    - Seguir estándares de código

# 5. Commit final
git commit -m "feat: descripción clara

- Detalle 1
- Detalle 2

Resuelve: #<número>"

# 6. Cerrar issue
gh issue close <número> --comment "✅ Completado..."
```

---

## Sistema de Priorización

### MoSCoW

Usamos el método MoSCoW para priorizar:

| Prioridad       | Significado                     | Acción                            |
| --------------- | ------------------------------- | --------------------------------- |
| **Must Have**   | Crítico, sin esto no funciona   | Hacer primero, no negociable      |
| **Should Have** | Importante pero no bloqueante   | Hacer si hay tiempo en el sprint  |
| **Could Have**  | Deseable, mejora la experiencia | Backlog para futuros sprints      |
| **Won't Have**  | Fuera de scope actual           | No hacer ahora, reevaluar después |

### Estimación con Story Points

Usamos la escala Fibonacci para estimar complejidad:

| Puntos | Referencia                | Ejemplo                            |
| ------ | ------------------------- | ---------------------------------- |
| 1      | Trivial, < 2 horas        | Corregir typo, ajustar config      |
| 2      | Simple, ~medio día        | Agregar campo a formulario         |
| 3      | Estándar, ~1 día          | Crear endpoint CRUD simple         |
| 5      | Complejo, 2-3 días        | Implementar autenticación          |
| 8      | Feature pequeño, 3-5 días | Sistema de notificaciones          |
| 13     | Feature medio             | **Dividir en tareas más pequeñas** |
| 21     | Épica                     | **Obligatorio dividir**            |

**Regla importante**: Si una tarea tiene más de 8 puntos, debe dividirse en tareas más pequeñas antes de trabajar en ella.

---

## Nomenclatura y Convenciones

### Identificadores

| Prefijo | Tipo                | Ejemplo                                |
| ------- | ------------------- | -------------------------------------- |
| T-XXX   | Tarea técnica       | T-014: Crear seed data                 |
| US-XXX  | Historia de usuario | US-001: Como usuario puedo registrarme |
| BUG-XXX | Bug/Defecto         | BUG-001: Login falla con emails largos |
| DT-XXX  | Deuda técnica       | DT-001: Refactorizar módulo auth       |

### Commits

Formato estándar:

```
<tipo>: <descripción corta>

<cuerpo opcional con detalles>

Resuelve: #<número-issue>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Tipos de commit:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, sin cambios de lógica
- `refactor`: Reestructuración de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Labels en GitHub

| Label                   | Uso               |
| ----------------------- | ----------------- |
| `must-have`             | Prioridad crítica |
| `should-have`           | Prioridad alta    |
| `could-have`            | Prioridad baja    |
| `phase-0`, `phase-1`... | Fase del roadmap  |
| `backend`, `frontend`   | Área técnica      |
| `bug`, `enhancement`    | Tipo de issue     |

---

## Definiciones de Calidad

### Definition of Ready (DoR)

Una tarea está **lista para trabajar** cuando:

- [ ] Tiene criterios de aceptación claros
- [ ] Está estimada por el equipo
- [ ] Dependencias identificadas y resueltas
- [ ] Tiene diseño/mockup si aplica
- [ ] Tamaño ≤ 8 puntos

### Definition of Done (DoD)

Una tarea está **completada** cuando:

- [ ] Código escrito y funcional
- [ ] Tests escritos (cobertura >80%)
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Sin errores de linting/TypeScript
- [ ] Mergeado a rama principal
- [ ] Issue cerrado con comentario descriptivo

---

## Herramientas del Sistema

### Documentos Clave

| Documento            | Propósito                       | Ubicación                                   |
| -------------------- | ------------------------------- | ------------------------------------------- |
| **WORKFLOW.md**      | Proceso paso a paso para issues | `/WORKFLOW.md`                              |
| **metodologia.md**   | Framework Scrum adaptado        | `/docs/project-management/metodologia.md`   |
| **roadmap.md**       | Visión a largo plazo            | `/docs/project-management/roadmap.md`       |
| **backlog.md**       | Lista priorizada de trabajo     | `/docs/project-management/backlog.md`       |
| **fase-0-tareas.md** | Tareas de la fase actual        | `/docs/project-management/fase-0-tareas.md` |
| **sprints.md**       | Gestión de sprints              | `/docs/project-management/sprints.md`       |

### Herramientas Técnicas

| Herramienta           | Uso                                   |
| --------------------- | ------------------------------------- |
| **GitHub Issues**     | Tracking de tareas y bugs             |
| **GitHub CLI (`gh`)** | Gestión de issues desde terminal      |
| **TodoWrite**         | Tracking en tiempo real (Claude Code) |
| **Turborepo**         | Gestión del monorepo                  |
| **GitHub Actions**    | CI/CD automatizado                    |

---

## Flujo de Trabajo con Claude Code

El proyecto está optimizado para trabajar con Claude Code. Esto significa:

### Uso de TodoWrite

Para tareas con 3+ pasos, siempre crear una lista de tareas:

```json
[
  {
    "content": "Leer y entender el issue",
    "status": "completed",
    "activeForm": "Leyendo el issue"
  },
  {
    "content": "Implementar la solución",
    "status": "in_progress",
    "activeForm": "Implementando la solución"
  },
  {
    "content": "Hacer commit y cerrar issue",
    "status": "pending",
    "activeForm": "Haciendo commit"
  }
]
```

**Reglas:**

- Solo UNA tarea en `in_progress` a la vez
- Marcar `completed` inmediatamente al terminar
- Actualizar en tiempo real, no al final

### Contexto en CLAUDE.md

El archivo `CLAUDE.md` en la raíz del proyecto contiene:

- Descripción del proyecto
- Estructura de carpetas
- Convenciones importantes
- Referencias a documentación
- Estado actual del proyecto

Claude Code lee este archivo automáticamente para entender el contexto.

---

## Métricas y Seguimiento

### Por Sprint

- **Velocity**: Puntos completados vs comprometidos
- **Commitment accuracy**: % de compromisos cumplidos
- **Bugs introducidos/resueltos**: Calidad del código
- **Cycle time**: Tiempo promedio de una tarea

### Globales

- **Lead time**: Tiempo desde idea hasta producción
- **Deployment frequency**: Frecuencia de deploys
- **Code coverage**: % de código cubierto por tests
- **Disponibilidad**: Uptime del sistema

### Lo que NO medimos

- Horas trabajadas (confiamos en el equipo)
- Cantidad de commits (calidad > cantidad)
- Líneas de código (no correlaciona con valor)

---

## Cómo Empezar

Si sos nuevo en el proyecto:

1. **Lee `CLAUDE.md`** - Contexto general del proyecto
2. **Lee `WORKFLOW.md`** - Proceso para trabajar con issues
3. **Revisa `backlog.md`** - Ver qué trabajo está pendiente
4. **Configura el entorno** - Sigue `docs/technical/setup.md`
5. **Elige un issue** - Busca uno etiquetado como `good-first-issue`

### Checklist de Onboarding

- [ ] Leí CLAUDE.md y entiendo el proyecto
- [ ] Leí WORKFLOW.md y entiendo el proceso
- [ ] Configuré mi entorno de desarrollo
- [ ] Puedo ejecutar el proyecto localmente
- [ ] Entiendo la estructura del monorepo
- [ ] Sé cómo crear un commit con el formato correcto
- [ ] Sé cómo cerrar un issue correctamente

---

## Preguntas Frecuentes

### ¿Por qué tanto proceso para un proyecto pequeño?

El proceso parece extenso pero:

- La mayoría son templates que se copian/pegan
- Facilita el onboarding de nuevos contribuidores
- Permite trabajar de forma asíncrona y distribuida
- Escala bien cuando el proyecto crezca

### ¿Puedo saltarme pasos?

Para tareas triviales (1-2 puntos), podés simplificar. Pero siempre:

- Vinculá el commit al issue
- Cerrá el issue con un comentario explicativo
- Seguí el formato de commits

### ¿Qué pasa si no termino una tarea en el sprint?

- Se mueve al próximo sprint
- Se re-estima si es necesario
- Se analiza en la retrospectiva por qué no se completó
- No se cuenta en el velocity del sprint actual

### ¿Cómo propongo cambios al proceso?

1. Creá un issue con label `workflow-improvement`
2. Explicá el problema actual y tu propuesta
3. Discutí con el equipo
4. Si hay consenso, actualizá la documentación

---

## Recursos Adicionales

- [Scrum Guide](https://scrumguides.org/) - Framework original
- [Agile Manifesto](https://agilemanifesto.org/) - Principios ágiles
- [Conventional Commits](https://www.conventionalcommits.org/) - Formato de commits
- [MoSCoW Method](https://en.wikipedia.org/wiki/MoSCoW_method) - Priorización

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
