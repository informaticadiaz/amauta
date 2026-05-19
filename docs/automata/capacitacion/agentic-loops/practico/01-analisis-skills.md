# 01 — Análisis de las Skills para Automatización

> Antes de diseñar el loop, hay que entender exactamente qué hacen las skills
> actuales y dónde están los puntos de fricción para la autonomía.

---

## Análisis de `project-manager`

Ubicación: `docs/ai-skills/project-manager.md`

### Lo que hace en modo interactivo

1. Al activarse con `/project-manager`, reporta estado en 5 bloques fijos
2. Pregunta al usuario qué issue o frente revisar (la pregunta de "foco")
3. Con confirmación del usuario: desglosa el issue con título, objetivo, alcance, checklist
4. Pide aprobación antes de crear el issue en GitHub
5. Pide aprobación antes de modificar documentación
6. Solo commitea/pushea con aprobación explícita

### Los puntos de fricción para autonomía

| Punto                      | Descripción                                      | Impacto                                                   |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| **Pregunta de foco**       | Siempre espera que el usuario elija qué trabajar | Bloquea el loop — el skill se detiene esperando respuesta |
| **Aprobación para GitHub** | No crea issues sin confirmación                  | El loop no puede planificar issues nuevos                 |
| **Aprobación para docs**   | No modifica backlog/roadmap sin confirmación     | El loop no puede actualizar el progreso                   |
| **Aprobación para commit** | No commitea sin confirmación                     | El loop no puede registrar el trabajo del project-manager |

### Lo que SÍ puede hacer en modo autónomo sin cambios

- Leer `roadmap.md`, `backlog.md`, `sprints.md` (lectura, no escritura)
- Consultar `gh issue list` para ver el estado real
- Determinar cuál es el próximo issue según el orden del roadmap
- Verificar dependencias entre issues

### Conclusión

`project-manager` no puede usarse directamente en el loop. Necesitamos una variante `project-manager-automata` que:

- No espere aprobación humana en cada ciclo — la aprobación se traslada al roadmap: lo que está en el roadmap está aprobado
- Pueda crear issues definidos en el roadmap cuando no haya issues abiertos
- Pueda escribir `next-prompt.md` para que el runner dispare la siguiente sesión

---

## Análisis de `complete-issue`

Ubicación: `docs/ai-skills/complete-issue.md`

### Lo que hace en modo interactivo

11 pasos: verificar estado → leer issue → cargar contexto → crear plan → escribir tests → verificar RED → implementar → verificar GREEN → documentar → commit → actualizar CLAUDE.md → cerrar issue.

### Los puntos de fricción para autonomía

| Punto                          | Descripción                                                                                          | Impacto                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Confirmación en PASO 0**     | Cuando no se especifica número de issue, presenta candidato y pregunta "¿Trabajamos con este?"       | Bloquea si no se pasa el número explícitamente             |
| **Divergencias entre fuentes** | Si detecta inconsistencias entre GitHub/roadmap/CLAUDE.md, "propone correcciones antes de continuar" | Puede bloquearse si el estado no está perfectamente limpio |

### Lo que YA es autónomo (sin cambios)

La mayoría del workflow de `complete-issue` ya es autónomo:

- TDD completo (Modos A y B) sin intervención
- Generación de `ai-context` y `human-context` automática
- Commit con formato estándar
- Cierre del issue con comentario descriptivo
- Actualización de CLAUDE.md

### Un bug detectado en el skill

El template de commit en `complete-issue` incluye:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

El `CLAUDE.md` del proyecto prohíbe explícitamente agregar atribución de IA a los commits. Esto es inconsistente y debe corregirse en el skill antes de usarlo en modo autónomo.

### Conclusión

`complete-issue` funciona casi sin cambios en modo autónomo. Solo hay que:

1. Pasar siempre el número de issue explícitamente (elimina la confirmación del PASO 0)
2. Agregar la instrucción de escribir `next-prompt.md` con la siguiente invocación de `project-manager-automata` al terminar
3. Corregir el template de commit (remover atribución de IA)

La variante resultante es `complete-issue-automata`, que vive en `docs/ai-skills/automata-dev/` junto con el orquestador.

---

## Mapa de adaptaciones necesarias

```
SKILL ACTUAL                    ADAPTACIÓN REQUERIDA
─────────────────────────────────────────────────────────
project-manager                 → project-manager-automata (skill nuevo)
  - pregunta de foco               - decide solo basado en roadmap
  - approval gate por acción       - aprobación trasladada al roadmap
  - sin handoff                    - escribe next-prompt.md para el runner

complete-issue                  → complete-issue-automata (skill adaptado)
  - confirmación PASO 0            - pasar número explícito: problema resuelto
  - sin handoff                    - escribe next-prompt.md con /project-manager-automata
  - bug: atribución IA en commit   - corregir en la versión autónoma
```

---

## Pasos antes de implementar el loop

Antes de poner el loop en marcha, hay dos cosas que deben existir en el proyecto:

1. **Las skills del loop** en `docs/ai-skills/automata-dev/` (`project-manager-automata`, `complete-issue-automata`, `loop-auditor`)
2. **El template de commit corregido** en la versión autónoma para respetar la regla de no atribución de IA

Ver [03-skill-automata.md](03-skill-automata.md) para el diseño del orquestador.
