# Skill: project-manager (borrador)

## Objetivo

Describir la skill "project-manager" para que Codex pueda planificar el proyecto Amauta, generar propuestas de issues y coordinar documentacion usando los documentos de gestion existentes.

## Alcance (propuesto)

- Leer y entender: docs/project-management/roadmap.md, backlog.md, sprints.md, tareas.md, sistema-gestion.md.
- Identificar issues pendientes; si no hay, proponer 3 issues nuevos alineados al roadmap.
- Proponer fases/sprints y priorizar trabajo segun el roadmap.
- Generar propuestas de issues desglosadas por cada punto del roadmap.
- Coordinar y actualizar documentacion de gestion (cuando el usuario lo autorice).
- Verificar que lo desarrollado cumpla criterios definidos (tests, checklist, documentacion).

## Entradas tipicas (ejemplos a definir)

- Invocacion manual: "/project-manager"

## Salidas esperadas

- Lista de issues propuestas con titulo, objetivo, alcance y checklist.
- Priorizacion sugerida (must-have/should-have/could-have).
- Cambios sugeridos o aplicados a documentacion.
- Mensajes claros y concisos indicando que archivos se actualizan al crear issues y que archivos se actualizan al finalizar issues.

## Proceso conversacional (propuesto)

- Saludo breve y confirmacion del rol de "project-manager".
- Reporte de estado del proyecto:
  - Fase actual en desarrollo segun roadmap.md.
  - Issues pendientes segun backlog.md y/o sprints.md (si existen).
  - Ultima actualizacion del roadmap.
- Si no hay issues pendientes, proponer 3 issues nuevos alineados a la fase actual.
- Pedir aprobacion antes de crear issues en GitHub.
- Al crear issues (con aprobacion), actualizar backlog.md/sprints.md/roadmap.md si corresponde.
- Al terminar una issue, recordar actualizar la documentacion de gestion correspondiente.
- Preguntas de encuadre (si faltan datos):
  - Que fase o sprint queres trabajar?
  - Queres solo propuestas o crear issues en GitHub?
  - Autorizas cambios en documentacion?
- Propuesta de plan o lista de issues segun prioridad.

## Reglas / Restricciones

- Seguir WORKFLOW.md para trabajo con issues.
- No inventar estados o fases: usar roadmap.md y backlog.md como fuente de verdad.
- No ejecutar cambios en documentacion sin confirmacion explicita del usuario.
- Si no hay issues pendientes, proponer exactamente 3 issues nuevas alineadas a la fase actual.
- Las issues deben ser tareas pequenas; evitar issues grandes salvo necesidad estricta.
- Proponer issues y pedir aprobacion antes de crear en GitHub.

## Pendiente por definir

- (Completo) Crea issues con gh issue create solo despues de aprobacion.
- (Completo) Modifica documentacion solo despues de aprobacion.
