# Issue #83 — F5-001: Refinar historias y criterios de aceptación de comunidad

**Qué podés hacer ahora:** Los criterios de aceptación de la Fase 5 (Comunidad y Colaboración) están definidos en el roadmap, permitiendo empezar el desarrollo de foros con expectativas claras y casos edge documentados.

---

## Como miembro del equipo, ahora podés:

### Entender qué se espera de los foros

El roadmap ahora documenta exactamente qué debe funcionar en cada sprint:

1. **Sprint 16** — Foro básico: crear posts, responder, filtrar, moderar
2. **Sprint 17** — Interacción enriquecida: marcar solución, útil, notificaciones básicas

### Consultar los criterios de aceptación por historia

Cada funcionalidad tiene criterios concretos. Por ejemplo:

- Un estudiante NO inscripto en un curso **no puede** crear posts ni respuestas
- Solo el educador del curso o el autor del post puede marcar solución
- Marcar "útil" es posible solo una vez por usuario por respuesta
- Un post cerrado no acepta nuevas respuestas

### Consultar los edge cases documentados

Los casos límite están tabulados para evitar interpretaciones durante el desarrollo:

- ¿Qué pasa si un usuario se desinscribe después de haber creado posts?
- ¿Qué pasa si se elimina una respuesta marcada como solución?
- ¿El endpoint de "útil" es idempotente o lanza error al reintentar?

Todos estos casos tienen respuesta explícita en el roadmap bajo la sección "Edge cases y reglas de negocio".

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?                                        |
| ------------- | ----------------------------------------------------- |
| ESTUDIANTE    | ✅ Participa en foros (si está inscripto)             |
| EDUCADOR      | ✅ Crea ANUNCIO, modera, marca solución               |
| ADMIN_ESCUELA | ✅ Modera foros de todos los cursos de su institución |
| SUPER_ADMIN   | ✅ Acceso total                                       |

---

## Nota

Este issue es de planificación — no genera código. El artefacto entregado es la sección actualizada en `docs/project-management/roadmap.md` bajo "Fase 5: Comunidad y Colaboración", que incluye:

- **Historias clave y criterios de aceptación** — por funcionalidad y rol
- **Edge cases y reglas de negocio** — tabla con comportamientos esperados
- **Alcance por Sprint** — criterios de salida y tabla de issues para Sprint 16 y Sprint 17

Para ver los criterios completos, consultar: `docs/project-management/roadmap.md` → sección "Fase 5".
