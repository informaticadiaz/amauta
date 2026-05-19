# 05 — La Tercera Skill: Auditoría de Arquitectura

## Por qué una tercera skill

El loop de dos skills (`project-manager-automata` → `complete-issue`) ejecuta issues de forma autónoma. Funciona bien para issues individuales bien definidos. Pero cuando se ejecutan 5-10 issues consecutivos sin supervisión, pueden acumularse problemas que ningún issue individual detecta:

- **Deuda técnica acumulada**: cada issue pasa sus propios tests, pero ¿pasa la suite completa?
- **Incoherencia arquitectónica**: un módulo nuevo no rompe nada por sí solo, pero después de 3 módulos nuevos, puede haber duplicación de lógica
- **Documentación desincronizada**: los contextos de IA (`ai-context/`) pueden estar levemente desactualizados si dos issues tocan el mismo módulo
- **Tipos TypeScript contradictorios**: dos issues separados pueden introducir tipos incompatibles que solo se detectan al compilar juntos

La tercera skill, `loop-auditor`, interviene periódicamente para detectar estos problemas antes de que se acumulen más.

---

## Cuándo interviene

La regla por defecto: **cada 3 issues completados**.

```
issue #N completado → issue #N+1 completado → issue #N+2 completado
                                                         │
                                              AUDITORÍA antes de continuar
                                                         │
                                                 ¿Todo bien?
                                                 SÍ → project-manager-automata
                                                 NO → STOP con reporte
```

Casos adicionales donde siempre se dispara:

- Después de cualquier issue con label `database` (toca Prisma)
- Al completar todos los issues de un sprint
- Si `complete-issue` reportó un coverage bajo (< 70%)

---

## Qué hace la auditoría

### Verificación 1: Suite completa de tests

```bash
# Correr todos los tests del proyecto
npm run test --workspace=@amauta/api
npm run test --workspace=@amauta/web
```

No es lo mismo que los tests del issue individual. Esta verificación confirma que los N issues ejecutados no rompieron nada entre sí.

**Criterio de falla**: Cualquier test que antes pasaba y ahora falla.

### Verificación 2: Compilación TypeScript completa

```bash
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
```

**Criterio de falla**: Cualquier error de tipos nuevo.

### Verificación 3: Consistencia de documentación de IA

Verificar que los módulos que fueron modificados tienen su `ai-context` actualizado:

```bash
# Issues completados en este bloque
gh issue list --state closed --limit [N] --json number,title,labels

# Para cada issue con label backend: verificar que existe docs/ai-context/modules/{modulo}.md
# Para cada issue con label frontend: verificar que existe docs/ai-context/frontend/
# Para cada issue con label database: verificar que docs/ai-context/database/schema.md está actualizado
```

**Criterio de falla**: Módulo modificado sin archivo de contexto correspondiente.

### Verificación 4: Estado coherente del CLAUDE.md

```bash
# Issues cerrados en GitHub
gh issue list --state closed --label "phase-4" --json number,title | jq length

# Issues marcados como completados en CLAUDE.md
grep -c "✅" CLAUDE.md
```

Si la diferencia es > 2, hay issues cerrados en GitHub que no están reflejados en CLAUDE.md.

**Criterio de falla**: Diferencia > 2 entre estado GitHub y CLAUDE.md.

---

## El reporte de auditoría

La auditoría genera `docs/ai-skills/automata-dev/audit-report-[fecha].md`:

```markdown
# Reporte de Auditoría del Loop — [fecha]

## Issues auditados

#[N-2], #[N-1], #[N]

## Resultado: ✅ APROBADO / ❌ BLOQUEADO

## Verificaciones

### Tests completos

- API: [X] tests pasando / [Y] fallando
- Web: [X] tests pasando / [Y] fallando
- Resultado: ✅ / ❌

### TypeScript

- Backend: sin errores / [N] errores
- Frontend: sin errores / [N] errores
- Resultado: ✅ / ❌

### Documentación IA

- Módulos verificados: [lista]
- Módulos faltantes: [lista o ninguno]
- Resultado: ✅ / ❌

### Coherencia CLAUDE.md

- Issues en GitHub: [N]
- Issues en CLAUDE.md: [N]
- Diferencia: [0 o número]
- Resultado: ✅ / ❌

## Decisión

✅ CONTINUAR: El loop puede seguir ejecutando issues.
❌ STOP: [razón específica]. Acción requerida: [qué hacer].
```

---

## El skill completo

Contenido para `docs/ai-skills/loop-auditor.md`:

```markdown
---
name: loop-auditor
description: Auditoría periódica del agentic loop. Verifica que la suite completa
  de tests pasa, TypeScript compila, la documentación de IA está actualizada y
  CLAUDE.md es coherente con GitHub. Interviene cada 3 issues o después de
  issues de Prisma. Output: CONTINUAR o STOP con reporte.
---

# Loop Auditor

## Propósito

Verificación de integridad del sistema después de N issues ejecutados en el loop
autónomo. No ejecuta código de negocio — solo verifica que el estado del proyecto
es coherente y saludable antes de continuar.

## Workflow

### PASO 1 — Identificar issues auditados

Leer del prompt de entrada: cuáles son los N issues del bloque actual.
También verificar con: `gh issue list --state closed --limit [N] --json number,title`

### PASO 2 — Correr verificaciones

Ejecutar en orden:

1. `npm run test --workspace=@amauta/api`
2. `npm run test --workspace=@amauta/web`
3. `npx tsc --noEmit -p apps/api/tsconfig.json`
4. `npx tsc --noEmit -p apps/web/tsconfig.json`
5. Verificar ai-context de módulos modificados
6. Verificar coherencia CLAUDE.md vs GitHub

### PASO 3 — Generar reporte

Crear `docs/ai-skills/automata-dev/audit-report-[fecha].md` con el formato estándar.

### PASO 4 — Decisión

Si TODAS las verificaciones pasaron:
→ escribir next-prompt.md ("/project-manager-automata [loop_count=[X]/[N_max]] [post-audit]")

Si ALGUNA verificación falló:
→ NO escribir next-prompt.md
→ Terminar con: "Auditoría BLOQUEADA. Ver docs/ai-skills/automata-dev/audit-report-[fecha].md"
→ Actualizar `docs/ai-skills/automata-dev/loop-status.md` con la parada

## Guardrails

- No modificar código
- No cerrar issues
- No modificar documentación de gestión
- Solo leer + ejecutar tests + escribir reporte
```

---

## Integración en el loop principal

Con la tercera skill, el loop completo queda:

```
project-manager-automata
        │
        ▼ (cada issue)
complete-issue #N
        │
   ¿N % 3 == 0?
   ├── NO → project-manager-automata
   └── SÍ → loop-auditor
                  │
             ¿Audit ok?
             ├── SÍ → project-manager-automata
             └── NO → STOP + reporte
```

La modificación en `complete-issue` (modo autónomo) es mínima: verificar si `loop_count % 3 == 0` y en ese caso disparar `loop-auditor` en lugar de `project-manager-automata`.

---

## Siguiente paso

[06-implementacion.md](06-implementacion.md) — Guía paso a paso para implementar el loop desde Fase 0 hasta Fase 3.
