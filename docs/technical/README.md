# Documentación Técnica - Amauta

## Índice

### Fundamentos

1. [Arquitectura del Sistema](./architecture.md)
2. [Guía de Configuración](./setup.md)
3. [Estándares de Código](./coding-standards.md)
4. [Base de Datos](./database.md)
5. [Variables de Entorno](./environment-variables.md)
6. [🐳 Guía de Puertos y Redes en Docker](./docker-ports-networking-guide.md) - **Para desarrolladores nuevos en Docker**
7. [📦 Entendiendo Dokploy](./understanding-dokploy-deployment.md) - **Cómo funciona Dokploy con múltiples proyectos**

### API y Testing (Pendientes)

- [ ] API Reference (`api-reference.md`) - Issue #17
- [ ] Testing (`testing.md`)

### Seguridad y Deployment

8. [⭐ Índice de Seguridad](./SECURITY_README.md) - **LEER PRIMERO**
9. [Análisis VPS y Deployment](./vps-deployment-analysis.md)
10. [🚀 Guía de Deployment con Dokploy UI](./dokploy-ui-deployment-guide.md) - **Paso a paso para deployment en producción**
11. [Almacenamiento de Datos Sensibles](./PRIVATE_DATA_STORAGE.md)
12. [Repositorio Privado](./PRIVATE_REPO_REFERENCE.md)
13. [Guía de Sanitización](../.github/SECURITY_SANITIZATION.md)

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
