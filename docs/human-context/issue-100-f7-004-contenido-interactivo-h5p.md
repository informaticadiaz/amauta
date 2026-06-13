# Issue #100 — F7-004: Contenido interactivo H5P (embed desde URL externa)

**Qué podés hacer ahora:** Los educadores pueden agregar lecciones de tipo "Interactivo" embebiendo contenido H5P creado en H5P.org o Lumi, y los estudiantes lo ven directamente en la lección.

---

## Como Educador, ahora podés:

### Agregar contenido interactivo a una lección

1. Crear o editar una lección y seleccionar el tipo "Interactivo (H5P)"
2. Crear el contenido en [H5P.org](https://h5p.org) o Lumi y copiar la URL de embed
3. Pegar la URL en el campo "URL de embed H5P" — opcionalmente agregar un título descriptivo
4. Ver la vista previa del contenido directamente en el formulario
5. Guardar la lección

> Solo se aceptan URLs de los dominios `h5p.org`, `www.h5p.org` y `lumi.education`. Si la URL pertenece a otro dominio, el formulario muestra un error y el backend rechaza el guardado.

---

## Como Estudiante, ahora podés:

1. Abrir una lección de tipo "Interactivo"
2. Ver el contenido H5P embebido en un iframe seguro
3. Si el contenido no carga, ver un mensaje con un enlace directo a la URL de H5P

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ✅ (solo ver)  |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| educador1@amauta.test   | password123 | EDUCADOR   |
| estudiante1@amauta.test | password123 | ESTUDIANTE |

---

## Nota

No requiere endpoints nuevos: usa el `POST`/`PATCH` de lecciones existentes con `tipo: "INTERACTIVO"` y `contenido: { h5pUrl, embedType: "iframe", title? }`.

Self-hosting de H5P (servidor propio) queda fuera de alcance de esta fase.
