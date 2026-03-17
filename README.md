# Amauta

> **Plataforma educativa de acceso público y universal**

Amauta es una plataforma educativa progresiva (PWA) que busca democratizar el conocimiento, garantizando el acceso libre a la educación para todos, sin distinciones económicas, sociales o territoriales.

## Filosofía

Amauta toma su nombre del término quechua que designaba al sabio y educador del mundo andino, responsable de transmitir conocimiento, valores y pensamiento crítico al servicio de la comunidad.

No concebimos la educación como un producto, sino como un **derecho social**. Nuestro propósito es poner el saber al servicio del pueblo, recuperando una tradición educativa donde enseñar y aprender son actos colectivos, políticos y transformadores.

## Características Principales

### Acceso Universal

- **Funciona en cualquier dispositivo**: Web, móvil, tablet, desktop
- **Offline-first**: Contenido disponible sin conexión a internet
- **PWA instalable**: Experiencia similar a app nativa
- **Accesible**: Cumple estándares WCAG 2.1

### Para Estudiantes

- Catálogo abierto de cursos gratuitos
- Seguimiento de progreso personal
- Evaluaciones y certificaciones
- Comunidad de aprendizaje
- Descarga de contenido para estudio offline

### Para Educadores

- Crear y publicar cursos libremente
- Herramientas de creación de contenido
- Seguimiento de estudiantes
- Analytics de rendimiento
- Sistema de evaluaciones

### Para Instituciones Educativas

- Gestión de grupos y clases
- Registro de asistencias
- Sistema de calificaciones
- Comunicados y notificaciones
- Reportes académicos

## Stack Tecnológico

### Frontend

- **Next.js 14+** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Workbox** - Service workers y PWA

### Backend

- **Node.js 20+** - Runtime
- **NestJS + Fastify** - API framework enterprise
- **PostgreSQL 15+** - Base de datos principal
- **Prisma** - ORM
- **Redis 7+** - Caché y sesiones (desde Fase 1)

> Política de Prisma: todo cambio en `apps/api/prisma/schema.prisma` requiere migración versionada. `prisma db push` no se usa como flujo normal del proyecto.

### DevOps

- **Turborepo** - Monorepo build system
- **Docker Compose** - Desarrollo local (obligatorio)
- **Dokploy** - Deployment en VPS
- **GitHub Actions** - CI/CD
- **Jest** - Testing

## Estructura del Monorepo

El proyecto está organizado como un monorepo usando Turborepo:

```
amauta/
├── apps/
│   ├── web/              # Frontend Next.js PWA
│   └── api/              # Backend API REST
├── packages/
│   ├── shared/           # Código compartido
│   └── types/            # Tipos TypeScript compartidos
├── docs/                 # Documentación
├── .github/              # CI/CD workflows
├── turbo.json            # Configuración de Turborepo
└── package.json          # Workspace raíz
```

### Apps

- **@amauta/web**: Aplicación frontend con Next.js, PWA, Tailwind CSS
- **@amauta/api**: API backend con NestJS + Fastify, PostgreSQL, Prisma

### Packages

- **@amauta/shared**: Utilidades y código compartido entre apps
- **@amauta/types**: Definiciones de tipos TypeScript compartidos

## Estado del Proyecto

🟢 **EN PRODUCCIÓN** - Fase 0: Fundamentos (100% completado)

### 🌐 URLs de Producción

- **Frontend**: https://amauta.diazignacio.ar
- **Backend API**: https://amauta-api.diazignacio.ar

Ver [Roadmap](./docs/project-management/roadmap.md) para el plan completo de desarrollo.

### Fases

- ✅ **Fase 0**: Fundamentos y documentación (18/18 tareas completadas)
  - ✅ Repositorio y estructura configurada
  - ✅ CI/CD básico con GitHub Actions
  - ✅ Monorepo con Turborepo
  - ✅ TypeScript con strict mode
  - ✅ ESLint y Prettier configurados
  - ✅ Pre-commit hooks con Husky
  - ✅ Variables de entorno con validación Zod
  - ✅ PostgreSQL 15 + Redis 7 configurados con Docker
  - ✅ Prisma ORM con schema completo (15 modelos)
  - ✅ Backend API con NestJS + Fastify
  - ✅ Frontend con Next.js 14 (App Router)
  - ✅ **Deployment en producción** (Dokploy en VPS)
  - ✅ **Seed data** (5 etapas: usuarios, categorías, cursos, inscripciones, administrativo)
  - ✅ **Diagramas de arquitectura** (Mermaid: ER, flujos, deployment)
- 📋 **Fase 1**: MVP - Plataforma de cursos básica (próximo)
- 📋 **Fase 2**: Offline-First & PWA
- 📋 **Fase 3**: Evaluaciones y certificaciones
- 📋 **Fase 4**: Módulo administrativo escolar
- 📋 **Fase 5+**: Ver roadmap completo

## Documentación

### Para Desarrolladores

- [Arquitectura del Sistema](./docs/technical/architecture.md)
- [Guía de Configuración](./docs/technical/setup.md)
- [Estándares de Código](./docs/technical/coding-standards.md)
- [Base de Datos](./docs/technical/database.md)
- [Variables de Entorno y Seguridad](./docs/technical/environment-variables.md) 🔒

### Para Gestión de Proyecto

- [Roadmap](./docs/project-management/roadmap.md)
- [Metodología Ágil](./docs/project-management/metodologia.md)
- [Gestión de Sprints](./docs/project-management/sprints.md)
- [Planificación de Tareas](./docs/project-management/tareas.md)

## Instalación Rápida

### Requisitos Previos

**Obligatorios:**

- **Node.js** 20+ ([Descargar](https://nodejs.org/))
- **npm** 10+ (viene con Node.js)
- **Docker** & **Docker Compose** ([Descargar Docker Desktop](https://www.docker.com/products/docker-desktop))
  - Obligatorio para desarrollo local (PostgreSQL + Redis)
  - Alternativa: Instalar PostgreSQL 15+ y Redis 7+ manualmente (ver [guía](./docker/postgres/LOCAL_INSTALL.md))

### Setup Básico

```bash
# 1. Clonar repositorio
git clone https://github.com/informaticadiaz/amauta.git
cd amauta

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cd apps/api
cp .env.example .env.local
# Editar .env.local con tus configuraciones

cd ../web
cp .env.example .env.local
# Editar .env.local con tus configuraciones

cd ../..

# ⚠️ IMPORTANTE: Los archivos .env.local NUNCA se suben al repositorio
# Contienen información sensible y están protegidos por .gitignore
# Ver docs/technical/environment-variables.md para más detalles
```

### ⚠️ Configuración de Base de Datos (Obligatorio)

El proyecto usa **PostgreSQL** (obligatorio) y **Redis** (opcional, usado desde Fase 1). Tienes dos opciones:

#### Opción A: Con Docker (Recomendado - Más fácil) 🐳

```bash
# 1. Iniciar servicios (PostgreSQL + Redis)
docker compose up -d

# 2. Verificar que estén corriendo
docker compose ps

# 3. Ejecutar migraciones de Prisma
npm run prisma:migrate --workspace=@amauta/api
# Te pedirá un nombre, por ejemplo: "init"

# 4. Ver logs (opcional)
docker compose logs -f
```

#### Opción B: Sin Docker (Instalación Local)

Si prefieres no usar Docker:

```bash
# 1. Instalar PostgreSQL 15+ localmente
# Ver guía completa: docker/postgres/LOCAL_INSTALL.md

# 2. Crear base de datos
sudo -u postgres psql
# Ejecutar comandos SQL (ver guía)

# 3. Ejecutar migraciones
npm run prisma:migrate --workspace=@amauta/api
```

**📖 Guías detalladas:**

- [Setup completo](./docs/technical/setup.md) - Configuración paso a paso
- [Instalación PostgreSQL local](./docker/postgres/LOCAL_INSTALL.md) - Sin Docker
- [Comandos Prisma](./apps/api/prisma/README.md) - Gestión de base de datos

### Ejecutar el Proyecto

```bash
# Desarrollo (cuando esté implementado)
npm run dev              # Iniciar todo
npm run dev:api          # Solo backend
npm run dev:web          # Solo frontend

# Base de datos
npm run prisma:studio --workspace=@amauta/api  # Interface gráfica (localhost:5555)
```

### 🟢 Estado del Proyecto

**Fase 0: Fundamentos** ✅ COMPLETADO (18/18 tareas)

✅ **Configurado y en Producción:**

- Monorepo con Turborepo
- TypeScript con strict mode
- ESLint y Prettier
- Pre-commit hooks con Husky
- Variables de entorno con validación Zod
- PostgreSQL 15 + Redis 7 (Docker)
- Prisma ORM con 15 modelos
- Backend NestJS + Fastify
- Frontend Next.js 14
- **Deployment en producción** (Dokploy)
- **Seed data completo** (10 usuarios, 6 cursos, 15 lecciones, etc.)
- **Diagramas de arquitectura** (Mermaid en docs/technical/architecture.md)

Ver [Estado Completo](#estado-del-proyecto) más arriba para detalles.

---

**Nota**: Si solo quieres explorar el código sin base de datos, puedes saltar la configuración de Docker/PostgreSQL. La mayoría del código TypeScript funcionará sin base de datos.

## Contribuir

Amauta es un proyecto de código abierto y damos la bienvenida a contribuciones de la comunidad.

**Lee nuestra [Guía de Contribución completa](./CONTRIBUTING.md)** para información detallada sobre cómo contribuir.

### Resumen Rápido

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/mi-feature`)
3. **Commit** tus cambios siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. **Push** a tu rama (`git push origin feature/mi-feature`)
5. Abre un **Pull Request**

### Recursos para Contribuidores

- 📋 [Guía de Contribución Completa](./CONTRIBUTING.md) - **Comienza aquí**
- 🤝 [Código de Conducta](./CODE_OF_CONDUCT.md) - Requisito para todos
- 🛠️ [Workflow de Issues](./WORKFLOW.md) - Proceso de trabajo
- 📐 [Estándares de Código](./docs/technical/coding-standards.md)
- 🗺️ [Roadmap](./docs/project-management/roadmap.md) - Prioridades del proyecto
- 🏗️ [Arquitectura](./docs/technical/architecture.md) - Diseño del sistema

### Formas de Contribuir

- 🐛 Reportar bugs
- 💡 Sugerir features
- 📝 Mejorar documentación
- 💻 Contribuir código
- 🌍 Ayudar con traducciones (futuro)
- 💬 Participar en discusiones

## Principios de Diseño

### 1. Accesibilidad Universal

Diseñamos para que **todos** puedan acceder, sin importar:

- Dispositivo (móvil básico, computadora antigua, última tecnología)
- Conectividad (offline, 2G, 4G, fibra)
- Capacidades (visual, motriz, cognitiva)
- Idioma (español, inglés, idiomas originarios)

### 2. Simplicidad

Interfaces claras, directas y sin fricción. El aprendizaje debe ser el foco, no la tecnología.

### 3. Privacidad y Seguridad

Los datos de los usuarios son sagrados. Transparencia total sobre qué recopilamos y por qué.

### 4. Código Abierto

Transparencia técnica y social. El código es un bien común.

### 5. Sostenibilidad

Código mantenible, documentado y pensado para durar décadas, no meses.

## Licencia

Este proyecto está licenciado bajo la **GNU Affero General Public License v3.0 (AGPL-3.0)**.

La AGPL-3.0 garantiza que:

- El código fuente permanece abierto y accesible para todos
- Cualquier modificación debe compartirse con la comunidad
- Incluso si se usa como servicio web, el código debe permanecer abierto
- Protege el espíritu de código abierto al servicio del bien común educativo

Ver el archivo [LICENSE](./LICENSE) para el texto completo de la licencia.

### ¿Por qué AGPL-3.0?

Elegimos AGPL-3.0 porque:

1. **Protege la libertad educativa**: Garantiza que Amauta siempre será libre y abierto
2. **Previene apropiación privada**: Nadie puede tomar el código y cerrarlo en un servicio propietario
3. **Fomenta la colaboración**: Cualquier mejora debe compartirse con la comunidad
4. **Alineada con nuestros valores**: La educación es un derecho, no un producto comercial

## Comunidad y Contacto

- **Repositorio**: [GitHub](https://github.com/tu-org/amauta)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-org/amauta/discussions)
- **Issues**: [GitHub Issues](https://github.com/tu-org/amauta/issues)
- **Email**: contacto@amauta.org (por definir)

## Valores del Proyecto

### Transparencia

Comunicación abierta sobre decisiones técnicas, roadmap y prioridades.

### Colaboración

Trabajamos juntos, aprendemos juntos, crecemos juntos.

### Calidad

Excelencia técnica al servicio del impacto social.

### Impacto Social

Cada línea de código tiene un propósito: democratizar el conocimiento.

### Inclusión

Todos son bienvenidos, sin importar experiencia, origen o identidad.

## Código de Conducta

Este proyecto adhiere al [Código de Conducta de Contributor Covenant](./CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código. Por favor, reporta comportamientos inaceptables a través de los canales especificados en el documento.

## Agradecimientos

A todas las personas que creen en la educación como derecho fundamental y contribuyen con su tiempo, conocimiento y energía para hacer de Amauta una realidad.

---

**"El conocimiento es un bien común que debe fluir libremente al servicio de la humanidad."**

---

## Status

![Production](https://img.shields.io/badge/production-online-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-green)
