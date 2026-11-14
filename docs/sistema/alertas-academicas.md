# Alertas académicas

Amauta puede detectar estudiantes que necesitan acompañamiento durante un período académico.

## Qué observa

- **Asistencia baja**: se calcula sobre los registros acumulados del período. `PRESENTE` y `JUSTIFICADO` cuentan como asistencia; `AUSENTE` y `TARDANZA` no.
- **Nota en riesgo**: se calcula sobre el promedio de las calificaciones cargadas para el estudiante y el período. Un período sin calificaciones no genera una alerta de nota.

Los umbrales son configurables por la institución: el período define el mínimo de asistencia y la escala institucional define la nota mínima de alerta, cuyo valor inicial es 4 sobre 10.

## Cómo se usa

El educador o administrador puede abrir **Alertas académicas** desde el dashboard y actualizar el cálculo bajo demanda. El sistema evita duplicar alertas activas, notifica internamente a los educadores asignados y a los administradores de la institución, y resuelve automáticamente una alerta cuando el estudiante vuelve a superar el umbral.

Las alertas activas muestran el estudiante, grupo, período, métrica observada y umbral correspondiente.

## Alcance actual

La detección se ejecuta bajo demanda desde el dashboard. La ejecución periódica automática queda como una extensión posterior; mientras tanto, actualizar alertas después de cargar asistencias o calificaciones mantiene el seguimiento al día.
