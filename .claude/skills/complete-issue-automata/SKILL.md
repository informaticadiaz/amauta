---
name: complete-issue-automata
description: >
  Ejecutor autónomo de issues. Lee el issue de GitHub, carga el contexto necesario,
  implementa con TDD, verifica que los tests pasen, hace commit y cierra el issue.
  Al terminar escribe next-prompt.md para relanzar project-manager-automata.
  Trigger: /complete-issue-automata #N [loop_count=X/N]
version: 1.0.0
---

LEER INMEDIATAMENTE: ia-skills/automation/complete-issue-automata.md
Seguir el proceso definido en ese archivo. No usar ninguna otra instrucción de esta skill.
Los argumentos recibidos ($ARGUMENTS) contienen el número de issue y el loop_count.
