# Documentación Técnica - Amauta

## 🟢 Estado de Producción

El proyecto está **EN PRODUCCIÓN**:

| Servicio    | URL                               |
| ----------- | --------------------------------- |
| Frontend    | https://amauta.diazignacio.ar     |
| Backend API | https://amauta-api.diazignacio.ar |

Ver [DEPLOYMENT_PROGRESS.md](../../DEPLOYMENT_PROGRESS.md) para estado detallado del deployment.

---

## Índice

### Para Empezar (Onboarding)

1. [⭐ Guía de Onboarding](./onboarding.md) - **EMPEZAR AQUÍ** - Configuración paso a paso
2. [📋 Cheatsheet](./cheatsheet.md) - Referencia rápida de comandos
3. [📖 Glosario](../glosario.md) - Terminología del proyecto

### Fundamentos

4. [Arquitectura del Sistema](./architecture.md)
5. [Guía de Configuración](./setup.md)
6. [Estándares de Código](./coding-standards.md)
7. [Base de Datos](./database.md)
8. [Variables de Entorno](./environment-variables.md)

### Guías de Desarrollo

9. [🧪 Testing](./testing.md) - Cómo escribir y ejecutar tests
10. [🔧 Patrones y Recetas](./patterns.md) - Soluciones a problemas comunes
11. [👁️ Code Review](./code-review.md) - Proceso y criterios de revisión
12. [🐛 Debugging](./debugging.md) - Cómo diagnosticar problemas
13. [🔒 Seguridad para Devs](./security-guide.md) - Prácticas de seguridad
14. [⚡ Performance](./performance.md) - Optimización y métricas

### Decisiones Arquitectónicas (ADR)

15. [ADR Index](./adr/README.md) - Registro de decisiones arquitectónicas
    - [001 - Monorepo con Turborepo](./adr/001-monorepo-turborepo.md)
    - [002 - NestJS + Fastify](./adr/002-nestjs-fastify.md)
    - [003 - Prisma ORM](./adr/003-prisma-orm.md)
    - [004 - Next.js App Router](./adr/004-nextjs-app-router.md)
    - [005 - Deployment con Dokploy](./adr/005-deployment-dokploy.md)

### Docker y Deployment

16. [🐳 Guía de Puertos y Redes en Docker](./docker-ports-networking-guide.md)
17. [📦 Entendiendo Dokploy](./understanding-dokploy-deployment.md)
18. [🚀 Deployment con Dokploy UI](./dokploy-ui-deployment-guide.md)

### Seguridad y Deployment

19. [⭐ Índice de Seguridad](./SECURITY_README.md) - **LEER PRIMERO**
20. [📊 Estado del Deployment](../../DEPLOYMENT_PROGRESS.md) - **Estado actual de producción**
21. [Análisis VPS y Deployment](./vps-deployment-analysis.md)
22. [Almacenamiento de Datos Sensibles](./PRIVATE_DATA_STORAGE.md)
23. [Repositorio Privado](./PRIVATE_REPO_REFERENCE.md)
24. [Guía de Sanitización](../../.github/SECURITY_SANITIZATION.md)

## Propósito

Esta documentación técnica está dirigida a desarrolladores que trabajen en el proyecto Amauta. Contiene información detallada sobre la arquitectura, tecnologías, patrones de diseño y mejores prácticas implementadas.

## Contribución

Para contribuir al proyecto, consulta primero:

- [Guía de Configuración](./setup.md) - Para preparar tu entorno de desarrollo
- [Estándares de Código](./coding-standards.md) - Para mantener la consistencia del código
- [Índice de Seguridad](./SECURITY_README.md) - Para manejo de datos sensibles

### Para Desarrolladores Nuevos

Si eres nuevo en Docker o deployment:

- 🐳 [Guía de Puertos y Redes en Docker](./docker-ports-networking-guide.md) - Conceptos esenciales de networking explicados de forma práctica
- 📦 [Entendiendo Dokploy](./understanding-dokploy-deployment.md) - Cómo funciona Dokploy y deployment multi-proyecto
- 🚀 [Deployment con Dokploy UI](./dokploy-ui-deployment-guide.md) - Tutorial paso a paso para producción

## Seguridad

⚠️ **IMPORTANTE**: Este es un repositorio **PÚBLICO**.

- **Nunca commitear** datos sensibles (IPs, passwords, secrets)
- **Consultar** [Guía de Sanitización](../.github/SECURITY_SANITIZATION.md) antes de cada commit
- **Usar placeholders** en documentación: `[TU-VPS-IP]`, `[TU-DOMINIO]`
- **Datos reales** solo en [repositorio privado](./PRIVATE_REPO_REFERENCE.md)

Ver [SECURITY_README.md](./SECURITY_README.md) para más información.

## Soporte

Para consultas técnicas, crea un issue en el repositorio o contacta al equipo de desarrollo.
