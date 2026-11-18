# ODD Plan — Contexto local y documentación operativa de Amauta

Estado: implementación y verificaciones completadas; `CODEX.md` fue eliminado por ser redundante y estar desactualizado.
Repositorio: `/home/ignacio/amauta`

## Specs

### S1 — Separar el contexto exclusivo de Amauta

> "por un lado creo que CLAUDE.md ya no es necesario, por el otro creo que necesitamos un /home/ignacio/amauta/AGENTS.md y un /home/ignacio/amauta/CODEX_STATE.md exclusivo para este workspace"

Amauta debe tener un contexto local claro, pequeño y sin depender del estado general de `/home/ignacio`. `AGENTS.md` será la fuente de reglas permanentes del workspace y `CODEX_STATE.md` será la fuente breve de continuidad operativa.

### S2 — Evitar duplicación y obsolescencia

El estado de producto debe seguir en `docs/project-management/roadmap.md`; la visión en `README.md`; el flujo de trabajo en `WORKFLOW.md`; y la documentación técnica en `docs/`. `AGENTS.md` no debe duplicar historiales extensos ni el roadmap completo. `CODEX.md` debe auditarse como posible documento redundante antes de decidir su destino.

### S3 — Sacar CLAUDE.md del mecanismo activo sin romper consumidores

`CLAUDE.md` deja de ser fuente de reglas, estado o planificación. Se conserva temporalmente como stub de compatibilidad, mientras CI, `.cursorrules`, `WORKFLOW.md` y las skills activas pasan a consultar las fuentes canónicas (`AGENTS.md`, `CODEX_STATE.md`, `roadmap.md`, `WORKFLOW.md` y `docs/ai-context/`). La retirada física queda fuera de esta unidad y sólo se evaluará después de verificar consumidores externos.

### S4 — Mantener verificabilidad

La reorganización no debe cambiar el comportamiento de la aplicación. Debe verificarse que los archivos canónicos existan, que las referencias no apunten a fuentes retiradas sin justificación, que CI valide la nueva estructura y que el contexto operativo quede sustancialmente más pequeño.

## Allowed edit surfaces

AGENTS.md
CODEX_STATE.md
CLAUDE.md
CODEX.md
WORKFLOW.md
.cursorrules
.github/workflows/ci.yml
ia-skills/development/architecture-expert.md
ia-skills/quality/feature-audit.md
ia-skills/testing/issue-inspector.md
ia-skills/automation/complete-issue.md
ia-skills/automation/complete-issue-automata.md
ia-skills/automation/loop-auditor.md
ia-skills/automation/project-manager-automata.md
ia-skills/orchestration/backend-sdd-proposal-executor.md
odd/tasks/contexto-local-amauta.md

## Tasks

- T1 — S1-S2 — Inventariar y clasificar `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `README.md`, `WORKFLOW.md`, roadmap, CI y referencias activas — commit: pendiente
- T2 — S1-S2 — Rediseñar y reducir `AGENTS.md`; definir y crear `CODEX_STATE.md` exclusivo del workspace — estado: completado; commit: pendiente
- T3 — S3 — Migrar referencias activas, decidir el destino de `CODEX.md` y retirar `CLAUDE.md` o dejar una transición explícita — estado: completado; `CLAUDE.md` quedó como stub fuera del mecanismo activo y `CODEX.md` fue eliminado — commit: pendiente
- T4 — S4 — Ejecutar validaciones documentales, CI estructural, búsqueda de referencias residuales y medición del contexto resultante — estado: completado; `git diff --check`, Prettier y checks estructurales pasaron; commit: pendiente

## Log

- L1 — 2026-11-14 — Usuario: "por un lado creo que CLAUDE.md ya no es necesario, por el otro creo que necesitamos un /home/ignacio/amauta/AGENTS.md y un /home/ignacio/amauta/CODEX_STATE.md exclusivo para este workspace"
- L2 — 2026-11-14 — Evidencia inicial: `AGENTS.md` ya existe y ocupa 49.644 bytes/1.089 líneas; `CLAUDE.md` ocupa 10.413 bytes/274 líneas; `CODEX.md` ocupa 31.857 bytes/817 líneas; `CODEX_STATE.md` local no existe. `.github/workflows/ci.yml` exige actualmente `CLAUDE.md`.
- L3 — 2026-11-14 — Decisión de planificación: separar reglas, estado, planificación y documentación técnica antes de retirar `CLAUDE.md`; no modificar archivos de implementación de la aplicación.
- L4 — 2026-11-14 — T2 verificado: `AGENTS.md` quedó en 6.450 bytes/102 líneas y `CODEX_STATE.md` en 1.995 bytes/45 líneas; `git diff --check` pasó y se conservaron reglas de Prisma, fuentes canónicas, testing, documentación y advertencias de producción.
- L5 — 2026-11-14 — Decisión del usuario: sacar `CLAUDE.md` del mecanismo activo usando la matriz de responsabilidades; conservarlo sólo como stub de compatibilidad, migrar CI y referencias activas a las fuentes canónicas, y auditar `CODEX.md` por separado.
- L6 — 2026-11-14 — T3 verificado: `CLAUDE.md` quedó reducido a 815 bytes y ya no es requerido por CI; CI valida `AGENTS.md` y `CODEX_STATE.md`; `WORKFLOW.md`, `.cursorrules` y las skills activas fueron migradas. Las menciones restantes están confinadas a `ia-skills/automation/loop-status.md` como historial y a la nota de compatibilidad de `WORKFLOW.md`.
- L7 — 2026-11-14 — T4 verificado: `git diff --check`, Prettier sobre los documentos modificados, existencia de fuentes canónicas y búsqueda explícita en las referencias activas pasaron. El contexto operativo quedó en 6.450 bytes (`AGENTS.md`), 2.197 bytes (`CODEX_STATE.md`) y 815 bytes (`CLAUDE.md` stub). `CODEX.md` quedó como auditoría separada.
- L8 — 2026-11-16 — Decisión del usuario: "si ya no tiene sentido hay que eliminar codex". Auditoría completada: no había consumidores activos ni contenido único; se eliminó `CODEX.md` y se actualizó `CODEX_STATE.md`.
