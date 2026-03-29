# Issue #73 — F4-008: API Asignación de educadores a grupos

**Qué podés hacer ahora:** asignar educadores a un grupo con rol titular o suplente y hacer que esos grupos aparezcan en su panel.

---

## Como Administrador de Escuela, ahora podés:

### Asignar un educador a un grupo

1. Elegí un grupo de tu institución.
2. Enviá el ID del educador junto con su rol: `TITULAR` o `SUPLENTE`.
3. El sistema valida que sea educador, que pertenezca a la misma institución y evita duplicados activos.

### Gestionar las asignaciones existentes

1. Podés listar los educadores ya asignados a un grupo.
2. Podés remover una asignación sin perder el historial.
3. El educador asignado puede consultar sus grupos desde su propio endpoint.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                  | Contraseña  | Rol           |
| ---------------------- | ----------- | ------------- |
| admin1@amauta.test     | password123 | ADMIN_ESCUELA |
| educador1@amauta.test  | password123 | EDUCADOR      |
| superadmin@amauta.test | password123 | SUPER_ADMIN   |

---

## Nota

> API sin UI. Probala con `POST /api/v1/grupos/:id/educadores` enviando:
>
> ```json
> { "educadorId": "clxedu1", "rol": "TITULAR" }
> ```
>
> Para validar el resultado también existen `GET /api/v1/grupos/:id/educadores` y `GET /api/v1/educadores/me/grupos`.
