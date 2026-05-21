# Skill: desglosador-tareas

**Responsable de**: Fase 4 - Tareas  
**Entrada**: `02-especificacion.md` + `03-diseño.md` (existen)  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/04-tareas.md`

---

## Propósito

Transformar el **DISEÑO** en un **BREAKDOWN EJECUTABLE** de tareas granulares, ordenadas con dependencias claras. Cada tarea es un paso accionable que alguien puede ejecutar sin ambigüedad.

---

## Invocación

```bash
/desglosador-tareas {cambio-id}

# Ejemplo:
/desglosador-tareas soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer especificación: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`
- Leer diseño: `docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md`
- Leer template: `docs/architecture/sdd/plantillas/04-tareas-template.md`

### Step 2: Identificar tipos de tareas

Tipos estándar:

1. **Database Schema** — Cambios en schema.prisma y migrations
2. **Code Change** — Lógica de negocio, métodos, funciones
3. **Test Changes** — Tests unitarios, integración
4. **Verification** — Build, TypeScript, linting
5. **Git** — Commits, push

### Step 3: Desglosar diseño en tareas

Para cada decisión/archivo en el diseño, crear tareas:

1. **Task 1-2**: DB schema + migrations (típicamente bloquer para otras)
2. **Task 3-4**: Code changes (uno por archivo importante)
3. **Task 5**: Tests (después de cambios de código)
4. **Task 6-7**: Verification (build, TypeScript, tests)
5. **Task 8**: Git commit (último)

Estimaciones típicas:

- DB schema: 15-30 min
- Code change (simple): 30 min
- Code change (complejo): 1h
- Tests: 45 min
- Verification: 15 min
- Git: 5 min

Total esperado: 2-3 horas por cambio

### Step 4: Escribir tareas siguiendo template

Estructura por tarea:

```markdown
## 📝 TASK N: {Título Claro}

**Type**: {Database Schema | Code Change | Test Changes | Verification | Git}  
**Blocker**: {Sí/No — ¿Bloquea otras tasks?}  
**Esfuerzo**: {N minutos}  
**Dependencias**: {Ninguna / Task X, Task Y}
**Archivo**: {path/to/file.ext} (si aplica)

### Steps

- [ ] {Paso 1 accionable, no "implementar"}
- [ ] {Paso 2 verificable}
- [ ] {Paso 3}

### Verification

- [ ] {Cómo sé que está completado}
- [ ] {Otra validación}
```

Reglas para Steps:

- Ser accionable: "Agregar línea 42 en lecciones.service.ts" ✅
- Evitar ambigüedad: "Hacer cambio" ❌, "Cambiar delete() a update()" ✅
- Incluir referencia a archivo si es código
- Ser verificables: poder verificar que está hecho

### Step 5: Crear trazabilidad

Tabla conectando:

- Cada Task → Decisión de diseño que implementa
- Cada Task → Requirement de especificación que resuelve

```markdown
| Task | Decisión (03) | Requirement (02) |
| ---- | ------------- | ---------------- |
| 1    | Decisión 1    | Req 1            |
| 2    | Decisión 1    | Req 1            |
| 3    | Decisión 2    | Req 2-3          |
```

### Step 6: Validar orden de dependencias

- Las tasks bloqueantes van primero
- Las tasks sin dependencias pueden ir en paralelo
- Las verification tasks van al final

### Step 7: Calcular esfuerzo total

Suma de todos los esfuerzos individuales.

### Step 8: Persistir artefacto

```
docs/architecture/sdd/cambios/{cambio-id}/04-tareas.md
```

### Step 9: Actualizar INDICE.md

```markdown
## {cambio-id}

- **Estado**: ⏳ Tareas definidas (Fase 4)
- **Esfuerzo Estimado**: N horas
- **Artefactos**:
  - ✅ 01-propuesta.md
  - ✅ 02-especificacion.md
  - ✅ 03-diseño.md
  - ✅ 04-tareas.md (creado)
  - [ ] 05-implementacion.md (próximo)
```

### Step 10: Retornar resumen

```markdown
## ✅ Tareas Definidas

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/04-tareas.md  
**Total Tasks**: N  
**Esfuerzo Estimado**: X horas  
**Tareas Bloqueantes**: M

**Próximo paso**: Ejecutar `/implementador-tareas` para crear 05-implementacion.md
```

---

## Reglas

- ✅ Leer template ANTES de escribir
- ✅ Cada task tiene un tipo (DB, Code, Test, Verify, Git)
- ✅ Cada task tiene Steps claros y accionables
- ✅ Cada task tiene Verification (cómo validar)
- ✅ Incluir estimaciones realistas (basadas en complejidad)
- ✅ Marcar dependencias explícitamente
- ✅ Tareas de DB schema como bloqueantes (necesarias antes del código)
- ✅ Incluir trazabilidad Task → Decisión → Requirement
- ❌ NO omitir ninguna tarea (esto causa rework)
- ❌ NO asumir tasks obvias sin escribirlas
- ❌ NO estimar 0 minutos (las cosas toman tiempo)

---

## Checklist de Completitud

- [ ] Tareas escritas siguiendo template
- [ ] ≥6 tasks definidas (schema, code, tests, verify, git)
- [ ] Cada task tiene Steps y Verification
- [ ] Dependencias marcadas explícitamente
- [ ] Esfuerzo estimado por task
- [ ] Total de esfuerzo calculado (2-3h típico)
- [ ] Trazabilidad incluida (Task → Diseño → Spec)
- [ ] Orden de ejecución tiene sentido
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (implementador-tareas)
