# CLAUDE.md

## Información del Proyecto Amauta

Este documento proporciona contexto e información relevante para Claude Code al trabajar en el proyecto Amauta.

## Descripción del Proyecto

Amauta es un sistema educativo para la gestión del aprendizaje.

## Visión y Filosofía ⭐

**IMPORTANTE**: Antes de desarrollar, entender la visión del proyecto.

- **Documento de Visión**: `README.md` - Filosofía, principios de diseño, valores
- **Propósito**: Educación como derecho social, acceso universal, offline-first
- **Nombre**: "Amauta" (quechua) = maestro/sabio al servicio de la comunidad

> _"No concebimos la educación como un producto, sino como un derecho social."_

---

## 🚦 Estado Actual y Próximos Pasos

### Fase Actual: Fase 1 - MVP Plataforma de Cursos 🚧 EN PROGRESO

**Inicio**: 30/12/2024
**Progreso**: 1/16 issues (Sprint 1 iniciado)

#### Completado en Fase 1:

- ✅ **F1-001**: Autenticación con NextAuth.js v5
  - Login y registro funcionales
  - Páginas: `/login`, `/register`, `/dashboard`
  - Endpoints: `/api/v1/auth/login`, `/api/v1/auth/register`

#### Próximos pasos:

- 📋 **F1-002**: Autorización por roles (RBAC)
- 📋 **F1-003**: Layout base responsive

**Documento guía**: `docs/project-management/roadmap.md` → Sección "Fase 1"

### Fase Anterior: Fase 0 ✅ COMPLETADA

**Fecha de completitud**: 30/12/2024

- ✅ Infraestructura (monorepo, CI/CD, Docker)
- ✅ Base de datos (Prisma, 15 modelos, seed completo)
- ✅ Deployment en producción (Dokploy)
- ✅ Documentación técnica y de gestión

---

## 🗺️ Desarrollo Ordenado (CRÍTICO)

### Regla Principal

> **Para desarrollar features nuevas, SIEMPRE consultar `docs/project-management/roadmap.md`**

El roadmap define:

- 10 fases incrementales con prioridades claras
- Historias de usuario para cada fase
- Stack tecnológico específico por feature
- Criterios de éxito medibles
- Código de ejemplo y patrones

### Proceso de Desarrollo por Fases

```
1. CONSULTAR ROADMAP
   └── Leer la fase correspondiente en roadmap.md
   └── Entender historias de usuario y criterios de éxito

2. CREAR ISSUES
   └── Desglosar la fase en issues específicos (gh issue create)
   └── Usar labels: phase-1, phase-2, etc.
   └── Referenciar sección del roadmap en cada issue

3. IMPLEMENTAR
   └── Seguir workflow de WORKFLOW.md
   └── Usar TodoWrite para tracking
   └── Respetar stack técnico definido

4. DOCUMENTAR
   └── Actualizar docs/sistema/ con funcionalidades completadas
   └── Actualizar CLAUDE.md si cambia el estado del proyecto

5. CERRAR FASE
   └── Verificar criterios de éxito del roadmap
   └── Actualizar estado en CLAUDE.md y roadmap.md
```

### Checklist Antes de Empezar una Fase Nueva

- [ ] ¿Leí la sección completa de la fase en `roadmap.md`?
- [ ] ¿Entiendo las historias de usuario?
- [ ] ¿Conozco el stack tecnológico específico para esta fase?
- [ ] ¿Existen issues creados para esta fase? Si no, crearlos primero
- [ ] ¿Las dependencias de fases anteriores están completas?

### Jerarquía de Documentos para Desarrollo

| Prioridad | Documento                            | Propósito                        |
| --------- | ------------------------------------ | -------------------------------- |
| 1         | `README.md`                          | Visión, filosofía, principios    |
| 2         | `docs/project-management/roadmap.md` | **Qué construir y en qué orden** |
| 3         | `WORKFLOW.md`                        | Cómo trabajar con issues         |
| 4         | `docs/technical/architecture.md`     | Decisiones técnicas              |
| 5         | `docs/technical/coding-standards.md` | Cómo escribir código             |

### Fases del Roadmap (Resumen)

| Fase | Nombre            | Estado        | Documento             |
| ---- | ----------------- | ------------- | --------------------- |
| 0    | Fundamentos       | ✅ Completado | `fase-0-tareas.md`    |
| 1    | MVP Cursos        | 📋 Próximo    | `roadmap.md` → Fase 1 |
| 2    | Offline-First PWA | 📋 Pendiente  | `roadmap.md` → Fase 2 |
| 3    | Evaluaciones      | 📋 Pendiente  | `roadmap.md` → Fase 3 |
| 4    | Módulo Escolar    | 📋 Pendiente  | `roadmap.md` → Fase 4 |
| 5    | Comunidad         | 📋 Pendiente  | `roadmap.md` → Fase 5 |
| 6-10 | Avanzadas         | 📋 Futuro     | `roadmap.md`          |

---

## Estructura del Proyecto

```
amauta/
├── README.md
├── CLAUDE.md                    # Este archivo - Contexto para Claude
├── WORKFLOW.md                  # ⭐ Metodología de trabajo con issues
├── DEPLOYMENT_PROGRESS.md       # ⭐ Estado del deployment en producción
├── CONTRIBUTING.md              # Guía de contribución
├── CODE_OF_CONDUCT.md           # Código de conducta
├── LICENSE                      # AGPL-3.0
├── .gitignore
│
├── package.json                 # Workspace raíz
├── package-lock.json
├── turbo.json                   # Configuración de Turborepo
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # Workflow de CI/CD
│   ├── README.md                     # Documentación de workflows
│   └── SECURITY_SANITIZATION.md      # Guía de sanitización
│
├── apps/                        # Aplicaciones del monorepo
│   ├── web/                    # Frontend Next.js PWA (@amauta/web)
│   │   ├── package.json
│   │   └── README.md
│   └── api/                    # Backend API REST (@amauta/api)
│       ├── package.json
│       ├── README.md
│       └── prisma/
│           ├── README.md            # ⭐ Documentación de DB y Seed
│           ├── schema.prisma        # Schema de base de datos
│           ├── seed.ts              # Entry point del seed
│           └── seeds/               # Datos de prueba por etapas
│               ├── index.ts         # Orquestador
│               └── usuarios.ts      # Etapa 1: Usuarios (✅ completado)
│
├── packages/                    # Packages compartidos
│   ├── shared/                 # Código compartido (@amauta/shared)
│   │   ├── package.json
│   │   ├── README.md
│   │   └── index.ts
│   └── types/                  # Tipos TypeScript (@amauta/types)
│       ├── package.json
│       ├── README.md
│       └── index.ts
│
└── docs/
    ├── sistema/                         # ⭐ Documentación del sistema (no técnica)
    │   ├── README.md                    # ⭐ Guía general del sistema
    │   ├── etapa-1-usuarios.md          # ✅ Usuarios y perfiles
    │   ├── etapa-2-categorias.md        # ⏳ Categorías e instituciones
    │   ├── etapa-3-cursos.md            # ⏳ Cursos y lecciones
    │   ├── etapa-4-inscripciones.md     # ⏳ Inscripciones y progreso
    │   └── etapa-5-administrativo.md    # ⏳ Asistencias, calificaciones
    ├── project-management/
    │   ├── README.md
    │   ├── sistema-gestion.md         # ⭐ Guía completa del sistema de gestión
    │   ├── metodologia.md
    │   ├── roadmap.md
    │   ├── sprints.md
    │   ├── tareas.md
    │   ├── fase-0-tareas.md
    │   ├── backlog.md
    │   └── project-board.md
    ├── glosario.md                      # Terminología del proyecto
    └── technical/
        ├── README.md
        ├── onboarding.md                  # ⭐ Guía día 1-3 para nuevos devs
        ├── cheatsheet.md                  # Referencia rápida de comandos
        ├── architecture.md
        ├── coding-standards.md
        ├── database.md
        ├── setup.md
        ├── environment-variables.md
        ├── testing.md                     # Guía de testing
        ├── patterns.md                    # Patrones y recetas
        ├── code-review.md                 # Proceso de code review
        ├── debugging.md                   # Guía de debugging
        ├── security-guide.md              # Seguridad para devs (OWASP)
        ├── performance.md                 # Optimización y métricas
        ├── SECURITY_README.md             # Índice de seguridad
        ├── vps-deployment-analysis.md     # Plan de deployment
        ├── PRIVATE_DATA_STORAGE.md        # Almacenamiento seguro
        ├── PRIVATE_REPO_REFERENCE.md      # Repo privado
        └── adr/                           # Decisiones arquitectónicas
            ├── README.md
            ├── 001-monorepo-turborepo.md
            ├── 002-nestjs-fastify.md
            ├── 003-prisma-orm.md
            ├── 004-nextjs-app-router.md
            └── 005-deployment-dokploy.md
```

## Convenciones del Proyecto

### Commits

- Mensajes de commit en español
- Seguir formato descriptivo y claro
- Incluir contexto del cambio

### Documentación

- Toda la documentación en español
- Mantener documentos actualizados en `/docs`
- Separar documentación técnica de gestión de proyecto

## Referencias Importantes

### Documentos Principales

- **Metodología de trabajo**: `WORKFLOW.md` ⭐ **LEER PRIMERO**
- **Estado de Deployment**: `DEPLOYMENT_PROGRESS.md` ⭐ **Estado actual del deployment en producción**
- **Guía de contribución**: `CONTRIBUTING.md` - Cómo contribuir al proyecto
- **Código de conducta**: `CODE_OF_CONDUCT.md` - Expectativas de la comunidad
- **Licencia**: `LICENSE` - AGPL-3.0

### Documentación Técnica

- `docs/technical/README.md` - Índice de documentación técnica
- `docs/technical/architecture.md` - Arquitectura del sistema
- `docs/technical/coding-standards.md` - Estándares de código
- `docs/technical/database.md` - Diseño de base de datos
- `docs/technical/setup.md` - Guía de configuración
- `docs/technical/environment-variables.md` - Estrategia de variables de entorno

#### Base de Datos y Seed ⭐

- `apps/api/prisma/README.md` - ⭐ **Documentación completa de Prisma y Seed**
- `apps/api/prisma/schema.prisma` - Schema de todos los modelos
- `apps/api/prisma/seeds/` - Datos de prueba por etapas

**Usuarios de prueba** (password: `password123`):

- `superadmin@amauta.test` (SUPER_ADMIN)
- `admin1@amauta.test`, `admin2@amauta.test` (ADMIN_ESCUELA)
- `educador1@amauta.test`, `educador2@amauta.test`, `educador3@amauta.test` (EDUCADOR)
- `estudiante1-4@amauta.test` (ESTUDIANTE)

Ver `apps/api/prisma/README.md` para tabla completa con nombres y descripciones.

#### Formación para Desarrolladores ⭐

**Para Empezar (Onboarding)**:

- `docs/technical/onboarding.md` - ⭐ **EMPEZAR AQUÍ** - Guía día 1-3
- `docs/technical/cheatsheet.md` - Referencia rápida de comandos
- `docs/glosario.md` - Terminología del proyecto

**Guías de Desarrollo**:

- `docs/technical/testing.md` - Cómo escribir y ejecutar tests
- `docs/technical/patterns.md` - Patrones y recetas comunes
- `docs/technical/code-review.md` - Proceso de code review
- `docs/technical/debugging.md` - Diagnóstico de problemas
- `docs/technical/security-guide.md` - Seguridad (OWASP Top 10)
- `docs/technical/performance.md` - Optimización y métricas

**Decisiones Arquitectónicas (ADR)**:

- `docs/technical/adr/README.md` - Índice de ADRs
- `docs/technical/adr/001-monorepo-turborepo.md` - Por qué Turborepo
- `docs/technical/adr/002-nestjs-fastify.md` - Por qué NestJS + Fastify
- `docs/technical/adr/003-prisma-orm.md` - Por qué Prisma
- `docs/technical/adr/004-nextjs-app-router.md` - Por qué App Router
- `docs/technical/adr/005-deployment-dokploy.md` - Por qué Dokploy

#### Seguridad y Deployment

- `docs/technical/SECURITY_README.md` - ⭐ Índice maestro de seguridad
- `docs/technical/vps-deployment-analysis.md` - Análisis y plan de deployment
- `docs/technical/PRIVATE_DATA_STORAGE.md` - Guía de almacenamiento seguro
- `docs/technical/PRIVATE_REPO_REFERENCE.md` - Referencia a repositorio privado
- `.github/SECURITY_SANITIZATION.md` - Guía de sanitización de datos sensibles

**⭐ Estado del Deployment: 🟢 COMPLETADO**

- **Frontend**: https://amauta.diazignacio.ar ✅
- **Backend API**: https://amauta-api.diazignacio.ar ✅
- **Servicios**: PostgreSQL, Redis, Backend, Frontend - todos online
- **Detalles**: Ver `DEPLOYMENT_PROGRESS.md`

### Documentación de Gestión

- `docs/project-management/sistema-gestion.md` - ⭐ **Guía completa del sistema de gestión** (empezar aquí)
- `docs/project-management/README.md` - Índice de gestión
- `docs/project-management/roadmap.md` - Roadmap del proyecto
- `docs/project-management/fase-0-tareas.md` - Tareas de Fase 0
- `docs/project-management/metodologia.md` - Metodología ágil
- `docs/project-management/sprints.md` - Gestión de sprints

### CI/CD y Workflows

- `.github/workflows/ci.yml` - Pipeline de CI/CD
- `.github/README.md` - Documentación de workflows

### Monorepo

- `turbo.json` - Configuración de Turborepo
- `apps/web/README.md` - Frontend Next.js PWA
- `apps/api/README.md` - Backend API con NestJS + Fastify
- `packages/shared/README.md` - Código compartido
- `packages/types/README.md` - Tipos TypeScript

## Flujo de Trabajo con Issues

**IMPORTANTE**: Antes de trabajar en cualquier issue, leer `WORKFLOW.md` que contiene:

1. ✅ Proceso completo paso a paso
2. ✅ Cómo usar GitHub CLI para gestionar issues
3. ✅ Formato de commits y mensajes
4. ✅ Uso de TodoWrite para tracking
5. ✅ Checklist de calidad
6. ✅ Ejemplos completos

### Resumen del Flujo

```bash
# 1. Listar issues
gh issue list --limit 100

# 2. Ver detalles
gh issue view <número> --json title,body,labels | jq -r '"\(.title)\n\n\(.body)"'

# 3. Crear todo list (TodoWrite)

# 4. Implementar solución

# 5. Commit con formato estándar
git commit -m "$(cat <<'EOF'
<tipo>: <descripción>
...
Resuelve: #<número>
EOF
)"

# 6. Cerrar issue
gh issue close <número> --comment "✅ Tarea completada..."
```

## Estado Actual del Proyecto

> **Nota**: Esta sección usa comandos dinámicos para evitar desactualización.
> La fuente de verdad es `docs/project-management/backlog.md`.

### Consultar Estado en Tiempo Real

```bash
# Ver todos los issues abiertos
gh issue list --limit 50

# Ver issues por label/fase
gh issue list --label "phase-0"
gh issue list --label "phase-1"

# Ver issues cerrados recientemente
gh issue list --state closed --limit 10

# Ver detalle de un issue específico
gh issue view <número>
```

### Fuentes de Verdad (Documentos Autoritativos)

| Información            | Documento                                    |
| ---------------------- | -------------------------------------------- |
| **Backlog completo**   | `docs/project-management/backlog.md`         |
| **Tareas Fase 0**      | `docs/project-management/fase-0-tareas.md`   |
| **Tablero visual**     | `docs/project-management/project-board.md`   |
| **Roadmap general**    | `docs/project-management/roadmap.md`         |
| **Sistema de gestión** | `docs/project-management/sistema-gestion.md` |
| **Guía del Sistema**   | `docs/sistema/README.md`                     |
| **Base de datos/Seed** | `apps/api/prisma/README.md`                  |
| **Schema Prisma**      | `apps/api/prisma/schema.prisma`              |

### Estado de Producción

| Servicio    | URL                               | Estado    |
| ----------- | --------------------------------- | --------- |
| Frontend    | https://amauta.diazignacio.ar     | 🟢 Online |
| Backend API | https://amauta-api.diazignacio.ar | 🟢 Online |

Ver `DEPLOYMENT_PROGRESS.md` para detalles del deployment.

## Notas para Claude Code

### Reglas de Oro 🏆

1. **Para features nuevas** → Consultar `roadmap.md` PRIMERO
2. **Para issues existentes** → Seguir `WORKFLOW.md`
3. **Antes de codear** → Entender la visión en `README.md`
4. **Al terminar** → Actualizar documentación y estado

### Generales

- **Fase actual**: Fase 0 completada, próximo: Fase 1
- Usar español para toda la comunicación y documentación
- **SIEMPRE seguir el workflow definido en `WORKFLOW.md`**
- **SIEMPRE consultar `roadmap.md` para desarrollo de features**
- Usar TodoWrite para issues con 3+ pasos
- Commits descriptivos que referencien el issue
- Verificar checklist de calidad antes de cerrar issues

### Estructura del Monorepo

- Usar Turborepo para gestión de workspaces
- Apps en `apps/`: web (Next.js), api (NestJS + Fastify)
- Packages compartidos en `packages/`: shared, types
- Scripts globales en package.json raíz ejecutan en todos los workspaces

### Stack Técnico Definido

- **Frontend**: Next.js 14+ (App Router) con TypeScript
- **Backend**: NestJS + Fastify con TypeScript strict mode
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 15+
- **Caché**: Redis 7+ (en uso desde Fase 1)
- **Desarrollo**: Docker Compose obligatorio para entorno local
- **Deployment**: Dokploy en VPS (amauta.diazignacio.ar)

Ver `docs/technical/architecture.md` para decisiones técnicas detalladas.

### Orden de Desarrollo

- **Para Fase 0**: Seguir orden numérico de tareas (T-001, T-002...) en `fase-0-tareas.md`
- **Para Fase 1+**: Seguir el orden definido en `roadmap.md` para cada fase
- **Regla general**: Respetar dependencias entre tareas y fases
- **Prioridades dentro de cada fase**: El roadmap define Prioridad 1 (Core), 2 (Importante), 3 (Futuro)

### Documentación del Sistema (IMPORTANTE)

Al completar una etapa o funcionalidad, **SIEMPRE actualizar** la documentación en `docs/sistema/`:

1. **Al completar una etapa del seed**:
   - Actualizar el documento de la etapa (ej: `etapa-1-usuarios.md`)
   - Cambiar estado de ⏳ Pendiente a ✅ Completado
   - Agregar fecha de completitud
   - Documentar qué se logró de manera no técnica

2. **Al agregar funcionalidades**:
   - Actualizar `docs/sistema/README.md` con el nuevo estado
   - Agregar la funcionalidad a la tabla de "Estado Actual"

3. **Estructura de documentación**:

   ```
   docs/sistema/
   ├── README.md              ← Guía general (actualizar siempre)
   ├── etapa-1-usuarios.md    ← ✅ Completado
   ├── etapa-2-categorias.md  ← Actualizar cuando se complete
   ├── etapa-3-cursos.md      ← Actualizar cuando se complete
   ├── etapa-4-inscripciones.md
   └── etapa-5-administrativo.md
   ```

4. **Propósito de esta documentación**:
   - Lectura rápida (~5 minutos)
   - Sin comandos ni código
   - Orientada a entender el sistema
   - Útil para nuevos desarrolladores

- Consultar `docs/project-management/fase-0-tareas.md` para dependencias entre tareas
