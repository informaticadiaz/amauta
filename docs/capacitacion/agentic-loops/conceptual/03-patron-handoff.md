# 03 — El Patrón de Handoff entre Sesiones

## Qué es un handoff

Un handoff es el traspaso de responsabilidad entre dos sesiones. La sesión A "entrega" el trabajo a la sesión B. Para que ese traspaso sea efectivo, B necesita saber:

1. **Qué hizo A** (para no repetirlo)
2. **En qué estado quedó el sistema** (para continuar desde ahí)
3. **Qué se espera que haga B** (su tarea concreta)

Como el contexto de conversación no persiste, el handoff ocurre a través de **dos canales**:

- **Estado externo**: GitHub, archivos en disco, commits, documentación
- **Prompt de inicio**: el texto que arranca la sesión B

---

## Los tres tipos de estado que persisten

### Estado en GitHub

El más confiable. Un issue abierto o cerrado es verdad objetiva verificable.

```
Sesión A cierra issue #42 → Sesión B puede verificar con `gh issue view 42`
Sesión A crea issue #43  → Sesión B lo encuentra con `gh issue list`
```

### Estado en archivos

`CLAUDE.md`, `roadmap.md`, `backlog.md` actúan como memoria compartida entre sesiones.

```
Sesión A actualiza CLAUDE.md con "F4-016 completado"
→ Sesión B lee CLAUDE.md y sabe el progreso real
```

### Estado en commits

El historial de Git es la bitácora. La sesión B puede leer `git log` para saber qué hizo la anterior.

```
git log --oneline -5
→ feat: implementar UI calificaciones (resuelve #81)
→ feat: API calificaciones por periodo (resuelve #80)
```

---

## El patrón handoff en la práctica

### Paso 1: La sesión A actualiza el estado externo

Antes de llamar `RemoteTrigger`, la sesión A debe haber dejado el estado externo coherente:

- Issue cerrado en GitHub
- `CLAUDE.md` actualizado con el progreso
- Documentación generada (`human-context/`, `ai-context/`)
- Commit hecho y pusheado

### Paso 2: La sesión A construye el prompt de handoff

El prompt debe ser autocontenido — la sesión B no puede preguntarle nada a la A.

**Estructura recomendada del prompt de handoff:**

```
[SKILL A EJECUTAR]: nombre del skill
[CONTEXTO]: qué acaba de pasar (issue completado, estado actual)
[TAREA]: qué se espera que haga esta sesión
[RESTRICCIONES]: condiciones de parada, límites
[MODO]: autónomo / requiere confirmación
```

**Ejemplo concreto:**

```
/project-manager-autonomo

Contexto: La sesión anterior completó el issue #81 (F4-016 UI Calificaciones).
El loop continúa. Revisá el estado actual del proyecto y determiná el siguiente issue.

Restricciones:
- Si no hay issues abiertos en el sprint actual → no disparés más sesiones, terminá con un resumen
- Si la sesión supera 80% de contexto → no disparés más sesiones
- Solo trabajar en issues de la Fase 4

Modo: autónomo — no esperes confirmación del usuario para disparar complete-issue
```

### Paso 3: La sesión B verifica el estado antes de actuar

La sesión B no debe confiar ciegamente en el prompt — debe **verificar el estado externo**:

```bash
gh issue list --state open --label "phase-4"    # ¿Qué hay pendiente?
gh issue list --state closed --limit 5          # ¿Qué acaba de completarse?
git log --oneline -3                            # ¿Qué commitió la sesión anterior?
```

Esto es crítico. Si la sesión A falló a mitad de camino y el prompt dice "continúa desde #82", pero el issue #81 quedó en estado inconsistente, la sesión B lo detecta aquí.

---

## El diagrama de flujo completo de un handoff

```
SESIÓN A (complete-issue #81)
├── 1. Ejecuta el issue (TDD, implementación, docs)
├── 2. Cierra el issue en GitHub
├── 3. Actualiza CLAUDE.md
├── 4. Hace commit y push
├── 5. Verifica condición de parada
│      ¿Hay más issues? SÍ
├── 6. Construye prompt de handoff
└── 7. Llama RemoteTrigger(prompt)
         │
         ▼
SESIÓN B (project-manager-autonomo)
├── 1. Lee estado de GitHub (issues abiertos/cerrados)
├── 2. Lee CLAUDE.md (progreso documentado)
├── 3. Lee roadmap.md (orden definido)
├── 4. Compara las tres fuentes (igual que PASO 0 de complete-issue)
├── 5. Determina el siguiente issue
├── 6. Verifica condiciones de parada
│      ¿Quota ok? ¿Issues disponibles? SÍ
├── 7. Construye prompt de handoff
└── 8. Llama RemoteTrigger(prompt="/complete-issue #82 autónomo")
         │
         ▼
SESIÓN C (complete-issue #82)
└── ...
```

---

## El anti-patrón: el handoff frágil

El handoff falla cuando la sesión B depende de información que **solo existía en la memoria de la sesión A**:

```
❌ MAL: "continúa desde donde estabas"
❌ MAL: "recordás lo que hablamos antes?"
❌ MAL: "el issue que dijiste que ibas a hacer"
```

Todo eso es contexto que murió con la sesión A. La sesión B es una pizarra en blanco.

```
✅ BIEN: "ejecutá el issue #82 (F4-017) verificando primero que #81 está cerrado"
✅ BIEN: "leé CLAUDE.md para saber el estado actual, luego determiná el siguiente issue"
✅ BIEN: "el roadmap dice que el siguiente es F4-017 — ejecutalo con complete-issue"
```

---

## Siguiente paso

[04-condicionales.md](04-condicionales.md) — Cómo definir las condiciones que detienen el loop.
