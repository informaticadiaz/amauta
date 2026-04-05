# Issue #84 — Matriz de Dependencias UI/Backend para Foros y Comunidad

**Qué podés hacer ahora:** Consultá el roadmap para saber exactamente qué construir primero en Fase 5 y por qué — el orden de implementación está documentado y verificado.

---

## Como desarrollador, ahora podés:

### Arrancar Fase 5 sin bloqueos

1. Empezar por F5-004 (Prisma) — define los 4 modelos base.
2. Continuar con F5-005 (API foros) — expone los endpoints sobre esos modelos.
3. Desarrollar F5-006 (UI base) y F5-007 (API interacción) **en paralelo** — ambos dependen solo de F5-005.
4. Cerrar con F5-008 (UI interacción) — necesita F5-006 y F5-007.
5. F5-009 (notificaciones) puede arrancar junto con F5-006/F5-007.

---

## Modelos Prisma a crear (todos en F5-004)

| Modelo          | Para qué sirve                             |
| --------------- | ------------------------------------------ |
| `ForoPost`      | Posts, preguntas y anuncios de un curso    |
| `ForoRespuesta` | Respuestas a posts (threading de un nivel) |
| `ReaccionForo`  | Registro idempotente de "útil" por usuario |
| `Notificacion`  | Notificaciones persistidas en DB           |

---

## Quién puede usarlo

| Rol           | ¿Puede participar en foros?                |
| ------------- | ------------------------------------------ |
| ESTUDIANTE    | ✅ (solo si está inscripto en el curso)    |
| EDUCADOR      | ✅ (puede además moderar y crear ANUNCIOS) |
| ADMIN_ESCUELA | ✅ (puede moderar foros de su institución) |
| SUPER_ADMIN   | ✅                                         |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol           |
| ----------------------- | ----------- | ------------- |
| admin1@amauta.test      | password123 | ADMIN_ESCUELA |
| educador1@amauta.test   | password123 | EDUCADOR      |
| estudiante1@amauta.test | password123 | ESTUDIANTE    |

---

## Nota

Este issue es exclusivamente de planning. No hay UI ni endpoints nuevos — el artefacto es la sección **"Matriz de Dependencias UI/Backend — Fase 5"** en `docs/project-management/roadmap.md`.

El grafo de dependencias confirmado es:

```
F5-004 → F5-005 → F5-006  (puede ir con F5-007)
                → F5-007 → F5-008
                → F5-009   (puede ir con F5-006 y F5-007)
```

Para probar: leer la sección "Matriz de Dependencias UI/Backend — Fase 5" en `docs/project-management/roadmap.md`.
