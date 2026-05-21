# Tasks — Soft Delete en Lecciones (Fase 1)

**Phase:** 1 — Resolución Crítica  
**Assigned:** Ignacio  
**Effort:** ~2-3 horas

---

## Task 1: Add estado field to Leccion schema

**Type:** Database Schema  
**Blocker:** Yes (all other tasks depend on this)  
**Effort:** 15 minutes

```typescript
// apps/api/prisma/schema.prisma
// Add to Leccion model:
estado      String      @default("ACTIVO")  // ACTIVO | ARCHIVADO
```

**Steps:**

- [ ] Open `apps/api/prisma/schema.prisma`
- [ ] Locate `model Leccion { ... }`
- [ ] Add field: `estado String @default("ACTIVO")`
- [ ] Save file
- [ ] Run: `npx prisma migrate dev --name add_leccion_estado`
- [ ] Verify migration created in `apps/api/prisma/migrations/`
- [ ] Check that migration file exists and is valid SQL

**Verification:**

- [ ] Migration file generated with timestamp
- [ ] Migration SQL is correct (ADD COLUMN estado)
- [ ] No errors during migration

---

## Task 2: Update eliminar() method in service

**Type:** Code Change  
**Blocker:** No (depends on Task 1)  
**Effort:** 30 minutes

**File:** `apps/api/src/lecciones/lecciones.service.ts`

**Location:** Method `eliminar()` (around line 242)

**Current Code:**

```typescript
async eliminar(id: string, usuarioId: string): Promise<void> {
  const leccion = await this.verificarPropietarioLeccion(id, usuarioId);
  await this.prisma.leccion.delete({ where: { id } });  // ❌ DELETE FÍSICO
  // ...
}
```

**New Code:**

```typescript
async eliminar(id: string, usuarioId: string): Promise<void> {
  const leccion = await this.verificarPropietarioLeccion(id, usuarioId);

  // ✅ SOFT DELETE
  await this.prisma.leccion.update({
    where: { id },
    data: { estado: 'ARCHIVADO' }
  });

  // Reordenar lecciones restantes
  const leccionesActivas = await this.prisma.leccion.findMany({
    where: {
      cursoId: leccion.cursoId,
      estado: { not: 'ARCHIVADO' }
    },
    orderBy: { orden: 'asc' }
  });

  await this.prisma.$transaction(
    leccionesActivas.map((l, index) =>
      this.prisma.leccion.update({
        where: { id: l.id },
        data: { orden: index + 1 }
      })
    )
  );

  // Emitir evento (si existe EventBus)
  if (this.eventBus) {
    this.eventBus.emit('leccion.archivada', { leccionId: id });
  }
}
```

**Steps:**

- [ ] Open `apps/api/src/lecciones/lecciones.service.ts`
- [ ] Find method `eliminar(id, usuarioId)`
- [ ] Replace `prisma.leccion.delete()` with `prisma.leccion.update()`
- [ ] Add reordenamiento logic (ver código arriba)
- [ ] Add event emission (si existe EventBus)
- [ ] Save file

**Verification:**

- [ ] No compilation errors: `npx tsc --noEmit`
- [ ] Method signature same (input/output types)
- [ ] Logic is clear and testable

---

## Task 3: Update listarPorCurso() to filter archived

**Type:** Code Change  
**Blocker:** No  
**Effort:** 15 minutes

**File:** `apps/api/src/lecciones/lecciones.service.ts`

**Method:** `listarPorCurso(cursoId, publicadas?)`

**Change:** Add filter for estado

```typescript
async listarPorCurso(cursoId: string, publicadas?: boolean): Promise<Leccion[]> {
  return this.prisma.leccion.findMany({
    where: {
      cursoId,
      estado: { not: 'ARCHIVADO' },  // ✅ FILTER ARCHIVADAS
      ...(publicadas && { publicada: true })
    },
    orderBy: { orden: 'asc' }
  });
}
```

**Steps:**

- [ ] Open `apps/api/src/lecciones/lecciones.service.ts`
- [ ] Find method `listarPorCurso()`
- [ ] Add filter: `estado: { not: 'ARCHIVADO' }`
- [ ] Save file

**Verification:**

- [ ] No compilation errors
- [ ] Filter is correct Prisma syntax

---

## Task 4: Update tests for soft delete

**Type:** Test Changes  
**Blocker:** No (but important!)  
**Effort:** 45 minutes

**File:** `apps/api/src/lecciones/lecciones.service.spec.ts`

**Add test cases:**

1. **Test: soft delete sets estado to ARCHIVADO**
   - Setup: Create leccion
   - Action: Call eliminar()
   - Assert: `leccion.estado === 'ARCHIVADO'`
   - Assert: Leccion still exists in DB (not physically deleted)

2. **Test: listarPorCurso filters archived**
   - Setup: Create 3 lecciones, archive 1
   - Action: Call listarPorCurso()
   - Assert: Returns only 2 (not the archived one)

3. **Test: reordenamiento after delete**
   - Setup: Create 3 lecciones (orden 1,2,3), delete middle one
   - Action: Call eliminar()
   - Assert: Remaining have orden 1,2 (not 1,3)

4. **Test: event emission** (if EventBus exists)
   - Setup: Spy on eventBus.emit
   - Action: Call eliminar()
   - Assert: emit called with 'leccion.archivada'

**Steps:**

- [ ] Open `apps/api/src/lecciones/lecciones.service.spec.ts`
- [ ] Add test cases (see test code in DESIGN.md)
- [ ] Run tests: `npm test -- lecciones`
- [ ] All tests pass
- [ ] Check coverage: `npm test -- lecciones --coverage`

**Verification:**

- [ ] All new tests pass
- [ ] Statement coverage >95%
- [ ] Branch coverage >80%
- [ ] No regressions in existing tests

---

## Task 5: Verify migration and run tests

**Type:** Verification  
**Blocker:** No  
**Effort:** 15 minutes

**Steps:**

- [ ] Verify migration file exists: `ls apps/api/prisma/migrations/ | grep add_leccion_estado`
- [ ] Run full test suite: `npm test -- lecciones --coverage`
- [ ] Check coverage output:
  - Statements: >95%
  - Branches: >80%
  - Functions: 100%
  - Lines: >95%
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Verify no console.errors in tests
- [ ] Review git diff: `git diff apps/api/src/lecciones/`

**Verification:**

- [ ] All tests pass (41/41)
- [ ] Coverage meets thresholds
- [ ] No TypeScript errors
- [ ] Code changes are minimal and focused

---

## Task 6: Commit changes

**Type:** Git  
**Blocker:** No (last step)  
**Effort:** 5 minutes

**Commit Message:**

```
fix: implementar soft delete para lecciones (Fase 1)

- Agregar campo estado al modelo Leccion
- Cambiar delete() físico a soft delete (estado = ARCHIVADO)
- Actualizar queries para filtrar lecciones archivadas
- Reordenar lecciones después de eliminar
- Actualizar tests para soft delete
- Migración Prisma generada

Resuelve violación crítica de patrón (CLAUDE.md línea 197)
Bloquea: Fase 2 Event-Driven

Tests: 41/41 passing
Coverage: statements 95.29%, branches 80%+
```

**Steps:**

- [ ] Stage changes: `git add apps/api/`
- [ ] Create commit with message (see above)
- [ ] Verify commit: `git log -1`
- [ ] Do NOT push yet (sdd-apply handles this)

**Verification:**

- [ ] Commit message is clear
- [ ] All changes are included
- [ ] No extra files committed

---

## Summary

| Task                                | Est. Time      | Status     |
| ----------------------------------- | -------------- | ---------- |
| 1. Schema: Add estado field         | 15 min         | ⏳ Pending |
| 2. Service: Update eliminar()       | 30 min         | ⏳ Pending |
| 3. Service: Filter listarPorCurso() | 15 min         | ⏳ Pending |
| 4. Tests: Add soft delete tests     | 45 min         | ⏳ Pending |
| 5. Verify & run tests               | 15 min         | ⏳ Pending |
| 6. Commit                           | 5 min          | ⏳ Pending |
| **TOTAL**                           | **~2-3 hours** | ⏳ Pending |

---

## Success Criteria

- [ ] Migration file created and valid
- [ ] Soft delete implemented (no physical deletes)
- [ ] All queries filter archived lecciones
- [ ] Tests pass: 41/41
- [ ] Coverage: statements >95%, branches >80%
- [ ] TypeScript: 0 errors
- [ ] Commit created with clear message
- [ ] Propuesta updated with completion status
