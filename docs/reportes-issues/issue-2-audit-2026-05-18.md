# Auditoría de Funcionalidad — Issue #2 — T-002: Definir licencia del proyecto

Fecha: 2026-05-18
Auditoría: features-audit (IA)
Rol auditado: N/A (infraestructura / documentación)
Entorno: sin-runtime

## Veredicto

⚠️ APROBADO CON RIESGO

## Resumen ejecutivo (2-5 líneas)

La licencia **AGPL-3.0** está definida en el repo (archivo `LICENSE`) y documentada en `README.md` (sección “Licencia”). Sin embargo, el checklist del issue incluye “agregar badge de licencia” y no encontré un badge explícito en el README. Tampoco es verificable desde el repo si se “consultó con stakeholders”.

## Criterios de aceptación (del issue)

- [ ] Investigar licencias open source apropiadas (AGPL-3.0, GPL-3.0) — ⚠️ — Resultado final elegido AGPL-3.0, pero la investigación no es auditable desde artefactos en repo.
- [ ] Consultar con stakeholders sobre preferencias — ⚠️ — No verificable desde el repo (sin acta/nota).
- [x] Crear archivo LICENSE — ✅ — Evidencia: `LICENSE` (GNU Affero GPL v3).
- [x] Actualizar README con información de licencia — ✅ — Evidencia: `README.md` sección “Licencia” indicando **AGPL-3.0**.
- [ ] Agregar badge de licencia — ❌ — No encontré badge (ej: shields) en `README.md`.

## User Journey (flujo mínimo)

No aplica (issue de infraestructura/documentación).

## Trazabilidad (UI → API → DB → Tests)

| Criterio            | UI  | API | DB  | Tests | Estado | Evidencia                 |
| ------------------- | --- | --- | --- | ----- | ------ | ------------------------- |
| Archivo de licencia | N/A | N/A | N/A | N/A   | ✅     | `LICENSE`                 |
| README actualizado  | N/A | N/A | N/A | N/A   | ✅     | `README.md` (“Licencia”)  |
| Badge licencia      | N/A | N/A | N/A | N/A   | ❌     | `README.md` (no presente) |

## Evidencia

- Código: `LICENSE` (AGPL-3.0).
- Documentación: `README.md` → sección “Licencia”.

## Hallazgos

### 🔴 Bloqueantes

Ninguno (la licencia está definida y documentada).

### 🟡 Riesgos / deuda

1. Falta el badge de licencia en `README.md` (ítem explícito del checklist).
2. La “consulta con stakeholders” y la “investigación” no tienen evidencia en repo (si se quiere auditar de verdad, debería existir un ADR / nota / doc).

## Recomendación

- CONTINUAR el loop (si aplica).
- Si queremos cerrar la brecha del checklist: agregar badge de licencia al README y/o dejar evidencia mínima de decisión (ADR corto o nota en docs).
