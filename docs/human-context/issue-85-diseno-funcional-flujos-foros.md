# Issue #85 — F5-003: Diseño funcional de flujos de foros, reportes y mensajes

**Qué podés hacer ahora:** Los flujos funcionales de los foros de Fase 5 están documentados — estados, transiciones, permisos por rol y reglas de notificación. El equipo puede implementar F5-004 en adelante sin ambigüedad sobre la lógica de negocio.

---

## Como miembro del equipo, ahora podés:

### Consultar el ciclo de vida de un post

Cada `ForoPost` tiene dos campos de estado independientes: `cerrado` y `eliminado`. El flujo documentado define:

1. Quién puede cerrar un thread y quién puede reabrirlo
2. Cómo funciona el soft delete (el contenido nunca se borra — se reemplaza por un placeholder)
3. Cuándo un post de tipo PREGUNTA muestra el badge "Resuelto" (derivado, no almacenado)

### Consultar cómo funciona "marcar solución"

El flujo de solución está documentado con sus tres escenarios:

1. Marcar una respuesta como solución por primera vez
2. Cambiar la solución a otra respuesta (toggle automático)
3. Qué pasa si la respuesta solución es eliminada (el post vuelve a "no resuelto")

### Consultar el flujo de reportes de contenido

El proceso de reporte tiene cuatro estados: `PENDIENTE → EN_REVISION → RESUELTO / RECHAZADO`. Se documenta quién puede reportar (cualquier autenticado) y quién puede revisar (EDUCADOR en su curso, ADMIN_ESCUELA en su institución).

### Consultar la tabla de permisos por rol

La tabla de permisos cubre todas las acciones del foro para los cuatro roles del sistema, incluyendo casos especiales como "el autor del post puede marcar solución en su propio post" o "un estudiante desinscripto no puede crear posts nuevos pero sus posts existentes permanecen".

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?                                             |
| ------------- | ---------------------------------------------------------- |
| ESTUDIANTE    | ✅ Participa en foros (si está inscripto activo)           |
| EDUCADOR      | ✅ Crea ANUNCIO, modera, marca solución, resuelve reportes |
| ADMIN_ESCUELA | ✅ Modera foros de todos los cursos de su institución      |
| SUPER_ADMIN   | ✅ Acceso total                                            |

---

## Nota

Este issue es de planificación — no genera código. El artefacto entregado es la sección **"Flujos Funcionales — Fase 5"** en `docs/project-management/roadmap.md`, que incluye:

- **Flujo 1**: Ciclo de vida de un `ForoPost` — estados, transiciones y quién ejecuta cada una
- **Flujo 2**: Respuesta marcada como solución — toggle, idempotencia y soft delete
- **Flujo 3**: Reporte de contenido inapropiado — estados y roles moderadores
- **Flujo 4**: Tabla de permisos por rol para todas las acciones del foro
- **Flujo 5**: Notificaciones disparadas por acciones — reglas de deduplicación

Para ver los flujos completos: `docs/project-management/roadmap.md` → sección "Flujos Funcionales — Fase 5".
