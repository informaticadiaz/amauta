# Product Backlog - Amauta

**Última actualización**: 2026-03-28
**Product Owner**: [Por definir]

## 🟢 Estado de Producción

| Servicio    | URL                               |
| ----------- | --------------------------------- |
| Frontend    | https://amauta.diazignacio.ar     |
| Backend API | https://amauta-api.diazignacio.ar |

**Fase 0**: ✅ Completada (30/12/2024)
**Fase 1**: ✅ Completada (16/16 issues completados)
**Fase 2**: ✅ Completada (8/8 issues completados)
**Fase 3**: ✅ Completada (Sprint 8-10 completados)
**Fase 4**: 🚧 En ejecución (Sprint 12 ✅, Sprint 13 ✅)

## Cómo usar este documento

Este backlog contiene todas las historias de usuario, épicas y tareas priorizadas para el desarrollo de Amauta. Las tareas se organizan por:

1. **Prioridad** (MoSCoW: Must/Should/Could/Won't)
2. **Fase** del roadmap
3. **Estimación** en story points
4. **Estado** (Backlog, Ready, In Progress, Done)

---

## Sprint 13 - Módulo Escolar (COMPLETADO)

**Objetivo**: Asignación de estudiantes y educadores a grupos.
**Referencia**: `docs/project-management/roadmap.md` → Fase 4

### Issues comprometidas (Sprint 13)

| Issue | Título                                                | Estado  |
| ----- | ----------------------------------------------------- | ------- |
| #72   | F4-007: API Asignación masiva de estudiantes a grupos | ✅ Done |
| #73   | F4-008: API Asignación de educadores a grupos         | ✅ Done |
| #74   | F4-009: UI Asignación de estudiantes y educadores     | ✅ Done |

## Sprint 12 - Módulo Escolar Base (COMPLETADO)

**Objetivo**: Base administrativa escolar (configuración + grupos).
**Referencia**: `docs/project-management/roadmap.md` → Fase 4

### Issues comprometidas (Sprint 12)

| Issue | Título                                                   | Estado  |
| ----- | -------------------------------------------------------- | ------- |
| #67   | F4-004: API Periodos Académicos + Escala de Calificación | ✅ Done |
| #68   | F4-005: API Gestión de Grupos/Clases (CRUD + estados)    | ✅ Done |
| #69   | F4-006: UI Gestión de Grupos/Clases (Listado + Form)     | ✅ Done |

## Sprint 11 - Preparación Fase 4 (COMPLETADO)

**Objetivo**: Preparar Fase 4 (Módulo Escolar) con historias, dependencias y flujos por rol.
**Referencia**: `docs/project-management/roadmap.md` → Fase 4

### Issues comprometidas (Sprint 11)

| Issue | Título                                                     | Estado  |
| ----- | ---------------------------------------------------------- | ------- |
| #64   | F4-001: Refinar historias y criterios de aceptación        | ✅ Done |
| #65   | F4-002: Matriz de dependencias UI/Backend (Fase 4)         | ✅ Done |
| #66   | F4-003: Diseño funcional de flujos administrativos (roles) | ✅ Done |

## Sprint 10 - Evaluaciones (COMPLETADO)

**Objetivo**: Publicación y detalle de evaluaciones para educadores.
**Referencia**: `docs/project-management/roadmap.md` → Fase 3

### Issues comprometidas (Sprint 10)

| Issue | Título                                            | Estado  |
| ----- | ------------------------------------------------- | ------- |
| #61   | F3-010: Endpoint publicar/despublicar evaluación  | ✅ Done |
| #62   | F3-011: UI detalle de evaluación (educador)       | ✅ Done |
| #63   | F3-012: UI toggle publicar/despublicar evaluación | ✅ Done |

## Sprint 9 - Evaluaciones (COMPLETADO)

**Objetivo**: Consolidar listado y detalle básico de evaluaciones para educadores.
**Referencia**: `docs/project-management/roadmap.md` → Fase 3

### Issues comprometidas (Sprint 9)

| Issue | Título                                                    | Estado  |
| ----- | --------------------------------------------------------- | ------- |
| #58   | F3-007: Endpoint listar evaluaciones por curso            | ✅ Done |
| #59   | F3-008: UI listado de evaluaciones (educador)             | ✅ Done |
| #60   | F3-009: Endpoint obtener detalle de evaluación (educador) | ✅ Done |

## Sprint 8 - Evaluaciones (COMPLETADO)

**Objetivo**: Iniciar Fase 3 con base técnica y UI mínima para evaluaciones.
**Referencia**: `docs/project-management/roadmap.md` → Fase 3

### Issues comprometidas (Sprint 8)

| Issue | Título                                       | Estado  |
| ----- | -------------------------------------------- | ------- |
| #55   | F3-004: Modelo base de Evaluaciones (Prisma) | ✅ Done |
| #56   | F3-005: Endpoint crear evaluación (educador) | ✅ Done |
| #57   | F3-006: UI básica de crear evaluación        | ✅ Done |

### Preparación Fase 3 (completada)

| Issue | Título                                                      | Estado  |
| ----- | ----------------------------------------------------------- | ------- |
| #52   | F3-001: Refinar historias y criterios de aceptación         | ✅ Done |
| #53   | F3-002: Matriz de dependencias UI/Backend para Evaluaciones | ✅ Done |
| #54   | F3-003: Diseño funcional de flujos de evaluación (roles)    | ✅ Done |

### Sprint 0 (Fase 0) - ✅ COMPLETADO

**Fechas**: 01/12/2024 - 30/12/2024
**Resultado**: Infraestructura base + Deployment en producción

Ver `docs/project-management/fase-0-tareas.md` para detalle completo.

---

## Backlog Priorizado

### FASE 0: Fundamentos (Sprint 0) - 89% Completado

#### Must Have (Crítico para completar Fase 0) ✅

| ID    | Historia/Tarea                     | Estimación | Estado  | Sprint   |
| ----- | ---------------------------------- | ---------- | ------- | -------- |
| T-001 | Configurar .gitignore              | 1          | ✅ Done | Sprint 0 |
| T-002 | Definir licencia del proyecto      | 1          | ✅ Done | Sprint 0 |
| T-005 | Configurar GitHub Actions para CI  | 5          | ✅ Done | Sprint 0 |
| T-006 | Configurar tests en CI             | 3          | ✅ Done | Sprint 0 |
| T-008 | Inicializar estructura de monorepo | 5          | ✅ Done | Sprint 0 |
| T-009 | Configurar TypeScript              | 3          | ✅ Done | Sprint 0 |
| T-010 | Configurar ESLint y Prettier       | 3          | ✅ Done | Sprint 0 |
| T-011 | Configurar variables de entorno    | 2          | ✅ Done | Sprint 0 |
| T-012 | Configurar PostgreSQL + Redis      | 3          | ✅ Done | Sprint 0 |
| T-013 | Configurar Prisma                  | 5          | ✅ Done | Sprint 0 |
| T-017 | Deployment en producción (Dokploy) | 8          | ✅ Done | Sprint 0 |
| T-018 | Servidor HTTP NestJS + Fastify     | 5          | ✅ Done | Sprint 0 |
| T-019 | Configurar Next.js en Frontend     | 5          | ✅ Done | Sprint 0 |

**Subtotal Must Have Fase 0**: 49 puntos (100% completados)

#### Should Have (Importante pero no bloqueante)

| ID     | Historia/Tarea                 | Estimación | Estado  | Sprint   |
| ------ | ------------------------------ | ---------- | ------- | -------- |
| T-003  | Crear Code of Conduct          | 2          | ✅ Done | Sprint 0 |
| T-004  | Crear Contributing Guidelines  | 3          | ✅ Done | Sprint 0 |
| T-007  | Configurar pre-commit hooks    | 3          | ✅ Done | Sprint 0 |
| T-014  | Crear seed data                | 3          | ✅ Done | Sprint 0 |
| T-014b | Expandir CI (lint, type-check) | 3          | ✅ Done | Sprint 0 |

**Subtotal Should Have Fase 0**: 14 puntos (8 completados, 6 pendientes)

#### Could Have (Deseable si hay tiempo)

| ID     | Historia/Tarea                             | Estimación | Estado  | Sprint   |
| ------ | ------------------------------------------ | ---------- | ------- | -------- |
| T-015  | Crear diagramas de arquitectura            | 3          | Backlog | Futuro   |
| T-016  | Documentar API endpoints (preparación)     | 2          | Backlog | Futuro   |
| DT-001 | Configurar Docker para desarrollo completo | 5          | ✅ Done | Sprint 0 |
| DT-002 | Configurar herramienta de monitoreo        | 3          | Backlog | Futuro   |

**Subtotal Could Have Fase 0**: 13 puntos (5 completados)

---

### FASE 1: MVP - Plataforma de Cursos Básica (Sprints 1-4)

#### Épica 1: Sistema de Autenticación y Usuarios

**Estimación total**: 21 puntos
**Prioridad**: Must Have
**Sprints**: 1-2

| ID     | Historia de Usuario                             | Estimación | Estado  | Sprint   |
| ------ | ----------------------------------------------- | ---------- | ------- | -------- |
| US-001 | Como usuario puedo registrarme en la plataforma | 5          | Backlog | Sprint 1 |
| US-002 | Como usuario puedo hacer login                  | 3          | Backlog | Sprint 1 |
| US-003 | Como usuario puedo recuperar mi contraseña      | 5          | Backlog | Sprint 1 |
| US-004 | Como usuario puedo ver y editar mi perfil       | 5          | Backlog | Sprint 1 |
| US-005 | Como usuario puedo cambiar mi contraseña        | 3          | Backlog | Sprint 2 |

#### Épica 2: Gestión de Cursos (Educador)

**Estimación total**: 34 puntos
**Prioridad**: Must Have
**Sprints**: 2-3

| ID     | Historia de Usuario                              | Estimación | Estado  | Sprint   |
| ------ | ------------------------------------------------ | ---------- | ------- | -------- |
| US-010 | Como educador puedo crear un curso               | 8          | Backlog | Sprint 2 |
| US-011 | Como educador puedo editar un curso              | 5          | Backlog | Sprint 2 |
| US-012 | Como educador puedo agregar lecciones a un curso | 8          | Backlog | Sprint 2 |
| US-013 | Como educador puedo publicar un curso            | 3          | Backlog | Sprint 3 |
| US-014 | Como educador puedo ver estadísticas de mi curso | 5          | Backlog | Sprint 3 |
| US-015 | Como educador puedo archivar un curso            | 2          | Backlog | Sprint 3 |
| US-016 | Como educador puedo agregar contenido multimedia | 3          | Backlog | Sprint 3 |

#### Épica 3: Catálogo y Navegación (Estudiante)

**Estimación total**: 26 puntos
**Prioridad**: Must Have
**Sprints**: 3-4

| ID     | Historia de Usuario                                | Estimación | Estado  | Sprint   |
| ------ | -------------------------------------------------- | ---------- | ------- | -------- |
| US-020 | Como estudiante puedo ver el catálogo de cursos    | 5          | Backlog | Sprint 3 |
| US-021 | Como estudiante puedo filtrar cursos por categoría | 3          | Backlog | Sprint 3 |
| US-022 | Como estudiante puedo buscar cursos                | 5          | Backlog | Sprint 3 |
| US-023 | Como estudiante puedo ver detalles de un curso     | 3          | Backlog | Sprint 3 |
| US-024 | Como estudiante puedo inscribirme en un curso      | 5          | Backlog | Sprint 4 |
| US-025 | Como estudiante puedo ver mis cursos inscritos     | 3          | Backlog | Sprint 4 |
| US-026 | Como estudiante puedo desinscribirme de un curso   | 2          | Backlog | Sprint 4 |

#### Épica 4: Consumo de Contenido

**Estimación total**: 29 puntos
**Prioridad**: Must Have
**Sprints**: 4

| ID     | Historia de Usuario                                     | Estimación | Estado  | Sprint   |
| ------ | ------------------------------------------------------- | ---------- | ------- | -------- |
| US-030 | Como estudiante puedo ver las lecciones de un curso     | 5          | Backlog | Sprint 4 |
| US-031 | Como estudiante puedo ver contenido de video            | 5          | Backlog | Sprint 4 |
| US-032 | Como estudiante puedo ver contenido de texto            | 3          | Backlog | Sprint 4 |
| US-033 | Como estudiante puedo marcar lecciones como completadas | 5          | Backlog | Sprint 4 |
| US-034 | Como estudiante puedo ver mi progreso en el curso       | 5          | Backlog | Sprint 4 |
| US-035 | Como estudiante puedo navegar entre lecciones           | 3          | Backlog | Sprint 4 |
| US-036 | Como estudiante puedo descargar recursos de la lección  | 3          | Backlog | Sprint 4 |

---

### FASE 2: Offline-First & PWA (Sprints 5-7)

**Estado**: ✅ Completada
**Prioridad**: Should Have

| ID     | Historia de Usuario                                    | Estimación | Estado  | Sprint   |
| ------ | ------------------------------------------------------ | ---------- | ------- | -------- |
| US-050 | Como estudiante puedo descargar un curso para offline  | 8          | Backlog | Sprint 5 |
| US-051 | Como estudiante puedo ver cursos sin conexión          | 5          | Backlog | Sprint 5 |
| US-052 | Como usuario mi progreso se sincroniza automáticamente | 8          | Backlog | Sprint 6 |
| US-053 | Como usuario puedo instalar Amauta como app            | 5          | Backlog | Sprint 6 |
| US-054 | Como usuario recibo notificaciones push                | 5          | Backlog | Sprint 7 |

---

### Épica Transversal: Contenido Curricular Argentino

**Estado**: En progreso (Análisis de estructura)
**Prioridad**: Could Have
**Issues**: #21 (épica), #22 (análisis de PDFs)
**Dependencias**: Puede desarrollarse en paralelo con otras fases

#### Contexto

Los NAP (Núcleos de Aprendizajes Prioritarios) son los contenidos curriculares mínimos obligatorios del sistema educativo argentino. Integrarlos permitirá alinear Amauta con la currícula oficial.

**Investigación completada** (ver `docs/technical/database.md` y `docs/nap/ANALISIS.md`):

- Fuente: educ.ar / argentina.gob.ar
- Formato: PDFs parseables (no existe API ni dataset estructurado)
- Cobertura: Inicial, Primaria (2 ciclos), Séptimo, Secundaria (2 ciclos), Transversales
- Documentos: **21 PDFs** catalogados
- Áreas: **10 disciplinas curriculares**

**Análisis de estructura** (Issue #22 - en progreso):

- Analizados: 4/21 PDFs (Inicial, Primaria 1er y 2do Ciclo, Séptimo Año)
- Identificados 2 tipos de estructura: Holística (Inicial) vs Disciplinar (Primaria+)
- Parseabilidad: Alta/Muy alta
- Detalles: `docs/nap/ANALISIS.md`

#### Tareas

| ID      | Tarea                                  | Estimación | Estado      | Sprint |
| ------- | -------------------------------------- | ---------- | ----------- | ------ |
| NAP-01  | Catalogar y descargar PDFs de NAP (21) | 2          | ✅ Done     | -      |
| NAP-01b | Analizar estructura de los 21 PDFs     | 3          | 🔄 Progress | -      |
| NAP-02  | Desarrollar parser PDF → JSON          | 5          | Backlog     | TBD    |
| NAP-03  | Diseñar modelo de datos curricular     | 3          | Backlog     | TBD    |
| NAP-04  | Mapear NAP → Categorías/Cursos         | 2          | Backlog     | TBD    |
| NAP-05  | Generar seed data alineado con NAP     | 3          | Backlog     | TBD    |
| NAP-06  | Documentar estructura curricular       | 2          | 🔄 Progress | -      |

**Estimación total**: 20 puntos (ajustado)

#### Referencias

- Issue #21 (épica): https://github.com/informaticadiaz/amauta/issues/21
- Issue #22 (análisis): https://github.com/informaticadiaz/amauta/issues/22
- Documentación NAP: `docs/nap/README.md` y `docs/nap/ANALISIS.md`
- NAP Oficial: https://www.argentina.gob.ar/educacion/nucleos-de-aprendizaje-prioritarios
- Colección: https://www.educ.ar/recursos/150199/

---

## Bugs y Issues

Actualmente no hay bugs reportados (proyecto en fase inicial).

### Template para reportar bugs

Cuando se encuentre un bug, agregarlo aquí con este formato:

| ID      | Descripción         | Severidad   | Estado                 | Asignado |
| ------- | ------------------- | ----------- | ---------------------- | -------- |
| BUG-XXX | [Descripción breve] | P0/P1/P2/P3 | Open/In Progress/Fixed | @usuario |

---

## Deuda Técnica

| ID     | Descripción                           | Estimación | Impacto | Estado  |
| ------ | ------------------------------------- | ---------- | ------- | ------- |
| DT-001 | Configurar Docker desarrollo completo | 5          | Medio   | Backlog |
| DT-002 | Configurar monitoreo de errores       | 3          | Alto    | Backlog |

---

## Métricas del Backlog

### Distribución por Prioridad

- **Must Have**: 110+ puntos
- **Should Have**: 31+ puntos
- **Could Have**: 30+ puntos (incluye NAP: 17 puntos)

### Distribución por Fase

- **Fase 0**: ✅ Completada
- **Fase 1**: ✅ Completada
- **Fase 2**: ✅ Completada
- **Fase 3**: ✅ Completada (Sprint 8-10 completados)
- **Épica Transversal NAP**: 🔄 En progreso

### Backlog Health

- **Done**: Fases 0, 1, 2, 3 completadas + Sprints 12 y 13 de Fase 4
- **Ready for Development**: definir Sprint 14 / siguiente bloque de Fase 4
- **Needs Refinement**: 0 items
- **Research Done**: 1 item (NAP #21 - investigación completada)
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

### Para Fase 4

1. Definir el alcance y las issues del Sprint 14 para continuar Fase 4
2. Actualizar el roadmap detallado de Fase 4 con el siguiente bloque priorizado

---

## Notas

- Este backlog es un documento vivo que se actualiza constantemente
- Las estimaciones pueden cambiar durante el refinamiento
- Las prioridades pueden ajustarse según feedback de usuarios
- Nuevas historias pueden agregarse en cualquier momento

**Última revisión**: 28/03/2026
**Próxima revisión**: Inicio de Sprint 14
