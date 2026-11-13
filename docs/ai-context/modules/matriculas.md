# Módulo: Matrículas

> Gestión de la relación formal entre estudiantes, instituciones y períodos académicos.

## Modelo Prisma

```prisma
model Matricula {
  id String @id @default(cuid())

  estudianteId String
  estudiante   Usuario @relation("MatriculaEstudiante", fields: [estudianteId], references: [id])

  institucionId String
  institucion   Institucion @relation(fields: [institucionId], references: [id])

  periodoAcademicoId String
  periodoAcademico   PeriodoAcademico @relation(fields: [periodoAcademicoId], references: [id])

  estado           EstadoMatricula @default(ACTIVA)
  fechaInscripcion DateTime        @default(now())
  observaciones    String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([estudianteId, institucionId, periodoAcademicoId])
  @@index([institucionId, periodoAcademicoId, estado])
  @@index([estudianteId, estado])
  @@map("matriculas")
}

enum EstadoMatricula {
  ACTIVA
  BAJA
  EGRESADO
}
```

## Endpoints

| Método | Ruta                                       | Roles                      | Descripción                            |
| ------ | ------------------------------------------ | -------------------------- | -------------------------------------- |
| POST   | `/instituciones/:institucionId/matriculas` | ADMIN_ESCUELA, SUPER_ADMIN | Matricula un estudiante en un período. |
| GET    | `/instituciones/:institucionId/matriculas` | ADMIN_ESCUELA, SUPER_ADMIN | Lista el padrón paginado y filtrable.  |
| PATCH  | `/matriculas/:id`                          | ADMIN_ESCUELA, SUPER_ADMIN | Actualiza estado u observaciones.      |

### Filtros del padrón

- `page`, `limit`
- `periodoAcademicoId`
- `estado`: `ACTIVA`, `BAJA` o `EGRESADO`
- `buscar`: nombre, apellido o email del estudiante

## Reglas de negocio

- El estudiante debe existir, estar activo y tener rol `ESTUDIANTE`.
- El período debe pertenecer a la institución de la matrícula.
- No puede existir más de una matrícula para el mismo estudiante, institución y período.
- Baja y egreso son cambios de estado; no se elimina físicamente la matrícula.
- Las observaciones son opcionales y pueden registrar el motivo de baja o egreso.
- Para asignar un estudiante a un grupo, el grupo debe tener período académico y el estudiante debe tener una matrícula `ACTIVA` para la misma institución y período.
- La validación de matrícula se realiza en backend; la UI no es la autoridad de permisos.

## Respuesta de listado

```json
{
  "matriculas": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## UI

- Página: `/dashboard/matriculas`
- Rol: `ADMIN_ESCUELA`
- Permite alta, filtros de padrón y actualización de estado/observaciones.
- Los proxies Next.js se encuentran en `/api/instituciones/:id/matriculas` y `/api/matriculas/:id`.
