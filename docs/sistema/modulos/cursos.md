# Cursos

> Los cursos son el corazón de Amauta: contenido educativo organizado en lecciones que los estudiantes pueden explorar, inscribirse y completar a su ritmo.

**Estado**: ✅ Funcional
**Última actualización**: 2026-03-20

---

## ¿Qué puedo hacer?

### Como Visitante (sin cuenta)

- Ver el catálogo de cursos disponibles
- Buscar cursos por título o descripción
- Filtrar por categoría o nivel de dificultad
- Ver el detalle de cualquier curso publicado
- Ver la lista de lecciones de un curso

### Como Estudiante

Todo lo anterior, más:

- Inscribirte a cursos que te interesen
- Acceder a las lecciones de los cursos donde estás inscrito
- Ver tu progreso en cada curso
- Descargar cursos para verlos sin conexión a internet

### Como Educador

Todo lo anterior, más:

- Crear nuevos cursos
- Editar tus cursos (título, descripción, imagen, nivel)
- Agregar, editar y ordenar lecciones dentro de tus cursos
- Publicar tus cursos para que los estudiantes los vean
- Despublicar cursos temporalmente
- Archivar cursos que ya no quieres ofrecer
- Ver la lista de estudiantes inscritos en tus cursos
- Ver el progreso de cada estudiante

### Como Administrador

Todo lo anterior, más:

- Gestionar cualquier curso del sistema
- Ver estadísticas generales de cursos

---

## Funcionalidades Detalladas

### Explorar el Catálogo

**¿Qué es?**
Una página donde puedes ver todos los cursos disponibles para inscribirte.

**¿Cómo accedo?**
Desde el menú principal, hacé clic en "Cursos" o andá directamente a `/cursos`.

**¿Quién puede usarlo?**
Cualquier persona, incluso sin cuenta.

**¿Qué puedo hacer?**

- Buscar cursos escribiendo palabras clave
- Filtrar por categoría (ej: Matemáticas, Programación, Idiomas)
- Filtrar por nivel: Principiante, Intermedio o Avanzado
- Ordenar por fecha de publicación o título
- Ver cuántas lecciones tiene cada curso
- Ver cuántos estudiantes ya están inscritos

---

### Ver Detalle de un Curso

**¿Qué es?**
Una página con toda la información de un curso específico.

**¿Cómo accedo?**
Hacé clic en cualquier curso del catálogo.

**¿Quién puede usarlo?**
Cualquier persona.

**¿Qué veo?**

- Título y descripción completa
- Imagen de portada
- Nivel de dificultad
- Categoría
- Nombre del educador que lo creó
- Lista de todas las lecciones
- Duración estimada
- Botón para inscribirte (si tenés cuenta)

---

### Crear un Curso

**¿Qué es?**
Crear un nuevo curso desde cero.

**¿Cómo accedo?**
Desde el panel de educador: "Mis Cursos" → "Crear Nuevo Curso", o directamente en `/dashboard/cursos/nuevo`.

**¿Quién puede usarlo?**
Educadores, Administradores de escuela y Super administradores.

**¿Qué necesito completar?**

- **Título** (obligatorio): El nombre del curso (3-200 caracteres)
- **Descripción** (obligatorio): De qué trata el curso (10-5000 caracteres)
- **Categoría** (obligatorio): Seleccionar una categoría existente
- **Nivel** (obligatorio): Principiante, Intermedio o Avanzado
- **Imagen** (opcional): Una imagen de portada
- **Duración** (opcional): Tiempo estimado en minutos

**¿Qué pasa después?**
El curso se crea en estado "Borrador". Solo vos podés verlo hasta que lo publiques.

---

### Editar un Curso

**¿Qué es?**
Modificar la información de un curso que creaste.

**¿Cómo accedo?**
Desde "Mis Cursos", hacé clic en el ícono de editar del curso.

**¿Quién puede usarlo?**
Solo el educador que creó el curso (o un administrador).

**¿Qué puedo cambiar?**

- Título
- Descripción
- Imagen
- Nivel
- Categoría
- Duración estimada

**Nota**: No podés editar cursos creados por otros educadores, a menos que seas administrador.

---

### Publicar un Curso

**¿Qué es?**
Hacer que tu curso sea visible para todos los estudiantes en el catálogo.

**¿Cómo accedo?**
Desde "Mis Cursos", hacé clic en el botón "Publicar" del curso.

**¿Quién puede usarlo?**
El educador dueño del curso.

**¿Qué necesito?**
El curso debe tener al menos la información básica completa. Se recomienda agregar lecciones antes de publicar.

**¿Qué pasa después?**

- El curso aparece en el catálogo público
- Los estudiantes pueden inscribirse
- Se registra la fecha de publicación

---

### Despublicar un Curso

**¿Qué es?**
Ocultar temporalmente un curso del catálogo, sin eliminarlo.

**¿Cómo accedo?**
Desde "Mis Cursos", hacé clic en "Despublicar".

**¿Quién puede usarlo?**
El educador dueño del curso.

**¿Qué pasa con los estudiantes inscritos?**
Siguen inscriptos y pueden seguir accediendo al contenido. Solo se oculta del catálogo para nuevas inscripciones.

---

### Archivar un Curso

**¿Qué es?**
Eliminar un curso de forma permanente (sin borrarlo completamente del sistema).

**¿Cómo accedo?**
Desde "Mis Cursos", hacé clic en el ícono de eliminar.

**¿Quién puede usarlo?**
El educador dueño del curso.

**¿Qué pasa?**

- El curso desaparece del catálogo
- Los estudiantes ya no pueden acceder
- El curso queda guardado en el sistema por si necesitás recuperarlo

---

### Ver Mis Cursos (Educador)

**¿Qué es?**
Una página donde ves todos los cursos que creaste.

**¿Cómo accedo?**
Desde el panel: "Mis Cursos" o `/dashboard/cursos`.

**¿Quién puede usarlo?**
Educadores y administradores.

**¿Qué veo?**

- Lista de todos tus cursos
- Estado de cada uno (Borrador, Publicado, Archivado)
- Cantidad de estudiantes inscritos
- Acciones rápidas: editar, publicar, gestionar lecciones

---

### Acceso Sin Conexión

**¿Qué es?**
Descargar un curso para verlo cuando no tengas internet.

**¿Cómo accedo?**
En la página del curso, hacé clic en "Descargar para offline".

**¿Quién puede usarlo?**
Estudiantes inscriptos en el curso.

**¿Qué se descarga?**

- Información del curso
- Todas las lecciones de texto
- Videos (si el dispositivo tiene espacio)

**¿Dónde lo veo?**
En la sección "Mis Cursos Offline" del panel.

---

## Estados de un Curso

| Estado        | Significado                | ¿Quién lo ve?    |
| ------------- | -------------------------- | ---------------- |
| **Borrador**  | El curso está en edición   | Solo el educador |
| **Publicado** | Visible para inscripciones | Todos            |
| **Archivado** | Eliminado (oculto)         | Nadie            |

### Transiciones posibles

```
Borrador → Publicado (al publicar)
Publicado → Borrador (al despublicar)
Cualquiera → Archivado (al eliminar)
```

---

## Flujos Comunes

### Crear y publicar mi primer curso

1. Iniciá sesión como educador
2. Andá a "Mis Cursos" en el panel
3. Hacé clic en "Crear Nuevo Curso"
4. Completá el título, descripción, categoría y nivel
5. (Opcional) Subí una imagen de portada
6. Guardá el curso (queda en Borrador)
7. Agregá lecciones desde la sección de lecciones
8. Cuando esté listo, hacé clic en "Publicar"

### Encontrar e inscribirme a un curso

1. Andá al "Catálogo de Cursos"
2. Usá la búsqueda o filtros para encontrar lo que te interesa
3. Hacé clic en un curso para ver el detalle
4. Hacé clic en "Inscribirme"
5. El curso aparece en "Mis Cursos" del panel de estudiante

### Editar un curso ya publicado

1. Andá a "Mis Cursos"
2. Hacé clic en editar (ícono de lápiz)
3. Modificá lo que necesites
4. Guardá los cambios
5. Los cambios se reflejan inmediatamente

---

## Preguntas Frecuentes

### ¿Puedo crear cursos sin ser educador?

No. Necesitás tener el rol de Educador, Administrador de escuela o Super administrador.

### ¿Cuántos cursos puedo crear?

No hay límite.

### ¿Puedo eliminar un curso con estudiantes inscriptos?

Sí, pero los estudiantes perderán acceso. El sistema te pedirá confirmación.

### ¿Los estudiantes ven mis cursos en borrador?

No. Solo vos podés ver los cursos en borrador. Aparecen en el catálogo recién cuando los publicás.

### ¿Puedo cambiar el educador de un curso?

No desde la interfaz. Contactá a un administrador si necesitás transferir un curso.

### ¿Qué pasa si despublico un curso?

Los estudiantes inscriptos mantienen acceso, pero no aparecen nuevas inscripciones.

### ¿Puedo recuperar un curso archivado?

Contactá a un administrador. El curso no se borra físicamente del sistema.

---

## Limitaciones Conocidas

- No se pueden crear subcategorías para cursos
- No hay sistema de comentarios o reseñas en cursos
- No se pueden duplicar cursos existentes
- La búsqueda es solo por título y descripción (no por contenido de lecciones)

---

## Próximas Mejoras

- [ ] Sistema de reseñas y calificaciones
- [ ] Duplicar cursos existentes
- [ ] Certificados al completar cursos
- [ ] Requisitos previos entre cursos
- [ ] Cursos privados (solo por invitación)
