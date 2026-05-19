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

## La solución: trasladar la aprobación al roadmap

La clave está en entender que la aprobación humana **no tiene que ocurrir en cada acción** — puede haber ocurrido antes, al definir el roadmap.

```
project-manager hace DOS cosas distintas:
│
├── A. Planificar trabajo nuevo (proponer ideas no definidas)
│      → Requiere supervisión humana SIEMPRE
│      → Esta parte NUNCA entra en el loop autónomo
│
└── B. Materializar el roadmap (crear/seleccionar issues definidos en él)
       → El roadmap ya fue aprobado: actuar sobre él no requiere nueva aprobación
       → Esta parte ES la que entra en el loop autónomo
```

El `project-manager-automata` solo hace B. Nunca A.

El roadmap funciona como **contrato firmado**: lo que está adentro está aprobado para ejecutarse.

---

## Las tres reglas del modo autónomo

### Regla 1: Solo materializa lo que ya está en el roadmap

```
✅ PUEDE: gh issue list → elegir el primero según roadmap
✅ PUEDE: gh issue create → solo para issues definidos en el roadmap
❌ NO PUEDE: gh issue create → para trabajo no contemplado en el roadmap
```

Si el roadmap no lo define, el loop no puede inventarlo. La aprobación humana del trabajo nuevo ocurre al editar el roadmap, no durante el loop.

### Regla 2: No modifica documentación de planificación

```
✅ PUEDE: leer roadmap.md, backlog.md, sprints.md
❌ NO PUEDE: modificar roadmap.md, backlog.md, sprints.md
```

La documentación de planificación la actualiza el humano. El loop la consume, no la altera. `complete-issue-automata` puede actualizar `CLAUDE.md`, `ai-context` y `human-context` (documentación operativa), pero no los documentos de gestión.

### Regla 3: No hace preguntas, decide y actúa

```
✅ HACE: evalúa estado → elige/crea issue → verifica condiciones → escribe next-prompt.md
❌ NO HACE: "¿Querés que ejecutemos el #82?" (el loop no tiene a nadie a quien preguntarle)
```

Si no puede decidir solo (dependencias no resueltas, estado inconsistente, ambigüedad), para el loop y lo registra en el log.

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

El `project-manager-automata` cumple este contrato:

**Entrada**: Estado actual del proyecto (GitHub + roadmap + CLAUDE.md)

**Proceso**:

1. Lee las tres fuentes
2. Resuelve inconsistencias seguras (CLAUDE.md desactualizado)
3. Determina situación: hay issues abiertos (A) o hay que materializar el roadmap (B)
4. Si B: crea los próximos issues definidos en el roadmap (máximo 3 por sesión)
5. Verifica condiciones de parada
6. Escribe `next-prompt.md` para el runner

**Salida**: `next-prompt.md` con el issue a ejecutar, O bien STOP con log

**Lo que nunca hace**: inventar trabajo fuera del roadmap, modificar roadmap/backlog/sprints, pedir confirmación

---

## Siguiente paso

[03-skill-automata.md](03-skill-automata.md) — El diseño completo del skill `project-manager-automata`.
