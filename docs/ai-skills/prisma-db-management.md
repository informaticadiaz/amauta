# Skill: Prisma & Database Management

> Protocolo para trabajar con Prisma, migraciones y la base de datos en producción (VPS).

## Politica del Proyecto (obligatoria)

- Todo cambio en `apps/api/prisma/schema.prisma` requiere migracion versionada en `apps/api/prisma/migrations/`.
- `npx prisma migrate status` se ejecuta antes de tocar el schema.
- `npx prisma validate` se ejecuta despues de tocar el schema.
- El SQL de la migracion se revisa antes de aplicarlo.
- En produccion el flujo normal usa `npx prisma migrate deploy`.
- `npx prisma db push` no es un flujo valido para cambios normales del proyecto.
- Si hay drift o desalineacion entre DB y schema, se detiene el desarrollo hasta resolverlo.

---

## Contexto del Entorno

### Setup Actual

| Entorno        | Base de Datos             | Ubicación                                   |
| -------------- | ------------------------- | ------------------------------------------- |
| **Producción** | PostgreSQL 15             | VPS (Dokploy) - `amauta-api.diazignacio.ar` |
| **Local**      | Docker Compose (opcional) | `localhost:5432`                            |

### Conexión Actual

El desarrollo se realiza **conectándose directamente a la DB del VPS**.

```bash
# Producción (VPS)
DATABASE_URL=postgresql://usuario:password@vps-host:5432/amauta_prod

# Local (si se usa Docker Compose)
DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev
```

**⚠️ CRÍTICO**: Verificar siempre a qué DB estás conectado antes de ejecutar comandos destructivos.

---

## Protocolo de Migraciones

### ANTES de cualquier cambio en schema.prisma

```bash
# 1. Verificar estado actual
cd apps/api
npx prisma migrate status

# 2. Si hay drift (diferencias), investigar antes de continuar
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma
```

### Flujo para cambios en el schema

```
1. VERIFICAR ESTADO
   └── npx prisma migrate status
   └── ¿Hay migraciones pendientes? → Aplicarlas primero
   └── ¿Hay drift? → Investigar y resolver

2. MODIFICAR SCHEMA
   └── Editar prisma/schema.prisma
   └── npx prisma validate (verificar sintaxis)

3. CREAR MIGRACIÓN (desarrollo)
   └── npx prisma migrate dev --name descripcion_cambio
   └── Esto: crea migración + aplica + regenera client

4. APLICAR EN PRODUCCIÓN
   └── npx prisma migrate deploy
   └── Solo aplica migraciones pendientes, no crea nuevas

5. VERIFICAR
   └── npx prisma migrate status
   └── Probar la aplicación
```

### Comandos por Situación

| Situación             | Comando                             | Notas                          |
| --------------------- | ----------------------------------- | ------------------------------ |
| Ver estado            | `npx prisma migrate status`         | Siempre primero                |
| Crear migración (dev) | `npx prisma migrate dev --name xxx` | Crea + aplica + genera client  |
| Aplicar en prod       | `npx prisma migrate deploy`         | Solo aplica pendientes         |
| Regenerar client      | `npx prisma generate`               | Si cambió el schema            |
| Ver DB real           | `npx prisma studio`                 | UI en localhost:5555           |
| Validar schema        | `npx prisma validate`               | Sin conectar a DB              |
| Sincronizar desde DB  | `npx prisma db pull`                | ⚠️ Sobrescribe schema.prisma   |
| Push sin migración    | `npx prisma db push`                | ❌ Prohibido como flujo normal |

---

## Verificación de Alineación DB ↔ Schema

### Detectar problemas

```bash
# Ver si hay migraciones sin aplicar o drift
npx prisma migrate status

# Posibles resultados:
# ✅ "Database schema is up to date"
# ⚠️ "X migrations have not yet been applied"
# ❌ "Drift detected" - schema y DB no coinciden
```

### Resolver drift

```bash
# 1. Ver qué cambió
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# 2. Opciones:
# A) Si la DB tiene los cambios correctos → npx prisma db pull
# B) Si el schema es correcto → npx prisma migrate dev --name fix_drift
# C) Si es complejo → revisar manualmente y decidir
```

### Resolver migraciones fallidas

```bash
# Marcar como aplicada (si ya se aplicó manualmente)
npx prisma migrate resolve --applied <migration_name>

# Marcar como rolled back (si falló y se revirtió)
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## Trabajo con VPS (Producción)

### Verificar conexión

```bash
# Verificar que la DB responde
npx prisma db execute --stdin <<< "SELECT 1"

# Ver versión de PostgreSQL
npx prisma db execute --stdin <<< "SELECT version()"
```

### Ejecutar migraciones en producción

```bash
# SIEMPRE usar deploy, nunca dev
npx prisma migrate deploy

# Verificar después
npx prisma migrate status
```

### Seed en producción

```bash
# ⚠️ Cuidado: verificar que el seed es idempotente
npx prisma db seed

# El seed de Amauta usa upsert, es seguro re-ejecutar
```

---

## Reglas de Seguridad

### ❌ NUNCA hacer en producción

```bash
# NUNCA - borra toda la DB
npx prisma migrate reset

# NUNCA - puede causar pérdida de datos
npx prisma db push --force-reset

# NUNCA - sin verificar primero
npx prisma db pull  # sobrescribe tu schema

# NUNCA - reemplazar migraciones versionadas
npx prisma db push
```

### ✅ SIEMPRE hacer

1. **Verificar estado** antes de cualquier operación
2. **Backup** antes de migraciones importantes
3. **Usar `migrate deploy`** en producción, no `migrate dev`
4. **Revisar la migración SQL** antes de aplicar
5. **Probar en local** si es posible
6. **Crear migración versionada** si cambió `schema.prisma`

---

## Troubleshooting

### "Authentication failed"

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar conectividad
pg_isready -h HOST -p 5432 -U USER
```

### "Migration failed"

```bash
# Ver qué falló
npx prisma migrate status

# Ver el SQL que intentó ejecutar
cat prisma/migrations/XXXXX_nombre/migration.sql

# Opciones:
# 1. Arreglar manualmente en DB + resolve --applied
# 2. Revertir en DB + resolve --rolled-back
# 3. Editar migración (solo si no se aplicó en ningún lado)
```

### "Drift detected"

```bash
# Ver diferencias exactas
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma

# Decidir: ¿quién tiene razón, el schema o la DB?
```

### Schema y DB desincronizados

```bash
# Opción A: DB es la fuente de verdad
npx prisma db pull          # Actualiza schema.prisma
npx prisma generate         # Regenera client

# Opción B: Schema es la fuente de verdad
npx prisma migrate dev --name sync_fix  # Crea migración para alinear DB
```

---

## Checklist Pre-Migración

Antes de ejecutar `prisma migrate dev` o `prisma migrate deploy`:

- [ ] ¿Ejecuté `prisma migrate status`?
- [ ] ¿Sé a qué base de datos estoy conectado? (local vs VPS)
- [ ] ¿El schema.prisma está validado? (`prisma validate`)
- [ ] ¿Existe migración versionada si cambió `schema.prisma`?
- [ ] ¿Hay backup de la DB si es producción?
- [ ] ¿Revisé el SQL que se va a ejecutar?
- [ ] ¿Los cambios son backwards compatible? (no rompen la app actual)

---

## Configuración de Entorno

### Para desarrollo local (recomendado)

```bash
# 1. Levantar DB local
docker compose up -d postgres

# 2. Crear .env.local con DB local
DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev

# 3. Aplicar migraciones
cd apps/api && npx prisma migrate dev

# 4. Seed
npx prisma db seed
```

### Para conectar a VPS

```bash
# Usar .env con credenciales de producción
# ⚠️ NUNCA commitear credenciales de producción

DATABASE_URL=postgresql://USER:PASS@VPS_HOST:5432/amauta_prod
```

---

## Notas para IA

1. **SIEMPRE preguntar** a qué entorno está conectado el usuario antes de sugerir comandos
2. **NUNCA sugerir** `migrate reset` o `db push --force-reset` sin advertencia clara
3. **Verificar estado** (`migrate status`) antes de cualquier operación
4. **Leer el schema real** (`schema.prisma`) antes de escribir queries
5. **Si hay duda**, preguntar al usuario en lugar de asumir
6. **No sugerir `prisma db push`** como solución estándar para cambios de schema
