# Issue #80 — F4-015: API Carga y listado de calificaciones por periodo

**Qué podés hacer ahora:** Registrar y consultar calificaciones de los estudiantes de un grupo para una materia y período académico determinados.

---

## Como Administrador Escolar o Educador, ahora podés:

### Consultar las calificaciones de un grupo por materia y período

1. Hacé un GET a `/api/v1/grupos/{grupoId}/calificaciones?periodoAcademicoId={id}&materia={nombre}`
2. Obtenés la nómina completa de estudiantes activos del grupo
3. Cada estudiante muestra su nota y observaciones, o `null` si todavía no tiene calificación cargada

### Cargar o actualizar calificaciones de manera masiva

1. Hacé un PUT a `/api/v1/grupos/{grupoId}/calificaciones`
2. Enviá el cuerpo con el período, la materia y la lista de estudiantes con sus notas
3. Si un estudiante ya tenía nota en esa materia/período, se actualiza. Si no tenía, se crea.
4. El sistema valida que las notas estén dentro del rango de la escala de calificación de tu institución

**Ejemplo de cuerpo:**

```json
{
  "periodoAcademicoId": "ckr123...",
  "materia": "Matemática",
  "calificaciones": [
    { "estudianteId": "ckr456...", "nota": 8, "observaciones": null },
    {
      "estudianteId": "ckr789...",
      "nota": 6,
      "observaciones": "Recuperatorio aprobado"
    }
  ]
}
```

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?                          |
| ------------- | --------------------------------------- |
| ESTUDIANTE    | ❌                                      |
| EDUCADOR      | ✅ (solo grupos donde está asignado)    |
| ADMIN_ESCUELA | ✅ (todos los grupos de su institución) |
| SUPER_ADMIN   | ❌                                      |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Nota

Esta funcionalidad es solo backend (API). Para probarla necesitás un cliente HTTP como curl, Postman o Insomnia con un token JWT válido.

**Restricciones aplicadas:**

- La nota debe estar dentro del rango configurado en la escala de calificación de la institución (por defecto: 1 a 10).
- El período académico debe pertenecer a la misma institución que el grupo.
- Solo se pueden cargar calificaciones de estudiantes activos en el grupo.
- No es posible cargar el mismo estudiante dos veces en la misma solicitud.
