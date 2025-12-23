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

El seed provee datos de prueba para desarrollo y testing. **No usar en producción**.

### Uso

```bash
# Ejecutar seed
npm run prisma:seed

# Reset completo (borra datos + aplica migraciones + seed)
npm run prisma:reset
```

### Especificación de Datos

#### 1. Usuarios

| Email                      | Nombre    | Apellido  | Rol           | Propósito                              |
| -------------------------- | --------- | --------- | ------------- | -------------------------------------- |
| `admin@amauta.org`         | Admin     | Sistema   | SUPER_ADMIN   | Administrador global del sistema       |
| `director@escuela.edu.ar`  | Daniel    | Martínez  | ADMIN_ESCUELA | Administrador de institución           |
| `maria.gonzalez@edu.ar`    | María     | González  | EDUCADOR      | Educadora - crea cursos de Matemáticas |
| `carlos.lopez@edu.ar`      | Carlos    | López     | EDUCADOR      | Educador - crea cursos de Ciencias     |
| `laura.silva@edu.ar`       | Laura     | Silva     | EDUCADOR      | Educadora - sin cursos (nuevo)         |
| `lucas.fernandez@mail.com` | Lucas     | Fernández | ESTUDIANTE    | Estudiante con progreso avanzado       |
| `valentina.ruiz@mail.com`  | Valentina | Ruiz      | ESTUDIANTE    | Estudiante con inscripciones activas   |
| `mateo.garcia@mail.com`    | Mateo     | García    | ESTUDIANTE    | Estudiante nuevo sin progreso          |

**Password por defecto**: `Amauta2024!` (hasheado con bcrypt, 10 rounds)

#### 2. Perfiles

Cada usuario tiene un perfil asociado:

| Usuario         | Bio                            | Teléfono         | Ciudad       | Datos específicos                                       |
| --------------- | ------------------------------ | ---------------- | ------------ | ------------------------------------------------------- |
| María González  | "Licenciada en Matemáticas..." | +54 11 1234-5678 | Buenos Aires | especialidad: ["Álgebra", "Geometría"], experiencia: 10 |
| Carlos López    | "Doctor en Física..."          | +54 11 2345-6789 | Córdoba      | especialidad: ["Física", "Química"], experiencia: 8     |
| Lucas Fernández | null                           | null             | Mendoza      | matricula: "2024-001", grado: "4to"                     |
| Valentina Ruiz  | null                           | null             | Buenos Aires | matricula: "2024-002", grado: "4to"                     |
| Mateo García    | null                           | null             | Rosario      | matricula: "2024-003", grado: "3ro"                     |

#### 3. Categorías

| Nombre              | Slug                 | Descripción                                        | Icono        |
| ------------------- | -------------------- | -------------------------------------------------- | ------------ |
| Matemáticas         | `matematicas`        | Álgebra, geometría, cálculo y estadística          | `calculator` |
| Ciencias Naturales  | `ciencias-naturales` | Física, química, biología y astronomía             | `flask`      |
| Lengua y Literatura | `lengua-literatura`  | Gramática, comprensión lectora y redacción         | `book-open`  |
| Historia            | `historia`           | Historia argentina, americana y mundial            | `landmark`   |
| Tecnología          | `tecnologia`         | Informática, programación y herramientas digitales | `laptop`     |
| Arte                | `arte`               | Plástica, música y expresión artística             | `palette`    |

#### 4. Institución

| Campo     | Valor                                         |
| --------- | --------------------------------------------- |
| Nombre    | Escuela Primaria Nº 42 "Bernardino Rivadavia" |
| Tipo      | ESCUELA                                       |
| Dirección | Av. San Martín 1234, CABA                     |
| Teléfono  | +54 11 4567-8900                              |
| Email     | contacto@escuela42.edu.ar                     |

#### 5. Cursos

| Título                   | Slug              | Educador       | Categoría          | Nivel        | Estado    | Duración |
| ------------------------ | ----------------- | -------------- | ------------------ | ------------ | --------- | -------- |
| Álgebra Básica           | `algebra-basica`  | María González | Matemáticas        | PRINCIPIANTE | PUBLICADO | 180 min  |
| Geometría Plana          | `geometria-plana` | María González | Matemáticas        | INTERMEDIO   | PUBLICADO | 240 min  |
| Introducción a la Física | `intro-fisica`    | Carlos López   | Ciencias Naturales | PRINCIPIANTE | BORRADOR  | 200 min  |

#### 6. Lecciones

**Curso: Álgebra Básica**

| Orden | Título                 | Tipo  | Duración | Publicada |
| ----- | ---------------------- | ----- | -------- | --------- |
| 1     | ¿Qué es el álgebra?    | VIDEO | 15 min   | Sí        |
| 2     | Variables y constantes | TEXTO | 20 min   | Sí        |
| 3     | Operaciones básicas    | TEXTO | 25 min   | Sí        |
| 4     | Evaluación inicial     | QUIZ  | 15 min   | Sí        |

**Curso: Geometría Plana**

| Orden | Título                     | Tipo        | Duración | Publicada |
| ----- | -------------------------- | ----------- | -------- | --------- |
| 1     | Puntos, rectas y planos    | VIDEO       | 20 min   | Sí        |
| 2     | Ángulos y su clasificación | TEXTO       | 25 min   | Sí        |
| 3     | Triángulos                 | INTERACTIVO | 30 min   | Sí        |

**Curso: Introducción a la Física** (borrador)

| Orden | Título                | Tipo  | Duración | Publicada |
| ----- | --------------------- | ----- | -------- | --------- |
| 1     | El método científico  | VIDEO | 20 min   | No        |
| 2     | Magnitudes y unidades | TEXTO | 25 min   | No        |

#### 7. Inscripciones

| Estudiante      | Curso           | Estado     | Progreso |
| --------------- | --------------- | ---------- | -------- |
| Lucas Fernández | Álgebra Básica  | COMPLETADO | 100%     |
| Lucas Fernández | Geometría Plana | ACTIVO     | 66%      |
| Valentina Ruiz  | Álgebra Básica  | ACTIVO     | 50%      |
| Valentina Ruiz  | Geometría Plana | ACTIVO     | 33%      |
| Mateo García    | Álgebra Básica  | ACTIVO     | 0%       |

#### 8. Progresos (por lección)

| Estudiante      | Lección               | Completado | Puntaje Quiz |
| --------------- | --------------------- | ---------- | ------------ |
| Lucas Fernández | Álgebra - Lección 1   | Sí         | -            |
| Lucas Fernández | Álgebra - Lección 2   | Sí         | -            |
| Lucas Fernández | Álgebra - Lección 3   | Sí         | -            |
| Lucas Fernández | Álgebra - Lección 4   | Sí         | 85%          |
| Lucas Fernández | Geometría - Lección 1 | Sí         | -            |
| Lucas Fernández | Geometría - Lección 2 | Sí         | -            |
| Valentina Ruiz  | Álgebra - Lección 1   | Sí         | -            |
| Valentina Ruiz  | Álgebra - Lección 2   | Sí         | -            |
| Valentina Ruiz  | Geometría - Lección 1 | Sí         | -            |

#### 9. Grupo

| Campo       | Valor                           |
| ----------- | ------------------------------- |
| Nombre      | 4to Grado A                     |
| Grado       | 4to                             |
| Sección     | A                               |
| Institución | Escuela Nº 42                   |
| Educador    | María González                  |
| Estudiantes | Lucas Fernández, Valentina Ruiz |

#### 10. Asistencias (últimos 5 días hábiles)

Se generan registros de asistencia para los estudiantes del grupo:

- Lucas Fernández: PRESENTE (5 días)
- Valentina Ruiz: PRESENTE (3), TARDANZA (1), AUSENTE (1)

#### 11. Calificaciones

| Estudiante      | Materia     | Período       | Nota | Nota Máxima |
| --------------- | ----------- | ------------- | ---- | ----------- |
| Lucas Fernández | Matemáticas | 1er Trimestre | 8.5  | 10          |
| Lucas Fernández | Matemáticas | 2do Trimestre | 9.0  | 10          |
| Valentina Ruiz  | Matemáticas | 1er Trimestre | 7.0  | 10          |
| Valentina Ruiz  | Matemáticas | 2do Trimestre | 7.5  | 10          |

#### 12. Comunicado

| Campo       | Valor                             |
| ----------- | --------------------------------- |
| Título      | Bienvenidos al ciclo lectivo 2024 |
| Tipo        | GENERAL                           |
| Prioridad   | NORMAL                            |
| Autor       | Daniel Martínez (director)        |
| Institución | Escuela Nº 42                     |

### Notas de Implementación

1. **Orden de creación**: Respetar dependencias del schema
   - Usuarios → Perfiles
   - Categorías → Cursos → Lecciones
   - Institución → Grupos → GrupoEstudiante
   - Inscripciones, Progresos, Asistencias, Calificaciones

2. **Idempotencia**: El seed debe poder ejecutarse múltiples veces usando `upsert`

3. **Contraseñas**: Usar `bcrypt.hash('Amauta2024!', 10)` para hashear

4. **Fechas**:
   - `createdAt`: Fechas escalonadas para simular creación gradual
   - `publicadoEn`: Solo para cursos PUBLICADO
   - `completadoEn`: Solo para inscripciones/progresos completados

### Ejemplo de Implementación

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear categorías
  const categorias = await seedCategorias();
  console.log(`✅ ${categorias.length} categorías creadas`);

  // 2. Crear usuarios
  const usuarios = await seedUsuarios();
  console.log(`✅ ${usuarios.length} usuarios creados`);

  // 3. Crear institución y grupos
  const institucion = await seedInstitucion();
  console.log(`✅ Institución creada: ${institucion.nombre}`);

  // 4. Crear cursos y lecciones
  const cursos = await seedCursos(usuarios, categorias);
  console.log(`✅ ${cursos.length} cursos creados`);

  // 5. Crear inscripciones y progresos
  await seedInscripciones(usuarios, cursos);
  console.log('✅ Inscripciones y progresos creados');

  // 6. Crear asistencias y calificaciones
  await seedAsistenciasYCalificaciones();
  console.log('✅ Asistencias y calificaciones creadas');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
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
