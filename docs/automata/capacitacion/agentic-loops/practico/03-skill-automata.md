# 03 — Diseño del Skill `project-manager-automata`

> Especifica el orquestador del loop autónomo.
> La implementación real está en `docs/ai-skills/automata-dev/project-manager-automata.md`.
> Este documento explica el diseño y las decisiones detrás de la skill.

---

## Principio de diseño

`project-manager-automata` es el **orquestador del loop**. Decide qué se ejecuta a continuación y delega — no implementa código. Su salida es siempre una de dos cosas:

- Un `next-prompt.md` que dispara la siguiente sesión (`complete-issue-automata` o `loop-auditor`)
- Un STOP documentado en `loop-status.md`

El roadmap es la **fuente de aprobación implícita**: lo que está en el roadmap está aprobado para crearse y ejecutarse, sin necesidad de confirmación humana en cada ciclo.

---

## Diferencias clave vs `project-manager`

| Característica                     | project-manager                | project-manager-automata                       |
| ---------------------------------- | ------------------------------ | ---------------------------------------------- |
| Modo de uso                        | Interactivo (usuario presente) | Autónomo (sin usuario)                         |
| Pregunta de foco                   | SÍ, obligatoria                | NO, decide solo                                |
| Crea issues en GitHub              | Con aprobación humana          | SÍ, si están definidos en el roadmap           |
| Modifica `roadmap.md`              | Con aprobación                 | NUNCA                                          |
| Modifica `backlog.md`/`sprints.md` | Con aprobación                 | NUNCA                                          |
| Mecanismo de handoff               | NO usa                         | Escribe `next-prompt.md` que el runner detecta |
| Detiene el loop                    | No aplica                      | SÍ, cuando se cumple una condición de STOP     |
| Actualiza CLAUDE.md                | Con aprobación                 | NUNCA (lo hace complete-issue-automata)        |

---

## Las dos situaciones que puede enfrentar

```
PASO 1: Leer estado (GitHub + roadmap + CLAUDE.md)
PASO 2: Resolver inconsistencias seguras
PASO 3: Verificar condiciones de STOP
PASO 4: Determinar situación
        │
        ├── A. Hay issues abiertos en la fase
        │     → seleccionar el primero válido según roadmap
        │
        └── B. No hay issues abiertos
              → leer roadmap → crear los próximos (máx 3) → seleccionar el primero
PASO 5: Actualizar loop-status.md
PASO 6: Escribir next-prompt.md con prompt para complete-issue-automata
```

La situación B es lo que distingue a `automata` de un orquestador puramente reactivo: cuando se acaban los issues, la skill **propaga el roadmap a GitHub** sin pedir permiso.

---

## El skill completo

El contenido vivo del skill está en:

```
docs/ai-skills/automata-dev/project-manager-automata.md
```

Ese archivo es la fuente de verdad. Lo que aparece a continuación es un resumen de las secciones más importantes — leer el archivo original antes de modificarlo.

### Secciones que tiene el skill real

| Sección            | Qué define                                                         |
| ------------------ | ------------------------------------------------------------------ |
| Propósito          | Las dos responsabilidades (Situación A y B)                        |
| Lo que NUNCA hace  | Los límites duros (no modificar roadmap, no inventar issues, etc.) |
| Activación         | Cómo se invoca y la semántica de `loop_count`                      |
| Workflow (6 pasos) | Lectura de estado → STOP checks → decisión → escritura del handoff |
| Formato de STOP    | Qué escribir en `loop-status.md` cuando se detiene el loop         |
| Guardrails         | Las reglas duras que el skill no puede violar                      |

---

## La diferencia que importa: aprobación trasladada

El diseño tradicional resolvería los approval gates **quitando capacidades** (no crear issues, no modificar nada). `automata` resuelve el problema de otra forma: **traslada la aprobación a un documento**.

```
APROBACIÓN TRADICIONAL                    APROBACIÓN EN AUTOMATA
─────────────────────────────────────────────────────────────────────
Cada acción requiere "sí" humano          El roadmap aprueba por anticipado
Bloquea el loop                           El loop fluye sin interrupciones
Seguro pero lento                         Seguro pero rápido (si el roadmap es sólido)
```

Esto implica que la calidad del loop depende directamente de la calidad del roadmap. Un roadmap mal escrito hace que `automata` cree issues mal definidos. La conversación de aprobación se mueve "más arriba" en el proceso (al definir el roadmap), no desaparece.

---

## Verificación antes de usarlo en loop

Antes de poner `automata` en producción, validar manualmente:

1. Activar sin loop: `/project-manager-automata [loop_count=0/1]`
2. Verificar que el issue seleccionado coincide con el próximo del roadmap
3. Verificar que `loop-status.md` se actualiza con el formato esperado
4. Verificar el contenido de `next-prompt.md` antes de que el runner lo lea (o eliminar el archivo si no querés que se dispare)
5. En Situación B: verificar que los issues que crearía coinciden con lo definido en el roadmap

---

## Siguiente paso

[04-handoff-real.md](04-handoff-real.md) — El prompt de handoff entre `project-manager-automata` y `complete-issue-automata`.
