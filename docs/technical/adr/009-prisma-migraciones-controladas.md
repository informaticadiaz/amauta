# ADR-009: Migraciones Prisma versionadas y deploy controlado

## Estado

Aceptado

## Fecha

2026-03-28

## Contexto

Amauta usa Prisma sobre PostgreSQL y ya tiene un pipeline de despliegue donde el contenedor del backend ejecuta:

```bash
npx prisma migrate deploy && node dist/main.js
```

Eso significa que el schema de base de datos es una pieza crítica de arquitectura, no un detalle local de desarrollo.

Necesitamos una regla explícita para evitar:

- drift entre schema y base de datos
- cambios manuales no auditables
- uso de `db push` como atajo en cambios normales
- deploys con SQL no revisado

## Opciones Consideradas

### Opción A: `prisma db push` como flujo habitual

- **Pros**:
  - Rápido para prototipos
  - Menos pasos al principio
- **Contras**:
  - No deja historial auditable de cambios
  - Facilita drift y cambios irreversibles
  - Incompatible con disciplina de producción seria

### Opción B: Migraciones versionadas con revisión y `migrate deploy` en entornos desplegados (elegida)

- **Pros**:
  - Historial explícito y auditable
  - Mejor trazabilidad y rollback conceptual
  - Consistencia entre repo, CI/CD y producción
- **Contras**:
  - Más fricción que `db push`
  - Exige revisar SQL y estado de migraciones

## Decisión

Adoptamos como política arquitectónica:

1. Todo cambio en `schema.prisma` debe generar una **migración versionada**.
2. En entornos desplegados, el flujo normal es **`prisma migrate deploy`**.
3. `prisma db push` queda fuera del flujo normal del proyecto.
4. Antes de aplicar cambios se debe verificar estado de migraciones y validar el schema.
5. Si aparece drift entre DB y schema, el trabajo se detiene hasta resolver la inconsistencia.

## Consecuencias

### Positivas

- Reduce riesgo operativo en despliegues.
- Hace auditables los cambios de schema.
- Alinea desarrollo, CI/CD y producción bajo un único contrato.

### Negativas

- Agrega disciplina y pasos obligatorios.
- Vuelve más costosos los cambios improvisados de schema.

### Neutras

- El SQL generado pasa a ser parte del diseño revisable del sistema.

## Referencias

- `C:\Users\infor\DevHome\amauta\DEPLOYMENT_PROGRESS.md`
- `C:\Users\infor\DevHome\amauta\apps\api\prisma\schema.prisma`
- `C:\Users\infor\DevHome\amauta\apps\api\prisma\migrations\`
