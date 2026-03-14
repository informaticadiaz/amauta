# Hooks del Proyecto Amauta

Documentación de los hooks configurados en el proyecto.
Los hooks son scripts bash que Claude Code ejecuta automáticamente antes o después de cada acción.

---

## ¿Dónde viven los archivos?

```
amauta/
└── .claude/
    ├── settings.json          ← registra qué hooks existen y cuándo se disparan
    └── hooks/
        ├── contexto-sesion.sh
        ├── bloquear-destructivos.sh
        ├── advertir-prisma.sh
        ├── proteger-archivos.sh
        ├── detectar-secretos.sh
        └── validar-schema-prisma.sh
```

> `.claude/settings.json` se commitea al repositorio (aplica para todo el equipo).
> `.claude/settings.local.json` es personal y está en `.gitignore`.

---

## Hooks Activos

| Hook | Evento | Herramienta | Efecto |
|------|--------|-------------|--------|
| [contexto-sesion](implementados/contexto-sesion.md) | `SessionStart` | — | Inyecta contexto del proyecto al iniciar sesión |
| [bloquear-destructivos](implementados/bloquear-destructivos.md) | `PreToolUse` | Bash | Bloquea comandos irreversibles |
| [advertir-prisma](implementados/advertir-prisma.md) | `PreToolUse` | Bash | Controla operaciones de migración |
| [proteger-archivos](implementados/proteger-archivos.md) | `PreToolUse` | Edit / Write | Bloquea edición de archivos críticos |
| [detectar-secretos](implementados/detectar-secretos.md) | `PreToolUse` | Edit / Write | Bloquea secretos hardcodeados |
| [validar-schema-prisma](implementados/validar-schema-prisma.md) | `PostToolUse` | Edit / Write | Valida el schema.prisma al guardarlo |

---

## Cómo Funcionan

```
Claude intenta hacer algo
        │
        ▼
PreToolUse → tu script recibe el JSON → exit 0 (OK) o exit 2 (BLOQUEADO)
        │
        ▼
La herramienta se ejecuta
        │
        ▼
PostToolUse → tu script reacciona (no puede bloquear)
```

Cada script recibe un JSON por `stdin` con información sobre la acción que Claude quiere ejecutar. El script responde con un código de salida:

- `exit 0` → permitido, Claude continúa
- `exit 2` → bloqueado, Claude recibe el mensaje de `stderr` como error

---

## Activar y Verificar

Los hooks se cargan automáticamente al iniciar Claude Code.
Para verificar que están activos, escribí dentro de Claude Code:

```
/hooks
```

Para recargarlos después de un cambio, reiniciá la sesión o usá `/clear`.

---

## Agregar un Hook Nuevo

1. Creá el script en `.claude/hooks/mi-hook.sh`
2. Dále permisos: `chmod +x .claude/hooks/mi-hook.sh`
3. Registralo en `.claude/settings.json`
4. Documentalo en `docs/claude/hooks/implementados/mi-hook.md`
5. Agregalo a la tabla de este README

---

## Testear un Hook sin Abrir Claude

```bash
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "tu-comando" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/nombre-del-hook.sh

echo "Exit code: $?"
```

Ver cada documento individual para el JSON de prueba específico de cada hook.
