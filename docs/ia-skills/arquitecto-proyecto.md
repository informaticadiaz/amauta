# Skill: arquitecto-proyecto

**Responsable de**: Fase 1 - Propuesta  
**Entrada**: Descripción del problema, síntomas, contexto  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md`

---

## Propósito

Transformar un problema arquitectónico o una solicitud de cambio en un documento de **PROPUESTA** estructurado, siguiendo el template de Amauta SDD. Este documento es el punto de partida de todo cambio.

---

## Invocación

```bash
/arquitecto-proyecto

Prompt:
{
  cambio_id: "soft-delete-lecciones",
  problema: "El patrón de eliminación en Lecciones usa delete() físico...",
  contexto: "Módulo lecciones, violación de soft-delete pattern",
  modules_afectados: ["lecciones"],
  criterios_exito: ["Zero breaking changes", "Tests passing", "Cobertura ≥80%"]
}
```

---

## Proceso

### Step 1: Leer contexto

- Leer `docs/architecture/sdd/README.md` para entender estructura de cambios
- Leer template: `docs/architecture/sdd/plantillas/01-propuesta-template.md`
- Leer `docs/architecture/sdd/cambios/INDICE.md` para ver patrones de cambios anteriores

### Step 2: Analizar entrada del usuario

Extraer:

- **Problema**: ¿Cuál es el síntoma arquitectónico?
- **Impacto**: ¿Qué módulos afecta?
- **Violaciones SOLID**: ¿Qué principios están siendo violados?
- **Objetivo**: ¿Qué debería cambiar?

### Step 3: Crear propuesta siguiendo template

Secciones a completar:

1. **Resumen ejecutivo** — 2-3 párrafos del problema y solución propuesta
2. **Problema** — Síntomas, impacto actual, dónde duele
3. **Solución propuesta** — Enfoque elegido (no detalles técnicos aún)
4. **Módulos afectados** — Lista con impacto por módulo
5. **Violaciones SOLID** — Qué principio se viola (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
6. **Opciones evaluadas** — Tabla de alternativas con tradeoffs
7. **Plan de refactoring** — Fases, dependencias, orden de ejecución
8. **Criterios de éxito** — Checklist de objetivos medibles (tests, cobertura, performance, etc.)

### Step 4: Persistir artefacto

Crear archivo:

```
docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md
```

Asegurarse de que el directorio `{cambio-id}/` no exista aún (es la fase inicial).

### Step 5: Actualizar INDICE.md

Agregar entrada a `docs/architecture/sdd/cambios/INDICE.md`:

```markdown
## {cambio-id}

- **Estado**: ⏳ Propuesta creada (Fase 1)
- **Fecha Inicio**: {YYYY-MM-DD}
- **Descripción**: {Una línea del problema}
- **Módulos**: {lista}
- **Artefactos**:
  - ✅ 01-propuesta.md (creado)
  - [ ] 02-especificacion.md (próximo)
```

### Step 6: Retornar resumen

```markdown
## ✅ Propuesta Creada

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md  
**Módulos afectados**: {lista}  
**Criterios de éxito**: {N} definidos

**Próximo paso**: Ejecutar `/especificador-cambios` para crear 02-especificacion.md
```

---

## Reglas

- ✅ Leer el template 01-propuesta-template.md ANTES de escribir
- ✅ Asegurarse de que {cambio-id} es único (consultar INDICE.md)
- ✅ Usar nombres descriptivos: `soft-delete-lecciones`, `event-driven-modulos`, etc.
- ✅ Completar TODAS las secciones del template
- ✅ Usar tablas para opciones evaluadas (decisiones visibles)
- ✅ Incluir referencias a violaciones SOLID específicas
- ❌ NO incluir detalles de implementación (eso es para fase 3, Diseño)
- ❌ NO crear código aún (eso es para fase 5, Implementación)
- ❌ NO evaluar performance (eso es para fase 6, Verificación)

---

## Checklist de Completitud

- [ ] Propuesta escrita siguiendo template
- [ ] Todos los SOLID violations identificados
- [ ] Opciones evaluadas con tradeoffs
- [ ] Criterios de éxito definidos y medibles
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (especificador-cambios)
