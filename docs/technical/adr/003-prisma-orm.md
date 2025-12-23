# ADR-003: Usar Prisma como ORM

## Estado

Aceptado

## Fecha

2024-12-10

## Contexto

Necesitamos una forma de interactuar con PostgreSQL desde el backend. Opciones van desde SQL puro hasta ORMs completos.

### Requisitos

- Type safety con TypeScript
- Migraciones de base de datos
- Queries eficientes
- Buena developer experience
- Soporte para relaciones complejas

## Opciones Consideradas

### Opción 1: SQL puro (pg driver)

- **Pros**:
  - Control total sobre queries
  - Sin abstracción
  - Máxima performance
- **Contras**:
  - Sin type safety
  - Propenso a errores
  - Mucho código repetitivo
  - SQL injection si no se tiene cuidado

### Opción 2: Query Builder (Knex.js)

- **Pros**:
  - Más expresivo que SQL puro
  - Migraciones incluidas
  - Previene SQL injection
- **Contras**:
  - Types manuales
  - No es un ORM completo
  - Sin relaciones automáticas

### Opción 3: TypeORM

- **Pros**:
  - ORM maduro
  - Decoradores para entidades
  - Migraciones
  - Active Record y Data Mapper
- **Contras**:
  - Types a veces inconsistentes
  - Queries complejas requieren QueryBuilder
  - Documentación confusa en partes

### Opción 4: Prisma (elegida)

- **Pros**:
  - Type safety excelente (generado automáticamente)
  - Schema declarativo (schema.prisma)
  - Migraciones automáticas
  - Prisma Studio para explorar datos
  - Queries intuitivas y type-safe
  - Excelente documentación
- **Contras**:
  - Requiere código generado (prisma generate)
  - Algunas queries complejas requieren $queryRaw
  - No soporta todas las features de PostgreSQL

## Decisión

**Usar Prisma** como ORM para interactuar con PostgreSQL.

### Razones principales

1. **Developer Experience**: Autocompletado perfecto, errores en compile time
2. **Schema como fuente de verdad**: `schema.prisma` define todo el modelo de datos
3. **Migraciones simples**: `prisma migrate dev` genera y aplica migraciones
4. **Prisma Studio**: Interfaz visual para explorar/editar datos
5. **Documentación excelente**: Muy completa y con ejemplos

## Consecuencias

### Positivas

- Queries 100% type-safe
- Menos bugs relacionados a tipos
- Schema versionado en git
- Migraciones reproducibles
- Fácil de aprender

### Negativas

- Dependencia de código generado
- Algunas queries SQL avanzadas no se pueden expresar
- Performance ligeramente menor que SQL puro en casos extremos
- Vendor lock-in parcial

### Neutras

- Requiere correr `prisma generate` después de cambiar schema
- Schema en formato propio (no TypeScript)

## Ejemplo de Schema

```prisma
model Usuario {
  id        String   @id @default(cuid())
  email     String   @unique
  nombre    String
  rol       Rol      @default(ESTUDIANTE)
  cursos    Inscripcion[]
  createdAt DateTime @default(now())
}

model Curso {
  id          String   @id @default(cuid())
  titulo      String
  descripcion String?
  publicado   Boolean  @default(false)
  educadorId  String
  educador    Usuario  @relation(fields: [educadorId], references: [id])
  lecciones   Leccion[]
}
```

## Ejemplo de Query

```typescript
// Buscar cursos con sus lecciones y educador
const cursos = await prisma.curso.findMany({
  where: { publicado: true },
  include: {
    educador: true,
    lecciones: {
      orderBy: { orden: 'asc' },
    },
  },
});
// TypeScript sabe exactamente qué campos tiene `cursos`
```

## Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma vs TypeORM](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
