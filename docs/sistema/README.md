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

| Módulo         | Estado       | Descripción                           |
| -------------- | ------------ | ------------------------------------- |
| Autenticación  | ⏳ Pendiente | Login, registro, recuperar contraseña |
| Usuarios       | ✅ Seed      | 10 usuarios de prueba disponibles     |
| Perfiles       | ✅ Seed      | Información extendida de cada usuario |
| Categorías     | ⏳ Pendiente | Clasificación de cursos               |
| Cursos         | ⏳ Pendiente | Contenido educativo                   |
| Inscripciones  | ⏳ Pendiente | Relación estudiante-curso             |
| Asistencias    | ⏳ Pendiente | Registro diario                       |
| Calificaciones | ⏳ Pendiente | Notas y evaluaciones                  |

### Progreso por Etapas

| Etapa | Documento                                            | Estado        |
| ----- | ---------------------------------------------------- | ------------- |
| 1     | [Usuarios y Perfiles](etapa-1-usuarios.md)           | ✅ Completado |
| 2     | [Categorías e Instituciones](etapa-2-categorias.md)  | ⏳ Pendiente  |
| 3     | [Cursos y Lecciones](etapa-3-cursos.md)              | ⏳ Pendiente  |
| 4     | [Inscripciones y Progreso](etapa-4-inscripciones.md) | ⏳ Pendiente  |
| 5     | [Módulo Administrativo](etapa-5-administrativo.md)   | ⏳ Pendiente  |

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
**Etapa actual**: 1 de 5 completada
