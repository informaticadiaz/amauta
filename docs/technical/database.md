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

El seed provee datos de prueba para desarrollo y testing.

> **Documentación completa**: Ver `apps/api/prisma/README.md` para detalles de implementación.

### Uso

```bash
# Ejecutar seed
npm run prisma:seed --workspace=@amauta/api

# Reset completo (borra datos + aplica migraciones + seed)
npm run prisma:reset --workspace=@amauta/api
```

### Usuarios de Prueba (Implementado ✅)

| Email                     | Rol           | Nombre          | Descripción                         |
| ------------------------- | ------------- | --------------- | ----------------------------------- |
| `superadmin@amauta.test`  | SUPER_ADMIN   | Admin Sistema   | Acceso total al sistema             |
| `admin1@amauta.test`      | ADMIN_ESCUELA | María García    | Admin Escuela Primaria Belgrano     |
| `admin2@amauta.test`      | ADMIN_ESCUELA | Carlos López    | Admin Colegio Secundario San Martín |
| `educador1@amauta.test`   | EDUCADOR      | Ana Martínez    | Profesora de Matemáticas            |
| `educador2@amauta.test`   | EDUCADOR      | Pedro Sánchez   | Profesor de Lengua                  |
| `educador3@amauta.test`   | EDUCADOR      | Laura Fernández | Profesora de Ciencias               |
| `estudiante1@amauta.test` | ESTUDIANTE    | Juan Pérez      | Estudiante 4°A Belgrano             |
| `estudiante2@amauta.test` | ESTUDIANTE    | Sofía Rodríguez | Estudiante 4°A Belgrano             |
| `estudiante3@amauta.test` | ESTUDIANTE    | Mateo González  | Estudiante 1°A San Martín           |
| `estudiante4@amauta.test` | ESTUDIANTE    | Valentina Díaz  | Estudiante 1°A San Martín           |

**Password por defecto**: `password123` (hasheado con bcrypt, 10 rounds)

### Perfiles (Implementado ✅)

Cada usuario tiene un perfil completo con datos argentinos. Ver `apps/api/prisma/README.md` para detalles.

### Progreso de Implementación

| Etapa | Issue | Estado        | Datos                                             |
| ----- | ----- | ------------- | ------------------------------------------------- |
| 1     | #23   | ✅ Completado | 10 usuarios, 10 perfiles                          |
| 2     | #24   | ⏳ Pendiente  | 6 categorías, 2 instituciones, 4 grupos           |
| 3     | #25   | ⏳ Pendiente  | 6 cursos, 15 lecciones, 10 recursos               |
| 4     | #26   | ⏳ Pendiente  | 12 inscripciones, ~20 progresos                   |
| 5     | #27   | ⏳ Pendiente  | ~40 asistencias, 16 calificaciones, 4 comunicados |

### Datos Planificados (Pendientes)

#### Categorías (Etapa 2)

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

## Estructura Curricular NAP (Verificada)

> **Fuente**: Investigación realizada el 29/12/2024 sobre fuentes oficiales.
> Esta sección documenta la estructura real de los NAP para alinear Amauta con la currícula argentina.

### ¿Qué son los NAP?

Los **Núcleos de Aprendizajes Prioritarios** son los contenidos mínimos obligatorios que todos los estudiantes argentinos deben aprender, establecidos por el Consejo Federal de Educación. Constituyen una base común para la enseñanza en todo el país.

### Fuentes Oficiales

| Fuente                          | URL                                                                        | Contenido                             |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| Portal Educ.ar                  | https://www.educ.ar/recursos/150199/                                       | Colección completa de 22 cuadernillos |
| Argentina.gob.ar                | https://www.argentina.gob.ar/educacion/nucleos-de-aprendizaje-prioritarios | Página oficial con enlaces            |
| Biblioteca Nacional del Maestro | http://www.bnm.me.gov.ar                                                   | PDFs históricos                       |

### Áreas Curriculares (10)

| #   | Área                                       | Slug propuesto          | Icono         |
| --- | ------------------------------------------ | ----------------------- | ------------- |
| 1   | Matemática                                 | `matematica`            | `calculator`  |
| 2   | Lengua y Literatura                        | `lengua-literatura`     | `book-open`   |
| 3   | Ciencias Naturales                         | `ciencias-naturales`    | `flask`       |
| 4   | Ciencias Sociales                          | `ciencias-sociales`     | `globe`       |
| 5   | Formación Ética y Ciudadana                | `etica-ciudadana`       | `scale`       |
| 6   | Educación Artística                        | `educacion-artistica`   | `palette`     |
| 7   | Educación Física                           | `educacion-fisica`      | `dumbbell`    |
| 8   | Educación Tecnológica                      | `educacion-tecnologica` | `cog`         |
| 9   | Lenguas Extranjeras                        | `lenguas-extranjeras`   | `languages`   |
| 10  | Educación Digital, Programación y Robótica | `educacion-digital`     | `laptop-code` |

> **Nota**: El issue #21 mencionaba 8 áreas. La investigación confirmó que son **10 áreas** incluyendo Lenguas Extranjeras y Educación Digital.

### Niveles Educativos

| Nivel                      | Código                 | Años/Grados       | Edad aproximada |
| -------------------------- | ---------------------- | ----------------- | --------------- |
| Educación Inicial          | `INICIAL`              | Sala de 4 y 5     | 4-5 años        |
| Primaria 1er Ciclo         | `PRIMARIA_1`           | 1º, 2º, 3º grado  | 6-8 años        |
| Primaria 2do Ciclo         | `PRIMARIA_2`           | 4º, 5º, 6º grado  | 9-11 años       |
| Séptimo Año                | `SEPTIMO`              | 7º grado / 1º año | 12 años         |
| Secundaria Ciclo Básico    | `SECUNDARIA_BASICO`    | 1º, 2º, 3º año    | 12-14 años      |
| Secundaria Ciclo Orientado | `SECUNDARIA_ORIENTADO` | 4º, 5º, 6º año    | 15-17 años      |

### Documentos NAP Disponibles (22)

#### Por Nivel

| Nivel              | Documento                            | URL Descarga                                                   |
| ------------------ | ------------------------------------ | -------------------------------------------------------------- |
| Inicial            | NAP Educación Inicial                | http://www.bnm.me.gov.ar/giga1/documentos/EL000978.pdf         |
| Primaria 1er Ciclo | NAP Primaria Primer Ciclo (8 áreas)  | https://backend.educ.ar/refactor_resource/get-attachment/22399 |
| Primaria 2do Ciclo | NAP Primaria Segundo Ciclo (8 áreas) | https://backend.educ.ar/refactor_resource/get-attachment/22424 |
| Séptimo Año        | NAP Séptimo Año                      | http://www.bnm.me.gov.ar/giga1/documentos/EL007881.pdf         |

#### Secundaria Ciclo Básico (8 documentos)

- NAP Matemática
- NAP Lengua
- NAP Ciencias Naturales
- NAP Ciencias Sociales
- NAP Formación Ética y Ciudadana
- NAP Educación Artística
- NAP Educación Física
- NAP Educación Tecnológica

#### Secundaria Ciclo Orientado (7 documentos)

- NAP Matemática
- NAP Lengua y Literatura
- NAP Ciencias Naturales
- NAP Ciencias Sociales
- NAP Filosofía y Formación Ética y Ciudadana
- NAP Educación Física
- NAP Educación Artística

#### Transversales (2 documentos)

- NAP Lenguas Extranjeras (Primaria y Secundaria)
- NAP Educación Digital, Programación y Robótica (Inicial, Primaria y Secundaria)

### Licencia de los NAP

**Creative Commons BY-NC-SA** (Atribución - No Comercial - Compartir Igual)

- ✅ Se pueden usar en Amauta (proyecto educativo sin fines de lucro)
- ✅ Se debe atribuir la fuente (Ministerio de Educación Argentina)
- ❌ No se puede usar con fines comerciales

### Mapeo NAP → Modelo de Datos Amauta

```
NAP                          →  Amauta
─────────────────────────────────────────────
Área curricular (10)         →  Categoria
Nivel educativo (6)          →  Campo en Curso (nuevo enum)
Documento NAP                →  Fuente de contenido para Lecciones
Contenidos prioritarios      →  Descripción de Cursos/Lecciones
```

### Propuesta de Enum para Niveles

```prisma
enum NivelEducativo {
  INICIAL
  PRIMARIA_1          // 1er ciclo (1º-3º)
  PRIMARIA_2          // 2do ciclo (4º-6º)
  SEPTIMO             // Transición
  SECUNDARIA_BASICO   // 1º-3º año
  SECUNDARIA_ORIENTADO // 4º-6º año
}
```

### Próximos Pasos (Issue #21)

1. ☐ Descargar los 22 PDFs de NAP
2. ☐ Desarrollar parser PDF → JSON
3. ☐ Actualizar schema Prisma con `NivelEducativo`
4. ☐ Crear seed con 10 categorías NAP
5. ☐ Generar cursos de ejemplo por nivel/área

---

## Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Colección NAP - Educ.ar](https://www.educ.ar/recursos/150199/)
- [NAP - Argentina.gob.ar](https://www.argentina.gob.ar/educacion/nucleos-de-aprendizaje-prioritarios)
