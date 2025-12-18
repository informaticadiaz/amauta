# Metodología Ágil - Amauta

## Framework: Scrum Adaptado

Amauta utiliza una metodología ágil basada en Scrum, adaptada a las necesidades de un proyecto de código abierto con posible participación comunitaria.

## Principios Fundamentales

### 1. Iteración Rápida

- Sprints de 2 semanas
- Entregas incrementales de valor
- Feedback temprano y frecuente

### 2. Colaboración

- Comunicación abierta y transparente
- Decisiones consensuadas cuando es posible
- Documentación clara y accesible

### 3. Adaptabilidad

- Flexibilidad para cambiar prioridades
- Respuesta rápida a feedback
- Mejora continua

### 4. Calidad Sostenible

- Testing integrado en desarrollo
- Code review obligatorio
- Refactoring continuo

## Roles

### Product Owner

**Responsabilidades:**

- Definir visión y estrategia del producto
- Priorizar el backlog
- Aceptar o rechazar trabajo completado
- Representar a usuarios y stakeholders
- Tomar decisiones sobre features

**Compromisos:**

- Disponible para aclarar dudas del equipo
- Participar en planning y reviews
- Mantener backlog actualizado

### Scrum Master (opcional según tamaño de equipo)

**Responsabilidades:**

- Facilitar ceremonias Scrum
- Remover impedimentos
- Proteger al equipo de interrupciones
- Promover mejora continua
- Asegurar adherencia a la metodología

**Compromisos:**

- Disponibilidad diaria para el equipo
- Seguimiento de métricas
- Fomentar auto-organización

### Equipo de Desarrollo

**Responsabilidades:**

- Desarrollar funcionalidades comprometidas
- Estimar trabajo
- Auto-organizarse
- Mantener calidad técnica
- Colaborar con code reviews

**Compromisos:**

- Participar en ceremonias
- Actualizar progreso diariamente
- Comunicar impedimentos temprano
- Seguir estándares de código

### Contribuidores Open Source (si aplica)

**Responsabilidades:**

- Seguir guías de contribución
- Respetar roadmap y prioridades
- Comunicar intenciones antes de trabajar en features grandes

## Ceremonias

### 1. Sprint Planning

**Cuándo**: Primer día del sprint
**Duración**: 2-4 horas (según sprint de 2 semanas)
**Participantes**: Todo el equipo

**Agenda:**

1. Review de objetivo del sprint anterior (15 min)
2. Product Owner presenta prioridades (30 min)
3. Equipo hace preguntas y aclara dudas (30 min)
4. Equipo estima historias (1-2 horas)
5. Equipo se compromete a scope del sprint (30 min)
6. Definir objetivo del sprint (15 min)

**Salidas:**

- Sprint backlog definido
- Objetivo del sprint claro
- Estimaciones completadas

### 2. Daily Standup (Opcional/Async)

**Cuándo**: Diariamente (o async en Slack/Discord)
**Duración**: 15 minutos máximo
**Participantes**: Equipo de desarrollo

**Formato:**
Cada miembro comparte:

1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún impedimento?

**Modo Async:**

- Actualización en canal de equipo
- Usar herramienta de project management
- Responder antes de mediodía

### 3. Sprint Review

**Cuándo**: Último día del sprint
**Duración**: 1-2 horas
**Participantes**: Todo el equipo + stakeholders invitados

**Agenda:**

1. Demo de funcionalidades completadas (45-60 min)
2. Feedback de stakeholders (30 min)
3. Discusión de siguiente prioridades (15-30 min)

**Salidas:**

- Funcionalidades aceptadas o rechazadas
- Feedback documentado
- Ajustes al backlog

### 4. Sprint Retrospective

**Cuándo**: Después del Review
**Duración**: 1 hora
**Participantes**: Equipo de desarrollo + Scrum Master

**Agenda:**

1. ¿Qué salió bien? (15 min)
2. ¿Qué podemos mejorar? (15 min)
3. ¿Qué vamos a comprometernos a mejorar? (20 min)
4. Action items (10 min)

**Formato sugerido**: Start/Stop/Continue

**Salidas:**

- Lista de acciones de mejora
- Responsables asignados

### 5. Backlog Refinement

**Cuándo**: Mid-sprint (semana 1)
**Duración**: 1 hora
**Participantes**: PO + algunos desarrolladores

**Objetivo:**

- Preparar historias para próximo sprint
- Aclarar requisitos
- Estimaciones preliminares
- Dividir historias grandes

## Estimación

### Método: Story Points (Fibonacci)

**Escala**: 1, 2, 3, 5, 8, 13, 21

**Referencia:**

- **1 punto**: Cambio trivial, < 2 horas
- **2 puntos**: Tarea simple, ~ medio día
- **3 puntos**: Tarea estándar, ~1 día
- **5 puntos**: Tarea compleja, 2-3 días
- **8 puntos**: Feature pequeño, 3-5 días
- **13 puntos**: Feature medio - considerar dividir
- **21 puntos**: Épica - DEBE dividirse

### Técnica: Planning Poker

1. PO presenta historia
2. Equipo hace preguntas
3. Cada miembro elige estimación (en privado)
4. Todos revelan simultáneamente
5. Discutir discrepancias
6. Re-estimar hasta consenso

### Velocidad del Equipo

- Calcular promedio de puntos completados por sprint
- Usar como guía (no límite estricto) para planning
- Re-calcular cada 3 sprints

## Definition of Ready (DoR)

Una historia está lista para el sprint si:

- [ ] Tiene criterios de aceptación claros
- [ ] Tiene diseño/mockup si aplica
- [ ] Dependencias identificadas
- [ ] Estimada por el equipo
- [ ] Tamaño <= 8 puntos
- [ ] PO disponible para aclaraciones

## Definition of Done (DoD)

Una historia está completa cuando:

- [ ] Código escrito y funcional
- [ ] Tests unitarios escritos (>80% cobertura)
- [ ] Tests de integración si aplica
- [ ] Code review aprobado (al menos 1 aprobación)
- [ ] Documentación técnica actualizada
- [ ] Sin deuda técnica crítica
- [ ] Merged a rama principal
- [ ] Deployado a ambiente de staging
- [ ] Aceptado por PO

## Gestión del Backlog

### Estructura del Backlog

```
Backlog
├── Épicas
│   ├── Features
│   │   ├── User Stories
│   │   │   └── Tasks (técnicas)
```

### Priorización

**Método**: MoSCoW

- **Must Have**: Crítico para el release
- **Should Have**: Importante pero no bloqueante
- **Could Have**: Deseable si hay tiempo
- **Won't Have**: Fuera de scope actual

**Factores de Priorización:**

1. Valor para el usuario
2. Impacto social (misión de Amauta)
3. Dependencias técnicas
4. Esfuerzo estimado
5. Riesgo

### Formato de User Story

```markdown
## [Título descriptivo]

**Como** [tipo de usuario]
**Quiero** [acción/funcionalidad]
**Para** [beneficio/razón]

### Criterios de Aceptación

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

### Notas Técnicas

- Dependencias: [otras historias]
- API endpoints necesarios: [endpoints]
- Consideraciones: [cualquier contexto]

### Diseño

[Link a mockup/wireframe si aplica]

**Estimación**: [puntos]
**Prioridad**: [Must/Should/Could]
**Sprint**: [número o backlog]
```

## Gestión de Bugs

### Severidad

**Critical (P0):**

- Sistema caído o inutilizable
- Pérdida de datos
- Brecha de seguridad
- **Acción**: Fix inmediato, hotfix si está en producción

**High (P1):**

- Funcionalidad principal no funciona
- Workaround difícil o no existe
- **Acción**: Incluir en sprint actual

**Medium (P2):**

- Funcionalidad secundaria afectada
- Existe workaround razonable
- **Acción**: Priorizar en próximo sprint

**Low (P3):**

- Problema cosmético
- Edge case poco probable
- **Acción**: Backlog, resolver cuando haya tiempo

### Workflow de Bug

1. **Reportar**: Issue con template de bug
2. **Triage**: Equipo asigna severidad
3. **Priorizar**: PO decide cuándo resolver
4. **Asignar**: Desarrollador toma el bug
5. **Fix**: Implementar solución + test
6. **Verificar**: QA o reporter verifica
7. **Cerrar**: Marcar como resuelto

## Herramientas

### Recomendadas

**Project Management:**

- GitHub Projects (integrado con código)
- Jira (si se necesita más robustez)
- Linear (moderna y rápida)

**Comunicación:**

- Discord/Slack para chat
- GitHub Discussions para discusiones técnicas
- Google Meet/Zoom para videollamadas

**Documentación:**

- GitHub Wiki o Markdown en repo
- Notion (colaborativo)
- Confluence (si se usa Jira)

**Código:**

- GitHub para repositorio
- GitHub Actions para CI/CD

## Métricas

### Por Sprint

- **Velocity**: Puntos completados
- **Commitment accuracy**: % de compromisos cumplidos
- **Bugs introducidos**: Cantidad de bugs nuevos
- **Cycle time**: Tiempo de historia en progreso

### Globales

- **Lead time**: Tiempo desde idea hasta producción
- **Deployment frequency**: Frecuencia de deploys
- **MTTR**: Mean time to recovery (tras incidente)
- **Code coverage**: % cobertura de tests

### No Medir

- Horas trabajadas (confiamos en el equipo)
- Cantidad de commits (calidad > cantidad)
- Lines of code (no correlaciona con valor)

## Buenas Prácticas

### 1. Mantener Sprints Enfocados

- Un objetivo claro por sprint
- Evitar cambios mid-sprint
- Terminar historias antes de empezar nuevas

### 2. Comunicación Proactiva

- Comunicar bloqueos inmediatamente
- Pedir ayuda cuando se necesita
- Compartir conocimiento

### 3. Trabajo en Equipo

- Pair programming para tareas complejas
- Code reviews constructivos
- Celebrar éxitos juntos

### 4. Balance Técnico

- 20% del sprint para deuda técnica
- Refactoring continuo
- No sacrificar calidad por velocidad

### 5. Aprendizaje Continuo

- Postmortems sin culpa tras incidentes
- Compartir aprendizajes en retrospectivas
- Documentar decisiones técnicas

## Adaptaciones para Open Source

Si Amauta crece como proyecto open source:

### Contribuidores Externos

- Issues marcados como "good first issue"
- Guía de contribución clara
- Templates para PRs
- Code of conduct

### Comunicación Async

- Preferir comunicación escrita y pública
- Documentar decisiones
- Ser inclusivo con diferentes zonas horarias

### Transparencia

- Roadmap público
- Plannings documentados
- Decisiones explicadas

## Recursos

- [Scrum Guide](https://scrumguides.org/)
- [Agile Manifesto](https://agilemanifesto.org/)
- [Shape Up (Basecamp)](https://basecamp.com/shapeup)
