# Hooks: Casos Prácticos para Desarrolladores

Ejemplos concretos y listos para usar. Cada caso incluye el problema que resuelve, el script y la configuración.

---

## Índice

1. [Seguridad y protección](#1-seguridad-y-protección)
2. [Calidad de código](#2-calidad-de-código)
3. [Git y control de versiones](#3-git-y-control-de-versiones)
4. [Base de datos (Prisma)](#4-base-de-datos-prisma)
5. [Flujo de trabajo agéntico](#5-flujo-de-trabajo-agéntico)
6. [Logging y auditoría](#6-logging-y-auditoría)
7. [Notificaciones](#7-notificaciones)
8. [Entorno de desarrollo](#8-entorno-de-desarrollo)

---

## 1. Seguridad y Protección

### 1.1 Bloquear comandos destructivos

**Problema:** Claude podría ejecutar `rm -rf`, `DROP TABLE` u otros comandos irreversibles.

```bash
#!/bin/bash
# .claude/hooks/bloquear-destructivos.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

PATRONES_PELIGROSOS=(
  "rm -rf"
  "rm -r /"
  "DROP TABLE"
  "DROP DATABASE"
  "DELETE FROM .* WHERE 1"
  "TRUNCATE"
  "format c:"
  "mkfs\."
)

for patron in "${PATRONES_PELIGROSOS[@]}"; do
  if echo "$COMMAND" | grep -iE "$patron" > /dev/null; then
    cat <<EOF >&2
BLOQUEADO: Comando potencialmente destructivo detectado.
Comando: $COMMAND
Patrón detectado: $patron

Si realmente necesitás ejecutar esto, hacelo manualmente
fuera de Claude Code con supervisión explícita.
EOF
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

### 1.2 Detectar secretos antes de escribir archivos

**Problema:** Claude podría hardcodear API keys, passwords o tokens en archivos de código.

```bash
#!/bin/bash
# .claude/hooks/detectar-secretos.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

# No verificar archivos de entorno (son el lugar correcto para secrets)
if [[ "$FILE" =~ \.env(\.|$) ]]; then
  exit 0
fi

PATRONES=(
  'api[_-]?key\s*[:=]\s*["\x27][a-zA-Z0-9_\-]{16,}'
  'secret\s*[:=]\s*["\x27][a-zA-Z0-9_\-]{16,}'
  'password\s*[:=]\s*["\x27][^"\x27]{8,}'
  'token\s*[:=]\s*["\x27][a-zA-Z0-9_\-]{20,}'
  'BEGIN (RSA |EC )?PRIVATE KEY'
  'AWS_SECRET_ACCESS_KEY'
  'sk-[a-zA-Z0-9]{40,}'
)

for patron in "${PATRONES[@]}"; do
  if echo "$CONTENT" | grep -iE "$patron" > /dev/null; then
    cat <<EOF >&2
SEGURIDAD: Posible secreto detectado en $FILE

Patrón: $patron

Los secretos deben estar en variables de entorno:
- Usar process.env.MI_API_KEY en el código
- Definir MI_API_KEY en el archivo .env (que está en .gitignore)
- Nunca hardcodear valores en el código fuente
EOF
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
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/detectar-secretos.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 1.3 Proteger archivos críticos del proyecto

**Problema:** Evitar modificaciones accidentales a archivos sensibles como el schema de Prisma, configuraciones de CI/CD o variables de entorno.

```bash
#!/bin/bash
# .claude/hooks/proteger-archivos-criticos.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

declare -A ARCHIVOS_PROTEGIDOS=(
  [".env"]="Usar variables de entorno. Editá .env manualmente."
  [".env.production"]="Variables de producción. Editá solo con supervisión."
  [".github/workflows"]="Pipeline de CI/CD. Cambios afectan el deploy automático."
  ["prisma/schema.prisma"]="Schema de DB. Requiere migración. Ver ia-skills/prisma-db-management.md"
  ["package-lock.json"]="Generado automáticamente. Ejecutá 'npm install' para actualizarlo."
)

for archivo in "${!ARCHIVOS_PROTEGIDOS[@]}"; do
  if [[ "$FILE" == *"$archivo"* ]]; then
    cat <<EOF >&2
ARCHIVO PROTEGIDO: $FILE
Motivo: ${ARCHIVOS_PROTEGIDOS[$archivo]}

Para modificar este archivo, hacelo manualmente con pleno conocimiento
de las implicaciones del cambio.
EOF
    exit 2
  fi
done

exit 0
```

---

## 2. Calidad de Código

### 2.1 Formatear código automáticamente

**Problema:** Claude no siempre aplica el formato exacto del proyecto (Prettier, ESLint, etc.).

```bash
#!/bin/bash
# .claude/hooks/auto-formatear.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

[ -z "$FILE" ] && exit 0

cd "$CWD" || exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    # Formatear con Prettier si está disponible
    if [ -f "package.json" ] && grep -q '"prettier"' package.json; then
      npx prettier --write "$FILE" 2>/dev/null
    fi
    # Corregir errores de linting
    if [ -f "package.json" ] && grep -q '"eslint"' package.json; then
      npx eslint --fix "$FILE" 2>/dev/null
    fi
    ;;
esac

exit 0
```

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/auto-formatear.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 2.2 Gate de calidad antes de terminar (con subagente verificador)

**Problema:** Claude puede dar por terminada una tarea sin verificar que los tests pasen.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verificá que el trabajo está completo:\n\n1. Ejecutá los tests: npm test (o el comando de test del proyecto)\n2. Verificá que no hay errores de TypeScript: npx tsc --noEmit\n3. Confirmá que no hay errores de linting: npm run lint\n\nSi todo pasa → {\"ok\": true}\nSi algo falla → {\"ok\": false, \"reason\": \"Descripción específica de qué falla y cómo corregirlo\"}\n\nSolo reportá fallas reales, no advertencias menores.",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

---

### 2.3 Verificar tipos TypeScript después de editar

**Problema:** Los cambios de Claude pueden romper el tipado de TypeScript en archivos relacionados.

```bash
#!/bin/bash
# .claude/hooks/verificar-typescript.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Solo verificar archivos TypeScript
[[ ! "$FILE" =~ \.(ts|tsx)$ ]] && exit 0

cd "$CWD" || exit 0

# Verificar errores de tipos (sin emitir archivos)
OUTPUT=$(npx tsc --noEmit 2>&1)

if [ $? -ne 0 ]; then
  # Solo mostrar errores del archivo modificado
  ERRORES=$(echo "$OUTPUT" | grep "$FILE")
  if [ -n "$ERRORES" ]; then
    cat <<EOF >&2
Errores de TypeScript en $FILE:
$ERRORES

Por favor corregí los errores de tipado antes de continuar.
EOF
    exit 2
  fi
fi

exit 0
```

---

## 3. Git y Control de Versiones

### 3.1 Proteger ramas principales

**Problema:** Claude podría hacer commits directamente en `main` o `master`.

```bash
#!/bin/bash
# .claude/hooks/proteger-ramas.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Solo verificar comandos git commit y push
if ! echo "$COMMAND" | grep -E "^git (commit|push)" > /dev/null; then
  exit 0
fi

RAMA=$(cd "$CWD" && git rev-parse --abbrev-ref HEAD 2>/dev/null)
RAMAS_PROTEGIDAS=("main" "master" "production" "prod" "staging")

for rama in "${RAMAS_PROTEGIDAS[@]}"; do
  if [ "$RAMA" = "$rama" ]; then
    cat <<EOF >&2
RAMA PROTEGIDA: No se puede commitear directamente en '$rama'.

Flujo correcto:
1. Crear rama: git checkout -b feat/nombre-del-feature
2. Hacer commits en esa rama
3. Crear PR en GitHub: gh pr create
4. Mergear después de aprobación

Rama actual: $RAMA
EOF
    exit 2
  fi
done

exit 0
```

---

### 3.2 Validar formato de mensajes de commit

**Problema:** Los commits no siguen el formato del proyecto (conventional commits en español).

```bash
#!/bin/bash
# .claude/hooks/validar-commit.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Solo verificar git commit
if ! echo "$COMMAND" | grep -E "^git commit" > /dev/null; then
  exit 0
fi

# Extraer el mensaje del commit
MSG=$(echo "$COMMAND" | grep -oP '(?<=-m ")[^"]+(?=")' || echo "$COMMAND" | grep -oP "(?<=-m ')[^']+(?=')")

if [ -z "$MSG" ]; then
  exit 0  # No podemos extraer el mensaje, dejamos pasar
fi

# Verificar formato: tipo: descripción
TIPOS="feat|fix|docs|style|refactor|perf|test|chore|ci|build"
if ! echo "$MSG" | grep -iE "^($TIPOS)(\(.+\))?: .{10,}" > /dev/null; then
  cat <<EOF >&2
Formato de commit inválido.

Formato esperado: tipo(scope): descripción en español

Tipos válidos: feat, fix, docs, style, refactor, perf, test, chore, ci
Ejemplos:
  feat(auth): agregar login con Google OAuth
  fix(cursos): corregir error al cargar lecciones
  docs: actualizar guía de instalación

Mensaje actual: "$MSG"
EOF
    exit 2
fi

exit 0
```

---

### 3.3 Bloquear force-push

**Problema:** Un `git push --force` puede destruir el trabajo del equipo.

```bash
#!/bin/bash
# .claude/hooks/bloquear-force-push.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -E "git push.*(--force|-f)(\s|$)" > /dev/null; then
  cat <<EOF >&2
BLOQUEADO: git push --force no está permitido.

El force-push puede destruir el historial compartido del equipo.

Alternativas más seguras:
- git push --force-with-lease  (falla si alguien pusheó desde tu último fetch)
- Hablar con el equipo antes de reescribir el historial
- En general, preferir 'git revert' sobre 'git reset'
EOF
  exit 2
fi

exit 0
```

---

## 4. Base de Datos (Prisma)

### 4.1 Advertir antes de ejecutar migraciones

**Problema:** Las migraciones de Prisma afectan la base de datos de producción directamente (no hay DB local).

```bash
#!/bin/bash
# .claude/hooks/advertir-migracion-prisma.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if ! echo "$COMMAND" | grep -E "prisma migrate (dev|deploy|reset)" > /dev/null; then
  exit 0
fi

# Determinar el tipo de comando
if echo "$COMMAND" | grep "migrate reset" > /dev/null; then
  cat <<EOF >&2
⚠️  PELIGRO: prisma migrate reset BORRA TODOS LOS DATOS de la DB.

Este comando:
1. Elimina la base de datos
2. Vuelve a crearla desde cero
3. Ejecuta todas las migraciones
4. Opcionalmente ejecuta el seed

En este proyecto la DB está en PRODUCCIÓN (VPS).
Ejecutar esto eliminará todos los datos reales.

Si necesitás hacer esto, ejecutalo manualmente con plena conciencia.
EOF
  exit 2
fi

if echo "$COMMAND" | grep "migrate deploy" > /dev/null; then
  cat <<EOF >&2
ATENCIÓN: Estás por ejecutar migraciones en la base de datos de producción.

Checklist antes de continuar:
- [ ] ¿Hay backup de la DB?
- [ ] ¿La migración fue testeada previamente?
- [ ] ¿El equipo está al tanto del cambio?

Si todo está verificado, ejecutá el comando manualmente.
EOF
  exit 2
fi

exit 0
```

---

### 4.2 Validar schema de Prisma al guardarlo

**Problema:** Errores de sintaxis en `schema.prisma` no se detectan hasta ejecutar un comando de Prisma.

```bash
#!/bin/bash
# .claude/hooks/validar-schema-prisma.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

[[ ! "$FILE" =~ schema\.prisma$ ]] && exit 0

cd "$CWD" || exit 0

# Validar sintaxis del schema
OUTPUT=$(npx prisma validate 2>&1)

if [ $? -ne 0 ]; then
  cat <<EOF >&2
Error en schema.prisma:
$OUTPUT

Corregí los errores antes de continuar.
Tip: Los errores comunes son relaciones mal definidas o tipos incorrectos.
EOF
  exit 2
fi

echo "schema.prisma válido ✓" >&2
exit 0
```

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validar-schema-prisma.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 5. Flujo de Trabajo Agéntico

### 5.1 Gate de aprobación para PRs

**Problema:** Claude crea PRs sin verificar que todo el trabajo está listo.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "agent",
            "prompt": "Se está por ejecutar: $ARGUMENTS\n\nSi este comando crea un Pull Request (gh pr create), verificá primero:\n1. ¿Los tests pasan? Ejecutá npm test\n2. ¿Hay errores de TypeScript? Ejecutá npx tsc --noEmit\n3. ¿El código está formateado? Ejecutá npx prettier --check .\n\nSi todo está bien → {\"ok\": true}\nSi algo falla → {\"ok\": false, \"reason\": \"lista de problemas encontrados\"}",
            "timeout": 90
          }
        ]
      }
    ]
  }
}
```

---

### 5.2 Inyectar contexto del proyecto al iniciar sesión

**Problema:** Después de un `/compact` o al retomar una sesión, Claude pierde el contexto específico del proyecto.

```bash
#!/bin/bash
# .claude/hooks/contexto-proyecto.sh

INPUT=$(cat)
SOURCE=$(echo "$INPUT" | jq -r '.source // empty')

# Inyectar contexto relevante
cat <<'EOF'
=== CONTEXTO DEL PROYECTO AMAUTA ===

Stack técnico:
- Frontend: Next.js 14 (App Router) en apps/web/
- Backend: NestJS + Fastify en apps/api/
- ORM: Prisma
- DB: PostgreSQL en VPS (NO hay DB local)

Reglas críticas:
- SIEMPRE usar safeParse() con Zod, nunca parse() directo
- Soft delete: cambiar estado a ARCHIVADO, NUNCA usar delete()
- Leer schema.prisma ANTES de escribir queries
- La DB está en producción: verificar antes de cualquier migración

Fase actual: Fase 1 MVP (13/16 issues completados)
Próximos issues: F1-014 (progreso), F1-015 (marcar lecciones), F1-016 (dashboard)
=====================================
EOF

exit 0
```

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|compact|resume",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/contexto-proyecto.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 5.3 Restricciones para subagentes de exploración

**Problema:** Los subagentes de tipo `Explore` o `Plan` no deberían poder modificar archivos.

```bash
#!/bin/bash
# .claude/hooks/subagente-solo-lectura.sh

INPUT=$(cat)
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Solo aplica a subagentes
[ -z "$AGENT_ID" ] && exit 0

# Los subagentes Explore y Plan no deben escribir
if [[ "$AGENT_TYPE" =~ ^(Explore|Plan)$ ]]; then
  if [[ "$TOOL" =~ ^(Edit|Write|Bash)$ ]]; then
    # Verificar si el comando bash es de escritura
    if [ "$TOOL" = "Bash" ]; then
      COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
      if echo "$COMMAND" | grep -E "^(echo .* >\|cat >\|tee |sed -i|awk .*>" > /dev/null; then
        echo "Los subagentes de exploración no pueden escribir archivos." >&2
        exit 2
      fi
    else
      echo "Los subagentes de exploración no pueden modificar archivos. Solo lectura." >&2
      exit 2
    fi
  fi
fi

exit 0
```

---

## 6. Logging y Auditoría

### 6.1 Log completo de acciones por sesión

**Problema:** Es difícil saber qué hizo Claude en una sesión larga.

```bash
#!/bin/bash
# .claude/hooks/log-sesion.sh

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
SESSION=$(echo "$INPUT" | jq -r '.session_id // empty')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

LOG_DIR="$HOME/.claude/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/$(date +%Y-%m-%d)-$SESSION.log"

case "$TOOL" in
  Bash)
    CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
    echo "[$TIMESTAMP] BASH: $CMD" >> "$LOG"
    ;;
  Edit|Write)
    FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    echo "[$TIMESTAMP] $TOOL: $FILE" >> "$LOG"
    ;;
  Read|Glob|Grep)
    echo "[$TIMESTAMP] $TOOL" >> "$LOG"
    ;;
esac

exit 0
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/log-sesion.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

---

## 7. Notificaciones

### 7.1 Notificación cuando Claude necesita atención (Windows)

**Problema:** Claude queda esperando aprobación mientras trabajás en otra ventana.

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude necesita tu aprobación', 'Claude Code', 'OK', 'Information')\""
          }
        ]
      }
    ]
  }
}
```

---

### 7.2 Notificación al terminar una tarea larga

**Problema:** No sabés cuándo Claude terminó de ejecutar una tarea que lleva varios minutos.

```bash
#!/bin/bash
# .claude/hooks/notificar-fin.sh

INPUT=$(cat)
STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# Evitar bucle
[ "$STOP_ACTIVE" = "true" ] && exit 0

# Notificar según OS
if command -v powershell.exe > /dev/null 2>&1; then
  # Windows
  powershell.exe -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude terminó la tarea', 'Claude Code')" &
elif command -v notify-send > /dev/null 2>&1; then
  # Linux
  notify-send "Claude Code" "Tarea completada" &
elif command -v osascript > /dev/null 2>&1; then
  # macOS
  osascript -e 'display notification "Tarea completada" with title "Claude Code"' &
fi

exit 0
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/notificar-fin.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

---

## 8. Entorno de Desarrollo

### 8.1 Verificar variables de entorno requeridas al iniciar

**Problema:** El proyecto falla por variables de entorno faltantes y Claude no lo sabe.

```bash
#!/bin/bash
# .claude/hooks/verificar-entorno.sh

CWD=$(cat | jq -r '.cwd // empty')

# Cargar .env si existe
[ -f "$CWD/.env" ] && source "$CWD/.env" 2>/dev/null

VARS_REQUERIDAS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
FALTANTES=()

for var in "${VARS_REQUERIDAS[@]}"; do
  [ -z "${!var}" ] && FALTANTES+=("$var")
done

if [ ${#FALTANTES[@]} -gt 0 ]; then
  cat <<EOF
⚠️  Variables de entorno faltantes:
$(printf '  - %s\n' "${FALTANTES[@]}")

Definílas en el archivo .env o en tu entorno antes de continuar.
Ver docs/technical/environment-variables.md para referencia.
EOF
fi

exit 0
```

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/verificar-entorno.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Cómo Instalar los Hooks del Proyecto

```bash
# 1. Crear la carpeta de hooks
mkdir -p .claude/hooks

# 2. Copiar los scripts que necesitás
# (los scripts de arriba van en .claude/hooks/)

# 3. Dar permisos de ejecución (Linux/macOS)
chmod +x .claude/hooks/*.sh

# 4. Agregar configuración a .claude/settings.json
# (si no existe, crearlo con el contenido JSON de cada ejemplo)

# 5. Verificar que los hooks están cargados
# (dentro de Claude Code)
/hooks
```

## Testear un Hook Manualmente

```bash
# Simular un PreToolUse de Bash
echo '{
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf /tmp/test" },
  "session_id": "test-123",
  "cwd": "/tu/proyecto"
}' | .claude/hooks/bloquear-destructivos.sh

echo "Exit code: $?"
```

---

> Para entender cómo los hooks interactúan con subagentes, ver [hooks-subagentes.md](hooks-subagentes.md).
> Para referencia general de hooks, ver [hooks.md](hooks.md).
