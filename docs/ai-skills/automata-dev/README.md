# automata-dev — Skills del Agentic Loop

Esta carpeta contiene los skills del sistema de automatización autónoma de desarrollo.
Son skills diseñados para operar **sin supervisión humana**, encadenando sesiones
mediante `next-prompt.md` para ejecutar issues de GitHub de forma continua.

---

## Contexto de lo implementado

El sistema resuelve el siguiente problema: ejecutar issues de desarrollo de forma
autónoma, en cadena, sin que el desarrollador tenga que iniciar cada sesión manualmente.

El loop funciona así:

```
[Desarrollador inicia + runner activo]
        │
        ▼
project-manager-automata
  → lee estado: GitHub + roadmap.md + CLAUDE.md
  → elige el próximo issue válido
  → escribe next-prompt.md con contexto de complete-issue-automata
        │
        ▼ (runner detecta next-prompt.md y arranca nueva sesión)
complete-issue-automata #N
  → ejecuta TDD + implementación + docs
  → cierra el issue
  → escribe next-prompt.md con contexto de project-manager-automata
        │
        ▼ (runner detecta next-prompt.md y arranca nueva sesión)
project-manager-automata  (nueva iteración)
  → repite hasta condición de parada
        │
        ▼
[Loop se detiene solo]
  → sin issues disponibles
  → límite de sesiones alcanzado
  → tests fallaron
  → contexto de sesión elevado
```

### Mecanismo de handoff

El handoff entre sesiones es agnóstico: cada sesión escribe el prompt de la
siguiente en `next-prompt.md`. Un runner externo detecta ese archivo y arranca
la próxima sesión. El runner es intercambiable (bash, PowerShell, GitHub Actions, cron).

Ver `IMPLEMENTACION.md` → Etapa 2 para las opciones de runner disponibles.

---

## Skills en esta carpeta

| Archivo                       | Rol en el loop                           | Cuándo se dispara                                     |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `project-manager-automata.md` | Orquestador: decide qué ejecutar         | Al inicio del loop y después de cada issue completado |
| `complete-issue-automata.md`  | Ejecutor: implementa el issue con TDD    | Disparado por project-manager-automata                |
| `loop-auditor.md`             | Auditor: verifica integridad del sistema | Cada 3 issues (Etapa 5 del plan de implementación)    |
| `project-manager-autonomo.md` | Versión original (interactiva)           | Uso manual, no forma parte del loop autónomo          |

---

## Archivos de estado

| Archivo          | Propósito                                            |
| ---------------- | ---------------------------------------------------- |
| `loop-status.md` | Log de sesiones — fuente de verdad del loop          |
| `next-prompt.md` | Prompt de la próxima sesión (handoff entre sesiones) |

`next-prompt.md` existe solo mientras hay una sesión pendiente de ejecutar.
Si no existe, el loop terminó o está esperando inicio manual.

---

## Relación con las skills existentes

| Skill existente      | Relación                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project-manager.md` | `project-manager-automata` es una variante sin approval gates. No reemplaza al original — son para contextos distintos (interactivo vs autónomo). |
| `complete-issue.md`  | `complete-issue-automata` es una copia con el PASO 12 de handoff agregado y sin atribución de IA en los commits. No modifica el skill global.     |

---

## Guardrails del sistema

Todos los skills de esta carpeta deben respetar:

1. **Solo issues existentes** — nunca crear issues en GitHub
2. **Solo lectura de docs de planificación** — nunca modificar roadmap.md, backlog.md ni sprints.md
3. **Sin preguntas al usuario** — el loop opera sin intervención humana
4. **STOP documentado** — cuando no pueden continuar, escriben en `loop-status.md` y terminan limpiamente
5. **Propagar loop_count** — el counter `[loop_count=X/N]` viaja en cada `next-prompt.md`
6. **No escribir next-prompt.md ante fallo** — tests fallidos, TypeScript roto o issue sin cerrar → STOP

---

## Documentación de referencia

Para entender el sistema en profundidad:

- Conceptual: `docs/capacitacion/agentic-loops/conceptual/`
- Práctico + análisis de skills: `docs/capacitacion/agentic-loops/practico/`
- Guía de implementación por fases: `docs/capacitacion/agentic-loops/IMPLEMENTACION.md`
