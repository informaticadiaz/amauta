# Módulo: Instituciones

> Configuración institucional y consultas auxiliares para administración escolar.

---

## Descripción Funcional

El módulo resuelve datos de la institución del usuario autenticado, la configuración académica base y los listados de personas disponibles para operar sobre grupos.

### Roles y Permisos

| Acción                             | ESTUDIANTE | EDUCADOR | ADMIN_ESCUELA | SUPER_ADMIN |
| ---------------------------------- | ---------- | -------- | ------------- | ----------- |
| Ver su institución actual          | ❌         | ❌       | ✅            | ❌          |
| Listar estudiantes por institución | ❌         | ❌       | ✅            | ✅          |
| Listar educadores por institución  | ❌         | ❌       | ✅            | ✅          |
| Listar períodos académicos         | ❌         | ✅       | ✅            | ✅          |
| Configurar períodos y escala       | ❌         | ❌       | ✅            | ✅          |

---

## Archivos del Módulo

### Backend

| Archivo                                                            | Propósito                             |
| ------------------------------------------------------------------ | ------------------------------------- |
| `apps/api/src/instituciones/instituciones.module.ts`               | Módulo NestJS                         |
| `apps/api/src/instituciones/instituciones.controller.ts`           | Endpoints REST                        |
| `apps/api/src/instituciones/instituciones.service.ts`              | Lógica de negocio                     |
| `apps/api/src/instituciones/dto/query-usuarios-institucion.dto.ts` | Filtros de búsqueda y paginación      |
| `apps/api/src/instituciones/dto/create-periodo.dto.ts`             | Alta de período académico             |
| `apps/api/src/instituciones/dto/update-periodo.dto.ts`             | Edición de período académico          |
| `apps/api/src/instituciones/dto/upsert-escala.dto.ts`              | Configuración de escala institucional |

### Frontend

| Archivo                                                        | Propósito                                    |
| -------------------------------------------------------------- | -------------------------------------------- |
| `apps/web/src/app/api/mi-institucion/route.ts`                 | Proxy para resolver la institución del admin |
| `apps/web/src/app/api/instituciones/[id]/estudiantes/route.ts` | Proxy de listado de estudiantes              |
| `apps/web/src/app/api/instituciones/[id]/educadores/route.ts`  | Proxy de listado de educadores               |

---

## Endpoints API

Base: `/api/v1/instituciones`

| Método | Ruta                                  | Auth | Roles                      | Descripción                                   |
| ------ | ------------------------------------- | ---- | -------------------------- | --------------------------------------------- |
| GET    | `/mi-institucion`                     | Sí   | ADMIN_ESCUELA              | Resuelve la institución del admin autenticado |
| GET    | `/:institucionId/estudiantes`         | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Lista estudiantes activos de la institución   |
| GET    | `/:institucionId/educadores`          | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Lista educadores activos de la institución    |
| GET    | `/:institucionId/periodos`            | Sí   | EDUCADOR+                  | Lista períodos académicos                     |
| POST   | `/:institucionId/periodos`            | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Crea período académico                        |
| PATCH  | `/:institucionId/periodos/:id`        | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Actualiza período académico                   |
| DELETE | `/:institucionId/periodos/:id`        | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Desactiva período académico                   |
| GET    | `/:institucionId/escala-calificacion` | Sí   | EDUCADOR+                  | Obtiene escala de calificación                |
| PUT    | `/:institucionId/escala-calificacion` | Sí   | ADMIN_ESCUELA, SUPER_ADMIN | Crea o actualiza escala                       |

### Query Parameters de usuarios

| Param    | Tipo   | Default | Descripción                        |
| -------- | ------ | ------- | ---------------------------------- |
| `page`   | number | 1       | Página                             |
| `limit`  | number | 10      | Cantidad por página (máx 100)      |
| `buscar` | string | -       | Busca por nombre, apellido o email |

---

## Respuestas Relevantes

### `GET /mi-institucion`

```json
{
  "institucionId": "clx123",
  "nombre": "Escuela Amauta",
  "periodos": [
    { "id": "per1", "nombre": "2026 - Primer trimestre", "activo": true }
  ]
}
```

### `GET /:institucionId/estudiantes`

```json
{
  "usuarios": [
    {
      "id": "usr1",
      "email": "estudiante1@amauta.test",
      "nombre": "Ana",
      "apellido": "Pérez",
      "activo": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Reglas de Validación

1. **Alcance institucional**: `ADMIN_ESCUELA` solo puede consultar su propia institución.
2. **SUPER_ADMIN**: puede consultar cualquier institución enviando el `institucionId`.
3. **Búsqueda**: `buscar` no puede estar vacío si se envía.
4. **Roles filtrados**: los endpoints de usuarios devuelven solo `ESTUDIANTE` o `EDUCADOR` según corresponda.
5. **Visibilidad acotada**: se exponen solo `id`, `email`, `nombre`, `apellido` y `activo`.
6. **Períodos y escala**: estos contratos sostienen grupos, calificaciones y futuras pantallas administrativas.

---

## Notas para IA

1. `mi-institucion` es el punto de entrada del frontend para resolver `institucionId` sin pedirlo al usuario.
2. Los selectores de asignación de grupos dependen de estos listados paginados.
3. Los períodos vienen ordenados por `fechaInicio desc`.
