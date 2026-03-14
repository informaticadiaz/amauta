# Hook: advertir-prisma

Controla las operaciones de Prisma que afectan la base de datos de producción.

---

## Archivos

| Tipo | Ruta |
|------|------|
| Script | `.claude/hooks/advertir-prisma.sh` |
| Configuración | `.claude/settings.json` |

---

## Por qué existe

En Amauta **no hay base de datos local**. La base de datos PostgreSQL corre en el VPS de producción. Esto significa que cualquier operación de Prisma que Claude ejecute afecta directamente los datos reales.

El riesgo más grave es `prisma migrate reset`, que borra y recrea toda la base de datos. Ejecutado por error eliminaría usuarios, cursos, lecciones e inscripciones reales.

Este hook existe para que eso nunca pueda pasar por accidente.

---

## Cuándo se dispara

Evento: `PreToolUse`
Matcher: `Bash`

Se dispara antes de ejecutar cualquier comando bash. Internamente filtra solo los que contienen `prisma migrate`.

---

## Comportamiento por comando

| Comando | Efecto del hook |
|---------|----------------|
| `prisma migrate reset` | **Bloqueado** — destruye todos los datos |
| `prisma migrate dev` | **Advertencia** — Claude puede continuar pero recibe el aviso |
| `prisma migrate deploy` | **Advertencia** — Claude puede continuar pero recibe el aviso |
| `prisma generate` | Permitido sin aviso |
| `prisma validate` | Permitido sin aviso |
| `prisma format` | Permitido sin aviso |
| `prisma studio` | Permitido sin aviso |

---

## Qué ve Claude

**En caso de `migrate reset` (bloqueado):**

```
BLOQUEADO: prisma migrate reset

Este comando ELIMINA TODOS LOS DATOS de la base de datos.
En Amauta, la DB está en producción (VPS). No hay DB local.

Ejecutar esto borraría todos los datos reales de usuarios,
cursos, lecciones e inscripciones.

Si necesitás hacer esto, ejecutalo manualmente con plena conciencia.
```

**En caso de `migrate dev` o `migrate deploy` (advertencia):**

```
ADVERTENCIA: Operación de migración de Prisma detectada.

En Amauta NO HAY base de datos local.
Este comando afecta directamente la base de datos de PRODUCCIÓN.

Antes de continuar verificá:
  - ¿La migración fue revisada?
  - ¿El equipo está al tanto?
  - ¿Hay backup disponible?
```

En el caso de la advertencia, Claude recibe el mensaje pero puede continuar. Sirve para que sea consciente del impacto antes de ejecutar.

---

## Cómo se creó

```bash
touch .claude/hooks/advertir-prisma.sh
chmod +x .claude/hooks/advertir-prisma.sh
```

Lógica central del script:

```bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -E "prisma migrate reset"; then
  echo "BLOQUEADO..." >&2
  exit 2        # bloquea
fi

if echo "$COMMAND" | grep -E "prisma migrate (dev|deploy)"; then
  echo "ADVERTENCIA..." >&2
  exit 0        # advierte pero permite
fi

exit 0          # cualquier otro comando de prisma: permitido
```

---

## Probar manualmente

```bash
# Bloqueado (exit code 2)
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "npx prisma migrate reset" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/advertir-prisma.sh

# Advertencia (exit code 0, mensaje en stderr)
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "npx prisma migrate dev --name add-campo" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/advertir-prisma.sh

# Permitido sin aviso (exit code 0, sin mensaje)
echo '{
  "tool_name": "Bash",
  "tool_input": { "command": "npx prisma generate" },
  "session_id": "test",
  "cwd": "/c/Users/infor/DevHome/amauta"
}' | .claude/hooks/advertir-prisma.sh
```

---

## Referencia relacionada

Para el proceso completo de trabajo con Prisma en Amauta:
`docs/ai-skills/prisma-db-management.md`
