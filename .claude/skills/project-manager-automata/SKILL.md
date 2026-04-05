---
name: project-manager-automata
description: >
  Orquestador autónomo del agentic loop. Lee el roadmap, crea issues si no hay
  disponibles, y delega a complete-issue-automata. Opera sin supervisión humana.
  El roadmap es la fuente de aprobación implícita — lo que está en el roadmap
  está aprobado para ser creado y ejecutado.
  Trigger: /project-manager-automata [loop_count=X/N]
version: 1.0.0
---

LEER INMEDIATAMENTE: docs/ai-skills/automata-dev/project-manager-automata.md
Seguir el proceso definido en ese archivo. No usar ninguna otra instrucción de esta skill.
Los argumentos recibidos ($ARGUMENTS) contienen el loop_count y contexto de la sesión anterior.
