# Skill: diseñador-arquitectura

**Responsable de**: Fase 3 - Diseño  
**Entrada**: `01-propuesta.md` + `02-especificacion.md` (existen)  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md`

---

## Propósito

Transformar la **ESPECIFICACIÓN** en una **ARQUITECTURA DE DISEÑO** con decisiones claras, patrones aplicados y detalles de implementación. Este documento define el HOW: cómo implementar cada requirement de forma que resuelva violaciones SOLID.

---

## Invocación

```bash
/diseñador-arquitectura {cambio-id}

# Ejemplo:
/diseñador-arquitectura soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer propuesta: `docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md`
- Leer especificación: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`
- Leer template: `docs/architecture/sdd/plantillas/03-diseño-template.md`
- Leer arquitectura actual: `docs/architecture/` y `CLAUDE.md` (stack, patrones)

### Step 2: Diseñar arquitectura

Para cada requirement en spec, decidir:

1. **Dónde va el código** — Qué archivos modificar
2. **Qué patrón aplicar** — Soft delete, event-driven, service layer, etc.
3. **Qué cambios en DB** — Migraciones Prisma, índices, campos
4. **Qué flujos cambian** — Diagramas de estado, secuencias
5. **Alternativas descartadas** — Por qué no otra forma

### Step 3: Escribir diseño siguiendo template

Estructura:

1. **Resumen Arquitectónico** — 1-2 párrafos de decisiones clave
2. **Estado Actual vs Propuesto** — ASCII diagrams mostrando qué cambia
3. **Decisiones Arquitectónicas** — Por cada decisión:

   ````
   ### Decisión N: {Nombre}

   **Problema**: {Qué hay que resolver}
   **Solución elegida**: {Opción seleccionada}
   **Alternativas descartadas**: {Por qué no A, B, C}
   **Impacto**: {Cómo afecta al sistema}
   **Reversibilidad**: {Fácil/Difícil/Imposible}

   **Código de referencia**:
   ```typescript
   [snippet mostrando cómo implementar]
   ````

   ```

   ```

4. **Archivos a Modificar** — Tabla con paths, cambios, líneas estimadas
5. **Patrones Aplicados** — Qué patrones (Soft Delete, Service Layer, etc.)
6. **Impacto en BD** — Migrations SQL, reversibilidad, performance
7. **Flujo de Datos** — Diagrama ASCII o tabla de flujo request→response
8. **Riesgos y Mitigación** — Tabla con riesgos, probabilidad, impacto, plan

### Step 4: Leer código actual

Antes de escribir decisiones:

- Leer los archivos que se van a modificar
- Entender patrones existentes (cómo hace soft delete en otros módulos)
- Asegurar consistencia con convenciones del proyecto

### Step 5: Validar decisiones contra requisitos

Cada decisión DEBE:

- Resolver un requirement específico de la especificación
- Estar trazable a la propuesta
- Explicar por qué esa implementación (no otra)

### Step 6: Persistir artefacto

```
docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md
```

### Step 7: Actualizar INDICE.md

```markdown
## {cambio-id}

- **Estado**: ⏳ Diseño creado (Fase 3)
- **Artefactos**:
  - ✅ 01-propuesta.md
  - ✅ 02-especificacion.md
  - ✅ 03-diseño.md (creado)
  - [ ] 04-tareas.md (próximo)
```

### Step 8: Retornar resumen

```markdown
## ✅ Diseño Creado

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md  
**Decisiones Arquitectónicas**: N  
**Archivos a Modificar**: M  
**Patrones**: {lista}

**Próximo paso**: Ejecutar `/desglosador-tareas` para crear 04-tareas.md
```

---

## Reglas

- ✅ Leer template ANTES de escribir
- ✅ Leer código actual de los módulos que se van a modificar
- ✅ Cada decisión DEBE tener alternativas evaluadas
- ✅ Incluir código de referencia (snippets reales o patterns)
- ✅ Explicar impacto en BD (migrations, índices)
- ✅ Incluir reversibilidad de cada decisión
- ✅ Usar ASCII diagrams para "Antes/Después"
- ❌ NO incluir task breakdown (eso es fase 4)
- ❌ NO escribir código real aún (solo patterns)
- ❌ NO estimar esfuerzo detallado (eso es fase 4)

---

## Checklist de Completitud

- [ ] Diseño escrito siguiendo template
- [ ] ≥2 decisiones arquitectónicas documentadas
- [ ] Cada decisión tiene alternativas evaluadas
- [ ] Código de referencia incluido para patrones
- [ ] Archivos a modificar identificados con líneas estimadas
- [ ] Patrones aplicados listados
- [ ] Impacto en BD explicado
- [ ] Diagrama estado Actual vs Propuesto
- [ ] Riesgos y mitigación identificados
- [ ] Reversibilidad evaluada
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (desglosador-tareas)
