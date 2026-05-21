# 04 — El Handoff Real entre Skills

> Los prompts concretos que conectan `project-manager-automata` con `complete-issue`
> y viceversa. Estos son los textos reales que van en `next-prompt.md`.

---

## El handoff A → B: project-manager-automata dispara complete-issue

Este es el prompt que `project-manager-automata` escribe en `next-prompt.md` para iniciar `complete-issue`.

### Estructura del prompt

```
[SKILL]: Qué skill ejecutar
[ISSUE]: Número concreto del issue
[CONTEXTO]: Estado actual del proyecto (lo que la sesión B necesita saber)
[INSTRUCCIÓN DE RETORNO]: Qué hacer al terminar (disparar la sesión siguiente)
[CONDICIONES DE PARADA]: Cuándo NO disparar la sesión siguiente
[MODO]: Explícitamente autónomo
```

### El prompt completo

```
Ejecutá el issue #[N] de forma autónoma siguiendo el workflow completo de complete-issue.

CONTEXTO DEL LOOP:
- Fase: [Fase 4 — Sprint 15]
- Issue a ejecutar: #[N] — [título del issue]
- Tipo: [backend / frontend / database — según labels]
- Sesión del loop: [loop_count]
- Issue anterior: #[N-1] — [título] (completado)
- Fuente de verdad: roadmap.md confirma que este es el próximo issue válido

ESTADO VERIFICADO:
- GitHub: #[N] está OPEN con dependencias resueltas
- CLAUDE.md: [fase actual] en progreso, [N-1] marcado como completado
- roadmap.md: #[N] es el próximo según el orden de Fase 4

INSTRUCCIÓN AL TERMINAR:
Cuando el issue esté cerrado, los tests pasen y el commit esté hecho:
1. Actualizá `ia-skills/automata-dev/loop-status.md` con el resultado de esta sesión
2. Escribir next-prompt.md: "/project-manager-automata [loop_count=[X+1]/[N_max]]"

CONDICIONES PARA NO DISPARAR:
- Tests fallaron → STOP. Registrar en loop-status.md. No cerrar el issue.
- TypeScript no compila → STOP. Registrar.
- El issue no pudo cerrarse en GitHub → STOP. Registrar.
- loop_count >= N_max → STOP. "Límite de sesiones alcanzado."

MODO: completamente autónomo — no esperar confirmación del usuario en ningún paso.
Excepción: si detectás una ambigüedad que podría resultar en trabajo incorrecto → STOP y registrar.
```

---

## El handoff B → A: complete-issue dispara project-manager-automata

Este es el prompt que `complete-issue` escribe en `next-prompt.md` al finalizar exitosamente.

### Cuándo se dispara

Solo cuando **todas** estas condiciones son verdaderas:

- Tests pasan (confirmado con ejecución real)
- TypeScript compila sin errores
- Issue cerrado en GitHub
- CLAUDE.md actualizado
- Commit y push completados
- `docs/ai-context/` y `docs/human-context/` actualizados

### El prompt completo

```
/project-manager-automata

CONTEXTO DEL LOOP:
- Venís de completar el issue #[N] — [título]
- Commit: [hash corto del commit]
- Tests: [N] tests pasando, cobertura [X]%
- Documentación generada: human-context/issue-[N]-[slug].md
- loop_count: [X]/[N_max]

TAREA:
Determiná el próximo issue a ejecutar según el roadmap y disparalo.
Verificar estado de GitHub + roadmap.md + CLAUDE.md antes de decidir.

RESTRICCIONES:
- Solo trabajar en issues de Fase 4 (label: phase-4)
- No crear issues nuevos
- No modificar roadmap.md ni backlog.md
- Si no hay issues disponibles → STOP limpio con resumen del loop
- Si loop_count >= [N_max] → STOP con resumen del loop

MODO: autónomo.
```

---

## Por qué el contexto en el prompt importa

Comparar estos dos prompts de retorno:

**Prompt pobre** (la sesión A no sabe nada):

```
/project-manager-automata [loop_count=3/5]
```

**Prompt rico** (la sesión A tiene contexto útil):

```
/project-manager-automata

CONTEXTO DEL LOOP:
- Venís de completar el issue #81 — UI Calificaciones
- Commit: a3f8e2b
- Tests: 24 tests pasando, cobertura 87%
- loop_count: 3/5
...
```

El prompt rico reduce el tiempo de "descubrimiento" de la sesión A en el PASO 1. No tiene que inferir qué acaba de pasar — ya lo sabe. Esto es especialmente importante si el estado del proyecto tiene inconsistencias menores (CLAUDE.md levemente desactualizado).

---

## Propagación del loop_count

El counter viaja en el prompt y cada sesión lo incrementa antes de pasarlo:

```
Sesión 1 (project-manager): recibe [loop_count=0/5], dispara con [loop_count=1/5]
Sesión 2 (complete-issue):  recibe [loop_count=1/5], dispara con [loop_count=2/5]
Sesión 3 (project-manager): recibe [loop_count=2/5], dispara con [loop_count=3/5]
Sesión 4 (complete-issue):  recibe [loop_count=3/5], dispara con [loop_count=4/5]
Sesión 5 (project-manager): recibe [loop_count=4/5], dispara con [loop_count=5/5]
Sesión 6 (complete-issue):  recibe [loop_count=5/5] → límite → STOP
```

Cada sesión es responsable de:

1. Leer el loop_count del prompt de entrada
2. Incrementarlo en 1
3. Pasar el nuevo valor en el prompt de salida

---

## El log como fuente de verdad del loop

`ia-skills/automata-dev/loop-status.md` es el único lugar donde el estado del loop persiste de forma legible. Cada sesión debe actualizarlo al inicio y al final.

### Al inicio de cada sesión

```markdown
## Sesión [N] iniciada — [fecha]

- Tipo: project-manager-automata / complete-issue
- loop_count: [X/N]
- Recibido de: [sesión anterior]
```

### Al final de cada sesión (éxito)

```markdown
## Sesión [N] completada — [fecha]

- Resultado: ✅ Issue #[N] completado
- Commit: [hash]
- Próxima sesión: project-manager-automata [loop_count=[X+1]/N]
```

### Al final de cada sesión (parada)

```markdown
## Loop detenido en sesión [N] — [fecha]

- Razón: [razón específica]
- Último issue completado: #[N-1]
- Próximo pendiente: #[N+1]
- Qué hacer: [instrucción concreta para el humano]
```

---

## Siguiente paso

[05-tercera-skill.md](05-tercera-skill.md) — La skill de auditoría que interviene periódicamente en el loop.
