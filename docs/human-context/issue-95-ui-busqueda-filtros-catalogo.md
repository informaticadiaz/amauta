# Issue #95 — UI de búsqueda y filtros de catálogo de cursos

**Qué podés hacer ahora:** Buscar cursos por texto y filtrarlos por categoría o nivel directamente desde el catálogo público, sin necesidad de estar autenticado.

---

## Como visitante del catálogo, ahora podés:

### Buscar cursos por texto

1. Entrá a `/cursos`
2. Escribí en el campo de búsqueda (ej: "JavaScript", "matemáticas")
3. El buscador espera 500ms después de que dejás de escribir y actualiza los resultados automáticamente
4. Verás el texto "Buscando: [tu término]" bajo el input
5. Para limpiar, hacé click en la × o borrá el texto

### Filtrar por categoría

1. En el panel lateral izquierdo, encontrás la sección **Categoría**
2. Hacé click en cualquier categoría para filtrar
3. El botón se pone resaltado para indicar que está activo
4. Hacé click nuevamente para quitar el filtro

### Filtrar por nivel

1. En el panel lateral, sección **Nivel**
2. Opciones: Principiante, Intermedio, Avanzado
3. Mismo comportamiento toggle que la categoría

### Combinar búsqueda y filtros

- La búsqueda y los filtros funcionan juntos
- Ambos resetean la paginación a la página 1 automáticamente
- Los filtros activos aparecen como chips en la sección **Activos** del panel

### Limpiar todos los filtros

- Botón **Limpiar** en el encabezado del panel de filtros
- Elimina categoría y nivel activos (mantiene el término de búsqueda)

### Navegar entre páginas de resultados

- Aparece cuando hay más de 12 cursos en el resultado
- Botones Anterior / Siguiente + números de página con ellipsis
- Cambia de página sin perder los filtros ni el término de búsqueda

---

## Estado vacío

Si no hay cursos que coincidan con la búsqueda o filtros aplicados, se muestra:

> "No se encontraron cursos" — "Intenta ajustar tus filtros de búsqueda o explora otras categorías."

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?  |
| ------------- | --------------- |
| Visitante     | ✅ (sin cuenta) |
| ESTUDIANTE    | ✅              |
| EDUCADOR      | ✅              |
| ADMIN_ESCUELA | ✅              |
| SUPER_ADMIN   | ✅              |

El catálogo es completamente público — no requiere autenticación.

---

## URL para probar

`https://amauta.diazignacio.ar/cursos`

Ejemplos con filtros en la URL:

- `/cursos?buscar=javascript`
- `/cursos?nivel=PRINCIPIANTE`
- `/cursos?categoriaId=[id]&nivel=INTERMEDIO`
- `/cursos?buscar=python&page=2`

---

## Nota

Esta UI consume el endpoint `GET /api/v1/cursos?estado=PUBLICADO&buscar=...&categoriaId=...&nivel=...`
con paginación de 12 resultados por página. Solo muestra cursos en estado **PUBLICADO**.
