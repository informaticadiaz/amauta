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
- [ ] .gitignore configurado
- [ ] Licencia del proyecto definida
- [ ] Code of Conduct creado
- [ ] Contributing guidelines documentadas

### Tareas Técnicas

#### T-001: Configurar .gitignore

**Estimación**: 1 punto
**Prioridad**: Must Have
**Labels**: `tech-debt`, `infrastructure`

**Checklist:**

- [ ] Agregar reglas para Node.js
- [ ] Agregar reglas para Next.js (.next/, out/)
- [ ] Agregar reglas para variables de entorno (.env\*)
- [ ] Agregar reglas para IDEs (VSCode, etc)
- [ ] Agregar reglas para sistema operativo
- [ ] Agregar reglas para dependencias (node_modules/)
- [ ] Agregar reglas para builds y dist/

#### T-002: Definir licencia del proyecto

**Estimación**: 1 punto
**Prioridad**: Must Have
**Labels**: `docs`, `legal`

**Checklist:**

- [ ] Investigar licencias open source apropiadas (AGPL-3.0, GPL-3.0)
- [ ] Consultar con stakeholders sobre preferencias
- [ ] Crear archivo LICENSE
- [ ] Actualizar README con información de licencia
- [ ] Agregar badge de licencia

#### T-003: Crear Code of Conduct

**Estimación**: 2 puntos
**Prioridad**: Should Have
**Labels**: `docs`, `community`

**Checklist:**

- [ ] Adaptar Contributor Covenant u otro estándar
- [ ] Definir proceso de reporte de violaciones
- [ ] Designar responsables de moderación
- [ ] Crear archivo CODE_OF_CONDUCT.md
- [ ] Vincular desde README

#### T-004: Crear Contributing Guidelines

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `docs`, `community`

**Checklist:**

- [ ] Documentar proceso de fork y PR
- [ ] Explicar convenciones de commits
- [ ] Listar requisitos para PRs (tests, docs)
- [ ] Documentar proceso de code review
- [ ] Agregar guía de setup para contribuidores
- [ ] Crear archivo CONTRIBUTING.md

---

## Feature 2: Pipeline de CI/CD

**Como** desarrollador del equipo
**Quiero** tener un pipeline de CI/CD automático
**Para** asegurar la calidad del código y automatizar deploys

### Criterios de Aceptación

- [ ] GitHub Actions configurado
- [ ] Tests se ejecutan automáticamente en PRs
- [ ] Linting y type checking automático
- [ ] Build verification en cada commit
- [ ] Deploy automático a staging (opcional para Fase 0)

### Tareas Técnicas

#### T-005: Configurar GitHub Actions para CI

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `ci-cd`

**Checklist:**

- [ ] Crear workflow .github/workflows/ci.yml
- [ ] Configurar jobs para diferentes ambientes (Node 20)
- [ ] Agregar step para install dependencies
- [ ] Agregar step para lint
- [ ] Agregar step para type checking
- [ ] Agregar step para build
- [ ] Configurar caché de node_modules
- [ ] Configurar triggers (push, PR a main/develop)

#### T-006: Configurar tests en CI

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `ci-cd`, `testing`

**Checklist:**

- [ ] Agregar step para ejecutar tests
- [ ] Configurar coverage reporting
- [ ] Subir coverage a servicio (Codecov, Coveralls)
- [ ] Configurar umbrales mínimos de coverage
- [ ] Agregar badge de coverage al README

#### T-007: Configurar pre-commit hooks

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `infrastructure`, `dx`

**Checklist:**

- [ ] Instalar y configurar Husky
- [ ] Configurar pre-commit hook para lint-staged
- [ ] Configurar hook para formateo con Prettier
- [ ] Configurar hook para linting con ESLint
- [ ] Configurar commit-msg hook para conventional commits
- [ ] Documentar en CONTRIBUTING.md

---

## Feature 3: Configuración de Proyecto Base

**Como** desarrollador del equipo
**Quiero** tener la estructura base del proyecto configurada
**Para** poder empezar a desarrollar features

### Criterios de Aceptación

- [ ] Monorepo configurado (Turborepo o similar)
- [ ] TypeScript configurado con strict mode
- [ ] ESLint y Prettier configurados
- [ ] Package.json con scripts útiles
- [ ] Variables de entorno documentadas

### Tareas Técnicas

#### T-008: Inicializar estructura de monorepo

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `setup`

**Checklist:**

- [ ] Instalar y configurar Turborepo
- [ ] Crear estructura de carpetas (apps/, packages/)
- [ ] Configurar workspaces en package.json
- [ ] Crear turbo.json con pipeline
- [ ] Configurar apps/web (Next.js)
- [ ] Configurar apps/api (Express/Fastify)
- [ ] Documentar estructura en README

#### T-009: Configurar TypeScript

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `typescript`

**Checklist:**

- [ ] Crear tsconfig.json base
- [ ] Configurar strict mode
- [ ] Configurar paths aliases (@/)
- [ ] Crear tsconfig para cada workspace
- [ ] Configurar tipos compartidos en packages/types
- [ ] Verificar que compila sin errores

#### T-010: Configurar ESLint y Prettier

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `code-quality`

**Checklist:**

- [ ] Instalar ESLint y plugins necesarios
- [ ] Configurar .eslintrc.js con reglas
- [ ] Instalar Prettier
- [ ] Configurar .prettierrc
- [ ] Crear .prettierignore
- [ ] Asegurar compatibilidad ESLint + Prettier
- [ ] Agregar scripts lint y format
- [ ] Configurar extensión en VSCode (settings.json)

#### T-011: Configurar variables de entorno

**Estimación**: 2 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `configuration`

**Checklist:**

- [ ] Crear .env.example con todas las variables
- [ ] Documentar cada variable en comentarios
- [ ] Crear .env.local de ejemplo
- [ ] Agregar validación de env vars (zod o similar)
- [ ] Documentar en docs/technical/setup.md
- [ ] Agregar .env\* al .gitignore

---

## Feature 4: Setup de Base de Datos

**Como** desarrollador del equipo
**Quiero** tener la base de datos configurada con Prisma
**Para** poder trabajar con modelos de datos

### Criterios de Aceptación

- [ ] PostgreSQL configurado (local o Docker)
- [ ] Prisma instalado y configurado
- [ ] Schema inicial definido
- [ ] Migraciones funcionando
- [ ] Seed data creado

### Tareas Técnicas

#### T-012: Configurar PostgreSQL

**Estimación**: 3 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `database`

**Checklist:**

- [ ] Crear docker-compose.yml con PostgreSQL
- [ ] Configurar volúmenes para persistencia
- [ ] Documentar instalación local alternativa
- [ ] Crear base de datos de desarrollo
- [ ] Configurar DATABASE_URL en .env
- [ ] Verificar conexión

#### T-013: Configurar Prisma

**Estimación**: 5 puntos
**Prioridad**: Must Have
**Labels**: `infrastructure`, `database`, `backend`

**Checklist:**

- [ ] Instalar Prisma y Prisma Client
- [ ] Inicializar Prisma (prisma init)
- [ ] Crear schema.prisma base
- [ ] Definir modelos iniciales (Usuario, Perfil)
- [ ] Generar primera migración
- [ ] Generar Prisma Client
- [ ] Configurar scripts en package.json
- [ ] Documentar comandos Prisma

#### T-014: Crear seed data

**Estimación**: 3 puntos
**Prioridad**: Should Have
**Labels**: `backend`, `database`

**Checklist:**

- [ ] Crear prisma/seed.ts
- [ ] Agregar usuarios de prueba (roles diferentes)
- [ ] Agregar categorías base
- [ ] Agregar script de seed a package.json
- [ ] Documentar cómo usar seed
- [ ] Configurar seed en package.json

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

**Checklist:**

- [ ] Crear diagrama de arquitectura general
- [ ] Crear diagrama de flujo de datos
- [ ] Crear diagrama ER de base de datos
- [ ] Usar herramienta (Mermaid, Draw.io, Excalidraw)
- [ ] Agregar diagramas a docs/technical/architecture.md
- [ ] Exportar versiones en imagen

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
- [ ] CI/CD pipeline funcional
- [ ] Estructura de proyecto lista
- [ ] Base de datos configurada con Prisma
- [ ] Documentación técnica completa
- [ ] Al menos 1 desarrollador puede clonar y ejecutar el proyecto sin ayuda

**Fecha objetivo**: 31/12/2024
