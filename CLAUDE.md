# CLAUDE.md

## Información del Proyecto Amauta

Este documento proporciona contexto e información relevante para Claude Code al trabajar en el proyecto Amauta.

## Descripción del Proyecto

Amauta es un sistema educativo para la gestión del aprendizaje.

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
│       └── README.md
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
    ├── project-management/
    │   ├── README.md
    │   ├── metodologia.md
    │   ├── roadmap.md
    │   ├── sprints.md
    │   ├── tareas.md
    │   ├── fase-0-tareas.md
    │   ├── backlog.md
    │   └── project-board.md
    └── technical/
        ├── README.md
        ├── architecture.md
        ├── coding-standards.md
        ├── database.md
        ├── setup.md
        ├── environment-variables.md
        ├── SECURITY_README.md              # ⭐ Índice de seguridad
        ├── vps-deployment-analysis.md      # Plan de deployment
        ├── PRIVATE_DATA_STORAGE.md         # Almacenamiento seguro
        └── PRIVATE_REPO_REFERENCE.md       # Repo privado
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

#### Seguridad y Deployment

- `docs/technical/SECURITY_README.md` - ⭐ Índice maestro de seguridad
- `docs/technical/vps-deployment-analysis.md` - Análisis y plan de deployment
- `docs/technical/PRIVATE_DATA_STORAGE.md` - Guía de almacenamiento seguro
- `docs/technical/PRIVATE_REPO_REFERENCE.md` - Referencia a repositorio privado
- `.github/SECURITY_SANITIZATION.md` - Guía de sanitización de datos sensibles

### Documentación de Gestión

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

### Completado (Fase 0)

- ✅ T-001: .gitignore configurado (issue #1)
- ✅ T-002: Licencia AGPL-3.0 establecida (issue #2)
- ✅ T-003: Código de Conducta creado (issue #11)
- ✅ T-004: Guía de Contribución creada (issue #12)
- ✅ T-005: GitHub Actions CI configurado (issue #3)
- ✅ T-006: Placeholders de tests en CI (issue #13)
- ✅ T-007: Pre-commit hooks con Husky (issue #14)
- ✅ T-008: Estructura de monorepo con Turborepo (issue #4)
- ✅ T-009: TypeScript configurado con strict mode (issue #5)
- ✅ T-010: ESLint y Prettier configurados (issue #6)
- ✅ T-011: Variables de entorno con validación Zod (issue #7)
- ✅ T-012: PostgreSQL 15 + Redis 7 con Docker (issue #8)
- ✅ T-013: Prisma ORM con schema completo (issue #9)

### En Progreso (Fase 0)

- 🚧 Fase 0: Fundamentos y documentación - 76% completado (13/17 tareas)

### Pendiente (Orden de Prioridad)

- 🎯 **SIGUIENTE**: T-014: Crear seed data (issue #15) o T-014bis: Expandir CI (issue #10)
- ⏳ T-015: Crear diagramas de arquitectura (issue #16)
- ⏳ T-016: Documentar API endpoints (issue #17)
- 🆕 T-017: Configurar deployment en VPS con Dokploy (issue #18)

## Notas para Claude Code

### Generales

- El proyecto está en fase inicial de desarrollo
- Usar español para toda la comunicación y documentación
- **SIEMPRE seguir el workflow definido en `WORKFLOW.md`**
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

### Orden de Issues

- **IMPORTANTE**: Seguir el orden numérico de tareas (T-001, T-002, T-003...)
- Saltear tareas que tengan dependencias no resueltas
- Consultar `docs/project-management/fase-0-tareas.md` para dependencias
