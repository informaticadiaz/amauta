# Issue #79 — F4-014: Prisma Calificaciones por periodo académico e institución

**Qué podés hacer ahora:** el sistema ya puede sostener calificaciones vinculadas a períodos académicos reales de la institución, en lugar de usar un período libre inconsistente.

---

## Como Administrador de Escuela, ahora podés:

### Preparar una base consistente para calificaciones

1. Configurá períodos académicos y escala de calificación en tu institución.
2. El modelo de datos de calificaciones ahora apunta a esos períodos reales.
3. Esto deja lista la base para cargar notas por grupo y período en los próximos pasos del módulo escolar.

### Consultar una estructura más confiable

1. Las calificaciones quedan alineadas con institución, grupo, estudiante y período académico.
2. También existen índices y restricciones para evitar inconsistencias en futuras cargas.

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ❌             |
| EDUCADOR      | ❌             |
| ADMIN_ESCUELA | ✅             |
| SUPER_ADMIN   | ✅             |

---

## Usuarios de prueba para testear

| Email                  | Contraseña  | Rol           |
| ---------------------- | ----------- | ------------- |
| admin1@amauta.test     | password123 | ADMIN_ESCUELA |
| superadmin@amauta.test | password123 | SUPER_ADMIN   |

---

## Nota

> Esta issue es de modelo de datos, no de UI. El cambio reemplaza el campo libre de período por una relación con `PeriodoAcademico`, agrega restricciones para consultas por grupo, estudiante y período, y habilita la siguiente API de calificaciones con una base consistente.
