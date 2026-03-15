# Hook: proteger-archivos

Bloquea que Claude edite o cree archivos que no deberían modificarse sin supervisión explícita.

---

## Archivos

| Tipo          | Ruta                                 |
| ------------- | ------------------------------------ |
| Script        | `.claude/hooks/proteger-archivos.sh` |
| Configuración | `.claude/settings.json`              |

---

## Por qué existe

Algunos archivos del proyecto tienen implicaciones que van más allá del código:

- `.env` contiene contraseñas y tokens reales
- `.github/workflows/` controla el pipeline que despliega a producción
- `package-lock.json` no se edita a mano, se regenera con `npm install`

Si Claude los modifica por error (o por un prompt mal redactado), las consecuencias pueden ser graves: secretos expuestos, deploy roto, dependencias inconsistentes.

---

## Cuándo se dispara

Evento: `PreToolUse`
Matcher: `Edit | Write`

Se dispara antes de que Claude edite un archivo existente o cree uno nuevo. Verifica si la ruta del archivo coincide con algún patrón protegido.

---

## Archivos protegidos

| Patrón                | Motivo                                                  |
| --------------------- | ------------------------------------------------------- |
| `.env`                | Contiene secretos reales. Editar manualmente.           |
| `.env.production`     | Variables de producción. Solo con supervisión.          |
| `.env.local`          | Variables locales sensibles. Editar manualmente.        |
| `.github/workflows/`  | Pipeline CI/CD. Un cambio mal hecho rompe el deploy.    |
| `package-lock.json`   | Generado automáticamente. Actualizar con `npm install`. |
| `.husky/`             | Hooks de git del proyecto. Ya están configurados.       |
| `commitlint.config.*` | Reglas de commits del proyecto. No modificar.           |

---

## Qué ve Claude cuando se bloquea

```
ARCHIVO PROTEGIDO: /c/Users/infor/DevHome/amauta/.env.production
Motivo: Variables de producción. Editá solo con supervisión.

Editá este archivo manualmente si realmente es necesario.
```

Claude recibe ese mensaje y no puede editar el archivo. Debe indicarte qué cambio necesita hacer y vos lo aplicás manualmente.

---

## Cómo se creó

```bash
touch .claude/hooks/proteger-archivos.sh
chmod +x .claude/hooks/proteger-archivos.sh
```

Lógica del script:

```bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

declare -A PROTEGIDOS
PROTEGIDOS[".env"]="Contiene secretos. Editá manualmente."
PROTEGIDOS[".github/workflows"]="Pipeline CI/CD. Un cambio mal hecho rompe el deploy."
# ...

for archivo in "${!PROTEGIDOS[@]}"; do
  if [[ "$FILE" == *"$archivo"* ]]; then
    echo "ARCHIVO PROTEGIDO: $FILE" >&2
    echo "Motivo: ${PROTEGIDOS[$archivo]}" >&2
    exit 2
  fi
done

exit 0
```

El JSON de `Edit` y `Write` incluye el campo `file_path` con la ruta completa del archivo. El script lo extrae y verifica si contiene alguno de los patrones protegidos.

---

## Probar manualmente

```bash
# Bloqueado
echo '{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/c/Users/infor/DevHome/amauta/.env",
    "old_string": "algo",
    "new_string": "otro"
  },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/proteger-archivos.sh

echo "Exit code: $?"

# Permitido
echo '{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/c/Users/infor/DevHome/amauta/apps/api/src/cursos/cursos.service.ts",
    "old_string": "algo",
    "new_string": "otro"
  },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/proteger-archivos.sh

echo "Exit code: $?"
```

---

## Agregar un archivo a la lista de protegidos

Editá `.claude/hooks/proteger-archivos.sh` y agregá una línea al bloque `declare -A PROTEGIDOS`:

```bash
PROTEGIDOS["mi-archivo-critico.json"]="Motivo por el que está protegido."
```
