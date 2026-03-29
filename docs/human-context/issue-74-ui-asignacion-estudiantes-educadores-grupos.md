# Issue #74 — F4-009: UI Asignación de estudiantes y educadores a grupos

**Qué podés hacer ahora:** administrar desde el dashboard qué estudiantes y qué educadores están asignados a cada grupo.

---

## Como Administrador de Escuela, ahora podés:

### Gestionar estudiantes de un grupo

1. Iniciá sesión y entrá a **Grupos**.
2. Abrí un grupo y navegá a la sección de estudiantes.
3. Buscá estudiantes de tu institución, previsualizá qué se agrega, qué ya estaba y qué tiene errores, y confirmá la asignación.

### Gestionar educadores de un grupo

1. Desde el mismo grupo, abrí la sección de educadores.
2. Seleccioná un educador y elegí si será `TITULAR` o `SUPLENTE`.
3. También podés ver las asignaciones actuales y removerlas cuando haga falta.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ❌             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ❌             |

---

## Usuarios de prueba para testear

| Email              | Contraseña  | Rol           |
| ------------------ | ----------- | ------------- |
| admin1@amauta.test | password123 | ADMIN_ESCUELA |
| admin2@amauta.test | password123 | ADMIN_ESCUELA |

---

## Nota

> La navegación real quedó en `/dashboard/grupos/[id]/estudiantes` y `/dashboard/grupos/[id]/educadores`, integrada al dashboard actual de grupos.
