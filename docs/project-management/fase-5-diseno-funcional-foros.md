# F5-003: Diseño funcional de flujos de foros, reportes y mensajes

## Objetivo

Definir los flujos funcionales completos de la comunidad de Amauta — foros por curso, moderación y reportes de contenido — antes del sprint de implementación.
Incluye estados, transiciones, reglas de negocio y matriz de permisos por rol.

## Alcance

- Documentación funcional y de gestión.
- Sin cambios de código.
- Aplica a foros por curso (ForoPost, ForoRespuesta, ReaccionForo, Notificacion).
- Los mensajes directos entre usuarios quedan **fuera del alcance de Fase 5** (backlog futuro).

---

## 1. Ciclo de vida de un ForoPost

### Estados posibles

| Estado      | Descripción                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `PUBLICADO` | Post visible y activo; acepta respuestas                                    |
| `CERRADO`   | Post visible pero no acepta nuevas respuestas; puede tener solución marcada |
| `ELIMINADO` | Soft delete — no visible para estudiantes; moderador ve placeholder         |

> No hay estado `BORRADOR`. Todo post se publica directamente al crearlo.

### Diagrama de transiciones

```
             crear
               │
               ▼
          PUBLICADO ──── cerrar (autor / educador / admin) ──► CERRADO
               │                                                    │
               │ eliminar (autor / educador / admin)                │ eliminar
               ▼                                                    ▼
          ELIMINADO ◄──────────────────────────────────────── ELIMINADO
```

### Reglas de transición

| Transición            | Quién puede ejecutarla                              | Regla adicional                                             |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| crear → PUBLICADO     | Inscripto activo, EDUCADOR del curso, ADMIN_ESCUELA | Solo EDUCADOR/ADMIN pueden crear tipo ANUNCIO               |
| PUBLICADO → CERRADO   | Autor del post, EDUCADOR del curso, ADMIN_ESCUELA   | El cierre no requiere motivo                                |
| CERRADO → PUBLICADO   | EDUCADOR del curso, ADMIN_ESCUELA                   | Re-abrir es posible; el autor NO puede re-abrir por sí solo |
| PUBLICADO → ELIMINADO | Autor del post, EDUCADOR del curso, ADMIN_ESCUELA   | Soft delete; el contenido se reemplaza por placeholder      |
| CERRADO → ELIMINADO   | Autor del post, EDUCADOR del curso, ADMIN_ESCUELA   | Idem                                                        |

### Comportamiento post-eliminación

- Un post eliminado muestra `[contenido eliminado]` para no romper el hilo.
- Las respuestas del post eliminado siguen visibles si el hilo no fue eliminado.
- El post eliminado no aparece en el listado público del foro.

---

## 2. Ciclo de vida de una ForoRespuesta

### Estados posibles

| Estado      | Descripción                                               |
| ----------- | --------------------------------------------------------- |
| `ACTIVA`    | Respuesta visible, puede marcarse como solución o útil    |
| `ELIMINADA` | Soft delete — muestra placeholder `[respuesta eliminada]` |

### Reglas de eliminación

| Quién puede eliminar  | Condición                             |
| --------------------- | ------------------------------------- |
| Autor de la respuesta | Solo si no está marcada como solución |
| EDUCADOR del curso    | Puede eliminar cualquier respuesta    |
| ADMIN_ESCUELA         | Puede eliminar cualquier respuesta    |

> Si una respuesta marcada como solución es eliminada → se desmarca automáticamente como solución (el post vuelve a estado "no resuelto").

---

## 3. Flujo: Respuesta marcada como solución

### Quién puede marcar

| Rol                     | ¿Puede marcar solución?           |
| ----------------------- | --------------------------------- |
| Autor del post original | ✅ En cualquier respuesta al post |
| EDUCADOR del curso      | ✅ En cualquier respuesta         |
| ADMIN_ESCUELA           | ✅ En cualquier respuesta         |
| Otro estudiante         | ❌                                |

### Restricciones

- Solo un post de tipo `PREGUNTA` puede tener solución marcada.
- Posts de tipo `DISCUSION` o `ANUNCIO` **no admiten marcado de solución**.
- Solo puede existir **una respuesta marcada como solución** por post.
- Si ya existe una solución y se marca otra respuesta → se desmarca la anterior y se marca la nueva (toggle de solución activo).
- El educador puede marcar solución en respuestas a posts que él mismo creó.
- Un post cerrado sigue pudiendo marcar solución si el educador o el autor lo hacen.

### Flujo paso a paso

```
1. Usuario con permiso (autor del post / educador / admin) selecciona una respuesta
2. Llama a POST /foros/respuestas/:id/solucion
3. El sistema verifica:
   a. El post es de tipo PREGUNTA
   b. El usuario tiene permiso
   c. La respuesta pertenece al post
4. Si hay otra respuesta marcada como solución → se desmarca (esSolucion = false)
5. Se marca la nueva respuesta (esSolucion = true)
6. Se dispara Notificacion tipo SOLUCION_MARCADA para el autor de la respuesta marcada
7. El post queda con badge "Resuelto" visible en el listado
```

### Notificación generada

| Evento           | Destinatario                  | Tipo de notificación |
| ---------------- | ----------------------------- | -------------------- |
| Solución marcada | Autor de la respuesta marcada | `SOLUCION_MARCADA`   |

---

## 4. Flujo: Reporte de contenido inapropiado

> **Nota de alcance**: El sistema de reportes de Fase 5 es **básico e interno**.
> No existe un modelo `Reporte` separado; el flujo se gestiona mediante moderación directa.
> Un modelo de reportes formal puede agregarse en Fase 6 si la comunidad lo requiere.

### Mecánica de reporte

El flujo de reporte de contenido inapropiado en Fase 5 funciona así:

1. **Cualquier usuario autenticado** (inscripto o no) puede denunciar contenido inapropiado contactando al EDUCADOR o ADMIN_ESCUELA fuera del sistema (por ahora).
2. **El EDUCADOR** del curso puede eliminar o cerrar cualquier post o respuesta sin requerir denuncia formal.
3. **El ADMIN_ESCUELA** puede moderar cualquier post o respuesta de su institución.

### Por qué no hay modelo Reporte en Fase 5

| Razón               | Detalle                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| Comunidad pequeña   | En instituciones pequeñas, la moderación directa es más eficiente                   |
| Complejidad técnica | Un modelo Reporte requiere flujos de revisión, estados y notificaciones adicionales |
| Prioridad           | La mecánica core de foros tiene mayor prioridad que la moderación avanzada          |
| Escalabilidad       | Si la moderación directa no alcanza en Fase 6, se agrega el modelo Reporte          |

### Acciones disponibles para moderar contenido inapropiado

| Acción                           | Quién puede     | Resultado                                 |
| -------------------------------- | --------------- | ----------------------------------------- |
| Eliminar post (soft delete)      | EDUCADOR, ADMIN | Post muestra `[contenido eliminado]`      |
| Eliminar respuesta (soft delete) | EDUCADOR, ADMIN | Respuesta muestra `[respuesta eliminada]` |
| Cerrar thread                    | EDUCADOR, ADMIN | No acepta nuevas respuestas               |

---

## 5. Reglas de moderación por rol

### EDUCADOR del curso

| Acción                            | ¿Permitido? | Restricción                                      |
| --------------------------------- | ----------- | ------------------------------------------------ |
| Crear ANUNCIO en el foro          | ✅          | Solo en cursos asignados                         |
| Cerrar cualquier thread           | ✅          | Solo en cursos asignados                         |
| Re-abrir un thread cerrado        | ✅          | Solo en cursos asignados                         |
| Eliminar cualquier post           | ✅          | Solo en cursos asignados                         |
| Eliminar cualquier respuesta      | ✅          | Solo en cursos asignados                         |
| Marcar solución en cualquier post | ✅          | Solo en cursos asignados; post debe ser PREGUNTA |
| Ver posts eliminados              | ✅          | Ve el placeholder `[contenido eliminado]`        |

### ADMIN_ESCUELA

| Acción                                        | ¿Permitido? | Restricción                      |
| --------------------------------------------- | ----------- | -------------------------------- |
| Crear ANUNCIO en cualquier foro de la inst.   | ✅          | Solo en institución administrada |
| Cerrar / re-abrir threads de la institución   | ✅          | Solo en institución administrada |
| Eliminar posts y respuestas de la institución | ✅          | Solo en institución administrada |
| Marcar solución en posts de la institución    | ✅          | Solo en institución administrada |
| Ver contenido eliminado                       | ✅          | Idem EDUCADOR                    |

### SUPER_ADMIN

No participa en la moderación de foros directamente. Su acceso es a nivel de plataforma y no interfiere con la lógica institucional de los foros.

---

## 6. Matriz de permisos por rol (crear, responder, reaccionar)

| Acción                               | ESTUDIANTE inscripto | ESTUDIANTE no inscripto | EDUCADOR del curso | ADMIN_ESCUELA  | SUPER_ADMIN |
| ------------------------------------ | -------------------- | ----------------------- | ------------------ | -------------- | ----------- |
| Ver listado de posts                 | ✅                   | ❌ (403)                | ✅                 | ✅             | ✅          |
| Ver detalle de post                  | ✅                   | ❌ (403)                | ✅                 | ✅             | ✅          |
| Crear post tipo PREGUNTA / DISCUSION | ✅                   | ❌ (403)                | ✅                 | ✅             | ❌          |
| Crear post tipo ANUNCIO              | ❌ (403)             | ❌ (403)                | ✅                 | ✅             | ❌          |
| Responder a un post abierto          | ✅                   | ❌ (403)                | ✅                 | ✅             | ❌          |
| Responder a un post cerrado          | ❌ (400)             | ❌ (400/403)            | ❌ (400)           | ❌ (400)       | ❌          |
| Marcar respuesta como "útil"         | ✅ (una vez)         | ❌ (403)                | ✅ (una vez)       | ✅ (una vez)   | ❌          |
| Marcar solución (en su propio post)  | ✅                   | ❌                      | ✅                 | ✅             | ❌          |
| Cerrar thread                        | Solo autor del post  | ❌                      | ✅                 | ✅             | ❌          |
| Eliminar post propio                 | ✅                   | ❌                      | ✅ (cualquiera)    | ✅ (cualquier) | ❌          |
| Eliminar respuesta propia            | ✅                   | ❌                      | ✅ (cualquiera)    | ✅ (cualquier) | ❌          |

### Notas sobre permisos

- **"inscripto"**: Inscripcion con estado `ACTIVO` en el curso al momento de la acción.
- Un usuario desinscripto después de haber creado posts: sus posts permanecen, pero ya no puede crear nuevos ni responder.
- El EDUCADOR del curso puede ejecutar cualquier acción de moderación sobre posts de CUALQUIER usuario en su curso.
- El SUPER_ADMIN no participa en la moderación directa de foros; su acceso es de plataforma.

---

## 7. Flujo de notificaciones básicas

| Evento                                 | Destinatario          | Tipo de notificación | Condición de envío                            |
| -------------------------------------- | --------------------- | -------------------- | --------------------------------------------- |
| Alguien responde un post               | Autor del post        | `NUEVA_RESPUESTA`    | El autor no es quien responde                 |
| Una respuesta es marcada como solución | Autor de la respuesta | `SOLUCION_MARCADA`   | El autor de la respuesta no marcó la solución |
| Post PREGUNTA sin respuesta en el foro | EDUCADOR del curso    | (fuera de Fase 5)    | Se evalúa en Fase 6                           |
| Cuenta desactivada                     | —                     | —                    | Notificación omitida silenciosamente          |

---

## 8. Edge cases documentados

| Caso                                                 | Comportamiento                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Estudiante no inscripto intenta crear post           | `403 Forbidden`                                                                        |
| Usuario desinscripto intenta responder               | `403 Forbidden` — la inscripción se verifica en el momento de la acción                |
| Marcar "útil" dos veces en la misma respuesta        | `409 Conflict` — unique constraint en `[respuestaId, usuarioId]`                       |
| Post cerrado recibe intento de respuesta             | `400 Bad Request` — el post está cerrado                                               |
| Post DISCUSION intenta marcarse con solución         | `400 Bad Request` — solo posts de tipo PREGUNTA admiten solución                       |
| Eliminar respuesta que es solución activa            | Se desmarca `esSolucion = false` antes del soft delete; el post vuelve a "no resuelto" |
| ANUNCIO creado por estudiante                        | `403 Forbidden`                                                                        |
| Educador marca solución en su propio post            | Permitido                                                                              |
| Post con solución marcada → nueva respuesta se marca | La anterior se desmarca (toggle); solo una solución activa por post                    |
| Notificación a usuario con cuenta desactivada        | Omitida silenciosamente, sin error                                                     |

---

## 9. Alcance aclarado: mensajes directos

Los **mensajes directos** (DMs) entre usuarios están mencionados en las historias de la Fase 5 pero **no forman parte del scope de implementación de los sprints 16 y 17**.

| Feature                              | Fase 5 (Sprints 16-17) | Fase futura |
| ------------------------------------ | ---------------------- | ----------- |
| Foros por curso (posts / respuestas) | ✅ Incluido            | —           |
| Moderación directa (EDUCADOR/ADMIN)  | ✅ Incluido            | —           |
| Notificaciones básicas en DB         | ✅ Incluido            | —           |
| Sistema de reportes formal (Reporte) | ❌ Fuera de scope      | Fase 6      |
| Mensajes directos entre usuarios     | ❌ Fuera de scope      | Fase 6      |
| Grupos de estudio                    | ❌ Fuera de scope      | Fase 7+     |
| Estadísticas de participación        | ❌ Fuera de scope      | Fase 6      |

---

## 10. Validación con historias de usuario (F5-001)

| Historia de F5-001                                               | Cubierta en este diseño      | Dónde                                |
| ---------------------------------------------------------------- | ---------------------------- | ------------------------------------ |
| Estudiante inscripto crea post PREGUNTA/DISCUSION                | ✅                           | Sección 6 (permisos)                 |
| Solo educador crea ANUNCIO                                       | ✅                           | Sección 5 (moderación) + sección 6   |
| Estudiante NO inscripto no puede crear posts ni respuestas       | ✅                           | Sección 6 + edge cases (sección 8)   |
| Listado muestra título, autor, tipo, cantidad respuestas, vistas | ✅ (en diseño de API F5-005) | Sección 6                            |
| Post PREGUNTA muestra "Resuelto" cuando tiene solución           | ✅                           | Sección 3 (flujo solución)           |
| Respuesta a respuesta (threading un nivel)                       | ✅                           | Sección 2 (ciclo de vida respuesta)  |
| Post cerrado no acepta respuestas                                | ✅                           | Sección 1 + sección 8 edge cases     |
| Solo educador/autor del post puede marcar solución               | ✅                           | Sección 3                            |
| Solo una respuesta como solución por post                        | ✅                           | Sección 3                            |
| Marcar útil máximo una vez por usuario                           | ✅                           | Sección 6 + sección 8                |
| Educador puede eliminar posts/respuestas                         | ✅                           | Sección 5                            |
| ADMIN_ESCUELA puede moderar todos los cursos de su institución   | ✅                           | Sección 5                            |
| Post eliminado muestra placeholder                               | ✅                           | Sección 1 (comportamiento post-elim) |
| Filtros: tipo, etiqueta, sinResponder                            | ✅ (en diseño de API F5-005) | Sección 6 (permisos de vista)        |
| Notificación de nueva respuesta al autor del post                | ✅                           | Sección 7                            |
| Notificación de solución marcada al autor de la respuesta        | ✅                           | Sección 7                            |
