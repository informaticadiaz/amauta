# Issue #64 — F4-001: Refinar historias y criterios de aceptación (Fase 4)

**Qué podés hacer ahora:** planificar el Módulo Escolar con historias claras, criterios verificables y riesgos explícitos.

---

## Equipo de gestión, ahora podés:

### Definir el alcance mínimo del Módulo Escolar

1. Revisar las historias clave por rol en `docs/project-management/roadmap.md`.
2. Validar los criterios de aceptación por historia.
3. Priorizar el orden de implementación con base en riesgos y dependencias.

### Reducir ambigüedades antes de construir

- Ver qué necesita configuración institucional (periodos y escalas de calificación).
- Identificar qué requiere permisos diferenciados entre Admin Escolar y Educador.
- Detectar riesgos en carga masiva y datos base.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ✅             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |
