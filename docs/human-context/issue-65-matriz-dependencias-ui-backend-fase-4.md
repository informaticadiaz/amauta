# Issue #65 — F4-002: Matriz de dependencias UI/Backend (Fase 4)

**Qué podés hacer ahora:** consultar la matriz de dependencias para ordenar la implementación del Módulo Escolar en Fase 4.

---

## Equipo de gestión y producto, ahora podés:

### Revisar dependencias por tema

1. Abrir `docs/project-management/roadmap.md`.
2. Ir a la sección "Dependencias UI/Backend (Fase 4)".
3. Usar la matriz para definir el orden de endpoints y pantallas.

### Detectar bloqueos entre UI y Backend

- Ver qué pantallas dependen de configuración institucional (periodos y escala).
- Priorizar flujos que desbloquean asistencias y calificaciones.
- Identificar dependencias transversales (roles, multi-tenant, datos base).

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
