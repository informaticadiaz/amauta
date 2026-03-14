# Configuración de Hooks para Amauta

Hooks activos en el proyecto, qué hacen y por qué existen.

Archivos:
- Configuración: `.claude/settings.json`
- Scripts: `.claude/hooks/*.sh`

---

## Resumen de Hooks Activos

| Hook | Evento | Herramienta | Efecto |
|------|--------|-------------|--------|
| `contexto-sesion` | SessionStart | — | Inyecta contexto al iniciar/retomar sesión |
| `bloquear-destructivos` | PreToolUse | Bash | Bloquea comandos irreversibles |
| `advertir-prisma` | PreToolUse | Bash | Bloquea `migrate reset`, advierte sobre `migrate deploy` |
| `proteger-archivos` | PreToolUse | Edit/Write | Bloquea edición de archivos críticos |
| `detectar-secretos` | PreToolUse | Edit/Write | Bloquea escritura de secretos hardcodeados |
| `validar-schema-prisma` | PostToolUse | Edit/Write | Valida sintaxis del schema.prisma al guardarlo |

---

## Detalle de cada Hook

### contexto-sesion

**Cuándo:** Al iniciar una sesión nueva, al hacer `/compact`, al retomar con `/resume`.

**Por qué existe:** Después de un `/compact` o al iniciar sesión, Claude pierde el contexto específico del proyecto. Este hook inyecta automáticamente las reglas más importantes (safeParse, soft delete, DB en producción) sin necesidad de repetirlas en cada conversación.

**Efecto:** Claude recibe el contexto como parte del inicio de sesión. No bloquea nada.

---

### bloquear-destructivos

**Cuándo:** Antes de ejecutar cualquier comando bash.

**Por qué existe:** Comandos como `rm -rf`, `git push --force` o `git reset --hard` son irreversibles. Aunque Claude generalmente los evita, un prompt descuidado o una instrucción ambigua podría llevar a ejecutarlos.

**Qué bloquea:**
- `rm -rf /`, `rm -rf .`, `rm -rf *`
- `git push --force` / `git push -f`
- `git reset --hard`
- `git clean -fd` / `git clean -fxd`
- `DROP DATABASE`, `DROP TABLE`, `TRUNCATE TABLE`
- `DELETE FROM ... WHERE 1=1`

**Efecto:** Claude recibe el mensaje de error y no puede continuar con ese comando.

---

### advertir-prisma

**Cuándo:** Antes de ejecutar comandos bash que contengan `prisma migrate`.

**Por qué existe:** En Amauta **no hay base de datos local**. Cualquier operación de Prisma afecta directamente la base de datos de producción en el VPS. Un `migrate reset` borraría todos los datos reales.

**Comportamiento:**
- `prisma migrate reset` → **bloqueado** (destruye todos los datos)
- `prisma migrate dev` / `prisma migrate deploy` → **advertencia** (Claude puede continuar, pero recibe el aviso)
- `prisma generate`, `prisma validate`, `prisma format` → permitido sin aviso

---

### proteger-archivos

**Cuándo:** Antes de editar o crear archivos.

**Por qué existe:** Algunos archivos no deberían ser modificados por Claude porque tienen implicaciones que van más allá del código.

**Qué protege:**
- `.env`, `.env.production`, `.env.local` — contienen secretos reales
- `.github/workflows/` — un cambio mal hecho rompe el pipeline de CI/CD
- `package-lock.json` — generado automáticamente, no editar a mano
- `.husky/` — hooks de git ya configurados
- `commitlint.config.*` — reglas de commits del proyecto

**Efecto:** Claude recibe el mensaje explicando por qué está protegido y cómo proceder correctamente.

---

### detectar-secretos

**Cuándo:** Antes de escribir o editar cualquier archivo de código.

**Por qué existe:** Claude puede hardcodear valores reales si el prompt no es cuidadoso. Este hook escanea el contenido antes de guardarlo.

**Qué detecta:**
- Patrones de API keys, secrets, passwords, tokens
- Claves privadas (RSA, EC)
- Claves de Anthropic (`sk-...`)
- URLs de base de datos con credenciales (`postgresql://user:pass@...`)

**No aplica a:** archivos `.env` (son el lugar correcto para estos valores) ni archivos `.md`.

**Efecto:** Claude recibe instrucciones de cómo usar variables de entorno en su lugar.

---

### validar-schema-prisma

**Cuándo:** Después de editar o crear el archivo `schema.prisma`.

**Por qué existe:** Los errores de sintaxis en el schema de Prisma no se detectan hasta ejecutar un comando de Prisma. Este hook valida inmediatamente después de cada cambio.

**Efecto:**
- Si el schema es válido → mensaje de confirmación, continúa
- Si tiene errores → Claude los recibe y debe corregirlos antes de avanzar

---

## Cómo Agregar un Hook Nuevo

1. Creá el script en `.claude/hooks/mi-hook.sh`
2. Dále permisos: `chmod +x .claude/hooks/mi-hook.sh`
3. Registralo en `.claude/settings.json`
4. Reiniciá Claude Code para que tome efecto

```bash
# Estructura básica de un script de hook
#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Tu lógica acá
if [ condicion ]; then
  echo "Mensaje para Claude" >&2
  exit 2  # bloquear
fi

exit 0  # permitir
```

---

## Verificar que los Hooks Están Activos

Dentro de Claude Code:

```
/hooks
```

Muestra todos los hooks cargados en la sesión actual.

---

## Testear un Hook Manualmente

```bash
# Simular un comando bash bloqueado
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf ./dist" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/bloquear-destructivos.sh

echo "Exit code: $?"
# Debería imprimir el mensaje de bloqueo y exit code 2
```

---

## Archivos del Sistema de Hooks

```
amauta/
└── .claude/
    ├── settings.json              ← configuración (se commitea)
    ├── settings.local.json        ← permisos locales (no se commitea)
    └── hooks/
        ├── contexto-sesion.sh
        ├── bloquear-destructivos.sh
        ├── advertir-prisma.sh
        ├── proteger-archivos.sh
        ├── detectar-secretos.sh
        └── validar-schema-prisma.sh
```

> `settings.json` se commitea al repositorio y aplica para todo el equipo.
> `settings.local.json` es personal (está en `.gitignore`).
