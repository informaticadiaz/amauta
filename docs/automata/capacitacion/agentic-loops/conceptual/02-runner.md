# 02 — El motor real: `next-prompt.md` + `loop-runner`

## Qué es

En Amauta, un agentic loop **no se dispara con un “tool” interno del chat**.
Se dispara con un mecanismo agnóstico:

1. La sesión actual **escribe el prompt de la próxima sesión** en `next-prompt.md`
2. Un runner externo (`loop-runner.sh` / `loop-runner.ps1`) **detecta** ese archivo y arranca una **nueva sesión** con ese prompt

Este diseño independiza el automatismo de un proveedor/herramienta específica y vuelve el loop portable (bash, PowerShell, cron, GitHub Actions, etc.).

---

## Cómo funciona conceptualmente

```
Sesión A (activa)
  │
  ├── hace su trabajo
  ├── actualiza estado externo (GitHub / docs / loop-status.md)
  ├── escribe next-prompt.md (handoff)
  └── termina normalmente
                │
                ▼ (runner consume next-prompt.md y lanza)
         Sesión B (nueva, independiente)
           ├── inicia con el contenido de next-prompt.md
           ├── hace su trabajo
           ├── escribe next-prompt.md (handoff)
           └── termina
                         │
                         ▼
                   Sesión C...
```

Punto clave: **la sesión nueva no comparte historial** con la anterior. Por eso, el prompt + el estado externo son todo.

---

## El prompt es todo (y vive en archivo)

`next-prompt.md` es el canal directo entre sesiones. Es efímero: existe solo mientras haya una sesión pendiente de ejecutar.

Ejemplo (contenido de `next-prompt.md`):

```
Ejecutá el issue #43 de forma autónoma siguiendo complete-issue-automata.
Contexto: venís de completar el #42 (F4-016).
Verificá condiciones de parada antes de iniciar.
[loop_count=2/5]
```

---

## El runner (qué hace realmente)

El runner:

- espera a que exista `next-prompt.md`
- lo “reclama” (ej. lo renombra a `next-prompt.md.running`) para evitar dobles ejecuciones
- ejecuta el CLI configurado con ese prompt (por defecto `claude --print ...`)
- si el CLI falla, restaura el prompt y deja evidencia en `loop-status.md`

La implementación real vive en:

- `docs/ai-skills/automata-dev/loop-runner.sh`
- `docs/ai-skills/automata-dev/loop-runner.ps1`

---

## Runner vs /schedule (cron)

Son mecanismos distintos:

|                    | Runner (`next-prompt.md`)                      | /schedule (cron)                   |
| ------------------ | ---------------------------------------------- | ---------------------------------- |
| **Cuándo dispara** | Cuando aparece `next-prompt.md`                | En un horario fijo                 |
| **Dependencia**    | Depende del resultado anterior (handoff)       | Independiente del resultado previo |
| **Caso de uso**    | Pipelines secuenciales con estado              | Tareas periódicas sin dependencias |
| **Ejemplo**        | issue #42 → #43 → #44 (siempre el “siguiente”) | “revisar estado cada lunes”        |

---

## El momento correcto para escribir `next-prompt.md`

El orden correcto es:

```
1. Hacer el trabajo de la sesión
2. Verificar que el trabajo está bien (tests pasan, issue cerrado, etc.)
3. Evaluar la condición de parada del loop
4. Si continúa → escribir next-prompt.md con el prompt de la siguiente sesión
5. Terminar la sesión actual
```

Si escribís `next-prompt.md` antes de terminar el trabajo, el runner puede disparar la próxima sesión “demasiado temprano”.

---

## Siguiente paso

[03-patron-handoff.md](03-patron-handoff.md) — Cómo diseñar el traspaso de contexto entre sesiones (qué persistir, dónde, y en qué orden).
