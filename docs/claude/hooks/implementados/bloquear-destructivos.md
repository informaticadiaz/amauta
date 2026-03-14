# Hook: bloquear-destructivos

Bloquea comandos bash que pueden causar daño irreversible en el proyecto o la infraestructura.

---

## Archivos

| Tipo | Ruta |
|------|------|
| Script | `.claude/hooks/bloquear-destructivos.sh` |
| Configuración | `.claude/settings.json` |

---

## Por qué existe

Claude puede ejecutar comandos bash directamente. La mayoría son seguros, pero algunos son irreversibles: borrar directorios, reescribir historial de git, vaciar tablas de base de datos.

Un prompt descuidado como "limpiá los archivos de build" podría derivar en un `rm -rf` con alcance mayor al esperado. Este hook intercepta esos comandos antes de que se ejecuten.

---

## Cuándo se dispara

Evento: `PreToolUse`
Matcher: `Bash`

Se dispara **antes** de ejecutar cualquier comando bash. Si el comando coincide con un patrón peligroso, Claude nunca llega a ejecutarlo.

---

## Qué bloquea

| Comando | Motivo |
|---------|--------|
| `rm -rf /` | Borrado recursivo desde la raíz |
| `rm -rf .` | Borrado recursivo del directorio actual |
| `rm -rf *` | Borrado masivo con wildcard |
| `git push --force` / `git push -f` | Reescribe el historial remoto compartido |
| `git reset --hard` | Descarta todos los cambios locales sin recuperación |
| `git clean -fd` / `git clean -fxd` | Elimina archivos no rastreados permanentemente |
| `DROP DATABASE` | Elimina la base de datos completa |
| `DROP TABLE` | Elimina una tabla con todos sus datos |
| `TRUNCATE TABLE` | Vacía una tabla sin posibilidad de rollback |
| `DELETE FROM ... WHERE 1=1` | Elimina todos los registros de una tabla |

---

## Qué no bloquea

- `rm archivo.txt` — borrado de un archivo específico
- `git push origin feature/mi-rama` — push normal sin force
- `git reset HEAD~1` — deshacer el último commit sin `--hard`
- `DELETE FROM tabla WHERE id = 1` — borrado con condición específica

---

## Cómo se creó

```bash
# 1. Se creó el script
touch .claude/hooks/bloquear-destructivos.sh

# 2. Permisos de ejecución
chmod +x .claude/hooks/bloquear-destructivos.sh

# 3. Se registró en settings.json bajo PreToolUse → Bash
```

Lógica del script:

```bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

PATRONES=("rm -rf /" "git push --force" ...)

for patron in "${PATRONES[@]}"; do
  if echo "$COMMAND" | grep -iE "$patron" > /dev/null 2>&1; then
    echo "BLOQUEADO: ..." >&2
    exit 2   # ← bloquea la acción
  fi
done

exit 0       # ← permite la acción
```

---

## Qué ve Claude cuando se bloquea

```
BLOQUEADO: Comando potencialmente destructivo.
Comando: rm -rf ./dist
Motivo: coincide con patrón de riesgo "rm -rf \."

Si necesitás ejecutarlo, hacelo manualmente en la terminal
con plena conciencia de las consecuencias.
```

Claude recibe ese mensaje como error y no puede continuar con ese comando. Debe buscar una alternativa.

---

## Probar manualmente

```bash
# Debería bloquearse (exit code 2)
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf ./node_modules" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/bloquear-destructivos.sh

echo "Exit code: $?"

# Debería pasar (exit code 0)
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "npm run build" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/bloquear-destructivos.sh

echo "Exit code: $?"
```
