# Skill: Backend SDD Proposal Executor

> Ejecuta propuestas arquitectónicas del backend automáticamente usando Spec-Driven Development (SDD).
> Lee un archivo de propuesta (ej: proposal-backend-[fecha].md), lo convierte a specs y tareas,
> y delega a `/sdd-apply` para implementación. Valida cambios con `/sdd-verify` al terminar.
>
> **Alcance**: Implementación de propuestas de arquitectura, refactorizaciones planificadas,
> resolución de deuda técnica, desacoplamiento de módulos.
>
> **Referencia**: `CLAUDE.md`, `docs/architecture/proposals/`, `docs/ai-context/_patterns.md`.

---

## Uso

### Modo Automático (Recomendado)

```
Ejecuta propuesta: [nombre del archivo o ruta]
```

**Ejemplos:**

```
Ejecuta propuesta: proposal-backend-2026-05-20.md
Ejecuta propuesta: proposal-acoplamiento-2026-05-20.md
Implementa propuesta de SOLID principles
Resuelve propuesta del módulo lecciones
```

### Modo Interactivo (Si hay dudas)

```
Ejecuta propuesta [con revisión]
```

La skill pregunta:

- ¿Qué fases implementar? (todas, solo críticas, solo Fase 1, etc.)
- ¿Qué responsable asignar? (usuario actual, otro, pendiente)
- ¿Crear rama de feature? (sí/no)

---

## Parámetros

| Parámetro  | Descripción                      | Ejemplo                          |
| ---------- | -------------------------------- | -------------------------------- |
| `proposal` | Archivo o nombre de propuesta    | `proposal-backend-2026-05-20.md` |
| `phases`   | Qué fases ejecutar (opcional)    | `1,2` o `solo-critica` o `todas` |
| `branch`   | Crear rama de feature (opcional) | `true` / `false`                 |

---

## Proceso de Ejecución (6 Pasos)

### PASO 1 — Ubicar y Validar Propuesta

1. Buscar archivo en `docs/architecture/proposals/`
2. Verificar que existe y es un Markdown válido
3. Extraer:
   - Título y tipo de análisis
   - Estado de análisis e implementación
   - Plan de refactorización (fases)
   - Criterios de éxito

### PASO 2 — Analizar Plan de Refactorización

Extraer de la propuesta:

- **Fases**: Desglose de tareas ordenadas
- **Dependencias**: Qué debe ir primero
- **Severidad**: Crítica, Media, Baja
- **Bloqueantes**: Qué es bloqueante para el proyecto

Ejemplo:

```markdown
### Fase 1: Resolución Crítica

- [ ] Agregar campo estado a Leccion
- [ ] Crear migración Prisma
- [ ] Actualizar service
- [ ] Actualizar tests

### Fase 2: Event-Driven

- [ ] Crear EventBus
- [ ] Implementar listener
```

### PASO 3 — Crear Especificación SDD

Convertir propuesta a `SPEC.md` con:

- **Requirements**: Qué cambiar y por qué
- **Scenarios**: Casos de uso y flujos
- **Acceptance Criteria**: Qué significa "hecho"

```markdown
## Requirement: Soft Delete en Lecciones

**Why**: Violación crítica de patrón (CLAUDE.md línea 197)

**Scenarios**:

- Educador elimina lección → estado = ARCHIVADO
- Progreso sigue viendo lección archivada (histórico)
- Queries filtran `estado != ARCHIVADO` automáticamente

**Acceptance Criteria**:

- [ ] Migración de schema crea campo estado
- [ ] Método eliminar() usa update no delete
- [ ] Tests pasan 100%
- [ ] Cobertura se mantiene >80%
```

### PASO 4 — Crear Diseño de Implementación

Crear `DESIGN.md` con:

- **Architecture**: Cómo implementar (code structure)
- **Files**: Qué archivos cambiar
- **Patterns**: Qué patrones aplicar

```markdown
## Architecture: Soft Delete Pattern

**Files to modify**:

- `apps/api/prisma/schema.prisma` — Add estado field
- `apps/api/src/lecciones/lecciones.service.ts` — Change eliminar()
- `apps/api/src/lecciones/lecciones.service.spec.ts` — Update tests

**Pattern**: Soft Delete

- Set estado = 'ARCHIVADO' instead of delete
- Filter queries: where: { estado: { not: 'ARCHIVADO' } }
```

### PASO 5 — Generar Task Breakdown

Crear `TASKS.md` con checklist ejecutable:

```markdown
## Task 1: Add estado field to Leccion

**Type**: Database Schema  
**Blocker**: No (prepares Fase 1)  
**Effort**: 15 min

- [ ] Edit schema.prisma
- [ ] Run: npx prisma migrate dev --name add_leccion_estado
- [ ] Verify migration generated
```

### PASO 6 — Ejecutar Implementación

Delegar a `/sdd-apply` con:

- Spec, Design, Tasks
- Propuesta original como contexto
- Instrucciones de qué hacer si hay conflictos

---

## Encabezado de Seguimiento (Actualizar)

Cuando la ejecución comience, actualizar la propuesta con:

```markdown
## 📊 Estado de Análisis e Implementación

| Campo                           | Valor        |
| ------------------------------- | ------------ | -------------- |
| **Estado Análisis**             | Completado   |
| **Estado Implementación**       | En Ejecución | ← Cambiar aquí |
| **Última Fecha Implementación** | 2026-05-20   |
| **Responsable Implementación**  | [Nombre]     | ← Asignar      |
| **Urgencia**                    | Media        |
```

Cuando termine:

```markdown
| **Estado Implementación** | Implementado | ← Completado
| **Última Fecha Implementación** | 2026-05-21 | ← Actualizar
```

---

## Flujo Completo

```
1. Usuario invoca: "Ejecuta propuesta: proposal-backend-2026-05-20.md"
                          ↓
2. Skill valida y extrae propuesta
                          ↓
3. Skill crea SPEC.md (requirements + scenarios)
                          ↓
4. Skill crea DESIGN.md (architecture + files)
                          ↓
5. Skill crea TASKS.md (breakdown ejecutable)
                          ↓
6. Skill delega a /sdd-apply
   - Proporciona spec, design, tasks
   - Archivo propuesta original como contexto
   - Instrucciones de qué esperar
                          ↓
7. /sdd-apply ejecuta tareas
                          ↓
8. Skill ejecuta /sdd-verify
   - Valida: tests pasan
   - Valida: cobertura >80%
   - Valida: criterios de éxito cumplidos
                          ↓
9. Actualizar propuesta con estado final
   - Estado implementación: Implementado
   - Fecha última: hoy
   - Resultados de verify
                          ↓
10. Commit y push automático
    Mensaje: "feat: resolver propuesta [tipo] - [fecha]"
```

---

## Modo Interactivo

Si usuario invoca SIN propuesta específica:

```
Ejecuta propuesta [con revisión]
```

La skill pregunta:

```
¿Qué propuesta ejecutar?

Archivos disponibles en docs/architecture/proposals/:
1. proposal-backend-2026-05-20.md (Estado Impl: No Iniciado)
2. proposal-solid-2026-05-18.md (Estado Impl: Implementado Parcial)
3. proposal-acoplamiento-2026-05-15.md (Estado Impl: No Iniciado)

Selecciona (1-3) o ingresa ruta completa:
```

Luego pregunta:

```
¿Qué fases implementar?
- Todas (1, 2, 3, ...)
- Solo críticas (CRÍTICA / MEDIA)
- Solo Fase 1
- Manual: 1,2

Selecciona:
```

Y finalmente:

```
¿Asignar a quién?
- Tu usuario (actual)
- Otro: [nombre]
- Pendiente (sin asignar)

Selecciona:
```

---

## Notas para IA

### Responsabilidades Principales

- **Validar** que propuesta existe y es Markdown válido
- **Extraer** plan, fases, criterios de éxito
- **Convertir** propuesta → SPEC.md + DESIGN.md + TASKS.md
- **Delegar** a /sdd-apply (NO ejecutar directamente)
- **Verificar** resultado con /sdd-verify
- **Actualizar** propuesta original con estado final
- **Hacer commit** automático si todo OK

### Validaciones Obligatorias

- ✅ Propuesta tiene secciones: Estado Análisis, Plan Refactorización, Criterios Éxito
- ✅ Plan tiene al menos 1 fase
- ✅ Cada fase tiene al menos 1 tarea
- ✅ Estado Implementación actual ≠ "Implementado" (evitar re-ejecutar)
- ✅ ALWAYS check `CLAUDE.md` patterns antes de implementar

### Patrones que NO se negocian

- ❌ NUNCA usar `parse()` directo, SIEMPRE `safeParse()` Zod
- ❌ NUNCA delete físico, SIEMPRE soft delete (estado = ARCHIVADO)
- ❌ NUNCA commit sin message siguiendo conventional commits
- ❌ NUNCA push sin verificar tests pasan

### Si Hay Errores

- **Tests fallan**: Reportar a usuario, NO commitear
- **Cobertura cae**: Reportar, pedir tareas de testing
- **Criterios incumplidos**: Reportar, marcar como "Implementado Parcial"

---

## Salida Esperada

### Archivos Generados (Internos, no en repo)

```
docs/architecture/proposals/
  ├── proposal-[tipo]-[fecha].md           (original, actualizado)
  └── .sdd/
      ├── SPEC-[tipo]-[fecha].md          (requirements)
      ├── DESIGN-[tipo]-[fecha].md        (architecture)
      └── TASKS-[tipo]-[fecha].md         (breakdown)
```

### Cambios en Repositorio

```
- Código modificado según plan
- Tests nuevos o actualizados
- Migración Prisma (si aplica DB)
- Commit: "feat: resolver propuesta [tipo] - [fecha]"
```

### Estados Finales Posibles

```
✅ Implementado
   - Todos los tests pasan
   - Cobertura >80%
   - Criterios éxito cumplidos
   - Proposición actualizada

⚠️ Implementado Parcial
   - Fase 1 completada, Fase 2 en progress
   - O: criterios parcialmente cumplidos
   - Propuesta actualizada con detalle

❌ Fallo
   - Tests fallan o cobertura cae
   - Propuesta NO se actualiza
   - Usuario debe revisar errores
```

---

## Recursos

- **Spec-Driven Development**: `/sdd-new`, `/sdd-spec`, `/sdd-design`, `/sdd-tasks`, `/sdd-apply`, `/sdd-verify`
- **Propuestas**: `docs/architecture/proposals/`
- **Patrones**: `CLAUDE.md`, `docs/ai-context/_patterns.md`
- **Testing**: `docs/technical/testing.md`
