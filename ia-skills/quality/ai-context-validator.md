# Skill: AI Context Validator

> Audita sincronización entre `docs/ai-context/` y código real. Detecta desviaciones, reporta, corrige documentación u abre issues. No edita código de aplicación.

---

## 1. Modo activo (contrato)

Mientras esta skill esté vigente, cada prompt del usuario se interpreta dentro del modelo de comportamiento definido abajo. La skill funciona como un **autómata de 6 situaciones** con transiciones controladas. En cada situación hay un conjunto cerrado de jugadas disponibles; el modelo elige entre ellas pero no inventa nuevas.

### Vigencia

Empieza al invocar la skill. Termina cuando:

- El usuario dice "salir / cerrar / fin de validación"
- El usuario invoca explícitamente otra skill
- Se llega a la situación terminal vía la jugada "cerrar"

---

## 2. Modelo de comportamiento (6 situaciones)

```
        ┌──────────────┐
        │  S0          │  invocación
        │  recibir     │
        │  scope       │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  S1          │  validar contra el código
        │  ejecutar    │  generar informe
        │  auditoría   │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐◄────────────────┐
        │  S2          │                 │
        │  informe     │                 │
        │  presentado  │                 │
        └──┬─┬─┬─┬──┬──┘                 │
           │ │ │ │  │                    │
     ┌─────┘ │ │ │  └─────┐              │
     ▼       ▼ ▼ ▼        ▼              │
  ┌─────┐ ┌────┐ ┌────┐ ┌─────┐          │
  │ S3  │ │ S4 │ │ S5 │ │ S1  │          │
  │ doc │ │iss.│ │drill│ │ re- │          │
  │ fix │ │    │ │down │ │val. │          │
  └──┬──┘ └─┬──┘ └─┬──┘ └─────┘          │
     │      │      │                      │
     └──────┴──────┴──────────────────────┘
                  (regreso a S2)
```

| ID  | Nombre               | Propósito                                                            |
| --- | -------------------- | -------------------------------------------------------------------- |
| S0  | Recepción de scope   | Determinar qué validar (all / módulo / frontend / database)          |
| S1  | Ejecutando auditoría | Correr la comparación doc↔código y producir informe                  |
| S2  | Informe presentado   | Mostrar resultados, ofrecer jugadas, esperar decisión                |
| S3  | Corrección de doc    | Aplicar fixes a `docs/ai-context/**` para alinear con código real    |
| S4  | Apertura de issue    | Crear issue con `gh` para problemas que requieren cambio de código   |
| S5  | Drill-down           | Profundizar en un hallazgo específico (mostrar archivos, root cause) |

> **Trazabilidad obligatoria**: cada respuesta del modelo durante el contrato empieza con `[S{n}]` indicando la situación actual. Cuando hay transición: `[S{n} → S{m}] motivo`.

---

## 3. S0 — Recepción de scope

**Entrada:** invocación de la skill.

**Acción:**

1. Leer el argumento del usuario (si lo dio): `all`, nombre de módulo, `frontend`, `database`.
2. Si no especificó: preguntar **una vez**:

   > "¿Qué scope validamos? Opciones: `all` (todo), `frontend`, `database`, o el nombre de un módulo (ej: `cursos`)."

3. Cuando hay scope: anunciar transición y pasar a S1.

**Salida:** `scope` (string).

**Transición única:** `[S0 → S1]` con el scope elegido.

**Interactividad permitida:** sí, pregunta única por el scope si falta.

---

## 4. S1 — Ejecutando auditoría

**Entrada:** scope desde S0 (o desde S2 vía jugada "re-validar").

**Acción:** ejecutar el procedimiento de validación de abajo, sin interrupciones, y al terminar generar un informe. Esta situación **no acepta input intermedio del usuario**; si el usuario habla mientras está en S1, responder `[S1] auditando, te respondo cuando termine`.

### Procedimiento de validación

#### 4.1 — Validar `_index.md`

```
LEER: docs/ai-context/_index.md
```

Para cada archivo listado en las tablas del índice:

- Verificar que existe el archivo referenciado (`modules/*.md`, `frontend/*.md`, `database/*.md`).
- Verificar que no haya archivos en esas carpetas que **no** estén listados (huérfanos).

#### 4.2 — Validar módulos backend

Para cada `docs/ai-context/modules/{modulo}.md` dentro del scope:

1. **Archivos del módulo**: extraer la tabla y verificar que cada archivo declarado existe en `apps/api/src/{modulo}/`.
2. **Endpoints**: extraer la tabla "Endpoints API" y leer `apps/api/src/{modulo}/{modulo}.controller.ts`. Comparar:
   - método HTTP (`@Get`, `@Post`, `@Patch`, `@Delete`)
   - ruta
   - decoradores `@Roles(...)` / `@Public()`
3. **Modelo Prisma**: comparar el bloque Prisma documentado con `apps/api/prisma/schema.prisma`:
   - nombre del modelo, campos, tipos, relaciones, enums.

Clasificar cada desviación como:

- 🔴 **Crítico**: doc afirma algo que el código no respalda (endpoint fantasma, campo inexistente, modelo inexistente, tipo incorrecto).
- 🟡 **Advertencia**: código tiene algo que la doc no menciona (endpoint sin documentar, campo nuevo).
- 🟢 **Info**: archivos en código sin doc (módulos enteros sin contexto), o archivos de doc no listados en el índice.

#### 4.3 — Validar frontend

Si scope incluye frontend:

- `frontend/pages.md`: verificar cada ruta documentada contra `apps/web/src/app/{ruta}/page.tsx`.
- `frontend/components.md`: verificar componentes en `apps/web/src/components/**` y comparar props documentadas con la interfaz real.
- `frontend/hooks.md`: verificar hooks en `apps/web/src/hooks/**` y firma.

#### 4.4 — Validar `database/schema.md`

Si scope incluye database:

- Comparar cada modelo documentado con `apps/api/prisma/schema.prisma`.
- Verificar enums: nombre + lista de valores.
- Reportar modelos en Prisma sin doc, modelos en doc sin Prisma, campos divergentes.

#### 4.5 — Detectar huérfanos

- Módulos en `apps/api/src/` sin `docs/ai-context/modules/*.md` (excluyendo `common`, `config`, `prisma`, `seed`).
- Archivos en `docs/ai-context/modules/` sin módulo correspondiente en código.

#### 4.6 — Producir informe

Formato del informe (obligatorio):

```markdown
# Informe de Validación AI Context

**Fecha:** {YYYY-MM-DD}
**Scope:** {all | módulo | frontend | database}
**Estado:** ✅ SINCRONIZADO | ⚠️ DESINCRONIZADO PARCIAL | ❌ DESINCRONIZADO

## Resumen

{2-3 oraciones}

## Hallazgos 🔴 Críticos

| #   | Ubicación | Problema | Tipo de fix          |
| --- | --------- | -------- | -------------------- |
| C1  | …         | …        | doc / código / ambos |

## Hallazgos 🟡 Advertencias

| # | Ubicación | Problema | Tipo de fix |

## Hallazgos 🟢 Info

| # | Elemento | Acción sugerida |

## Estadísticas

| Categoría | Total | OK | Problemas |
```

**Criterios de estado:**

| Estado                    | Condición                   |
| ------------------------- | --------------------------- |
| ✅ SINCRONIZADO           | 0 críticos, 0 advertencias  |
| ⚠️ DESINCRONIZADO PARCIAL | 0 críticos, >0 advertencias |
| ❌ DESINCRONIZADO         | ≥1 crítico                  |

**Transición única:** `[S1 → S2]` con el informe como salida.

**Interactividad permitida:** ninguna (silenciosa hasta terminar).

---

## 5. S2 — Informe presentado

**Entrada:** informe generado por S1.

**Acción:** mostrar el informe completo y debajo la **lista de jugadas disponibles**:

```
[S2] Jugadas disponibles:
  J1. Corregir documentación de un hallazgo                → S3
  J2. Abrir issue de GitHub para un hallazgo               → S4
  J3. Profundizar en un hallazgo (drill-down)              → S5
  J4. Re-validar con otro scope                            → S1
  J5. Cerrar la skill                                       → fin
```

**Esperar input del usuario.**

### Mapeo de intención → jugada (tabla cerrada)

| Frase del usuario                           | Jugada              |
| ------------------------------------------- | ------------------- |
| "arreglá la doc / corregí doc / fix doc N"  | J1                  |
| "abrí issue / creá issue para N"            | J2                  |
| "explicá N / profundizá / contame más de N" | J3                  |
| "re-validá / volvé a validar X"             | J4                  |
| "cerrá / salir / fin"                       | J5                  |
| **Cualquier otra cosa**                     | **OUT** (sección 9) |

**Interactividad permitida:** sí. Si la jugada referencia un hallazgo y no se identificó cuál (ej: "arreglá la doc" sin número), preguntar **una vez**: "¿Cuál hallazgo? Opciones: C1, C2, …".

---

## 6. S3 — Corrección de documentación

**Entrada:** hallazgo seleccionado desde S2.

**Acción:**

1. Confirmar que el hallazgo es "fix doc" (no "fix código"). Si es fix código → rechazar y sugerir J2 (abrir issue).
2. Leer el archivo de doc afectado (`docs/ai-context/**`).
3. Generar el diff propuesto (qué líneas se borran/agregan).
4. **Mostrar diff al usuario y pedir OK**:

   ```
   [S3] Diff propuesto para docs/ai-context/modules/{modulo}.md:

   - {línea vieja}
   + {línea nueva}

   ¿Aplico? (sí / no / editame {cambio})
   ```

5. Según respuesta:
   - **sí** → aplicar con `Edit`, reportar archivo modificado, volver a S2 con el hallazgo marcado ✅ resuelto.
   - **no** → no tocar nada, volver a S2 con el hallazgo intacto.
   - **editame …** → ajustar el diff y volver al paso 4.

**Acciones permitidas en S3:**

- ✅ Leer cualquier archivo del repo (para contexto).
- ✅ `Edit` / `Write` sobre archivos dentro de `docs/ai-context/**`.
- ❌ Editar cualquier otra cosa. Si el fix requiere tocar `apps/**` → rechazar y derivar a J2.

**Transición:** `[S3 → S2]` (siempre se vuelve a S2 después de un fix, exitoso o rechazado).

**Interactividad permitida:** sí, una pregunta de confirmación del diff por hallazgo.

---

## 7. S4 — Apertura de issue

**Entrada:** hallazgo seleccionado desde S2, generalmente uno cuyo fix requiere código.

**Acción:**

1. Generar título y cuerpo del issue siguiendo esta plantilla:

   ```
   Título: docs/código desincronizado: {resumen del hallazgo}

   Cuerpo:
   ## Contexto
   Detectado por la skill ai-context-validator el {fecha}.

   ## Hallazgo {ID}
   - Ubicación doc: {archivo:línea}
   - Ubicación código: {archivo:línea}
   - Tipo: {endpoint fantasma | modelo divergente | …}

   ## Descripción
   {detalle del hallazgo del informe}

   ## Resolución sugerida
   - [ ] {opción A: alinear código a la doc}
   - [ ] {opción B: alinear doc al código}
   ```

2. **Mostrar al usuario** título + cuerpo y pedir OK.
3. Si OK → ejecutar `gh issue create --title "…" --body "…"`.
4. Reportar URL del issue creado.

**Acciones permitidas en S4:**

- ✅ `gh issue create`
- ❌ Crear PRs, hacer commits, cualquier modificación de código.

**Transición:** `[S4 → S2]`.

**Interactividad permitida:** sí, confirmación del título/cuerpo antes de crear.

---

## 8. S5 — Drill-down en un hallazgo

**Entrada:** hallazgo seleccionado desde S2.

**Acción:**

1. Leer los archivos involucrados (doc + código real).
2. Mostrar al usuario:
   - Fragmento exacto de la doc afectada (con línea).
   - Fragmento exacto del código contradictorio (con línea).
   - Explicación de la divergencia.
   - Por qué es 🔴 / 🟡 / 🟢.
3. Sugerir qué jugada de S2 sería natural para resolverlo (J1 o J2).

**Acciones permitidas en S5:**

- ✅ `Read`, `Grep`, `Glob` para análisis.
- ❌ Cualquier escritura.

**Transición:** `[S5 → S2]`.

**Interactividad permitida:** no requiere pregunta; es solo output.

---

## 9. Política de fuera de alcance (OUT)

Cuando un prompt del usuario **no mapea** a ninguna jugada disponible en la situación actual:

```
[S{n}] Eso no está dentro de las jugadas disponibles en esta situación.
Estoy en {nombre situación}. Jugadas posibles:
  J1. …
  J2. …
  Jn. …

Opciones:
  a) elegí una de las jugadas listadas
  b) "salir" para cerrar la skill y operar libremente
  c) invocá otra skill (ej: si querés implementar código, esta skill
     no lo hace — necesitarías una skill de implementación)
```

**NO improvisar.** No ejecutar el pedido del usuario aunque parezca razonable. Esperar decisión explícita.

### Ejemplos de pedidos OUT (no se ejecutan)

| Pedido del usuario en S2             | Por qué es OUT                          | Qué hacer                   |
| ------------------------------------ | --------------------------------------- | --------------------------- |
| "implementá los endpoints faltantes" | S2 no tiene jugada "implementar código" | responder con plantilla OUT |
| "commiteá los cambios"               | S2 no tiene jugada "commit"             | responder con plantilla OUT |
| "borrá el archivo X"                 | S2 no tiene jugada "delete"             | responder con plantilla OUT |
| "ejecutá los tests"                  | S2 no tiene jugada "test"               | responder con plantilla OUT |

---

## 10. Lista negra global (redundante con whitelist, explícita por seguridad)

Independientemente de la situación, esta skill **nunca** hace:

- Editar archivos en `apps/**` o `packages/**`.
- Hacer commits o push.
- Borrar archivos (ni con `Edit`/`Write` vaciando, ni con bash `rm`).
- Modificar `package.json`, `tsconfig.json`, `prisma/schema.prisma` u otros archivos de configuración.
- Invocar otras skills sin pedido explícito del usuario.
- Ejecutar migraciones de DB, seeds, tests, builds.

Si el flujo aparenta requerir alguna de estas: detener, reportar, salir del contrato (J5) y dejar al usuario tomar la decisión fuera de la skill.

---

## 11. Trazabilidad

Toda respuesta del modelo durante el contrato sigue este formato:

```
[S{n}{ → S{m} opcional}] {contenido}
```

Ejemplos:

- `[S0] ¿Qué scope validamos?`
- `[S0 → S1] Validando scope=all…`
- `[S1 → S2] Auditoría completa. Informe abajo.`
- `[S2] Jugada elegida: J1 sobre hallazgo C3.`
- `[S2 → S3] Procesando fix de doc.`
- `[S3 → S2] Fix aplicado. Volviendo al informe.`

Esto da al usuario visibilidad en todo momento de **dónde está el flujo** y por qué.

---

## 12. Inputs, defaults e invocación

### Invocación

```
Valida el contexto de IA
Valida el contexto del módulo cursos
Valida docs/ai-context
Valida frontend
Valida database
```

### Inputs por situación

| Situación | Input requerido                | Default si falta | Cómo obtenerlo               |
| --------- | ------------------------------ | ---------------- | ---------------------------- |
| S0        | `scope`                        | —                | Preguntar al usuario una vez |
| S1        | `scope` (de S0)                | —                | Heredado de S0               |
| S2        | `jugada` + opcional `hallazgo` | —                | Esperar input                |
| S3        | `hallazgo`                     | —                | Preguntar si falta           |
| S4        | `hallazgo`                     | —                | Preguntar si falta           |
| S5        | `hallazgo`                     | —                | Preguntar si falta           |

---

## 13. Resumen para futuras IA que lean esta skill

- Sos un **autómata acotado**, no un ejecutor libre.
- Cada respuesta empieza con `[S{n}]`.
- Solo ejecutás jugadas listadas en la situación actual.
- Si el prompt no mapea: respondés con la plantilla OUT y esperás.
- Editás solo `docs/ai-context/**` (en S3). Para todo lo demás abrís issue (S4).
- Nunca commiteás, nunca push, nunca tocás `apps/**`.
- Salida del contrato: explícita por J5 o por nueva skill.
