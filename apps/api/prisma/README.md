# Prisma - Base de Datos Amauta

Este directorio contiene el schema de Prisma y las migraciones de base de datos.

## Requisitos

- PostgreSQL 15+ corriendo (usa `docker compose up -d` en la raíz del proyecto)
- Variables de entorno configuradas en `apps/api/.env.local`

## Primera Vez - Ejecutar Migración Inicial

**IMPORTANTE**: Antes de ejecutar las migraciones, asegúrate de que PostgreSQL esté corriendo:

```bash
# Desde la raíz del proyecto
docker compose up -d postgres

# Verificar que esté corriendo
docker compose ps
```

Luego, ejecuta la migración inicial:

```bash
# Desde apps/api/
npm run prisma:migrate

# O desde la raíz del proyecto
npm run prisma:migrate --workspace=@amauta/api
```

Esto creará:

1. La primera migración en `prisma/migrations/`
2. Aplicará el schema a la base de datos PostgreSQL
3. Generará Prisma Client automáticamente

## Comandos Disponibles

### Migraciones

```bash
# Crear y aplicar nueva migración (desarrollo)
npm run prisma:migrate

# Aplicar migraciones pendientes (producción)
npm run prisma:migrate:deploy

# Reset completo de base de datos (⚠️ BORRA TODOS LOS DATOS)
npm run prisma:reset
```

### Prisma Client

```bash
# Generar/actualizar Prisma Client
npm run prisma:generate
```

### Prisma Studio

```bash
# Abrir interface gráfica para ver/editar datos
npm run prisma:studio
# Abre en http://localhost:5555
```

### Base de Datos

```bash
# Push schema sin crear migración (desarrollo rápido)
npm run db:push

# Pull schema desde base de datos existente
npm run db:pull
```

### Formateo

```bash
# Formatear schema.prisma
npm run prisma:format
```

### Seed Data

```bash
# Ejecutar seed para poblar base de datos con datos iniciales
npm run prisma:seed
# (Requiere crear prisma/seed.ts primero - ver T-014)
```

## Estructura

```
prisma/
├── README.md              # Este archivo
├── schema.prisma          # Schema de la base de datos
├── migrations/            # Historial de migraciones (generado)
│   └── YYYYMMDD_nombre/
│       └── migration.sql
└── seed.ts               # Datos iniciales (pendiente T-014)
```

## Schema

El schema incluye todos los modelos necesarios para:

### Módulo Educativo

- **Usuario**: Estudiantes, educadores, administradores
- **Perfil**: Información extendida del usuario
- **Categoria**: Categorías de cursos
- **Curso**: Cursos educativos
- **Leccion**: Lecciones dentro de cursos
- **Recurso**: Recursos adjuntos (videos, PDFs, etc.)
- **Inscripcion**: Relación usuario-curso
- **Progreso**: Progreso del usuario en lecciones

### Módulo Administrativo Escolar

- **Institucion**: Escuelas, colegios, universidades
- **Grupo**: Clases o grupos de estudiantes
- **GrupoEstudiante**: Relación grupo-estudiante
- **Asistencia**: Registro de asistencias
- **Calificacion**: Calificaciones de estudiantes
- **Comunicado**: Comunicados institucionales

## Modelos por Implementar

Los modelos ya están definidos en `schema.prisma`. La primera migración los creará todos.

Para ver la documentación completa del esquema:

- Ver `docs/technical/database.md`

## Troubleshooting

### Error: "Can't reach database server"

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps

# Ver logs de PostgreSQL
docker compose logs postgres

# Reiniciar PostgreSQL
docker compose restart postgres
```

### Error: "Environment variable not found: DATABASE_URL"

```bash
# Verificar que .env.local existe y tiene DATABASE_URL
cat .env.local | grep DATABASE_URL

# Debe mostrar algo como:
# DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev
```

### Error en migración

```bash
# Ver estado de migraciones
npx prisma migrate status

# Si hay problemas, reset (⚠️ borra datos)
npm run prisma:reset
```

## Próximos Pasos

1. ✅ Schema creado
2. ⏳ Ejecutar primera migración (requiere PostgreSQL corriendo)
3. ⏳ Crear seed data (T-014)
4. ⏳ Implementar modelos en el código

## Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
