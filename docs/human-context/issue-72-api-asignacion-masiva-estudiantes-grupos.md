# Issue #72 — F4-007: API Asignación masiva de estudiantes a grupos

**Qué podés hacer ahora:** asignar varios estudiantes a un grupo en una sola operación y ver si hubo altas, duplicados o errores.

---

## Como Administrador de Escuela, ahora podés:

### Asignar estudiantes a un grupo en bloque

1. Elegí un grupo existente de tu institución.
2. Enviá una lista de IDs de estudiantes en una sola petición.
3. El sistema responde cuáles se agregaron, cuáles ya estaban asignados y cuáles fallaron por validación.

### Revisar y mantener la asignación

1. Podés consultar la lista actual de estudiantes del grupo con paginación.
2. También podés remover una asignación sin borrar el historial.

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

> API sin UI. Probala con `POST /api/v1/grupos/:id/estudiantes` enviando:
>
> ```json
> { "estudiantesIds": ["clxest1", "clxest2"] }
> ```
>
> También podés usar `GET /api/v1/grupos/:id/estudiantes?page=1&limit=10` y `DELETE /api/v1/grupos/:id/estudiantes/:estudianteId`.
