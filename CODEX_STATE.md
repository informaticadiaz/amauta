# Estado de Amauta

## Propósito

Estado breve de continuidad para el workspace `/home/ignacio/amauta`. No reemplaza las reglas de `AGENTS.md` ni la planificación de `docs/project-management/roadmap.md`.

## Estado actual

- La fuente canónica del producto es `docs/project-management/roadmap.md`.
- El trabajo actual corresponde a Fase 4c, Sprint 22.
- F4c-001 a F4c-006 figuran completados en el roadmap.
- El siguiente trabajo planificado es **F4c-007: rol tutor/padre, acceso al seguimiento de su hijo**.
- La base de datos de desarrollo habitual está en el VPS; no asumir una base local ni ejecutar migraciones sin seguir las reglas de `AGENTS.md`.

## Hilo seleccionado

Se está reorganizando el contexto documental local para evitar depender del estado general de `/home/ignacio` y reducir carga innecesaria.

Plan ODD: `odd/tasks/contexto-local-amauta.md`.

## Decisiones vigentes

- `AGENTS.md` contiene reglas permanentes y referencias, no el historial completo del producto.
- `CODEX_STATE.md` contiene sólo continuidad operativa del workspace.
- `docs/project-management/roadmap.md` conserva la autoridad sobre fase, sprint y estado de funcionalidades.
- `CLAUDE.md` quedó fuera del mecanismo activo y se conserva como stub de compatibilidad de 815 bytes.
- CI valida `AGENTS.md` y `CODEX_STATE.md`, no depende de `CLAUDE.md`.
- `CODEX.md` queda pendiente de auditoría como posible documento redundante.

## Trabajo en curso

- T1 del plan de contexto: inventario inicial completado.
- T2: reducción de `AGENTS.md` y creación de este archivo completadas y verificadas.
- T3: migración de referencias activas y stub de `CLAUDE.md` completados; no se modificó `CODEX.md` ni el código de la aplicación.
- T4: checks estructurales, `git diff --check`, Prettier y búsqueda de referencias activas completados.
- Las menciones restantes a `CLAUDE.md` están en `ia-skills/automation/loop-status.md` como historial y en la nota de compatibilidad de `WORKFLOW.md`.

## Cambios a preservar

Existe un archivo no versionado previo a esta tarea:

- `docs/auditorias/informe-incidente-amauta-2026-11-14.md`

No eliminarlo ni asumir que pertenece al trabajo actual sin revisarlo.

## Próximo paso

Auditar `CODEX.md` por separado si se decide continuar con la limpieza documental; la reorganización de `CLAUDE.md` ya quedó verificada.
