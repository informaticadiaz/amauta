# Database: Schema

> Schema Prisma y relaciones del proyecto.

---

## Diagrama de Relaciones

```
Usuario (1) ──────< Curso (educador)
    │                   │
    │                   ├──────< Leccion
    │                   │           │
    │                   │           └──────< Recurso
    │                   │           │
    │                   │           └──────< Progreso >── Usuario
    │                   │
    │                   └──────< Inscripcion >── Usuario
    │
    └──────< Evaluacion >── Curso
                    │
                    ├──────< Pregunta
                    │
                    └──────< IntentoEvaluacion >── Usuario
    │
    └──────< Perfil (1:1)

Categoria (1) ──────< Curso

Institucion (1) ──────< Grupo ──────< GrupoEstudiante >── Usuario
                          │
                          ├──────< Asistencia >── Usuario
                          │
                          └──────< Calificacion >── Usuario
```

---

## Modelos Principales

### Usuario

```prisma
model Usuario {
  id              String    @id @default(cuid())
  email           String    @unique
  nombre          String
  apellido        String
  rol             Rol       @default(ESTUDIANTE)
  password        String    // Hash bcrypt
  avatar          String?
  activo          Boolean   @default(true)
  emailVerificado DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  perfil           Perfil?
  cursosCreados    Curso[]        @relation("Educador")
  inscripciones    Inscripcion[]
  progresos        Progreso[]
  asistencias      Asistencia[]
  calificaciones   Calificacion[]
  comunicados      Comunicado[]
  gruposCreados    Grupo[]
  gruposEstudiante GrupoEstudiante[]

  @@index([email])
  @@index([rol])
  @@map("usuarios")
}

enum Rol {
  ESTUDIANTE
  EDUCADOR
  ADMIN_ESCUELA
  SUPER_ADMIN
}
```

### Curso

```prisma
model Curso {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String
  slug        String      @unique

  educadorId String
  educador   Usuario @relation("Educador", fields: [educadorId], references: [id])

  categoriaId String
  categoria   Categoria @relation(fields: [categoriaId], references: [id])

  nivel  Nivel
  estado EstadoCurso @default(BORRADOR)

  imagen   String?
  duracion Int?        // minutos estimados
  idioma   String      @default("es")

  publicadoEn DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lecciones     Leccion[]
  inscripciones Inscripcion[]

  @@index([educadorId])
  @@index([categoriaId])
  @@index([estado])
  @@index([slug])
  @@map("cursos")
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

### Lección

```prisma
model Leccion {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String?
  orden       Int

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  tipo     TipoLeccion
  duracion Int?

  contenido Json
  recursos  Recurso[]

  publicada Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  progresos Progreso[]

  @@index([cursoId])
  @@index([orden])
  @@map("lecciones")
}

enum TipoLeccion {
  VIDEO
  TEXTO
  QUIZ
  INTERACTIVO
  DESCARGABLE
}
```

### Inscripción

```prisma
model Inscripcion {
  id String @id @default(cuid())

  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id])

  estado   EstadoInscripcion @default(ACTIVO)
  progreso Int               @default(0)

  inscritoEn   DateTime  @default(now())
  completadoEn DateTime?

  @@unique([usuarioId, cursoId])
  @@index([usuarioId])
  @@index([cursoId])
  @@map("inscripciones")
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
  id String @id @default(cuid())

  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  leccionId String
  leccion   Leccion @relation(fields: [leccionId], references: [id])

  completado Boolean @default(false)
  porcentaje Int     @default(0)

  ultimoAcceso DateTime @default(now())
  completadoEn DateTime?

  intentos     Int   @default(0)
  mejorPuntaje Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([usuarioId, leccionId])
  @@index([usuarioId])
  @@index([leccionId])
  @@map("progresos")
}
```

### Evaluación

```prisma
model Evaluacion {
  id          String  @id @default(cuid())
  titulo      String
  descripcion String?

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  creadorId String
  creador   Usuario @relation("Evaluador", fields: [creadorId], references: [id])

  tiempoLimiteMin Int?
  puntajeMinimo   Float?
  intentosMaximos Int?

  publicada   Boolean @default(false)
  publicadoEn DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  preguntas Pregunta[]
  intentos  IntentoEvaluacion[]

  @@index([cursoId])
  @@index([creadorId])
  @@map("evaluaciones")
}
```

### Pregunta

```prisma
model Pregunta {
  id        String  @id @default(cuid())
  enunciado String
  tipo      TipoPregunta
  orden     Int
  puntaje   Float   @default(1)

  opciones  Json?
  respuesta Json?

  evaluacionId String
  evaluacion   Evaluacion @relation(fields: [evaluacionId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([evaluacionId])
  @@index([orden])
  @@map("preguntas")
}
```

### IntentoEvaluacion

```prisma
model IntentoEvaluacion {
  id String @id @default(cuid())

  evaluacionId String
  evaluacion   Evaluacion @relation(fields: [evaluacionId], references: [id], onDelete: Cascade)

  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  numero    Int   @default(1)
  puntaje   Float @default(0)
  completado Boolean @default(false)
  tiempoEmpleadoSeg Int?

  iniciadoEn  DateTime @default(now())
  completadoEn DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([evaluacionId, usuarioId, numero])
  @@index([evaluacionId])
  @@index([usuarioId])
  @@map("intentos_evaluacion")
}
```

### Categoría

```prisma
model Categoria {
  id          String  @id @default(cuid())
  nombre      String  @unique
  slug        String  @unique
  descripcion String?
  icono       String?

  cursos Curso[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@map("categorias")
}
```

---

## Módulo Escolar

### Institución

```prisma
model Institucion {
  id     String          @id @default(cuid())
  nombre String
  tipo   TipoInstitucion

  direccion String?
  telefono  String?
  email     String?

  activa Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  grupos      Grupo[]
  comunicados Comunicado[]

  @@map("instituciones")
}

enum TipoInstitucion {
  ESCUELA
  COLEGIO
  UNIVERSIDAD
  CENTRO_FORMACION
}
```

### Grupo

```prisma
model Grupo {
  id      String  @id @default(cuid())
  nombre  String
  grado   String?
  seccion String?

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  educadorId String
  educador   Usuario @relation(fields: [educadorId], references: [id])

  activo Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  estudiantes    GrupoEstudiante[]
  asistencias    Asistencia[]
  calificaciones Calificacion[]

  @@index([institucionId])
  @@index([educadorId])
  @@map("grupos")
}
```

---

## Enums Completos

```prisma
// Roles de usuario
enum Rol {
  ESTUDIANTE
  EDUCADOR
  ADMIN_ESCUELA
  SUPER_ADMIN
}

// Niveles de curso
enum Nivel {
  PRINCIPIANTE
  INTERMEDIO
  AVANZADO
}

// Estados de curso
enum EstadoCurso {
  BORRADOR
  REVISION
  PUBLICADO
  ARCHIVADO
}

// Tipos de lección
enum TipoLeccion {
  VIDEO
  TEXTO
  QUIZ
  INTERACTIVO
  DESCARGABLE
}

// Estados de inscripción
enum EstadoInscripcion {
  ACTIVO
  COMPLETADO
  ABANDONADO
}

// Tipos de pregunta
enum TipoPregunta {
  OPCION_MULTIPLE
  SELECCION_MULTIPLE
  VERDADERO_FALSO
  RESPUESTA_CORTA
  RESPUESTA_LARGA
  EMPAREJAMIENTO
}

// Tipos de institución
enum TipoInstitucion {
  ESCUELA
  COLEGIO
  UNIVERSIDAD
  CENTRO_FORMACION
}

// Estados de asistencia
enum EstadoAsistencia {
  PRESENTE
  AUSENTE
  TARDANZA
  JUSTIFICADO
}

// Tipos de comunicado
enum TipoComunicado {
  GENERAL
  ACADEMICO
  ADMINISTRATIVO
  EVENTO
  URGENTE
}

// Prioridades
enum Prioridad {
  BAJA
  NORMAL
  ALTA
  URGENTE
}
```

---

## Índices Importantes

| Modelo      | Campo(s)           | Propósito          |
| ----------- | ------------------ | ------------------ |
| Usuario     | email              | Login rápido       |
| Usuario     | rol                | Filtrar por rol    |
| Curso       | slug               | Lookup por URL     |
| Curso       | estado             | Filtrar publicados |
| Curso       | educadorId         | Mis cursos         |
| Leccion     | cursoId, orden     | Ordenar lecciones  |
| Inscripcion | usuarioId, cursoId | Unique constraint  |

---

## Constraints Únicos

```prisma
// Usuario: email único
@@unique([email])

// Curso: slug único
@@unique([slug])

// Categoría: nombre y slug únicos
@@unique([nombre])
@@unique([slug])

// Inscripción: un usuario solo puede inscribirse una vez por curso
@@unique([usuarioId, cursoId])

// Progreso: un usuario tiene un solo progreso por lección
@@unique([usuarioId, leccionId])

// Asistencia: un registro por estudiante/grupo/fecha
@@unique([grupoId, estudianteId, fecha])
```

---

## Cascade Deletes

```prisma
// Si se elimina un curso, se eliminan sus lecciones
curso Curso @relation(fields: [cursoId], references: [id], onDelete: Cascade)

// Si se elimina un usuario, se elimina su perfil
usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

// Si se elimina una lección, se eliminan sus recursos
leccion Leccion @relation(fields: [leccionId], references: [id], onDelete: Cascade)
```

---

## Comandos Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Ejecutar seed
npx prisma db seed
```

---

## Notas para IA

1. **cuid()**: IDs únicos, no UUIDs
2. **@@map**: Nombres de tablas en español plural
3. **Soft delete**: Usar campo estado, no eliminar físicamente
4. **Timestamps**: createdAt/updatedAt en todos los modelos
5. **Relaciones nombradas**: @relation("Educador") para claridad
6. **onDelete Cascade**: Solo cuando tiene sentido (lecciones de curso)
