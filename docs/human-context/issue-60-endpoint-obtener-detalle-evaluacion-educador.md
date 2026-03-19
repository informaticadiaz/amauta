# Issue #60 — F3-009: Endpoint obtener detalle de evaluacion (educador)

**Qué podés hacer ahora:** Ver el detalle básico de una evaluación creada para tus cursos (sin incluir preguntas).

---

## Educador, ahora podés:

### Revisar detalle básico de una evaluación

1. Iniciá sesión como educador.
2. Entrá al listado de evaluaciones y elegí una evaluación de tu curso.
3. El sistema ya tiene disponible su información básica para mostrar en una vista de detalle (título, descripción, tiempo límite, puntaje mínimo e intentos).

### Control de acceso

- Solo el creador del curso puede acceder al detalle de sus evaluaciones.
- Los roles administrativos también tienen acceso.

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

| Email                 | Contraseña  | Rol      |
| --------------------- | ----------- | -------- |
| educador1@amauta.test | password123 | EDUCADOR |
