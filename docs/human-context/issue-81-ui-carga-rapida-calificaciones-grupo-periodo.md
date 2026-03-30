# Issue #81 — F4-016: UI Carga rápida de calificaciones por grupo y periodo

**Qué podés hacer ahora:** Cargar y editar calificaciones de estudiantes por grupo, período académico y materia desde el dashboard, con feedback inmediato y exportación de resumen.

---

## Como ADMIN_ESCUELA o EDUCADOR, ahora podés:

### Cargar calificaciones de un grupo

1. Ingresá al dashboard y hacé click en **Calificaciones** en el menú lateral.
2. Seleccioná el **grupo** en el que querés cargar notas.
3. Elegí el **período académico** correspondiente.
4. Escribí el nombre de la **materia** (ej: "Matemática", "Lengua").
5. Hacé click en **Buscar** para cargar la nómina de estudiantes activos.
6. En la tabla, ingresá la **nota** de cada estudiante (podés dejar vacío a quienes no tengas nota aún).
7. Opcionalmente, agregá una **observación** para cualquier estudiante.
8. Hacé click en **Guardar calificaciones** — solo se envían los cambios que realizaste.

### Exportar el resumen de calificaciones

1. Con la nómina cargada, hacé click en **Exportar resumen**.
2. Se descarga un archivo CSV con apellido, nombre, email, nota y observación de cada estudiante.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ❌             |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Nota técnica

- La URL de la página es `/dashboard/calificaciones`.
- El educador solo ve los grupos a los que está asignado activamente.
- El ADMIN_ESCUELA ve todos los grupos de su institución.
- Las notas se validan contra la escala de calificación configurada en la institución (mínima/máxima) — si se ingresa una nota fuera de rango, el backend devolverá error.
- Si no hay estudiantes activos en el grupo para el período seleccionado, se muestra un mensaje de estado vacío.
- Los proxies nuevos habilitados:
  - `GET/PUT /api/grupos/:id/calificaciones`
  - `GET /api/instituciones/:id/periodos`
