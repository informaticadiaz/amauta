# Implementación del Agentic Loop — Guía Coordinada

> Archivo único de implementación. Ejecutar en orden estricto.
> No avanzar a la siguiente etapa sin completar el criterio de salida de la anterior.
>
> **Prioridad absoluta**: Etapa 2 — las dos skills operando de forma autónoma.
> Todo lo anterior es preparación. Todo lo posterior es mejora.

---

## Estado de avance

Marcar cada ítem al completarlo.

```
[ ] ETAPA 0 — Preparación del entorno
[ ] ETAPA 1 — Verificación manual de las skills
[ ] ETAPA 2 — Loop mínimo autónomo ⭐ PRIORIDAD
[ ] ETAPA 3 — Loop bidireccional (2 issues)
[ ] ETAPA 4 — Guardrails completos
[ ] ETAPA 5 — Tercera skill: auditoría
```

---

## ETAPA 0 — Preparación del entorno

### 0.1 Verificar que el proyecto está en verde

```bash
npm run test -w @amauta/api
npm run test -w @amauta/web
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
gh issue list --label "phase-4" --state open --limit 10
```

**Criterio**: Todo en verde, al menos 1 issue abierto en phase-4.
Si algo falla → resolver antes de continuar.

---

### 0.2 Crear el archivo de log del loop

Crear `docs/ai-skills/automata-dev/loop-status.md` (dentro de la carpeta de la skill, autocontenido):

```
# Loop Status

## Estado actual
- Estado: NO INICIADO
- Última ejecución: —
- Último issue completado: —

## Historial
_vacío_
```

---

### 0.3 Crear las skills autónomas dentro de `automata-dev/`

Las skills del agentic loop viven en `docs/ai-skills/automata-dev/` y son copias
independientes de las skills globales. No tocar `docs/ai-skills/complete-issue.md`.

Crear:

- `docs/ai-skills/automata-dev/complete-issue-automata.md` — copia de `complete-issue`
  con el template de commit sin atribución de IA y con PASO 12 de handoff al loop
- `docs/ai-skills/automata-dev/project-manager-automata.md` — copia de `project-manager-automata`
  con referencias actualizadas a `complete-issue-automata` y `loop-status.md`

---

### 0.4 Verificar los skills autónomos

```bash
ls docs/ai-skills/automata-dev/
# Debe mostrar:
# README.md
# loop-auditor.md
# loop-status.md
# complete-issue-automata.md
# project-manager-automata.md
# project-manager-automata.md
```

Leer `docs/ai-skills/automata-dev/project-manager-automata.md` para familiarizarse
con el workflow antes de ejecutarlo.

---

### 0.5 Commitear la preparación

```bash
git add docs/ai-skills/automata-dev/
git add docs/capacitacion/agentic-loops/

git commit -m "$(cat <<'EOF'
feat: infraestructura del agentic loop autónomo

- docs/ai-skills/automata-dev/: complete-issue-automata, project-manager-automata, loop-status.md
- docs/capacitacion/agentic-loops/: documentación conceptual y práctica
EOF
)"
git push
```

**Criterio de salida de Etapa 0**: Archivos existen, tests siguen en verde, commit hecho.

---

---

## ETAPA 1 — Verificación manual de las skills

> Probar cada skill por separado antes de encadenarlas.
> El RemoteTrigger NO se ejecuta en esta etapa — solo se verifica el output.

### 1.1 Probar project-manager-automata

Iniciar una sesión con este prompt:

```
/project-manager-automata [loop_count=0/1]

IMPORTANTE: No ejecutes el RemoteTrigger. Solo mostrá el prompt completo
que habrías disparado y el contenido que escribirías en loop-status.md.
```

Verificar el output:

- [ ] Leyó correctamente el estado de GitHub, roadmap.md y CLAUDE.md
- [ ] Identificó el issue correcto según el roadmap
- [ ] El prompt de handoff incluye: número de issue, título, loop_count, instrucción de retorno, condiciones de parada
- [ ] El entry de loop-status.md es coherente con el estado real

### 1.2 Probar complete-issue en modo dry-run

Con el número de issue que project-manager-automata habría elegido:

```
Ejecutá el issue #[N] de forma autónoma siguiendo complete-issue.
Modo: completamente autónomo.
Al terminar: NO disparar RemoteTrigger. Solo mostrar el prompt que habrías disparado.
```

Verificar el output:

- [ ] Modo TDD correcto (A o B según el issue)
- [ ] Tests pasaron
- [ ] TypeScript compiló
- [ ] Issue cerrado en GitHub
- [ ] CLAUDE.md actualizado
- [ ] Commit hecho sin atribución de IA
- [ ] `human-context/` y `ai-context/` generados
- [ ] El prompt de retorno que habría disparado es correcto y completo

**Criterio de salida de Etapa 1**: Ambas skills producen el output esperado.
El prompt de handoff de cada una es suficiente para que la otra arranque sin confusión.

---

---

## ETAPA 2 — Loop mínimo autónomo ⭐

> Esta es la etapa central. El primer handoff real entre sesiones.
> project-manager-automata elige el issue → complete-issue lo ejecuta → para.

### Configuración

- Límite: 1 issue (`loop_count=0/1`)
- El complete-issue detecta `loop_count=1/1` y NO dispara la siguiente sesión
- 2 sesiones en total: project-manager → complete-issue

### Cómo iniciar

```
/project-manager-automata [loop_count=0/1]
```

### Qué esperar

```
Sesión 1: project-manager-automata
  → lee estado del proyecto
  → elige issue #N según roadmap
  → escribe en loop-status.md
  → dispara: complete-issue #N [loop_count=1/1]

Sesión 2: complete-issue #N
  → ejecuta TDD + implementación + docs
  → cierra issue en GitHub
  → actualiza CLAUDE.md
  → commit + push
  → detecta loop_count=1/1 → NO dispara → STOP con resumen
```

### Verificar después de que termine

```bash
# Issue cerrado correctamente
gh issue view [N] --json state,title

# Commit con formato correcto (sin atribución de IA)
git log --oneline -1
git show --stat HEAD

# Tests siguen en verde
npm run test -w @amauta/api

# Log actualizado
cat docs/logs/loop-status.md

# Documentación generada
ls docs/human-context/ | tail -5
```

### Criterio de salida de Etapa 2

- [ ] El issue correcto fue elegido por project-manager-automata
- [ ] El handoff ocurrió (la sesión 2 arrancó con el contexto correcto)
- [ ] El issue está cerrado en GitHub
- [ ] El commit tiene formato correcto
- [ ] Los tests siguen en verde
- [ ] loop-status.md refleja lo que pasó
- [ ] La sesión 2 paró sola al detectar `loop_count=1/1`

**Si esto funciona, el núcleo del sistema está validado.**

---

---

## ETAPA 3 — Loop bidireccional (2 issues, 4 sesiones)

> Probar el ciclo completo de ida y vuelta:
> project-manager → complete-issue → project-manager → complete-issue → STOP

### Cómo iniciar

```
/project-manager-automata [loop_count=0/2]
```

### Qué esperar

```
Sesión 1: project-manager-automata [0/2] → elige #N   → dispara complete-issue [1/2]
Sesión 2: complete-issue #N        [1/2] → completa   → dispara project-manager [1/2]
Sesión 3: project-manager-automata [1/2] → elige #N+1 → dispara complete-issue [2/2]
Sesión 4: complete-issue #N+1      [2/2] → completa   → detecta límite → STOP
```

### Verificar adicionalmente respecto a Etapa 2

- [ ] La sesión 3 determinó el estado correctamente (sin ver el historial de la sesión 1)
- [ ] Los dos issues elegidos son los correctos según el roadmap
- [ ] El counter se propagó: 0/2 → 1/2 → 1/2 → 2/2 → STOP
- [ ] loop-status.md tiene las 4 entradas

**Criterio de salida de Etapa 3**: El loop bidireccional completo funciona sin intervención humana.

---

---

## ETAPA 4 — Guardrails completos (5 issues)

> Probar que el sistema para correctamente ante cada condición de parada.
> Ejecutar las 3 pruebas antes de correr el loop completo.

### Prueba 4a — Parada por límite de sesiones

Teniendo más de 2 issues disponibles, iniciar con límite bajo:

```
/project-manager-automata [loop_count=0/2]
```

Verificar que para después de 2 issues aunque haya más disponibles.

### Prueba 4b — Parada por ausencia de issues

Solo ejecutar si hay 0 issues abiertos disponibles:

```bash
gh issue list --label "phase-4" --state open
```

Si hay 0, iniciar:

```
/project-manager-automata [loop_count=0/5]
```

Verificar que para inmediatamente con: "Loop completado. No hay más issues disponibles."

### Prueba 4c — Parada por tests fallidos (simulada)

1. Introducir un test que falla deliberadamente en cualquier `.spec.ts`
2. Iniciar el loop:

```
/project-manager-automata [loop_count=0/1]
```

3. Verificar que complete-issue detecta el fallo y NO cierra el issue ni dispara project-manager
4. **Revertir el test fallido inmediatamente después**

### Loop completo de Etapa 4

Una vez que las 3 pruebas pasaron:

```
/project-manager-automata [loop_count=0/5]
```

**Criterio de salida de Etapa 4**: Los 3 guardrails funcionan. El loop corre 5 issues sin intervención.

---

---

## ETAPA 5 — Tercera skill: loop-auditor

> Incorporar auditoría periódica cada 3 issues.
> Solo iniciar cuando Etapa 4 sea completamente estable.

### 5.1 El skill ya existe

El skill `loop-auditor` está en `docs/ai-skills/automata-dev/loop-auditor.md`.
Leerlo antes de continuar.

### 5.2 Modificar el handoff de complete-issue en modo autónomo

Cuando complete-issue opere dentro del loop, el prompt de retorno debe incluir
la lógica de auditoría. Agregar esta instrucción al prompt que dispara project-manager:

```
AL TERMINAR, antes de disparar la siguiente sesión:
- Calcular: ¿(loop_count_actual - 1) % 3 == 0?
  SÍ → disparar loop-auditor con: "[loop_count=X/N] [issues=#N-2,#N-1,#N]"
  NO → disparar project-manager-automata directamente
```

### 5.3 Primer uso con auditoría

```
/project-manager-automata [loop_count=0/6]
```

La auditoría se disparará después del issue 3 (`loop_count=3`).

**Criterio de salida de Etapa 5**: La auditoría intervino al menos una vez
y tomó la decisión correcta (CONTINUAR o STOP con reporte).

---

---

## Referencia rápida

| Etapa | Comando de inicio                                                          |
| ----- | -------------------------------------------------------------------------- |
| 0     | Tareas manuales + commit                                                   |
| 1     | `/project-manager-automata [loop_count=0/1]` + "no ejecutes RemoteTrigger" |
| 2     | `/project-manager-automata [loop_count=0/1]`                               |
| 3     | `/project-manager-automata [loop_count=0/2]`                               |
| 4     | Pruebas 4a/4b/4c → `/project-manager-automata [loop_count=0/5]`            |
| 5     | `/project-manager-automata [loop_count=0/6]`                               |

## Archivos del sistema

| Archivo                                                   | Propósito                        |
| --------------------------------------------------------- | -------------------------------- |
| `docs/ai-skills/automata-dev/project-manager-automata.md` | Skill orquestador del loop       |
| `docs/ai-skills/automata-dev/complete-issue-automata.md`  | Skill ejecutora del loop         |
| `docs/ai-skills/automata-dev/loop-auditor.md`             | Skill de auditoría               |
| `docs/ai-skills/automata-dev/README.md`                   | Contexto del sistema             |
| `docs/ai-skills/automata-dev/loop-status.md`              | Estado actual del loop           |
| `docs/ai-skills/automata-dev/audit-report-[fecha].md`     | Reportes de auditoría (Etapa 5+) |

## Cuándo escalar a producción

- [ ] Etapas 0-4 completadas sin sorpresas
- [ ] Al menos 5 issues ejecutados con calidad verificada
- [ ] Los 3 guardrails probados y funcionando

La Etapa 5 es una mejora — no es prerequisito para uso regular del loop.
