# Módulo: Comunicados

> Comunicados institucionales — anuncios y comunicaciones de la institución a sus miembros.

## Modelo Prisma

```prisma
model Comunicado {
  id            String         @id @default(cuid())
  institucionId String
  autorId       String
  titulo        String
  contenido     String
  tipo          TipoComunicado
  prioridad     Prioridad      @default(NORMAL)
  publicadoEn   DateTime       @default(now())
  archivado     Boolean        @default(false)  // soft delete
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

## Endpoints

| Método | Ruta                                    | Roles permitidos                     | Descripción                    |
| ------ | --------------------------------------- | ------------------------------------ | ------------------------------ |
| GET    | `/me/comunicados`                       | Todos (autenticados)                 | Comunicados de mi institución  |
| POST   | `/me/comunicados`                       | ADMIN_ESCUELA, EDUCADOR              | Crear en mi institución        |
| GET    | `/instituciones/:id/comunicados`        | Todos (autenticados)                 | Listar por institución         |
| POST   | `/instituciones/:id/comunicados`        | ADMIN_ESCUELA, EDUCADOR, SUPER_ADMIN | Crear comunicado               |
| GET    | `/instituciones/:id/comunicados/:comId` | Todos (autenticados)                 | Detalle                        |
| PATCH  | `/instituciones/:id/comunicados/:comId` | ADMIN_ESCUELA, EDUCADOR, SUPER_ADMIN | Editar (autor o admin)         |
| DELETE | `/instituciones/:id/comunicados/:comId` | ADMIN_ESCUELA, SUPER_ADMIN           | Soft delete (archivado = true) |

## Reglas de Negocio

- Un comunicado pertenece a una institución — nunca cruza tenants
- Soft delete: `archivado = true` (nunca DELETE físico)
- Solo el autor o ADMIN_ESCUELA/SUPER_ADMIN puede editar
- Solo ADMIN_ESCUELA/SUPER_ADMIN puede archivar
- Listado excluye `archivado: true` automáticamente
- `/me/comunicados` resuelve la institución automáticamente según el rol del usuario

## Resolución de institución por rol

- `ADMIN_ESCUELA`: vía `perfil.institucion` (nombre) → busca en DB
- `EDUCADOR`: vía primer `GrupoEducador` activo → `grupo.institucionId`
- `ESTUDIANTE`: vía primer `GrupoEstudiante` activo → `grupo.institucionId`

## DTOs

### CreateComunicadoDto

```typescript
{
  titulo: string; // 3-200 chars
  contenido: string; // 10-10000 chars
  tipo: TipoComunicado; // default: GENERAL
  prioridad: Prioridad; // default: NORMAL
}
```

### UpdateComunicadoDto

Todos los campos de create son opcionales.

### QueryComunicadosDto

```typescript
{
  page: number         // default: 1
  limit: number        // default: 10, max: 50
  tipo?: TipoComunicado
  prioridad?: Prioridad
}
```

## Respuestas

```typescript
// Singular
{ comunicado: ComunicadoConAutor, message: string }

// Lista
{ comunicados: ComunicadoConAutor[], total, page, limit, totalPages }
```

## Frontend

| Ruta                           | Acceso                  | Descripción            |
| ------------------------------ | ----------------------- | ---------------------- |
| `/dashboard/comunicados`       | Todos los roles         | Listado con filtros    |
| `/dashboard/comunicados/nuevo` | ADMIN_ESCUELA, EDUCADOR | Formulario de creación |

### API Proxy Routes (Next.js)

- `GET/POST /api/me/comunicados`
- `GET/POST /api/instituciones/[id]/comunicados`
- `GET/PATCH/DELETE /api/instituciones/[id]/comunicados/[comId]`
