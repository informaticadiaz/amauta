# Skill: Features Audit

> Verifica si un issue completado realmente existe como funcionalidad usable en la app (end-to-end, por rol). Genera reporte de auditoría detallado.
> **Diferencia vs `feature-audit`**: `feature-audit` es más “calidad interna”
> (tests, cobertura, patrones). `features-audit` agrega verificación **de
> experiencia/flujo real** (UI por rol, rutas, permisos, estados) y evidencia.

---

## Uso

```
Auditar funcionalidad del issue #N
features-audit #N
```

### Parámetros (en prompt)

| Parámetro | Descripción               | Ejemplo                |
| --------- | ------------------------- | ---------------------- |
| `issue`   | número de issue a auditar | `#86`                  |
| `rol`     | rol principal a auditar   | `ADMIN_ESCUELA`        |
| `entorno` | dónde verificar           | `local` / `produccion` |

Si el usuario no especifica `rol`, inferirlo desde el issue (labels/texto) y
dejarlo explícito en el reporte.

---

## Principios (CRÍTICO)

1. **CONCEPTOS > código**: no alcanza con que existan endpoints/componentes. Debe
   poder completarse el flujo como usuario.
2. **Evidencia o no existe**: todo “✅” debe incluir al menos una evidencia:
   archivo+ruta, test, o verificación runtime (UI / request / respuesta).
3. **No arregles**: esta skill NO implementa fixes. Solo audita y reporta.
4. **No inventes**: si no podés verificar UI en runtime, marcá “NO VERIFICABLE
   EN ESTA AUDITORÍA” y explicá por qué.

---

## Checklist de Auditoría (ejecutar en orden)

### PASO 0 — Cargar el issue como fuente de verdad

```bash
gh issue view [N] --json title,body,labels,state
```

- Extraer **criterios de aceptación** (checklists, “Definition of Done”, ejemplos).
- Extraer **rol** implicado (si lo dice el issue).
- Listar **rutas/pantallas** mencionadas.

---

### PASO 1 — Mapear “user journey” (flujo real)

Armar un flujo mínimo en 5-10 pasos. Ejemplo (asistencias):

1. Login como `ADMIN_ESCUELA`
2. Ir a `/dashboard/asistencias`
3. Seleccionar grupo + fecha
4. Ver nómina de estudiantes
5. Cambiar estado de asistencia + observación
6. Guardar
7. Ver confirmación + persistencia (reload / volver a entrar)

Este flujo se convierte en la tabla “User Journey” del reporte.

---

### PASO 2 — Verificación estática (código) por capas

#### 2.1 UI / Navegación

- Encontrar páginas relevantes en `apps/web/src/app/**`.
- Verificar que existan componentes clave y que estén conectados a data fetching.
- Verificar que el acceso sea consistente con el rol (guards/hoc/hooks/proxies).

#### 2.2 API / Contrato

- Identificar endpoints llamados desde el frontend (proxies en `apps/web/src` si existen).
- Verificar controllers/services en `apps/api/src/**`.
- Verificar validaciones (Zod/safeParse), permisos y casos de error.

#### 2.3 Persistencia (si aplica)

- Verificar models/constraints en `apps/api/prisma/schema.prisma`.

**Salida de este paso**: una tabla “Trazabilidad”:

| Criterio | UI (ruta) | API (endpoint) | DB (modelo) | Tests | Estado |
| -------- | --------- | -------------- | ----------- | ----- | ------ |

---

### PASO 3 — Verificación por pruebas (tests existentes)

> No corras builds. Solo tests/tsc cuando sea relevante para verificar integridad.

Backend (si el issue es backend o toca reglas):

```bash
npm run test -w @amauta/api
```

Frontend (si el issue es UI):

```bash
npm run test -w @amauta/web
```

Si el set completo es muy caro, priorizar tests del módulo/ruta afectada y dejar
constancia en el reporte (qué se corrió y qué NO).

---

### PASO 4 — Verificación runtime (lo que asegura “funciona”)

Esta es la diferencia clave de esta skill.

#### Opción A — Local (preferido si está disponible)

- Usar la app corriendo localmente y navegar el flujo mínimo.
- Registrar evidencia: pantallas alcanzadas, estados, requests clave (si se puede).

#### Opción B — Producción (smoke test controlado)

- Validar que el flujo exista a nivel UI/ruta y que los requests relevantes respondan OK.
- NO hacer acciones destructivas en prod (siempre preferir datos de prueba o acciones idempotentes).

**Si no hay acceso a runtime** (no está corriendo, no hay credenciales, etc):

- Marcarlo como “No verificado en runtime” y bajar el veredicto a ⚠️/❌ según el riesgo.

---

## Reporte (OBLIGATORIO)

Crear archivo:

- Path: `docs/reportes-issues/issue-[N]-audit-[YYYY-MM-DD].md`
- Ejemplo: `docs/reportes-issues/issue-86-audit-2026-05-18.md`

### Plantilla de reporte

```markdown
# Auditoría de Funcionalidad — Issue #N — [Título]

Fecha: YYYY-MM-DD
Auditoría: features-audit (IA)
Rol auditado: [ROL]
Entorno: local / produccion / sin-runtime

## Veredicto

✅ APROBADO / ⚠️ APROBADO CON RIESGO / ❌ RECHAZADO

## Resumen ejecutivo (2-5 líneas)

## Criterios de aceptación (del issue)

- [ ] criterio 1 — ✅/⚠️/❌ — evidencia
- [ ] criterio 2 — ✅/⚠️/❌ — evidencia

## User Journey (flujo mínimo)

| Paso | Acción | Esperado | Observado | Estado |
| ---- | ------ | -------- | --------- | ------ |

## Trazabilidad (UI → API → DB → Tests)

| Criterio | UI  | API | DB  | Tests | Estado | Evidencia |
| -------- | --- | --- | --- | ----- | ------ | --------- |

## Evidencia

- Código: `ruta/archivo.ts:línea`
- Tests: `ruta/test.spec.ts` (suite, caso)
- Runtime: [qué se verificó y cómo]

## Hallazgos

### 🔴 Bloqueantes

1. ...

### 🟡 Riesgos / deuda

1. ...

## Recomendación

- CONTINUAR el loop / DETENER el loop
- Acciones sugeridas (para un issue nuevo o para reabrir el actual)
```

---

## Criterios para el veredicto

- ✅ **APROBADO**: el flujo por rol se puede completar end-to-end (idealmente verificado en runtime), y los criterios están cubiertos.
- ⚠️ **APROBADO CON RIESGO**: evidencia parcial (solo estático/tests) o runtime no verificable; riesgo razonable pero documentado.
- ❌ **RECHAZADO**: criterio clave no implementado, permisos/flujo roto, o falla de tests crítica asociada.
