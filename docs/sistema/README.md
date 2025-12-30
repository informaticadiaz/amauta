# Sistema Amauta - Guía General

> Documentación orientada a entender el sistema, no a configurarlo.
> Para documentación técnica, ver `docs/technical/`.

## ¿Qué es Amauta?

Amauta es una **plataforma educativa** para la gestión del aprendizaje, diseñada para instituciones educativas argentinas. Permite gestionar cursos, estudiantes, calificaciones y comunicación institucional.

El nombre "Amauta" proviene del quechua y significa "maestro" o "sabio".

## Roles del Sistema

| Rol               | Descripción                   | Puede hacer                                                    |
| ----------------- | ----------------------------- | -------------------------------------------------------------- |
| **SUPER_ADMIN**   | Administrador global          | Todo. Gestiona el sistema completo.                            |
| **ADMIN_ESCUELA** | Director/Admin de institución | Gestionar su institución, grupos, comunicados.                 |
| **EDUCADOR**      | Profesor/Docente              | Crear cursos, lecciones, ver progreso de estudiantes.          |
| **ESTUDIANTE**    | Alumno                        | Inscribirse a cursos, completar lecciones, ver calificaciones. |

## Estado Actual del Sistema

### Funcionalidades Implementadas

| Módulo             | Estado       | Cantidad | Descripción                           |
| ------------------ | ------------ | -------- | ------------------------------------- |
| Autenticación      | ⏳ Pendiente | -        | Login, registro, recuperar contraseña |
| Usuarios           | ✅ Seed      | 10       | Usuarios de prueba disponibles        |
| Perfiles           | ✅ Seed      | 10       | Información extendida de cada usuario |
| Categorías         | ✅ Seed      | 6        | Categorías curriculares               |
| Instituciones      | ✅ Seed      | 2        | Instituciones educativas              |
| Grupos             | ✅ Seed      | 4        | Grupos/clases con estudiantes         |
| Grupos-Estudiantes | ✅ Seed      | 4        | Asignaciones estudiante-grupo         |
| Cursos             | ✅ Seed      | 6        | Cursos de ejemplo                     |
| Lecciones          | ✅ Seed      | 15       | Lecciones (VIDEO, TEXTO, QUIZ)        |
| Recursos           | ✅ Seed      | 8        | Recursos adjuntos a lecciones         |
| Inscripciones      | ✅ Seed      | 12       | Inscripciones de estudiantes          |
| Progreso           | ✅ Seed      | 28       | Registros de avance en lecciones      |
| Asistencias        | ✅ Seed      | 40       | Registros (10 días × 4 estudiantes)   |
| Calificaciones     | ✅ Seed      | 16       | Notas (4 materias × 4 estudiantes)    |
| Comunicados        | ✅ Seed      | 4        | Comunicados institucionales           |

### Progreso por Etapas

| Etapa | Documento                                            | Estado        |
| ----- | ---------------------------------------------------- | ------------- |
| 1     | [Usuarios y Perfiles](etapa-1-usuarios.md)           | ✅ Completado |
| 2     | [Categorías e Instituciones](etapa-2-categorias.md)  | ✅ Completado |
| 3     | [Cursos y Lecciones](etapa-3-cursos.md)              | ✅ Completado |
| 4     | [Inscripciones y Progreso](etapa-4-inscripciones.md) | ✅ Completado |
| 5     | [Módulo Administrativo](etapa-5-administrativo.md)   | ✅ Completado |

## Cómo Probar el Sistema

### Usuarios de Prueba

Todos los usuarios usan la contraseña: `password123`

#### Super Administrador

```
Email: superadmin@amauta.test
Acceso: Total al sistema
```

#### Administradores de Escuela

```
Email: admin1@amauta.test (María García - Escuela Belgrano)
Email: admin2@amauta.test (Carlos López - Colegio San Martín)
Acceso: Su institución
```

#### Educadores

```
Email: educador1@amauta.test (Ana Martínez - Matemáticas)
Email: educador2@amauta.test (Pedro Sánchez - Lengua)
Email: educador3@amauta.test (Laura Fernández - Ciencias)
Acceso: Sus cursos y estudiantes
```

#### Estudiantes

```
Email: estudiante1@amauta.test (Juan Pérez - 4°A Belgrano)
Email: estudiante2@amauta.test (Sofía Rodríguez - 4°A Belgrano)
Email: estudiante3@amauta.test (Mateo González - 1°A San Martín)
Email: estudiante4@amauta.test (Valentina Díaz - 1°A San Martín)
Acceso: Sus cursos e inscripciones
```

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

## URLs del Sistema

| Entorno    | Frontend                      | Backend                           |
| ---------- | ----------------------------- | --------------------------------- |
| Producción | https://amauta.diazignacio.ar | https://amauta-api.diazignacio.ar |
| Local      | http://localhost:3000         | http://localhost:3001             |

---

**Última actualización**: 2025-12-30
**Etapa actual**: 5 de 5 completadas (SEED COMPLETO)
