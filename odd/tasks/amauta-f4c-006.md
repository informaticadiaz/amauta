# ODD Plan — Amauta: F4c-006 alertas automáticas

Estado: completado con verificación local.
Repositorio: `/home/ignacio/amauta`
Fuente de requisitos: `docs/project-management/roadmap.md`, F4c-006.

## Specs

### S1 — Alertas por asistencia baja

> "Umbral configurable por institución: % asistencia mínima (ej. 75%), nota mínima de alerta (ej. 4/10)"

> "Job periódico (o cálculo on-demand) que detecta estudiantes en riesgo"

La plataforma debe detectar estudiantes cuya asistencia quede por debajo del umbral configurado y mantener una alerta activa mientras la condición persista.

### S2 — Alertas por notas en riesgo

> "Notificación interna al EDUCADOR y ADMIN cuando un estudiante cae bajo el umbral"

La plataforma debe detectar estudiantes cuyas notas queden bajo el umbral de alerta y notificar internamente a los educadores y administradores correspondientes.

### S3 — Panel y resolución

> "Panel de alertas activas en el dashboard del admin/educador"

> "Las alertas se resuelven automáticamente cuando el estudiante recupera el umbral"

El sistema debe exponer alertas activas para los roles autorizados y resolverlas automáticamente cuando una nueva evaluación deje de cumplir la condición de riesgo.

## Decisiones aprobadas

- Asistencia acumulada del período académico.
- PRESENTE + JUSTIFICADO cuentan; TARDANZA y AUSENTE no.
- Se usa el umbral de asistencia del período, con default 75%.
- Nota en riesgo: promedio de calificaciones cargadas por estudiante y período; períodos sin notas no generan alerta.
- Umbral de nota separado a nivel institucional, con default 4/10.
- Primera implementación on-demand e idempotente; scheduler queda como extensión posterior.
- Destinatarios: educadores asignados al grupo y ADMIN_ESCUELA de la institución.

## Tasks

- T1 — Resolver reglas de cálculo y contrato de alerta; Specs: S1-S3; Ruta: decisión funcional y contrato backend; Commit: pendiente; Estado: completado.
- T2 — Diseñar persistencia y migración de alertas/umbrales; Specs: S1-S3; Ruta: Prisma/API; Commit: pendiente; Estado: completado.
- T3 — Implementar detector idempotente, notificaciones y resolución; Specs: S1-S3; Ruta: `apps/api/src`; Commit: pendiente; Estado: completado.
- T4 — Exponer consultas/ejecución protegidas y panel web; Specs: S2-S3; Ruta: API y `apps/web/src`; Commit: pendiente; Estado: completado.
- T5 — Verificar, documentar y actualizar roadmap; Specs: S1-S3; Ruta: tests/documentación; Commit: pendiente; Estado: completado.

## Log

### L1

> "avancemos con f4c-006"

### L2

La exploración encontró que no existe modelo persistente de alertas ni scheduler; `PeriodoAcademico.porcentajeAsistenciaMinimo` ya existe, mientras que el umbral de nota de alerta todavía no está definido. La primera slice recomendada es backend on-demand con cálculo testeable, deduplicación, resolución automática y notificaciones; el panel y scheduler pueden seguir como tareas posteriores.

### L3

El usuario aprobó el baseline: asistencia acumulada del período con PRESENTE + JUSTIFICADO; TARDANZA y AUSENTE no cuentan; promedio de notas cargadas por período con umbral institucional separado; detección on-demand idempotente; destinatarios educadores asignados y ADMIN_ESCUELA; resolución automática al recuperar el umbral.

### L4

Implementación completada y verificada localmente. API: 36 suites y 406 tests; type-check y lint aprobados. Web: 75 suites y 307 tests; type-check y lint aprobados. Migración `20261114111416_alertas_academicas` aplicada a `amauta_dev`. La ejecución periódica automática queda fuera del alcance actual; la detección se inicia desde el panel.
