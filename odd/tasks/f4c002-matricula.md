# ODD — F4c-002 Matrícula formal

Repositorio: `/home/ignacio/amauta`
Objetivo: formalizar la relación estudiante–institución–período y exigir matrícula válida para asignar estudiantes a grupos.

## Specs

### S1 — Alcance del roadmap

Fuente: `docs/project-management/roadmap.md`, F4c-002:

> "Entidad `Matricula`: estudianteId, institucionId, periodoAcademicoId, estado (ACTIVA/BAJA/EGRESADO), fechaInscripcion, observaciones"
>
> "Proceso de alta: el admin matricula a un estudiante en la institución para un período"
>
> "Proceso de baja/egreso con motivo"
>
> "Vista de padrón institucional: listado de matriculados por período con estados"
>
> "Validación: solo estudiantes matriculados pueden ser asignados a grupos"

### S2 — Decisiones de producto

- Unicidad: una matrícula por `estudianteId + institucionId + periodoAcademicoId`.
- Motivo de baja/egreso: se almacena en `observaciones`.
- Motivo: opcional al cambiar a `BAJA` o `EGRESADO`.
- Grupos sin período: la asignación se rechaza hasta definir `periodoAcademicoId`.
- Estados válidos: `ACTIVA`, `BAJA`, `EGRESADO`.
- El borrado de matrícula no será físico; los cambios se expresan mediante estado.

### S3 — Contrato de API

- `POST /instituciones/:institucionId/matriculas`: alta de una matrícula.
- `GET /instituciones/:institucionId/matriculas`: padrón paginado, filtrable por período, estado y búsqueda.
- `PATCH /matriculas/:id`: cambio de estado y observaciones.
- Roles administrativos: `ADMIN_ESCUELA` de la institución y `SUPER_ADMIN`.
- Una matrícula de otra institución, período incompatible o usuario no estudiante debe rechazarse sin mutación.
- La asignación de estudiantes a grupos requiere matrícula `ACTIVA` de la misma institución y período exacto del grupo.

## Tasks

- T1 — Modelo Prisma y migración versionada; S1-S2; schema/migration; commit `38c21a3`.
- T2 — API y validaciones de matrícula; S1-S3; `apps/api/src/matriculas`; commit `38c21a3`.
- T3 — Integración con asignación a grupos; S1-S3; grupos/tests; commit `38c21a3`.
- T4 — UI, proxies y documentación; S1-S3; web/docs; commits `acd7766` y `887c4d2`.
- T5 — Verificación y cierre; S1-S3; checks/evidencia/roadmap; commit `887c4d2`.

## Log

### L1

El usuario autorizó avanzar después de cerrar F4c-001.

### L2

Se definieron las decisiones de producto: unicidad por estudiante/institución/período; motivo en observaciones; motivo opcional; rechazo de asignaciones a grupos sin período.
