# Base de Datos - Amauta

## Tecnología

- **Motor**: PostgreSQL 15+
- **ORM**: Prisma
- **Migraciones**: Prisma Migrate
- **Caché**: Redis

## Esquema de Base de Datos

### Diagrama ER Simplificado

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Usuario   │───────│  Inscripcion │───────│    Curso    │
└─────────────┘       └──────────────┘       └─────────────┘
      │                                             │
      │                                             │
      │                                       ┌─────────────┐
      │                                       │   Leccion   │
      │                                       └─────────────┘
      │                                             │
      │                                       ┌─────────────┐
      │                                       │  Contenido  │
      │                                       └─────────────┘
      │
┌─────────────┐
│   Progreso  │
└─────────────┘
```

## Modelos Principales

### Usuario

```prisma
model Usuario {
  id            String   @id @default(cuid())
  email         String   @unique
  nombre        String
  apellido      String
  rol           Rol      @default(ESTUDIANTE)
  password      String   // Hash bcrypt
  avatar        String?
  activo        Boolean  @default(true)
  emailVerificado DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  cursosCreados    Curso[]        @relation("Educador")
  inscripciones    Inscripcion[]
  progresos        Progreso[]
  perfil           Perfil?

  @@index([email])
  @@index([rol])
}

enum Rol {
  ESTUDIANTE
  EDUCADOR
  ADMIN_ESCUELA
  SUPER_ADMIN
}
```

### Perfil

```prisma
model Perfil {
  id          String   @id @default(cuid())
  usuarioId   String   @unique
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])

  bio         String?
  telefono    String?
  pais        String?
  ciudad      String?
  institucion String?

  // Para estudiantes
  matricula   String?
  grado       String?

  // Para educadores
  especialidad String[]
  experiencia  Int?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Curso

```prisma
model Curso {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String
  slug        String      @unique

  educadorId  String
  educador    Usuario     @relation("Educador", fields: [educadorId], references: [id])

  categoria   Categoria   @relation(fields: [categoriaId], references: [id])
  categoriaId String

  nivel       Nivel
  estado      EstadoCurso @default(BORRADOR)

  imagen      String?
  duracion    Int?        // minutos estimados
  idioma      String      @default("es")

  publicadoEn DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relaciones
  lecciones     Leccion[]
  inscripciones Inscripcion[]

  @@index([educadorId])
  @@index([categoriaId])
  @@index([estado])
  @@index([slug])
}

enum Nivel {
  PRINCIPIANTE
  INTERMEDIO
  AVANZADO
}

enum EstadoCurso {
  BORRADOR
  REVISION
  PUBLICADO
  ARCHIVADO
}
```

### Categoría

```prisma
model Categoria {
  id          String   @id @default(cuid())
  nombre      String   @unique
  slug        String   @unique
  descripcion String?
  icono       String?

  cursos      Curso[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}
```

### Lección

```prisma
model Leccion {
  id          String   @id @default(cuid())
  titulo      String
  descripcion String?
  orden       Int

  cursoId     String
  curso       Curso    @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  tipo        TipoLeccion
  duracion    Int?     // minutos

  contenido   Json     // Estructura flexible para diferentes tipos
  recursos    Recurso[]

  publicada   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  progresos   Progreso[]

  @@index([cursoId])
  @@index([orden])
}

enum TipoLeccion {
  VIDEO
  TEXTO
  QUIZ
  INTERACTIVO
  DESCARGABLE
}
```

### Recurso

```prisma
model Recurso {
  id          String   @id @default(cuid())
  nombre      String
  tipo        String   // video/pdf/image/audio
  url         String
  tamano      Int?     // bytes

  leccionId   String
  leccion     Leccion  @relation(fields: [leccionId], references: [id], onDelete: Cascade)

  disponibleOffline Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([leccionId])
}
```

### Inscripción

```prisma
model Inscripcion {
  id          String   @id @default(cuid())

  usuarioId   String
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])

  cursoId     String
  curso       Curso    @relation(fields: [cursoId], references: [id])

  estado      EstadoInscripcion @default(ACTIVO)
  progreso    Int      @default(0) // 0-100

  inscritoEn  DateTime @default(now())
  completadoEn DateTime?

  @@unique([usuarioId, cursoId])
  @@index([usuarioId])
  @@index([cursoId])
}

enum EstadoInscripcion {
  ACTIVO
  COMPLETADO
  ABANDONADO
}
```

### Progreso

```prisma
model Progreso {
  id          String   @id @default(cuid())

  usuarioId   String
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])

  leccionId   String
  leccion     Leccion  @relation(fields: [leccionId], references: [id])

  completado  Boolean  @default(false)
  porcentaje  Int      @default(0) // 0-100

  ultimoAcceso DateTime @default(now())
  completadoEn DateTime?

  // Para quizzes y evaluaciones
  intentos    Int      @default(0)
  mejorPuntaje Float?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([usuarioId, leccionId])
  @@index([usuarioId])
  @@index([leccionId])
}
```

## Módulo Administrativo Escolar

### Institución

```prisma
model Institucion {
  id          String   @id @default(cuid())
  nombre      String
  tipo        TipoInstitucion

  direccion   String?
  telefono    String?
  email       String?

  activa      Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  grupos      Grupo[]
  comunicados Comunicado[]
}

enum TipoInstitucion {
  ESCUELA
  COLEGIO
  UNIVERSIDAD
  CENTRO_FORMACION
}
```

### Grupo/Clase

```prisma
model Grupo {
  id            String      @id @default(cuid())
  nombre        String
  grado         String?
  seccion       String?

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  educadorId    String
  educador      Usuario     @relation(fields: [educadorId], references: [id])

  activo        Boolean     @default(true)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relaciones
  estudiantes   GrupoEstudiante[]
  asistencias   Asistencia[]
  calificaciones Calificacion[]

  @@index([institucionId])
  @@index([educadorId])
}

model GrupoEstudiante {
  grupoId     String
  grupo       Grupo    @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario  @relation(fields: [estudianteId], references: [id])

  inscritoEn  DateTime @default(now())

  @@id([grupoId, estudianteId])
}
```

### Asistencia

```prisma
model Asistencia {
  id          String   @id @default(cuid())

  grupoId     String
  grupo       Grupo    @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario  @relation(fields: [estudianteId], references: [id])

  fecha       DateTime
  estado      EstadoAsistencia

  observaciones String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([grupoId, estudianteId, fecha])
  @@index([grupoId, fecha])
  @@index([estudianteId])
}

enum EstadoAsistencia {
  PRESENTE
  AUSENTE
  TARDANZA
  JUSTIFICADO
}
```

### Calificación

```prisma
model Calificacion {
  id          String   @id @default(cuid())

  grupoId     String
  grupo       Grupo    @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario  @relation(fields: [estudianteId], references: [id])

  materia     String
  periodo     String   // "1er trimestre", "Parcial 1", etc

  nota        Float
  notaMaxima  Float    @default(10)

  observaciones String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([grupoId])
  @@index([estudianteId])
}
```

### Comunicado

```prisma
model Comunicado {
  id            String      @id @default(cuid())

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  autorId       String
  autor         Usuario     @relation(fields: [autorId], references: [id])

  titulo        String
  contenido     String

  tipo          TipoComunicado
  prioridad     Prioridad   @default(NORMAL)

  publicadoEn   DateTime    @default(now())

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([institucionId])
  @@index([tipo])
}

enum TipoComunicado {
  GENERAL
  ACADEMICO
  ADMINISTRATIVO
  EVENTO
  URGENTE
}

enum Prioridad {
  BAJA
  NORMAL
  ALTA
  URGENTE
}
```

## Índices y Optimizaciones

### Índices Importantes

```prisma
// Ya incluidos en los modelos arriba
// Resumen de índices críticos:

@@index([email])              // Usuario - login frecuente
@@index([slug])               // Curso - búsqueda por URL
@@index([cursoId, orden])     // Leccion - ordenamiento
@@index([usuarioId, cursoId]) // Inscripcion - consultas comunes
@@index([grupoId, fecha])     // Asistencia - reportes diarios
```

### Full-Text Search

Para búsqueda de cursos:

```sql
-- Crear índice GIN para búsqueda full-text
CREATE INDEX idx_curso_busqueda ON "Curso"
USING GIN (to_tsvector('spanish', titulo || ' ' || descripcion));
```

## Migraciones

### Crear Migración

```bash
pnpm prisma migrate dev --name agregar_tabla_asistencia
```

### Aplicar en Producción

```bash
pnpm prisma migrate deploy
```

### Rollback

```bash
# Prisma no tiene rollback automático
# Crear migración inversa manualmente
pnpm prisma migrate dev --name revertir_cambio_x
```

## Seeds (Datos Iniciales)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Categorías base
  const categorias = await prisma.categoria.createMany({
    data: [
      { nombre: 'Matemáticas', slug: 'matematicas' },
      { nombre: 'Ciencias', slug: 'ciencias' },
      { nombre: 'Historia', slug: 'historia' },
      { nombre: 'Lengua', slug: 'lengua' },
      { nombre: 'Tecnología', slug: 'tecnologia' },
    ],
  });

  // Usuario admin
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@amauta.org',
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'SUPER_ADMIN',
      password: 'hash_aqui', // Usar bcrypt en implementación real
      emailVerificado: new Date(),
    },
  });

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Backup y Restauración

### Backup

```bash
# Backup completo
pg_dump -U usuario amauta_prod > backup_$(date +%Y%m%d).sql

# Backup solo esquema
pg_dump -U usuario --schema-only amauta_prod > schema.sql
```

### Restauración

```bash
psql -U usuario amauta_prod < backup_20231215.sql
```

## Consideraciones de Performance

1. **Connection Pooling**: Configurar en Prisma
2. **Query Optimization**: Usar `include` selectivamente
3. **Paginación**: Siempre paginar listas grandes
4. **Caché**: Redis para queries frecuentes
5. **Archivado**: Mover datos antiguos a tablas de archivo

## Seguridad

- Passwords hasheados con bcrypt (rounds: 10)
- Row Level Security (RLS) para multi-tenancy
- Auditoría con `createdAt`/`updatedAt`
- Soft deletes con campo `activo`/`eliminado`

## Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
