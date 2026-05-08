# Issue #102 — F4b-002: Boletín académico descargable por periodo

**Qué podés hacer ahora:** Los estudiantes pueden ver su boletín académico (calificaciones + asistencia) por período y grupo, e imprimirlo o guardarlo como PDF directamente desde el navegador.

---

## Como Estudiante, ahora podés:

### Ver y descargar tu boletín

1. Ingresá a `/dashboard/mi-boletin` desde el menú lateral ("Mi boletín")
2. Seleccioná el grupo al que pertenecés
3. Seleccioná el período académico que querés ver
4. El boletín se carga automáticamente con:
   - Tus calificaciones por materia (con estado aprobado/desaprobado)
   - Promedio general
   - Resumen de asistencia (presentes, ausentes, tardanzas, justificados)
   - Porcentaje de asistencia con barra visual
5. Hacé clic en "Imprimir / Guardar como PDF" para generar el PDF desde el diálogo de impresión del navegador

### Formato del boletín imprimible

- Encabezado con nombre de la institución, nombre del boletín y fechas del período
- Datos del estudiante y grupo
- Tabla de calificaciones con nota y estado (Aprobado/Desaprobado)
- Cuadro de asistencia
- Firma docente y sello institucional (placeholders)
- El sidebar y la barra de navegación se ocultan al imprimir (solo se imprime el boletín)

---

## Quién puede usarlo

| Rol           | ¿Puede usarlo? |
| ------------- | -------------- |
| ESTUDIANTE    | ✅             |
| EDUCADOR      | ❌             |
| ADMIN_ESCUELA | ❌             |
| SUPER_ADMIN   | ❌             |

---

## Usuarios de prueba para testear

| Email                   | Contraseña  | Rol        |
| ----------------------- | ----------- | ---------- |
| estudiante1@amauta.test | password123 | ESTUDIANTE |

---

## API involucrada

| Método | Ruta                                       | Descripción                          |
| ------ | ------------------------------------------ | ------------------------------------ |
| GET    | `/api/v1/me/grupos`                        | Grupos activos del estudiante        |
| GET    | `/api/v1/me/boletin?periodoId=X&grupoId=Y` | Boletín agregado                     |
| GET    | `/api/v1/instituciones/:id/periodos`       | Períodos de la institución del grupo |

## Nota

Para generar el PDF no se usa ninguna librería externa. El navegador nativamente permite "Imprimir" y desde ahí seleccionar "Guardar como PDF". El CSS `@media print` oculta todo excepto el boletín.
