# Issue Closer — Diseño y Marco de Decisión

> Documento de diseño para incorporar un skill nuevo (`issue-closer`) al sistema autónomo de Amauta.
> Complementa `docs/automata/agentic-loop-system.md` y profundiza su sección 8.
>
> **Carácter:** exploratorio + decisorio. Plantea alternativas, las compara, y toma postura. La implementación viene después.

---

## Índice

1. [Propósito y alcance](#1-propósito-y-alcance)
2. [Cómo se cierra una issue hoy](#2-cómo-se-cierra-una-issue-hoy)
3. [Interacción actual entre skills](#3-interacción-actual-entre-skills)
4. [Marco teórico: skill vs agente vs hook](#4-marco-teórico-skill-vs-agente-vs-hook)
5. [Diseño propuesto: `issue-closer`](#5-diseño-propuesto-issue-closer)
6. [Decisiones de diseño con recomendación](#6-decisiones-de-diseño-con-recomendación)
7. [Hooks como red de seguridad](#7-hooks-como-red-de-seguridad)
8. [Plan de implementación incremental](#8-plan-de-implementación-incremental)
9. [Preguntas abiertas](#9-preguntas-abiertas)

---

## 1. Propósito y alcance

El loop autónomo de Amauta cierra issues cuando los tests pasan, TypeScript compila y la documentación se actualiza. Esa definición de "issue cerrado" garantiza **código correcto**, pero no garantiza **feature integrada en la experiencia del usuario**.

El gap es concreto y ya observado: durante la Fase 4b, varios endpoints administrativos (asistencia, reportes) se implementaron, testearon y documentaron sin que estuvieran visibles en la UI. El issue se cerró. Para el agente, la tarea estaba terminada. Para el usuario final, la feature no existía.

Este documento responde a tres preguntas:

1. ¿Cómo se cierra una issue hoy, paso a paso?
2. ¿Qué responsabilidad debería tener el cierre que hoy no tiene?
3. ¿Cómo se ubica esa responsabilidad nueva dentro de la jerarquía skill / agente / hook sin romper los invariantes del loop?

**Lo que este documento NO hace:** no implementa el skill, no crea archivos de configuración, no instala dependencias. Es la planificación previa a esa implementación.

---

## 2. Cómo se cierra una issue hoy

### El paso concreto

El cierre ocurre en un único lugar: `ia-skills/automation/complete-issue-automata.md`, **PASO 11 (líneas 612-633)**:

```bash
gh issue close [número] --comment "✅ Implementación completada con TDD.

**Resumen:** [1-2 líneas de qué se implementó]
**Checklist:** [items del issue verificados]
**Cobertura:** [Módulo]: >80% statements
**Documentación actualizada:** [archivos]
**Commit:** [hash corto]"
```

Es una llamada bash dentro de la misma sesión que implementó el código. El modelo que escribió la solución es el mismo que decide que la solución está terminada.

### Qué se verifica antes de cerrar

| Verificación                 | Cómo                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| Tests pasan                  | `npm run test` y `npm run test:api` deben dar verde           |
| TypeScript compila           | `tsc --noEmit` sin errores en backend y frontend              |
| Documentación IA actualizada | `docs/ai-context/` y `docs/human-context/issue-{N}-{slug}.md` |
| Commit con referencia        | Mensaje en español, `Resuelve: #N`                            |
| Cobertura del módulo         | >80% statements en el módulo tocado                           |

### Qué NO se verifica antes de cerrar

| Gap                                          | Consecuencia                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Navegación de usuario                        | El endpoint existe pero ningún botón lo invoca                                            |
| Integración visual                           | El componente se monta pero no aparece en el menú                                         |
| Regresiones cross-módulo                     | Cambios en `categorias` rompen `cursos` sin que ningún test del PR lo detecte             |
| Checklist del issue verificado en producción | "El admin puede ver el reporte" se valida contra un test unitario, no contra una pantalla |
| Que el deploy haya llegado                   | El issue se cierra antes de que el CI termine el deploy a `amauta.diazignacio.ar`         |

### El caso de regresión real

Durante Fase 4b se cerraron issues como F4b-003 (reportes administrativos) cuyos endpoints funcionaban perfectamente en tests pero nunca se integraron al menú de admin. El agente cumplió el contrato técnico del issue. El humano, al revisar manualmente días después, encontró que la feature era invisible. El loop no lo detectó porque su definición de "terminado" no incluía "el usuario puede llegar a la feature navegando".

Este es **el** problema que justifica `issue-closer`.

---

## 3. Interacción actual entre skills

### El flujo

```
   ┌──────────────────────────────┐
   │  project-manager-automata    │  selecciona próximo issue
   └──────────────┬───────────────┘
                  │ escribe next-prompt.md
                  ▼
   ┌──────────────────────────────┐
   │  complete-issue-automata     │  implementa + cierra (PASO 11)
   └──────────────┬───────────────┘
                  │ escribe next-prompt.md
                  ▼
       ¿cada 3 issues?
       │             │
       ▼             ▼
  loop-auditor   project-manager-automata
  (verifica)     (próxima ronda)
```

### Tabla de responsabilidades sobre el cierre

| Skill                              | ¿Cierra issues?  | Verifica antes                                      | Qué NO verifica                     |
| ---------------------------------- | ---------------- | --------------------------------------------------- | ----------------------------------- |
| `project-manager-automata`         | No               | N/A                                                 | N/A                                 |
| `complete-issue-automata`          | **Sí** (PASO 11) | Tests verdes, tsc ok, docs, commit                  | UI, flujo de usuario, deploy a prod |
| `loop-auditor`                     | No               | Tests + tsc + coherencia docs cada 3 issues         | UI, flujo de usuario                |
| `issue-inspector` (fuera del loop) | No               | Tests >80% cob, smoke prod, criterios de aceptación | Es manual, no bloquea el loop       |

### El problema arquitectónico

`issue-inspector` ya cubre conceptualmente lo que falta — verifica producción, criterios de aceptación, smoke tests. **Pero está fuera del loop.** Solo lo corre el humano cuando se acuerda. Esa decisión de diseño (informativo, no bloqueante) hizo sentido cuando el loop no era totalmente autónomo. Ahora que el loop corre solo durante horas, esa verificación humana se vuelve el cuello de botella.

Tenemos dos caminos posibles:

1. **Integrar `issue-inspector` al loop** como verificación obligatoria antes de cerrar
2. **Crear un skill nuevo `issue-closer`** con responsabilidad única de cerrar bajo evidencia E2E

Este documento argumenta por el segundo. La razón se ve mejor con el marco teórico de la sección siguiente.

---

## 4. Marco teórico: skill vs agente vs hook

Para decidir dónde poner la responsabilidad de cerrar issues, hay que ser preciso sobre qué herramienta de control existe en Claude Code y qué garantiza cada una.

### La jerarquía

| Mecanismo                      | Garantía                      | Costo de evasión                         | Bueno para                            |
| ------------------------------ | ----------------------------- | ---------------------------------------- | ------------------------------------- |
| **Hook** (`exit 2`)            | Absoluta — el sistema bloquea | Imposible para el modelo                 | Reglas binarias, invariantes          |
| **Agente** (sesión separada)   | Alta — contexto limpio        | El modelo no recuerda el contexto previo | Reviewer independiente, verificación  |
| **Skill** (contexto inyectado) | Media — el modelo lee y sigue | Bajo: el modelo puede desviarse          | Procedimiento guiado con flexibilidad |
| **CLAUDE.md**                  | Baja — sugerencia             | Trivial: se ignora                       | Convenciones generales                |

### Tres preguntas guía aplicadas al cierre

**Pregunta 1: ¿Qué pasa si el modelo decide cerrar igual aunque algo falle?**

Esta es la pregunta que separa **skill** de **hook**. Un skill que dice "no cierres si los tests fallan" puede ser ignorado bajo presión de tokens, urgencia inducida por el prompt, o simple desviación. Un hook `PreToolUse` que detecta `gh issue close` y verifica precondiciones es la única defensa absoluta.

**Pregunta 2: ¿Qué pasa si el contexto del implementador contamina la verificación?**

Esta es la pregunta que separa **skill** de **agente**. Cuando el mismo modelo implementa **y** verifica, tiene un sesgo natural a interpretar ambigüedad a favor de "ya está hecho". Si el checklist del issue dice "el admin puede generar el reporte" y el modelo implementó el endpoint, va a interpretar "generar" como "el endpoint responde 200". Un agente separado que arranca con contexto limpio, lee el checklist y prueba el flujo real no tiene ese sesgo.

**Pregunta 3: ¿Qué pasa si la verificación es costosa?**

Playwright tarda decenas de segundos por flujo. Esperar el deploy a producción tarda 2-3 minutos. Esa latencia no se puede pagar en cada tool call (sería un hook inútilmente lento). Pero se paga una vez al cierre. Por eso conviene **skill** + **sesión separada**, no hook puro.

### La aplicación

`issue-closer` debe ser:

- **Un skill autónomo** que se invoca como sesión separada vía `next-prompt.md`. Eso le da contexto limpio (efectivamente, un agente independiente).
- **Reforzado por un hook** que bloquee `gh issue close` cuando el comando viene de cualquier skill que no sea `issue-closer`. Eso garantiza el invariante: ninguna sesión que no haya pasado por la verificación E2E puede cerrar issues.

Skill para el procedimiento. Hook para el invariante. CLAUDE.md y agente no aplican: CLAUDE.md es demasiado débil, "agente" como concepto en Claude Code se materializa justamente como sesión separada de un skill.

---

## 5. Diseño propuesto: `issue-closer`

### Responsabilidad única

Verificar end-to-end que el flujo del issue funciona desde la UI y, si pasa, cerrar el issue en GitHub. **Nada más.**

### Lo que NO hace

- No implementa código de aplicación
- No corrige bugs (si encuentra fallo → STOP, retorno al humano)
- No modifica tests unitarios existentes
- No modifica schema, migraciones, ni configuración

Esta restricción es deliberada. Si `issue-closer` pudiera "arreglar lo que faltó", se convierte en una segunda iteración de `complete-issue-automata` y pierde el valor del contexto limpio.

### Inputs

`next-prompt.md` escrito por `complete-issue-automata` con:

- `[número-issue]`
- `[loop_count=X/N]`
- Hash del commit que cerró la implementación
- Lista de archivos modificados (para mapear qué flujos validar)

### Outputs

**Caso APROBADO:**

1. Cierra el issue con `gh issue close` incluyendo:
   - Resumen de los flujos E2E ejecutados
   - Captura textual del DOM en cada step (sin screenshots — barato)
   - URL exacta del deploy verificado
2. Escribe `next-prompt.md` con destino `project-manager-automata [loop_count=X+1/N]`
3. Actualiza `loop-status.md` con la sesión y resultado

**Caso RECHAZADO:**

1. NO cierra el issue
2. Escribe en `loop-status.md` con detalle:
   - Qué flujo falló
   - En qué paso (URL, selector, expected, actual)
   - Hash del commit verificado
   - Recomendación: rollback, re-implementación, ambigüedad en el checklist
3. NO escribe `next-prompt.md` — el loop se detiene, retorno al humano

### Condiciones de STOP

- Tests E2E fallan
- El deploy a producción no terminó (`gh run watch` excede timeout configurable)
- Credenciales de usuarios de prueba inválidas (login E2E falla)
- El checklist del issue no describe ningún flujo de usuario verificable (issue puramente backend sin UI — caso especial, ver sección 9)

### Archivos que puede modificar

- `ia-skills/automation/loop-status.md`
- `ia-skills/automation/next-prompt.md`
- Tests E2E nuevos en `apps/web/__tests__/e2e/` (artifact opcional)

### Archivos que NO puede modificar

- Código de aplicación (`apps/api/src/`, `apps/web/src/`, `packages/`)
- Tests unitarios existentes
- `prisma/schema.prisma` ni `prisma/seed.ts`
- `docs/ai-context/`, `docs/human-context/`, `docs/project-management/`

### Cambio en `complete-issue-automata`

PASO 11 muta de "ejecutar `gh issue close`" a "escribir `next-prompt.md` para `issue-closer`". El nuevo paso queda:

```
PASO 11 — Entregar a issue-closer
- Verificar que CI/CD inició (push hizo trigger)
- Escribir next-prompt.md con: número del issue, loop_count, hash commit, archivos modificados
- NO cerrar issue. El cierre lo hace issue-closer tras verificar E2E.
```

El resto de pasos (1-10, 12) queda igual.

---

## 6. Decisiones de diseño con recomendación

### 6.1 Tests E2E: ¿generados en el momento o reutilizados?

**Opciones:**

- **A)** El skill escribe los specs de Playwright en cada sesión según el checklist del issue, los ejecuta, los descarta (o los commitea como artifact si pasaron).
- **B)** Los specs se escriben durante la implementación (en `complete-issue-automata`) y se commitean junto con el código, como tests permanentes de regresión.

**Recomendación: A — generados en el momento, opcionalmente commiteados como artifact si pasan.**

**Por qué:**

El checklist del issue es la spec del flujo de usuario. Si el mismo agente que implementó el código también escribió el test E2E, el test puede compartir el mismo malentendido del checklist. Es el problema clásico: el tester contaminado por el implementador.

Generar el spec en una sesión separada, con contexto limpio, fuerza una segunda lectura del checklist. Si esa lectura produce un spec distinto al que produciría el implementador, ya descubrimos una ambigüedad antes de cerrar.

**Trade-off:** los tests no quedan como red de regresión permanente. Si el día de mañana otra issue rompe el flujo, no hay test que lo detecte.

**Mitigación:** si el E2E pasa, commitearlo en `apps/web/__tests__/e2e/` como suite acumulada. Así el día siguiente esa suite corre como parte del CI normal y sí actúa como regresión. La diferencia es que el primer paso por el spec fue desde contexto limpio.

### 6.2 ¿Verificar contra localhost o producción?

**Opciones:**

- **A)** Localhost con `npm run dev` levantado en el contenedor del loop.
- **B)** Producción: `https://amauta.diazignacio.ar` después del deploy automático.

**Recomendación: B — producción, esperando el healthcheck del CI.**

**Por qué:**

El deploy a `master` es automático: push → GitHub Actions → SSH webhook a Dokploy → healthcheck a `/health`. Verificar localhost prueba "el código compila y arranca". Verificar producción prueba "la feature llegó al usuario". El segundo es lo que el gap real exige.

Además, localhost requiere levantar la DB local, que **no existe** en el flujo actual de Amauta — la DB de desarrollo es la del VPS (ver `CLAUDE.md` "Entorno de Desarrollo (CRÍTICO)"). Verificar contra localhost implicaría montar una infra paralela; verificar contra producción aprovecha la que ya existe y tiene datos reales.

**Trade-off:** agrega latencia. Espera de deploy ≈ 2-3 min + ejecución de E2E ≈ 30s-2min por flujo.

**Mitigación:** el skill usa `gh run watch` para esperar al CI, no polling activo. La latencia es contra el reloj humano, no contra el costo en tokens.

**Detalle crítico:** `complete-issue-automata` debe pushear antes de invocar a `issue-closer`. Hoy ya lo hace (commit + push están en pasos previos al 11). El nuevo `issue-closer` espera el deploy.

### 6.3 Credenciales de usuarios de prueba

**Estado actual:** existen en `apps/api/prisma/seed.ts` con password `password123`:

- `superadmin@amauta.test` — SUPER_ADMIN
- `admin1@amauta.test` — ADMIN_ESCUELA
- `educador1@amauta.test` — EDUCADOR
- `estudiante1@amauta.test` — ESTUDIANTE

**Recomendación: usar los usuarios existentes, no crear nuevos.**

**Por qué:**

El seed ya es idempotente y se ejecuta como parte de la pipeline. Crear usuarios dedicados a E2E sería redundancia y agregaría puntos de falla (un cambio en el seed afecta tanto humanos como E2E). Los roles cubren todos los escenarios de permisos de Amauta.

**Riesgo:** que un cambio inadvertido al seed rompa los E2E.

**Mitigación:** agregar al hook `proteger-archivos.sh` (que ya existe en `.claude/settings.json`) la regla "edición de `apps/api/prisma/seed.ts` solo permitida si el contexto del commit menciona explícitamente seed". Es una capa de fricción mínima, no un bloqueo absoluto.

---

## 7. Hooks como red de seguridad

Los hooks complementan al skill. **No lo reemplazan.** La separación es:

- **Skill** = procedimiento, contexto, decisiones razonables
- **Hook** = invariante, defensa absoluta, defensa contra desviación

### Hooks actuales en `.claude/settings.json`

| Hook                       | Matcher                | Función                                      |
| -------------------------- | ---------------------- | -------------------------------------------- |
| `contexto-sesion.sh`       | SessionStart           | Carga contexto del proyecto al iniciar       |
| `bloquear-destructivos.sh` | PreToolUse Bash        | Bloquea comandos peligrosos                  |
| `advertir-prisma.sh`       | PreToolUse Bash        | Advierte/bloquea operaciones de DB sensibles |
| `proteger-archivos.sh`     | PreToolUse Edit/Write  | Bloquea edición de archivos sensibles        |
| `detectar-secretos.sh`     | PreToolUse Edit/Write  | Bloquea commits con secretos                 |
| `validar-schema-prisma.sh` | PostToolUse Edit/Write | Valida schema tras edición                   |

### Hooks a agregar para `issue-closer`

**1. Bloquear `gh issue close` fuera de `issue-closer`**

```bash
# .claude/hooks/proteger-cierre-issue.sh
# PreToolUse Bash matcher
if echo "$CLAUDE_TOOL_INPUT" | grep -q 'gh issue close'; then
  if [[ -z "${ISSUE_CLOSER_ACTIVE:-}" ]]; then
    echo "BLOQUEADO: gh issue close solo permitido desde issue-closer" >&2
    exit 2
  fi
fi
exit 0
```

El skill `issue-closer` exporta `ISSUE_CLOSER_ACTIVE=1` como primer paso. Cualquier otro skill que intente cerrar un issue es bloqueado por el sistema, no por una sugerencia.

**2. Extender `proteger-archivos.sh` con `prisma/seed.ts`**

Sin reescribir el hook, agregar `apps/api/prisma/seed.ts` a su lista de paths protegidos. Permite edición solo si el contexto lo justifica.

**3. Log de observabilidad de cierres**

```bash
# .claude/hooks/log-cierre-issue.sh
# PostToolUse Bash matcher
if echo "$CLAUDE_TOOL_INPUT" | grep -q 'gh issue close'; then
  echo "[$(date -Iseconds)] gh issue close ejecutado por skill=${CLAUDE_SKILL:-unknown}" \
    >> .claude/logs/cierres.log
fi
```

Permite auditar a posteriori qué skill cerró qué issue y cuándo. Útil si aparece un cierre indebido.

### Lo que los hooks NO resuelven

Los hooks bloquean acciones, no verifican intenciones. No pueden validar "este flujo E2E está correctamente diseñado". Esa parte es responsabilidad del skill `issue-closer`. Los hooks son la red bajo el trapecista, no el trapecista.

---

## 8. Plan de implementación incremental

Cada paso es independiente y verificable. No se avanza al siguiente hasta que el anterior esté en producción.

### Paso 1 — Infra de Playwright

- Instalar `@playwright/test` en `apps/web` como devDependency
- Crear `playwright.config.ts` con baseURL apuntando a `https://amauta.diazignacio.ar`
- Agregar script `test:e2e` en `apps/web/package.json`
- Escribir un E2E "hola mundo" (`login.spec.ts`: login con `educador1` y verifica que aparece "Mis cursos")
- Verificar localmente con `npm run test:e2e`

**Criterio de done:** el test corre desde la línea de comandos y verifica un flujo real contra producción.

### Paso 2 — Esqueleto de `issue-closer`

- Crear `ia-skills/automation/issue-closer.md` (versión long-form, paralela a `complete-issue-automata.md`)
- Crear `.agents/skills/issue-closer/SKILL.md` (wrapper de invocación)
- En esta primera versión, el skill solo:
  - Lee el issue
  - Espera el deploy con `gh run watch`
  - Ejecuta el E2E de Paso 1 (login básico)
  - Si pasa, cierra el issue
  - Si falla, STOP

**Criterio de done:** se puede invocar manualmente con `/issue-closer #N` y cierra/no cierra según el resultado.

### Paso 3 — Modificar `complete-issue-automata`

- Cambiar PASO 11: dejar de cerrar issue, escribir `next-prompt.md` para `issue-closer`
- Actualizar criterios de éxito de la sesión (ya no incluye "issue cerrado en GitHub")
- Actualizar `docs/automata/agentic-loop-system.md` sección 6 (gaps) y sección 8 para reflejar que `issue-closer` ya existe

**Criterio de done:** un issue corrido por el loop pasa de `complete-issue-automata` → `issue-closer` automáticamente, sin tocar manualmente `next-prompt.md`.

### Paso 4 — Hook de protección

- Agregar `proteger-cierre-issue.sh` y `log-cierre-issue.sh` a `.claude/hooks/`
- Registrarlos en `.claude/settings.json`
- Verificar que `complete-issue-automata` ya **no puede** cerrar issues (intentarlo y confirmar `exit 2`)

**Criterio de done:** intentar `gh issue close` desde una sesión de `complete-issue-automata` es bloqueado por el sistema.

### Paso 5 — Generación dinámica de E2E

- Extender `issue-closer` para generar el spec según el checklist del issue, no usar siempre el login básico
- Probar con un issue real de F4c con UI clara (ej. F4c-007 rol tutor/padre)
- Si el spec generado falla por ambigüedad del checklist, STOP con sugerencia de refinar el issue

**Criterio de done:** el skill puede recibir un issue arbitrario y generar el flujo de verificación adecuado, con fallo limpio si el checklist no es suficientemente claro.

### Paso 6 — Integración con `loop-auditor`

- Agregar al `loop-auditor` la verificación de que los últimos 3 cierres pasaron por `issue-closer` (cruzar con `.claude/logs/cierres.log`)
- Si detecta un cierre sin `issue-closer` registrado, BLOQUEADO

**Criterio de done:** el auditor no aprueba un bloque de 3 issues si alguno se cerró sin verificación E2E.

### Paso 7 — Iteración basada en evidencia

Correr el loop una semana con `issue-closer` activo. Medir:

- Tasa de RECHAZADO de `issue-closer` (¿está bloqueando issues que deberían cerrarse?)
- Falsos positivos: flujos E2E que fallan por flakiness, no por bug real
- Falsos negativos: features que pasan el E2E pero el humano detecta rotas

Iterar el skill según la evidencia, no según hipótesis.

---

## 9. Preguntas abiertas

Las decisiones que este documento toma están justificadas, pero quedan zonas grises que requieren más datos o más diseño antes de implementar.

### 9.1 Flakiness de Playwright

Si un E2E falla por timeout de red, ¿el skill reintenta o STOP?

**Posibles políticas:**

- Reintentar hasta 3 veces con backoff exponencial; si todas fallan, STOP
- STOP en el primer fallo, dejar al humano decidir
- Reintentar 1 vez idempotente; si vuelve a fallar, STOP con flag "posible flake"

Sin decisión todavía. Probable que la política correcta dependa del tipo de fallo (network vs assertion vs selector not found).

### 9.2 Paralelismo

¿Puede `issue-closer` correr mientras `complete-issue-automata` ya empezó el siguiente issue?

El modelo actual es secuencial: una sesión termina, la siguiente empieza. Si `issue-closer` espera 3 minutos de deploy, esos 3 minutos son tiempo muerto. Sería ideal solapar.

**Problema:** dos sesiones modificando `next-prompt.md` y `loop-status.md` simultáneamente rompen el invariante de claim atómico del runner.

**Posible solución:** separar los archivos de coordinación por tipo de sesión (`next-prompt-implementacion.md`, `next-prompt-cierre.md`). El runner los procesa con dos pollers paralelos. Requiere rediseñar `loop-runner.sh`.

No urgente. La latencia actual es aceptable.

### 9.3 ¿Fundir `issue-inspector` con `issue-closer`?

Hoy son dos skills con responsabilidades similares (`issue-inspector` audita contra producción, `issue-closer` propuesto haría lo mismo antes de cerrar). ¿Conviene unificar?

**A favor de unificar:** una sola fuente de verdad para "está esto realmente terminado".

**En contra:** los caracteres son distintos. `issue-inspector` es **informativo** (reporta y no bloquea), `issue-closer` es **bloqueante** (decide cierre). Mezclarlos puede confundir la jerarquía de decisión.

Recomendación tentativa: mantenerlos separados. `issue-closer` cubre el cierre dentro del loop; `issue-inspector` queda como herramienta de auditoría manual sobre issues ya cerrados. Reuso de código posible (helpers compartidos para login E2E, espera de deploy, etc.) pero skills separados.

### 9.4 Issues puramente backend

Algunos issues no tienen UI verificable (ej. agregar un índice a la DB, refactor interno). ¿Qué hace `issue-closer` con esos?

**Opciones:**

- Detectar en el checklist que no hay flujo de UI, cerrar bajo evidencia de tests + coherencia de tipos (equivalente al cierre actual)
- Etiqueta `no-ui` en el issue que cambia el modo de verificación
- Skip de E2E si el issue no tocó archivos de `apps/web/`

Sin decisión. Probablemente la última opción es la más simple y robusta.

---

_Documento de diseño. Iterar al implementar cada paso de la sección 8. El plan se actualiza con la evidencia._
