# Issue #40 — F1-013: Visualizador de lecciones para estudiantes

**Qué podés hacer ahora:** Los estudiantes inscritos en un curso pueden ver el contenido de cada lección directamente en la plataforma.

---

## Estudiante, ahora podés:

### Ver el contenido de una lección

1. Ingresá a un curso donde ya estés inscrito: https://amauta.diazignacio.ar/cursos
2. En la página del curso, hacé click en **"Continuar curso"** — te lleva directo a la primera lección
3. Se abre la pantalla del visualizador con:
   - El contenido de la lección (texto o video)
   - Un panel lateral izquierdo con todas las lecciones del curso
   - Botones para ir a la lección anterior o siguiente

### Navegar entre lecciones

- El **panel lateral** muestra todas las lecciones del curso con numeración
- La lección actual se resalta en azul
- Hacé click en cualquier lección para saltar directamente a ella
- En la parte inferior de la página encontrás los botones **"Anterior"** y **"Siguiente"** con el título de la lección

### En el celular

- El panel lateral se oculta automáticamente para aprovechar el espacio
- Aparece un ícono de menú (≡) en la parte superior
- Tocá ese ícono para ver la lista completa de lecciones y navegar

---

## Tipos de contenido soportados

| Tipo               | ¿Cómo se ve?                                       |
| ------------------ | -------------------------------------------------- |
| Texto              | Se muestra como texto formateado en la página      |
| Video YouTube      | Se reproduce directamente en la página (sin salir) |
| Video Vimeo        | Se reproduce directamente en la página             |
| Video propio       | Se reproduce con el reproductor del navegador      |
| Quiz / Interactivo | Próximamente disponible                            |

---

## Restricción de acceso

Solo podés ver las lecciones si **estás inscrito en el curso**. Si entrás a la URL de una lección sin estar inscrito, el sistema te redirige automáticamente a la página del curso.

---

## Quién puede usarlo

| Rol           | ¿Puede ver lecciones? |
| ------------- | --------------------- |
| ESTUDIANTE    | ✅ (si está inscrito) |
| EDUCADOR      | ✅ (si está inscrito) |
| ADMIN_ESCUELA | ✅ (si está inscrito) |
| SUPER_ADMIN   | ✅ (si está inscrito) |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |
| estudiante2@amauta.test | password123 | ESTUDIANTE |

Para testear: iniciá sesión con uno de estos usuarios, andá a https://amauta.diazignacio.ar/cursos, inscribite en un curso, y luego hacé click en "Continuar curso".
