# Issue #85 — F5-003: Diseño funcional de flujos de foros, reportes y mensajes

**Qué podés hacer ahora:** Consultar una guía clara de flujos y permisos del foro por curso para planificar los sprints de implementación de la Fase 5.

---

## Como desarrollador, ahora podés:

### Entender el ciclo de vida de un post

1. Un post se crea directamente en estado PUBLICADO (no hay borrador).
2. Puede cerrarse (no acepta más respuestas) o eliminarse (soft delete, muestra placeholder).
3. Solo el EDUCADOR o ADMIN_ESCUELA puede re-abrir un thread cerrado.

### Saber exactamente quién puede hacer qué

- **Estudiante inscripto**: crear PREGUNTA/DISCUSION, responder, marcar útil.
- **Educador del curso**: todo lo anterior + ANUNCIO, cerrar, eliminar, marcar solución.
- **Admin Escuela**: moderación completa de todos los cursos de la institución.
- **No inscripto**: acceso denegado (403).

### Implementar la lógica de solución y útil

- Solo posts de tipo PREGUNTA admiten solución marcada.
- Solo una solución activa por post; marcar otra desplaza la anterior.
- Útil es idempotente: unique constraint `[respuestaId, usuarioId]`.

---

## Quién puede usarlo

| Rol           | ¿Puede participar en foros? |
| ------------- | --------------------------- |
| ESTUDIANTE    | ✅ (inscripto en el curso)  |
| EDUCADOR      | ✅                          |
| ADMIN_ESCUELA | ✅                          |
| SUPER_ADMIN   | ❌ (no participa en foros)  |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol           |
| ----------------------- | ----------- | ------------- |
| educador1@amauta.test   | password123 | EDUCADOR      |
| admin1@amauta.test      | password123 | ADMIN_ESCUELA |
| estudiante1@amauta.test | password123 | ESTUDIANTE    |

---

## Nota

Este issue es de planning — no genera código. El documento de diseño completo está en:

`docs/project-management/fase-5-diseno-funcional-foros.md`

Los **mensajes directos** entre usuarios están **fuera del alcance de Fase 5** y se planifican para Fase 6+.
