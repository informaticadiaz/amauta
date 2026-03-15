# Hook: validar-schema-prisma

Valida la sintaxis del archivo `schema.prisma` automáticamente cada vez que Claude lo modifica.

---

## Archivos

| Tipo          | Ruta                                     |
| ------------- | ---------------------------------------- |
| Script        | `.claude/hooks/validar-schema-prisma.sh` |
| Configuración | `.claude/settings.json`                  |

---

## Por qué existe

Los errores en `schema.prisma` (relaciones mal definidas, tipos incorrectos, campos faltantes) no se detectan hasta ejecutar un comando de Prisma. Si Claude hace varios cambios al schema y recién al final intenta ejecutar `prisma generate`, puede encontrarse con múltiples errores acumulados que son más difíciles de diagnosticar.

Este hook corre `prisma validate` inmediatamente después de cada cambio al schema. Si hay un error, Claude lo recibe en el momento y puede corregirlo antes de continuar.

---

## Cuándo se dispara

Evento: `PostToolUse`
Matcher: `Edit | Write`

A diferencia de los otros hooks, este corre **después** de que el archivo fue guardado (no antes). Esto es intencional: necesita leer el archivo actualizado para validarlo.

Solo actúa cuando el archivo modificado es `schema.prisma`. Para cualquier otro archivo, termina inmediatamente sin hacer nada.

---

## Qué hace

1. Extrae la ruta del archivo del JSON recibido
2. Verifica si termina en `schema.prisma`
3. Si no es el schema, sale sin hacer nada (`exit 0`)
4. Si es el schema, ejecuta `npx prisma validate`
5. Si la validación falla, imprime el error y sale con `exit 2`
6. Si la validación pasa, imprime confirmación y sale con `exit 0`

---

## Qué ve Claude

**Si el schema es válido:**

```
schema.prisma válido ✓
```

**Si tiene errores:**

```
Error en schema.prisma:

error: Error validating field `autor` in model `Curso`:
The relation field `autor` on model `Curso` is missing an opposite relation field
on the model `User`.

Corregí los errores antes de continuar.

Problemas comunes:
  - Relaciones mal definidas (falta el campo inverso)
  - Tipos de datos incorrectos
  - Falta @id en algún modelo
  - Enums con valores no definidos
```

Claude recibe el error exacto de Prisma y debe corregir el schema antes de continuar.

---

## Cómo se creó

```bash
touch .claude/hooks/validar-schema-prisma.sh
chmod +x .claude/hooks/validar-schema-prisma.sh
```

Lógica del script:

```bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Ignorar todo lo que no sea schema.prisma
[[ ! "$FILE" =~ schema\.prisma$ ]] && exit 0

cd "$CWD" || exit 0

OUTPUT=$(npx prisma validate 2>&1)

if [ $? -ne 0 ]; then
  echo "Error en schema.prisma:" >&2
  echo "$OUTPUT" >&2
  exit 2
fi

echo "schema.prisma válido ✓" >&2
exit 0
```

Registrado en `settings.json` bajo `PostToolUse` (no `PreToolUse`) porque necesita que el archivo ya esté guardado para poder validarlo:

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [
      {
        "type": "command",
        "command": ".claude/hooks/validar-schema-prisma.sh",
        "statusMessage": "Validando schema de Prisma..."
      }
    ]
  }
]
```

---

## Diferencia con los otros hooks

Este hook usa `PostToolUse` (después) en lugar de `PreToolUse` (antes).

| Hook                    | Evento          | Puede bloquear |
| ----------------------- | --------------- | -------------- |
| `bloquear-destructivos` | PreToolUse      | Sí             |
| `proteger-archivos`     | PreToolUse      | Sí             |
| `detectar-secretos`     | PreToolUse      | Sí             |
| `validar-schema-prisma` | **PostToolUse** | Sí\*           |

\* En `PostToolUse`, `exit 2` hace que Claude reciba el error como feedback, pero el archivo **ya fue guardado**. Claude debe corregirlo y guardar de nuevo.

---

## Probar manualmente

```bash
# Simular que Claude acaba de editar el schema
echo '{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/c/Users/infor/DevHome/amauta/apps/api/prisma/schema.prisma",
    "old_string": "algo",
    "new_string": "otro"
  },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/validar-schema-prisma.sh

echo "Exit code: $?"
```
