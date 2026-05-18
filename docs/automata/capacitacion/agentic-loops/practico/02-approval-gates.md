# 02 — El Problema de los Approval Gates

## Qué son los approval gates

Los approval gates son los puntos del workflow donde el skill se detiene y espera confirmación explícita del usuario antes de continuar. Son una característica de seguridad deliberada en `project-manager`:

```markdown
# Del skill project-manager:

### 3. Aprobación y creación

- Pedir aprobación antes de crear issues en GitHub.
- Solo crear issues con `gh issue create` después de la aprobación.
- No ejecutar comandos de GitHub ni modificar archivos como sustituto de una aprobación ausente.

### 4. Documentación

- No modificar documentación sin aprobación explícita.
```

En modo interactivo esto es correcto. En modo autónomo, son el mayor obstáculo.

---

## Por qué existen (y por qué hay que respetarlos en el diseño)

Los approval gates de `project-manager` existen porque la skill puede:

1. **Crear issues en GitHub** — acción pública, visible al equipo, difícil de revertir limpiamente
2. **Modificar documentación de gestión** — `backlog.md`, `roadmap.md`, `sprints.md` son fuentes de verdad del proyecto
3. **Proponer nuevas features** — puede sugerir trabajo que no estaba planeado

Si un loop autónomo crea issues erróneos o modifica el roadmap incorrectamente, el daño es real.

---

## La solución: separar responsabilidades

La clave está en entender **qué parte** de `project-manager` necesita autonomía y cuál no.

```
project-manager hace DOS cosas distintas:
│
├── A. Planificar (crear issues nuevos, proponer trabajo)
│      → Requiere supervisión humana SIEMPRE
│      → Esta parte NUNCA entra en el loop autónomo
│
└── B. Seleccionar (elegir cuál issue existente ejecutar a continuación)
       → Completamente determinista (sigue el roadmap)
       → Esta parte ES la que entra en el loop autónomo
```

El `project-manager-autonomo` solo hace B. Nunca A.

---

## Las tres reglas del modo autónomo

### Regla 1: Solo trabaja con issues existentes en GitHub

```
✅ PUEDE: gh issue list → elegir el primero según roadmap
❌ NO PUEDE: gh issue create → crear issues nuevos
```

Los issues nuevos los crea el humano. El loop solo ejecuta lo que ya fue aprobado.

### Regla 2: No modifica documentación de planificación

```
✅ PUEDE: leer roadmap.md, backlog.md, sprints.md
❌ NO PUEDE: modificar roadmap.md, backlog.md, sprints.md
```

La documentación de planificación la actualiza el humano o el `complete-issue` (que actualiza CLAUDE.md, ai-context y human-context, no los docs de gestión).

### Regla 3: No hace preguntas, decide y actúa

```
✅ HACE: evalúa estado → elige issue → verifica condiciones → escribe next-prompt.md (handoff)
❌ NO HACE: "¿Querés que ejecutemos el #82?" (el loop no tiene a nadie a quien preguntarle)
```

Si no puede decidir solo (dependencias no resueltas, estado inconsistente), para el loop y lo registra en el log.

---

## Qué pasa si el estado es inconsistente

`project-manager` en modo interactivo "muestra las divergencias al usuario y propone correcciones". En modo autónomo, no hay usuario. Las reglas son:

| Inconsistencia                                             | Acción autónoma                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Issue cerrado en GitHub pero pendiente en CLAUDE.md        | Actualizar CLAUDE.md (acción segura, lectura+escritura local)        |
| Issue abierto en GitHub pero marcado completo en CLAUDE.md | STOP: no es seguro asumir qué pasó. Registrar en log.                |
| Orden diferente entre roadmap.md y GitHub                  | Seguir roadmap.md (es la fuente de verdad definida)                  |
| Dependencia de issue sin resolver                          | Buscar el siguiente candidato sin esa dependencia. Si no hay → STOP. |

La regla general: **si la incertidumbre implica riesgo de ejecutar el issue incorrecto → STOP con log.**

---

## El contrato del skill autónomo

El `project-manager-autonomo` cumple este contrato:

**Entrada**: Estado actual del proyecto (GitHub + roadmap + CLAUDE.md)

**Proceso**:

1. Lee las tres fuentes
2. Resuelve inconsistencias seguras (CLAUDE.md desactualizado)
3. Determina el próximo issue según roadmap
4. Verifica condiciones de parada
5. Construye el prompt de handoff

**Salida**: `next-prompt.md` con el issue a ejecutar, O bien STOP con log

**Lo que nunca hace**: crear issues, modificar roadmap/backlog/sprints, pedir confirmación

---

## Siguiente paso

[03-skill-autonomo.md](03-skill-autonomo.md) — El diseño completo del skill `project-manager-autonomo`.
