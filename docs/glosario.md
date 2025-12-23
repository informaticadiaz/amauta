# Glosario - Amauta

Terminología utilizada en el proyecto Amauta.

---

## Términos de Dominio (Educación)

### Amauta

Palabra quechua que significa "maestro" o "sabio". En el imperio Inca, los amautas eran los encargados de la educación de la nobleza. El nombre refleja la misión del proyecto de democratizar la educación.

### Apoderado

Persona responsable legal de un estudiante menor de edad. Padre, madre, tutor o representante legal.

### Asistencia

Registro de presencia de un estudiante en una clase o actividad. Estados posibles: Presente, Ausente, Tardanza, Justificado, Permiso.

### Calificación

Valoración del rendimiento de un estudiante. Puede ser numérica (0-100), literal (A, B, C, D, F) o conceptual (Excelente, Bueno, Regular, Insuficiente).

### Certificado

Documento que acredita la finalización exitosa de un curso. Incluye nombre del estudiante, curso completado, fecha y código de verificación.

### Curso

Unidad de aprendizaje compuesta por múltiples lecciones. Tiene título, descripción, educador responsable y puede estar publicado o en borrador.

### Educador

Usuario que crea y gestiona cursos. Puede ser profesor, instructor, facilitador o cualquier persona que comparte conocimiento.

### Escala de Calificación

Sistema utilizado para evaluar estudiantes. Ejemplos: escala vigesimal (0-20), centesimal (0-100), literal (A-F).

### Estudiante

Usuario que consume cursos y contenido educativo. Se inscribe en cursos, completa lecciones y obtiene certificados.

### Evaluación

Actividad para medir el aprendizaje. Puede ser quiz, examen, tarea, proyecto, etc.

### Grupo / Clase

Conjunto de estudiantes que toman el mismo curso o pertenecen a la misma sección/grado. En contexto escolar: "3ro A", "5to año".

### Inscripción

Registro de un estudiante en un curso. Incluye fecha de inscripción, estado y progreso.

### Institución

Organización educativa (escuela, colegio, universidad, academia) que usa Amauta para gestionar su operación.

### Lección

Unidad mínima de contenido dentro de un curso. Puede contener texto, video, audio, recursos descargables.

### Materia / Asignatura

Área de conocimiento (Matemáticas, Historia, Programación). Un curso puede pertenecer a una materia.

### Período Académico

División temporal del año escolar: bimestre, trimestre, semestre, año lectivo.

### Progreso

Porcentaje de completitud de un curso. Se calcula basado en lecciones completadas vs. totales.

### Sección

Subdivisión de un grado. Ejemplo: "3ro A", "3ro B". Permite organizar estudiantes en grupos más pequeños.

---

## Términos Técnicos

### ADR (Architecture Decision Record)

Documento que registra una decisión arquitectónica importante, incluyendo contexto, opciones consideradas y consecuencias.

### API (Application Programming Interface)

Interfaz que permite comunicación entre el frontend y el backend. Amauta usa REST API.

### App Router

Sistema de enrutamiento de Next.js 13+. Usa la carpeta `app/` y soporta React Server Components.

### Backend

Parte del sistema que corre en el servidor. En Amauta: NestJS + Fastify + PostgreSQL.

### CI/CD (Continuous Integration / Continuous Deployment)

Automatización de testing y deployment. En Amauta: GitHub Actions.

### DTO (Data Transfer Object)

Objeto que define la estructura de datos para requests/responses. Usado para validación.

### Endpoint

URL específica de la API que realiza una acción. Ejemplo: `POST /api/cursos` crea un curso.

### Fastify

Framework web para Node.js, más rápido que Express. Usado como adaptador HTTP en NestJS.

### Frontend

Parte del sistema que corre en el navegador. En Amauta: Next.js + React.

### Guard (NestJS)

Componente que determina si una request puede proceder. Usado para autenticación y autorización.

### Hook (React)

Función que permite usar estado y otras features de React. Ejemplos: useState, useEffect.

### Hydration

Proceso donde React "hidrata" el HTML del servidor, añadiendo interactividad en el cliente.

### IndexedDB

Base de datos en el navegador para almacenar datos offline. Usado para funcionalidad PWA.

### ISR (Incremental Static Regeneration)

Técnica de Next.js que regenera páginas estáticas de forma incremental después del build.

### JWT (JSON Web Token)

Estándar para tokens de autenticación. Contiene información del usuario firmada digitalmente.

### Middleware

Código que se ejecuta entre la request y el handler. Puede modificar request/response.

### Migración

Cambio en la estructura de la base de datos. Prisma genera y ejecuta migraciones.

### Monorepo

Repositorio único que contiene múltiples proyectos. Amauta usa Turborepo.

### MoSCoW

Método de priorización: Must have, Should have, Could have, Won't have.

### NestJS

Framework de Node.js con arquitectura modular, inspirado en Angular. Usado en el backend.

### ORM (Object-Relational Mapping)

Herramienta que mapea objetos a tablas de base de datos. Amauta usa Prisma.

### Pipeline

Secuencia de pasos automatizados. En CI: lint → test → build → deploy.

### Prisma

ORM moderno para Node.js/TypeScript. Genera tipos automáticamente y tiene excelente DX.

### PWA (Progressive Web App)

Aplicación web que funciona como app nativa. Puede instalarse y funcionar offline.

### Query

Consulta a la base de datos. Prisma genera queries SQL automáticamente.

### Rate Limiting

Limitar cantidad de requests por tiempo. Previene abuso y ataques DDoS.

### Redis

Base de datos en memoria. Usado para caché, sesiones, colas.

### RSC (React Server Components)

Componentes de React que se ejecutan solo en el servidor. Reducen JavaScript en el cliente.

### Schema (Prisma)

Archivo que define modelos de datos, relaciones y configuración de la base de datos.

### Seed

Datos iniciales para la base de datos. Útil para desarrollo y testing.

### Service Worker

Script que corre en background en el navegador. Permite funcionalidad offline.

### Sprint

Ciclo de desarrollo de duración fija (2 semanas en Amauta).

### SSR (Server-Side Rendering)

Renderizar páginas en el servidor en cada request.

### SSG (Static Site Generation)

Generar páginas HTML en tiempo de build.

### Story Points

Unidad de estimación de complejidad. Escala Fibonacci: 1, 2, 3, 5, 8, 13, 21.

### Tenant

En multi-tenancy, cada "inquilino" (institución) con sus datos aislados.

### Token

Cadena que representa autenticación o autorización. Ejemplo: JWT.

### Turborepo

Herramienta para gestionar monorepos con caché inteligente y ejecución paralela.

### TypeScript

Superset de JavaScript con tipos estáticos. Usado en todo el proyecto.

### Velocity

Cantidad de story points completados por sprint. Métrica de capacidad del equipo.

### Webhook

HTTP callback que notifica eventos a sistemas externos.

### Workspace

En monorepo, cada proyecto/package individual. Ejemplo: `apps/web`, `packages/types`.

---

## Roles de Usuario

### ADMIN

Administrador del sistema. Acceso total a todas las funcionalidades.

### ADMIN_ESCOLAR

Administrador de una institución. Gestiona grupos, calificaciones, comunicados de su institución.

### EDUCADOR

Crea y gestiona cursos. Puede ver progreso de sus estudiantes.

### ESTUDIANTE

Consume cursos, completa lecciones, obtiene certificados.

### APODERADO

Puede ver información de estudiantes a su cargo (futuro).

---

## Acrónimos

| Acrónimo | Significado                                    |
| -------- | ---------------------------------------------- |
| API      | Application Programming Interface              |
| CI/CD    | Continuous Integration / Continuous Deployment |
| CRUD     | Create, Read, Update, Delete                   |
| CSS      | Cascading Style Sheets                         |
| DB       | Database                                       |
| DI       | Dependency Injection                           |
| DOM      | Document Object Model                          |
| DTO      | Data Transfer Object                           |
| DX       | Developer Experience                           |
| E2E      | End-to-End                                     |
| HTML     | HyperText Markup Language                      |
| HTTP     | HyperText Transfer Protocol                    |
| ISR      | Incremental Static Regeneration                |
| JSON     | JavaScript Object Notation                     |
| JWT      | JSON Web Token                                 |
| ORM      | Object-Relational Mapping                      |
| PR       | Pull Request                                   |
| PWA      | Progressive Web App                            |
| REST     | Representational State Transfer                |
| RSC      | React Server Components                        |
| SQL      | Structured Query Language                      |
| SSG      | Static Site Generation                         |
| SSL      | Secure Sockets Layer                           |
| SSR      | Server-Side Rendering                          |
| TLS      | Transport Layer Security                       |
| UI       | User Interface                                 |
| URL      | Uniform Resource Locator                       |
| UX       | User Experience                                |
| VPS      | Virtual Private Server                         |

---

## Convenciones de Código

| Término     | Ejemplo         | Uso                                   |
| ----------- | --------------- | ------------------------------------- |
| camelCase   | `miVariable`    | Variables, funciones                  |
| PascalCase  | `MiComponente`  | Componentes, clases, tipos            |
| UPPER_SNAKE | `MAX_RETRIES`   | Constantes                            |
| kebab-case  | `mi-archivo.ts` | Nombres de archivo                    |
| snake_case  | `mi_columna`    | Columnas de DB (Prisma usa camelCase) |

---

**Última actualización**: 2025-12-23
