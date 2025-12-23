# Architecture Decision Records (ADR)

## ¿Qué son los ADRs?

Los ADRs documentan las decisiones arquitectónicas importantes del proyecto. Cada ADR explica:

- **Contexto**: ¿Cuál era el problema o necesidad?
- **Decisión**: ¿Qué decidimos hacer?
- **Consecuencias**: ¿Qué implica esta decisión?

## ¿Por qué documentar decisiones?

1. **Memoria institucional**: Nuevos miembros entienden el "por qué"
2. **Evitar repetir discusiones**: La decisión ya está documentada
3. **Facilitar cambios**: Saber qué consideramos antes de cambiar
4. **Transparencia**: Cualquiera puede entender las decisiones

## Estado de los ADRs

| Estado        | Significado                   |
| ------------- | ----------------------------- |
| **Propuesto** | En discusión, no implementado |
| **Aceptado**  | Decidido e implementado       |
| **Deprecado** | Reemplazado por otra decisión |
| **Rechazado** | Considerado pero descartado   |

## Índice de ADRs

| #                                  | Título                          | Estado   | Fecha   |
| ---------------------------------- | ------------------------------- | -------- | ------- |
| [001](./001-monorepo-turborepo.md) | Usar Turborepo para monorepo    | Aceptado | 2024-12 |
| [002](./002-nestjs-fastify.md)     | Backend con NestJS + Fastify    | Aceptado | 2024-12 |
| [003](./003-prisma-orm.md)         | Usar Prisma como ORM            | Aceptado | 2024-12 |
| [004](./004-nextjs-app-router.md)  | Frontend con Next.js App Router | Aceptado | 2024-12 |
| [005](./005-deployment-dokploy.md) | Deployment con Dokploy en VPS   | Aceptado | 2024-12 |

## Template para nuevos ADRs

```markdown
# ADR-XXX: Título de la Decisión

## Estado

[Propuesto | Aceptado | Deprecado | Rechazado]

## Fecha

YYYY-MM-DD

## Contexto

[Descripción del problema o necesidad que motivó la decisión]

## Opciones Consideradas

### Opción 1: [Nombre]

- **Pros**: ...
- **Contras**: ...

### Opción 2: [Nombre]

- **Pros**: ...
- **Contras**: ...

## Decisión

[Qué decidimos hacer y por qué]

## Consecuencias

### Positivas

- ...

### Negativas

- ...

### Neutras

- ...

## Referencias

- [Links relevantes]
```

## Cómo proponer un nuevo ADR

1. Crear archivo `docs/technical/adr/XXX-titulo.md`
2. Usar el template
3. Estado inicial: **Propuesto**
4. Discutir con el equipo
5. Si se acepta, cambiar estado a **Aceptado**

---

**Última actualización**: 2025-12-23
