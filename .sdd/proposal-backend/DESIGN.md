# Design — Soft Delete en Lecciones

**Phase:** 1 — Resolución Crítica  
**Pattern:** Soft Delete con campo estado

---

## Architecture

### Current State

```
prisma.leccion.delete({ where: { id } })  ← ❌ Delete físico (CRÍTICO)
↓
Datos perdidos, referencias rotas en Progreso
```

### Proposed State

```
prisma.leccion.update({
  where: { id },
  data: { estado: 'ARCHIVADO' }  ← ✅ Soft delete
})
↓
Datos preservados, histórico mantenido, referencias válidas
```

---

## Files to Modify

### 1. `apps/api/prisma/schema.prisma`

**Change:** Agregar campo `estado` al modelo Leccion

```prisma
model Leccion {
  id          String      @id @default(cuid())
  titulo      String
  descripcion String?
  orden       Int

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  tipo        TipoLeccion
  duracion    Int?
  contenido   Json
  recursos    Recurso[]

  publicada   Boolean     @default(false)

  // ✅ AGREGAR ESTO:
  estado      String      @default("ACTIVO")  // ACTIVO | ARCHIVADO

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  progresos   Progreso[]

  @@index([cursoId])
  @@index([orden])
  @@map("lecciones")
}
```

**Action:** Run migration

```bash
npx prisma migrate dev --name add_leccion_estado
```

### 2. `apps/api/src/lecciones/lecciones.service.ts`

**Location:** Method `eliminar()`  
**Current (Line ~242):**

```typescript
async eliminar(id: string, usuarioId: string): Promise<void> {
  const leccion = await this.verificarPropietarioLeccion(id, usuarioId);
  await this.prisma.leccion.delete({ where: { id } });  // ❌ DELETE FÍSICO
  // ...
}
```

**New:**

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
  this.eventBus?.emit('leccion.archivada', { leccionId: id });
}
```

**Change other methods:** Update `listarPorCurso()` to filter archived:

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

### 3. `apps/api/src/lecciones/lecciones.service.spec.ts`

**Add tests for soft delete:**

```typescript
describe('eliminar', () => {
  it('should soft delete leccion (set estado to ARCHIVADO)', async () => {
    const leccion = await leccionesService.crear(cursoId, createDto, usuarioId);

    await leccionesService.eliminar(leccion.id, usuarioId);

    const deleted = await prisma.leccion.findUnique({
      where: { id: leccion.id },
    });
    expect(deleted.estado).toBe('ARCHIVADO');
    expect(deleted).toBeDefined(); // ✅ Still exists
  });

  it('should exclude ARCHIVADO from listarPorCurso', async () => {
    // Create 3 lecciones
    const l1 = await leccionesService.crear(cursoId, createDto, usuarioId);
    const l2 = await leccionesService.crear(cursoId, createDto, usuarioId);
    const l3 = await leccionesService.crear(cursoId, createDto, usuarioId);

    // Archive one
    await leccionesService.eliminar(l2.id, usuarioId);

    // List should return 2
    const lecciones = await leccionesService.listarPorCurso(cursoId);
    expect(lecciones).toHaveLength(2);
    expect(lecciones.map((l) => l.id)).toEqual([l1.id, l3.id]);
  });

  it('should emit leccion.archivada event', async () => {
    const leccion = await leccionesService.crear(cursoId, createDto, usuarioId);
    const emitSpy = jest.spyOn(eventBus, 'emit');

    await leccionesService.eliminar(leccion.id, usuarioId);

    expect(emitSpy).toHaveBeenCalledWith('leccion.archivada', {
      leccionId: leccion.id,
    });
  });
});
```

---

## Patterns Applied

### Soft Delete Pattern

- ✅ Use `update()` with `estado: 'ARCHIVADO'` instead of `delete()`
- ✅ Filter queries with `estado: { not: 'ARCHIVADO' }`
- ✅ Preserve historical data in Progreso

### Validation Pattern

- ✅ Verify course ownership before deletion
- ✅ Check estado before filtering (explicit)

### Testing Pattern

- ✅ Unit tests for soft delete behavior
- ✅ Integration tests for query filtering
- ✅ Event emission tests

---

## Database Impact

### Schema Change

- Add `estado VARCHAR(50)` column to `lecciones` table
- Default value: `'ACTIVO'`
- No data loss: Existing rows get default value

### Migration

- Safe: No downtime on production
- Automatic: `npx prisma migrate deploy` on deploy
- Reversible: Rollback migration if needed

---

## Code Quality Gates

Before considering Phase 1 complete:

- [ ] No `delete()` calls in lecciones service
- [ ] All queries filter `estado`
- [ ] Statement coverage >95%
- [ ] Branch coverage >80%
- [ ] 0 TypeScript errors
- [ ] All tests pass
