# Módulo Foros

## Contrato público

Base path: rutas anidadas bajo `cursos/:id/foros`.

### Endpoints

- `GET /cursos/:id/foros`
  - Lista posts del foro de un curso.
  - Filtros soportados: `tipo`, `etiqueta`, `sinResponder`, `page`, `limit`.
  - Paginación por defecto: `20`.

- `POST /cursos/:id/foros`
  - Crea un post tipo `PREGUNTA`, `DISCUSION` o `ANUNCIO`.
  - `ANUNCIO` queda reservado para educador del curso, `ADMIN_ESCUELA` de la misma institución o `SUPER_ADMIN`.

- `GET /cursos/:id/foros/:postId`
  - Devuelve detalle del post y su hilo de respuestas.
  - Si el post fue eliminado, el contenido visible se reemplaza por `[contenido eliminado]`.

- `POST /cursos/:id/foros/:postId/respuestas`
  - Crea una respuesta en el hilo.
  - Si responde a otra respuesta, solo se permite un nivel de anidación.
  - Si responde un usuario distinto al autor del post, se crea `Notificacion` de tipo `NUEVA_RESPUESTA`.

- `DELETE /cursos/:id/foros/:postId`
  - Soft delete de post.
  - Marca `eliminado=true` y `estado=ELIMINADO`.

- `DELETE /cursos/:id/foros/:postId/respuestas/:respuestaId`
  - Soft delete de respuesta.
  - Marca `eliminado=true`.

- `POST /cursos/:id/foros/:postId/cerrar`
  - Cambia el post a estado `CERRADO`.

## Reglas de acceso

- Lectura y escritura del foro:
  - inscripción activa al curso, o
  - educador propietario del curso, o
  - `ADMIN_ESCUELA` de la misma institución que el educador del curso, o
  - `SUPER_ADMIN`.

- Moderación (`ANUNCIO`, cerrar, eliminar):
  - autor del contenido, educador propietario, `ADMIN_ESCUELA` de la misma institución o `SUPER_ADMIN`, según el caso.

## Modelos usados

- `ForoPost`
- `ForoRespuesta`
- `Notificacion`
- `Inscripcion`
- `Curso`
- `Usuario`
