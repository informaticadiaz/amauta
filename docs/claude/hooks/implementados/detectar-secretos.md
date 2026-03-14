# Hook: detectar-secretos

Detecta y bloquea la escritura de secretos hardcodeados en archivos de código.

---

## Archivos

| Tipo | Ruta |
|------|------|
| Script | `.claude/hooks/detectar-secretos.sh` |
| Configuración | `.claude/settings.json` |

---

## Por qué existe

Claude puede escribir valores reales en el código si el prompt lo lleva a eso. Por ejemplo:

- "Configurá la conexión a la base de datos" → Claude podría escribir la URL con usuario y contraseña
- "Usá esta API key para el servicio X" → Claude podría pegarla directamente en el código

Esto es un problema de seguridad grave: esos valores quedarían en el historial de git para siempre, visibles para cualquiera con acceso al repositorio.

Este hook escanea el contenido de cada archivo antes de guardarlo. Si detecta un patrón que parece un secreto, bloquea la escritura y le explica a Claude la forma correcta de hacerlo.

---

## Cuándo se dispara

Evento: `PreToolUse`
Matcher: `Edit | Write`

Se dispara antes de editar o crear cualquier archivo. Analiza el contenido que Claude quiere escribir, no el archivo actual.

---

## Qué detecta

| Patrón | Ejemplo |
|--------|---------|
| API keys genéricas | `api_key = "abc123def456..."` |
| Secrets genéricos | `secret: "mi-secreto-largo"` |
| Passwords hardcodeados | `password = "miPassword123"` |
| Tokens de acceso | `token = "eyJhbGci..."` |
| Claves privadas RSA/EC | `-----BEGIN RSA PRIVATE KEY-----` |
| Claves de Anthropic | `sk-ant-...` |
| URLs de DB con credenciales | `postgresql://user:pass@host/db` |

---

## Qué no detecta (intencionalmente)

- Archivos `.env` — son el lugar correcto para definir secretos
- Archivos `.md` — documentación, no código ejecutable
- Variables de entorno referenciadas: `process.env.MI_SECRET` está permitido

---

## Qué ve Claude cuando se bloquea

```
SEGURIDAD: Posible secreto detectado en apps/api/src/config/database.ts

Los secretos no deben hardcodearse en el código fuente.

Solución correcta:
  1. Definí la variable en el archivo .env:
     DATABASE_URL=postgresql://user:pass@host/db

  2. Usala en el código:
     process.env.DATABASE_URL          (Node.js)
     configService.get('DATABASE_URL') (NestJS)

El archivo .env está en .gitignore y nunca se commitea.
```

Claude recibe ese mensaje, no puede guardar el archivo, y debe reescribir el código usando variables de entorno.

---

## Cómo se creó

```bash
touch .claude/hooks/detectar-secretos.sh
chmod +x .claude/hooks/detectar-secretos.sh
```

Lógica del script:

```bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

# Ignorar archivos .env y .md
if [[ "$FILE" =~ \.env ]] || [[ "$FILE" =~ \.md$ ]]; then
  exit 0
fi

PATRONES=('api[_-]?key\s*[:=]\s*["'"'"'][a-zA-Z0-9]{16,}' ...)

for patron in "${PATRONES[@]}"; do
  if echo "$CONTENT" | grep -iE "$patron" > /dev/null; then
    echo "SEGURIDAD: ..." >&2
    exit 2
  fi
done

exit 0
```

El JSON de `Write` incluye el campo `content` con el contenido completo del archivo.
El JSON de `Edit` incluye `new_string` con el texto que reemplazará al anterior.
El script verifica ambos campos.

---

## Probar manualmente

```bash
# Bloqueado — contiene una API key hardcodeada
echo '{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/c/Users/infor/DevHome/amauta/apps/api/src/config.ts",
    "content": "const apiKey = \"sk-ant-abc123def456ghi789\";"
  },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/detectar-secretos.sh

echo "Exit code: $?"

# Permitido — usa variable de entorno
echo '{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/c/Users/infor/DevHome/amauta/apps/api/src/config.ts",
    "content": "const apiKey = process.env.API_KEY;"
  },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/detectar-secretos.sh

echo "Exit code: $?"
```
