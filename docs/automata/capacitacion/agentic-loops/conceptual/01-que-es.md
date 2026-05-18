# 01 — Qué es un Agentic Loop

## El problema que resuelve

Cuando usás Claude Code para ejecutar un issue, lo que hacés es:

1. Abrís una sesión
2. Escribís "ejecuta el issue #42"
3. Claude trabaja, commitea, cierra el issue
4. La sesión termina
5. Vos abrís otra sesión y repetís para el #43

El cuello de botella no es Claude — sos vos en el paso 5.

Un **agentic loop** elimina ese cuello de botella: cuando la sesión del issue #42 termina, automáticamente dispara una nueva sesión para el #43. Sin intervención humana.

---

## Qué es exactamente

Un agentic loop es un sistema donde:

1. Una **sesión A** ejecuta una tarea y, al finalizar, **dispara una sesión B**
2. La **sesión B** ejecuta su tarea y dispara una **sesión C** (o vuelve a A)
3. El ciclo continúa hasta que una condición de parada lo detiene

Cada sesión es **independiente** — no comparte contexto de conversación con las anteriores. Lo que persiste entre sesiones es el **estado del mundo externo**: archivos, commits, issues de GitHub, documentación.

---

## La analogía correcta

Pensalo como una **cadena de producción**:

```
[Supervisor]         [Operario]
Decide qué hacer  →  Ejecuta la tarea
Recibe resultado  ←  Reporta que terminó
Decide qué sigue  →  Ejecuta la siguiente
```

El supervisor no ejecuta. El operario no decide. Y ninguno de los dos necesita que vos intervengas entre turno y turno.

En el contexto de este proyecto:

| Rol        | Skill             |
| ---------- | ----------------- |
| Supervisor | `project-manager` |
| Operario   | `complete-issue`  |

---

## Cuándo tiene sentido usarlo

Un loop autónomo tiene sentido cuando:

- Las tareas son **predecibles y bien definidas** (issues con checklist claro)
- El estado del sistema es **verificable externamente** (GitHub, archivos, tests)
- Los errores son **recuperables** (no afectan producción crítica)
- Tenés **guardrails** en su lugar para detectar cuando algo sale mal

No tiene sentido cuando:

- Las tareas requieren decisiones ambiguas frecuentes
- El costo de un error es muy alto
- No hay tests automatizados que validen el trabajo

---

## La diferencia con un cron job

Un cron job ejecuta algo a una hora fija. Un agentic loop ejecuta algo **cuando el paso anterior terminó bien**.

```
Cron job:    [9:00 tarea A] [9:00 tarea B] [9:00 tarea C]  ← paralelo, sin dependencia
Agentic loop: [tarea A] → [tarea B depende de A] → [tarea C depende de B]  ← secuencial, con estado
```

El loop respeta el **orden lógico del trabajo**, no un horario arbitrario.

---

## Los tres componentes de un loop

Todo agentic loop profesional tiene tres partes:

### 1. El disparador (trigger)

El mecanismo que dispara la próxima sesión **sin depender del historial del chat**.
En Amauta es agnóstico: la sesión escribe `next-prompt.md` y un runner externo (`loop-runner`) arranca la siguiente.

### 2. La lógica de handoff

Qué información pasa de una sesión a la siguiente y cómo. Como las sesiones no comparten contexto, el handoff ocurre a través del **estado externo** (GitHub, archivos) y del **prompt de inicio** de la siguiente sesión.

### 3. Las condiciones de parada

Cuándo el loop debe detenerse. Sin esto, tenés un bucle infinito que consume quota y potencialmente rompe cosas.

---

## Siguiente paso

[02-runner.md](02-runner.md) — El motor real del loop: `next-prompt.md` + `loop-runner`.
