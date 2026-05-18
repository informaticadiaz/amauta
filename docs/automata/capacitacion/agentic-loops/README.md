# Agentic Loops — Automatización Profesional (runner agnóstico)

> Cómo encadenar sesiones de IA para generar código de forma autónoma, segura y controlada.

---

## Qué vas a aprender

Este módulo cubre el diseño e implementación de **agentic loops**: sistemas donde una sesión de IA termina y dispara automáticamente la siguiente, formando un ciclo autónomo de trabajo.

El caso concreto de este proyecto es el loop `project-manager → complete-issue → project-manager`, que permite que el sistema planifique y ejecute issues de GitHub de forma continua sin intervención humana.

---

## Estructura del módulo

### Módulo conceptual (empezar acá)

| Archivo                                                 | Qué explica                                       |
| ------------------------------------------------------- | ------------------------------------------------- |
| [01-que-es.md](conceptual/01-que-es.md)                 | Qué es un agentic loop y qué problema resuelve    |
| [02-runner.md](conceptual/02-runner.md)                 | El motor real: `next-prompt.md` + `loop-runner`   |
| [03-patron-handoff.md](conceptual/03-patron-handoff.md) | El patrón de traspaso entre sesiones              |
| [04-condicionales.md](conceptual/04-condicionales.md)   | Condiciones de parada y bifurcaciones             |
| [05-guardrails.md](conceptual/05-guardrails.md)         | Control de quotas, prevención de loops infinitos  |
| [06-fases.md](conceptual/06-fases.md)                   | Implementación por fases de complejidad creciente |

### Módulo práctico (después del conceptual)

| Archivo                                                          | Qué explica                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [practico/01-analisis-skills.md](practico/01-analisis-skills.md) | Análisis de `project-manager` y `complete-issue` para automatización |
| [practico/02-approval-gates.md](practico/02-approval-gates.md)   | El problema de los approval gates y cómo resolverlo                  |
| [practico/03-skill-autonomo.md](practico/03-skill-autonomo.md)   | Diseño del skill `project-manager-autonomo`                          |
| [practico/04-handoff-real.md](practico/04-handoff-real.md)       | Implementación del handoff entre las dos skills reales               |
| [practico/05-tercera-skill.md](practico/05-tercera-skill.md)     | La tercera skill: auditoría de arquitectura y tests                  |
| [practico/06-implementacion.md](practico/06-implementacion.md)   | Guía de implementación paso a paso                                   |

---

## Prerequisitos

- Entender cómo funcionan las skills de Claude Code (`docs/ai-skills/`)
- Haber ejecutado al menos una vez `project-manager` y `complete-issue` manualmente
- Leer `WORKFLOW.md` del proyecto

---

## El flujo objetivo

```
┌─────────────────────────────────────────────────────┐
│                   LOOP AUTÓNOMO                      │
│                                                      │
│  ┌──────────────┐     ┌─────────────────────────┐   │
│  │  project-    │────▶│    complete-issue #N     │   │
│  │  manager     │     │    (TDD + docs + commit) │   │
│  │  (decide qué │◀────│                          │   │
│  │   sigue)     │     └─────────────────────────┘   │
│  └──────────────┘                                    │
│         │                                            │
│    ¿Más issues?                                      │
│    NO → STOP                                         │
│                                                      │
│  Guardrails:                                         │
│  • Quota sesión > 85% → no iniciar                  │
│  • Quota mensual > 95% → no iniciar                 │
│  • Sin issues abiertos → stop limpio                │
└─────────────────────────────────────────────────────┘
```

---

## Advertencia importante

Un loop autónomo **toma decisiones y hace commits sin intervención humana**. Esto implica:

- Riesgo de commits erróneos en producción
- Consumo de quota de API sin supervisión
- Posibilidad de issues mal ejecutados que se cierran igual

**Leer [05-guardrails.md](conceptual/05-guardrails.md) antes de implementar cualquier cosa.**
