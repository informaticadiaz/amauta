# Skill: especificador-cambios

**Responsable de**: Fase 2 - Especificación  
**Entrada**: `01-propuesta.md` (existe)  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`

---

## Propósito

Transformar la **PROPUESTA** (análisis arquitectónico) en una **ESPECIFICACIÓN** con requisitos claros y escenarios de prueba (Given/When/Then). Este documento define exactamente qué debe hacerse, sin cómo hacerlo.

---

## Invocación

```bash
/especificador-cambios {cambio-id}

# Ejemplo:
/especificador-cambios soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer propuesta: `docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md`
- Leer template: `docs/architecture/sdd/plantillas/02-especificacion-template.md`
- Leer `README.md` de SDD para entender trazabilidad

### Step 2: Extraer requisitos de la propuesta

De la propuesta, identificar:

- **Objetivo principal** → Requirement 1
- **Impacto por módulo** → Requirements 2-3
- **Violaciones SOLID a resolver** → Requirements 4-5
- **Criterios de éxito** → Additional requirements si aplica

Crear 5-7 requirements claros, cada uno testeable.

### Step 3: Escribir especificación siguiendo template

Estructura:

1. **Encabezado** — Referencia a 01-propuesta.md, fecha, estado
2. **Resumen** — Qué se va a cambiar, por qué (resumido)
3. **Requisitos** — 5+ requirements con formato:

   ```
   ### Requirement N: {Nombre}

   **Descripción**: {Qué debe hacer}

   **Escenarios**:
   - Given {estado inicial}
     When {acción}
     Then {resultado esperado}

   - Given {estado inicial 2}
     When {acción 2}
     Then {resultado 2}

   **Criterios de Aceptación**:
   - [ ] Caso 1
   - [ ] Caso 2
   - [ ] Caso 3
   ```

4. **Trazabilidad** — Matriz conectando cada Req a propuesta + decisión de diseño (que vendrá en fase 3)

### Step 4: Validar escenarios

Verificar que cada scenario:

- Tiene Given (estado pre-condición)
- Tiene When (acción del usuario/sistema)
- Tiene Then (resultado observable, testeable)

### Step 5: Persistir artefacto

Crear archivo:

```
docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md
```

### Step 6: Actualizar INDICE.md

Marcar fase 2 completada:

```markdown
## {cambio-id}

- **Estado**: ⏳ Especificación creada (Fase 2)
- **Artefactos**:
  - ✅ 01-propuesta.md
  - ✅ 02-especificacion.md (creado)
  - [ ] 03-diseño.md (próximo)
```

### Step 7: Retornar resumen

```markdown
## ✅ Especificación Creada

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md  
**Requirements**: N definidos  
**Escenarios**: M definidos

**Próximo paso**: Ejecutar `/diseñador-arquitectura` para crear 03-diseño.md
```

---

## Reglas

- ✅ Leer template ANTES de escribir
- ✅ Cada requirement DEBE tener ≥2 escenarios
- ✅ Cada escenario DEBE seguir Given/When/Then
- ✅ Requirements DEBEN ser verificables (no especulaciones)
- ✅ Incluir escenarios de error/edge cases
- ✅ Conectar trazabilidad: Req → Propuesta
- ❌ NO incluir cómo implementar (eso es diseño)
- ❌ NO escribir código
- ❌ NO hacer decisiones arquitectónicas (eso es fase 3)

---

## Checklist de Completitud

- [ ] Especificación escrita siguiendo template
- [ ] ≥5 requisitos claramente definidos
- [ ] Cada requisito tiene ≥2 escenarios Given/When/Then
- [ ] Escenarios de error/edge cases incluidos
- [ ] Criterios de aceptación medibles
- [ ] Trazabilidad a propuesta documentada
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (diseñador-arquitectura)
