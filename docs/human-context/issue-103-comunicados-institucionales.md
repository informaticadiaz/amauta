# Issue #103 — F4b-003: Comunicados institucionales — API y UI completa

**Qué podés hacer ahora:** Ver, publicar y gestionar comunicados de tu institución desde el dashboard.

---

## Como miembro de una institución, ahora podés:

### Ver comunicados

1. Ingresá al dashboard
2. Hacé clic en "Comunicados" en el menú lateral (visible para todos los roles)
3. Vas a ver el listado de comunicados activos de tu institución
4. Podés filtrar por tipo (General, Académico, Administrativo, Evento, Urgente) y por prioridad

### Publicar un comunicado (ADMIN_ESCUELA y EDUCADOR)

1. En la página de comunicados, hacé clic en "Nuevo comunicado"
2. Completá el formulario: título, contenido, tipo y prioridad
3. Hacé clic en "Publicar comunicado"
4. El comunicado aparece inmediatamente en el listado de tu institución

---

## Quién puede usarlo

| Rol           | ¿Puede ver comunicados? | ¿Puede publicar? | ¿Puede archivar? |
| ------------- | ----------------------- | ---------------- | ---------------- |
| ESTUDIANTE    | ✅                      | ❌               | ❌               |
| EDUCADOR      | ✅                      | ✅               | ❌               |
| ADMIN_ESCUELA | ✅                      | ✅               | ✅               |
| SUPER_ADMIN   | ✅ (vía API)            | ✅ (vía API)     | ✅ (vía API)     |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol           |
| ----------------------- | ----------- | ------------- |
| admin1@amauta.test      | password123 | ADMIN_ESCUELA |
| educador1@amauta.test   | password123 | EDUCADOR      |
| estudiante1@amauta.test | password123 | ESTUDIANTE    |

---

## API (para probar directamente)

```
# Listar comunicados de una institución
GET /api/v1/instituciones/:id/comunicados

# Crear comunicado
POST /api/v1/instituciones/:id/comunicados
Body: { titulo, contenido, tipo, prioridad }

# Soft delete (archivar)
DELETE /api/v1/instituciones/:id/comunicados/:comId

# Endpoint conveniente (resuelve institución automáticamente)
GET  /api/v1/me/comunicados
POST /api/v1/me/comunicados
```

## Nota técnica

El campo `archivado` fue agregado a la tabla `comunicados` vía migración `20260508000100_add_archivado_to_comunicados`. El soft delete setea `archivado = true` y el listado excluye estos registros automáticamente.
