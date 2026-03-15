# Issue #42 — F1-015: UI marcar lecciones completadas

**Qué podés hacer ahora:** Los estudiantes pueden marcar cada lección como completada y ver su progreso real en tiempo real dentro del visualizador de lecciones.

---

## Como estudiante, ahora podés:

### Marcar una lección como completada

1. Entrá a cualquier lección de un curso donde estés inscripto (https://amauta.diazignacio.ar/cursos/[slug]/lecciones/[id])
2. Al final del contenido, encontrás el botón **"Marcar como completada"**
3. Hacé click — el estado cambia inmediatamente a "Completada ✓" (sin recargar la página)
4. El cambio se guarda en el servidor automáticamente

### Ver tu progreso en el curso

- En el visualizador de lecciones, una **barra de progreso** muestra cuántas lecciones completaste
- Ves el porcentaje exacto (por ejemplo: "3 de 5 — 60%")
- En escritorio: la barra aparece junto al botón "Marcar como completada"
- En móvil: la barra aparece en el encabezado superior

### Ver qué lecciones ya completaste

- En el **menú lateral** (sidebar) de lecciones, las lecciones que ya completaste tienen un **tilde verde (✓)**
- Las lecciones no completadas muestran su número
- La lección actual está resaltada

### Completar el curso

- Al completar todas las lecciones, tu inscripción se marca automáticamente como **COMPLETADO**
- La barra de progreso llega al 100%

---

## Quién puede usarlo

| Rol | ¿Puede marcar lecciones? |
| --- | --- |
| ESTUDIANTE | ✅ Sí |
| EDUCADOR | ✅ Sí (si está inscripto) |
| ADMIN_ESCUELA | ❌ No aplica |
| SUPER_ADMIN | ❌ No aplica |

---

## Usuarios de prueba para testear

| Email | Contraseña | Rol |
| --- | --- | --- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |
| estudiante2@amauta.test | password123 | ESTUDIANTE |

**Cómo testear:**
1. Logeate como `estudiante1@amauta.test`
2. Andá a "Mis Cursos" en el dashboard
3. Entrá a cualquier curso inscripto
4. Navegá a una lección y hacé click en "Marcar como completada"
5. Observá cómo se actualiza la barra de progreso y el checkmark en el sidebar
