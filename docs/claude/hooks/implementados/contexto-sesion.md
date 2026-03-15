# Hook: contexto-sesion

Inyecta el contexto crítico del proyecto cada vez que se inicia o retoma una sesión.

---

## Archivos

| Tipo          | Ruta                               |
| ------------- | ---------------------------------- |
| Script        | `.claude/hooks/contexto-sesion.sh` |
| Configuración | `.claude/settings.json`            |

---

## Por qué existe

Cuando hacés `/compact` o retomás una sesión con `/resume`, Claude pierde el historial de la conversación anterior. Sin este hook, habría que repetirle manualmente cosas como:

- La DB está en producción, no hay DB local
- Usar `safeParse()` con Zod, nunca `parse()`
- Soft delete con `estado: ARCHIVADO`, nunca `prisma.delete()`
- En qué fase del roadmap está el proyecto

Con el hook, Claude recibe esa información automáticamente al arrancar, sin que vos hagas nada.

---

## Cuándo se dispara

Evento: `SessionStart`
Matcher: `startup | compact | resume`

Es decir, se dispara cuando:

- Abrís Claude Code por primera vez en el proyecto
- Ejecutás `/compact` para liberar contexto
- Ejecutás `/resume` para retomar una sesión anterior

---

## Qué hace

Imprime por `stdout` un bloque de texto con:

- Stack técnico del proyecto (Next.js, NestJS, Prisma, PostgreSQL)
- Ubicación de cada parte del monorepo
- Las tres reglas de código más importantes
- La fase actual del roadmap y los próximos issues
- Usuarios de prueba disponibles

Claude recibe ese texto como contexto al inicio de la sesión.

---

## Cómo se creó

```bash
# 1. Se creó el script
touch .claude/hooks/contexto-sesion.sh

# 2. Se le dieron permisos de ejecución
chmod +x .claude/hooks/contexto-sesion.sh

# 3. Se registró en .claude/settings.json
```

Fragmento del script:

```bash
#!/bin/bash
cat <<'EOF'
=== CONTEXTO AMAUTA ===
Stack:
  - Frontend: Next.js 14 (App Router) → apps/web/
  - Backend:  NestJS + Fastify        → apps/api/
  ...
EOF
exit 0
```

Fragmento del `settings.json`:

```json
"SessionStart": [
  {
    "matcher": "startup|compact|resume",
    "hooks": [
      {
        "type": "command",
        "command": ".claude/hooks/contexto-sesion.sh",
        "statusMessage": "Cargando contexto del proyecto..."
      }
    ]
  }
]
```

---

## Qué no hace

- No bloquea nada (`exit 0` siempre)
- No valida nada
- No tiene efecto en las herramientas que Claude usa

---

## Probar manualmente

```bash
echo '{
  "hook_event_name": "SessionStart",
  "source": "startup",
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/contexto-sesion.sh
```

Deberías ver el bloque de contexto impreso en la terminal.

---

## Actualizar el contexto

Si cambia la fase del roadmap, se agregan reglas nuevas o cambian los usuarios de prueba, editá directamente el script:

```
.claude/hooks/contexto-sesion.sh
```
