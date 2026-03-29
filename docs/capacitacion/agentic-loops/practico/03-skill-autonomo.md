# 03 — Diseño del Skill `project-manager-autonomo`

> Este documento especifica el skill que debe crearse en
> `docs/ai-skills/project-manager-autonomo.md`.
> Incluye el texto completo listo para copiar.

---

## Principio de diseño

`project-manager-autonomo` es un skill de **orquestación pura**. No ejecuta trabajo de desarrollo — elige qué ejecutar a continuación y delega. Su único output es un `RemoteTrigger` o un STOP documentado.

Es la mitad "supervisor" del loop. Solo toma decisiones, nunca implementa.

---

## Diferencias clave vs `project-manager`

| Característica              | project-manager                | project-manager-autonomo                |
| --------------------------- | ------------------------------ | --------------------------------------- |
| Modo de uso                 | Interactivo (usuario presente) | Autónomo (sin usuario)                  |
| Pregunta de foco            | SÍ, obligatoria                | NO, decide solo                         |
| Crea issues                 | Con aprobación                 | NUNCA                                   |
| Modifica docs planificación | Con aprobación                 | NUNCA                                   |
| Llama RemoteTrigger         | NO                             | SÍ, es el output principal              |
| Para el loop                | No aplica                      | SÍ, cuando las condiciones lo requieren |
| Actualiza CLAUDE.md         | Con aprobación                 | NUNCA (lo hace complete-issue)          |

---

## El skill completo

El siguiente texto es el contenido del skill `project-manager-autonomo`:

---

````markdown
---
name: project-manager-autonomo
description:
  Orquestador autónomo del loop de desarrollo. Determina el próximo issue
  a ejecutar según el roadmap y dispara complete-issue. Solo trabaja con issues
  existentes en GitHub. No crea issues, no modifica documentación de planificación,
  no hace preguntas. Su único output es RemoteTrigger o STOP documentado.
---

# Project Manager Autónomo

## Propósito

Este skill es el orquestador del agentic loop. Opera sin supervisión humana.
Su única responsabilidad es determinar el próximo issue a ejecutar y disparar
la sesión de complete-issue correspondiente.

## Lo que este skill NUNCA hace

- Crear issues en GitHub
- Modificar roadmap.md, backlog.md o sprints.md
- Pedir confirmación al usuario (no hay usuario)
- Implementar código o tests
- Cerrar issues

## Workflow

### PASO 1 — Leer estado del proyecto (tres fuentes)

Ejecutar en paralelo:

```bash
# Fuente 1: GitHub — estado real de cada issue
gh issue list --label "phase-4" --state open --limit 20 \
  --json number,title,labels \
  | jq -r '.[] | "#\(.number) \(.title)"'

# Issues cerrados recientes (detectar progreso real)
gh issue list --label "phase-4" --state closed --limit 5 \
  --json number,title \
  | jq -r '.[] | "#\(.number) \(.title)"'

# Fuente 2: roadmap.md
# LEER: docs/project-management/roadmap.md → sección Fase 4

# Fuente 3: CLAUDE.md
# LEER: CLAUDE.md → sección "Próximos pasos" y "Completado en Fase 4"
```
````

### PASO 2 — Resolver inconsistencias

| Inconsistencia                                             | Acción                                               |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| Issue cerrado en GitHub pero pendiente en CLAUDE.md        | Asumir cerrado (GitHub manda). Actualizar CLAUDE.md. |
| Issue abierto en GitHub pero marcado completo en CLAUDE.md | STOP. Registrar en `docs/logs/loop-status.md`.       |
| Orden diferente entre roadmap y GitHub                     | Seguir roadmap.md.                                   |
| Dependencia sin resolver                                   | Buscar candidato alternativo. Si no hay → STOP.      |

### PASO 3 — Verificar condiciones de parada

Evaluar en orden. Si alguna se cumple → STOP con log, no disparar.

1. **¿Hay issues abiertos con label phase-4 en GitHub?**
   - NO → STOP: "Loop completado. No hay más issues en Fase 4 / sprint actual."

2. **¿El issue candidato tiene dependencias abiertas en GitHub?**
   - SÍ → Buscar siguiente candidato sin dependencias pendientes
   - Si no hay ninguno → STOP: "Loop pausado: todos los candidatos tienen dependencias sin resolver."

3. **¿El counter de sesiones llegó al límite?**
   - Leer `[loop_count=X/N]` del prompt de inicio
   - Si X >= N → STOP: "Loop pausado: límite de sesiones alcanzado."

4. **¿Esta sesión tiene contexto elevado?**
   - Heurística: si se leyeron más de 15 archivos o se ejecutaron más de 20 comandos
   - SÍ → STOP: "Loop pausado: contexto de sesión elevado. Reiniciar manualmente."

### PASO 4 — Determinar el próximo issue

1. Tomar los issues OPEN con label `phase-4`
2. Ordenarlos según el orden en `roadmap.md` (sección Fase 4, "Próximos pasos")
3. Aplicar criterios:
   - Priorizar `must-have` sobre `should-have`
   - Respetar dependencias (no elegir un issue si su dependencia está OPEN)
   - Tomar el primero válido según orden del roadmap

### PASO 5 — Actualizar log

Antes de disparar, registrar en `docs/logs/loop-status.md`:

```markdown
## Sesión [timestamp]

- Sesión: [loop_count]
- Acción: Seleccionó issue #[N] — [título]
- Próximo: complete-issue #[N]
```

### PASO 6 — Disparar la siguiente sesión

Incrementar el counter y construir el prompt:

```
RemoteTrigger(
  prompt: "Ejecutá el issue #[N] de forma autónoma siguiendo el workflow completo de complete-issue.

Contexto del loop:
- Venís del project-manager-autonomo
- Loop count: [X+1]/[N_max]
- Fase actual: Fase 4 — [nombre del sprint actual]
- Issue anterior completado: #[N-1] (si aplica)

Al terminar el issue (tests pasando, issue cerrado, commit hecho):
1. Actualizá docs/logs/loop-status.md con el resultado
2. Disparar RemoteTrigger con: '/project-manager-autonomo [loop_count=[X+1]/[N_max]]'

Condiciones de parada para no disparar project-manager:
- Si los tests no pasaron → STOP, registrar problema en loop-status.md
- Si TypeScript no compila → STOP
- Si el issue no pudo cerrarse → STOP

Modo: completamente autónomo. No esperar confirmación del usuario."
)
```

## Formato de STOP

Cuando el loop debe detenerse, NO llamar RemoteTrigger. En cambio:

1. Escribir en `docs/logs/loop-status.md`:

```markdown
## Loop detenido — [timestamp]

- Razón: [razón específica]
- Último issue completado: #[N] (si aplica)
- Próximo issue pendiente: #[N+1] (si aplica)
- Acción requerida del humano: [qué hacer para reiniciar]
```

2. Terminar la sesión con el mensaje:
   "Loop detenido: [razón]. Ver docs/logs/loop-status.md para detalles."

## Guardrails

- No crear issues bajo ninguna circunstancia
- No modificar roadmap.md, backlog.md ni sprints.md
- No usar terminología de estado que no esté verificada en GitHub
- Si hay ambigüedad sobre cuál es el próximo issue → preferir STOP sobre asumir
- El loop_count debe propagarse correctamente en cada RemoteTrigger

```

---

## Dónde crear el archivo

```

docs/ai-skills/project-manager-autonomo.md

```

Copiar el contenido de la sección "El skill completo" (sin las triples comillas del bloque de código).

---

## Verificación antes de usarlo

Antes de usar el skill en un loop real, verificar manualmente:

1. Activar el skill sin loop: `/project-manager-autonomo [loop_count=0/1]`
2. Verificar que elige el issue correcto según el roadmap
3. Verificar que el prompt de handoff generado tiene toda la información necesaria
4. Verificar que crea/actualiza correctamente `docs/logs/loop-status.md`
5. **No ejecutar el RemoteTrigger en esta prueba** — solo verificar el output

---

## Siguiente paso

[04-handoff-real.md](04-handoff-real.md) — El prompt de handoff entre `project-manager-autonomo` y `complete-issue`.
```
