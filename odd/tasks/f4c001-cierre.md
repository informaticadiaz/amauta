# ODD — Cierre formal de F4c-001

Repositorio: `/home/ignacio/amauta`
Objetivo: completar las brechas detectadas en la verificación de F4c-001 y cerrar el issue con evidencia reproducible.

## Specs

### S1 — Alcance funcional del catálogo de materias

Fuente: `docs/project-management/roadmap.md`, F4c-001:

> "Entidad `Materia`: id, nombre, descripción, institucionId, activo"
>
> "Migración de `Calificacion.materia: String` → `Calificacion.materiaId: String` (FK)"
>
> "Script de migración: crear materias a partir de los strings únicos existentes, reasignar FK"
>
> "CRUD de materias (ADMIN_ESCUELA)"
>
> "Asignación de materias a grupos (qué materias se dictan en cada grupo)"
>
> "Actualizar endpoints de calificaciones para recibir `materiaId` en lugar de string"

### S2 — Decisión de cierre

> "1"

La decisión autorizó completar primero las brechas de tests, proxies y documentación antes del cierre formal de F4c-001. No autorizó cambios de producción, despliegue ni nuevas funcionalidades fuera de este alcance. El alcance se completó en `ab024aa`.

### S3 — Criterios de verificación

- Los servicios de materias prueban CRUD, permisos, soft delete/reactivación, duplicados y asignación/remoción.
- Los controllers y proxies relevantes tienen cobertura de contrato y errores observables.
- La UI de materias puede administrar las asignaciones de materias a grupos mediante los proxies existentes o agregados dentro de las rutas F4c-001.
- La documentación de calificaciones usa `materiaId` y los servicios respetan el patrón `safeParse` del proyecto.
- La migración mantiene la evidencia ya registrada en `odd/evidence/f4c001-verification.md`.

## Tasks

- T1 — Cobertura backend de materias; S1/S3; ruta API/tests; commit `ab024aa`.
- T2 — Proxies y cobertura frontend; S1/S3; ruta web/tests; commit `ab024aa`.
- T3 — Patrones y documentación; S1/S3; documentación/API; commit `ab024aa`.
- T4 — Verificación y cierre; S1-S3; checks/evidencia/roadmap; commit `ab024aa`.

## Log

### L1

La verificación de F4c-001 fue parcialmente exitosa: migración, tests API/web y type-check pasaron, pero quedaron brechas de cobertura, proxies frontend y documentación. La decisión posterior fue completar esas brechas antes del cierre formal.
