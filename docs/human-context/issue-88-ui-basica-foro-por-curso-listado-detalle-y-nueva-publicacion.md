# Issue #88 — F5-006: UI básica de foro por curso: listado, detalle y nueva publicación

**Qué podés hacer ahora:** entrar al foro de un curso al que tenés acceso, publicar un post nuevo, ver el hilo completo y responder dentro de la conversación.

---

## Como estudiante o educador con acceso al curso, ahora podés:

### Entrar al foro del curso

1. Abrí la página pública del curso.
2. Si ya estás inscripto o tenés acceso al curso, usá el botón `Ir al foro del curso`.
3. Vas a ver el listado de publicaciones del foro de ese curso.

### Publicar una nueva pregunta, discusión o anuncio

1. Entrá a `/cursos/[slug]/foro`.
2. Completá el formulario con tipo, título, contenido y etiquetas.
3. Al publicar, el post aparece en el listado del foro.

### Ver un hilo y responder

1. Abrí cualquier publicación desde el listado.
2. Leé el detalle del post y las respuestas existentes.
3. Respondé al hilo general o a una respuesta puntual usando el formulario.

### Moderar un hilo si sos autor o moderador

1. Entrá al detalle del post.
2. Si sos autor del post, educador del curso, `ADMIN_ESCUELA` o `SUPER_ADMIN`, vas a ver acciones de moderación.
3. Podés cerrar el thread o eliminarlo desde la misma pantalla.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ✅             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol           |
| ----------------------- | ----------- | ------------- |
| estudiante1@amauta.test | password123 | ESTUDIANTE    |
| educador1@amauta.test   | password123 | EDUCADOR      |
| admin1@amauta.test      | password123 | ADMIN_ESCUELA |

---

## Nota

> Esta issue implementa la UI y los proxies del foro. El acceso real depende de las reglas del backend de foros ya existentes.
> Rutas nuevas:
>
> - `/cursos/[slug]/foro`
> - `/cursos/[slug]/foro/[postId]`
