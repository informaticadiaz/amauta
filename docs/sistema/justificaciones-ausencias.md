# Justificación formal de ausencias

> Funcionalidad F4c-008. Estado: API implementada y verificada localmente; el frontend queda pendiente de una unidad posterior.

## Alcance

Un estudiante puede justificar sus propias asistencias con estado `AUSENTE`. Un tutor puede hacerlo por un estudiante vinculado mediante un vínculo activo. Sólo se admiten solicitudes para períodos académicos abiertos.

Cada solicitud contiene un motivo y un único archivo adjunto. El archivo debe ser una imagen o un PDF de hasta 5 MB. Los archivos se guardan fuera de la raíz pública de uploads y se descargan únicamente mediante una ruta autenticada con autorización contextual.

No se permite más de una solicitud `PENDIENTE` para la misma asistencia. La creación requiere conexión: no existe cola offline para solicitudes ni archivos.

## Revisión

Puede revisar una solicitud:

- el educador asignado al grupo;
- `ADMIN_ESCUELA` de la institución correspondiente.

Al aprobar, la asistencia pasa de `AUSENTE` a `JUSTIFICADO`. Al rechazar, el motivo de rechazo es obligatorio. Las solicitudes rechazadas no bloquean un nuevo envío corregido y el archivo anterior se conserva con el historial.

La resolución genera una notificación interna `RESULTADO_JUSTIFICACION_AUSENCIA` para el solicitante.

## API

La implementación está bajo `/api/v1` en el módulo de justificaciones:

- creación multipart de una justificación para una asistencia;
- listado de solicitudes pendientes para revisores autorizados;
- aprobación o rechazo;
- descarga autenticada del archivo adjunto.

La autorización de descarga contempla al solicitante, al estudiante afectado, al tutor vinculado activo, al educador asignado y al administrador de la institución.

## Persistencia y migración

La entidad `JustificacionAusencia` conserva la asistencia, solicitante, motivo, clave privada del archivo, nombre y MIME, tamaño, estado, revisor, motivo de rechazo y fecha de revisión.

La migración versionada es `apps/api/prisma/migrations/20261117093346_justificaciones_ausencias/`. En desarrollo local se aplicó con `prisma migrate deploy` sobre `amauta_dev`; no se utiliza `prisma db push`.

## Verificación

Se verificaron:

- `npm run type-check` de la API;
- `npx prisma migrate status` con la base local actualizada;
- 10 tests enfocados de justificaciones y notificaciones;
- `git diff --check`.

La cobertura actual es principalmente unitaria; quedan como mejora tests HTTP multipart y una interfaz frontend para el flujo.
