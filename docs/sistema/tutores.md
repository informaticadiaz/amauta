# Rol tutor y seguimiento de estudiantes

> Funcionalidad F4c-007. Estado: implementada localmente; requiere aplicar la migración versionada antes de habilitarla en un entorno con datos.

## Alcance

El rol `TUTOR` permite que una persona adulta consulte el seguimiento académico vigente de uno o más estudiantes vinculados. El tutor no se registra con ese rol desde el registro público: un administrador debe contar con un usuario tutor y crear el vínculo desde el panel institucional.

## Vínculos tutor-estudiante

Cada vínculo contiene:

- tutor;
- estudiante;
- relación: `PADRE`, `MADRE`, `TUTOR_LEGAL` u `OTRO`;
- estado activo/inactivo.

Un tutor puede estar vinculado con varios estudiantes. `ADMIN_ESCUELA` puede administrar vínculos de su institución y `SUPER_ADMIN` puede administrarlos indicando la institución.

La creación exige que el tutor y el estudiante estén activos y que el estudiante tenga una matrícula activa en la institución. La desactivación es lógica: el registro se conserva y deja de autorizar acceso.

## Seguimiento académico

Un tutor sólo puede consultar estudiantes que cumplan simultáneamente:

1. vínculo tutor-estudiante activo;
2. usuario estudiante activo;
3. matrícula activa en un período académico vigente.

La API expone consultas de solo lectura para:

- estudiantes vinculados;
- boletín vigente;
- asistencias del período vigente;
- calificaciones del período vigente;
- comunicados de la institución.

No se permite modificar asistencias, calificaciones, matrículas, comunicados ni vínculos desde el panel del tutor. La navegación histórica queda fuera de este MVP.

## Comunicados urgentes

Cuando se publica un comunicado con `tipo = URGENTE` o `prioridad = URGENTE`, Amauta crea una notificación interna para cada tutor elegible de la institución. Si un tutor tiene más de un estudiante vinculado en la misma institución, recibe una sola notificación por comunicado.

## Rutas de uso

- Tutor: `/dashboard/tutor`
- Administración de vínculos: `/dashboard/tutores-estudiantes`

Los endpoints de lectura tutor están bajo `/api/v1/me/tutor-estudiantes`; los endpoints administrativos están bajo `/api/v1/instituciones/:institucionId/tutores-estudiantes`.

## Migración

La implementación agrega `Rol.TUTOR`, `RelacionTutor`, `TutorEstudiante` y la referencia de comunicado en `Notificacion`. La migración se encuentra en `apps/api/prisma/migrations/20261114130000_tutores_estudiantes/` y debe aplicarse mediante el flujo controlado de Prisma; no se usa `prisma db push`.
