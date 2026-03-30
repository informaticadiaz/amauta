Ejecutá el issue #81 de forma autónoma siguiendo el workflow completo de complete-issue-automata.

CONTEXTO DEL LOOP:

- Fase: Fase 4
- Issue: #81 — F4-016: UI Carga rápida de calificaciones por grupo y periodo
- Labels: phase-4, frontend, ui, enhancement, tests
- Loop count: 1/1
- Issue anterior completado: #80 — F4-015: API Carga y listado de calificaciones por periodo
- Orden verificado en roadmap.md: este es el próximo issue válido (Sprint 15, issue 3/3)

AL TERMINAR (solo si todas las condiciones son verdaderas):
Condiciones: tests pasan + TypeScript compila + issue cerrado en GitHub + commit hecho

1. Actualizar docs/ai-skills/automata-dev/loop-status.md con resultado de la sesión
2. NO escribir next-prompt.md — loop_count=1/1 es el límite → STOP con resumen del loop

NO ESCRIBIR next-prompt.md si:

- Tests fallaron → STOP, registrar en loop-status.md, no cerrar el issue
- TypeScript no compila → STOP, registrar
- Issue no pudo cerrarse en GitHub → STOP, registrar
- loop_count >= N_max → STOP con resumen del loop (este caso: 1 >= 1 → STOP siempre)

MODO: completamente autónomo. No esperar confirmación del usuario en ningún paso.
Si hay ambigüedad que podría resultar en trabajo incorrecto → STOP y registrar.
