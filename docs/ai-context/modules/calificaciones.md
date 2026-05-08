# Módulo: Calificaciones

> Gestión de calificaciones por grupo, período académico y materia.
> Permite listar la nómina con notas y cargar/actualizar calificaciones masivamente.

---

## Endpoints

| Método | Ruta                            | Roles                   | Descripción                                         |
| ------ | ------------------------------- | ----------------------- | --------------------------------------------------- |
| GET    | /me/calificaciones              | ESTUDIANTE              | Calificaciones propias, opcionalmente por periodoId |
| GET    | /grupos/:grupoId/calificaciones | ADMIN_ESCUELA, EDUCADOR | Nómina del grupo con nota por estudiante            |
| PUT    | /grupos/:grupoId/calificaciones | ADMIN_ESCUELA, EDUCADOR | Carga masiva (upsert) de calificaciones             |

---

## Modelo Prisma

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

---

## Validaciones de Negocio

- El período académico debe pertenecer a la misma institución que el grupo.
- Los estudiantes deben ser activos en el grupo (`GrupoEstudiante.activo = true`).
- La nota debe estar dentro del rango `[notaMinima, notaMaxima]` de `EscalaCalificacion` de la institución.
- La carga es idempotente: si ya existe una calificación para el mismo `grupoId+estudianteId+periodoAcademicoId+materia`, se actualiza.

---

## Permisos

- **ADMIN_ESCUELA**: accede a grupos de su institución (validación via `perfil.institucion`).
- **EDUCADOR**: solo accede a grupos donde tiene una asignación activa (`GrupoEducador.activo = true`).
- Otros roles: ForbiddenException.

---

## DTOs

### Query (GET)

```typescript
// query-calificaciones.dto.ts
{
  periodoAcademicoId: string; // cuid, requerido
  materia: string; // 1-100 chars, requerido
}
```

### Body (PUT)

```typescript
// cargar-calificaciones.dto.ts
{
  periodoAcademicoId: string;
  materia: string;
  calificaciones: Array<{
    estudianteId: string; // cuid
    nota: number; // float, debe estar dentro de la escala
    observaciones?: string | null;
  }>;
}
```

---

## Ejemplos de Request/Response

### GET /grupos/:grupoId/calificaciones

**Query:** `?periodoAcademicoId=ckr123&materia=Matemática`

**Response:**

```json
{
  "grupoId": "ckr001",
  "periodoAcademicoId": "ckr123",
  "materia": "Matemática",
  "estudiantes": [
    {
      "estudianteId": "ckr004",
      "nombre": "Ana",
      "apellido": "Alvarez",
      "email": "ana@amauta.test",
      "nota": 8,
      "observaciones": null,
      "updatedAt": "2026-03-29T00:00:00.000Z"
    },
    {
      "estudianteId": "ckr005",
      "nombre": "Bruno",
      "apellido": "Benitez",
      "email": "bruno@amauta.test",
      "nota": null,
      "observaciones": null
    }
  ]
}
```

### PUT /grupos/:grupoId/calificaciones

**Body:**

```json
{
  "periodoAcademicoId": "ckr123",
  "materia": "Matemática",
  "calificaciones": [
    { "estudianteId": "ckr004", "nota": 9, "observaciones": null },
    { "estudianteId": "ckr005", "nota": 7, "observaciones": "Recuperatorio" }
  ]
}
```

**Response:**

```json
{
  "resultado": {
    "grupoId": "ckr001",
    "periodoAcademicoId": "ckr123",
    "materia": "Matemática",
    "procesadas": 2
  },
  "message": "Calificaciones cargadas exitosamente"
}
```

---

## Estructura de Archivos

```
apps/api/src/calificaciones/
├── calificaciones.module.ts
├── calificaciones.controller.ts
├── calificaciones.service.ts
├── calificaciones.service.spec.ts
└── dto/
    ├── query-calificaciones.dto.ts
    └── cargar-calificaciones.dto.ts
```
