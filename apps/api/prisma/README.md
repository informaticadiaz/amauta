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
# Ejecutar seed para poblar base de datos con datos de prueba
npm run prisma:seed
```

Ver sección [Datos de Prueba (Seed)](#datos-de-prueba-seed) para más detalles.

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

## Datos de Prueba (Seed)

El seed crea datos de prueba para desarrollo y testing. Es **idempotente**: puede ejecutarse múltiples veces sin duplicar datos.

### Ejecutar Seed

```bash
# Desde apps/api/
npm run prisma:seed

# O desde la raíz del proyecto
npm run prisma:seed --workspace=@amauta/api
```

### Estructura del Seed

```
prisma/
├── seed.ts              # Entry point
└── seeds/
    ├── index.ts         # Orquestador de etapas
    ├── usuarios.ts      # Etapa 1: Usuarios y perfiles
    ├── categorias.ts    # Etapa 2: Categorías (pendiente)
    ├── instituciones.ts # Etapa 2: Instituciones (pendiente)
    ├── cursos.ts        # Etapa 3: Cursos (pendiente)
    ├── inscripciones.ts # Etapa 4: Inscripciones (pendiente)
    └── administrativo.ts # Etapa 5: Asistencias, etc. (pendiente)
```

### Usuarios de Prueba

| Email                     | Password      | Rol           | Nombre          | Descripción                         |
| ------------------------- | ------------- | ------------- | --------------- | ----------------------------------- |
| `superadmin@amauta.test`  | `password123` | SUPER_ADMIN   | Admin Sistema   | Acceso total al sistema             |
| `admin1@amauta.test`      | `password123` | ADMIN_ESCUELA | María García    | Admin Escuela Primaria Belgrano     |
| `admin2@amauta.test`      | `password123` | ADMIN_ESCUELA | Carlos López    | Admin Colegio Secundario San Martín |
| `educador1@amauta.test`   | `password123` | EDUCADOR      | Ana Martínez    | Profesora de Matemáticas            |
| `educador2@amauta.test`   | `password123` | EDUCADOR      | Pedro Sánchez   | Profesor de Lengua                  |
| `educador3@amauta.test`   | `password123` | EDUCADOR      | Laura Fernández | Profesora de Ciencias               |
| `estudiante1@amauta.test` | `password123` | ESTUDIANTE    | Juan Pérez      | Estudiante 4°A Belgrano             |
| `estudiante2@amauta.test` | `password123` | ESTUDIANTE    | Sofía Rodríguez | Estudiante 4°A Belgrano             |
| `estudiante3@amauta.test` | `password123` | ESTUDIANTE    | Mateo González  | Estudiante 1°A San Martín           |
| `estudiante4@amauta.test` | `password123` | ESTUDIANTE    | Valentina Díaz  | Estudiante 1°A San Martín           |

### Perfiles de Usuario

Cada usuario tiene un perfil completo con:

**Administradores y Educadores:**

- Bio profesional
- Teléfono de contacto
- País y ciudad (Argentina)
- Institución asociada
- Especialidades (solo educadores)
- Años de experiencia (solo educadores)

**Estudiantes:**

- País y ciudad
- Institución
- Matrícula (EST-2024-XXX)
- Grado/curso asignado

### Progreso de Implementación

| Etapa | Issue | Estado        | Datos                                             |
| ----- | ----- | ------------- | ------------------------------------------------- |
| 1     | #23   | ✅ Completado | 10 usuarios, 10 perfiles                          |
| 2     | #24   | ⏳ Pendiente  | 6 categorías, 2 instituciones, 4 grupos           |
| 3     | #25   | ⏳ Pendiente  | 6 cursos, 15 lecciones, 10 recursos               |
| 4     | #26   | ⏳ Pendiente  | 12 inscripciones, ~20 progresos                   |
| 5     | #27   | ⏳ Pendiente  | ~40 asistencias, 16 calificaciones, 4 comunicados |

### Notas Técnicas

- **Password**: Todos los usuarios usan `password123` hasheado con bcrypt (10 rounds)
- **Idempotencia**: Usa `upsert` para evitar duplicados al re-ejecutar
- **Verificación**: Todos los emails están marcados como verificados
- **Dominio de prueba**: Se usa `@amauta.test` (dominio reservado para testing)

### Re-ejecutar Seed

El seed es seguro de re-ejecutar:

```bash
# Re-ejecutar actualiza usuarios existentes sin duplicar
npm run prisma:seed

# Para empezar de cero, resetear la DB primero
npm run prisma:reset  # ⚠️ BORRA TODOS LOS DATOS
npm run prisma:seed
```

---

## Próximos Pasos

1. ✅ Schema creado
2. ✅ Seed data - Etapa 1 (usuarios)
3. ⏳ Seed data - Etapas 2-5
4. ⏳ Implementar autenticación con usuarios de prueba

## Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Seeding](https://www.prisma.io/docs/guides/migrate/seed-database)
