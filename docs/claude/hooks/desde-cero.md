# Hooks desde Cero: La Guía que Necesitabas

Si venís de leer sobre hooks y seguís confundido, este documento es para vos.
Empezamos desde el principio.

---

## El problema que resuelven los hooks

Cuando trabajás con Claude, tenés dos formas de decirle cómo comportarse:

### Opción A: Instrucciones en CLAUDE.md (lo que probablemente ya hacés)

```markdown
# CLAUDE.md

- Nunca uses rm -rf
- Siempre usá safeParse con Zod
- No hardcodees API keys
```

Claude lee esto y **lo intenta respetar**. El problema: es la IA quien decide cumplirlo.
Si el contexto se compacta, si el prompt lo distrae, si cometés un error al pedirle algo...
**puede ignorarlo**.

### Opción B: Hooks (lo que vamos a aprender)

Un hook es un **script bash real** que el sistema ejecuta automáticamente.
Claude no lo lee. No lo interpreta. No puede ignorarlo.
El sistema operativo lo ejecuta antes de que Claude pueda hacer nada.

```
Vos le pedís a Claude: "eliminá la carpeta temp"
Claude intenta ejecutar: rm -rf ./temp
Sistema llama al hook: ¿está permitido?
Hook dice: NO → Claude nunca llega a ejecutarlo
```

---

## ¿Qué es un hook exactamente?

Es un archivo `.sh` (script bash) ubicado en tu proyecto, registrado en un archivo de configuración JSON. Eso es todo.

```
tu-proyecto/
├── .claude/
│   ├── settings.json       ← acá registrás los hooks
│   └── hooks/
│       └── mi-hook.sh      ← acá va el script
```

---

## Cómo funciona por dentro

Cada vez que Claude quiere usar una herramienta (ejecutar bash, editar un archivo, leer algo), el sistema:

1. Intercepta la acción **antes** de ejecutarla
2. Llama a tu script y le pasa información en formato JSON
3. Tu script responde con un código de salida:
   - `exit 0` → **permitido**, Claude continúa
   - `exit 2` → **bloqueado**, Claude recibe tu mensaje de error

```
Claude → [intenta hacer algo] → tu script → exit 0 (OK) o exit 2 (BLOQUEADO)
```

---

## Tu primer hook: paso a paso

### Lo que queremos lograr

Que Claude nunca pueda ejecutar `rm -rf`, sin importar lo que vos le pidas.

### Paso 1: Crear la carpeta de hooks

```bash
mkdir -p .claude/hooks
```

### Paso 2: Escribir el script

Creá el archivo `.claude/hooks/bloquear-rm.sh`:

```bash
#!/bin/bash

# El sistema nos pasa un JSON con información de lo que Claude quiere hacer
INPUT=$(cat)

# Extraemos el comando que Claude quiere ejecutar
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Si el comando contiene "rm -rf", lo bloqueamos
if echo "$COMMAND" | grep -q "rm -rf"; then
  echo "Bloqueado: rm -rf no está permitido en este proyecto." >&2
  exit 2
fi

# Si llegamos acá, está permitido
exit 0
```

### Paso 3: Dar permisos de ejecución (Linux/macOS)

```bash
chmod +x .claude/hooks/bloquear-rm.sh
```

> En Windows con WSL o Git Bash, el mismo comando funciona.

### Paso 4: Registrar el hook en la configuración

Creá o editá `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/bloquear-rm.sh"
          }
        ]
      }
    ]
  }
}
```

### Paso 5: Reiniciar Claude Code

Los hooks se cargan al iniciar la sesión. Cerrá y volvé a abrir Claude Code.

### Paso 6: Probar

Pedile a Claude: _"ejecutá rm -rf ./temp"_

Claude va a intentarlo, el hook lo va a interceptar, y vas a ver:

```
Bloqueado: rm -rf no está permitido en este proyecto.
```

Claude recibirá ese mensaje y no podrá continuar con esa acción.

---

## ¿Qué información recibe el hook?

El sistema le pasa un JSON al script. Podés ver qué trae según la herramienta:

### Cuando Claude ejecuta un comando bash

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf ./temp"
  },
  "session_id": "abc123",
  "cwd": "/ruta/del/proyecto"
}
```

### Cuando Claude edita o crea un archivo

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/ruta/del/archivo.ts",
    "old_string": "...",
    "new_string": "..."
  },
  "session_id": "abc123",
  "cwd": "/ruta/del/proyecto"
}
```

### Cuando Claude crea un archivo nuevo

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/ruta/del/archivo.ts",
    "content": "contenido del archivo..."
  },
  "session_id": "abc123",
  "cwd": "/ruta/del/proyecto"
}
```

Para extraer cualquiera de estos campos en tu script:

```bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content')
```

> `jq` es una herramienta para procesar JSON en bash. Si no la tenés:
>
> - Windows: `winget install jqlang.jq`
> - macOS: `brew install jq`
> - Linux: `apt-get install jq`

---

## Los tres momentos en que podés intervenir

```
PreToolUse   →   [herramienta se ejecuta]   →   PostToolUse
    ↑                                                ↑
podés BLOQUEAR                              podés REACCIONAR
(antes)                                     (después, no bloquea)
```

| Evento         | Cuándo                | ¿Puede bloquear? | Uso típico         |
| -------------- | --------------------- | ---------------- | ------------------ |
| `PreToolUse`   | Antes de ejecutar     | Sí               | Validar, bloquear  |
| `PostToolUse`  | Después de ejecutar   | No               | Formatear, loguear |
| `SessionStart` | Al iniciar sesión     | No               | Inyectar contexto  |
| `Stop`         | Cuando Claude termina | Sí               | Verificar calidad  |

---

## El matcher: a qué herramienta aplica el hook

No todos los hooks necesitan aplicar a todo. El `matcher` filtra por herramienta:

```json
"matcher": "Bash"      ← solo cuando Claude ejecuta comandos
"matcher": "Edit"      ← solo cuando Claude edita archivos
"matcher": "Write"     ← solo cuando Claude crea archivos
"matcher": "Edit|Write" ← cuando edita O crea archivos
```

Si no ponés matcher (o ponés `""`), el hook aplica a todas las herramientas.

---

## ¿Dónde va el settings.json?

Tenés dos opciones:

| Archivo                   | Alcance             | Se commitea                  |
| ------------------------- | ------------------- | ---------------------------- |
| `.claude/settings.json`   | Solo este proyecto  | Sí, compartido con el equipo |
| `~/.claude/settings.json` | Todos tus proyectos | No, solo tu máquina          |

Para reglas del proyecto (proteger archivos, validar schema) → `.claude/settings.json`
Para preferencias personales (notificaciones, logging) → `~/.claude/settings.json`

---

## Testear un hook sin abrir Claude

Podés simular la llamada del sistema desde la terminal:

```bash
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf ./temp" },
  "session_id": "test",
  "cwd": "/tu/proyecto"
}' | .claude/hooks/bloquear-rm.sh

echo "Exit code: $?"
```

Si ves el mensaje de error y el exit code es 2, el hook funciona correctamente.

---

## Hooks vs. CLAUDE.md: cuándo usar cada uno

| Situación                                                 | Usá       |
| --------------------------------------------------------- | --------- |
| "Quiero que Claude sepa el contexto del proyecto"         | CLAUDE.md |
| "Quiero que Claude siga un estilo de código"              | CLAUDE.md |
| "Quiero que Claude entienda la arquitectura"              | CLAUDE.md |
| "Quiero que **nunca** pueda hacer X, sin excepción"       | Hook      |
| "Quiero que **siempre** se formatee el código al guardar" | Hook      |
| "Quiero que **siempre** se valide el schema de Prisma"    | Hook      |
| "Quiero que **nunca** se commitee directamente en main"   | Hook      |

**Regla simple:**

- Si es conocimiento o contexto → CLAUDE.md
- Si es una regla que no puede romperse → Hook

---

## Los hooks se cargan solos

Una vez que configuraste `.claude/settings.json`, cada sesión nueva carga los hooks automáticamente. No tenés que hacer nada. No tenés que recordar activarlos. Siempre están ahí.

---

## Verificar que tus hooks están activos

Dentro de Claude Code, escribí:

```
/hooks
```

Te muestra todos los hooks registrados en la sesión actual.

---

## Próximos pasos

Una vez que entendés el mecanismo, podés ver casos prácticos listos para usar:

- [hooks-casos-practicos.md](hooks-casos-practicos.md) — Scripts para problemas reales del proyecto
- [hooks-subagentes.md](hooks-subagentes.md) — Hooks que verifican el trabajo de subagentes
- [hooks.md](hooks.md) — Referencia completa de todos los eventos disponibles
