# Roadmap - Amauta

## Visión General

Este roadmap establece la estrategia de desarrollo de Amauta en fases incrementales, priorizando funcionalidad básica primero y agregando complejidad de manera gradual.

## Principio de Desarrollo

**MVP → Iteración → Escala**

Cada fase entrega valor usable antes de pasar a la siguiente.

---

## Fase 0: Fundamentos (Actual - 53% Completado)

**Duración estimada**: 2 semanas
**Progreso**: 9/17 tareas completadas

### Objetivos

- Establecer bases del proyecto
- Configurar infraestructura de desarrollo
- Documentación inicial

### Entregables

- [x] Estructura de proyecto (Turborepo con monorepo)
- [x] Documentación técnica base
- [x] Documentación de gestión
- [x] Configuración de repositorio (.gitignore, licencia, código de conducta)
- [x] CI/CD pipeline básico (GitHub Actions con placeholders)
- [x] TypeScript configurado con strict mode
- [x] ESLint y Prettier configurados
- [ ] Pre-commit hooks (pendiente)
- [ ] Variables de entorno (pendiente)
- [ ] PostgreSQL y Prisma (pendiente)
- [ ] Entorno de desarrollo documentado (en progreso)

---

## Fase 1: MVP - Plataforma de Cursos Básica

**Duración estimada**: 6-8 semanas
**Sprint 1-4**

### Objetivos

Crear plataforma funcional donde educadores puedan publicar cursos y estudiantes consumirlos.

### Historias de Usuario Principales

#### Como Educador

- Puedo registrarme en la plataforma
- Puedo crear un curso con título, descripción e imagen
- Puedo agregar lecciones de texto y video
- Puedo publicar mi curso

#### Como Estudiante

- Puedo registrarme en la plataforma
- Puedo navegar el catálogo de cursos
- Puedo inscribirme en un curso
- Puedo ver las lecciones del curso
- Puedo marcar lecciones como completadas

### Funcionalidades Técnicas

- Autenticación y autorización (NextAuth.js)
- CRUD de cursos
- CRUD de lecciones
- Sistema de inscripción
- Seguimiento básico de progreso
- UI responsive

### Entregables

- Frontend con Next.js desplegado
- Backend API funcional
- Base de datos PostgreSQL configurada
- Autenticación implementada
- 5+ cursos de demostración

### Criterios de Éxito

- Un educador puede crear y publicar un curso completo
- Un estudiante puede completar un curso de principio a fin
- La aplicación funciona en móvil y desktop

---

## Fase 2: Offline-First & PWA

**Duración estimada**: 4-6 semanas
**Sprint 5-7**

### Objetivos

Habilitar funcionalidad offline para acceso sin conexión.

### Historias de Usuario

#### Como Estudiante

- Puedo descargar un curso para verlo sin conexión
- Puedo ver mis lecciones descargadas sin internet
- Mi progreso se sincroniza automáticamente cuando recupero conexión
- Puedo instalar Amauta como app en mi dispositivo

### Funcionalidades Técnicas

- Service Worker con Workbox
- IndexedDB para almacenamiento local
- Sincronización en background (Background Sync API)
- Gestión de conflictos de sincronización
- PWA manifest y configuración
- Descarga selectiva de contenido

### Entregables

- PWA instalable
- Sistema de caché offline funcional
- UI para gestionar descargas
- Indicadores de estado de sincronización

### Criterios de Éxito

- Usuario puede descargar curso completo
- Usuario puede estudiar 100% offline
- Progreso se sincroniza al reconectar
- PWA instalable en Android/iOS/Desktop

---

## Fase 3: Evaluaciones y Certificaciones

**Duración estimada**: 4-5 semanas
**Sprint 8-10**

### Objetivos

Agregar sistema de evaluación y certificación de conocimientos.

### Historias de Usuario

#### Como Educador

- Puedo crear quizzes y exámenes
- Puedo definir criterios de aprobación
- Puedo ver estadísticas de rendimiento de estudiantes

#### Como Estudiante

- Puedo realizar evaluaciones dentro de los cursos
- Puedo ver mi puntaje y feedback inmediato
- Puedo obtener un certificado al completar un curso
- Puedo descargar/compartir mi certificado

### Funcionalidades Técnicas

- Tipos de pregunta: múltiple opción, verdadero/falso, respuesta corta
- Sistema de calificación automática
- Generación de certificados (PDF)
- Almacenamiento de resultados históricos
- Dashboard de estadísticas para educadores

### Entregables

- Editor de evaluaciones
- Motor de calificación
- Sistema de certificados
- Dashboard de analytics básico

### Criterios de Éxito

- Educador puede crear evaluación completa
- Estudiante puede completar y aprobar
- Certificado generado y descargable

---

## Fase 4: Módulo Administrativo Escolar

**Duración estimada**: 6-8 semanas
**Sprint 11-14**

### Objetivos

Implementar funcionalidades para gestión administrativa de instituciones educativas.

### Historias de Usuario

#### Como Administrador Escolar

- Puedo crear y gestionar grupos/clases
- Puedo asignar estudiantes a grupos
- Puedo registrar asistencias diarias
- Puedo cargar calificaciones de evaluaciones
- Puedo publicar comunicados a estudiantes/apoderados
- Puedo generar reportes de asistencia y rendimiento

#### Como Educador de Institución

- Puedo ver la lista de mis grupos
- Puedo tomar asistencia fácilmente
- Puedo ingresar notas de evaluaciones

#### Como Estudiante/Apoderado

- Puedo ver mi historial de asistencias
- Puedo ver mis calificaciones
- Puedo recibir comunicados de la institución

### Funcionalidades Técnicas

- Modelo multi-tenant (instituciones)
- Sistema de asistencias con estados
- Registro de calificaciones por periodo
- Sistema de comunicados con prioridades
- Generador de reportes (PDF/Excel)
- Calendario académico

### Entregables

- Dashboard administrativo
- Interfaz de asistencia rápida
- Sistema de calificaciones
- Centro de comunicados
- Reportes básicos

### Criterios de Éxito

- Escuela puede gestionar 100+ estudiantes
- Asistencia registrable en < 2 minutos por grupo
- Reportes generables en tiempo real

---

## Fase 5: Comunidad y Colaboración

**Duración estimada**: 5-6 semanas
**Sprint 15-17**

### Objetivos

Crear espacios de interacción entre estudiantes y educadores.

### Historias de Usuario

#### Como Usuario

- Puedo participar en foros de discusión del curso
- Puedo hacer preguntas al educador
- Puedo colaborar con otros estudiantes
- Puedo enviar mensajes directos
- Puedo unirme a grupos de estudio

### Funcionalidades Técnicas

- Sistema de foros por curso
- Mensajería interna
- Notificaciones en tiempo real (WebSocket)
- Grupos de estudio
- Sistema de moderación

### Entregables

- Foros integrados en cursos
- Chat/mensajería
- Sistema de notificaciones
- Panel de moderación

---

## Fase 6: Búsqueda y Recomendaciones

**Duración estimada**: 4-5 semanas
**Sprint 18-20**

### Objetivos

Mejorar descubrimiento de contenido.

### Funcionalidades

- Búsqueda full-text avanzada
- Filtros (categoría, nivel, duración, idioma)
- Sistema de recomendaciones basado en historial
- Tags y etiquetas
- Cursos relacionados

### Tecnología

- PostgreSQL Full-Text Search
- Algoritmo de recomendación básico
- Elasticsearch (opcional, futuro)

---

## Fase 7: Multimedia y Contenido Rico

**Duración estimada**: 4-6 semanas
**Sprint 21-23**

### Objetivos

Expandir tipos de contenido soportados.

### Funcionalidades

- Upload y streaming de video optimizado
- Editor de texto rico (Markdown/WYSIWYG)
- Contenido interactivo (H5P)
- Infografías y presentaciones
- Podcasts/audio
- Live streaming (futuro)

### Tecnología

- Transcodificación de video
- CDN para multimedia
- H5P o similar para interactivos

---

## Fase 8: Internacionalización

**Duración estimada**: 3-4 semanas
**Sprint 24-25**

### Objetivos

Soporte multi-idioma completo.

### Funcionalidades

- Interfaz en español, inglés
- Soporte para idiomas originarios (quechua, aymara, guaraní)
- Sistema de traducciones colaborativas
- Contenido multi-idioma

### Tecnología

- next-intl o react-i18next
- Base de datos de traducciones
- Herramientas de colaboración (Crowdin)

---

## Fase 9: Analytics y Reportes Avanzados

**Duración estimada**: 4-5 semanas
**Sprint 26-28**

### Funcionalidades

- Dashboard de analytics para educadores
- Métricas de engagement
- Reportes personalizables
- Exportación de datos
- Visualizaciones avanzadas

### Tecnología

- Charts con Recharts/Chart.js
- Data warehouse opcional
- BI básico

---

## Fase 10: Optimización y Escala

**Duración estimada**: Continua

### Objetivos

- Performance optimization
- Escalabilidad horizontal
- Monitoreo y observabilidad
- Seguridad hardening
- Accesibilidad WCAG 2.1 AA

---

## Backlog Futuro (Post-MVP)

### Funcionalidades Avanzadas

- Gamificación (badges, puntos, leaderboards)
- Integración con LMS externos (Moodle, Canvas)
- API pública para integraciones
- Marketplace de cursos
- Pagos y monetización (opcional)
- Mobile apps nativas
- Videoconferencia integrada
- IA para tutoría personalizada
- Blockchain para certificados verificables

### Infraestructura

- Microservicios
- Kubernetes
- Multi-región
- GraphQL API

---

## Métricas de Progreso

### Por Fase

- Historias de usuario completadas
- Tests passed
- Bugs críticos resueltos
- Performance benchmarks

### Globales

- Cobertura de código
- Tiempo de respuesta API
- Disponibilidad (uptime)
- Usuarios activos

---

## Flexibilidad

Este roadmap es un plan vivo que se ajustará según:

- Feedback de usuarios
- Prioridades de stakeholders
- Restricciones técnicas o de recursos
- Oportunidades emergentes

## Revisión

Revisar roadmap cada 3 sprints (6 semanas) para ajustar prioridades.

---

## Dependencias Externas

- Hosting y dominio
- Servicios de email (SendGrid, AWS SES)
- Almacenamiento multimedia (AWS S3, Cloudflare R2)
- CDN (Cloudflare, AWS CloudFront)

---

**Última actualización**: 2024-12-18
**Próxima revisión**: Sprint 3
