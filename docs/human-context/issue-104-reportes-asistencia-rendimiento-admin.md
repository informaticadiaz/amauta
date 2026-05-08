# Issue #104 — F4b-004: Reportes de asistencia y rendimiento académico (admin)

**Qué podés hacer ahora:** Los admins y educadores pueden ver reportes de asistencia y rendimiento por grupo, con opción de descarga en CSV.

---

## Como ADMIN_ESCUELA o EDUCADOR, ahora podés:

### Ver el reporte de asistencia de un grupo

1. Ir a **Dashboard → Reportes**
2. Seleccionar el grupo y (opcionalmente) el período académico
3. El tab **Asistencia** muestra, por estudiante: presente, ausente, tardanza, justificado y % de asistencia
4. Ver el promedio de asistencia del grupo al pie
5. Hacer clic en **Descargar CSV** para obtener el reporte en formato CSV

### Ver el reporte de rendimiento de un grupo

1. En la misma página, clic en el tab **Rendimiento**
2. Ver promedio de calificaciones por estudiante y el listado de notas por materia
3. Ver el promedio general del grupo

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo?                          |
| ------------- | --------------------------------------- |
| ESTUDIANTE    | ❌                                      |
| EDUCADOR      | ✅ Solo grupos en los que está asignado |
| ADMIN_ESCUELA | ✅ Todos los grupos de su institución   |
| SUPER_ADMIN   | ✅ Todos los grupos                     |

---

## Usuarios de prueba para testear

| Email                 | Contraseña  | Rol           |
| --------------------- | ----------- | ------------- |
| admin1@amauta.test    | password123 | ADMIN_ESCUELA |
| educador1@amauta.test | password123 | EDUCADOR      |

---

## Endpoints API (solo backend)

| Método | Endpoint                                     | Descripción                                  |
| ------ | -------------------------------------------- | -------------------------------------------- |
| GET    | `/api/v1/grupos/:id/reportes/asistencia`     | Reporte JSON con métricas por estudiante     |
| GET    | `/api/v1/grupos/:id/reportes/rendimiento`    | Reporte JSON con promedios de calificaciones |
| GET    | `/api/v1/grupos/:id/reportes/asistencia/csv` | Descarga CSV (text/csv)                      |

Query params comunes: `periodoId` (opcional), `desde`/`hasta` (fechas ISO, solo en asistencia).
