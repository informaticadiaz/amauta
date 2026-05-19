# Issue #98 — F7-002: Editor de texto rico para lecciones TEXTO

**Qué podés hacer ahora:** Crear y editar lecciones de tipo TEXTO con un editor WYSIWYG profesional que captura contenido formateado en HTML y lo renderiza de forma segura para los estudiantes.

---

## Como EDUCADOR, ahora podés:

### Crear una lección TEXTO con editor rico

1. Entrar a **Dashboard** → seleccionar un **Curso**
2. Hacer clic en **+ Nueva lección** o editar una existente
3. Seleccionar tipo **"Texto"**
4. En el campo **Contenido**, aparece un editor WYSIWYG con toolbar:
   - **B** (Negrita): `Ctrl+B`
   - **I** (Cursiva): `Ctrl+I`
   - **H2/H3** (Encabezados)
   - **Listas**: con viñetas o numeradas
   - **Código**: bloques de código
   - **🔗 Enlace**: insertar URLs
5. Escribir y formatear el contenido usando los botones de la toolbar
6. Hacer clic en **Crear lección** o **Guardar cambios**

### Editar el contenido después de crearlo

1. Ir a **Dashboard** → **Cursos** → seleccionar curso
2. Hacer clic en **Editar** en la lección
3. El editor carga el contenido existente
4. Modificar y guardar con **Guardar cambios**

---

## Como ESTUDIANTE, ahora ves:

### Visualizar lecciones TEXTO formateadas

1. Entrar a un **Curso inscrito**
2. Seleccionar una **Lección de tipo TEXTO**
3. El contenido se renderiza con:
   - Títulos formateados
   - Párrafos, listas, códigos
   - Enlaces clickeables
   - Estilos de tipografía aplicados (márgenes, tamaños)

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?    |
| ------------- | ----------------- |
| ESTUDIANTE    | ✅ (ver)          |
| EDUCADOR      | ✅ (crear/editar) |
| ADMIN_ESCUELA | ✅ (crear/editar) |
| SUPER_ADMIN   | ✅ (crear/editar) |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| educador1@amauta.test   | password123 | EDUCADOR   |
| estudiante1@amauta.test | password123 | ESTUDIANTE |

---

## Notas técnicas

### Seguridad XSS

El contenido HTML se sanitiza con **DOMPurify** antes de renderizarse en el navegador del estudiante. Solo se permiten etiquetas y atributos seguros:

**Etiquetas permitidas**: `h2`, `h3`, `p`, `strong`, `em`, `ul`, `ol`, `li`, `code`, `pre`, `a`, `blockquote`

**Atributos permitidos en `<a>`**: `href`, `target`, `rel`

**Rechazados**: `onclick`, `javascript:`, `<script>`, etc.

### Estructura de datos

El contenido se almacena en la DB como JSON:

```json
{
  "html": "<h2>Título</h2><p>Contenido con <strong>énfasis</strong></p>",
  "format": "html"
}
```

### Librerías utilizadas

- **Editor**: TipTap (WYSIWYG moderno en React)
- **Sanitización**: DOMPurify
- **Testing**: Jest + React Testing Library

---

## Casos de uso

✅ Crear lecciones con contenido formateado (sin ir a HTML manual)  
✅ Mantener seguridad contra inyección de código  
✅ Editar contenido después de publicar  
✅ Ver en estudiantes con estilos aplicados

---

## Limitaciones actuales (Fase 7)

❌ No se pueden incrustar imágenes o videos **dentro** del editor TEXTO (usar tipo VIDEO para eso)  
❌ No hay soporte para tablas (fase futura)  
❌ No hay colaboración en tiempo real (fase futura)
