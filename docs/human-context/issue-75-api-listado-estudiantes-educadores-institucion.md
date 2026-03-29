# Issue #75 — F4-010: API listado de estudiantes y educadores por institución

**Qué podés hacer ahora:** buscar y paginar estudiantes o educadores de una institución para usarlos en selectores administrativos.

---

## Como Administrador de Escuela, ahora podés:

### Buscar estudiantes disponibles

1. Consultá el endpoint de estudiantes de tu institución.
2. Filtrá por nombre, apellido o email usando `buscar`.
3. Navegá por páginas para trabajar con listas largas.

### Buscar educadores disponibles

1. Consultá el endpoint de educadores de tu institución.
2. Aplicá los mismos filtros y paginación.
3. Usá esos resultados para asignaciones de grupos u otras operaciones administrativas.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ❌             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                  | Contraseña  | Rol           |
| ---------------------- | ----------- | ------------- |
| admin1@amauta.test     | password123 | ADMIN_ESCUELA |
| superadmin@amauta.test | password123 | SUPER_ADMIN   |

---

## Nota

> API sin UI. Probala con:
>
> - `GET /api/v1/instituciones/:id/estudiantes?page=1&limit=10&buscar=ana`
> - `GET /api/v1/instituciones/:id/educadores?page=1&limit=10&buscar=juan`
>
> La respuesta devuelve `usuarios`, `total`, `page`, `limit` y `totalPages`.
