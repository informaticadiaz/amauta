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
- **Node.js** - Runtime
- **Express/Fastify** - API framework
- **PostgreSQL** - Base de datos principal
- **Prisma** - ORM
- **Redis** - Caché y sesiones

### DevOps
- **Turborepo** - Monorepo build system
- **Docker** - Contenedores
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
- **@amauta/api**: API backend con Express/Fastify, PostgreSQL, Prisma

### Packages

- **@amauta/shared**: Utilidades y código compartido entre apps
- **@amauta/types**: Definiciones de tipos TypeScript compartidos

## Estado del Proyecto

🚧 **En desarrollo activo** - Fase 0: Fundamentos

Ver [Roadmap](./docs/project-management/roadmap.md) para el plan completo de desarrollo.

### Fases

- ✅ **Fase 0**: Fundamentos y documentación
- 🚧 **Fase 1**: MVP - Plataforma de cursos básica (próximo)
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

### Para Gestión de Proyecto
- [Roadmap](./docs/project-management/roadmap.md)
- [Metodología Ágil](./docs/project-management/metodologia.md)
- [Gestión de Sprints](./docs/project-management/sprints.md)
- [Planificación de Tareas](./docs/project-management/tareas.md)

## Instalación Rápida

### Requisitos
- Node.js 20+
- npm 10+ (viene con Node.js)

### Setup

```bash
# Clonar repositorio
git clone https://github.com/informaticadiaz/amauta.git
cd amauta

# Instalar dependencias
npm install

# Verificar estructura del monorepo
npm run dev  # Ejecutará todos los workspaces

# Cuando estén configurados (próximos issues):
# - TypeScript (issue #5)
# - Next.js y Express
# - PostgreSQL (issue #8)
# - Prisma (issue #9)
```

**Nota**: El proyecto está en fase inicial. Los workspaces (`apps/web`, `apps/api`) están preparados pero requieren configuración adicional en próximos issues.

Ver [Guía de Configuración](./docs/technical/setup.md) para instrucciones detalladas.

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

![Build Status](https://img.shields.io/badge/build-pending-yellow)
![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-green)
