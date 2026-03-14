# Hooks y Subagentes en Claude Code

Guía sobre cómo los hooks interactúan con los subagentes y cómo usar esta combinación para crear flujos de trabajo robustos.

---

## ¿Qué es un Subagente?

Un subagente es una instancia de Claude lanzada por el agente principal para ejecutar una tarea específica. Tiene acceso a herramientas (Read, Bash, Grep, etc.) y puede razonar de forma independiente, pero no puede lanzar otros subagentes.

```
Agente Principal
    └── Subagente A (Explore)
    └── Subagente B (Plan)
    └── Subagente C (custom: code-reviewer)
```

---

## Ciclo de Vida Completo

```
SessionStart
    │
    ▼
UserPromptSubmit
    │
    ▼
[Bucle de herramientas del agente principal]
    │   PreToolUse → Tool → PostToolUse
    │
    ▼
SubagentStart ─────────────────────────┐
    │                                  │
    ▼                                  │
[Bucle de herramientas del subagente]  │
    │   PreToolUse → Tool → PostToolUse│
    │                                  │
    ▼                                  │
SubagentStop ──────────────────────────┘
    │
    ▼
Stop
    │
    ▼
SessionEnd
```

---

## Eventos de Subagentes

### `SubagentStart`

Se dispara justo antes de que el subagente ejecute su primera herramienta.

**Datos disponibles en el hook:**
```json
{
  "hook_event_name": "SubagentStart",
  "session_id": "abc123",
  "agent_id": "subagent-xyz",
  "agent_type": "Explore",
  "cwd": "/ruta/proyecto"
}
```

**Capacidades:**
- Inyectar contexto adicional al subagente (via stdout)
- No puede bloquear la creación del subagente
- Útil para preparar el entorno o loguear el inicio

**Matcher:** filtra por tipo de agente (`Explore`, `Plan`, `Bash`, o nombre del agente custom)

---

### `SubagentStop`

Se dispara cuando el subagente termina de responder.

**Datos disponibles:**
```json
{
  "hook_event_name": "SubagentStop",
  "session_id": "abc123",
  "agent_id": "subagent-xyz",
  "agent_type": "Explore",
  "last_assistant_message": "Encontré los siguientes archivos...",
  "agent_transcript_path": "/ruta/transcript-subagente.jsonl",
  "stop_hook_active": false
}
```

**Capacidades:**
- **Puede bloquear** que el subagente termine (exit code 2)
- Acceso al transcript completo del subagente
- Útil para verificar que el subagente completó su tarea correctamente

---

### Hooks de herramientas dentro de subagentes

Los hooks `PreToolUse` y `PostToolUse` definidos en `.claude/settings.json` se disparan **tanto para el agente principal como para los subagentes**. Cada evento incluye los campos `agent_id` y `agent_type` para identificar si viene de un subagente.

```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" },
  "agent_id": "subagent-xyz",
  "agent_type": "Explore"
}
```

Para hooks específicos de un subagente custom, se definen en el frontmatter del agente:

```yaml
---
name: db-reader
description: Consultas de solo lectura a la base de datos
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: ".claude/hooks/solo-lectura.sh"
---
```

---

## Hook de Tipo `agent` (Subagente como Hook)

El tipo de hook más poderoso: lanza un subagente con acceso completo a herramientas para verificar condiciones complejas.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verificá que todos los tests pasen. Ejecutá el suite de tests y reportá resultados.",
            "timeout": 120,
            "model": "claude-sonnet-4-6"
          }
        ]
      }
    ]
  }
}
```

**Cómo funciona:**
1. Claude termina de responder → se dispara `Stop`
2. Se lanza un subagente verificador con las herramientas disponibles
3. El subagente ejecuta tests, lee archivos, analiza el resultado
4. Devuelve `{"ok": true}` o `{"ok": false, "reason": "..."}`
5. Si `ok: false`, Claude recibe el `reason` como nueva instrucción y continúa trabajando

**Diferencia con `command` y `prompt`:**

| Tipo | Herramientas | Turnos | Velocidad | Ideal para |
|------|-------------|--------|-----------|------------|
| `command` | No (solo bash) | 1 | Rápido | Validación simple |
| `prompt` | No | 1 | Medio | Decisiones con razonamiento |
| `agent` | Sí (Read, Bash, Grep...) | Hasta 50 | Lento | Verificación compleja |

---

## Patrones de Interacción

### Patrón 1: Gate de calidad antes de detenerse

El subagente verifica la calidad antes de que Claude dé por terminada la tarea.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verificá la calidad del trabajo:\n1. ¿Pasan todos los tests? Ejecutá: npm test\n2. ¿Hay errores de linting? Ejecutá: npm run lint\n3. ¿Se actualizó la documentación relevante?\n\nSi todo está bien: {\"ok\": true}\nSi algo falla: {\"ok\": false, \"reason\": \"descripción del problema\"}",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

---

### Patrón 2: Contexto específico por tipo de subagente

Inyectar información relevante según qué tipo de subagente se inicia.

```bash
#!/bin/bash
# .claude/hooks/contexto-subagente.sh

INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')

case "$AGENT_TYPE" in
  Explore)
    echo "CONTEXTO: Este proyecto usa Next.js App Router. Los componentes están en apps/web/src/app/"
    echo "CONTEXTO: El backend NestJS está en apps/api/src/"
    ;;
  Plan)
    echo "CONTEXTO: Siempre verificar el schema de Prisma antes de planificar cambios a la DB"
    echo "CONTEXTO: La DB está en producción (VPS), no hay DB local"
    ;;
esac

exit 0
```

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/contexto-subagente.sh"
          }
        ]
      }
    ]
  }
}
```

---

### Patrón 3: Verificación del resultado del subagente

Analizar el transcript del subagente para detectar errores o trabajo incompleto.

```bash
#!/bin/bash
# .claude/hooks/verificar-subagente.sh

INPUT=$(cat)
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.agent_transcript_path // empty')

# Detectar si el subagente encontró errores
if echo "$LAST_MSG" | grep -iE "(error|failed|exception|no pudo)" > /dev/null; then
  cat <<EOF >&2
El subagente '$AGENT_TYPE' reportó errores.
Último mensaje: $LAST_MSG

Revisá el transcript completo en: $TRANSCRIPT
EOF
  # Bloquear que el subagente termine para que el agente principal lo sepa
  exit 2
fi

exit 0
```

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "Explore|Plan",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/verificar-subagente.sh"
          }
        ]
      }
    ]
  }
}
```

---

### Patrón 4: Restricciones específicas por subagente

Aplicar reglas más estrictas cuando un subagente ejecuta comandos, sin afectar al agente principal.

```bash
#!/bin/bash
# .claude/hooks/restricciones-subagente.sh

INPUT=$(cat)
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Solo aplica si viene de un subagente
if [ -z "$AGENT_ID" ]; then
  exit 0
fi

# Los subagentes no pueden hacer git push
if echo "$COMMAND" | grep -E "^git push" > /dev/null; then
  echo "Los subagentes no pueden hacer git push. Solo el agente principal puede." >&2
  exit 2
fi

# Los subagentes no pueden instalar dependencias
if echo "$COMMAND" | grep -E "^(npm install|yarn add|pip install)" > /dev/null; then
  echo "Los subagentes no pueden instalar dependencias." >&2
  exit 2
fi

exit 0
```

---

## Prevenir Bucles Infinitos

Cuando un `Stop` hook bloquea a Claude, él vuelve a trabajar y eventualmente vuelve a intentar detenerse. El campo `stop_hook_active` indica que ya hay un stop hook en ejecución:

```bash
#!/bin/bash
INPUT=$(cat)

# Si ya hay un stop hook activo, permitir que Claude termine
# (evita bucle infinito)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Tu lógica de verificación aquí
# ...

exit 0
```

---

## Leer el Transcript del Subagente

El campo `agent_transcript_path` apunta a un archivo JSONL con todas las interacciones del subagente:

```bash
#!/bin/bash
INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.agent_transcript_path // empty')

if [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

# Contar cuántas herramientas usó el subagente
TOOL_COUNT=$(grep -c '"type":"tool_use"' "$TRANSCRIPT" 2>/dev/null || echo 0)

# Extraer comandos bash ejecutados
BASH_COMMANDS=$(grep '"tool_name":"Bash"' "$TRANSCRIPT" | jq -r '.tool_input.command' 2>/dev/null)

echo "El subagente usó $TOOL_COUNT herramientas" >&2
echo "Comandos ejecutados: $BASH_COMMANDS" >&2

exit 0
```

---

## Tabla de Referencia Rápida

| Evento | ¿Bloquea? | ¿Tiene transcript? | Matcher disponible |
|--------|-----------|-------------------|-------------------|
| `SubagentStart` | No | No | Tipo de agente |
| `SubagentStop` | Sí | Sí (`agent_transcript_path`) | Tipo de agente |
| `PreToolUse` (en subagente) | Sí | No | Nombre de herramienta |
| `PostToolUse` (en subagente) | No | No | Nombre de herramienta |

---

> Para casos prácticos completos, ver [hooks-casos-practicos.md](hooks-casos-practicos.md).
> Para referencia general de hooks, ver [hooks.md](hooks.md).
