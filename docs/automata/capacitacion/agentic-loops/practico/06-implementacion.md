# 06 — Guía de Implementación: De Fase 0 a Fase 3

> Instrucciones concretas para implementar el loop en el proyecto Amauta.
> Seguir en orden. No saltar fases.

---

## Prerequisito: Antes de empezar

Verificar que el entorno es estable:

```bash
# Tests pasan actualmente
npm run test --workspace=@amauta/api    # debe estar en verde
npm run test --workspace=@amauta/web    # debe estar en verde

# TypeScript compila
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json

# Estado de GitHub limpio
gh issue list --label "phase-4" --state open --limit 10
```

Si algo falla aquí, no avanzar. Resolver primero.

---

## Tarea 1: Crear el archivo de log

```bash
mkdir -p docs/logs
```

Crear `docs/logs/loop-status.md`:

```markdown
# Loop Status

## Estado del loop

- Última ejecución: —
- Estado: NO INICIADO

## Historial

_vacío_
```

---

## Tarea 2: Corregir el template de commit en `complete-issue`

El skill `docs/ai-skills/complete-issue.md` tiene un bug: incluye atribución de IA en el template de commit, lo que viola la regla del proyecto.

**Buscar y eliminar estas líneas del template de commit:**

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

El template correcto del commit queda:

```bash
git commit -m "$(cat <<'EOF'
[tipo]: [descripción corta en español, máx 72 chars]

- [cambio 1]
- [cambio 2]
- Tests: [qué se cubre con los tests]

Resuelve: #[número]
EOF
)"
```

---

## Tarea 3: Crear el skill `project-manager-autonomo`

Copiar el contenido del skill diseñado en [03-skill-autonomo.md](03-skill-autonomo.md) a:

```
docs/ai-skills/project-manager-autonomo.md
```

El archivo debe comenzar con el frontmatter:

```markdown
---
name: project-manager-autonomo
description: Orquestador autónomo del agentic loop...
---
```

---

## Tarea 4: Crear el skill `loop-auditor`

Copiar el contenido del skill de [05-tercera-skill.md](05-tercera-skill.md) a:

```
docs/ai-skills/loop-auditor.md
```

---

## Tarea 5: Commitear los cambios de infraestructura

```bash
git add docs/ai-skills/project-manager-autonomo.md
git add docs/ai-skills/loop-auditor.md
git add docs/ai-skills/complete-issue.md      # con el fix del template
git add docs/logs/loop-status.md
git add docs/capacitacion/agentic-loops/

git commit -m "$(cat <<'EOF'
feat: agregar infraestructura de agentic loop autónomo

- skill project-manager-autonomo: orquestador sin approval gates
- skill loop-auditor: auditoría periódica de integridad
- fix complete-issue: remover atribución IA del template de commit
- docs/capacitacion/agentic-loops/: módulo conceptual y práctico
- docs/logs/loop-status.md: log de auditoría del loop
EOF
)"
git push
```

---

## FASE 0: Verificación manual (hacer antes de automatizar)

Ejecutar manualmente las dos skills en issues reales. El objetivo es confirmar que funcionan bien antes de encadenarlas.

### F0-1: Probar project-manager-autonomo manualmente

```
/project-manager-autonomo [loop_count=0/1]
```

Verificar:

- [ ] Reporta correctamente el estado del proyecto
- [ ] Identifica el próximo issue según el roadmap
- [ ] Genera el prompt de handoff correctamente (con contexto completo)
- [ ] Actualiza `docs/logs/loop-status.md`
- [ ] **NO ejecutar el RemoteTrigger — solo revisar el output**

### F0-2: Probar complete-issue en modo autónomo

Ejecutar con el issue que `project-manager-autonomo` habría elegido:

```
Ejecutá el issue #[N] de forma autónoma siguiendo el workflow completo de complete-issue.
Modo: completamente autónomo.
Al terminar: NO disparar RemoteTrigger, solo mostrar qué habrías disparado.
```

Verificar:

- [ ] TDD correcto (Modo A o B según corresponda)
- [ ] Tests pasan
- [ ] TypeScript compila
- [ ] Issue cerrado en GitHub
- [ ] CLAUDE.md actualizado
- [ ] Commit hecho (con el formato correcto, sin atribución de IA)
- [ ] `human-context/` y `ai-context/` generados
- [ ] El prompt de retorno que habría disparado es correcto

### Criterio de salida de Fase 0

Ambas skills funcionan correctamente en modo manual. El output de cada una es predecible y correcto.

---

## FASE 1: Loop mínimo (1 issue, 2 sesiones)

### Cómo iniciarlo

```
/project-manager-autonomo [loop_count=0/1]
```

El `[loop_count=0/1]` le dice al skill que el límite es 1 issue. Después de que `complete-issue` termine, el loop_count llega a 1/1 y para solo.

### Qué monitorear

Después de que el loop termine:

```bash
# El issue fue cerrado?
gh issue view [N] --json state | jq '.state'    # debe ser "CLOSED"

# El commit existe?
git log --oneline -1

# El log fue actualizado?
cat docs/logs/loop-status.md

# Los tests siguen en verde?
npm run test --workspace=@amauta/api
```

### Criterio de salida de Fase 1

El loop completó 1 issue sin intervención. El estado del proyecto es coherente. El log refleja lo que pasó.

---

## FASE 2: Loop bidireccional (2 issues, 4 sesiones)

### Cómo iniciarlo

```
/project-manager-autonomo [loop_count=0/2]
```

### Qué verificar adicionalmente respecto a Fase 1

- [ ] El segundo `project-manager-autonomo` pudo determinar el estado correctamente (sin confusión por la sesión anterior)
- [ ] Los issues elegidos son los dos correctos según el roadmap
- [ ] El counter se propagó: 0/2 → 1/2 → 2/2 → STOP

### Criterio de salida de Fase 2

El loop bidireccional completo funciona. La información viaja correctamente entre las 4 sesiones.

---

## FASE 3: Loop con guardrails completos (5 issues)

### Cómo iniciarlo

```
/project-manager-autonomo [loop_count=0/5]
```

### Pruebas de guardrails a ejecutar

#### Prueba 3a: Parada por límite de sesiones

Iniciar con `[loop_count=0/2]` teniendo 5 issues disponibles. Verificar que para después de 2 issues, no continúa.

#### Prueba 3b: Parada por ausencia de issues

Cerrar todos los issues abiertos manualmente, luego iniciar el loop. Verificar que para limpiamente con el mensaje correcto.

#### Prueba 3c: Parada por tests fallidos (simulada)

Introducir un test que falla en el código antes de iniciar. Iniciar el loop. Verificar que `complete-issue` detecta el fallo y NO cierra el issue ni dispara `project-manager`.

**Revertir el test fallido después de la prueba.**

### Criterio de salida de Fase 3

Los tres guardrails funcionan correctamente. El loop para en las condiciones esperadas.

---

## FASE 4: Incorporar loop-auditor (cuando Fase 3 sea estable)

Modificar el prompt de handoff de `complete-issue → project-manager` para incluir la lógica de auditoría:

```
Al terminar:
1. Si loop_count % 3 == 0 → disparar loop-auditor
2. Si loop_count % 3 != 0 → disparar project-manager-autonomo directamente
```

### Primer uso

Iniciar con `[loop_count=0/6]` para que la auditoría se dispare una vez (en la sesión 3).

---

## Resumen de comandos para iniciar cada fase

| Fase   | Comando de inicio                                                        |
| ------ | ------------------------------------------------------------------------ |
| Fase 0 | Manual: `/project-manager-autonomo [loop_count=0/1]` (sin RemoteTrigger) |
| Fase 1 | `/project-manager-autonomo [loop_count=0/1]`                             |
| Fase 2 | `/project-manager-autonomo [loop_count=0/2]`                             |
| Fase 3 | `/project-manager-autonomo [loop_count=0/5]`                             |
| Fase 4 | `/project-manager-autonomo [loop_count=0/6]`                             |

---

## Cuándo escalar a producción (Fase 5)

Estás listo cuando:

- [ ] Fase 0-4 completadas exitosamente
- [ ] Al menos 10 issues ejecutados por el loop con 0 issues de calidad
- [ ] Los 3 guardrails probados y funcionando
- [ ] La auditoría intervino al menos 1 vez y detectó/ignoró correctamente
- [ ] El equipo revisó el output del loop y confía en él

En Fase 5 podés aumentar el límite a 8-10 issues y correr el loop con menos supervisión.
