# Skill: Feature Audit

> QA Engineer senior audita features: tests (cobertura, passing), criterios de aceptación, patrones del proyecto. Alcance: por fase, módulo o issue.
> **Referencia**: criterios de aceptación en los issues de GitHub, `CLAUDE.md`,
> `docs/technical/testing.md`, `docs/ai-context/_patterns.md`.

---

## Uso

```
Audita [scope]
```

**Ejemplos:**

```
Audita el módulo de progreso
Audita todas las features de Fase 1
Audita el issue #43
Audita el módulo de inscripciones
Audita el frontend del visualizador de lecciones
```

---

## Parámetros

| Parámetro | Descripción                                                       | Ejemplo              |
| --------- | ----------------------------------------------------------------- | -------------------- |
| `scope`   | Qué auditar: issue (#N), módulo (backend/frontend), fase completa | `módulo de progreso` |

---

## Proceso de Auditoría (Ejecutar en Orden)

### PASO 0 — Identificar el Scope

Si el scope es un **issue específico** (#N):

```bash
gh issue view [N] --json title,body,labels,state
```

Extraer los criterios de aceptación del checklist del issue.

Si el scope es un **módulo**:

- Backend: `apps/api/src/[modulo]/`
- Frontend: `apps/web/src/components/[modulo]/` y páginas relacionadas

Si el scope es una **fase completa**:

- Leer `CLAUDE.md` → sección "Completado en Fase X" para listar todos los issues
- Auditar cada uno en orden

---

### PASO 1 — Cargar Contexto del Feature

Para cada feature a auditar, leer:

```
LEER: CLAUDE.md → sección del issue/feature para conocer lo implementado
LEER: docs/ai-context/modules/[modulo].md (si existe)
```

Si el feature toca base de datos:

```
LEER: apps/api/prisma/schema.prisma → verificar que el schema coincide con la implementación
```

---

### PASO 2 — Auditar Tests

#### 2.1 Verificar que existen tests

Para módulos **backend**:

```bash
# Listar archivos de test del módulo
ls apps/api/src/[modulo]/*.spec.ts
```

Para módulos **frontend**:

```bash
ls apps/web/src/components/[modulo]/__tests__/
ls apps/web/src/components/[modulo]/*.test.tsx
```

**Señales de problema:**

- ❌ No existe ningún archivo `.spec.ts` o `.test.tsx`
- ❌ El archivo de test está vacío o tiene menos de 5 tests para un módulo CRUD
- ⚠️ Los tests son solo de "happy path" sin casos de error

#### 2.2 Ejecutar los tests y verificar que pasan

Backend:

```bash
cd C:/Users/infor/DevHome/amauta && npx jest --config apps/api/jest.config.js --testPathPatterns="[modulo]" --no-coverage 2>&1
```

Frontend:

```bash
cd C:/Users/infor/DevHome/amauta/apps/web && npx jest --testPathPatterns="[modulo]" --no-coverage 2>&1
```

**Resultado esperado:**

- ✅ Todos los tests pasan (0 failures)
- ❌ Si algún test falla: es un hallazgo crítico de la auditoría

#### 2.3 Verificar cobertura

Backend (con cobertura del módulo específico):

```bash
cd C:/Users/infor/DevHome/amauta && npx jest --config apps/api/jest.config.js --testPathPatterns="[modulo]" --coverage --collectCoverageFrom="apps/api/src/[modulo]/**/*.ts" 2>&1
```

Frontend:

```bash
cd C:/Users/infor/DevHome/amauta/apps/web && npx jest --testPathPatterns="[modulo]" --coverage --collectCoverageFrom="src/components/[modulo]/**" 2>&1
```

**Umbrales mínimos:**
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Statements | >80% | >90% |
| Branches | >70% | >85% |
| Functions | >80% | >95% |
| Lines | >80% | >90% |

---

### PASO 3 — Auditar el Código contra Criterios de Aceptación

Para cada criterio de aceptación del issue, verificar en el código:

#### 3.1 Leer el código implementado

```
LEER: apps/api/src/[modulo]/[modulo].service.ts
LEER: apps/api/src/[modulo]/[modulo].controller.ts
LEER: apps/web/src/app/[ruta]/page.tsx
LEER: apps/web/src/components/[modulo]/[Componente].tsx
```

#### 3.2 Verificar cada criterio de aceptación

Por cada ítem del checklist del issue, responder:

| Criterio     | ¿Implementado? | ¿Dónde?       | ¿Testeado? |
| ------------ | -------------- | ------------- | ---------- |
| [criterio 1] | ✅/❌/⚠️       | archivo:línea | ✅/❌      |
| [criterio 2] | ✅/❌/⚠️       | archivo:línea | ✅/❌      |

**Señales de problema:**

- ❌ Un criterio de aceptación no está implementado
- ⚠️ Implementado parcialmente (ej: endpoint existe pero falta validación)
- ⚠️ Implementado pero no testeado

#### 3.3 Verificar patrones del proyecto

Revisar que el código sigue los patrones de `docs/ai-context/_patterns.md`:

**Validación (backend):**

```typescript
// ✅ DEBE usar safeParse
const result = schema.safeParse(dto);
if (!result.success) throw new BadRequestException(...);

// ❌ NO debe usar parse directo
schema.parse(dto); // MAL
```

**Soft delete:**

```typescript
// ✅ Cambiar estado a ARCHIVADO
prisma.[modelo].update({ data: { estado: 'ARCHIVADO' } });

// ❌ Nunca borrar físicamente
prisma.[modelo].delete(...); // MAL (salvo justificación explícita en el issue)
```

**Estructura de respuestas:**

```typescript
// ✅ Singular: { [modelo]: data, message: '...' }
// ✅ Lista: { [modelos]: data[], total, page, limit, totalPages }
```

**Guards en el controller:**

```typescript
// ✅ Endpoints protegidos usan JwtAuthGuard + RolesGuard
// ✅ Endpoints públicos usan @Public()
```

---

### PASO 4 — Smoke Test contra la API de Producción (si aplica a backend)

Para endpoints backend, hacer un smoke test rápido contra producción:

```bash
# Verificar que el endpoint existe y responde (sin auth — debe dar 401)
curl -s -o /dev/null -w "%{http_code}" https://amauta-api.diazignacio.ar/api/v1/[endpoint]
# Esperado: 401 (no 404 ni 500)
```

Para endpoints públicos:

```bash
curl -s https://amauta-api.diazignacio.ar/api/v1/cursos | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('total:', d.total, '| cursos:', d.cursos?.length);
"
```

**Señales de problema:**

- ❌ 404: el endpoint no existe en producción (no fue desplegado o hay error de ruta)
- ❌ 500: error interno del servidor
- ⚠️ 200 en endpoint que debería requerir auth (falta de guard)

---

### PASO 5 — Verificar Documentación

Para cada feature auditada verificar:

1. **`CLAUDE.md`**: ¿el issue aparece en "Completado" con descripción de lo implementado?
2. **`docs/project-management/roadmap.md`**: ¿el issue está marcado como ✅ Completado?
3. **`docs/sistema/README.md`**: ¿el módulo aparece como ✅ Funcional?
4. **`docs/human-context/issue-[N]-*.md`**: ¿existe documentación no técnica?
5. **`docs/ai-context/modules/[modulo].md`**: ¿está actualizado con los nuevos endpoints?

---

### PASO 6 — Generar el Informe de Auditoría

Producir el informe en este formato exacto:

---

## 🔍 Informe de Auditoría de Features — [Scope auditado]

**Fecha:** [fecha actual]
**Auditor:** QA Engineer (IA)
**Features auditadas:** [lista de issues/módulos]
**Estado general:** [✅ APROBADO / ⚠️ APROBADO CON OBSERVACIONES / ❌ RECHAZADO]

---

### Resumen Ejecutivo

[2-3 oraciones describiendo el estado general: cuántas features pasan, cuántas tienen issues, riesgo general para el usuario final]

---

### Resultados por Feature

#### [Feature 1] — #N [Título]

**Estado:** ✅ APROBADO / ⚠️ CON OBSERVACIONES / ❌ RECHAZADO

**Tests:**
| Métrica | Valor | Estado |
|---------|-------|--------|
| Tests totales | N | ✅/❌ |
| Tests pasando | N | ✅/❌ |
| Cobertura statements | N% | ✅/⚠️/❌ |
| Cobertura branches | N% | ✅/⚠️/❌ |

**Criterios de Aceptación:**
| Criterio | Estado | Notas |
|----------|--------|-------|
| [criterio 1] | ✅ | [dónde está implementado] |
| [criterio 2] | ⚠️ | [qué falta o es parcial] |
| [criterio 3] | ❌ | [no implementado] |

**Patrones del proyecto:**

- safeParse: ✅/❌
- Soft delete: ✅/❌/N/A
- Guards: ✅/❌/N/A
- Estructura de respuesta: ✅/❌/N/A

**Smoke test producción:** ✅ OK / ❌ FALLA / N/A

**Documentación:** ✅ Completa / ⚠️ Parcial / ❌ Faltante

**Hallazgos:**

- [hallazgo 1 si existe]
- [hallazgo 2 si existe]

---

[Repetir para cada feature auditada]

---

### Resumen General

| Feature     | Tests    | Criterios | Patrones | Producción | Docs     | Estado   |
| ----------- | -------- | --------- | -------- | ---------- | -------- | -------- |
| #N [nombre] | ✅/⚠️/❌ | ✅/⚠️/❌  | ✅/⚠️/❌ | ✅/⚠️/❌   | ✅/⚠️/❌ | ✅/⚠️/❌ |

**Totales:**

- ✅ Aprobadas: N features
- ⚠️ Con observaciones: N features
- ❌ Rechazadas: N features

---

### Hallazgos que Requieren Acción

> Solo incluir hallazgos que tienen impacto real en el funcionamiento o la calidad.

#### 🔴 BLOQUEANTE — [Descripción]

**Feature afectada:** #N
**Impacto:** [qué falla para el usuario]
**Acción requerida:** [qué hay que hacer]
**Archivo:** `ruta/archivo.ts:línea`

---

#### 🟡 MEJORA RECOMENDADA — [Descripción]

**Feature afectada:** #N
**Impacto:** [riesgo o deuda técnica]
**Acción recomendada:** [qué se debería hacer]

---

### Lo que está bien implementado ✅

[Lista de fortalezas encontradas durante la auditoría]

---

### Recomendaciones para la Siguiente Fase

[Observaciones proactivas basadas en lo visto: qué mejorar antes de avanzar a Fase 2]

---

## Criterios de Aprobación

| Estado               | Condición                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ APROBADO          | Tests pasan, cobertura >80% statements, todos los criterios de aceptación cumplidos, patrones respetados                                |
| ⚠️ CON OBSERVACIONES | Tests pasan, pero hay criterios parciales, cobertura baja o documentación incompleta. Funciona para el usuario pero tiene deuda técnica |
| ❌ RECHAZADO         | Algún test falla, un criterio de aceptación crítico no está implementado, o el smoke test falla en producción                           |

## Notas para la Auditoría

- **Foco en el usuario final**: Un criterio es "cumplido" si funciona correctamente para el usuario, no solo si el código existe.
- **Producción primero**: Si el smoke test falla en producción, es un hallazgo crítico independientemente de los tests locales.
- **Tests que no testean**: Un test que siempre pasa sin importar la implementación es peor que no tener test. Verificar que los tests son significativos.
- **Cobertura de branches**: Prestar especial atención a branches no cubiertos — suelen ser los casos de error que fallan en producción.
- **Documentación humana**: Verificar que existe `docs/human-context/issue-[N]-*.md` — es obligatoria según el workflow.
- **Sin DB local**: Los tests de backend usan mocks. El smoke test contra producción es la única verificación real de que funciona con la DB real.
- **Compatibilidad de entornos**: Comandos bash deben ser compatibles con Windows (usar rutas absolutas, evitar `/dev/stdin`).
