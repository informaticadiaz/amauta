# Iniciar el Agentic Loop

## Arranque rápido

**Terminal 1 — dejar corriendo el runner:**

```bash
# Linux/macOS
./ia-skills/automation/loop-runner.sh

# Windows
.\docs\ai-skills\automata-dev\loop-runner.ps1
```

**Terminal 2 — nueva sesión de IA:**

```
/project-manager-automata [loop_count=0/3]
```

Listo. El loop elige el próximo issue válido o crea el siguiente desde el roadmap si hace falta, lo implementa y para solo después de 3 issues.

---

## Cuántos issues ejecutar

Cambiá el `3` según lo que necesites:

| Querés...                    | Usá                 |
| ---------------------------- | ------------------- |
| Probar que funciona          | `[loop_count=0/1]`  |
| Una sesión de trabajo normal | `[loop_count=0/3]`  |
| Vaciar el backlog de la fase | `[loop_count=0/10]` |

---

## Antes de arrancar

Verificar que el estado es limpio:

```bash
# No debe existir (loop anterior terminó bien)
ls ia-skills/automation/next-prompt.md

# Ver qué issues hay disponibles
gh issue list --state open --limit 10
```

Si `next-prompt.md` existe, hay una sesión pendiente de la última ejecución.
En ese caso el runner la retoma sola — no hace falta hacer nada.

Si una sesión de IA muestra un mensaje del tipo "ejecutar manualmente la siguiente skill",
tomarlo solo como fallback. En el flujo normal con runner activo, la siguiente sesión debería
arrancar sola al detectar `next-prompt.md`.

---

## Cambiar el CLI de IA

Por defecto usa `claude`. Para usar otro:

```bash
# Linux/macOS
AI_CMD=aider ./ia-skills/automation/loop-runner.sh

# Windows
$env:AI_CMD = "aider"
.\docs\ai-skills\automata-dev\loop-runner.ps1
```

---

## Ver qué pasó

```bash
cat ia-skills/automation/loop-status.md
```

`loop-status.md` es el registro persistente. `next-prompt.md` es efímero: puede aparecer
y desaparecer porque el runner lo consume apenas detecta una sesión pendiente.

---

## Si el loop se detuvo solo

El archivo `loop-status.md` explica la razón y qué hacer para retomarlo.
