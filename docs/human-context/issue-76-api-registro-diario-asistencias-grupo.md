# Issue #76 — F4-011: API Registro diario de asistencias por grupo

**Qué podés hacer ahora:** cargar o corregir la asistencia diaria de un grupo por fecha, con control de permisos y validaciones.

---

## Como Administrador de Escuela o Educador asignado, ahora podés:

### Ver la nómina del día

1. Elegí un grupo y una fecha.
2. Consultá qué estudiantes activos forman parte de la nómina de ese día.
3. Si ya había asistencia cargada, el sistema devuelve el estado actual por estudiante.

### Registrar o editar la asistencia diaria

1. Enviá los estados `PRESENTE`, `AUSENTE`, `TARDANZA` o `JUSTIFICADO`.
2. Si corregís una asistencia ya registrada del mismo día, debés agregar una observación.
3. El sistema informa cuántos registros creó y cuántos actualizó.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ❌             |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Nota

> API sin UI. Probala con:
>
> - `GET /api/v1/grupos/:grupoId/asistencias?fecha=2026-03-29`
> - `PUT /api/v1/grupos/:grupoId/asistencias`
>
> Body de ejemplo:
>
> ```json
> {
>   "fecha": "2026-03-29",
>   "asistencias": [
>     { "estudianteId": "clxest1", "estado": "PRESENTE" },
>     {
>       "estudianteId": "clxest2",
>       "estado": "AUSENTE",
>       "observaciones": "Aviso de la familia"
>     }
>   ]
> }
> ```
