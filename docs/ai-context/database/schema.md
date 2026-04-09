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
    │                   ├──────< Inscripcion >── Usuario
    │                   │
    │                   └──────< ForoPost >── Usuario (autor)
    │                               │
    │                               └──────< ForoRespuesta >── Usuario (autor)
    │                                           │
    │                                           └──────< ReaccionForo >── Usuario
    │
    └──────< Evaluacion >── Curso
                    │
                    ├──────< Pregunta
                    │
                    └──────< IntentoEvaluacion >── Usuario
    │
    ├──────< Perfil (1:1)
    │
    └──────< Notificacion

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

  // Grupos - Estudiantes
  gruposEstudiante            GrupoEstudiante[] @relation("GrupoEstudianteUsuario")
  asignacionesGrupoRealizadas GrupoEstudiante[] @relation("GrupoEstudianteAsignadoPor")
  remocionesGrupoRealizadas   GrupoEstudiante[] @relation("GrupoEstudianteRemovidoPor")

  // Grupos - Educadores
  gruposEducador                 GrupoEducador[] @relation("GrupoEducadorUsuario")
  asignacionesEducadorRealizadas GrupoEducador[] @relation("GrupoEducadorAsignadoPor")
  remocionesEducadorRealizadas   GrupoEducador[] @relation("GrupoEducadorRemovidoPor")

  // Evaluaciones
  evaluacionesCreadas Evaluacion[] @relation("Evaluador")
  intentosEvaluacion  IntentoEvaluacion[]

  // Comunidad y foros
  postsForo       ForoPost[]      @relation("AutorForoPost")
  respuestasForo  ForoRespuesta[] @relation("AutorForoRespuesta")
  reaccionesForo  ReaccionForo[]  @relation("ReaccionForoUsuario")
  notificaciones  Notificacion[]  @relation("NotificacionUsuario")

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

### Perfil

```prisma
model Perfil {
  id        String  @id @default(cuid())
  usuarioId String  @unique
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  bio         String?
  telefono    String?
  pais        String?
  ciudad      String?
  institucion String?

  // Para estudiantes
  matricula String?
  grado     String?

  // Para educadores
  especialidad String[]
  experiencia  Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("perfiles")
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
  evaluaciones  Evaluacion[]
  foroPosts     ForoPost[]

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

### Recurso

```prisma
model Recurso {
  id     String @id @default(cuid())
  nombre String
  tipo   String // video/pdf/image/audio
  url    String
  tamano Int?   // bytes

  leccionId String
  leccion   Leccion @relation(fields: [leccionId], references: [id], onDelete: Cascade)

  disponibleOffline Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([leccionId])
  @@map("recursos")
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

  grupos             Grupo[]
  comunicados        Comunicado[]
  periodosAcademicos PeriodoAcademico[]
  escalaCalificacion EscalaCalificacion?

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

  periodoAcademicoId String?
  periodoAcademico   PeriodoAcademico? @relation(fields: [periodoAcademicoId], references: [id])

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  educadorId String
  educador   Usuario @relation(fields: [educadorId], references: [id])

  activo Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  estudiantes    GrupoEstudiante[]
  educadores     GrupoEducador[]
  asistencias    Asistencia[]
  calificaciones Calificacion[]

  @@index([institucionId])
  @@index([educadorId])
  @@index([periodoAcademicoId])
  @@map("grupos")
}
```

### GrupoEstudiante

```prisma
model GrupoEstudiante {
  grupoId String
  grupo   Grupo  @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario @relation("GrupoEstudianteUsuario", fields: [estudianteId], references: [id])

  asignadoPorId String?
  asignadoPor   Usuario? @relation("GrupoEstudianteAsignadoPor", fields: [asignadoPorId], references: [id])

  removidoPorId String?
  removidoPor   Usuario? @relation("GrupoEstudianteRemovidoPor", fields: [removidoPorId], references: [id])

  inscritoEn DateTime @default(now())
  activo     Boolean  @default(true)
  removidoEn DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt

  @@id([grupoId, estudianteId])
  @@index([grupoId, activo])
  @@index([estudianteId, activo])
  @@map("grupos_estudiantes")
}
```

### GrupoEducador

```prisma
model GrupoEducador {
  grupoId String
  grupo   Grupo  @relation(fields: [grupoId], references: [id])

  educadorId String
  educador   Usuario @relation("GrupoEducadorUsuario", fields: [educadorId], references: [id])

  rol RolGrupoEducador

  asignadoPorId String?
  asignadoPor   Usuario? @relation("GrupoEducadorAsignadoPor", fields: [asignadoPorId], references: [id])

  removidoPorId String?
  removidoPor   Usuario? @relation("GrupoEducadorRemovidoPor", fields: [removidoPorId], references: [id])

  asignadoEn DateTime @default(now())
  activo     Boolean  @default(true)
  removidoEn DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt

  @@id([grupoId, educadorId])
  @@index([grupoId, activo])
  @@index([educadorId, activo])
  @@map("grupos_educadores")
}

enum RolGrupoEducador {
  TITULAR
  SUPLENTE
}
```

### PeriodoAcademico

```prisma
model PeriodoAcademico {
  id String @id @default(cuid())
  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  nombre      String
  fechaInicio DateTime
  fechaFin    DateTime
  orden       Int @default(1)
  activo      Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  grupos         Grupo[]
  calificaciones Calificacion[]

  @@index([institucionId])
  @@index([activo])
  @@map("periodos_academicos")
}
```

### EscalaCalificacion

```prisma
model EscalaCalificacion {
  id String @id @default(cuid())
  institucionId String @unique
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  notaMinima     Float @default(0)
  notaMaxima     Float @default(10)
  notaAprobacion Float @default(6)
  descripcion    String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("escalas_calificacion")
}
```

### Calificacion

> La `notaMaxima` se obtiene desde `EscalaCalificacion` de la institución (no se repite por registro).
> Un único registro por combinación grupo+estudiante+periodo+materia (unique constraint).

```prisma
model Calificacion {
  id String @id @default(cuid())

  grupoId String
  grupo   Grupo  @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario @relation(fields: [estudianteId], references: [id])

  periodoAcademicoId String
  periodoAcademico   PeriodoAcademico @relation(fields: [periodoAcademicoId], references: [id])

  materia String
  nota    Float

  observaciones String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([grupoId, estudianteId, periodoAcademicoId, materia])
  @@index([grupoId, periodoAcademicoId])
  @@index([estudianteId, periodoAcademicoId])
  @@map("calificaciones")
}
```

### Asistencia

```prisma
model Asistencia {
  id String @id @default(cuid())

  grupoId String
  grupo   Grupo  @relation(fields: [grupoId], references: [id])

  estudianteId String
  estudiante   Usuario @relation(fields: [estudianteId], references: [id])

  fecha  DateTime
  estado EstadoAsistencia

  observaciones String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([grupoId, estudianteId, fecha])
  @@index([grupoId, fecha])
  @@index([estudianteId])
  @@map("asistencias")
}

enum EstadoAsistencia {
  PRESENTE
  AUSENTE
  TARDANZA
  JUSTIFICADO
}
```

### Comunicado

```prisma
model Comunicado {
  id String @id @default(cuid())

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  autorId String
  autor   Usuario @relation(fields: [autorId], references: [id])

  titulo    String
  contenido String

  tipo      TipoComunicado
  prioridad Prioridad      @default(NORMAL)

  publicadoEn DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([institucionId])
  @@index([tipo])
  @@map("comunicados")
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

---

## Comunidad y Foros

### ForoPost

```prisma
model ForoPost {
  id       String @id @default(cuid())

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  autorId String
  autor   Usuario @relation("AutorForoPost", fields: [autorId], references: [id])

  tipo      TipoForoPost
  titulo    String
  contenido String
  estado    EstadoForoPost @default(PUBLICADO)
  etiquetas String[]
  vistas    Int            @default(0)
  eliminado Boolean        @default(false)

  creadoEn     DateTime @default(now())
  actualizadoEn DateTime @updatedAt

  respuestas ForoRespuesta[]
  notificaciones Notificacion[] @relation("NotificacionPost")

  @@index([cursoId])
  @@index([autorId])
  @@index([estado])
  @@index([tipo])
  @@map("foro_posts")
}

enum TipoForoPost {
  PREGUNTA    // Post de tipo pregunta, puede tener solución marcada
  DISCUSION   // Discusión abierta sin solución
  ANUNCIO     // Solo educador/admin puede crear
}

enum EstadoForoPost {
  PUBLICADO   // Post activo, acepta respuestas
  CERRADO     // Visible pero no acepta respuestas
  ELIMINADO   // Soft delete
}
```

### ForoRespuesta

```prisma
model ForoRespuesta {
  id String @id @default(cuid())

  postId String
  post   ForoPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  autorId String
  autor   Usuario @relation("AutorForoRespuesta", fields: [autorId], references: [id])

  contenido String

  // Threading de un nivel
  respuestaParentId String?
  respuestaParent   ForoRespuesta?  @relation("RespuestasHijas", fields: [respuestaParentId], references: [id])
  respuestasHijas   ForoRespuesta[] @relation("RespuestasHijas")

  esSolucion Boolean @default(false)  // Solo una por post de tipo PREGUNTA
  eliminado  Boolean @default(false)

  creadoEn     DateTime @default(now())
  actualizadoEn DateTime @updatedAt

  reacciones     ReaccionForo[]
  notificaciones Notificacion[] @relation("NotificacionRespuesta")

  @@index([postId])
  @@index([autorId])
  @@index([respuestaParentId])
  @@map("foro_respuestas")
}
```

### ReaccionForo

```prisma
model ReaccionForo {
  id String @id @default(cuid())

  respuestaId String
  respuesta   ForoRespuesta @relation(fields: [respuestaId], references: [id], onDelete: Cascade)

  usuarioId String
  usuario   Usuario @relation("ReaccionForoUsuario", fields: [usuarioId], references: [id])

  creadoEn DateTime @default(now())

  @@unique([respuestaId, usuarioId])  // Un usuario solo puede reaccionar una vez
  @@index([respuestaId])
  @@index([usuarioId])
  @@map("reacciones_foro")
}
```

### Notificacion

```prisma
model Notificacion {
  id String @id @default(cuid())

  usuarioId String
  usuario   Usuario @relation("NotificacionUsuario", fields: [usuarioId], references: [id])

  tipo TipoNotificacion

  // Referencias opcionales al contenido relacionado
  postId String?
  post   ForoPost? @relation("NotificacionPost", fields: [postId], references: [id], onDelete: Cascade)

  respuestaId String?
  respuesta   ForoRespuesta? @relation("NotificacionRespuesta", fields: [respuestaId], references: [id], onDelete: Cascade)

  leida Boolean @default(false)

  creadoEn DateTime @default(now())

  @@index([usuarioId])
  @@index([leida])
  @@index([tipo])
  @@map("notificaciones")
}

enum TipoNotificacion {
  NUEVA_RESPUESTA         // Alguien respondió a tu post
  SOLUCION_MARCADA        // Tu respuesta fue marcada como solución
  PREGUNTA_SIN_RESPONDER  // Post PREGUNTA sin respuesta (futuro)
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

// Tipos de publicación en foro
enum TipoForoPost {
  PREGUNTA
  DISCUSION
  ANUNCIO
}

// Estados de publicación en foro
enum EstadoForoPost {
  PUBLICADO
  CERRADO
  ELIMINADO
}

// Tipos de notificación
enum TipoNotificacion {
  NUEVA_RESPUESTA
  SOLUCION_MARCADA
  PREGUNTA_SIN_RESPONDER
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

## CI/CD de Base de Datos (Producción)

- El contenedor de la API ejecuta `npx prisma migrate deploy` al iniciar.
- El workflow de GitHub Actions valida el despliegue con un healthcheck HTTP.
- Si el healthcheck falla, el job de deploy falla y queda visible en el run.

---

## Notas para IA

1. **cuid()**: IDs únicos, no UUIDs
2. **@@map**: Nombres de tablas en español plural
3. **Soft delete**: Usar campo estado, no eliminar físicamente
4. **Timestamps**: createdAt/updatedAt en todos los modelos
5. **Relaciones nombradas**: @relation("Educador") para claridad
6. **onDelete Cascade**: Solo cuando tiene sentido (lecciones de curso)
