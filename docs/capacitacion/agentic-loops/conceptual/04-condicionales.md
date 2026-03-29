# 04 — Condicionales y Condiciones de Parada

## Por qué son críticas

Un loop sin condiciones de parada es un loop infinito. En el contexto de Claude Code, eso significa:

- Sesiones que se disparan indefinidamente
- Consumo de quota de API sin control
- Potencialmente: commits erróneos que se acumulan
- Sin forma de detenerlo salvo intervención manual

Las condiciones de parada no son opcionales. Son la diferencia entre automatización profesional y caos.

---

## Los tres tipos de condiciones

### Tipo 1: Condición de negocio

El trabajo terminó. No hay más tareas que ejecutar.

```
¿Hay issues abiertos en el sprint actual?
  NO → stop limpio, generar resumen
  SÍ → continuar loop
```

### Tipo 2: Condición de recursos

Los recursos disponibles no son suficientes para continuar de forma segura.

```
¿La sesión actual supera el 85% de contexto? → no disparar nueva sesión
¿La quota mensual supera el 95%? → no disparar nueva sesión
¿Hay N sesiones consecutivas sin progreso real? → stop con alerta
```

### Tipo 3: Condición de error

Algo salió mal y continuar podría empeorar las cosas.

```
¿El issue anterior quedó en estado inconsistente? → stop con alerta
¿Los tests fallaron? → stop, no cerrar el issue, alertar
¿Hubo un error de compilación? → stop, alertar
¿El mismo issue fue "completado" dos veces? → loop detectado, stop
```

---

## Dónde viven las condiciones

Las condiciones son **lógica del prompt**, no código. Están escritas en el skill como instrucciones explícitas que Claude debe evaluar antes de llamar `RemoteTrigger`.

### En el skill project-manager-autonomo:

```markdown
## Condiciones de parada (evaluar ANTES de disparar la siguiente sesión)

Antes de llamar RemoteTrigger, verificar en orden:

1. ¿Hay issues abiertos con label phase-4 en GitHub?
   - NO → no disparar. Generar resumen de lo completado en el loop. Terminar.

2. ¿El issue candidato tiene dependencias sin resolver?
   - SÍ → no disparar ese issue. Verificar si hay otro sin dependencias. Si no hay ninguno → terminar.

3. ¿El contexto de esta sesión supera el 80%?
   - SÍ → no disparar. Terminar con un resumen y nota: "Loop pausado por límite de contexto".

Solo si las tres verificaciones son positivas → llamar RemoteTrigger.
```

### En el skill complete-issue (modo autónomo):

```markdown
## Al finalizar el issue (antes de disparar project-manager)

1. ¿El issue se cerró correctamente en GitHub?
   - NO → no disparar. Registrar el problema en un archivo de log. Alertar.

2. ¿Los tests pasaron?
   - NO → no cerrar el issue, no disparar. Stop con descripción del problema.

3. ¿TypeScript compila sin errores?
   - NO → no disparar. Stop.

Solo si todo está en verde → disparar project-manager-autonomo.
```

---

## El árbol de decisión completo del loop

```
INICIO DE SESIÓN (project-manager-autonomo)
│
├── Leer estado: GitHub + CLAUDE.md + roadmap.md
│
├── ¿Hay inconsistencias entre fuentes?
│   SÍ → Resolver inconsistencia primero, luego evaluar
│
├── ¿Hay issues abiertos en sprint actual?
│   NO → STOP: generar resumen del loop completo
│
├── ¿El siguiente issue tiene dependencias sin resolver?
│   SÍ → Intentar con el siguiente candidato
│        Si no hay candidatos → STOP
│
├── ¿Quota de contexto ok (< 80%)?
│   NO → STOP: "Loop pausado por límite de contexto. Reiniciar manualmente."
│
└── TODO OK → RemoteTrigger("/complete-issue #N autónomo")
                      │
                      ▼
         SESIÓN (complete-issue #N)
         │
         ├── Ejecutar TDD + implementación + docs
         │
         ├── ¿Tests pasan?
         │   NO → STOP: no cerrar issue, reportar problema
         │
         ├── ¿TypeScript ok?
         │   NO → STOP: reportar problema
         │
         ├── Cerrar issue
         ├── Actualizar CLAUDE.md
         ├── Commit + push
         │
         └── RemoteTrigger("/project-manager-autonomo") → vuelve al inicio
```

---

## Condiciones de bifurcación (no solo stop)

Además de parar, el loop puede **bifurcarse** según el resultado:

```
¿El issue completado fue el último del sprint?
  SÍ y hay sprint siguiente → project-manager con instrucción "planificar sprint N+1"
  SÍ y no hay sprint siguiente → STOP con informe de fase completada
  NO → project-manager estándar
```

```
¿El issue tocó Prisma?
  SÍ → después del complete-issue, disparar un skill de verificación de migraciones
  NO → disparar project-manager directamente
```

Las bifurcaciones permiten que el loop sea **adaptativo**, no solo mecánico.

---

## El counter de sesiones: anti-loop infinito básico

Un mecanismo simple pero efectivo es pasar un **contador de sesiones** en el prompt:

```
RemoteTrigger(prompt="/complete-issue #N autónomo [loop_count=3/10]")
```

La sesión que recibe este prompt sabe que es la sesión 3 de un máximo de 10. Si el contador llega al límite → stop, sin importar si hay más issues.

Esto es un guardrail de último recurso para cuando las condiciones de negocio o de recursos fallen en detectar el problema.

---

## Siguiente paso

[05-guardrails.md](05-guardrails.md) — Mecanismos profesionales de control: quotas, detección de loops, logs de auditoría.
