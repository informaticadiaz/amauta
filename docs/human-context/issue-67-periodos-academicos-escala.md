# Issue #67 — F4-004: API Períodos Académicos + Escala de Calificación

**Qué podés hacer ahora:** Los administradores de institución pueden configurar sus períodos académicos (trimestres, semestres, etc.) y definir la escala de calificación que usa su institución.

---

## Administrador de Escuela, ahora podés:

### Gestionar los períodos académicos de tu institución

1. Crear períodos como "1er Trimestre 2025", "Semestre II", etc. con fecha de inicio y fin
2. Listar todos los períodos activos de tu institución
3. Editar un período existente si las fechas cambian
4. Desactivar un período cuando ya no está vigente (no se borra, queda archivado)

### Definir la escala de calificación de tu institución

1. Configurar la nota mínima, nota máxima y nota de aprobación
2. Por ejemplo: mínima 0, máxima 10, aprobación con 6
3. O una escala diferente: mínima 1, máxima 100, aprobación con 60
4. Podés actualizar la escala cuando cambie la normativa de tu institución

---

## Quién puede usarlo

| Rol           | ¿Puede crear/editar? | ¿Puede ver? |
| ------------- | -------------------- | ----------- |
| ESTUDIANTE    | ❌                   | ❌          |
| EDUCADOR      | ❌                   | ✅          |
| ADMIN_ESCUELA | ✅                   | ✅          |
| SUPER_ADMIN   | ✅                   | ✅          |

---

## Nota

Esta es una API de configuración base — todavía no hay pantallas en el frontend para manejarlas. Las pantallas de administración de la institución se construirán en los próximos issues de la Fase 4.

---

## Usuarios de prueba para testear (via API)

| Email                  | Contraseña  | Rol           |
| ---------------------- | ----------- | ------------- |
| admin1@amauta.test     | password123 | ADMIN_ESCUELA |
| superadmin@amauta.test | password123 | SUPER_ADMIN   |
