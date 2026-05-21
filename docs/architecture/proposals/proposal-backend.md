# 🏗️ Propuesta Arquitectónica — Backend Completo

**Fecha Análisis:** 2026-05-20  
**Última Actualización:** 2026-05-20  
**Auditor:** Architecture Expert  
**Stack:** NestJS + Fastify + Prisma + PostgreSQL

---

## 📊 Estado de Análisis e Implementación

| Campo                           | Valor                |
| ------------------------------- | -------------------- |
| **Estado Análisis**             | Completado           |
| **Estado Implementación**       | Implementado Parcial |
| **Última Fecha Implementación** | 2026-05-20           |
| **Responsable Implementación**  | Pendiente            |
| **Urgencia**                    | Media                |

---

## 📊 Estado Actual

### Estructura Identificada

```
apps/api/src/
├── auth/                    (3 archivos)     — Autenticación JWT
├── common/                  (shared)         — Guards, decorators, filters
├── config/                  (shared)         — Configuración global
├── categorias/              (3 archivos)     — Categorías de cursos
├── cursos/                  (6 archivos)     — Gestión de cursos
├── lecciones/               (6 archivos)     — Gestión de lecciones
├── inscripciones/           (6 archivos)     — Inscripciones a cursos
├── progreso/                (6 archivos)     — Seguimiento de progreso
├── evaluaciones/            (5 archivos)     — Evaluaciones y quizzes
├── calificaciones/          (4 archivos)     — Calificaciones de estudiantes
├── asistencias/             (5 archivos)     — Asistencia escolar
├── grupos/                  (5 archivos)     — Grupos de estudiantes
├── instituciones/           (5 archivos)     — Instituciones educativas
├── foros/                   (5 archivos)     — Foros de discusión
├── comunicados/             (4 archivos)     — Comunicados institucionales
├── notificaciones/          (4 archivos)     — Sistema de notificaciones
├── boletin/                 (4 archivos)     — Boletines académicos
├── uploads/                 (*)              — Gestión de archivos
├── prisma/                  (shared)         — ORM y migraciones
└── seed/                    (shared)         — Base de datos seed
```

**Total: 21 módulos + 3 utilidades compartidas**

### Capas del Sistema

```
┌─────────────────────────────────────┐
│         HTTP Controllers            │  Input: REST endpoints
├─────────────────────────────────────┤
│       Business Logic (Services)     │  Core: Lógica de negocio
├─────────────────────────────────────┤
│    Data Access (Prisma ORM)         │  Output: PostgreSQL
├─────────────────────────────────────┤
│      Guards, Decorators, Filters    │  Cross-cutting: Auth, validation
└─────────────────────────────────────┘
```

### Módulos Principales

| Módulo         | Responsabilidad         | Estado | Archivos |
| -------------- | ----------------------- | ------ | -------- |
| auth           | JWT, roles, permisos    | ✅     | 3        |
| cursos         | CRUD de cursos          | ✅     | 6        |
| lecciones      | CRUD de lecciones       | ⚠️     | 6        |
| inscripciones  | Inscripción a cursos    | ✅     | 6        |
| progreso       | Tracking de estudiantes | ✅     | 6        |
| evaluaciones   | Quizzes y evaluaciones  | ✅     | 5        |
| calificaciones | Calificaciones finales  | ✅     | 4        |
| asistencias    | Asistencia escolar      | ✅     | 5        |
| instituciones  | Gestión de escuelas     | ✅     | 5        |
| foros          | Discusión y Q&A         | ✅     | 5        |
| notificaciones | Sistema de alertas      | ✅     | 4        |

---

## 🔍 Hallazgos Clave

### Violaciones SOLID

| Principio                     | Módulo      | Problema                                       | Severidad | Ubicación                |
| ----------------------------- | ----------- | ---------------------------------------------- | --------- | ------------------------ |
| **S** — Single Responsibility | lecciones   | Delete físico viola soft delete pattern        | CRÍTICA   | lecciones.service.ts:242 |
| **D** — Dependency Inversion  | Multiple    | Imports directos entre módulos sin abstracción | MEDIA     | Auditoría previa         |
| **O** — Open/Closed           | (a revisar) | Controllers pueden necesitar extensión         | BAJA      | —                        |

**Análisis:**

- ⚠️ **Lecciones**: Violación crítica de soft delete (requiere migración schema + código)
- ✅ **Auth**: Bien separado, guards reutilizables
- ✅ **Cursos, Progreso, Inscripciones**: Estructura limpia, patrón consistent

### Acoplamiento Entre Módulos

```
Estimado (sin análisis exhaustivo de imports):

auth            (aislado)
  ↑
  ├→ cursos
  ├→ inscripciones
  ├→ progreso
  ├→ lecciones
  └→ evaluaciones

progreso        (acoplado a lecciones, cursos)
  ├→ lecciones
  └→ cursos

lecciones       (acoplado a cursos, progreso)
  ├→ cursos
  └→ progreso

evaluaciones    (acoplado a progreso, cursos)
  └→ progreso, cursos

Ciclos Potenciales: lecciones ↔ progreso (ambos dependen uno del otro)
```

**Hallazgo:** Posible acoplamiento bidirecional entre `lecciones` y `progreso`. Requiere análisis detallado de imports.

### Separación de Capas

| Capa                  | Estado | Observaciones                              |
| --------------------- | ------ | ------------------------------------------ |
| **Controllers**       | ✅     | Sólo HTTP concerns, delegación a services  |
| **Services**          | ✅     | Lógica de negocio centralizada             |
| **DTOs**              | ✅     | Zod schemas validando entrada              |
| **Repositories**      | ✅     | Prisma ORM abstraiendo data access         |
| **Guards/Decorators** | ✅     | Auth y roles bien centralizados en common/ |

**Fortaleza:** Separación de capas está bien implementada en general.

### Patrones del Proyecto

| Patrón             | Estado | Notas                                                         |
| ------------------ | ------ | ------------------------------------------------------------- |
| safeParse (Zod)    | ✅     | Todos los DTOs usan safeParse                                 |
| Soft delete        | ⚠️     | **CRÍTICO**: lecciones usa delete físico                      |
| @Roles guards      | ✅     | Endpoints protegidos correctamente                            |
| Response structure | ✅     | Singular: `{ modelo, message }`, Plural: `{ modelos, total }` |
| Tests              | ✅     | Coverage >80% en módulos auditados                            |

---

## ✅ Lo Que Está Bien Implementado

1. **Estructura modular clara** — 21 módulos con responsabilidades bien definidas
2. **Validación robusta** — Todos los DTOs usan Zod safeParse
3. **Authorization correcta** — @Roles guards en endpoints protegidos
4. **Separación de capas excelente** — Controller → Service → Prisma
5. **Naming consistente** — Patrón `[modulo].controller.ts`, `[modulo].service.ts`, etc.
6. **Reutilización** — Guards, decorators y utilidades en `common/`
7. **Testing** — Tests existentes con buena cobertura
8. **Response structure** — Consistencia en formato de respuestas

---

## 🏗️ Propuesta Arquitectónica

### Visión

Arquitectura NestJS modular bien estructurada. Necesita:

1. **Resolver violación crítica de soft delete** en lecciones
2. **Analizar acoplamiento bidirecional** lecciones ↔ progreso
3. **Considerar event-driven patterns** para desacoplamiento entre módulos
4. **Documentar límites de módulos** para evitar imports cruzados indiscriminados

### Cambios Principales

#### 1️⃣ CRÍTICO — Soft Delete en Lecciones

**Problema:** `lecciones.service.ts:242` usa `prisma.leccion.delete()`

**Solución:**

```typescript
// Agregar campo estado al schema.prisma
model Leccion {
  // ...
  estado String @default("ACTIVO") // ACTIVO | ARCHIVADO
}

// Crear migración
$ npx prisma migrate dev --name add_leccion_estado

// Cambiar eliminar() en service
async eliminar(id: string) {
  await this.prisma.leccion.update({
    where: { id },
    data: { estado: 'ARCHIVADO' }
  });
  // Emitir evento para que progreso se actualice
  this.eventBus.emit('leccion.archivada', { id });
}
```

**Impacto:** Requiere migración DB (producción) + actualizar queries para filtrar archivadas

#### 2️⃣ MEDIA — Event-Driven para Desacoplamiento

**Problema:** Acoplamiento directo entre módulos

**Opción A — Event Bus (Recomendado para Amauta):**

```typescript
// common/events/event-bus.ts
interface DomainEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

// lecciones/lecciones.service.ts
async eliminar(id: string) {
  // ...
  this.eventBus.emit('leccion.eliminada', { leccionId: id });
}

// progreso/progreso.listener.ts
@OnEvent('leccion.eliminada')
async onLeccionEliminada(event: DomainEvent) {
  // Actualizar progresos asociados
}
```

**Opción B — Database Triggers (Alternativa):**

- Implementar triggers en PostgreSQL para cascadas automáticas
- Menos código, más DB-dependent

#### 3️⃣ BAJA — Module Boundaries

**Propuesta:**

```
Crear reglas explícitas:
- auth → puede ser importado por cualquiera
- common → utilidades compartidas (guards, decorators)
- cursos → puede importar auth, common
- lecciones → puede importar cursos, common, auth (PERO NO progreso directamente)
- progreso → puede importar lecciones, cursos, common, auth (via events)

Patrón: Módulos pueden importar hacia "arriba" (dependencias de dominio),
        pero no en lateral o "abajo" (comunicarse via eventos)
```

### Diagrama Propuesto

```
Antes (Acoplamiento):
  lecciones ←→ progreso  (ciclo)
  evaluaciones → progreso → lecciones (cadena)

Después (Event-Driven):
  lecciones ──emit event──→ EventBus
  progreso ──listen──→ EventBus
  evaluaciones ──listen──→ EventBus

  (Cada módulo es independiente, se comunica solo por eventos)
```

---

## 📋 Plan de Refactorización

### Fase 1: Resolución Crítica (Semana 1-2)

- [ ] Agregar campo `estado` a modelo Leccion en schema.prisma
- [ ] Crear migración Prisma
- [ ] Actualizar `lecciones.service.ts` para usar soft delete
- [ ] Actualizar tests en `lecciones.service.spec.ts`
- [ ] Verificar que queries filtren `estado != 'ARCHIVADO'`

**Responsable:** Equipo Backend  
**Prioridad:** CRÍTICA — Bloquea avance a Fase 7

### Fase 2: Event-Driven Pattern (Semana 3-4)

- [ ] Crear `common/events/event-bus.ts`
- [ ] Implementar listener en `progreso/` para eventos de lecciones
- [ ] Implementar listener en `evaluaciones/` para eventos
- [ ] Remover imports directos entre módulos (donde aplique)
- [ ] Tests para listeners

**Responsable:** Equipo Backend  
**Prioridad:** MEDIA — Mejora arquitectura, reduce acoplamiento

### Fase 3: Module Boundaries (Semana 5)

- [ ] Documentar reglas de imports en `ARCHITECTURE.md`
- [ ] Revisar imports actuales (buscar violaciones)
- [ ] Aplicar linting rules (eslint) para forzar límites
- [ ] Refactor de imports problemáticos

**Responsable:** Equipo Backend  
**Prioridad:** BAJA — Preventivo, no es bloqueante

---

## 🎯 Criterios de Éxito

- [ ] Todas las clases Service respetan Single Responsibility
- [ ] Módulos comunican solo via eventos (no imports directos)
- [ ] No hay ciclos de dependencia A ↔ B
- [ ] Controllers son esbeltos (máx 300 líneas)
- [ ] Services son testables e inyectables
- [ ] Tests pasan al 100%
- [ ] Cobertura se mantiene >80%
- [ ] Soft delete implementado en lecciones

---

## 📌 Notas Importantes

- **Patrones obligatorios**: Revisar `CLAUDE.md` antes de implementar (safeParse, soft delete)
- **Soft delete es mandatorio**: La refactorización DEBE mantener soft delete
- **Tests críticos**: Actualizar tests junto con refactorización
- **Documentación**: Actualizar `docs/ai-context/modules/` después de cambios
- **Producción**: Las migraciones se ejecutan automáticamente en deploy (healthcheck valida)

---

## Próximos Pasos

1. **Revisar** esta propuesta — ¿qué ajustes hacer?
2. **Aprobar** — si está OK, pasar a `/sdd-apply`
3. **Implementar** — ejecutar plan fase por fase
4. **Verificar** — usar `/sdd-verify` para validar cambios

---

**Generado por:** Architecture Expert  
**Tipo:** proposal-backend  
**Estado:** Listo para revisión y aprobación
