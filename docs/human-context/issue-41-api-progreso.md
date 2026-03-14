# Issue #41 — F1-014: API seguimiento de progreso

**Qué podés hacer ahora:** El sistema registra automáticamente cuándo un estudiante completa una lección y calcula su porcentaje de avance en el curso.

---

## Estudiante, ahora podés:

### Marcar una lección como completada
1. Al terminar de ver o leer una lección, el sistema puede registrarla como completada
2. Esta acción es segura: si la marcás dos veces, no genera ningún error
3. El sistema actualiza automáticamente tu porcentaje de avance en el curso
4. Cuando completás todas las lecciones, el curso queda marcado como "Completado" en tus inscripciones

### Ver tu progreso en un curso
- Podés consultar cuántas lecciones completaste y cuántas quedan
- Verás un porcentaje de avance (ej: "4 de 10 lecciones — 40%")
- También se registra cuál fue la última lección que visitaste

---

## Educador, ahora podés:

### Ver el progreso de tus estudiantes
- Consultá cuánto avanzó cada estudiante inscripto en tu curso
- Ves el porcentaje de avance, las lecciones completadas y la fecha de inscripción
- Solo los cursos que creaste vos muestran esta información

---

## Quién puede usarlo

| Rol | ¿Puede marcar lecciones? | ¿Puede ver su progreso? | ¿Puede ver progreso de estudiantes? |
| --- | --- | --- | --- |
| ESTUDIANTE | ✅ | ✅ | ❌ |
| EDUCADOR | ✅ | ✅ | ✅ (solo sus cursos) |
| ADMIN_ESCUELA | ✅ | ✅ | ✅ (cualquier curso) |
| SUPER_ADMIN | ✅ | ✅ | ✅ (cualquier curso) |

---

## Usuarios de prueba para testear

| Email | Contraseña | Rol |
| --- | --- | --- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |
| educador1@amauta.test | password123 | EDUCADOR |

---

## Nota

Esta funcionalidad es solo la base de datos (API). La pantalla para marcar lecciones como completadas desde el navegador se agrega en el siguiente paso (F1-015).
