# 06 — Implementación por Fases de Complejidad

## Por qué implementar por fases

Activar el loop completo desde el día 1 es la forma más rápida de descubrir problemas caros. Cada fase agrega complejidad y autonomía de forma controlada, permitiendo:

- Detectar problemas en cada etapa antes de avanzar
- Entender cómo se comporta el sistema en la práctica
- Ajustar guardrails con datos reales
- Construir confianza en el sistema antes de dárselo más autonomía

El principio es siempre el mismo: **lo más simple que puede funcionar**, antes de agregar más.

---

## Fase 0: Verificación manual (prerequisito)

**Objetivo**: Confirmar que las skills funcionan bien de forma manual antes de automatizarlas.

**Qué hacer**:

- Ejecutar `project-manager` manualmente y revisar que el output es correcto
- Ejecutar `complete-issue #N` manualmente en un issue simple
- Verificar que el issue queda cerrado, el commit está bien, la documentación se actualizó
- Hacer esto con al menos 3 issues distintos

**Criterio de salida**: Las dos skills funcionan correctamente en modo manual sin sorpresas.

**Tiempo estimado**: 2-3 issues ejecutados manualmente.

---

## Fase 1: Loop mínimo con 1 issue (2 sesiones)

**Objetivo**: Probar que el handoff entre sesiones funciona. Solo 2 sesiones: project-manager → complete-issue.

**Configuración**:

- Límite: 1 issue por ejecución (loop_count=1/1)
- Sin la sesión de retorno de complete-issue → project-manager
- El loop termina después de ejecutar 1 issue

**Flujo**:

```
[Vos] → /project-manager-automata [modo: elegir 1 issue y disparar complete-issue]
                │
                ▼
        Sesión A (project-manager-automata)
        - Lee estado
        - Elige el próximo issue (#N)
        - Escribe next-prompt.md ("complete-issue #N autónomo [loop_count=1/1]")
                │
                ▼
        Sesión B (complete-issue #N)
        - Ejecuta el issue
        - Cierra el issue
        - loop_count=1/1 → NO dispara más sesiones
        - Genera resumen final
```

**Qué verificar al terminar**:

- ¿El issue correcto fue elegido?
- ¿El handoff (prompt) tenía toda la información necesaria?
- ¿El log en `docs/logs/loop-status.md` refleja lo que pasó?
- ¿Hubo algún momento donde la sesión B estaba "perdida" sin saber qué hacer?

**Criterio de salida**: El handoff funciona y la sesión B tiene suficiente contexto para trabajar sin confusión.

---

## Fase 2: Loop bidireccional con 2 issues (4 sesiones)

**Objetivo**: Probar el loop completo de ida y vuelta: project-manager → complete-issue → project-manager → complete-issue.

**Configuración**:

- Límite: 2 issues (loop_count max 2)
- El complete-issue dispara project-manager al terminar
- El segundo project-manager dispara el segundo complete-issue
- El segundo complete-issue detecta loop_count=2/2 y para

**Flujo**:

```
[Vos] → /project-manager-automata [loop_count=0/2]
    │
    ▼ (elige issue #N, dispara)
complete-issue #N [loop_count=1/2]
    │
    ▼ (completa, dispara)
project-manager-automata [loop_count=1/2]
    │
    ▼ (elige issue #N+1, dispara)
complete-issue #N+1 [loop_count=2/2]
    │
    ▼ (completa, NO dispara → STOP)
```

**Qué verificar al terminar**:

- ¿Los 2 issues fueron los correctos según el roadmap?
- ¿El segundo project-manager pudo determinar el estado sin confusión?
- ¿El counter se propagó correctamente entre sesiones?
- ¿Hubo alguna sesión que intentó hacer más de lo que le correspondía?

**Criterio de salida**: El loop bidireccional funciona sin intervención y para limpiamente.

---

## Fase 3: Loop con guardrails activos (5-8 issues)

**Objetivo**: Probar que los guardrails de parada funcionan correctamente bajo condiciones reales.

**Configuración**:

- Límite elevado (5-8 issues)
- Todos los guardrails activos: contexto, counter, detección de loop sin progreso
- Log de auditoría completo

**Pruebas específicas a hacer**:

1. **Prueba de parada natural**: Que el loop se detenga solo cuando no hay más issues en el sprint
2. **Prueba de counter**: Subir el límite a un número menor que los issues disponibles y verificar que para correctamente
3. **Prueba de log**: Verificar que `loop-status.md` refleja fielmente lo que pasó

**Criterio de salida**: El loop para correctamente en las tres condiciones de prueba.

---

## Fase 4: Incorporar la tercera skill (auditoría)

**Objetivo**: Agregar una sesión de auditoría periódica que verifica la integridad del sistema.

**Cuándo interviene la tercera skill**:

- Cada N issues completados (configurable, recomendado: cada 3)
- Al finalizar un sprint completo
- Después de cualquier issue que toque Prisma o la arquitectura

**Qué hace la tercera skill**:

1. Ejecuta la suite completa de tests (`npm run test -w @amauta/api`)
2. Verifica tipos TypeScript (`tsc --noEmit`)
3. Revisa coherencia de documentación (¿CLAUDE.md está actualizado?)
4. Genera un reporte en `docs/logs/audit-report.md`
5. Si encuentra problemas → STOP del loop, no continuar hasta resolverlos

**Flujo con la tercera skill**:

```
complete-issue #N
    │
    ¿Es múltiplo de 3?
    SÍ → dispara skill-auditor
    NO → dispara project-manager directamente
                │
         skill-auditor
         - Corre tests completos
         - Verifica tipos
         ¿Problemas?
         SÍ → STOP + reporte
         NO → dispara project-manager
```

**Criterio de salida**: El loop de 3 skills funciona sin degradar la calidad del código.

---

## Fase 5: Automatización completa (modo producción)

**Objetivo**: El loop corre sin supervisión, notifica cuando para, y produce output auditablo.

**Características del modo producción**:

- Límite operativo definido según capacidad (ej: 8 issues por sesión)
- Notificación cuando el loop para (puede ser un commit con mensaje especial, un archivo de log actualizado)
- Resume de sesión de auditoría post-loop
- Documentación de lo que se completó lista para revisión humana

**Cuándo estás listo para este modo**:

- Fases 1-4 completadas exitosamente
- Al menos 10 issues ejecutados por el loop con 0 issues de calidad
- Guardrails probados en todas las condiciones de parada
- El equipo confía en los tests automatizados como validación suficiente

---

## Resumen de fases

| Fase | Nombre              | Issues   | Sesiones | Guardrails      | Duración estimada |
| ---- | ------------------- | -------- | -------- | --------------- | ----------------- |
| 0    | Verificación manual | 3 manual | 3        | Ninguno         | 1 día             |
| 1    | Loop mínimo         | 1        | 2        | Counter         | 1 sesión          |
| 2    | Loop bidireccional  | 2        | 4        | Counter         | 1 sesión          |
| 3    | Loop con guardrails | 5-8      | 10-16    | Todos           | 2-3 sesiones      |
| 4    | Con auditoría       | Variable | Variable | Todos + auditor | 1 semana          |
| 5    | Producción          | Variable | Variable | Completo        | Indefinido        |

---

## Regla de oro

> No avances a la siguiente fase hasta que la anterior funcione sin sorpresas.

Una sorpresa en Fase 1 (el handoff no funciona bien) es barata — solo 2 sesiones perdidas. La misma sorpresa en Fase 5 puede significar 50 sesiones con trabajo inconsistente.

La velocidad real está en hacer bien las fases iniciales, no en saltar a producción.
