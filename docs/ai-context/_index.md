# AI Context - Índice Maestro

> Sistema de documentación agnóstico para asistentes de IA (Claude Code, Cursor, Copilot, etc.)

## Documentación del Sistema

| Documento                                      | Propósito                                        |
| ---------------------------------------------- | ------------------------------------------------ |
| [`MANUAL_USO.md`](./MANUAL_USO.md)             | **Cómo usar** - Guía práctica paso a paso        |
| [`GUIA_COMPRENSION.md`](./GUIA_COMPRENSION.md) | **Entender el sistema** - Filosofía y estructura |

---

## Inicio Rápido

### Carga por Tarea

| Tarea                     | Contextos a Cargar                                                |
| ------------------------- | ----------------------------------------------------------------- |
| **Crear endpoint API**    | `_patterns.md` + `modules/{modulo}.md` + `database/schema.md`     |
| **Crear formulario**      | `_patterns.md` + `frontend/components.md` + `modules/{modulo}.md` |
| **Agregar página**        | `frontend/pages.md` + `frontend/components.md`                    |
| **Modificar modelo DB**   | `database/schema.md` + `modules/{modulo}.md`                      |
| **Generar CRUD completo** | Usar skill `../ai-skills/crud-generator.md`                       |

### Instrucciones por Herramienta

**Claude Code:**

```
Lee docs/ai-context/_patterns.md y docs/ai-context/modules/cursos.md
```

**Cursor:**

- El archivo `.cursorrules` carga automáticamente los contextos relevantes
- Usa `@docs/ai-context/...` para referencias específicas

**Otros LLMs:**

- Copiar el contenido de los archivos relevantes al contexto
- Seguir el orden: `_patterns.md` → `modules/*.md` → `frontend/*.md`

---

## Contextos Disponibles

### Patrones del Proyecto

| Archivo                          | Descripción                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| [`_patterns.md`](./_patterns.md) | Patrones de código del proyecto (Zod, controllers, services, etc.) |

### Módulos Backend

| Módulo         | Archivo                                                    | Descripción                          |
| -------------- | ---------------------------------------------------------- | ------------------------------------ |
| Auth           | [`modules/auth.md`](./modules/auth.md)                     | Autenticación con NextAuth.js v5     |
| Cursos         | [`modules/cursos.md`](./modules/cursos.md)                 | CRUD de cursos                       |
| Lecciones      | [`modules/lecciones.md`](./modules/lecciones.md)           | Gestión de lecciones                 |
| Inscripciones  | [`modules/inscripciones.md`](./modules/inscripciones.md)   | Sistema de inscripción               |
| Progreso       | [`modules/progreso.md`](./modules/progreso.md)             | Tracking de lecciones completadas    |
| Uploads        | [`modules/uploads.md`](./modules/uploads.md)               | Subida de archivos                   |
| Categorías     | [`modules/categorias.md`](./modules/categorias.md)         | Categorías de cursos                 |
| Evaluaciones   | [`modules/evaluaciones.md`](./modules/evaluaciones.md)     | Sistema de evaluaciones y preguntas  |
| Instituciones  | [`modules/instituciones.md`](./modules/instituciones.md)   | Gestión de instituciones educativas  |
| Grupos         | [`modules/grupos.md`](./modules/grupos.md)                 | Grupos/clases por institución        |
| Asistencias    | [`modules/asistencias.md`](./modules/asistencias.md)       | Registro diario de asistencias       |
| Calificaciones | [`modules/calificaciones.md`](./modules/calificaciones.md) | Calificaciones por periodo y materia |

### Frontend

| Archivo                                              | Descripción                   |
| ---------------------------------------------------- | ----------------------------- |
| [`frontend/pages.md`](./frontend/pages.md)           | Estructura de rutas y layouts |
| [`frontend/components.md`](./frontend/components.md) | Componentes reutilizables     |
| [`frontend/hooks.md`](./frontend/hooks.md)           | Hooks personalizados          |

### Base de Datos

| Archivo                                      | Descripción                |
| -------------------------------------------- | -------------------------- |
| [`database/schema.md`](./database/schema.md) | Schema Prisma y relaciones |

---

## Skills Disponibles

| Skill             | Archivo                                                                        | Uso                                         |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Prisma & DB       | [`../ai-skills/prisma-db-management.md`](../ai-skills/prisma-db-management.md) | Migraciones, verificar DB, resolver errores |
| CRUD Generator    | [`../ai-skills/crud-generator.md`](../ai-skills/crud-generator.md)             | Generar módulo completo backend + frontend  |
| API Endpoint      | [`../ai-skills/api-endpoint.md`](../ai-skills/api-endpoint.md)                 | Agregar endpoint a módulo existente         |
| React Form        | [`../ai-skills/react-form.md`](../ai-skills/react-form.md)                     | Crear formulario siguiendo patrones         |
| Context Validator | [`../ai-skills/ai-context-validator.md`](../ai-skills/ai-context-validator.md) | Verificar que ai-context está sincronizado  |

---

## Stack Técnico

| Capa           | Tecnología                                |
| -------------- | ----------------------------------------- |
| **Frontend**   | Next.js 14+ (App Router), TypeScript      |
| **Backend**    | NestJS + Fastify, TypeScript strict       |
| **ORM**        | Prisma                                    |
| **DB**         | PostgreSQL 15+                            |
| **Validación** | Zod                                       |
| **Auth**       | NextAuth.js v5 (frontend) + JWT (backend) |
| **Estilos**    | Tailwind CSS v3 + CSS Modules             |

---

## Convenciones Clave

1. **Idioma**: Todo en español (código, mensajes, docs)
2. **DTOs**: Usar Zod schemas, no class-validator
3. **Soft Delete**: Cambiar estado a ARCHIVADO, no borrar
4. **Slugs**: Generar automáticamente desde título
5. **Paginación**: `page`, `limit`, `ordenarPor`, `orden`
6. **Respuestas**: `{ data, message }` o `{ items[], total, page, limit, totalPages }`
7. **Proxy API**: Frontend usa rutas proxy `/api/*` que llaman al backend

---

## Notas para IA

- **Antes de crear código**: Leer `_patterns.md` para entender convenciones
- **Para nuevos módulos**: Usar `cursos.md` como template de referencia
- **Validaciones**: Siempre usar Zod con `safeParse` en el service
- **Tests**: Verificar que el código pasa `npm run lint` y `npm run type-check`
