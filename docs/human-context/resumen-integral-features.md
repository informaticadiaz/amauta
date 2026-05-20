# Resumen integral de funcionalidades — Amauta

**Fecha de generación**: 2026-05-20
**Fuente**: 102 issues (GitHub) + roadmap
**Estado del proyecto**: Fase 7 en curso · Fase 4c planificada

> Amauta es un sistema educativo offline-first para la gestión del aprendizaje.
> _"No concebimos la educación como un producto, sino como un derecho social."_

---

## Índice

1. [Fase 0 — Fundamentos](#fase-0--fundamentos-)
2. [Fase 1 — MVP Plataforma de Cursos](#fase-1--mvp-plataforma-de-cursos-)
3. [Fase 2 — Offline-First & PWA](#fase-2--offline-first--pwa-)
4. [Fase 3 — Evaluaciones](#fase-3--evaluaciones-)
5. [Fase 4 — Módulo Administrativo Escolar](#fase-4--módulo-administrativo-escolar-)
6. [Fase 4b — Módulo Escolar Gaps](#fase-4b--módulo-escolar-gaps-)
7. [Fase 5 — Comunidad y Colaboración](#fase-5--comunidad-y-colaboración-)
8. [Fase 6 — Búsqueda y Descubrimiento](#fase-6--búsqueda-y-descubrimiento-)
9. [Fase 7 — Multimedia y Contenido Rico](#fase-7--multimedia-y-contenido-rico-)
10. [Fase 4c — Administración Avanzada](#fase-4c--administración-avanzada-)
11. [Iniciativas Transversales](#iniciativas-transversales)
12. [Resumen por rol de usuario](#resumen-por-rol-de-usuario)

---

## Fase 0 — Fundamentos ✅

**Issues**: #2–#27 · **26 issues cerrados**

Infraestructura base del monorepo. Sin esta fase no existe el proyecto.

| Funcionalidad | Descripción |
|---|---|
| **Monorepo Turborepo** | `apps/web` (Next.js), `apps/api` (NestJS + Fastify), `packages/shared`, `packages/types` |
| **TypeScript strict** | Strict mode en todo el proyecto |
| **Calidad de código** | ESLint + Prettier + Husky pre-commit hooks |
| **Variables de entorno** | Validación con Zod en arranque |
| **Base de datos** | PostgreSQL 15 + Redis 7 |
| **ORM** | Prisma con schema inicial (15 modelos) |
| **CI** | GitHub Actions: lint, type-check, build y tests |
| **CD** | Deploy automático a VPS con Dokploy webhook |
| **Seed data** | Usuarios, instituciones, cursos, lecciones, asistencias, calificaciones |

---

## Fase 1 — MVP Plataforma de Cursos ✅

**Issues**: #28–#43 · **16 issues cerrados**

El núcleo pedagógico: crear y consumir cursos.

| Funcionalidad | Descripción |
|---|---|
| **Autenticación** | Registro/login con NextAuth.js, sesiones JWT |
| **Autorización RBAC** | 4 roles: `SUPER_ADMIN`, `ADMIN_ESCUELA`, `EDUCADOR`, `ESTUDIANTE` |
| **Layout responsive** | Navegación, header y footer — móvil y desktop |
| **CRUD de cursos** | Crear, editar, publicar y archivar cursos con imagen de portada |
| **CRUD de lecciones** | Lecciones de texto y video dentro de cursos |
| **Subida de imágenes** | Portadas de cursos |
| **Catálogo público** | Explorar y buscar cursos disponibles |
| **Detalle de curso** | Info completa + botón de inscripción |
| **Sistema de inscripción** | Estudiantes se inscriben en cursos |
| **Visualizador de lecciones** | Estudiantes consumen contenido de lecciones |
| **Seguimiento de progreso** | Marcar lecciones completadas, % de avance por curso |
| **Dashboard del estudiante** | Resumen de actividad, cursos activos y recomendados |

### Historias de usuario cumplidas

**Como Educador:**
- Puedo registrarme, crear un curso con título/descripción/imagen y publicarlo
- Puedo agregar lecciones de texto y video

**Como Estudiante:**
- Puedo explorar el catálogo, inscribirme, ver lecciones y marcarlas completadas
- Puedo ver mi progreso y mis cursos desde un dashboard propio

---

## Fase 2 — Offline-First & PWA ✅

**Issues**: #44–#51 · **8 issues cerrados**

La app funciona sin internet — crítico para zonas con conectividad limitada.

| Funcionalidad | Descripción |
|---|---|
| **PWA instalable** | Manifest, íconos maskable, instalación en Android/iOS/Desktop |
| **Service Worker (Workbox)** | NetworkFirst para API, CacheFirst para imágenes y videos |
| **IndexedDB con Dexie** | Almacenamiento local: cursos, lecciones, progreso y cola de sync |
| **Descarga de cursos** | Botón de descarga con barra de progreso; gestión de espacio utilizado |
| **Cache de videos offline** | Videos descargados vía Cache API, reproducción sin conexión |
| **Background Sync** | Cola de operaciones pendientes que se sincronizan al reconectar |
| **UI de estado offline** | Hook `useNetworkStatus`, banner global, indicador de espacio |
| **Resolución de conflictos** | Last-Write-Wins por timestamp; si igual, gana el progreso mayor |

### Criterios cumplidos

- Curso descargable en menos de 2 minutos
- Estudio 100% offline sin errores
- Progreso sincronizado al reconectar en menos de 10 segundos
- Lighthouse PWA score > 90
- Funciona en modo avión

---

## Fase 3 — Evaluaciones ✅

**Issues**: #52–#63 · **12 issues cerrados**

Sistema de evaluación, calificación automática y certificados.

| Funcionalidad | Descripción |
|---|---|
| **Crear evaluaciones** | Educador define título, puntaje mínimo, intentos máximos, tiempo límite |
| **6 tipos de preguntas** | Opción múltiple, selección múltiple, V/F, respuesta corta, ensayo (revisión manual), emparejamiento |
| **Calificación automática** | Puntaje inmediato para todos los tipos excepto ensayo |
| **Puntaje parcial** | Selección múltiple soporta penalización y puntaje proporcional |
| **Publicar/despublicar** | Control de visibilidad de evaluaciones por el educador |
| **Intentos y feedback** | Historial de intentos, feedback por respuesta, revisión post-examen |
| **Revisión manual** | Cola de revisión para ensayo con rúbrica/criterios |
| **Certificados PDF** | Generados con PDFKit, descargables, verificables públicamente por ID |
| **Analytics de evaluaciones** | Tasa de aprobación, tiempo promedio, preguntas más difíciles |
| **Anti-cheating básico** | Detección de cambio de pestaña, registro en servidor |

### Tipos de pregunta en detalle

| Tipo | Calificación | Notas |
|---|---|---|
| `MULTIPLE_CHOICE` | Automática | Exactamente 1 correcta; feedback por opción |
| `MULTIPLE_SELECT` | Automática | Puntaje parcial opcional |
| `TRUE_FALSE` | Automática | Explicación opcional |
| `SHORT_ANSWER` | Automática | Múltiples respuestas válidas, case-sensitive configurable |
| `ESSAY` | Manual | Requiere revisión del educador; rúbrica visible |
| `MATCHING` | Automática | Pares mezclados; puntaje completo o cero |

---

## Fase 4 — Módulo Administrativo Escolar ✅

**Issues**: #64–#81 · **19 issues cerrados**

Gestión institucional completa: grupos, asistencias, calificaciones.

| Funcionalidad | Descripción |
|---|---|
| **Periodos académicos** | Bimestres, trimestres, semestres configurables por institución |
| **Escala de calificación** | Numérica, literal o conceptual (AD/A/B/C); umbral de aprobación |
| **CRUD de grupos/clases** | Crear grupos con grado, turno, ciclo lectivo; activar/desactivar |
| **Asignación masiva de estudiantes** | Carga bulk con preview de altas/duplicados/errores antes de confirmar |
| **Asignación de educadores** | Rol titular/suplente por grupo; validación de pertenencia institucional |
| **Listado paginado** | Búsqueda de estudiantes y educadores por institución |
| **Asistencia diaria** | Registro rápido por grupo: Presente/Ausente/Tardanza/Justificado |
| **Resumen mensual de asistencias** | Métricas agregadas por grupo y mes |
| **Calificaciones por periodo** | Carga masiva por grupo/materia/periodo con validación de escala |
| **Comunicados institucionales** | Prioridades Baja/Normal/Alta/Urgente; segmentación por audiencia |
| **Reportes de rendimiento** | Por grupo/periodo, exportación CSV, % asistencia y promedios |
| **Multi-tenant** | Datos aislados por institución; middleware de tenant en cada request |

### Estados de asistencia

`PRESENTE` · `AUSENTE` · `TARDANZA` · `JUSTIFICADO`

### Tipos de comunicado

`GENERAL` · `ACADEMICO` · `ADMINISTRATIVO` · `EVENTO` · `URGENTE`

---

## Fase 4b — Módulo Escolar Gaps ✅

**Issues**: #101–#104 · **4 issues cerrados**

Completar la vista del estudiante y funciones que faltaron en Fase 4.

| Issue | Funcionalidad | Descripción |
|---|---|---|
| #101 | **Vista del estudiante** | Endpoints de calificaciones y asistencias propios del rol ESTUDIANTE |
| #102 | **Boletín descargable** | Impresión del navegador sin librería PDF externa |
| #103 | **Comunicados completos** | Módulo NestJS + páginas UI (modelo Prisma ya existía) |
| #104 | **Reportes admin** | Panel para ADMIN_ESCUELA y EDUCADOR con métricas y exportación CSV |

---

## Fase 5 — Comunidad y Colaboración ✅

**Issues**: #83–#92 · **10 issues cerrados**

Foros por curso, interacciones sociales y notificaciones.

| Funcionalidad | Descripción |
|---|---|
| **Foros por curso** | Posts de tipo Pregunta, Anuncio, Debate |
| **Respuestas anidadas** | Threading de respuestas a posts |
| **Marcar solución** | Educador o autor marca una respuesta como solución definitiva |
| **Reacción "útil"** | Una vez por usuario por respuesta; anti-spam integrado |
| **Filtros por etiqueta** | Filtrar posts del foro por etiqueta |
| **Moderación** | Cerrar/eliminar posts; estados: `PUBLICADO`, `CERRADO`, `ELIMINADO` |
| **Notificaciones** | Nueva respuesta y solución marcada; reglas anti-spam |
| **UI completa del foro** | Listado de posts, detalle con respuestas, formulario de nuevo post |

### Modelos Prisma creados en esta fase

`ForoPost` · `ForoRespuesta` · `ReaccionForo` · `Notificacion`

---

## Fase 6 — Búsqueda y Descubrimiento ✅

**Issues**: #93–#95 · **3 issues cerrados**

Encontrar cursos de forma eficiente.

| Funcionalidad | Descripción |
|---|---|
| **Diseño funcional previo** | Issue #93 definió comportamiento antes de implementar |
| **Búsqueda full-text** | Endpoint con full-text search en PostgreSQL |
| **Filtros del catálogo** | Categoría, nivel, estado; paginación incluida |
| **UI de búsqueda** | Barra de búsqueda, filtros laterales, estados claros (cargando/sin resultados/error) |

---

## Fase 7 — Multimedia y Contenido Rico 🔄

**Issues**: #97–#100 · **2 cerrados, 2 abiertos**

Lecciones más ricas: texto formateado, video/audio, contenido interactivo.

| Issue | Funcionalidad | Estado |
|---|---|---|
| #97 | **Diseño funcional** — estrategia técnica por tipo (storage, players, librerías) | ✅ Cerrado |
| #98 | **Editor de texto rico** — reemplaza el textarea básico; editor WYSIWYG/Markdown con renderizado correcto | ✅ Cerrado |
| #99 | **Upload y reproducción de video/audio** — drag & drop con barra de progreso; video player + audio player para estudiantes | 🔴 Abierto |
| #100 | **Contenido H5P interactivo** — embed desde URL externa (h5p.org, Lumi); iframe sandboxed; whitelist de dominios | 🔴 Abierto |

### Detalle de issue #99 (abierto)

- Endpoint `POST /lecciones/:id/media` con validación de MIME y tamaño
- Storage provider definido en #97 (Cloudflare R2 / S3 / Bunny.net)
- Componente de upload con drag & drop y barra de progreso
- Video player y audio player integrados en la vista del estudiante
- Endpoint `DELETE /lecciones/:id/media` para eliminar

### Detalle de issue #100 (abierto)

- Campo de URL H5P en formulario de lección (solo visible si `tipoLeccion === 'INTERACTIVO'`)
- Whitelist de dominios: `h5p.org`, `lumi.education` (otros a confirmar)
- Iframe con `sandbox="allow-scripts allow-same-origin allow-forms"`
- Fallback si el contenido no carga

---

## Fase 4c — Administración Avanzada ⏳

**0/9 issues iniciados** · Sprint 21-23

**F4c-001 debe implementarse primero** — es una migración de modelo de datos (materias como catálogo) de la que dependen F4c-003, F4c-004 y F4c-005.

| Issue | Funcionalidad | Dependencias |
|---|---|---|
| **F4c-001** | **Catálogo de materias** + migración de calificaciones | — (bloqueante para 003/004/005) |
| **F4c-002** | **Matrícula formal** — inscripción del estudiante a la institución | — |
| **F4c-003** | **Historial académico** — trayectoria entre periodos | F4c-001 |
| **F4c-004** | **Horarios semanales** por grupo | F4c-001 |
| **F4c-005** | **Cierre de ciclo lectivo** y promoción masiva | F4c-001 |
| **F4c-006** | **Alertas automáticas**: asistencia baja y notas en riesgo | — |
| **F4c-007** | **Rol tutor/padre**: acceso al seguimiento de su hijo | — |
| **F4c-008** | **Justificación formal de ausencias** | — |
| **F4c-009** | **Calendario institucional** | — |

---

## Iniciativas Transversales

| Iniciativa | Issues | Estado | Descripción |
|---|---|---|---|
| **Integración NAP** | #21, #22 | ✅ Cerrado | Análisis de los 21 PDFs de Núcleos de Aprendizajes Prioritarios del currículo argentino |
| **IA Educativa** | #89 | ✅ Cerrado (futura) | Tutor inteligente open source, diseñado para hardware escolar típico, capacidad offline-first |

---

## Resumen por rol de usuario

| Rol | Capacidades principales |
|---|---|
| **ESTUDIANTE** | Explorar catálogo · Inscribirse en cursos · Consumir lecciones (texto, video, H5P) · Hacer evaluaciones · Ver progreso/asistencia/calificaciones · Descargar boletín · Participar en foros · Usar la app sin internet |
| **EDUCADOR** | Crear/publicar cursos y lecciones · Subir media · Usar editor de texto rico · Crear evaluaciones · Tomar asistencia · Cargar calificaciones · Publicar comunicados · Ver analytics |
| **ADMIN_ESCUELA** | Gestionar grupos · Asignar estudiantes y educadores · Configurar periodos y escala de calificación · Generar reportes · Publicar comunicados · Ver métricas institucionales |
| **SUPER_ADMIN** | Acceso total al sistema |

---

## Estado global del proyecto

| Fase | Nombre | Issues | Estado |
|---|---|---|---|
| 0 | Fundamentos | #2–#27 | ✅ Completada |
| 1 | MVP Cursos | #28–#43 | ✅ Completada |
| 2 | Offline-First PWA | #44–#51 | ✅ Completada |
| 3 | Evaluaciones | #52–#63 | ✅ Completada |
| 4 | Módulo Escolar | #64–#81 | ✅ Completada |
| 4b | Módulo Escolar gaps | #101–#104 | ✅ Completada |
| 5 | Comunidad | #83–#92 | ✅ Completada |
| 6 | Búsqueda | #93–#95 | ✅ Completada |
| 7 | Multimedia | #97–#100 | 🔄 En curso (2/4) |
| 4c | Administración avanzada | F4c-001–009 | ⏳ Planificada |

**Total**: 100 issues cerrados · 2 issues abiertos · 9 issues planificados
