# Roles y Responsabilidades - Amauta

**Última actualización**: 2024-12-23
**Versión**: 1.0.0

## Estructura del Equipo

Amauta sigue una estructura ágil adaptada para proyectos de código abierto, combinando roles tradicionales de Scrum con las particularidades del desarrollo open source.

---

## Roles Principales

### Product Owner (PO)

**Responsable**: [Por asignar]

#### Responsabilidades

- Definir y priorizar el backlog del producto
- Representar las necesidades de usuarios y stakeholders
- Tomar decisiones sobre alcance y prioridades
- Aceptar o rechazar trabajo completado
- Mantener la visión del producto
- Comunicar roadmap y estrategia

#### Actividades Clave

- [ ] Sprint Planning: definir objetivos del sprint
- [ ] Backlog Refinement: refinar y priorizar historias
- [ ] Sprint Review: aceptar/rechazar entregables
- [ ] Responder dudas del equipo sobre requisitos

#### Criterios de Éxito

- Backlog priorizado y actualizado
- Historias con criterios de aceptación claros
- Stakeholders informados del progreso
- Decisiones tomadas en tiempo razonable

---

### Scrum Master / Facilitador

**Responsable**: [Por asignar]

#### Responsabilidades

- Facilitar ceremonias ágiles
- Remover impedimentos del equipo
- Promover prácticas ágiles
- Proteger al equipo de interrupciones
- Fomentar mejora continua
- Mantener métricas del equipo

#### Actividades Clave

- [ ] Daily Standups: facilitar (si aplica)
- [ ] Sprint Planning: facilitar sesión
- [ ] Sprint Review: organizar demo
- [ ] Retrospectiva: facilitar mejora continua
- [ ] Gestionar board y seguimiento

#### Criterios de Éxito

- Equipo sin bloqueos
- Ceremonias ejecutadas eficientemente
- Mejora continua visible
- Métricas de velocidad estables

---

### Desarrollador

**Responsables actuales**: Claude Code (AI Assistant)

#### Responsabilidades

- Desarrollar funcionalidades según especificaciones
- Escribir código limpio y mantenible
- Crear y mantener tests
- Participar en code reviews
- Documentar código y decisiones técnicas
- Estimar esfuerzo de tareas

#### Actividades Clave

- [ ] Tomar tareas del sprint
- [ ] Desarrollar siguiendo estándares
- [ ] Crear Pull Requests
- [ ] Revisar código de otros
- [ ] Actualizar documentación técnica

#### Criterios de Éxito

- Código cumple Definition of Done
- Tests con cobertura > 80%
- Zero bugs críticos introducidos
- Documentación actualizada

---

### Tech Lead / Arquitecto

**Responsable**: [Por asignar]

#### Responsabilidades

- Definir arquitectura técnica
- Tomar decisiones técnicas de alto nivel
- Mentorear a desarrolladores
- Revisar PRs críticos
- Mantener estándares de código
- Evaluar nuevas tecnologías

#### Actividades Clave

- [ ] Definir ADRs (Architecture Decision Records)
- [ ] Code reviews de cambios arquitectónicos
- [ ] Documentar patrones y prácticas
- [ ] Resolver deuda técnica
- [ ] Planificar evolución técnica

#### Criterios de Éxito

- Arquitectura escalable y mantenible
- Decisiones técnicas documentadas
- Equipo alineado en prácticas
- Deuda técnica controlada

---

### DevOps / SRE

**Responsable**: [Por asignar]

#### Responsabilidades

- Mantener infraestructura de producción
- Gestionar CI/CD pipelines
- Monitorear sistemas en producción
- Responder a incidentes
- Optimizar performance y costos
- Documentar procedimientos operativos

#### Actividades Clave

- [ ] Mantener pipelines de CI/CD
- [ ] Monitorear métricas de producción
- [ ] Gestionar deployments
- [ ] Crear runbooks para incidentes
- [ ] Optimizar infraestructura

#### Criterios de Éxito

- Uptime > 99.5%
- Deployments sin downtime
- Incidentes resueltos rápidamente
- Costos de infraestructura optimizados

---

## Roles de la Comunidad Open Source

### Contributor

Cualquier persona que contribuya al proyecto.

#### Tipos de Contribución

- **Code Contributor**: Envía PRs con código
- **Documentation Contributor**: Mejora documentación
- **Bug Reporter**: Reporta bugs con calidad
- **Tester**: Prueba features y reporta issues
- **Translator**: Traduce contenido

#### Proceso para Contribuir

1. Leer CONTRIBUTING.md
2. Buscar issues con label `good-first-issue`
3. Comentar en el issue antes de empezar
4. Seguir estándares de código
5. Crear PR siguiendo template
6. Responder feedback de reviewers

---

### Maintainer

Contribuidores con permisos especiales para gestionar el repositorio.

#### Responsabilidades

- Revisar y mergear PRs
- Gestionar issues y labels
- Moderar discusiones
- Tomar decisiones sobre el proyecto
- Mentorear nuevos contribuidores

#### Requisitos

- Historial consistente de contribuciones de calidad
- Conocimiento profundo del codebase
- Habilidades de comunicación
- Compromiso con el proyecto
- Adherencia al código de conducta

---

### Community Manager

**Responsable**: [Por asignar]

#### Responsabilidades

- Gestionar comunicación externa
- Responder preguntas de la comunidad
- Promocionar el proyecto
- Organizar eventos (meetups, hackatons)
- Escribir blog posts y announcements
- Gestionar redes sociales

---

## Matriz RACI

| Actividad                   | PO  | SM  | Dev | Tech Lead | DevOps |
| --------------------------- | --- | --- | --- | --------- | ------ |
| Definir requisitos          | R/A | C   | C   | C         | I      |
| Priorizar backlog           | R/A | C   | I   | C         | I      |
| Sprint Planning             | A   | R   | C   | C         | I      |
| Desarrollo de features      | A   | I   | R   | C         | I      |
| Code Review                 | I   | I   | R   | R/A       | I      |
| Testing                     | A   | I   | R   | C         | I      |
| Deployment                  | I   | C   | C   | C         | R/A    |
| Decisiones arquitectónicas  | C   | I   | C   | R/A       | C      |
| Gestión de infraestructura  | I   | I   | I   | C         | R/A    |
| Documentación técnica       | I   | I   | R   | A         | C      |
| Comunicación a stakeholders | R/A | C   | I   | C         | I      |

**Leyenda:**

- **R** = Responsible (Ejecuta)
- **A** = Accountable (Aprueba/Rinde cuentas)
- **C** = Consulted (Consultado)
- **I** = Informed (Informado)

---

## Asignación Actual

### Sprint 0 (Diciembre 2024)

| Rol           | Asignado         | Estado     |
| ------------- | ---------------- | ---------- |
| Product Owner | Ignacio Díaz     | Activo     |
| Scrum Master  | [Por asignar]    | Pendiente  |
| Desarrollador | Claude Code (AI) | Activo     |
| Tech Lead     | [Por asignar]    | Pendiente  |
| DevOps        | Ignacio + Claude | Compartido |
| Maintainer    | Ignacio Díaz     | Activo     |

### Necesidades de Contratación/Incorporación

1. **Prioridad Alta**: Tech Lead / Senior Developer
2. **Prioridad Media**: DevOps Engineer
3. **Prioridad Media**: Community Manager
4. **Prioridad Baja**: Diseñador UX/UI

---

## Comunicación por Rol

### Canales

| Rol          | Canal Principal        | Frecuencia    |
| ------------ | ---------------------- | ------------- |
| PO ↔ Equipo  | GitHub Issues/Projects | Diaria        |
| Dev ↔ Dev    | Pull Requests          | Por PR        |
| Equipo ↔ SM  | GitHub Discussions     | Semanal       |
| Comunidad    | GitHub Discussions     | Continua      |
| Stakeholders | README / Releases      | Por milestone |

### Ceremonias

| Ceremonia       | Participantes        | Duración | Frecuencia   |
| --------------- | -------------------- | -------- | ------------ |
| Sprint Planning | PO, SM, Devs         | 2h       | Cada sprint  |
| Daily Standup   | SM, Devs             | 15min    | Diaria (opc) |
| Sprint Review   | Todos + Stakeholders | 1h       | Cada sprint  |
| Retrospectiva   | PO, SM, Devs         | 1h       | Cada sprint  |
| Refinement      | PO, Devs             | 1h       | Mid-sprint   |

---

## Evolución de Roles

### Fase 0-1 (Actual)

- Equipo pequeño (1-2 personas)
- Roles combinados
- Enfoque en fundamentos

### Fase 2-3 (Futuro)

- Equipo en crecimiento (3-5 personas)
- Roles más definidos
- Especialización por área

### Fase 4+ (Escalado)

- Múltiples equipos
- Tech Lead por área
- Estructura de pods/squads

---

## Proceso de Onboarding

### Para Nuevos Contribuidores

1. Leer README.md y CONTRIBUTING.md
2. Configurar entorno (docs/technical/setup.md)
3. Revisar issues con `good-first-issue`
4. Unirse a GitHub Discussions
5. Hacer primera contribución

### Para Nuevos Miembros del Equipo

1. Todo lo anterior +
2. Leer CLAUDE.md y WORKFLOW.md
3. Revisar arquitectura (docs/technical/)
4. Asignar mentor del equipo
5. Pair programming primera semana
6. Asignar primer issue real

---

## Notas

- Los roles son flexibles y pueden combinarse según el tamaño del equipo
- La prioridad es entregar valor, no llenar todas las posiciones
- Claude Code actúa como desarrollador AI siguiendo las mismas prácticas
- El proyecto está abierto a contribuciones de la comunidad

---

**Próxima revisión**: Sprint Planning Sprint 1
