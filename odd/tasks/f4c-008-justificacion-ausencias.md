# ODD Plan — F4c-008 Justificación formal de ausencias

Estado: implementación API y web completadas y verificadas localmente.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Justificación formal de ausencias

> "F4c-008 — Justificación formal de ausencias"

La funcionalidad debe permitir gestionar formalmente la justificación de una ausencia.

### S2 — Solicitud, revisión y resultado

> "Flujo: tutor/estudiante solicita → educador/admin revisa → si aprueba, el estado de la asistencia cambia a JUSTIFICADO"

La solicitud debe poder ser presentada por un tutor o por el estudiante; la revisión corresponde a un educador o administrador; una aprobación debe cambiar el estado de la asistencia a `JUSTIFICADO`.

### S3 — Notificación del resultado

> "Notificación al solicitante con el resultado"

El solicitante debe recibir una notificación cuando la solicitud sea resuelta.

### S4 — Registro de la justificación

> "Entidad `JustificacionAusencia`: asistenciaId, solicitanteId (TUTOR o el propio ESTUDIANTE), motivo, archivos adjuntos (urls), estado (PENDIENTE/APROBADA/RECHAZADA), revisadaPor, fechaRevision"

La entidad debe conservar la asistencia, el solicitante, el motivo, los adjuntos, el estado y los datos de revisión definidos por el roadmap.

### S5 — Archivos adjuntos

> "archivo adjunto es un archivo que se carga al sistema, por ejemplo un certificado digital, en realidad puede ser una imagen o un pdf."

Los adjuntos son archivos cargados al sistema y pueden ser imágenes o PDF. La implementación debe contemplar validación, almacenamiento y acceso protegido adecuados para documentos potencialmente sensibles.

## Allowed edit surfaces

apps/api/src/justificaciones/\*\*
apps/api/src/app.module.ts
apps/api/src/uploads/private-upload.service.ts
apps/api/src/uploads/uploads.module.ts
apps/api/src/notificaciones/notificaciones.service.ts
apps/api/src/config/env.ts
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/20261117093346_justificaciones_ausencias/migration.sql
apps/web/src/app/dashboard/mi-asistencia/page.tsx
apps/web/src/app/dashboard/tutor/page.tsx
apps/web/src/app/dashboard/justificaciones/**
apps/web/src/components/justificaciones/**
apps/web/src/app/api/justificaciones/\*\*
apps/web/src/app/api/me/asistencias/route.ts
apps/web/src/app/api/me/tutor-estudiantes/[estudianteId]/asistencias/route.ts
apps/web/src/components/layout/Sidebar.tsx
apps/web/src/components/layout/MobileMenu.tsx

## Tasks

- T1 — S1-S5 — Completar descubrimiento de permisos, asistencia, notificaciones y uploads existentes; registrar evidencia — estado: completado; commit: pendiente
- T2 — S1-S5 — Resolver alcance funcional, privacidad, almacenamiento, límites y reglas de revisión — estado: completado; commit: pendiente
- T3 — S1-S5 — Diseñar modelo Prisma, API y flujo de adjuntos con pruebas observables — estado: completado; migración `20261117093346_justificaciones_ausencias` aplicada en `amauta_dev`; commit: pendiente
- T4 — S1-S5 — Implementar solicitudes, revisión, notificaciones, acceso protegido y frontend — estado: completado; commit: pendiente
- T5 — S1-S5 — Ejecutar migración validada, pruebas, documentación y verificación final — estado: completado; commit: pendiente

## Log

- L1 — Usuario: "archivo adjunto es un archivo que se carga al sistema, por ejemplo un certificado digital, en realidad puede ser una imagen o un pdf."
- L2 — Evidencia inicial: `EstadoAsistencia` ya incluye `JUSTIFICADO`; existe `UploadsService`, pero el upload local se sirve públicamente y el endpoint actual sólo permite educador/admin. No existe todavía un registro persistente ni descarga autorizada para documentos de justificación.
- L3 — Decisiones pendientes identificadas: tamaño de adjuntos, retención y notificaciones.
- L8 — Diseño técnico acordado para implementar: la solicitud se crea como multipart con un único archivo de imagen o PDF; el archivo se almacena fuera de la raíz pública de uploads y se registra con metadatos; una ruta autenticada autoriza la descarga según solicitante, tutor vinculado, educador asignado o `ADMIN_ESCUELA`; la notificación interna tendrá un tipo y referencia propios; la unicidad de una solicitud activa por ausencia se refuerza dentro de una transacción porque PostgreSQL/Prisma no ofrece aquí un índice parcial portable.
- L9 — Verificación previa a cualquier cambio Prisma: `apps/api` reportó pendiente la migración `20261116140000_tutor_links_institution`. El usuario autorizó aplicarla sólo en la base local `amauta_dev` de `localhost:5432`; `prisma migrate deploy` la aplicó correctamente y `prisma migrate status` confirmó que el schema está actualizado.
- L10 — El schema de F4c-008 fue validado con Prisma y se generó `20261117093346_justificaciones_ausencias`; el SQL fue revisado. La migración crea la entidad, el enum, el vínculo de notificaciones y las claves foráneas; se aplicó sólo en `amauta_dev`.
- L11 — Verificación final: type-check y lint del monorepo pasan; Prisma reporta schema actualizado; `git diff --check` y Prettier pasan; tests API: 2 suites/10 tests; tests web: 82 suites/325 tests.
- L4 — Decisiones del usuario: sólo se justifican asistencias `AUSENTE`; cada solicitud admite un archivo; los archivos deben ser privados con descarga autorizada; una solicitud rechazada puede corregirse y reenviarse.
- L5 — Decisiones del usuario: pueden revisar el educador asignado o `ADMIN_ESCUELA`; no se aceptan solicitudes para períodos cerrados; el archivo tiene un límite de 5 MB; los archivos rechazados se conservan con el historial.
- L6 — Decisiones del usuario: el resultado se comunica sólo mediante notificación interna; no puede haber más de una solicitud activa por ausencia; la solicitud requiere conexión y no se encola offline.
- L7 — Decisión del usuario: el motivo del rechazo es obligatorio para que el solicitante pueda corregir y reenviar la solicitud.
