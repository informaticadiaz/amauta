# Automata

Documentacion del sistema de desarrollo autonomo de Amauta.

Esta carpeta separa la referencia operativa del sistema actual, los disenos pendientes y el material de capacitacion. La implementacion viva de las skills no esta aca: vive en `docs/ai-skills/automata-dev/`.

## Orden de lectura

### Para entender el sistema actual

Leer primero:

1. [`agentic-loop-system.md`](agentic-loop-system.md)
2. `docs/ai-skills/automata-dev/README.md`
3. `docs/ai-skills/automata-dev/loop-status.md`

`agentic-loop-system.md` es la referencia principal: describe el loop, sus skills, el runner, los invariantes y los gaps conocidos.

### Para trabajar sobre mejoras del loop

Leer:

1. [`agentic-loop-system.md`](agentic-loop-system.md)
2. [`issue-closer.md`](issue-closer.md)
3. `docs/ai-skills/automata-dev/`

`issue-closer.md` es un documento de diseno pendiente. Describe una mejora propuesta para mover el cierre de issues a una skill separada con verificacion E2E antes de cerrar en GitHub.

### Para aprender el concepto desde cero

Leer:

1. [`capacitacion/agentic-loops/README.md`](capacitacion/agentic-loops/README.md)
2. `capacitacion/agentic-loops/conceptual/`
3. `capacitacion/agentic-loops/practico/`
4. [`capacitacion/agentic-loops/IMPLEMENTACION.md`](capacitacion/agentic-loops/IMPLEMENTACION.md)

El material de `capacitacion/` es pedagogico. Puede incluir explicaciones historicas, ejemplos y fases de adopcion que complementan, pero no reemplazan, la referencia operativa.

## Mapa de archivos

| Archivo                                                                                        | Proposito                                                |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`agentic-loop-system.md`](agentic-loop-system.md)                                             | Referencia del sistema autonomo actual y sus gaps        |
| [`issue-closer.md`](issue-closer.md)                                                           | Diseno pendiente para cierre de issues con evidencia E2E |
| [`capacitacion/agentic-loops/README.md`](capacitacion/agentic-loops/README.md)                 | Indice del modulo de capacitacion                        |
| [`capacitacion/agentic-loops/IMPLEMENTACION.md`](capacitacion/agentic-loops/IMPLEMENTACION.md) | Guia coordinada de implementacion por etapas             |
| `capacitacion/agentic-loops/conceptual/`                                                       | Fundamentos teoricos de agentic loops                    |
| `capacitacion/agentic-loops/practico/`                                                         | Aplicacion practica del loop en Amauta                   |
| `capacitacion/agentic-loops/presentacion.html`                                                 | Material visual para capacitacion                        |

## Archivos vivos del sistema

Los archivos que coordinan la ejecucion real estan fuera de esta carpeta:

| Archivo                                                   | Rol                                    |
| --------------------------------------------------------- | -------------------------------------- |
| `docs/ai-skills/automata-dev/project-manager-automata.md` | Orquestador del loop                   |
| `docs/ai-skills/automata-dev/complete-issue-automata.md`  | Ejecutor de issues                     |
| `docs/ai-skills/automata-dev/loop-auditor.md`             | Auditor periodico                      |
| `docs/ai-skills/automata-dev/loop-runner.sh`              | Runner Linux/macOS                     |
| `docs/ai-skills/automata-dev/loop-runner.ps1`             | Runner Windows                         |
| `docs/ai-skills/automata-dev/loop-status.md`              | Log y estado del loop                  |
| `docs/ai-skills/automata-dev/next-prompt.md`              | Handoff efimero para la proxima sesion |

## Criterio de mantenimiento

- Actualizar `agentic-loop-system.md` cuando cambie la arquitectura o el flujo real.
- Actualizar `issue-closer.md` mientras la mejora siga en etapa de diseno.
- Actualizar `capacitacion/` cuando se necesite explicar o ensenar el sistema, no como fuente primaria del estado actual.
- Usar siempre `docs/ai-skills/automata-dev/loop-status.md` como path del log real del loop.
