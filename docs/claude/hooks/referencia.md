# Hooks en Claude Code

Los hooks son scripts o handlers que se ejecutan automáticamente en puntos específicos del ciclo de vida de Claude Code. Permiten automatizar acciones, aplicar reglas de seguridad y personalizar el comportamiento del agente de forma determinista.

> **Diferencia clave**: los hooks son reglas que *siempre* se ejecutan, a diferencia de los skills que Claude puede decidir usar o no.

---

## Tipos de Eventos

### Sesión

| Evento | Cuándo se dispara |
|--------|------------------|
| `SessionStart` | Al iniciar o retomar una sesión |
| `SessionEnd` | Al terminar la sesión |
| `InstructionsLoaded` | Al cargar CLAUDE.md o archivos de reglas |

### Entrada del usuario

| Evento | Cuándo se dispara |
|--------|------------------|
| `UserPromptSubmit` | Antes de que Claude procese el mensaje del usuario |
| `ConfigChange` | Cuando un archivo de configuración cambia durante la sesión |

### Herramientas (los más usados)

| Evento | Cuándo se dispara | ¿Bloquea? |
|--------|------------------|-----------|
| `PreToolUse` | Antes de ejecutar una herramienta | Sí |
| `PostToolUse` | Después de que la herramienta termina | No |
| `PostToolUseFailure` | Cuando la herramienta falla | No |
| `PermissionRequest` | Cuando aparece un diálogo de permisos | Sí |

### Control de flujo

| Evento | Cuándo se dispara | ¿Bloquea? |
|--------|------------------|-----------|
| `Stop` | Cuando Claude termina de responder | Sí |
| `TaskCompleted` | Cuando una tarea se marca como completada | Sí |
| `SubagentStart` / `SubagentStop` | Al iniciar/terminar un subagente | No |

### Contexto

| Evento | Cuándo se dispara |
|--------|------------------|
| `PreCompact` / `PostCompact` | Antes/después de compactar el contexto |
| `Notification` | Cuando el sistema envía una notificación |

---

## Tipos de Handlers

| Tipo | Descripción | Ideal para |
|------|-------------|------------|
| `command` | Script bash que recibe JSON por stdin | Validaciones, logging, formateo |
| `http` | POST a un endpoint externo | Servicios remotos, webhooks |
| `prompt` | Llamada a Claude Haiku para tomar decisiones | Decisiones con razonamiento |
| `agent` | Subagente con acceso completo a herramientas | Verificaciones complejas |

---

## Dónde Configurar los Hooks

```
~/.claude/settings.json              ← Global (todos los proyectos)
.claude/settings.json                ← Proyecto (se puede commitear)
.claude/settings.local.json          ← Proyecto local (en .gitignore)
```

---

## Estructura de Configuración

```json
{
  "hooks": {
    "EVENTO": [
      {
        "matcher": "patron_regex_opcional",
        "hooks": [
          {
            "type": "command",
            "command": "ruta/al/script.sh",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### Campos disponibles

**Handler `command`**:
```json
{
  "type": "command",
  "command": "script.sh",
  "async": false,
  "timeout": 60,
  "statusMessage": "Validando..."
}
```

**Handler `http`**:
```json
{
  "type": "http",
  "url": "https://mi-servicio.com/hook",
  "headers": { "Authorization": "Bearer $TOKEN" },
  "allowedEnvVars": ["TOKEN"],
  "timeout": 10
}
```

**Handler `prompt`**:
```json
{
  "type": "prompt",
  "prompt": "Evalúa si esta acción es segura: $ARGUMENTS",
  "model": "claude-haiku"
}
```

---

## Matchers (Filtros)

Los matchers son expresiones regulares que filtran cuándo se dispara el hook:

| Evento | Matchea contra | Ejemplos |
|--------|---------------|---------|
| `PreToolUse`, `PostToolUse` | Nombre de la herramienta | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | Cómo inició la sesión | `startup`, `resume`, `compact` |
| `Notification` | Tipo de notificación | `permission_prompt`, `idle_prompt` |

> Los nombres de herramientas son case-sensitive: `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`.

---

## Códigos de Salida (Exit Codes)

| Código | Significado | Efecto |
|--------|-------------|--------|
| `0` | Éxito | La acción continúa. stdout se agrega al contexto (solo `SessionStart`/`UserPromptSubmit`) |
| `2` | Error bloqueante | La acción es bloqueada. stderr se envía como feedback a Claude |
| Otros | Error no bloqueante | La acción continúa. stderr se loguea pero Claude no lo ve |

---

## Variables de Entorno Disponibles

| Variable | Disponible en | Descripción |
|----------|---------------|-------------|
| `CLAUDE_PROJECT_DIR` | Todos | Ruta raíz del proyecto |
| `CLAUDE_ENV_FILE` | `SessionStart` | Ruta donde escribir variables de entorno |
| `CLAUDE_CODE_REMOTE` | Todos | `"true"` si es web, vacío si es CLI |

---

## Ejemplos Prácticos

### 1. Bloquear comandos destructivos

```bash
#!/bin/bash
# .claude/hooks/bloquear-destructivos.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -qE '(rm -rf|DROP TABLE|DELETE FROM)'; then
  echo "Bloqueado: comando destructivo detectado" >&2
  exit 2
fi

exit 0
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/bloquear-destructivos.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Proteger archivos sensibles

```bash
#!/bin/bash
# .claude/hooks/proteger-archivos.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTEGIDOS=(".env" "schema.prisma" "package-lock.json")

for patron in "${PROTEGIDOS[@]}"; do
  if [[ "$FILE" == *"$patron"* ]]; then
    echo "No se puede modificar: $FILE está protegido" >&2
    exit 2
  fi
done

exit 0
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/proteger-archivos.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Formatear código automáticamente después de editar

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r .tool_input.file_path); if [[ $FILE =~ \\.(ts|tsx|js|json)$ ]]; then npx prettier --write \"$FILE\" 2>/dev/null; fi'"
          }
        ]
      }
    ]
  }
}
```

---

### 4. Loguear todos los comandos bash ejecutados

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $(jq -r .tool_input.command)\" >> ~/.claude/command-log.txt'",
            "async": true
          }
        ]
      }
    ]
  }
}
```

---

### 5. Notificación cuando Claude necesita atención

**Windows (PowerShell)**:
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Claude necesita tu atención', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

**Linux**:
```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude necesita tu atención'"
          }
        ]
      }
    ]
  }
}
```

---

### 6. Re-inyectar contexto después de compactar

```bash
#!/bin/bash
# .claude/hooks/contexto-post-compact.sh

echo "=== Recordatorio de contexto ==="
echo "• Stack: Next.js + NestJS + Prisma"
echo "• DB: en producción (VPS), NO local"
echo "• SIEMPRE usar safeParse con Zod"
echo "• Soft delete: usar estado ARCHIVADO, nunca delete()"

exit 0
```

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/contexto-post-compact.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Prevenir Bucles Infinitos en Stop Hooks

Si usás un hook en el evento `Stop` que puede bloquear a Claude, verificá el campo `stop_hook_active`:

```bash
#!/bin/bash
INPUT=$(cat)

# Si ya hay un stop hook activo, permitir que Claude termine
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# ... tu lógica de verificación
```

---

## Comandos Útiles

```bash
# Ver todos los hooks configurados
/hooks

# Activar modo verbose para ver output de hooks
Ctrl+O

# Verificar configuración de hooks
cat .claude/settings.json | jq '.hooks'

# Probar un hook manualmente
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./mi-hook.sh
echo $?  # Ver exit code

# Dar permisos de ejecución (Linux/macOS)
chmod +x .claude/hooks/mi-script.sh
```

---

## Buenas Prácticas

1. **Mantener los hooks rápidos** — especialmente los de `SessionStart` y `PreToolUse`
2. **Usar matchers específicos** — no aplicar hooks a todos los eventos si no es necesario
3. **Usar `async: true` para logging** — no bloquear a Claude por tareas de auditoría
4. **Verificar `stop_hook_active`** — para evitar bucles infinitos en hooks de `Stop`
5. **Testear scripts localmente** — pipear JSON de prueba antes de activar
6. **Commitear `.claude/settings.json`** — para compartir hooks con el equipo; gitignorear `.local.json`
7. **Usar `$CLAUDE_PROJECT_DIR`** — para referenciar rutas relativas al proyecto

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Hook no se dispara | El matcher no coincide | Verificar con `/hooks`, respetar case-sensitive |
| "command not found" | Ruta incorrecta | Usar `$CLAUDE_PROJECT_DIR` o rutas absolutas |
| "jq: command not found" | jq no instalado | `winget install jqlang.jq` (Windows) / `brew install jq` (Mac) |
| "JSON validation failed" | El shell imprime texto en startup | Envolver echo en `if [[ $- == *i* ]]; then ... fi` |
| Script no ejecuta | Sin permisos | `chmod +x .claude/hooks/script.sh` |

---

> Para el índice completo de documentación de Claude Code, ver [indice.md](indice.md).
