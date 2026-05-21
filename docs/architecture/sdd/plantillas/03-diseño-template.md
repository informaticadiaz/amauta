# DISEÑO — {cambio-id}

**Generado desde**: 02-especificacion.md  
**Skill Responsable**: `diseñador-arquitectura`  
**Estado**: 📋 Arquitectura definida

---

## 📌 Resumen Arquitectónico

{Resumen de decisiones arquitectónicas. 1-2 párrafos.}

---

## 🔄 Estado Actual vs Propuesto

### Antes (Current State)

```
[ASCII diagram del estado actual]
```

### Después (Proposed State)

```
[ASCII diagram del estado propuesto]
```

---

## 🏗️ Decisiones Arquitectónicas

### Decisión 1: {Nombre}

**Problema**: {Qué hay que resolver}  
**Solución elegida**: {Opción A/B/C}  
**Alternativas descartadas**: {Por qué no otras opciones}  
**Impacto**: {Cómo afecta al sistema}  
**Reversibilidad**: {Fácil/Difícil/Imposible revertir}

**Código de referencia**:

```typescript
[Snippet de código que ejemplifica la decisión]
```

---

### Decisión 2: {Nombre}

**Problema**: {Qué hay que resolver}  
**Solución elegida**: {Opción elegida}  
**Impacto**: {Cómo afecta}

**Código de referencia**:

```typescript
[Snippet];
```

---

## 📂 Archivos a Modificar

| Archivo                                            | Cambios           | Líneas  | Razón                       |
| -------------------------------------------------- | ----------------- | ------- | --------------------------- |
| `apps/api/prisma/schema.prisma`                    | +estado field     | 180-190 | Nuevo campo en modelo       |
| `apps/api/src/lecciones/lecciones.service.ts`      | Soft delete logic | 237-263 | Cambiar delete() a update() |
| `apps/api/src/lecciones/lecciones.service.spec.ts` | +6 tests          | 327-383 | Validar soft delete         |

---

## 🎨 Patrones Aplicados

### Patrón 1: {Nombre del Patrón}

**Ubicación**: {Archivos donde se aplica}  
**Propósito**: {Qué resuelve}

**Implementación**:

```typescript
[Code ejemplo]
```

### Patrón 2: {Nombre del Patrón}

**Ubicación**: {Archivos}  
**Propósito**: {Qué resuelve}

---

## 🗄️ Impacto en Base de Datos

### Schema Changes

```sql
-- Migration: 20260520000000_add_leccion_estado

ALTER TABLE "lecciones" ADD COLUMN "estado" VARCHAR(50) NOT NULL DEFAULT 'ACTIVO';
CREATE INDEX "lecciones_estado_idx" ON "lecciones"("estado");
```

### Reversibilidad

```sql
-- Rollback si es necesario

ALTER TABLE "lecciones" DROP INDEX "lecciones_estado_idx";
ALTER TABLE "lecciones" DROP COLUMN "estado";
```

### Performance Impact

- **Read**: +5% (nuevo index ayuda a filtros)
- **Write**: -0% (solo un campo más)
- **Storage**: +50 bytes por fila (string VARCHAR(50))

---

## 🔄 Flujo de Datos

```
Request (API endpoint)
  ↓
Controller
  ↓
Service (con lógica soft delete)
  ↓
Prisma (filtra estado != ARCHIVADO)
  ↓
PostgreSQL
  ↓
Respuesta (sin archivadas)
```

---

## ⚠️ Consideraciones de Riesgo

| Riesgo     | Probabilidad | Impacto | Mitigación           |
| ---------- | ------------ | ------- | -------------------- |
| {Riesgo 1} | Alta         | Alto    | {Plan de mitigación} |
| {Riesgo 2} | Media        | Medio   | {Plan de mitigación} |

---

## ✅ Validación de Decisiones

Cada decisión será validada en fase 6 (Verificación):

- [ ] Decisión 1: Implementada según diseño
- [ ] Decisión 2: Implementada según diseño
- [ ] Tests cubren casos de uso
- [ ] Performance meets expectations
- [ ] Código pasa linting

---

## 🔗 Trazabilidad: Spec → Diseño → Tasks

| Req (02) | Diseño (03) | Tasks (04) |
| -------- | ----------- | ---------- |
| Req 1    | Decisión 1  | Task 1-2   |
| Req 2    | Decisión 2  | Task 3     |
| Req 3-5  | Patrones    | Task 4-6   |

---

**Generado por**: `diseñador-arquitectura` skill  
**Próximo**: 04-tareas.md (Skill: `desglosador-tareas`)
