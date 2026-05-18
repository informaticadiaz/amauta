# 05 — Guardrails: Control Profesional del Loop

## Por qué necesitás guardrails

La automatización sin guardrails es una apuesta. Puede funcionar bien 9 de cada 10 veces y en la décima hacer algo como:

- Cerrar un issue con tests fallidos
- Commitear código que rompe el build
- Disparar 50 sesiones porque hubo un bug en la lógica de parada
- Consumir el 100% de la quota mensual en una noche

Los guardrails son los mecanismos que convierten un loop experimental en **automatización de producción**.

---

## Estado actual (Amauta) — 2026-05-18

En esta capacitación los guardrails se presentan como “lo profesional”. **Pero hoy no están todos implementados como automatismos**.

- ✅ **Implementado/en uso**:
  - Guardrail 2 (`loop_count=X/N`) — se usa en los prompts/skills del loop.
  - Guardrail 4 (log) — existe como `docs/ai-skills/automata-dev/loop-status.md` y se actualiza/usa en el flujo (y ante fallas del runner).
- 🟡 **Existe, pero es procedimental (no forzado por el runner)**:
  - Guardrail 5 (auditoría) — existe la skill `loop-auditor`, pero su ejecución depende del handoff/prompt (no de un “gate” automático del runner).
- ❌ **No implementado (pendiente)**:
  - Guardrail 1 (quota de contexto por heurística) — no hay chequeo estandarizado que bloquee el handoff.
  - Guardrail 3 (loop sin progreso) — no hay detección automática por issue repetido.

> Nota: el runner (`loop-runner.ps1/.sh`) hoy es agnóstico: ejecuta cuando aparece `next-prompt.md`. Los guardrails viven (o deberían vivir) en skills/prompt + log.

---

## Guardrail 1: Control de quota de contexto de sesión

### El problema

Cada sesión tiene un límite de contexto (tokens). A medida que la sesión trabaja — lee archivos, ejecuta comandos, genera respuestas — ese contexto se va llenando. Cuando está muy lleno, la calidad del razonamiento degrada.

Disparar una nueva sesión desde una sesión con contexto al 95% es problemático: la sesión actual puede no completar bien su trabajo y el prompt de handoff puede quedar incompleto.

### El guardrail

Evaluar el nivel de contexto **antes** de construir el prompt de handoff:

```markdown
## Guardrail de contexto (incluir en todos los skills autónomos)

Antes de escribir `next-prompt.md`:

- Si el contexto de esta sesión parece muy cargado (muchos archivos leídos,
  muchos tools ejecutados, conversación larga) → no disparar nueva sesión.
- En su lugar: escribir en `docs/ai-skills/automata-dev/loop-status.md` el estado actual
  y terminar con el mensaje: "Loop pausado: contexto elevado. Reiniciar manualmente."
```

### La implementación práctica

Claude no tiene acceso directo a métricas de tokens, pero puede estimarlo heurísticamente. Una regla práctica en el prompt:

```
Si en esta sesión ya leíste más de 15 archivos, ejecutaste más de 20 comandos,
o la conversación tiene más de 30 turnos → considerar el contexto como elevado.
```

El número exacto es ajustable según la experiencia con el proyecto.

---

## Guardrail 2: Control de quota mensual de API

### El problema

Un loop que ejecuta 10 issues completos (cada uno con TDD, refactor, documentación) puede consumir una cantidad significativa de quota mensual. Si no hay control, el loop puede vaciar la quota antes de que te des cuenta.

### El guardrail

Definir un límite de sesiones por ejecución del loop. No es exactamente "quota mensual" medida en tokens, sino un límite operativo:

```markdown
## Límite de sesiones por loop (incluir en project-manager-autonomo)

El loop tiene un máximo de [N] issues por ejecución autónoma.

- N recomendado para testing inicial: 3
- N recomendado para uso estable: 5-8
- N máximo absoluto: 10

Al llegar al límite → STOP, generar resumen, no disparar más sesiones.
Incluir en el prompt: [loop_count=X/N] para tracking.
```

### La implementación con counter

Pasar el counter en el prompt y que cada sesión lo incremente:

```
Sesión 1: escribe next-prompt.md ("...complete-issue #81... [loop_count=1/5]")
Sesión 2: escribe next-prompt.md ("...project-manager... [loop_count=2/5]")
Sesión 3: escribe next-prompt.md ("...complete-issue #82... [loop_count=3/5]")
...
Sesión 5: escribir next-prompt.md → NO. [loop_count=5/5] → STOP
```

---

## Guardrail 3: Detección de loop sin progreso

### El problema

Un loop puede estar ejecutándose pero sin avanzar: el mismo issue se "completa" y se reabre, o el sistema entra en un ciclo donde siempre detecta el mismo estado y no puede progresar.

### El guardrail

Verificar que cada sesión de `complete-issue` realmente cerró un issue **diferente** al de la sesión anterior:

```markdown
## Verificación de progreso (en project-manager-autonomo)

Al iniciar, verificar:

1. ¿Cuál fue el último issue cerrado? (git log --oneline -1 o gh issue list --state closed --limit 1)
2. ¿Es diferente al issue que se está por ejecutar?
   - SI ES EL MISMO → loop detectado. STOP. Registrar en loop-status.md.
   - SI ES DIFERENTE → continuar normalmente.
```

---

## Guardrail 4: Log de auditoría del loop

### Para qué sirve

Cuando el loop termina (por cualquier razón), necesitás saber:

- Cuántas sesiones se ejecutaron
- Qué issues se completaron
- Por qué paró (condición de negocio, recursos, error)
- Si hubo problemas

### El archivo de log

```markdown
## Guardrail de log (incluir al final de cada sesión)

Antes de terminar, actualizar `docs/ai-skills/automata-dev/loop-status.md` con:

- Timestamp (usar fecha real, no relativa)
- Número de sesión en el loop
- Issue ejecutado (si aplica)
- Resultado: completado / error / pausado
- Razón de parada (si es la última sesión del loop)
- Próximo issue pendiente (si se pausó)
```

**Formato del archivo de log:**

```markdown
# Loop Status

## Última ejecución

- Inicio: 2026-03-29
- Sesiones ejecutadas: 4
- Issues completados: #81, #82, #83
- Parada: condición de negocio (no hay más issues en Sprint 15)
- Estado: COMPLETADO

## Log de sesiones

| Sesión | Issue              | Resultado      | Timestamp  |
| ------ | ------------------ | -------------- | ---------- |
| 1      | project-manager    | Seleccionó #81 | 2026-03-29 |
| 2      | complete-issue #81 | Completado     | 2026-03-29 |
| 3      | project-manager    | Seleccionó #82 | 2026-03-29 |
| 4      | complete-issue #82 | Completado     | 2026-03-29 |
```

---

## Guardrail 5: La tercera skill — auditoría y seguimiento

Este es el guardrail más sofisticado. En lugar de solo ejecutar issues y parar, el loop puede incluir una **sesión de auditoría** periódica que verifica:

- ¿La arquitectura sigue siendo coherente después de N issues?
- ¿Los tests existentes siguen pasando?
- ¿Hay deuda técnica acumulada que bloquea el avance?

Esta skill interviene **entre** ciclos del loop principal, no en cada iteración:

```
[issue #81] → [issue #82] → [issue #83]
                   ↑
              [auditoría: cada 3 issues]
              - Verifica coherencia arquitectónica
              - Corre suite completa de tests
              - Reporta problemas antes de continuar
```

Ver [06-fases.md](06-fases.md) para cómo implementar esto progresivamente.

---

## Checklist de guardrails antes de habilitar el loop

Antes de poner el loop en modo autónomo completo, verificar:

- [ ] Límite de sesiones por ejecución definido (recomendado: 3 para testing inicial)
- [ ] Condición de parada por "no hay más issues" implementada
- [ ] Heurística de contexto elevado incluida en el prompt
- [ ] Log de auditoría (`docs/ai-skills/automata-dev/loop-status.md`) configurado
- [ ] Detección de loop sin progreso implementada
- [ ] Proceso de arranque manual documentado (cómo iniciar el loop, cómo reiniciar si se pausó)

---

## Siguiente paso

[06-fases.md](06-fases.md) — Cómo implementar todo esto de forma incremental, fase por fase.
