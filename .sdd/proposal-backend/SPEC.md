# Specification — Soft Delete en Lecciones

**Change:** Resolver violación crítica de soft delete  
**Phase:** 1 — Resolución Crítica  
**Severity:** CRÍTICA  
**Assigned to:** Ignacio

---

## Requirement 1: Agregar campo estado al modelo Leccion

**Why:** Violación crítica del patrón de soft delete (CLAUDE.md línea 197). Actualmente usa `delete()` físico, perdiendo datos históricos.

**Scenarios:**

- **Scenario 1**: Educador elimina una lección
  - Acción: Click en botón "Eliminar lección"
  - Resultado: Lección se marca como ARCHIVADO, no se elimina
  - Datos: `estado = 'ARCHIVADO'`, `updatedAt = now()`

- **Scenario 2**: Estudiante accede a lecciones completadas
  - Acción: Solicita lista de lecciones del curso
  - Resultado: Lecciones archivadas no aparecen en lista pública
  - Queries: Filtran automáticamente `estado != 'ARCHIVADO'`

- **Scenario 3**: Histórico de progreso se preserva
  - Acción: Consultar `Progreso` de un estudiante
  - Resultado: Muestra lecciones archivadas en histórico
  - Datos: Las referencias en Progreso siguen válidas

**Acceptance Criteria:**

- [ ] Migración Prisma crea campo `estado` en tabla `lecciones`
- [ ] Default value: `'ACTIVO'`
- [ ] Enum values: `ACTIVO`, `archivado`
- [ ] Migración se ejecuta sin errores en dev
- [ ] Migration file generado y commiteable

---

## Requirement 2: Actualizar método eliminar() en lecciones.service.ts

**Why:** Cambiar delete físico a soft delete usando el nuevo campo estado.

**Scenarios:**

- **Scenario 1**: Eliminar lección exitosamente
  - Acción: `leccionesService.eliminar(leccionId, usuarioId)`
  - Verificación: Propietario del curso
  - Resultado: `await prisma.leccion.update({ where: { id }, data: { estado: 'ARCHIVADO' } })`
  - Side effect: Emitir evento `leccion.archivada`

- **Scenario 2**: Reordenar lecciones después de eliminar
  - Acción: Eliminar lección en posición 3 de 5
  - Resultado: Lecciones 4 y 5 se reordenan a 3 y 4
  - Logic: Mantener numeración secuencial (orden 1,2,3,4 — no 1,2,4,5)

**Acceptance Criteria:**

- [ ] Método eliminar() usa `update()` no `delete()`
- [ ] Campo estado se actualiza a `'ARCHIVADO'`
- [ ] Reordenamiento de otras lecciones funciona
- [ ] Evento `leccion.archivada` se emite
- [ ] Tests pasan 100%
- [ ] Cobertura se mantiene >80%

---

## Requirement 3: Actualizar queries que filtran lecciones

**Why:** Asegurar que queries automáticamente filtren lecciones archivadas.

**Scenarios:**

- **Scenario 1**: Listar lecciones de un curso
  - Query: `prisma.leccion.findMany({ where: { cursoId, estado: { not: 'ARCHIVADO' } } })`
  - Resultado: No incluye lecciones archivadas

- **Scenario 2**: Obtener una lección específica
  - Query: `prisma.leccion.findUnique({ where: { id } })`
  - Resultado: Retorna incluso si está archivada (para histórico)
  - Note: No filtrar aquí; el controller valida acceso

**Acceptance Criteria:**

- [ ] `listarPorCurso()` filtra `estado != 'ARCHIVADO'`
- [ ] `obtenerLeccion()` NO filtra (retorna todas)
- [ ] Tests verifican que archivadas no aparecen en listas
- [ ] Tests verifican que archivadas sí aparecen en histórico

---

## Requirement 4: Actualizar tests en lecciones.service.spec.ts

**Why:** Verificar que soft delete funciona correctamente.

**Scenarios:**

- **Scenario 1**: Test de eliminación
  - Action: `await leccionesService.eliminar(leccionId, usuarioId)`
  - Assert: `leccion.estado === 'ARCHIVADO'`
  - Assert: `leccion.deletedAt === null` (no existe, usamos estado)

- **Scenario 2**: Test que lecciones archivadas no aparecen
  - Setup: Crear 3 lecciones, archivar 1
  - Action: `await leccionesService.listarPorCurso(cursoId)`
  - Assert: length === 2 (no incluye archivada)

- **Scenario 3**: Test de evento emitido
  - Action: `await leccionesService.eliminar(leccionId)`
  - Assert: `eventBus.emit()` fue llamado con `'leccion.archivada'`

**Acceptance Criteria:**

- [ ] Tests para soft delete cubren happy path
- [ ] Tests verifican queries filtran archivadas
- [ ] Tests verifican reordenamiento
- [ ] Tests verifican evento emitido
- [ ] Cobertura de statements >90%
- [ ] Cobertura de branches >80%

---

## Requirement 5: Verificación final

**Why:** Asegurar que Fase 1 está 100% completa antes de pasar a Fase 2.

**Acceptance Criteria:**

- [ ] Migración generada: `prisma/migrations/YYYYMMDDHHMMSS_add_leccion_estado/`
- [ ] Todos los tests pasan: `npm test -- lecciones`
- [ ] Cobertura: statements >95%, branches >80%
- [ ] Propuesta actualizada con estado "Completado"
- [ ] Commit realizado con mensaje convencional
