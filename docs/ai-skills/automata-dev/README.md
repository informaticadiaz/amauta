# automata-dev — Skills del Agentic Loop

Esta carpeta contiene los skills del sistema de automatización autónoma de desarrollo.
Son skills diseñados para operar **sin supervisión humana**, encadenando sesiones
mediante `RemoteTrigger` para ejecutar issues de GitHub de forma continua.

---

## Contexto de lo implementado

El sistema resuelve el siguiente problema: ejecutar issues de desarrollo de forma
autónoma, en cadena, sin que el desarrollador tenga que iniciar cada sesión manualmente.

El loop funciona así:

```
[Desarrollador inicia]
        │
        ▼
project-manager-autonomo
  → lee estado: GitHub + roadmap.md + CLAUDE.md
  → elige el próximo issue válido
  → dispara complete-issue via RemoteTrigger
        │
        ▼
complete-issue #N  (skill existente, sin modificaciones)
  → ejecuta TDD + implementación + docs
  → cierra el issue
  → dispara project-manager-autonomo via RemoteTrigger
        │
        ▼
project-manager-autonomo  (nueva iteración)
  → repite hasta condición de parada
        │
        ▼
[Loop se detiene solo]
  → sin issues disponibles
  → límite de sesiones alcanzado
  → tests fallaron
  → contexto de sesión elevado
```

---

## Skills en esta carpeta

| Archivo                       | Rol en el loop                           | Cuándo se dispara                                     |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `project-manager-autonomo.md` | Orquestador: decide qué ejecutar         | Al inicio del loop y después de cada issue completado |
| `loop-auditor.md`             | Auditor: verifica integridad del sistema | Cada 3 issues (Fase 5 del plan de implementación)     |

---

## Relación con las skills existentes

| Skill existente      | Relación                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project-manager.md` | `project-manager-autonomo` es una variante sin approval gates. No reemplaza al original — son para contextos distintos (interactivo vs autónomo). |
| `complete-issue.md`  | Se usa sin modificaciones. Solo necesita recibir el número de issue explícito y la instrucción de retorno en el prompt.                           |

---

## Guardrails del sistema

Todos los skills de esta carpeta deben respetar:

1. **Solo issues existentes** — nunca crear issues en GitHub
2. **Solo lectura de docs de planificación** — nunca modificar roadmap.md, backlog.md ni sprints.md
3. **Sin preguntas al usuario** — el loop opera sin intervención humana
4. **STOP documentado** — cuando no pueden continuar, escriben en `docs/logs/loop-status.md` y terminan limpiamente
5. **Propagar loop_count** — el counter `[loop_count=X/N]` viaja en cada RemoteTrigger

---

## Log de estado del loop

El loop escribe su estado en `docs/logs/loop-status.md`.
Ese archivo es la fuente de verdad para saber en qué estado quedó el loop
y qué hacer para retomarlo.

---

## Documentación de referencia

Para entender el sistema en profundidad:

- Conceptual: `docs/capacitacion/agentic-loops/conceptual/`
- Práctico + análisis de skills: `docs/capacitacion/agentic-loops/practico/`
- Guía de implementación por fases: `docs/capacitacion/agentic-loops/IMPLEMENTACION.md`
