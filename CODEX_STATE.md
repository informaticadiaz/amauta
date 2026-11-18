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

Se completó la reorganización del contexto documental local y se completó F4c-008 — justificación formal de ausencias.

Plan ODD cerrado: `odd/tasks/f4c-008-justificacion-ausencias.md`.

## Decisiones vigentes

- `AGENTS.md` contiene reglas permanentes y referencias, no el historial completo del producto.
- `CODEX_STATE.md` contiene sólo continuidad operativa del workspace.
- `docs/project-management/roadmap.md` conserva la autoridad sobre fase, sprint y estado de funcionalidades.
- `CLAUDE.md` quedó fuera del mecanismo activo y se conserva como stub de compatibilidad de 815 bytes.
- CI valida `AGENTS.md` y `CODEX_STATE.md`, no depende de `CLAUDE.md`.
- `CODEX.md` fue eliminado tras confirmar que era redundante y estaba desactualizado.

## Trabajo en curso

- Reorganización documental local: T1–T4 completados y verificados; `CODEX.md` fue eliminado con autorización explícita.
- F4c-008: T1–T5 completados; API y frontend implementados y verificados localmente.
- El usuario confirmó que los adjuntos son archivos cargados al sistema y que deben admitir imágenes o PDF.
- Decisiones confirmadas: sólo `AUSENTE`; un archivo por solicitud; imágenes o PDF privados con descarga autorizada; rechazo corregible y reenviable; revisan educador asignado o `ADMIN_ESCUELA`; sólo períodos abiertos; límite de 5 MB; conservar archivos rechazados con historial; sólo notificación interna; una solicitud activa por ausencia; requiere conexión.
- El motivo del rechazo será obligatorio para permitir corrección y reenvío.
- La infraestructura pública de uploads se preserva; F4c-008 agrega almacenamiento privado, validación de firmas de archivo y descarga autorizada para documentos sensibles.
- El usuario autorizó aplicar sólo en la base local `amauta_dev` la migración pendiente `20261116140000_tutor_links_institution`; se aplicó correctamente y el estado quedó actualizado.
- Las menciones restantes a `CLAUDE.md` están en `ia-skills/automation/loop-status.md` como historial y en la nota de compatibilidad de `WORKFLOW.md`.

## Cambios a preservar

Existe un archivo no versionado previo a esta tarea:

- `docs/auditorias/informe-incidente-amauta-2026-11-14.md`

No eliminarlo ni asumir que pertenece al trabajo actual sin revisarlo.

## Próximo paso

El roadmap indica F4c-009 — Calendario institucional como siguiente trabajo planificado.
