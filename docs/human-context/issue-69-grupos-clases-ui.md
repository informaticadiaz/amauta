# Issue #69 — F4-006: UI Gestión de Grupos/Clases

**Qué podés hacer ahora:** Los administradores de escuela pueden ver, crear y editar grupos desde el dashboard.

---

## Como Administrador de Escuela, ahora podés:

### Ver tus grupos

1. Iniciá sesión en https://amauta.diazignacio.ar/login con tu cuenta de administrador
2. En el menú lateral, hacé clic en **Grupos**
3. Vas a ver todos los grupos de tu institución con su nombre, grado, sección y estado (activo/inactivo)

### Filtrar grupos

Desde la página de grupos podés filtrar por:

- **Estado**: Ver todos, solo los activos o solo los inactivos
- **Período académico**: Ver los grupos de un ciclo lectivo específico

### Crear un grupo nuevo

1. Desde la página de grupos, hacé clic en **Nuevo grupo**
2. Completá los campos:
   - **Nombre del grupo** (obligatorio): Ej: "3ro A", "5to Secundaria"
   - **Grado** (opcional): Ej: "3ro"
   - **Sección** (opcional): Ej: "A"
   - **Período académico** (opcional): seleccioná el ciclo lectivo del grupo
   - **ID del educador** (obligatorio): el UUID del educador que estará a cargo
3. Hacé clic en **Crear grupo**

> Nota: Para conocer el UUID de un educador, podés consultarlo con el administrador del sistema.

### Editar un grupo

1. Desde la lista de grupos, hacé clic en **Editar** junto al grupo que querés modificar
2. Actualizá los campos que necesitás cambiar
3. Hacé clic en **Guardar cambios**

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ❌             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ❌ (por ahora) |

---

## Usuarios de prueba para testear

| Email              | Contraseña  | Rol           |
| ------------------ | ----------- | ------------- |
| admin1@amauta.test | password123 | ADMIN_ESCUELA |
| admin2@amauta.test | password123 | ADMIN_ESCUELA |
