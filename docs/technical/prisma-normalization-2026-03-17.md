# Prisma Normalization Runbook - 2026-03-17

## Objetivo

Recuperar una historia versionada de Prisma para Amauta sin destruir la base productiva existente.

Esta normalización toma como fuente de verdad únicamente el estado versionado y desplegado.
No considera cambios locales no pusheados.

## Estado reconstruido en Git

Se agregó una migración baseline:

1. `20260317000100_baseline_prod_schema`
   - Representa exactamente el schema que hoy está desplegado en producción.
   - Coincide con el schema commiteado en `HEAD`.
   - Debe marcarse como aplicada en producción, no volver a ejecutarse sobre una base ya existente.

## Archivos relevantes

- `apps/api/prisma/migrations/migration_lock.toml`
- `apps/api/prisma/migrations/20260317000100_baseline_prod_schema/migration.sql`
- `apps/api/prisma/schema.prisma`

## Estado objetivo de la normalización

Al finalizar, Prisma debe quedar así:

- carpeta `prisma/migrations/` versionada en Git
- baseline registrada en la metadata de Prisma en producción
- `prisma migrate status` sin inconsistencias respecto del schema desplegado
- futuras evoluciones hechas con migraciones versionadas

## Estrategia recomendada para producción

### Paso 1: backup

Hacer backup completo antes de tocar metadata de Prisma.

### Paso 2: desplegar código con la carpeta `prisma/migrations/`

La imagen o release debe incluir la migración baseline reconstruida.

### Paso 3: marcar baseline como aplicada

En producción, sobre la DB actual, ejecutar:

```bash
npx prisma migrate resolve --applied 20260317000100_baseline_prod_schema
```

Esto no cambia tablas ni datos. Solo registra en Prisma que ese baseline ya existe en la base.

### Paso 4: verificar estado

```bash
npx prisma migrate status
```

Resultado esperado:

- baseline marcada como aplicada
- sin migraciones pendientes
- sin drift respecto del schema actualmente desplegado

### Paso 5: regenerar client donde corresponda

En build o release:

```bash
npx prisma generate
```

## Qué no forma parte de esta normalización

No se incluyen:

- cambios locales sin push en `apps/api/prisma/schema.prisma`
- tablas o enums del módulo `evaluaciones`
- migraciones derivadas de trabajo no publicado

Si en el futuro esos cambios se quieren conservar, deberán entrar en una migración nueva y separada, partiendo de esta baseline ya normalizada.

## Advertencias

- No ejecutar el baseline con `migrate deploy` sobre una base ya existente.
- No usar `migrate reset` en producción.
- No usar `db push` para seguir evolucionando el schema productivo si el objetivo es recuperar trazabilidad.

## Validación posterior

Después de normalizar:

```bash
npx prisma migrate status
```

Se espera:

- baseline registrada
- sin drift
- schema y DB alineados
- punto de partida limpio para futuras migraciones
