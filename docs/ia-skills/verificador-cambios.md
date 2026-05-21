# Skill: verificador-cambios

**Responsable de**: Fase 6 - Verificación  
**Entrada**: `05-implementacion.md` + código implementado + tests  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/06-verificacion.md`

---

## Propósito

Validar que la **IMPLEMENTACIÓN** (código real) satisface completamente la **ESPECIFICACIÓN** y sigue el **DISEÑO**. Este skill es el QA de la arquitectura: verifica que lo que se implementó es exactamente lo que se pidió.

---

## Invocación

```bash
/verificador-cambios {cambio-id}

# Ejemplo:
/verificador-cambios soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer especificación: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`
- Leer diseño: `docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md`
- Leer implementación: `docs/architecture/sdd/cambios/{cambio-id}/05-implementacion.md`
- Leer template: `docs/architecture/sdd/plantillas/06-verificacion-template.md`
- Leer código implementado

### Step 2: Validación de Especificación

Por cada Requirement en la especificación:

1. **Identificar el requirement** — Req N: "Agregar campo estado a Leccion"
2. **Leer escenarios** — Given/When/Then
3. **Verificar implementación** — ¿El código implementa esto?
4. **Encontrar evidencia** — {archivo}:{líneas} donde se implementa
5. **Veredicto** — ✅ APROBADO / ⚠️ PARCIAL / ❌ RECHAZADO

```markdown
### Requirement 1: {Nombre}

**Spec (02)**: {Descripción}  
**Implementado**: ✅ SÍ  
**Evidencia**: {apps/api/prisma/schema.prisma:184-186}  
**Estado**: ✅ APROBADO
```

### Step 3: Validación de Diseño

Por cada Decisión Arquitectónica en el diseño:

1. **Identificar la decisión** — Decisión 1: "Soft delete con field estado"
2. **Leer implementación de la decisión** — ¿Está implementada así?
3. **Verificar patrones** — ¿Se aplican los patrones descritos?
4. **Encontrar código** — {archivo}:{líneas}
5. **Veredicto** — ✅ IMPLEMENTADA / ❌ DESVIADA

```markdown
### Decisión 1: {Nombre}

**Diseño (03)**: {Descripción}  
**Implementada correctamente**: ✅ SÍ  
**Código**: {apps/api/src/lecciones/lecciones.service.ts:237-263}  
**Estado**: ✅ APROBADO
```

### Step 4: Validación de Tests

- Ejecutar `npm test -- {modulo}` para el módulo modificado
- Contar tests passing / total
- Calcular cobertura (statements, branches, functions, lines)
- Verificar que cobertura ≥80% (o 100% si es requisito)

```
Tests encontrados: 41
Tests passing: 41 ✅
Tests failing: 0 ✅

Coverage:
Statements   : 95.29% ✅ Requisito: ≥80%
Branches     : 80.00% ✅ Requisito: ≥80%
Functions    : 100%   ✅ Requisito: 100%
Lines        : 95.24% ✅ Requisito: ≥80%
```

### Step 5: Validación de Código

- `npm run build` — Debe pasar
- `npx tsc --noEmit` — 0 errors
- ESLint: Passing
- Prettier: Passing
- Verificación manual: código legible, sin TODOs, sin hardcodes

```
TypeScript: 0 errors ✅
ESLint: Passing ✅
Prettier: Passing ✅
npm run build → ✅ SUCCESS
```

### Step 6: Validación de Impacto

Evaluar impacto en:

- **Performance** — ¿Hay degradación? (queries más lentas, más memoria, etc.)
- **Complexity** — ¿Aumentó complejidad ciclomática injustificadamente?
- **Breaking Changes** — ¿API cambió de forma incompatible?

```markdown
### Performance

- Read operations: +5% (nuevo index ayuda) ✅
- Write operations: -0% (sin cambios) ✅
- Storage: +50 bytes/row (acceptable) ✅

### Complexity

- SOLID violations: ✅ Resueltas
- Code duplication: ✅ Ninguna introducida
- Cyclomatic complexity: ✅ OK
```

### Step 7: Validación de Deployment Readiness

Checklist:

- [ ] Migration reversible
- [ ] Tests en CI/CD pasan
- [ ] Documentación actualizada
- [ ] Zero breaking changes
- [ ] Rollback plan existe

### Step 8: Deviations from Design

Listar cualquier desviación:

- Si el código se implementó DIFERENTE a lo diseñado, documentar por qué
- Si el diseño fue incompleto o ambiguo, documentar
- Si surgieron problemas durante implementación, documentar

```markdown
## ⚠️ Deviations from Design

**Deviations encontradas**: ❌ NINGUNA

La implementación es exacta al diseño especificado en 03-diseño.md.
```

O si hay desviaciones:

```markdown
## ⚠️ Deviations from Design

### Desviación 1: {Nombre}

**Diseño esperaba**: {X}  
**Se implementó**: {Y}  
**Razón**: {Por qué fue necesario}  
**Impacto**: {Cómo afecta al sistema}  
**Aprobado**: ✅ Aceptable / ⚠️ Requiere revisión
```

### Step 9: Veredicto Final

Matriz de validación:

```markdown
| Aspect         | Requerimiento  | Implementado | Estado |
| -------------- | -------------- | ------------ | ------ |
| **Spec**       | 5 Requirements | ✅ Todos     | PASS   |
| **Design**     | 2 Decisiones   | ✅ Ambas     | PASS   |
| **Tests**      | ≥80% coverage  | ✅ 95%       | PASS   |
| **TypeScript** | 0 errors       | ✅ 0         | PASS   |
| **Build**      | Success        | ✅ OK        | PASS   |
| **Deviations** | Ninguna        | ✅ Ninguna   | PASS   |
```

Veredicto final:

- ✅ **APROBADO PARA PRODUCCIÓN** — Todo ok, listo para deploy
- ⚠️ **APROBADO CON NOTAS** — Ok pero con observaciones documentadas
- ❌ **RECHAZADO** — No cumple requisitos, requiere rework

### Step 10: Persistir artefacto

```
docs/architecture/sdd/cambios/{cambio-id}/06-verificacion.md
```

### Step 11: Actualizar INDICE.md

```markdown
## {cambio-id}

- **Estado**: ⏳ Verificación completada (Fase 6)
- **Veredicto**: ✅ APROBADO PARA PRODUCCIÓN
- **Artefactos**:
  - ✅ 01-propuesta.md
  - ✅ 02-especificacion.md
  - ✅ 03-diseño.md
  - ✅ 04-tareas.md
  - ✅ 05-implementacion.md
  - ✅ 06-verificacion.md (creado)
  - [ ] 07-cierre.md (próximo)
```

### Step 12: Retornar resumen

```markdown
## ✅ Verificación Completada

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/06-verificacion.md  
**Veredicto**: ✅ APROBADO PARA PRODUCCIÓN

**Validaciones**:

- Spec: 5/5 requirements aprobados
- Design: 2/2 decisiones aprobadas
- Tests: 41/41 passing (95% coverage)
- TypeScript: 0 errors
- Build: ✅ successful
- Deviations: ninguna

**Próximo paso**: Ejecutar `/archivador-cambios` para crear 07-cierre.md y cerrar el cambio
```

---

## Reglas

- ✅ Leer template ANTES de escribir
- ✅ Leer especificación y diseño ANTES de validar código
- ✅ Cada requirement DEBE estar trazable a código
- ✅ Ejecutar tests y verificar cobertura
- ✅ Documentar deviations explícitamente (no ignorarlas)
- ✅ Ser estricto: veredicto RECHAZADO si hay gaps significativos
- ✅ Incluir evidencia (archivo:línea) para cada validación
- ❌ NO pasar por alto TypeScript errors
- ❌ NO ignorar test failures
- ❌ NO aceptar deviations sin documentar
- ❌ NO sellar el cambio sin validar completamente

---

## Checklist de Completitud

- [ ] Especificación validada (todos los requirements)
- [ ] Diseño validado (todas las decisiones implementadas)
- [ ] Tests ejecutados (N/N passing)
- [ ] Cobertura medida (≥80%)
- [ ] TypeScript: 0 errors
- [ ] Build: ✅ successful
- [ ] Performance impact evaluado
- [ ] Complexity evaluado
- [ ] Deviations documentados (o ninguno)
- [ ] Deployment readiness checklist completado
- [ ] Matriz final de validación completada
- [ ] Veredicto final definido (APROBADO/RECHAZADO)
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (archivador-cambios)
