# Sistema de Agentic Loop — Automatización de Issues

Esta guía explica cómo funciona el sistema de automatización autónoma de desarrollo.
Los skills de automation están diseñados para operar **sin supervisión humana**, encadenando sesiones
mediante `next-prompt.md` para ejecutar issues de GitHub de forma continua.

---

## El Problema

Ejecutar issues de desarrollo de forma autónoma, en cadena, sin que el desarrollador tenga que iniciar cada sesión manualmente.

---

## Cómo Funciona

```
[Desarrollador inicia + runner activo]
        │
        ▼
project-manager-automata
  → lee estado: GitHub + roadmap.md + CLAUDE.md
  → elige el próximo issue válido o crea issues definidas en el roadmap si faltan
  → escribe next-prompt.md con contexto de complete-issue-automata
        │
        ▼ (runner detecta next-prompt.md y arranca nueva sesión)
complete-issue-automata #N
  → ejecuta TDD + implementación + docs
  → cierra el issue
  → decide la siguiente sesión:
      - si el contador terminado es 3, 6, 9, ... → loop-auditor
      - si no → project-manager-automata
  → escribe next-prompt.md con ese handoff
        │
        ▼ (runner detecta next-prompt.md y arranca nueva sesión)
project-manager-automata o loop-auditor
  → repite hasta condición de parada
        │
        ▼
[Loop se detiene solo]
  → no hay más trabajo definido en roadmap/GitHub para continuar
  → límite de sesiones alcanzado
  → tests fallaron
  → contexto de sesión elevado
```

---

## Mecanismo de Handoff

El handoff entre sesiones es agnóstico: cada sesión escribe el prompt de la
siguiente en `next-prompt.md`. Un runner externo detecta ese archivo y arranca
la próxima sesión. El runner es intercambiable (bash, PowerShell, GitHub Actions, cron).

---

## Skills en el Sistema

| Archivo                       | Rol en el loop                           | Cuándo se dispara                                     |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `project-manager-automata.md` | Orquestador: decide qué ejecutar         | Al inicio del loop y después de cada issue completado |
| `complete-issue-automata.md`  | Ejecutor: implementa el issue con TDD    | Disparado por project-manager-automata                |
| `loop-auditor.md`             | Auditor: verifica integridad del sistema | Cada 3 issues                                         |

---

## Archivos de Estado

| Archivo          | Propósito                                     |
| ---------------- | --------------------------------------------- |
| `loop-status.md` | Log de sesiones — fuente de verdad del loop   |
| `next-prompt.md` | Prompt efímero de la próxima sesión (handoff) |

**`next-prompt.md`** existe solo mientras hay una sesión pendiente de ejecutar.
Si no existe, no hay una sesión lista para consumir en este instante.

**Contrato operativo:**

1. `loop-status.md` es persistente y sí forma parte del historial Git.
2. `next-prompt.md` es efímero y no debe commitearse.
3. El orden correcto es: actualizar `loop-status.md` → commitear → escribir `next-prompt.md`.
4. El runner puede consumir `next-prompt.md` apenas aparece, por lo que nunca se debe asumir
   que seguirá existiendo durante o después de un commit.

---

## Guardrails del Sistema

Todos los skills de automation/ deben respetar:

1. **Solo trabajo definido en el roadmap** — nunca inventar trabajo fuera del roadmap
2. **Solo lectura de docs de planificación** — nunca modificar roadmap.md, backlog.md ni sprints.md
3. **Sin preguntas al usuario** — el loop opera sin intervención humana
4. **STOP documentado** — cuando no pueden continuar, escriben en `loop-status.md` y terminan limpiamente
5. **Propagar loop_count** — el counter `[loop_count=X/N]` viaja en cada `next-prompt.md`
6. **No escribir next-prompt.md ante fallo** — tests fallidos, TypeScript roto o issue sin cerrar → STOP
