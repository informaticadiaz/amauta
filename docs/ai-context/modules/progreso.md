# Módulo: Progreso

> Seguimiento del progreso de estudiantes en lecciones y cursos.

---

## Descripción Funcional

El módulo de progreso registra cuáles lecciones ha completado cada estudiante y calcula el porcentaje de avance en el curso. También permite a los educadores ver el progreso de todos sus estudiantes.

### Roles y Permisos

| Acción                      | ESTUDIANTE | EDUCADOR          | ADMIN_ESCUELA | SUPER_ADMIN |
| --------------------------- | ---------- | ----------------- | ------------- | ----------- |
| Marcar lección completada   | Sí         | Sí (propio curso) | Sí            | Sí          |
| Ver progreso propio         | Sí         | Sí                | Sí            | Sí          |
| Ver progreso de estudiantes | -          | Sí (propio curso) | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                             | Propósito            |
| --------------------------------------------------- | -------------------- |
| `apps/api/src/progreso/progreso.module.ts`          | Módulo NestJS        |
| `apps/api/src/progreso/progreso.controller.ts`      | Endpoints REST       |
| `apps/api/src/progreso/progreso.service.ts`         | Lógica de negocio    |
| `apps/api/src/progreso/progreso.service.spec.ts`    | Tests del service    |
| `apps/api/src/progreso/progreso.controller.spec.ts` | Tests del controller |

---

## Endpoints API

| Método | Ruta                               | Auth | Roles     | Descripción                       |
| ------ | ---------------------------------- | ---- | --------- | --------------------------------- |
| POST   | `/lecciones/:id/completar`         | Sí   | Todos     | Marcar lección completada         |
| GET    | `/cursos/:id/progreso`             | Sí   | Todos     | Mi progreso en el curso           |
| GET    | `/cursos/:id/estudiantes/progreso` | Sí   | EDUCADOR+ | Progreso de todos los estudiantes |

---

## Modelo Prisma

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

  @@unique([usuarioId, leccionId])  // clave compuesta: usuarioId_leccionId
  @@index([usuarioId])
  @@index([leccionId])
  @@map("progresos")
}
```

---

## Respuestas

### POST /lecciones/:id/completar

```json
{
  "progreso": {
    "id": "...",
    "usuarioId": "...",
    "leccionId": "...",
    "completado": true,
    "completadoEn": "2026-03-14T...",
    "ultimoAcceso": "2026-03-14T..."
  },
  "message": "Lección marcada como completada"
}
```

### GET /cursos/:id/progreso

```json
{
  "cursoId": "...",
  "totalLecciones": 10,
  "leccionesCompletadas": 4,
  "porcentaje": 40,
  "ultimaLeccion": { "id": "...", "titulo": "...", "orden": 3 }
}
```

### GET /cursos/:id/estudiantes/progreso

```json
{
  "cursoId": "...",
  "totalLecciones": 10,
  "total": 3,
  "estudiantes": [
    {
      "usuario": {
        "id": "...",
        "nombre": "...",
        "apellido": "...",
        "email": "..."
      },
      "leccionesCompletadas": 4,
      "totalLecciones": 10,
      "porcentaje": 40,
      "estado": "ACTIVO",
      "inscritoEn": "2026-03-01T..."
    }
  ]
}
```

---

## Notas para IA

1. **Idempotente**: `completarLeccion` usa `upsert` — llamar varias veces no genera error ni duplicados
2. **Compound unique**: El accessor para `@@unique([usuarioId, leccionId])` en Prisma es `usuarioId_leccionId`
3. **Actualiza inscripción**: Al completar una lección, se recalcula `Inscripcion.progreso` (Int, porcentaje)
4. **Estado COMPLETADO**: Si `porcentaje === 100`, la inscripción cambia a estado `COMPLETADO` automáticamente
5. **Lecciones publicadas**: El cálculo de `totalLecciones` filtra solo `publicada: true`
6. **ultimaLeccion**: Se obtiene del Progreso con `ultimoAcceso` más reciente (no necesariamente completada)
7. **Filtro educador**: `obtenerProgresoEstudiantes` verifica que el educador sea dueño del curso (`educadorId`)
8. **Excluye ABANDONADO**: Inscripciones con estado `ABANDONADO` no cuentan en el reporte del educador
