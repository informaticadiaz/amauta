# 06 — Guía de Implementación: De Fase 0 a Fase 4

> Instrucciones concretas para poner el loop en marcha en el proyecto Amauta.
> Seguir en orden. No saltar fases.
>
> Esta guía es la versión pedagógica. La versión operativa con estado de avance
> marcado está en [../IMPLEMENTACION.md](../IMPLEMENTACION.md).

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

## Tarea 1: Verificar el archivo de log

El log del loop ya existe en `ia-skills/automation/loop-status.md`.
Verificar que está presente:

```bash
ls ia-skills/automation/loop-status.md
```

Si no existe, crearlo con esta estructura mínima:

```markdown
# Loop Status

## Estado del loop

- Última ejecución: —
- Estado: NO INICIADO

## Historial

_vacío_
```

---

## Tarea 2: Verificar que los skills del loop existen

Los tres skills viven en `ia-skills/automation/`:

```bash
ls ia-skills/automation/project-manager-automata.md
ls ia-skills/automation/complete-issue-automata.md
ls ia-skills/automation/loop-auditor.md
```

Si alguno falta, revisar el commit donde se introdujo `automata-dev/` antes de avanzar.

---

## Tarea 3: Configurar el runner

El loop necesita un proceso externo (runner) que detecte cuando se escribe
`ia-skills/automation/next-prompt.md` y arranque una nueva sesión de
Claude Code con ese prompt.

Hay dos runners de ejemplo en `ia-skills/automation/`:

- `loop-runner.sh` (Linux/macOS)
- `loop-runner.ps1` (Windows)

Ambos hacen lo mismo: vigilan el archivo `next-prompt.md`, y cuando aparece o
cambia, lanzan `claude code` con su contenido.

---

## FASE 0: Verificación manual de las skills

Ejecutar las skills manualmente antes de encadenarlas. Objetivo: confirmar que
cada una funciona bien sin loop.

### F0-1: Probar `project-manager-automata` manualmente

```
/project-manager-automata [loop_count=0/1]
```

Verificar:

- [ ] Reporta correctamente el estado del proyecto
- [ ] Identifica el próximo issue según el roadmap
- [ ] Genera el `next-prompt.md` con contexto completo
- [ ] Actualiza `loop-status.md`
- [ ] **Eliminar `next-prompt.md` después de leerlo, para que el runner no arranque**

### F0-2: Probar `complete-issue-automata` manualmente

Ejecutar con el issue que `project-manager-automata` habría elegido:

```
/complete-issue-automata #[N]
```

Verificar:

- [ ] TDD correcto (Modo A o B según corresponda)
- [ ] Tests pasan
- [ ] TypeScript compila
- [ ] Issue cerrado en GitHub
- [ ] CLAUDE.md actualizado
- [ ] Commit hecho (sin atribución de IA)
- [ ] `human-context/` y `ai-context/` generados
- [ ] El `next-prompt.md` que escribe es correcto

### Criterio de salida de Fase 0

Ambas skills funcionan correctamente en modo manual. El output de cada una es
predecible y correcto.

---

## FASE 1: Loop mínimo (1 issue, 2 sesiones)

### Cómo iniciarlo

Con el runner corriendo:

```
/project-manager-automata [loop_count=0/1]
```

`[loop_count=0/1]` le dice al skill que el límite es 1 issue. Después de que
`complete-issue-automata` termine, el loop_count llega a 1/1 y para solo.

### Qué monitorear

Después de que el loop termine:

```bash
# El issue fue cerrado?
gh issue view [N] --json state | jq '.state'    # debe ser "CLOSED"

# El commit existe?
git log --oneline -1

# El log fue actualizado?
cat ia-skills/automation/loop-status.md

# Los tests siguen en verde?
npm run test --workspace=@amauta/api
```

### Criterio de salida de Fase 1

El loop completó 1 issue sin intervención. El estado del proyecto es coherente.
El log refleja lo que pasó.

---

## FASE 2: Loop bidireccional (2 issues, 4 sesiones)

### Cómo iniciarlo

```
/project-manager-automata [loop_count=0/2]
```

### Qué verificar adicionalmente respecto a Fase 1

- [ ] La segunda invocación de `project-manager-automata` pudo determinar el estado correctamente (sin confusión por la sesión anterior)
- [ ] Los issues elegidos son los dos correctos según el roadmap
- [ ] El counter se propagó: 0/2 → 1/2 → 2/2 → STOP

### Criterio de salida de Fase 2

El loop bidireccional completo funciona. La información viaja correctamente
entre las 4 sesiones.

---

## FASE 3: Loop con guardrails completos (5 issues)

### Cómo iniciarlo

```
/project-manager-automata [loop_count=0/5]
```

### Pruebas de guardrails a ejecutar

#### Prueba 3a: Parada por límite de sesiones

Iniciar con `[loop_count=0/2]` teniendo 5 issues disponibles. Verificar que para
después de 2 issues, no continúa.

#### Prueba 3b: Parada por ausencia de issues y de roadmap

Cerrar todos los issues abiertos manualmente, y modificar localmente el roadmap
para que no haya "Próximos pasos" definidos. Iniciar el loop. Verificar que
para limpiamente con el mensaje correcto.

#### Prueba 3c: Parada por tests fallidos

Introducir un test que falla en el código antes de iniciar. Iniciar el loop.
Verificar que `complete-issue-automata` detecta el fallo y NO cierra el issue
ni escribe `next-prompt.md`.

**Revertir el test fallido después de la prueba.**

### Criterio de salida de Fase 3

Los tres guardrails funcionan correctamente. El loop para en las condiciones
esperadas.

---

## FASE 4: Incorporar `loop-auditor`

Modificar el prompt de handoff de `complete-issue-automata → project-manager-automata`
para incluir la lógica de auditoría:

```
Al terminar:
1. Si loop_count % 3 == 0 → disparar loop-auditor
2. Si loop_count % 3 != 0 → disparar project-manager-automata directamente
```

### Primer uso

Iniciar con `[loop_count=0/6]` para que la auditoría se dispare una vez (en la
sesión 3).

---

## Resumen de comandos para iniciar cada fase

| Fase   | Comando de inicio                                                           |
| ------ | --------------------------------------------------------------------------- |
| Fase 0 | Manual: `/project-manager-automata [loop_count=0/1]` (eliminar next-prompt) |
| Fase 1 | `/project-manager-automata [loop_count=0/1]`                                |
| Fase 2 | `/project-manager-automata [loop_count=0/2]`                                |
| Fase 3 | `/project-manager-automata [loop_count=0/5]`                                |
| Fase 4 | `/project-manager-automata [loop_count=0/6]`                                |

---

## Cuándo escalar a producción

Estás listo cuando:

- [ ] Fase 0-4 completadas exitosamente
- [ ] Al menos 5 issues ejecutados por el loop con calidad verificada
- [ ] Los 3 guardrails probados y funcionando
- [ ] La auditoría intervino al menos 1 vez y tomó la decisión correcta
- [ ] El equipo revisó el output del loop y confía en él

En modo "producción" podés aumentar el límite a 8-10 issues y correr el loop
con menos supervisión activa.
