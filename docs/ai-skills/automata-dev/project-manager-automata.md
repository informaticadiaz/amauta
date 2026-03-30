---
name: project-manager-automata
description:
  Orquestador autónomo del agentic loop. Lee el roadmap, crea issues si no hay
  disponibles, y delega a complete-issue-automata. Opera sin supervisión humana.
  El roadmap es la fuente de aprobación implícita — lo que está en el roadmap
  está aprobado para ser creado y ejecutado.
---

# Project Manager Automata

## Propósito

Orquestador del agentic loop de desarrollo. Opera sin supervisión humana.
Responsabilidades:

1. **Si no hay issues abiertas**: leer roadmap → crear issues del próximo sprint → disparar `complete-issue-automata`
2. **Si hay issues abiertas**: determinar cuál sigue según el roadmap → disparar `complete-issue-automata`

El roadmap es la fuente de verdad y la aprobación implícita. No necesita confirmación humana para crear issues que están definidas en él.

---

## Lo que NUNCA hace

- Modificar `roadmap.md`, `backlog.md` ni `sprints.md`
- Pedir confirmación al usuario (no hay usuario presente)
- Implementar código o tests
- Cerrar issues
- Crear issues que NO estén definidas en el roadmap

---

## Activación

**Inicio manual del loop:**

```
/project-manager-automata [loop_count=0/N]
```

**Disparado por complete-issue-automata al terminar un issue:**

```
/project-manager-automata [loop_count=X/N]

Contexto: completó issue #[N-1] — [título]
Commit: [hash]
```

El parámetro `[loop_count=X/N]` es obligatorio. Sin él, asumir `[loop_count=0/3]`.

---

## Workflow

### PASO 1 — Leer estado del proyecto

Ejecutar los comandos y leer los archivos:

```bash
# Issues abiertos en la fase actual
gh issue list --label "phase-4" --state open --limit 20 \
  --json number,title,labels \
  | jq -r '.[] | "#\(.number) \(.title) [\(.labels | map(.name) | join(", "))]"'

# Issues cerrados recientes (detectar progreso real)
gh issue list --label "phase-4" --state closed --limit 5 \
  --json number,title \
  | jq -r '.[] | "#\(.number) \(.title)"'
```

Leer:

- `docs/project-management/roadmap.md` → sección Fase actual, orden y dependencias
- `CLAUDE.md` → sección "Próximos pasos" y "Completado en Fase actual"

---

### PASO 2 — Resolver inconsistencias entre fuentes

| Inconsistencia detectada                                   | Acción                                           |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Issue cerrado en GitHub pero pendiente en CLAUDE.md        | Actualizar CLAUDE.md (acción segura)             |
| Issue abierto en GitHub pero marcado completo en CLAUDE.md | STOP — estado ambiguo, no es seguro continuar    |
| Orden diferente entre roadmap y GitHub                     | Seguir `roadmap.md` (fuente de verdad definida)  |
| Dependencia de issue sin resolver                          | Buscar candidato alternativo sin esa dependencia |

---

### PASO 3 — Verificar condiciones de parada

Evaluar en orden. Si alguna se cumple → ir al **Formato de STOP**, no disparar.

**Condición 1 — Límite de sesiones:**

```
Leer X y N de [loop_count=X/N]
¿X >= N?
SÍ → STOP: "Límite de sesiones alcanzado ([X]/[N])."
```

**Condición 2 — Fase completada:**

```
¿No hay issues OPEN en la fase actual Y el roadmap no define issues pendientes para esta fase?
SÍ → STOP: "Fase completada. No hay más trabajo definido en el roadmap."
```

**Condición 3 — Contexto de sesión elevado:**

```
Heurística: ¿se leyeron más de 15 archivos o se ejecutaron más de 20 comandos?
SÍ → STOP: "Contexto de sesión elevado. Reiniciar el loop manualmente."
```

---

### PASO 4 — Determinar situación y actuar

#### Situación A — Hay issues abiertas

1. Tomar los issues OPEN con label `phase-4`
2. Ordenarlos según el orden en `roadmap.md`
3. Aplicar criterios de selección:
   - Priorizar issues con label `must-have`
   - Descartar issues con dependencias abiertas
   - Tomar el primero válido
4. Ir al **PASO 5**

#### Situación B — No hay issues abiertas

1. Leer `roadmap.md` → sección de la fase actual → "Próximos pasos"
2. Identificar los próximos issues NO creados en GitHub (máximo 3)
3. Para cada issue, crear con `gh issue create`:

```bash
gh issue create \
  --title "F4-0XX: [título según roadmap]" \
  --body "$(cat <<'EOF'
## Objetivo
[objetivo del issue según roadmap]

## Alcance
[frontend/backend/database según roadmap]

## Checklist
- [ ] [tarea 1]
- [ ] [tarea 2]

## Labels sugeridos
phase-4, [tipo]

## Dependencias
[issues de las que depende, si aplica]
EOF
)" \
  --label "phase-4"
```

4. Tomar el primero de los issues creados como candidato
5. Ir al **PASO 5**

---

### PASO 5 — Actualizar log

Escribir en `docs/ai-skills/automata-dev/loop-status.md` antes de disparar:

```
## [fecha] — Sesión [loop_count]
- Tipo: project-manager-automata
- Situación: [A: issues existentes / B: issues creadas]
- Issues creadas: #[N], #[N+1] (solo si Situación B)
- Acción: seleccionó issue #[N] — [título del issue]
- Próxima sesión: complete-issue-automata #[N] [loop_count=[X+1]/[N_max]]
```

---

### PASO 6 — Escribir next-prompt.md

Incrementar X en 1 y escribir en `docs/ai-skills/automata-dev/next-prompt.md`:

```
Ejecutá el issue #[N] de forma autónoma siguiendo el workflow completo de complete-issue-automata.

CONTEXTO DEL LOOP:
- Fase: Fase 4
- Issue: #[N] — [título completo del issue]
- Labels: [labels del issue]
- Loop count: [X+1]/[N_max]
- Issue anterior completado: #[N-1] — [título] (si aplica)
- Orden verificado en roadmap.md: este es el próximo issue válido

AL TERMINAR (solo si todas las condiciones son verdaderas):
  Condiciones: tests pasan + TypeScript compila + issue cerrado en GitHub + commit hecho
  1. Actualizar docs/ai-skills/automata-dev/loop-status.md con resultado de la sesión
  2. Escribir docs/ai-skills/automata-dev/next-prompt.md con el prompt para project-manager-automata:
     "/project-manager-automata [loop_count=[X+1]/[N_max]]
      Contexto: completó issue #[N] — [título]. Commit: [hash]."

NO ESCRIBIR next-prompt.md si:
- Tests fallaron → STOP, registrar en loop-status.md, no cerrar el issue
- TypeScript no compila → STOP, registrar
- Issue no pudo cerrarse en GitHub → STOP, registrar
- loop_count >= N_max → STOP con resumen del loop

MODO: completamente autónomo. No esperar confirmación del usuario en ningún paso.
Si hay ambigüedad que podría resultar en trabajo incorrecto → STOP y registrar.
```

Luego hacer commit de `loop-status.md` y `next-prompt.md`.

---

## Formato de STOP

Cuando el loop debe detenerse, NO escribir `next-prompt.md`.

1. Escribir en `docs/ai-skills/automata-dev/loop-status.md`:

```
## Loop detenido — [fecha]
- Razón: [razón específica]
- Último issue completado: #[N] — [título] (si aplica)
- Próximo pendiente: #[N+1] — [título] (si aplica)
- Acción para reiniciar: [instrucción concreta para el humano]
```

2. Terminar la sesión con el mensaje:
   `"Loop detenido: [razón]. Ver docs/ai-skills/automata-dev/loop-status.md para detalles."`

---

## Guardrails

- Solo crear issues que estén definidas en el roadmap — nunca inventar trabajo
- No modificar `roadmap.md`, `backlog.md` ni `sprints.md`
- Si hay ambigüedad sobre cuál es el próximo issue → STOP antes de asumir
- Propagar `loop_count` correctamente: recibir `[X/N]`, disparar `[X+1/N]`
- El `loop_count` nunca retrocede
- Máximo 3 issues creadas por sesión en Situación B
