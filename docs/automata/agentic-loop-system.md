# Sistema de Desarrollo Autónomo — Amauta

> Documento de referencia para trabajar con Claude Code sobre el agentic loop, skills de automatización, y evolución del sistema.

---

## Índice

1. [Conceptos fundamentales](#1-conceptos-fundamentales)
2. [Arquitectura actual del sistema](#2-arquitectura-actual-del-sistema)
3. [Skills existentes](#3-skills-existentes)
4. [El runner](#4-el-runner)
5. [Jerarquía de enforcement](#5-jerarquía-de-enforcement)
6. [Problemas conocidos y gaps](#6-problemas-conocidos-y-gaps)
7. [Mejoras planificadas](#7-mejoras-planificadas)
8. [Issue Closer — diseño pendiente](#8-issue-closer--diseño-pendiente)
9. [Posibilidades futuras](#9-posibilidades-futuras)
10. [Instrucciones para Claude Code](#10-instrucciones-para-claude-code)

---

## 1. Conceptos fundamentales

### Cómo funciona un LLM en este contexto

Claude (el modelo) no recuerda entre sesiones. Lo único que existe para él es la **ventana de contexto** — un bloque de texto que recibe en cada llamada. Todo lo que no está en ese bloque, no existe para el modelo.

Implicancia directa: los archivos `.md` del sistema no son documentación — son **contexto inyectado** en cada sesión. Su calidad determina la calidad del comportamiento del agente.

### Cómo razona el modelo

El modelo predice el siguiente token basándose en todo el contexto. Cuando se le fuerza a escribir pasos intermedios antes de actuar (**Chain of Thought**), la calidad del resultado mejora significativamente. Las fases del loop no son burocracia — explotan esta propiedad del modelo.

### Agente vs LLM

- **Claude** = el modelo (el cerebro)
- **Claude Code** = el agente (el sistema completo con herramientas, loop, permisos)

El agente es el harness que envuelve al modelo y le da capacidad de actuar en el mundo real.

### Jerarquía de control

```
Hook (exit 2)     → el modelo no puede ignorarlo, es el sistema
Agente separado   → llamada independiente, contexto limpio
Skill             → entra al contexto, puede desviarse
Prompt / CLAUDE.md → sugerencia, el modelo decide
```

Cuanto más crítico es un comportamiento, más arriba en la jerarquía debe estar.

---

## 2. Arquitectura actual del sistema

### Flujo completo

```
vos escribís next-prompt.md manualmente (inicio)
        ↓
loop-runner.sh detecta el archivo
        ↓
mv next-prompt.md → next-prompt.md.running  (claim atómico)
        ↓
claude --print --dangerously-skip-permissions < prompt
        ↓
project-manager-automata
  → lee roadmap + GitHub issues
  → selecciona próximo issue válido
  → escribe next-prompt.md
        ↓
loop-runner.sh detecta
        ↓
complete-issue-automata
  → TDD (Modo A o Modo B)
  → verifica TypeScript
  → documenta
  → cierra issue
  → escribe next-prompt.md
        ↓
cada 3 issues → loop-auditor
  → tests completos API + Web
  → TypeScript backend + frontend
  → coherencia documentación IA
  → coherencia CLAUDE.md vs GitHub
  → APROBADO → continúa
  → BLOQUEADO → STOP documentado
```

### Archivos de coordinación

| Archivo                   | Rol                             | ¿Se commitea? |
| ------------------------- | ------------------------------- | ------------- |
| `next-prompt.md`          | Prompt para la próxima sesión   | NO — efímero  |
| `next-prompt.md.running`  | Claim atómico durante ejecución | NO            |
| `loop-status.md`          | Log de todas las sesiones       | SÍ            |
| `audit-report-{fecha}.md` | Reporte de cada auditoría       | SÍ            |

### Invariantes del sistema

- `loop_count` solo lo incrementa `complete-issue-automata` después de cerrar un issue con éxito
- `loop_count` nunca retrocede
- `next-prompt.md` solo se escribe si TODAS las condiciones de éxito se cumplen
- El `mv` para el claim es atómico — evita race conditions sin locks explícitos

---

## 3. Skills existentes

### `project-manager-automata`

**Rol:** Orchestrador del loop. Selecciona el próximo issue y puede crear issues desde el roadmap si no hay disponibles.

**Responsabilidades:**

- Leer estado desde tres fuentes: GitHub, roadmap.md, CLAUDE.md
- Resolver inconsistencias entre fuentes
- Evaluar condiciones de STOP antes de actuar
- Escribir `next-prompt.md` con contexto completo para `complete-issue-automata`

**Fuente de verdad:** `roadmap.md` define orden y dependencias. Lo que está en el roadmap está aprobado implícitamente.

**Condiciones de STOP:**

1. `loop_count >= N_max`
2. Fase completada (sin issues en roadmap)
3. Contexto de sesión elevado (>15 archivos o >20 comandos)

---

### `complete-issue-automata`

**Rol:** Ejecutor. Implementa un issue de GitHub de principio a fin.

**Modos de trabajo:**

- **Modo A — TDD completo:** implementación no existe → RED → GREEN
- **Modo B — Tests pendientes:** implementación existe, faltan tests → escribir tests que deben pasar

**Regla absoluta:** corregir el bug, nunca el test.

**Pasos críticos:**

1. Verificar estado del proyecto (tres fuentes)
2. Leer el issue y determinar modo
3. Cargar contexto obligatorio (schema, patterns, módulos)
4. Crear plan de trabajo
5. Escribir tests
6. Verificar estado de tests (RED en Modo A, GREEN en Modo B)
7. Implementar código mínimo
8. Verificar tests GREEN + TypeScript sin errores
9. Generar documentación (`docs/ai-context/` + `docs/human-context/`)
10. Commit
11. Actualizar CLAUDE.md
12. Cerrar issue ← **pendiente de mover a `issue-closer`**
13. Actualizar loop-status.md y escribir next-prompt.md

**Criterios para escribir next-prompt.md (TODOS deben cumplirse):**

- Tests pasan
- TypeScript compila
- Issue cerrado en GitHub
- Commit hecho
- `X + 1 <= N_max`

**Regla del loop-auditor:** cada 3 issues completados, la próxima sesión es `loop-auditor` en lugar de `project-manager-automata`.

---

### `loop-auditor`

**Rol:** Verificación de integridad del sistema cada 3 issues. Detecta problemas que los tests individuales no detectan.

**Lo que verifica:**

- Tests completos API y Web (criterio: verde/rojo, no cobertura)
- TypeScript backend y frontend
- Documentación IA actualizada para cada issue del bloque
- Coherencia CLAUDE.md vs GitHub (tolerancia: diff <= 2)

**Output:** `ia-skills/automata-dev/audit-report-{fecha}.md`

**Decisión:**

- APROBADO → escribe `next-prompt.md` para continuar
- BLOQUEADO → NO escribe `next-prompt.md`, documenta razón, loop se detiene

**Lo que NO hace:** corregir nada. Solo reporta y decide.

---

### `issue-inspector`

**Rol:** QA automatizado manual. Audita issues completados contra producción.

**Carácter:** informativo, no bloquea el loop. Lo corre el humano periódicamente.

**Lo que verifica:**

- Archivos de implementación existen
- Tests del módulo pasan con >80% cobertura
- Endpoints responden con códigos correctos en producción
- Criterios de aceptación del issue se cumplen

**Output:** `docs/audits/issue-{N}-{slug}.md`

**Estado actual:** skill separado del loop autónomo. **Mejora planificada:** integrar al `loop-auditor` y/o mover el cierre del issue a un nuevo skill `issue-closer`.

---

## 4. El runner

### `loop-runner.sh`

Script bash que hace funcionar el loop de forma autónoma.

**Mecanismo central:**

```bash
# Polling cada N segundos
if [[ -f "$NEXT_PROMPT" ]]; then
  mv "$NEXT_PROMPT" "$CLAIMED_PROMPT"  # claim atómico
  claude --print --dangerously-skip-permissions < prompt
fi
```

**Variables de entorno:**

```bash
AI_CMD="claude"                    # CLI a usar (claude, aider, etc.)
POLL_INTERVAL_SECONDS=2            # frecuencia de polling
RATE_LIMIT_RETRY_SECONDS=300       # espera ante rate limit de Claude
```

**Manejo de errores:**

- Si Claude falla → restaura `next-prompt.md` para reinspección humana
- Si detecta rate limit → restaura prompt y reintenta automáticamente en 5 minutos
- Si no puede restaurar → documenta en `loop-status.md` y termina con error

**Consideración de seguridad:** `--dangerously-skip-permissions` es necesario para autonomía total. Los guardrails de las skills son la única defensa. Los hooks son la defensa de nivel sistema.

---

## 5. Jerarquía de enforcement

### Hooks (máximo control)

Los hooks en `.claude/settings.json` son el único mecanismo que bloquea de forma incondicional. `exit 2` no puede ser ignorado por el modelo.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo $CLAUDE_TOOL_INPUT | grep -q '\\.env' && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

**Hooks recomendados para este sistema:**

- Bloquear modificación de `.env`
- Bloquear modificación de `roadmap.md`, `backlog.md`, `sprints.md`
- Ejecutar `tsc --noEmit` automáticamente después de cada edición de código
- Loggear todas las tool calls para observabilidad

### Skills (contexto inyectado)

Patterns curados que entran al contexto. El modelo los lee y sigue, pero puede desviarse. Efectivos para convenciones de código, patrones de arquitectura, criterios de testing.

### CLAUDE.md (sugerencia persistente)

Entra al contexto en cada sesión. El modelo puede ignorarlo. Útil para estado del proyecto, próximos pasos, convenciones generales.

---

## 6. Problemas conocidos y gaps

### Gap 1 — Integración UI no verificada

**Problema:** `complete-issue-automata` verifica que las piezas funcionan por separado pero no que el flujo de usuario completo funciona.

**Ejemplo real:** funcionalidades administrativas (asistencia, etc.) implementadas en backend pero no integradas visiblemente en la UI.

**Causa:** el agente optimiza para cerrar el issue, no para integrar la feature desde la perspectiva del usuario.

**Solución planificada:** `issue-closer` con tests E2E Playwright en modo DOM (sin screenshots).

---

### Gap 2 — Evidencia de fallos poco específica

**Problema:** cuando el `loop-auditor` bloquea, el reporte dice "N tests fallaron" pero no identifica cuál de los 3 issues del bloque introdujo el problema.

**Impacto:** el humano debe investigar manualmente para localizar la causa.

**Solución posible:** correr tests por módulo separado para cada issue del bloque antes del test suite completo.

---

### Gap 3 — issue-inspector fuera del loop

**Problema:** la verificación contra producción y los criterios de aceptación del issue solo ocurren cuando el humano corre `/issue-inspector` manualmente.

**Solución planificada:** mover el cierre del issue a `issue-closer` que incluye verificación E2E antes de cerrar.

---

### Gap 4 — Sin cobertura E2E de flujos de usuario

**Problema:** los tests unitarios verifican lógica de negocio pero no flujos completos de usuario (educador crea lección → estudiante la ve).

**Solución planificada:** Playwright en modo DOM dentro de `issue-closer`.

---

## 7. Mejoras planificadas

### Prioridad alta

#### A — Nuevo skill: `issue-closer`

Separar el cierre del issue de la implementación. `complete-issue-automata` implementa y escribe `next-prompt.md` para `issue-closer`. `issue-closer` verifica E2E y solo entonces cierra el issue.

Ver sección 8 para diseño detallado.

---

#### B — Integrar `issue-inspector` al `loop-auditor`

Dentro de la auditoría cada 3 issues, correr `issue-inspector` sobre los 3 issues del bloque antes de decidir CONTINUAR.

**Prerequisito:** confirmar que el deploy a producción es automático y ocurre antes de la auditoría. Si no, separar la verificación de producción de la verificación de código.

---

#### C — Hooks de enforcement

Agregar hooks en `.claude/settings.json` para:

- Bloquear modificación de archivos de planificación
- TypeScript check automático post-edición
- Log de observabilidad

---

### Prioridad media

#### D — Issue inspector en loop-auditor (producción)

Si el deploy es automático, agregar smoke tests de producción al `loop-auditor` para detectar regresiones en endpoints existentes.

---

#### E — Localización de fallos en auditoría

Modificar `loop-auditor` para correr tests por módulo separado e identificar qué issue del bloque introdujo cada fallo.

---

#### F — Integration issues en el roadmap

Definir un tipo de issue específico para verificar flujos completos de usuario — no implementan código nuevo, verifican que las piezas se integran correctamente.

---

## 8. Issue Closer — diseño pendiente

### Propósito

Separar la responsabilidad de cerrar el issue de la responsabilidad de implementarlo. El cierre queda condicionado a que el flujo de usuario funciona, no solo a que los tests unitarios pasan.

### Flujo

```
complete-issue-automata (implementa, NO cierra)
        ↓
escribe next-prompt.md para issue-closer
        ↓
issue-closer
  → lee el issue
  → extrae flujos de usuario del checklist
  → genera tests E2E en modo DOM
  → corre Playwright sin screenshots
  → APROBADO → cierra issue → next-prompt.md para project-manager
  → RECHAZADO → STOP con evidencia de qué falló y por qué
```

### Tests E2E en modo DOM (sin screenshots)

```typescript
// Barato — trabaja con DOM y texto, sin imágenes
await page.goto('/dashboard/lecciones/nueva');
await page.selectOption('[name="tipoLeccion"]', 'TEXTO');
expect(await page.isVisible('.wysiwyg-editor')).toBe(true);

await page.fill('.wysiwyg-editor', '**texto en negrita**');
await page.click('[data-testid="guardar"]');

await page.goto('/cursos/1/lecciones/1');
expect(await page.isVisible('strong')).toBe(true);
```

### Decisiones de diseño pendientes

1. **¿Tests generados en el momento o reutilizados?**
   - Generados en el momento: más flexible, el agente los escribe según el issue
   - Reutilizados: más estables, se commitean junto con la implementación

2. **¿Usuarios de prueba con credenciales fijas?**
   - Necesario para tests E2E que requieren autenticación
   - Confirmar que existen en el ambiente donde corre el loop

3. **¿Qué pasa si el deploy no ocurrió?**
   - Definir si `issue-closer` verifica contra localhost o contra producción
   - Si es producción, necesita saber que el deploy terminó

### Estructura del archivo

```
.agents/skills/issue-closer/SKILL.md
```

---

## 9. Posibilidades futuras

### Multi-agente real

El sistema actual es secuencial — un agente a la vez. La arquitectura de Claude Code permite instancias paralelas con contextos separados. Posibilidades:

- Correr `complete-issue-automata` en paralelo para issues sin dependencias
- Agente de exploración separado del agente de implementación
- Reviewer con contexto completamente limpio (no vio la implementación)

### Memoria persistente (Engram)

Actualmente cada sesión empieza sin memoria de las anteriores. `loop-status.md` es un proxy rudimentario. Engram (del stack de Buscaglia) provee memoria persistente con búsqueda — el agente puede recordar decisiones de arquitectura de sesiones anteriores.

### SDD como gate de planificación

Antes de que `project-manager-automata` seleccione un issue, un agente de planificación podría verificar que el issue tiene spec suficiente para ser implementado sin ambigüedad. Issues ambiguos → STOP antes de implementar.

### Observabilidad del loop

Actualmente la única observabilidad es `loop-status.md`. Posibilidades:

- Dashboard simple que lea el estado del loop en tiempo real
- Notificaciones cuando el loop se detiene (webhook, email, etc.)
- Métricas: issues por sesión, tasa de STOP, tiempo promedio por issue

---

## 10. Instrucciones para Claude Code

Cuando trabajés sobre este sistema con Claude Code, estas son las reglas:

### Lo que podés modificar

- Cualquier skill en `.agents/skills/`
- `loop-runner.sh`
- `.claude/settings.json` (hooks)
- `CLAUDE.md`

### Lo que NO podés modificar

- `docs/project-management/roadmap.md`
- `docs/project-management/backlog.md`
- `docs/project-management/sprints.md`

### Cómo iterar sobre una skill existente

1. Leer la skill completa antes de proponer cambios
2. Identificar el gap o problema específico a resolver
3. Proponer el cambio mínimo que resuelve el problema
4. No modificar la jerarquía de responsabilidades entre skills
5. Mantener los invariantes del sistema (loop_count, next-prompt.md efímero, etc.)

### Cómo crear una skill nueva

1. Definir responsabilidad única — ¿qué hace y qué NO hace?
2. Definir cómo recibe input (next-prompt.md, activación manual)
3. Definir cómo pasa el control (next-prompt.md para próxima sesión o STOP)
4. Definir condiciones de STOP explícitas
5. Definir qué archivos puede y no puede modificar

### Tarea pendiente prioritaria

Diseñar e implementar `issue-closer` según el diseño en la sección 8. Requiere responder primero:

- ¿Tests E2E generados en el momento o reutilizados?
- ¿Credenciales de usuarios de prueba disponibles en el ambiente del loop?
- ¿`issue-closer` verifica contra localhost o producción?

---

_Documento generado a partir de la sesión de diseño del sistema. Actualizar al iterar sobre cada componente._
