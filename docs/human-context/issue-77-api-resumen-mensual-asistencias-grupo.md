# Issue #77 — F4-013: API Resumen mensual de asistencias por grupo

**Qué podés hacer ahora:** consultar un resumen mensual básico de asistencia por grupo y por estudiante.

---

## Como Administrador de Escuela o Educador asignado, ahora podés:

### Ver el resumen mensual del grupo

1. Elegí un grupo, un mes y un año.
2. Consultá el total de registros del grupo y su distribución por estado.
3. Revisá por cada estudiante cuántas presencias, ausencias, tardanzas y justificados acumuló.

### Detectar seguimiento básico

1. Observá el porcentaje mensual de asistencia por estudiante.
2. Usá este consolidado como base para controles administrativos o pedagógicos.

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

## Nota

> API sin UI. Probala con `GET /api/v1/grupos/:grupoId/asistencias/resumen-mensual?mes=3&anio=2026`.
>
> Este resumen no reemplaza reportes formales ni exportaciones; es un consolidado operativo inicial.
