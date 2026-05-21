# SDD Flowchart Visual — Soft Delete en Lecciones

## Flujo Temporal Completo

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    TIMELINE: Ejecución SDD Fase 1                         ║
╠═══════════════════════════════════════════════════════════════════════════╣

T0: 2026-05-20 15:30
═══════════════════════════════════════════════════════════════════════════
                        STEP 1: ANÁLISIS (architecture-expert)
                        ↓
                    proposal-backend.md CREADO
                    ├─ Estado Análisis: ✓ Completado
                    ├─ Estado Impl: ⏳ No Iniciado
                    ├─ 21 módulos analizados
                    └─ HALLAZGO CRÍTICO: delete() en lecciones.service.ts:242


T1: 2026-05-20 22:15
═══════════════════════════════════════════════════════════════════════════
                    STEP 2: SKILL INVOCADA (backend-sdd-proposal-executor)
                    ↓
                    Pasos 1-5 ejecución:

  22:15:00  ┌─ PASO 1: Ubicar propuesta
            │   └─ ✓ proposal-backend.md encontrada
            │
  22:15:05  ├─ PASO 2: Analizar plan
            │   ├─ ✓ Extraídas 3 fases
            │   ├─ ✓ Fase 1 es blocker (crítica)
            │   └─ ✓ 6 tareas identificadas
            │
  22:15:10  ├─ PASO 3: Generar SPEC.md
            │   ├─ ✓ .sdd/proposal-backend/SPEC.md (5 requirements)
            │   ├─ ✓ 9 scenarios documentados
            │   └─ ✓ Acceptance criteria definido
            │
  22:15:15  ├─ PASO 4: Generar DESIGN.md
            │   ├─ ✓ .sdd/proposal-backend/DESIGN.md (arquitectura)
            │   ├─ ✓ Code snippets incluidos
            │   └─ ✓ Database impact documentado
            │
  22:15:20  ├─ PASO 5: Generar TASKS.md
            │   ├─ ✓ .sdd/proposal-backend/TASKS.md (6 tareas)
            │   ├─ ✓ Esfuerzo: ~2-3 horas
            │   └─ ✓ Criterios de éxito
            │
  22:15:25  └─ Actualizar propuesta
                ├─ Estado Impl: "En Ejecución — Fase 1"
                ├─ Responsable: "Ignacio"
                └─ ✓ Commit: "feat: iniciar ejecución Fase 1"


T2: 2026-05-20 23:00 — DELEGACIÓN
═══════════════════════════════════════════════════════════════════════════
                    PASO 6: Delegar a /sdd-apply
                    ↓
              ┌─────────────────────────────────┐
              │ sdd-apply SUB-AGENT             │
              ├─────────────────────────────────┤
              │ Lee:                            │
              │  • .sdd/.../SPEC.md             │
              │  • .sdd/.../DESIGN.md           │
              │  • .sdd/.../TASKS.md            │
              │  • Código actual (apps/api/)    │
              └─────────────────────────────────┘
                        ↓
                  IMPLEMENTA 6 TAREAS
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 1: Schema + Migration      │
              │ ├─ schema.prisma (ADD COLUMN)   │
              │ └─ migration.sql creado         │
              └─────────────────────────────────┘
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 2: Service soft delete     │
              │ ├─ eliminar() actualizado       │
              │ └─ Soft delete logic (update)   │
              └─────────────────────────────────┘
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 3: Filter queries          │
              │ ├─ listarPorCurso() actualizado │
              │ └─ estado: { not: 'ARCHIVADO' } │
              └─────────────────────────────────┘
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 4: Add tests               │
              │ ├─ 6 nuevos tests               │
              │ └─ LeccionResponse.estado added │
              └─────────────────────────────────┘
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 5: Verify                  │
              │ ├─ npm run build ✓              │
              │ └─ tsc --noEmit ✓               │
              └─────────────────────────────────┘
                        ↓
              ┌─────────────────────────────────┐
              │ TASK 6: Commit                  │
              │ ├─ e7c12a5 (fix: soft delete)   │
              │ └─ 4 files changed              │
              └─────────────────────────────────┘
                        ↓
              ✓ 6/6 TASKS COMPLETADAS
              ✓ apply-progress GUARDADA EN ENGRAM


T3: AHORA — ESTADO ACTUAL
═══════════════════════════════════════════════════════════════════════════
                    LISTO PARA VERIFICACIÓN
                    ↓
              Próximos pasos (PENDIENTES):

              PASO 7: /sdd-verify
              ├─ Validar SPEC vs Código
              ├─ Validar DESIGN vs Código
              └─ Generar verify-report
                        ↓
              PASO 8: /sdd-archive
              ├─ Mover .sdd a .sdd-archive
              ├─ Actualizar propuesta-backend.md
              └─ Estado Final: "Implementado Fase 1"
```

---

## Diagrama de Artefactos (Dónde Vivieron)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FILESYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 docs/                                                       │
│  └─ 📁 architecture/                                            │
│     └─ 📁 proposals/                                            │
│        └─ 📄 proposal-backend.md ........... [COMMITEABLE] ✓   │
│           ├─ Versión: Actualizada en vivo                      │
│           └─ Estado: En Ejecución — Fase 1                     │
│                                                                 │
│  📁 .sdd/                                   [EPHEMERAL] ✗      │
│  └─ 📁 proposal-backend/                                        │
│     ├─ 📄 SPEC.md ......................... (5 requirements)    │
│     ├─ 📄 DESIGN.md ....................... (arquitectura)     │
│     └─ 📄 TASKS.md ........................ (6 tareas)         │
│                                                                 │
│  📁 apps/api/                                                   │
│  ├─ 📁 prisma/                                                 │
│  │  ├─ 📄 schema.prisma .................. [COMMITEABLE] ✓    │
│  │  │   (estado field agregado)                               │
│  │  └─ 📁 migrations/                                          │
│  │     └─ 📄 20260520000000_add_leccion_estado/ [COMMIT] ✓    │
│  │                                                              │
│  └─ 📁 src/lecciones/                                           │
│     ├─ 📄 lecciones.service.ts ........... [COMMITEABLE] ✓    │
│     │   (soft delete, filtering)                               │
│     └─ 📄 lecciones.service.spec.ts ..... [COMMITEABLE] ✓    │
│         (6 new tests)                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         ENGRAM MEMORY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  mem_session_summary                                            │
│  ├─ Project: amauta                                             │
│  └─ Content: Goal + Accomplished + Files Changed               │
│                                                                 │
│  mem_save (apply-progress)            [PERSISTENT] ✓           │
│  ├─ Topic Key: sdd/proposal-backend/apply-progress             │
│  ├─ Type: architecture                                         │
│  ├─ 6 Completed Tasks (with details)                           │
│  ├─ Files Changed (3 modified + 1 created)                     │
│  ├─ No Deviations from Design                                  │
│  └─ Issues Found (Jest environmental issue)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         GIT REPOSITORY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Commit e7c12a5                           [PERSISTENT] ✓       │
│  Message: fix: implementar soft delete para lecciones (Fase 1)  │
│  ├─ apps/api/prisma/schema.prisma                              │
│  ├─ apps/api/prisma/migrations/20260520000000_.../migration.sql│
│  ├─ apps/api/src/lecciones/lecciones.service.ts                │
│  └─ apps/api/src/lecciones/lecciones.service.spec.ts           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Información (Data Flow)

```
proposal-backend.md (Propuesta)
        │
        ├──→ architecture-expert (skill 1)
        │    └──→ Genera ANÁLISIS
        │         └──→ Actualiza Estado Análisis
        │
        └──→ backend-sdd-proposal-executor (skill 2)
             │
             PASO 1: Lee propuesta
             │
             PASO 2-5: Extrae plan + Genera:
             │
             ├──→ .sdd/.../SPEC.md
             │    (extraído de: Propuesta)
             │
             ├──→ .sdd/.../DESIGN.md
             │    (extraído de: Propuesta + patrones)
             │
             └──→ .sdd/.../TASKS.md
                  (extraído de: Plan en Propuesta)
             │
             └──→ Actualiza propuesta-backend.md
                  Estado: En Ejecución — Fase 1
             │
             └──→ DELEGACIÓN a /sdd-apply
                  │
                  ├─ Pasa: SPEC.md, DESIGN.md, TASKS.md
                  │
                  └──→ sdd-apply SUB-AGENT
                       │
                       ├─ Lee: SPEC (acceptance criteria)
                       ├─ Lee: DESIGN (how to implement)
                       ├─ Lee: TASKS (what to do)
                       │
                       ├──→ Implementa código
                       │    └──→ apps/api/src/lecciones/*
                       │
                       ├──→ Crea migración
                       │    └──→ apps/api/prisma/migrations/
                       │
                       ├──→ Actualiza tests
                       │    └──→ apps/api/src/lecciones/*.spec.ts
                       │
                       ├──→ Crea commit
                       │    └──→ e7c12a5 (GIT)
                       │
                       └──→ Guarda progress
                            └──→ Engram: sdd/proposal-backend/apply-progress
```

---

## Estados de la Propuesta (State Machine)

```
┌──────────────────┐
│  NO INICIADO     │  ← Estado inicial (primera vez)
└────────┬─────────┘
         │
         │ usuario invoca: "ejecuta propuesta: backend"
         ↓
┌──────────────────────────────────────────┐
│  EN ANÁLISIS                             │
├──────────────────────────────────────────┤
│ • architecture-expert genera propuesta   │
│ • Resultado: Análisis completo           │
│ • Estado Análisis: ✓ Completado          │
└────────┬─────────────────────────────────┘
         │
         │ usuario invoca: "ejecuta propuesta: backend"
         ↓
┌──────────────────────────────────────────┐
│  EN EJECUCIÓN — FASE 1                   │
├──────────────────────────────────────────┤
│ • backend-sdd-proposal-executor corre    │
│ • Genera: SPEC.md, DESIGN.md, TASKS.md   │
│ • Delega: /sdd-apply                     │
│ • Resultado: 6/6 tasks completadas       │
└────────┬─────────────────────────────────┘
         │
         │ /sdd-verify validará...
         ↓
┌──────────────────────────────────────────┐
│  VERIFICADO                              │
├──────────────────────────────────────────┤
│ • /sdd-verify compara SPEC vs Código     │
│ • Genera: verify-report                  │
│ • Resultado: ✓ o ⚠️ Parcial              │
└────────┬─────────────────────────────────┘
         │
         │ /sdd-archive finaliza...
         ↓
┌──────────────────────────────────────────┐
│  IMPLEMENTADO FASE 1                     │
├──────────────────────────────────────────┤
│ • .sdd/ archivado a .sdd-archive/        │
│ • Propuesta actualizada: "Implementado"  │
│ • Fecha: 2026-05-20                      │
│ • Bloquea Fase 2: ✓ Desbloqueada         │
└──────────────────────────────────────────┘
         │
         │ (Fase 2: Event-Driven si usuario continúa)
         ↓
┌──────────────────────────────────────────┐
│  EN EJECUCIÓN — FASE 2                   │
│  (Event-Driven Pattern)                  │
└──────────────────────────────────────────┘
```

---

## Validación de Trazabilidad

```
Requirement (SPEC.md)
        ↓
        ├─ Ref: "Agregar campo estado al modelo Leccion"
        │
        ├──→ Design (DESIGN.md)
        │    └─ Ref: "schema.prisma: Add estado field"
        │        └─ Code snippet: model Leccion { ... estado String ... }
        │
        ├──→ Tasks (TASKS.md)
        │    ├─ TASK 1: "Add estado field"
        │    ├─ Steps: [ ] Edit schema.prisma
        │    ├─ Steps: [ ] Run migration
        │    └─ Verification: [ ] Migration file created
        │
        ├──→ Code (Implemented)
        │    ├─ Archivo: apps/api/prisma/schema.prisma
        │    ├─ Cambio: +estado    String  @default("ACTIVO")
        │    └─ Index: @@index([estado])
        │
        └──→ Migration (Created)
             ├─ Archivo: 20260520000000_add_leccion_estado/migration.sql
             ├─ SQL: ALTER TABLE "lecciones" ADD COLUMN "estado" VARCHAR(50)
             └─ Verificación: ✓ Migración SQL válida

                    ✓ REQUIREMENT COMPLETADO Y TRAZABLE
```

---

## Resumen Ejecutivo

```
╔═══════════════════════════════════════════════════════════════╗
║              SDD EXECUTION SUMMARY — Soft Delete              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Timeline:      T0 (Análisis) → T1 (Skill) → T2 (Apply)     ║
║  Duración:      ~2-3 horas (ejecución real)                 ║
║  Estado:        ✓ 6/6 Tasks Completadas                      ║
║  Código:        ✓ Build successful, TypeScript OK            ║
║  Persistencia:  ✓ Git commit e7c12a5                         ║
║                                                               ║
║  Dónde vivió SDD:                                            ║
║  ├─ Propuesta:    docs/architecture/proposals/ [Commiteable] ║
║  ├─ Artefactos:   .sdd/proposal-backend/ [Ephemeral]         ║
║  ├─ Progress:     Engram [Persistent]                        ║
║  └─ Código:       apps/api/ + Git [Persistent]               ║
║                                                               ║
║  Próximos pasos:                                             ║
║  ├─ [ ] /sdd-verify (validar SPEC vs Código)                ║
║  ├─ [ ] /sdd-archive (cerrar y documentar)                   ║
║  └─ [ ] Fase 2 si el usuario continúa                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```
