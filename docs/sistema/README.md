# Sistema Amauta - Guía General

> Documentación orientada a entender el sistema, no a configurarlo.
> Para documentación técnica, ver `docs/technical/`.

## ¿Qué es Amauta?

Amauta es una **plataforma educativa** para la gestión del aprendizaje, diseñada para instituciones educativas argentinas. Permite gestionar cursos, estudiantes, calificaciones y comunicación institucional.

El nombre "Amauta" proviene del quechua y significa "maestro" o "sabio".

## Funcionalidades del Sistema

### Implementadas

| Módulo           | Documento                              | Estado         | Descripción                     |
| ---------------- | -------------------------------------- | -------------- | ------------------------------- |
| Autenticación    | [autenticacion.md](autenticacion.md)   | ✅ Funcional   | Login, registro de usuarios     |
| Roles y Permisos | [roles-permisos.md](roles-permisos.md) | ✅ Funcional   | Control de acceso por rol       |
| Datos de Prueba  | [seed/](seed/README.md)                | ✅ Cargados    | Usuarios, cursos, inscripciones |
| Currícula NAP    | [curricula-nap.md](curricula-nap.md)   | ✅ Documentado | Alineación curricular argentina |

### En Desarrollo

| Módulo                                            | Estado           | Sprint   |
| ------------------------------------------------- | ---------------- | -------- |
| Gestión de Cursos                                 | ✅ Funcional     | Sprint 1 |
| Catálogo de Cursos                                | ✅ Funcional     | Sprint 2 |
| Inscripciones                                     | ✅ Funcional     | Sprint 3 |
| UI Inscripción y Mis Cursos                       | ✅ Funcional     | Sprint 4 |
| Visualizador de Lecciones                         | ✅ Funcional     | Sprint 4 |
| Progreso de Estudiantes                           | ✅ Funcional     | Sprint 4 |
| Marcar Lecciones Completadas                      | ✅ Funcional     | Sprint 4 |
| Dashboard de Estudiante                           | ✅ Funcional     | Sprint 4 |
| Instalabilidad PWA                                | ✅ Funcional     | Sprint 5 |
| Service Worker PWA (caché)                        | ✅ Funcional     | Sprint 5 |
| Base de datos offline (IDB)                       | ✅ Funcional     | Sprint 5 |
| Descarga offline de cursos                        | ✅ Funcional     | Sprint 5 |
| Cache de videos offline                           | ✅ Funcional     | Sprint 5 |
| Sync offline + Background Sync                    | ✅ Funcional     | Sprint 5 |
| UI estado offline + almacenamiento                | ✅ Funcional     | Sprint 6 |
| Tests offline + Lighthouse PWA                    | ✅ Funcional     | Sprint 7 |
| Evaluaciones y certificaciones (flujos definidos) | 📋 Planificación | Sprint 8 |

## Roles del Sistema

| Rol               | Descripción                   | Puede hacer                                                    |
| ----------------- | ----------------------------- | -------------------------------------------------------------- |
| **SUPER_ADMIN**   | Administrador global          | Todo. Gestiona el sistema completo.                            |
| **ADMIN_ESCUELA** | Director/Admin de institución | Gestionar su institución, grupos, comunicados.                 |
| **EDUCADOR**      | Profesor/Docente              | Crear cursos, lecciones, ver progreso de estudiantes.          |
| **ESTUDIANTE**    | Alumno                        | Inscribirse a cursos, completar lecciones, ver calificaciones. |

Ver [roles-permisos.md](roles-permisos.md) para detalle completo de permisos.

## Cómo Probar el Sistema

### URLs

| Entorno    | Frontend                      | Backend                           |
| ---------- | ----------------------------- | --------------------------------- |
| Producción | https://amauta.diazignacio.ar | https://amauta-api.diazignacio.ar |
| Local      | http://localhost:3000         | http://localhost:3001             |

### Usuarios de Prueba

Todos los usuarios usan la contraseña: `password123`

| Email                   | Rol           | Propósito        |
| ----------------------- | ------------- | ---------------- |
| superadmin@amauta.test  | SUPER_ADMIN   | Acceso total     |
| admin1@amauta.test      | ADMIN_ESCUELA | Escuela Belgrano |
| educador1@amauta.test   | EDUCADOR      | Crear cursos     |
| estudiante1@amauta.test | ESTUDIANTE    | Flujo estudiante |

Ver [seed/etapa-1-usuarios.md](seed/etapa-1-usuarios.md) para lista completa.

## Flujos Principales

### Flujo del Estudiante

1. Inicia sesión
2. Ve cursos disponibles
3. Se inscribe a un curso
4. Completa lecciones
5. Realiza evaluaciones
6. Ve su progreso y calificaciones

### Flujo del Educador

1. Inicia sesión
2. Crea un nuevo curso
3. Agrega lecciones (video, texto, quiz)
4. Publica el curso
5. Ve inscripciones y progreso
6. Califica a estudiantes

### Flujo del Administrador

1. Inicia sesión
2. Gestiona grupos de su institución
3. Registra asistencias
4. Publica comunicados
5. Ve reportes

## Arquitectura Simplificada

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│               (Next.js - PWA)                        │
│          amauta.diazignacio.ar                       │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND API                        │
│              (NestJS + Fastify)                      │
│        amauta-api.diazignacio.ar                     │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │     Redis       │
│  (Base datos)   │     │    (Caché)      │
└─────────────────┘     └─────────────────┘
```

## Glosario Rápido

| Término         | Significado                                                |
| --------------- | ---------------------------------------------------------- |
| **Curso**       | Contenido educativo organizado en lecciones                |
| **Lección**     | Unidad de contenido (video, texto, quiz)                   |
| **Inscripción** | Relación entre estudiante y curso                          |
| **Progreso**    | Avance del estudiante en las lecciones                     |
| **Grupo**       | Clase o división dentro de una institución                 |
| **NAP**         | Núcleos de Aprendizajes Prioritarios (currícula argentina) |

## Estructura de Esta Documentación

```
docs/sistema/
├── README.md           ← Esta guía general
├── curricula-nap.md    ← Alineación curricular NAP
├── autenticacion.md    ← Cómo funciona el login/registro
├── roles-permisos.md   ← Qué puede hacer cada rol
└── seed/               ← Datos de prueba (histórico)
    ├── README.md
    ├── etapa-1-usuarios.md
    ├── etapa-2-categorias.md
    ├── etapa-3-cursos.md
    ├── etapa-4-inscripciones.md
    └── etapa-5-administrativo.md
```

---

**Última actualización**: 16/03/2026
**Fase actual**: Fase 2 ✅ COMPLETADA (8/8) · Preparación Fase 3 completada (3/3)
