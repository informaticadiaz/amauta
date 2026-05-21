# Análisis del Ciclo de Vida del SDD — Soft Delete en Lecciones

**Análisis ejecutado**: 2026-05-20  
**Change**: proposal-backend (Soft Delete en Lecciones — Fase 1)  
**Skill**: backend-sdd-proposal-executor

---

## 1. ARQUITECTURA DEL SDD EN AMAUTA

El SDD en Amauta utiliza un modelo **híbrido** de persistencia:

```
┌──────────────────────────────────────────────────────────────┐
│                    Ciclo de Vida del SDD                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  FASE 1: PROPUESTA                                            │
│  ├─ Ubicación: docs/architecture/proposals/proposal-*.md     │
│  ├─ Tipo: Documento único (sin fecha)                        │
│  ├─ Actualizado por: architecture-expert skill              │
│  └─ Contiene: Análisis + Plan refactorización                │
│                                                                │
│  FASE 2: SPECS / DESIGN / TASKS                              │
│  ├─ Ubicación: .sdd/{change-name}/SPEC.md                    │
│  │              .sdd/{change-name}/DESIGN.md                 │
│  │              .sdd/{change-name}/TASKS.md                  │
│  ├─ Generado por: backend-sdd-proposal-executor skill       │
│  ├─ Persistencia: FILESYSTEM SOLAMENTE (no commiteable)      │
│  └─ Contiene: Reqs, arquitectura, desglose de tareas         │
│                                                                │
│  FASE 3: APPLY (IMPLEMENTACIÓN)                              │
│  ├─ Ejecutor: sdd-apply sub-agent                            │
│  ├─ Persistencia: ENGRAM (topic: sdd/{change}/apply-progress)│
│  ├─ Cambios: Código modificado en apps/api/src/             │
│  └─ Artifacts: Commit + MIGRATION + TESTS                    │
│                                                                │
│  FASE 4: VERIFY (VALIDACIÓN)                                 │
│  ├─ Ejecutor: sdd-verify sub-agent (pendiente)              │
│  ├─ Compara: Código vs SPEC vs DESIGN                        │
│  └─ Genera: verify-report en ENGRAM                          │
│                                                                │
│  FASE 5: ARCHIVE (CIERRE)                                    │
│  ├─ Ejecutor: sdd-archive sub-agent (pendiente)             │
│  ├─ Acción: Mueve .sdd a .sdd-archive/{date}               │
│  └─ Documenta: Final state en propuesta-backend.md           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. VIAJE DE CADA ARTEFACTO EN ESTA EJECUCIÓN

### 2.1 PROPUESTA (proposal-backend.md)

**Ubicación**: `docs/architecture/proposals/proposal-backend.md`

**Timeline**:

```
2026-05-20 15:30:00 — Creada por architecture-expert skill
                       ├─ Estado Análisis: Completado
                       ├─ Estado Implementación: No Iniciado
                       └─ Responsable: (pendiente)

2026-05-20 22:15:00 — Actualizada por backend-sdd-proposal-executor
                       ├─ Estado Implementación: En Ejecución — Fase 1
                       ├─ Responsable Implementación: Ignacio
                       └─ Acción: Generar SPEC/DESIGN/TASKS
```

**Características**:

- ✓ Documento único (sin fecha YYYY-MM-DD)
- ✓ Actualiza estado sobre la marcha
- ✓ Mantiene histórico de análisis previos
- ✓ Referencia: `.sdd/proposal-backend/` para artefactos asociados

---

### 2.2 SPECIFICATIONS (SPEC.md)

**Ubicación**: `.sdd/proposal-backend/SPEC.md`

**Timeline**:

```
2026-05-20 22:15:10 — Generada por backend-sdd-proposal-executor
                       (PASO 3 del flujo de skill)
                       └─ Tipo: Requirements + Scenarios + Acceptance Criteria
```

**Contenido**:

- 5 Requirements (extratégico del Plan Refactorización)
- 9 Scenarios (casos de uso concretos)
- Acceptance criteria para cada requirement
- Trazabilidad: Cada req → DESIGN → TASKS

**Características**:

- ✓ Generada automáticamente del plan
- ✓ No commiteada (vive en filesystem local)
- ✓ Fuente de verdad para `/sdd-apply`
- ✓ Referenciada por TASKS.md

**¿Dónde vivió?**

- Filesystem: `.sdd/proposal-backend/SPEC.md`
- Persistencia: NO (archivo local, volátil)
- Leak: NINGUNO (internal artifact)

---

### 2.3 DESIGN (DESIGN.md)

**Ubicación**: `.sdd/proposal-backend/DESIGN.md`

**Timeline**:

```
2026-05-20 22:15:15 — Generada por backend-sdd-proposal-executor
                       (PASO 4 del flujo de skill)
                       └─ Tipo: Arquitectura + Código + Patrones
```

**Contenido**:

- Current state vs Proposed state (ASCII diagrams)
- Files to modify (3 archivos: schema.prisma + 2 service files)
- Código exacto esperado (snippets de referencia)
- Patrones aplicados (Soft Delete Pattern)
- Database impact (schema change, migration, reversibility)

**Características**:

- ✓ Convierte plan abstracto → decisiones arquitectónicas
- ✓ Incluye código concreto (no solo descripción)
- ✓ Define constraints y patrones
- ✓ Usada por `sdd-apply` para guiar implementación

**¿Dónde vivió?**

- Filesystem: `.sdd/proposal-backend/DESIGN.md`
- Persistencia: NO (local)
- Leak: NINGUNO (internal)

---

### 2.4 TASKS (TASKS.md)

**Ubicación**: `.sdd/proposal-backend/TASKS.md`

**Timeline**:

```
2026-05-20 22:15:20 — Generada por backend-sdd-proposal-executor
                       (PASO 5 del flujo de skill)
                       └─ Tipo: Desglose ejecutable con checklist
```

**Contenido**:

- 6 tareas concretas con pasos accionables
- Dependencias: Task 1 es blocker para otros
- Effort estimado: ~2-3 horas total
- Criterios de éxito específicos
- Tabla de estado (inicial: todos pending)

**Estructura de cada task**:

```
## Task N: [Título]
- Type: (Database Schema | Code Change | Test Changes | Verification | Git)
- Blocker: (Yes/No)
- Effort: (tiempo estimado)
- Steps: [ ] lista accionable
- Verification: [ ] cómo validar
```

**¿Dónde vivió?**

- Filesystem: `.sdd/proposal-backend/TASKS.md`
- Lectura por: sdd-apply sub-agent
- Actualización: [x] marks conforme se completaban (en memoria de apply)
- Persistencia final: Engram (en apply-progress)

---

## 3. FLUJO DE EJECUCIÓN PASO A PASO

### ANTES: Estado inicial

```
docs/architecture/proposals/
  └─ proposal-backend.md (Estado: Analizado, no implementado)

.sdd/
  └─ (no existe aún)
```

---

### PASO 1-5: Skill backend-sdd-proposal-executor ejecuta

```
PASO 1: Ubicar y validar propuesta
├─ Lee: docs/architecture/proposals/proposal-backend.md
└─ Valida: Secciones requeridas, Plan Refactorización

PASO 2: Analizar plan
├─ Extrae: Fases, bloqueantes, severidad
└─ Detecta: Crítica, Media, Baja

PASO 3: Crear SPEC.md
├─ Convierte: Plan → Requirements + Scenarios
├─ Destino: .sdd/proposal-backend/SPEC.md
└─ Documenta: Acceptance Criteria

PASO 4: Crear DESIGN.md
├─ Define: Current state, Proposed state, Architecture decisions
├─ Destino: .sdd/proposal-backend/DESIGN.md
└─ Incluye: Code snippets, patterns, database impact

PASO 5: Generar TASKS.md
├─ Desglose: Plan → 6 tareas granulares
├─ Destino: .sdd/proposal-backend/TASKS.md
├─ Criterios: Effort, blockers, verification steps
└─ Estado inicial: Todos [ ] (pending)

(Skill actualiza propuesta-backend.md con estado)
├─ Estado Implementación: En Ejecución — Fase 1
├─ Responsable: Ignacio
└─ Commit inicial: "feat: iniciar ejecución Fase 1"
```

### DESPUÉS de PASO 1-5: Artefactos generados

```
docs/architecture/proposals/
  └─ proposal-backend.md (Actualizada: En Ejecución)

.sdd/
  └─ proposal-backend/
      ├─ SPEC.md (5 requirements)
      ├─ DESIGN.md (arquitectura + código)
      └─ TASKS.md (6 tareas, estados pending)
```

---

### PASO 6: Delegar a /sdd-apply

```
Orquestador invoca: sdd-apply "proposal-backend"
↓
sdd-apply sub-agent:
├─ LECTURA:
│  ├─ Lee: .sdd/proposal-backend/SPEC.md
│  ├─ Lee: .sdd/proposal-backend/DESIGN.md
│  ├─ Lee: .sdd/proposal-backend/TASKS.md
│  └─ Lee: Código actual (apps/api/src/lecciones/*)
│
├─ IMPLEMENTACIÓN (6 tareas):
│  ├─ Task 1: schema.prisma + migration (FILESYSTEM)
│  ├─ Task 2: lecciones.service.ts (FILESYSTEM)
│  ├─ Task 3: listarPorCurso() filter (FILESYSTEM)
│  ├─ Task 4: Tests + interfaz (FILESYSTEM)
│  ├─ Task 5: Verificación (BUILD: ✓)
│  └─ Task 6: Commit (GIT: e7c12a5)
│
├─ PERSISTENCIA:
│  ├─ Progress: ENGRAM (topic: sdd/proposal-backend/apply-progress)
│  ├─ Código: FILESYSTEM + GIT (commit)
│  └─ Migración: FILESYSTEM (.sdd/proposal-backend/ + apps/api/prisma/)
│
└─ RETORNO:
   └─ apply-progress guardado en Engram
```

---

## 4. MAPA DE PERSISTENCIA

### Filesystem (Local)

```
docs/architecture/proposals/
  └─ proposal-backend.md ................... [COMMITEABLE] ✓

.sdd/proposal-backend/            ......... [EPHEMERAL] ✗
  ├─ SPEC.md
  ├─ DESIGN.md
  └─ TASKS.md

apps/api/
  ├─ prisma/
  │  ├─ schema.prisma ..................... [COMMITEABLE] ✓
  │  └─ migrations/
  │      └─ 20260520000000_add_leccion_estado/ [COMMITEABLE] ✓
  │
  └─ src/lecciones/
      ├─ lecciones.service.ts ............. [COMMITEABLE] ✓
      └─ lecciones.service.spec.ts ........ [COMMITEABLE] ✓

.git/
  └─ commit e7c12a5 (fix: soft delete) ... [PERSISTENT] ✓
```

### Engram (Persistent Memory)

```
mem_session_summary
├─ Project: amauta
├─ Topic: (session summary)
└─ Content: Goal + Instructions + Discoveries + Accomplished

mem_save (apply-progress)
├─ Project: amauta
├─ Topic Key: sdd/proposal-backend/apply-progress
├─ Type: architecture
└─ Content: 6 completed tasks + Files Changed + Deviations + Next Steps
```

---

## 5. DOCUMENTACIÓN GENERADA EN VIVO

### Por la Skill (backend-sdd-proposal-executor):

```
Generados:
✓ .sdd/proposal-backend/SPEC.md (requirements)
✓ .sdd/proposal-backend/DESIGN.md (architecture)
✓ .sdd/proposal-backend/TASKS.md (breakdown)
✓ Actualización: proposal-backend.md (Estado Impl: En Ejecución)
✓ Commit inicial: "feat: iniciar ejecución Fase 1"
```

### Por el Sub-agent (sdd-apply):

```
Generados:
✓ Implementación de 6 tareas (código modificado)
✓ Migración: 20260520000000_add_leccion_estado/migration.sql
✓ Tests actualizados con casos de soft delete
✓ Commit final: e7c12a5 (fix: soft delete lecciones)
✓ apply-progress guardado en Engram
```

### Por esta Sesión (Análisis):

```
Generado:
✓ Este documento: docs/ai-context/sdd-lifecycle-analysis.md
✓ Visibilidad del ciclo de vida completo
```

---

## 6. TRANSICIONES DE ESTADO

```
PROPUESTA
  │
  ├─ Estado Análisis: Completado ✓
  ├─ Estado Impl: No Iniciado
  │
  └─→ SKILL INVOCADA
       │
       ├─ PASO 1-5: Generar SPEC/DESIGN/TASKS
       │   └─ Actualiza propuesta: "En Ejecución — Fase 1"
       │
       └─→ SKILL DELEGA A /sdd-apply
            │
            ├─ Task 1-6: Implementación
            │   └─ Save en Engram: apply-progress
            │
            ├─ Code changes: FILESYSTEM + GIT
            │
            └─→ LISTO PARA /sdd-verify
                 │
                 ├─ verify validará: SPEC vs Código vs DESIGN
                 │
                 └─→ LISTO PARA /sdd-archive
                      │
                      └─ Archive actualizará propuesta final
                         Estado: "Implementado Fase 1"
```

---

## 7. INSIGHTS DEL CICLO DE VIDA

### ✓ Qué funcionó bien

1. **Modelo de persistencia híbrido**
   - Filesystem para artefactos de trabajo (.sdd/)
   - Engram para progress de sub-agents (apply-progress)
   - Git para cambios persistentes (commits)
   - Propuesta única actualizada sobre la marcha

2. **Flujo de skill bien definido**
   - Pasos secuenciales: Propuesta → SPEC → DESIGN → TASKS → Delegación
   - Encapsulación clara: la skill genera artefactos, delega implementación

3. **Trazabilidad**
   - Cada SPEC requirement → DESIGN decision → TASK concreto
   - apply-progress documenta qué se completó
   - Commit message referencia el cambio

4. **No hay datos huérfanos**
   - .sdd artifacts son ephemeral (se borran/regeneran)
   - apply-progress vive en Engram (permanente)
   - Código vive en Git (permanente)
   - Propuesta es documento único que evoluciona

### ⚠️ Puntos de mejora potencial

1. **.sdd/ no está en Git**
   - Pro: No polucionan el repo
   - Con: No hay histórico de cómo evolucionó el diseño
   - Alternativa: Versionar .sdd en Git si es necesario

2. **apply-progress es denso**
   - Es un documento grande en Engram
   - Podría fragmentarse en tasks individuales con sus propios progresses

3. **Propuesta única sin versionado**
   - No hay histórico de cómo cambió "En Análisis" → "En Ejecución" → "Implementado"
   - Podría mantenerse un "changelog" en propuesta-backend.md

---

## 8. COMPARATIVA: SPEC-DRIVEN vs TRADICIONAL

| Aspecto        | Tradicional        | Spec-Driven (Amauta)                  |
| -------------- | ------------------ | ------------------------------------- |
| Plan           | Documento vago     | SPEC.md (requirements claros)         |
| Arquitectura   | Mental del dev     | DESIGN.md (decisiones explícitas)     |
| Tareas         | Issue en GitHub    | TASKS.md (desglose granular)          |
| Implementación | "Voy a código"     | Sigo DESIGN, mapeo a TASKS            |
| Testing        | Al final           | Spec define acceptance criteria       |
| Validación     | Code review        | /sdd-verify valida vs SPEC            |
| Documentación  | Después (opcional) | Generada al inicio                    |
| Trazabilidad   | Git log solamente  | SPEC → DESIGN → TASKS → Code → Commit |

---

## 9. CONCLUSIONES

### ¿Dónde vivió el SDD?

1. **Propuesta**: `docs/architecture/proposals/` (documento único, actualizado)
2. **Artefactos de trabajo**: `.sdd/{change}/` (SPEC/DESIGN/TASKS, ephemeral)
3. **Progress**: Engram (apply-progress, persistent)
4. **Implementación**: Apps code + Git commits (persistent)

### ¿Cómo fue documentado?

- **Automático**: Skill generó SPEC/DESIGN/TASKS sin intervención manual
- **Progresivo**: apply-progress se guardó en Engram mientras se ejecutaba
- **Trazable**: Cada paso referencia el anterior (SPEC ← Propuesta, TASKS ← SPEC+DESIGN)
- **Persistente**: Propuesta evoluciona, code en Git, progress en Engram

### ¿Es escalable?

**Sí**, aunque con consideraciones:

- Múltiples Fases en paralelo: cada una tendría su `.sdd/{change}/` y apply-progress
- Múltiples cambios: cada propuesta es documento único con su SDD
- El modelo funciona porque:
  - Propuestas son documentos identificables y únicos
  - Artefactos SDD son ephemeral (se pueden regenerar)
  - Progress es persistente (nunca se pierde)
  - Código es versionado (trazable)
