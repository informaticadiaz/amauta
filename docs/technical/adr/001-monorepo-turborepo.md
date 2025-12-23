# ADR-001: Usar Turborepo para Monorepo

## Estado

Aceptado

## Fecha

2024-12-01

## Contexto

Amauta necesita manejar múltiples aplicaciones (frontend web, backend API) y código compartido (tipos, utilidades). Necesitamos decidir cómo estructurar el repositorio.

### Requisitos

- Compartir código entre frontend y backend
- Builds eficientes (no reconstruir todo cuando cambia solo una parte)
- Developer experience fluida
- Escalabilidad para agregar más apps/packages en el futuro

## Opciones Consideradas

### Opción 1: Repositorios Separados (Polyrepo)

- **Pros**:
  - Independencia total entre proyectos
  - CI/CD más simple por repo
  - Equipos pueden trabajar sin interferencia
- **Contras**:
  - Compartir código requiere publicar packages
  - Cambios que afectan múltiples repos son complejos
  - Más overhead de mantenimiento

### Opción 2: Monorepo con npm workspaces

- **Pros**:
  - Nativo de npm, sin herramientas extra
  - Simple de configurar
- **Contras**:
  - Sin caché inteligente
  - Builds lentos al escalar
  - Sin orquestación de tareas

### Opción 3: Monorepo con Turborepo

- **Pros**:
  - Caché de builds (local y remoto)
  - Ejecución paralela inteligente
  - Detección automática de dependencias
  - Usado por Vercel (buena integración con Next.js)
  - Configuración simple (turbo.json)
- **Contras**:
  - Dependencia adicional
  - Curva de aprendizaje inicial

### Opción 4: Monorepo con Nx

- **Pros**:
  - Muy completo y maduro
  - Buenas herramientas de análisis
  - Plugins para muchos frameworks
- **Contras**:
  - Más complejo que Turborepo
  - Overhead mayor para proyectos pequeños
  - Más opinionated

## Decisión

**Usar Turborepo** para gestionar el monorepo.

### Razones principales

1. **Balance complejidad/funcionalidad**: Más simple que Nx pero más potente que npm workspaces puro
2. **Caché inteligente**: Reduce significativamente tiempos de build/test
3. **Integración con Next.js**: Creado por Vercel, excelente soporte
4. **Adopción creciente**: Comunidad activa, buen futuro

## Consecuencias

### Positivas

- Builds incrementales rápidos
- Código compartido sin publicar packages
- Un solo `npm install` para todo
- CI más eficiente con caché

### Negativas

- Devs deben aprender comandos de Turborepo
- Configuración inicial de `turbo.json`
- Posibles conflictos de versiones entre workspaces

### Neutras

- Estructura de carpetas específica (`apps/`, `packages/`)
- Scripts deben definirse en cada package.json

## Estructura Resultante

```
amauta/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend NestJS
├── packages/
│   ├── shared/       # Código compartido
│   └── types/        # Tipos TypeScript
├── turbo.json        # Configuración Turborepo
└── package.json      # Workspace root
```

## Referencias

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Monorepo vs Polyrepo](https://earthly.dev/blog/monorepo-vs-polyrepo/)
- [Vercel Turborepo Announcement](https://vercel.com/blog/vercel-acquires-turborepo)
