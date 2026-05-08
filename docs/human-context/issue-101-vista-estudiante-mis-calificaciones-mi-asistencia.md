# Issue #101 — F4b-001: Vista del estudiante — mis calificaciones y mi asistencia

**Qué podés hacer ahora:** Los estudiantes pueden ver sus propias calificaciones y asistencia desde el dashboard, con filtros por periodo y mes.

---

## Como Estudiante, ahora podés:

### Ver tus calificaciones

1. Ir a **Mis notas** en el sidebar
2. Ver tus notas organizadas por periodo académico
3. Cada periodo muestra el promedio del periodo y la nota por materia

### Ver tu asistencia

1. Ir a **Mi asistencia** en el sidebar
2. Seleccionar mes y año
3. Ver resumen: presentes, ausentes, tardanzas, justificados y % de asistencia
4. Ver el detalle cronológico de cada registro

---

## Quién puede usarlo

| Rol           | Mis notas | Mi asistencia |
| ------------- | --------- | ------------- |
| ESTUDIANTE    | ✅        | ✅            |
| EDUCADOR      | ❌        | ❌            |
| ADMIN_ESCUELA | ❌        | ❌            |
| SUPER_ADMIN   | ❌        | ❌            |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |

---

## Nota técnica

Los endpoints del estudiante son completamente separados de los del admin/educador:

- `GET /api/v1/me/calificaciones?periodoAcademicoId=X` → solo devuelve datos del usuario autenticado
- `GET /api/v1/me/asistencias?mes=3&anio=2026` → ídem

Un estudiante no puede ver datos de otro — el `estudianteId` se toma del JWT, no del request.
