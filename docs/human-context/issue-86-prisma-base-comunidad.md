# Issue #86 — Prisma base de comunidad: foros, respuestas y reacciones

**Qué podés hacer ahora:** La base de datos ahora soporta foros por curso con publicaciones, respuestas, reacciones y notificaciones.

---

## Qué se agregó a la base de datos

### Publicaciones en foros (ForoPost)

Cada curso ahora puede tener un foro donde los usuarios crean publicaciones:

- **PREGUNTA**: Para hacer consultas que pueden tener una solución marcada
- **DISCUSION**: Para conversaciones abiertas sin solución específica
- **ANUNCIO**: Solo educadores y admins pueden crearlos

Las publicaciones pueden estar:

- **PUBLICADAS**: Visibles y aceptan respuestas
- **CERRADAS**: Visibles pero no aceptan nuevas respuestas
- **ELIMINADAS**: Ocultas (soft delete)

### Respuestas (ForoRespuesta)

Los usuarios pueden responder a publicaciones:

- Threading de un nivel (respuestas a respuestas)
- Una respuesta puede marcarse como "solución" en posts tipo PREGUNTA
- Solo una respuesta puede ser solución por publicación

### Reacciones (ReaccionForo)

Los usuarios pueden marcar respuestas como "útiles":

- Cada usuario puede reaccionar una sola vez por respuesta
- Ayuda a destacar las respuestas más valiosas

### Notificaciones (Notificacion)

El sistema puede notificar a los usuarios:

- **NUEVA_RESPUESTA**: Cuando alguien responde a tu publicación
- **SOLUCION_MARCADA**: Cuando tu respuesta fue marcada como solución
- **PREGUNTA_SIN_RESPONDER**: Posts sin respuesta (para educadores, futuro)

---

## Quién puede usarlo

Esta es una migración de base de datos. No hay UI aún — se implementará en los siguientes issues de la Fase 5.

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | (Próximamente) |
| EDUCADOR      | (Próximamente) |
| ADMIN_ESCUELA | (Próximamente) |
| SUPER_ADMIN   | N/A            |

---

## Próximos pasos

Este issue habilita la infraestructura de datos. Los siguientes issues agregarán:

- **F5-005**: API para crear y listar posts y respuestas
- **F5-006**: UI básica del foro por curso

---

## Nota técnica

Esta es una migración de base de datos (Prisma) sin API ni UI. Los modelos creados son:

| Tabla             | Propósito                        |
| ----------------- | -------------------------------- |
| `foro_posts`      | Publicaciones en foros de cursos |
| `foro_respuestas` | Respuestas a publicaciones       |
| `reacciones_foro` | Marcas "útil" en respuestas      |
| `notificaciones`  | Notificaciones del sistema       |

La migración se aplicará automáticamente en el próximo deploy a producción.
