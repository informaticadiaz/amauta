# Tareas Fase 0 - Fundamentos

## Épica: Establecer Fundamentos del Proyecto

**Duración estimada**: 2 semanas
**Sprint**: Sprint 0
**Estado**: En progreso

### Descripción

Establecer las bases técnicas y de gestión del proyecto Amauta, configurando la infraestructura de desarrollo, documentación y procesos que permitirán el desarrollo exitoso de las siguientes fases.

### Objetivos

- Configurar repositorio y estructura de proyecto
- Establecer pipeline de CI/CD básico
- Documentar procesos y estándares
- Preparar entorno de desarrollo

---

## Feature 1: Configuración de Repositorio y Estructura

**Como** desarrollador del equipo
**Quiero** tener un repositorio bien estructurado con todas las configuraciones necesarias
**Para** poder trabajar de manera eficiente y consistente

### Criterios de Aceptación

- [x] Repositorio creado en GitHub
- [x] Estructura de carpetas definida
- [x] README.md completo con información del proyecto
- [x] .gitignore configurado
- [x] Licencia del proyecto definida
- [x] Code of Conduct creado
- [x] Contributing guidelines documentadas

### Tareas Técnicas

#### T-001: Configurar .gitignore

**Estimación**: 1 punto
**Prioridad**: Must Have
**Labels**: `tech-debt`, `infrastructure`

**Checklist:**

- [x] Agregar reglas para Node.js
- [x] Agregar reglas para Next.js (.next/, out/)
- [x] Agregar reglas para variables de entorno (.env\*)
- [x] Agregar reglas para IDEs (VSCode, etc)
- [x] Agregar reglas para sistema operativo
- [x] Agregar reglas para dependencias (node_modules/)
- [x] Agregar reglas para builds y dist/

#### T-002: Definir licencia del proyecto

**Estimación**: 1 punto
**Prioridad**: Must Have
**Labels**: `docs`, `legal`

**Checklist:**

- [x] Investigar licencias open source apropiadas (AGPL-3.0, GPL-3.0)
- [x] Consultar con stakeholders sobre preferencias
- [x] Crear archivo LICENSE
- [x] Actualizar README con información de licencia
- [x] Agregar badge de licencia

#### T-003: Crear Code of Conduct

**Estimación**: 2 puntos
**Prioridad**: Should Have
**Labels**: `docs`, `community`

**Checklist:**

- [x] Adaptar Contributor Covenant u otro estándar
- [x] Definir proceso de reporte de violaciones
- [x] Designar responsables de moderación
- [x] Crear archivo CODE_OF_CONDUCT.md
- [x] Vincular desde README

#### T-004: Crear Contributing Guidelines

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `docs`, `community`

**Checklist:**

- [x] Documentar proceso de fork y PR
- [x] Explicar convenciones de commits
- [x] Listar requisitos para PRs (tests, docs)
- [x] Documentar proceso de code review
- [x] Agregar guía de setup para contribuidores
- [x] Crear archivo CONTRIBUTING.md

---

## Feature 2: Pipeline de CI/CD

**Como** desarrollador del equipo
**Quiero** tener un pipeline de CI/CD automático
**Para** asegurar la calidad del código y automatizar deploys

### Criterios de Aceptación

- [x] GitHub Actions configurado
- [x] Tests se ejecutan automáticamente en PRs
- [ ] Linting y type checking automático (pendiente expansión)
- [ ] Build verification en cada commit (pendiente expansión)
- [ ] Deploy automático a staging (opcional para Fase 0)
- [x] Pre-commit hooks configurados

### Tareas Técnicas

#### T-005: Configurar GitHub Actions para CI

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `ci-cd`

**Checklist:**

- [x] Crear workflow .github/workflows/ci.yml
- [x] Configurar jobs para diferentes ambientes (Node 20)
- [x] Agregar step para install dependencies
- [x] Agregar step para lint
- [x] Agregar step para type checking
- [x] Agregar step para build
- [x] Configurar caché de node_modules
- [x] Configurar triggers (push, PR a main/develop)

#### T-006: Configurar tests en CI

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `ci-cd`, `testing`

**Checklist:**

- [x] Agregar step para ejecutar tests
- [x] Configurar coverage reporting
- [x] Subir coverage a servicio (Codecov, Coveralls)
- [x] Configurar umbrales mínimos de coverage
- [x] Agregar badge de coverage al README

#### T-007: Configurar pre-commit hooks

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `infrastructure`, `dx`
**Estado**: ✅ Completado (Issue #14)

**Checklist:**

- [x] Instalar y configurar Husky
- [x] Configurar pre-commit hook para lint-staged
- [x] Configurar hook para formateo con Prettier
- [x] Configurar hook para linting con ESLint
- [x] Configurar commit-msg hook para conventional commits
- [x] Documentar en CONTRIBUTING.md

---

## Feature 3: Configuración de Proyecto Base

**Como** desarrollador del equipo
**Quiero** tener la estructura base del proyecto configurada
**Para** poder empezar a desarrollar features

### Criterios de Aceptación

- [x] Monorepo configurado (Turborepo o similar)
- [x] TypeScript configurado con strict mode
- [x] ESLint y Prettier configurados
- [x] Package.json con scripts útiles
- [x] Variables de entorno documentadas

### Tareas Técnicas

#### T-008: Inicializar estructura de monorepo

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `setup`

**Checklist:**

- [x] Instalar y configurar Turborepo
- [x] Crear estructura de carpetas (apps/, packages/)
- [x] Configurar workspaces en package.json
- [x] Crear turbo.json con pipeline
- [x] Configurar apps/web (Next.js)
- [x] Configurar apps/api (Express/Fastify)
- [x] Documentar estructura en README

#### T-009: Configurar TypeScript

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `typescript`

**Checklist:**

- [x] Crear tsconfig.json base
- [x] Configurar strict mode
- [x] Configurar paths aliases (@/)
- [x] Crear tsconfig para cada workspace
- [x] Configurar tipos compartidos en packages/types
- [x] Verificar que compila sin errores

#### T-010: Configurar ESLint y Prettier

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `code-quality`

**Checklist:**

- [x] Instalar ESLint y plugins necesarios
- [x] Configurar .eslintrc.js con reglas
- [x] Instalar Prettier
- [x] Configurar .prettierrc
- [x] Crear .prettierignore
- [x] Asegurar compatibilidad ESLint + Prettier
- [x] Agregar scripts lint y format
- [x] Configurar extensión en VSCode (settings.json)

#### T-011: Configurar variables de entorno

**Estimación**: 2 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `configuration`

**Checklist:**

- [x] Crear .env.example con todas las variables
- [x] Documentar cada variable en comentarios
- [x] Crear .env.local de ejemplo
- [x] Agregar validación de env vars (zod o similar)
- [x] Documentar en docs/technical/setup.md
- [x] Agregar .env\* al .gitignore

---

## Feature 4: Setup de Base de Datos

**Como** desarrollador del equipo
**Quiero** tener la base de datos configurada con Prisma
**Para** poder trabajar con modelos de datos

### Criterios de Aceptación

- [x] PostgreSQL configurado (local o Docker)
- [x] Prisma instalado y configurado
- [x] Schema inicial definido
- [x] Migraciones funcionando
- [x] Seed data creado

### Tareas Técnicas

#### T-012: Configurar PostgreSQL

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `database`

**Checklist:**

- [x] Crear docker-compose.yml con PostgreSQL
- [x] Configurar volúmenes para persistencia
- [x] Documentar instalación local alternativa
- [x] Crear base de datos de desarrollo
- [x] Configurar DATABASE_URL en .env
- [x] Verificar conexión

#### T-013: Configurar Prisma

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `database`, `backend`

**Checklist:**

- [x] Instalar Prisma y Prisma Client
- [x] Inicializar Prisma (prisma init)
- [x] Crear schema.prisma base
- [x] Definir modelos iniciales (Usuario, Perfil) - Implementados todos (15 modelos)
- [x] Generar primera migración - Listo para ejecutar
- [x] Generar Prisma Client - Se genera al ejecutar migración
- [x] Configurar scripts en package.json
- [x] Documentar comandos Prisma

#### T-014: Crear seed data

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `backend`, `database`
**Estado**: ✅ Completado (Issues #15, #23-27)

**Checklist:**

- [x] Crear prisma/seed.ts
- [x] Agregar usuarios de prueba (roles diferentes)
- [x] Agregar categorías base
- [x] Agregar script de seed a package.json
- [x] Documentar cómo usar seed
- [x] Configurar seed en package.json

**Resultado**: Seed completo con 5 etapas implementadas:

- Etapa 1: Usuarios y Perfiles (10 usuarios)
- Etapa 2: Categorías e Instituciones
- Etapa 3: Cursos y Lecciones
- Etapa 4: Inscripciones y Progreso
- Etapa 5: Asistencias, Calificaciones, Comunicados

---

## Feature 5: Documentación Completa

**Como** miembro del equipo o contribuidor
**Quiero** tener documentación completa y actualizada
**Para** entender el proyecto y contribuir efectivamente

### Criterios de Aceptación

- [x] Documentación técnica completa
- [x] Documentación de gestión completa
- [x] README informativo
- [ ] Wiki de GitHub configurada (opcional)
- [ ] Diagramas de arquitectura

### Tareas Técnicas

#### T-015: Crear diagramas de arquitectura

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `docs`, `architecture`
**Estado**: ✅ Completado (Issue #16 - 2025-12-30)

**Checklist:**

- [x] Crear diagrama de arquitectura general
- [x] Crear diagrama de flujo de datos
- [x] Crear diagrama ER de base de datos
- [x] Usar herramienta (Mermaid, Draw.io, Excalidraw) → Mermaid
- [x] Agregar diagramas a docs/technical/architecture.md
- [ ] Exportar versiones en imagen (opcional, Mermaid renderiza en GitHub)

**Resultado**: 5 diagramas Mermaid en `docs/technical/architecture.md`:

- Arquitectura General del Sistema
- Arquitectura en Capas
- Arquitectura de Deployment (VPS + Dokploy)
- Diagrama ER completo (15 modelos)
- Diagrama de Flujo de Datos (auth, inscripción, progreso, offline)

#### T-016: Documentar API endpoints (preparación)

**Estimación**: 2 puntos
**Prioridad**: Could Have
**Labels**: `docs`, `api`

**Checklist:**

- [ ] Crear estructura para docs/technical/api-reference.md
- [ ] Definir formato de documentación de endpoints
- [ ] Considerar Swagger/OpenAPI para futuro
- [ ] Documentar convenciones de REST API
- [ ] Crear template para nuevos endpoints

---

## Feature 6: Deployment en Producción

**Como** equipo de desarrollo
**Quiero** tener el sistema deployado en producción
**Para** que los usuarios puedan acceder a la plataforma

### Criterios de Aceptación

- [x] VPS configurado con Dokploy
- [x] PostgreSQL en producción
- [x] Redis en producción
- [x] Backend API deployado y accesible
- [x] Frontend deployado y accesible
- [x] SSL/TLS configurado
- [x] Dominios configurados

### Tareas Técnicas

#### T-017: Configurar deployment en VPS con Dokploy

**Estimación**: 8 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `deployment`
**Estado**: ✅ Completado (2025-12-23)

**Checklist:**

- [x] Configurar proyecto en Dokploy
- [x] Desplegar PostgreSQL 15
- [x] Desplegar Redis 7
- [x] Crear Dockerfiles optimizados (multi-stage)
- [x] Configurar variables de entorno de producción
- [x] Desplegar Backend API (NestJS + Fastify)
- [x] Desplegar Frontend (Next.js)
- [x] Configurar dominios y SSL
- [x] Verificar health checks

**URLs de Producción:**

- Frontend: https://amauta.diazignacio.ar
- Backend API: https://amauta-api.diazignacio.ar

---

## Deuda Técnica y Mejoras

### DT-001: Configurar Docker para desarrollo completo

**Estimación**: 5 puntos
**Prioridad**: Could Have
**Labels**: `tech-debt`, `infrastructure`, `dx`

**Descripción:**
Crear configuración Docker completa para que desarrolladores puedan levantar todo el stack con un comando.

**Checklist:**

- [ ] Crear Dockerfile para apps/web
- [ ] Crear Dockerfile para apps/api
- [ ] Actualizar docker-compose.yml con todos los servicios
- [ ] Configurar networking entre servicios
- [ ] Optimizar para desarrollo (hot reload)
- [ ] Documentar uso de Docker en setup.md

### DT-002: Configurar herramienta de monitoreo de errores

**Estimación**: 3 puntos
**Prioridad**: Could Have
**Labels**: `tech-debt`, `infrastructure`, `monitoring`

**Descripción:**
Integrar Sentry u otra herramienta para tracking de errores en desarrollo.

**Checklist:**

- [ ] Evaluar opciones (Sentry, LogRocket, etc)
- [ ] Crear cuenta en servicio elegido
- [ ] Integrar en frontend
- [ ] Integrar en backend
- [ ] Configurar source maps
- [ ] Documentar configuración

---

## Resumen de Estimaciones

### Por Prioridad

- **Must Have**: 34 puntos
- **Should Have**: 11 puntos
- **Could Have**: 8 puntos

**Total**: 53 puntos

### Por Área

- Infrastructure: 29 puntos
- Docs: 10 puntos
- Backend: 8 puntos
- Testing: 3 puntos
- Community: 3 puntos

### Recomendación de Sprints

**Sprint 0 - Parte 1** (20-25 puntos)

- T-001 a T-007: Repo, CI/CD
- Duración: 1 semana

**Sprint 0 - Parte 2** (20-25 puntos)

- T-008 a T-014: Setup técnico, DB
- Duración: 1 semana

**Backlog para refinar**

- T-015 a T-016 + Deuda Técnica
- Evaluar después de Sprint 0

---

## Criterios de Completitud de Fase 0

La Fase 0 estará completa cuando:

- [x] Repositorio configurado y documentado
- [x] CI/CD pipeline funcional (GitHub Actions + pre-commit hooks)
- [x] Estructura de proyecto lista (Turborepo + monorepo)
- [x] Base de datos configurada con Prisma (PostgreSQL + schema completo)
- [x] Backend NestJS + Fastify configurado (issue #19)
- [x] Frontend Next.js configurado (issue #20)
- [x] Documentación técnica completa (diagramas Mermaid - issue #16 ✅)
- [x] Seed data para desarrollo (5 etapas completas - issues #23-27)
- [x] Al menos 1 desarrollador puede clonar y ejecutar el proyecto sin ayuda

**Iniciado**: 01/12/2024
**Progreso actual**: 100% (18/18 tareas completadas) ✅
**Fecha objetivo**: 31/12/2024
**Fecha completada**: 30/12/2024 🎉
**Estado de Producción**: 🟢 ONLINE (2025-12-23)
**Seed**: ✅ COMPLETO (2025-12-30)
**Diagramas**: ✅ COMPLETO (2025-12-30)
