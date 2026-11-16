# ODD Plan — Amauta: F4c-007 rol tutor/padre

Estado: completado en desarrollo.
Repositorio: `/home/ignacio/amauta`
Fuente canónica: `docs/project-management/roadmap.md`, F4c-007.

## Specs

### S1 — Rol y administración de vínculos

> "Nuevo rol: `TUTOR` en el enum `Rol`"

> "Entidad `TutorEstudiante`: tutorId, estudianteId, relacion (PADRE, MADRE, TUTOR_LEGAL, OTRO), activo"

> "Un tutor puede estar vinculado a múltiples estudiantes"

> "El ADMIN_ESCUELA gestiona los vínculos tutor ↔ estudiante"

> "TUTOR no se registra públicamente; un administrador vincula un usuario existente."

El sistema debe permitir que un administrador de escuela cree, liste, actualice y desactive vínculos entre usuarios con rol tutor y estudiantes de su institución, sin exponer el rol tutor al registro público.

### S2 — Acceso de solo lectura

> "Acceso de solo lectura al boletín, asistencias, calificaciones y comunicados del estudiante vinculado"

> "El tutor sólo accede a estudiantes con vínculo activo y matrícula activa en la institución administrada."

> "Los períodos históricos quedan fuera del MVP; se muestra el estado académico vigente."

Un tutor debe poder consultar exclusivamente la información académica vigente de sus estudiantes vinculados. No puede modificar calificaciones, asistencias, matrículas, comunicados ni vínculos.

### S3 — Comunicados urgentes

> "Notificaciones al tutor cuando se publican comunicados URGENTES"

> "“Urgente” significa el tipo/prioridad urgente ya existente en comunicados; la notificación sería interna."

Cuando se publique un comunicado cuyo tipo o prioridad sea urgente, el sistema debe crear una notificación interna para cada tutor vinculado activamente a estudiantes con matrícula activa en la institución del comunicado, sin duplicar destinatarios.

### S4 — Seguridad de alcance

Los endpoints deben comprobar en backend el vínculo activo, la matrícula activa y la institución antes de devolver datos. Un tutor no puede obtener información de otro estudiante modificando identificadores en la URL.

## Decisiones aprobadas

- El rol `TUTOR` no se ofrece en el registro público; la creación de usuarios tutores queda fuera de este MVP.
- `ADMIN_ESCUELA` gestiona los vínculos dentro de su institución; `SUPER_ADMIN` conserva acceso administrativo global según los patrones existentes.
- El acceso académico se limita a vínculo activo + matrícula activa.
- Se consulta el período académico vigente; no se incorpora navegación histórica.
- Los comunicados urgentes se identifican por `tipo = URGENTE` o `prioridad = URGENTE`.
- Las notificaciones son internas y se deduplican por tutor y comunicado.

## Tasks

- T1 — S1/S4 — Diseñar persistencia, autorización y contratos de tutor; Ruta: Prisma/API; Commit: `2b4f852`; Estado: completado.
- T2 — S1/S4 — Implementar migración, módulo de vínculos y endpoints administrativos; Ruta: `apps/api/src/tutores` y schema; Commit: `2b4f852`; Estado: completado.
- T3 — S2/S4 — Implementar acceso tutor de solo lectura a datos académicos vigentes; Ruta: API y proxies web; Commit: `2b4f852` y `b12da8d`; Estado: completado.
- T4 — S3 — Integrar notificaciones por comunicados urgentes con deduplicación; Ruta: API; Commit: `b12da8d`; Estado: completado.
- T5 — S1-S4 — Implementar UI tutor/admin, tests, documentación y actualización del roadmap; Ruta: `apps/web/src`, tests y docs; Commit: `b12da8d`; Estado: completado.
- T6 — S2/S4 — Asociar cada vínculo tutor-estudiante a una institución y reforzar la autorización de lectura; Ruta: Prisma/API/tests; Commit: `d6bd395`; Estado: completado.

## Log

### L1

> "implementa f4c-007 con las reglas propuestas"

### L2

La exploración confirmó que el schema no tiene `TUTOR` ni `TutorEstudiante`; el registro público restringe roles a estudiante y educador; las consultas académicas "me" existentes están diseñadas para estudiantes y los comunicados resuelven la institución desde grupos activos. Se implementará autorización centralizada para evitar duplicar reglas y se preservará el archivo preexistente `docs/auditorias/informe-incidente-amauta-2026-11-14.md`.

### L3

T1/T2 implementados en la rama `feat/f4c007-tutores`: `Rol.TUTOR`, `RelacionTutor`, `TutorEstudiante`, migración versionada, módulo administrativo y autorización por administrador/institución/matrícula activa. Verificación: 2 suites y 5 tests focalizados, `npm run type-check`, `npx prisma validate` y `git diff --check` aprobados. La migración permanecía pendiente de aplicación durante la implementación y se dejó para el flujo controlado de base de datos.

### L4

T3 implementó `TutorAccessService` y endpoints protegidos para listar estudiantes vinculados y consultar boletín, asistencias, calificaciones y comunicados del período vigente. Verificación del padre: 3 suites, 10 tests focalizados, type-check y diff check aprobados.

### L5

T4 integró notificaciones internas para comunicados con `tipo = URGENTE` o `prioridad = URGENTE`, deduplicadas por tutor y comunicado mediante clave única. Verificación del padre: 2 suites, 21 tests focalizados, type-check, `npx prisma validate` y `git diff --check` aprobados. La migración continuaba sin aplicar durante la implementación.

### L6

T5 completó dashboard tutor, administración de vínculos, proxies, navegación, tipados, tests y documentación funcional. Verificación: API 39 suites/420 tests; web 16 suites/42 tests sobre archivos relacionados; type-check y lint del monorepo aprobados; `git diff --check` aprobado. `npx prisma validate` aprobado. Prettier quedó aprobado para los archivos modificados. `prisma migrate status` detectaba únicamente la migración nueva pendiente durante la implementación. Tras la autorización explícita del usuario, se aplicó con `npx prisma migrate deploy` sobre `amauta_dev`.

### L7

La implementación queda en la rama `feat/f4c007-tutores`, sin commit ni despliegue. La migración `20261114130000_tutores_estudiantes` fue aplicada exitosamente en `amauta_dev`; `npx prisma migrate status` confirma que el esquema está actualizado. Se preservó el archivo no versionado preexistente `docs/auditorias/informe-incidente-amauta-2026-11-14.md`.

### L8

La entrega se dividió en dos slices funcionales: `2b4f852` para schema, migración y API tutor; `b12da8d` para notificaciones, frontend, documentación y tests. Ambos commits fueron publicados en `origin/feat/f4c007-tutores`. Los commits previos `265575a` y `879f70e` corresponden a documentación local pendiente de publicación desde antes de este feature.

### L9

La revisión previa al merge del PR #117 detectó que `TutorEstudiante` no conservaba `institucionId`; se corrige antes del merge para cumplir S2/S4 y evitar acceso cruzado entre instituciones. El vínculo se asociará explícitamente a una institución y la autorización de lectura deberá exigir matrícula activa en esa misma institución.

### L10

T6 completado en `d6bd395`: `TutorEstudiante` conserva `institucionId`, la clave única permite vínculos por institución, el acceso tutor exige vínculo y matrícula activa en la misma institución, y la migración aborta si no puede asignar una institución única a datos existentes. Verificación: schema Prisma válido, type-check API, 2 suites/7 tests focalizados y `git diff --check` aprobados. `prisma migrate status` no pudo ejecutarse por ausencia de `DATABASE_URL`; no se aplicó ninguna migración.
